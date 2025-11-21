import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * POST /api/respostas-audio
 * Salva resposta de áudio e opcionalmente transcreve
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      candidato_id,
      pergunta_id,
      arquivo_url,
      duracao_segundos,
      transcrever = false
    } = body

    if (!candidato_id || !pergunta_id || !arquivo_url) {
      return NextResponse.json(
        { error: 'candidato_id, pergunta_id e arquivo_url são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se já existe resposta
    const { data: respostaExistente } = await supabase
      .from('respostas_audio')
      .select('id')
      .eq('candidato_id', candidato_id)
      .eq('pergunta_id', pergunta_id)
      .single()

    if (respostaExistente) {
      return NextResponse.json(
        { error: 'Resposta já existe para esta pergunta' },
        { status: 409 }
      )
    }

    // Salvar resposta
    const { data: resposta, error } = await supabase
      .from('respostas_audio')
      .insert({
        candidato_id,
        pergunta_id,
        arquivo_url,
        duracao_segundos,
      })
      .select()
      .single()

    if (error) throw error

    // Transcrição assíncrona (opcional)
    if (transcrever) {
      // Chamar API de transcrição em background (não espera)
      fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/transcricao`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audio_url: arquivo_url,
          resposta_id: resposta.id,
        }),
      }).catch(err => console.error('Erro ao iniciar transcrição:', err))
    }

    return NextResponse.json({
      resposta,
      message: transcrever ? 'Resposta salva. Transcrição em andamento.' : 'Resposta salva com sucesso'
    }, { status: 201 })
  } catch (error: any) {
    console.error('Erro ao salvar resposta:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

/**
 * GET /api/respostas-audio?candidato_id=xxx
 * Lista respostas de um candidato
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const candidatoId = searchParams.get('candidato_id')

    if (!candidatoId) {
      return NextResponse.json(
        { error: 'candidato_id é obrigatório' },
        { status: 400 }
      )
    }

    const { data: respostas, error } = await supabase
      .from('respostas_audio')
      .select('*, perguntas_empresa(*)')
      .eq('candidato_id', candidatoId)
      .order('created_at', { ascending: true })

    if (error) throw error

    return NextResponse.json({ respostas })
  } catch (error: any) {
    console.error('Erro ao buscar respostas:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
