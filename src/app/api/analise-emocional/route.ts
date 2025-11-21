/**
 * API Route: Análise Emocional
 * POST: Analisa transcrição e salva resultado no banco
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { createClient } from '@supabase/supabase-js'
import { analisarEmocao, AnaliseEmocional } from '@/lib/analise-emocional'

// Cliente Supabase com service role para operações privilegiadas
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

/**
 * POST /api/analise-emocional
 *
 * Body: {
 *   transcricao: string
 *   resposta_audio_id: string
 * }
 *
 * Retorna: {
 *   success: boolean
 *   analise: AnaliseEmocional
 * }
 */
export async function POST(req: NextRequest) {
  try {
    // Autenticação (opcional - depende se candidatos não autenticados podem usar)
    const { userId } = auth()

    // Se quiser exigir autenticação, descomente:
    // if (!userId) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    // Parse do body
    const body = await req.json()
    const { transcricao, resposta_audio_id } = body

    // Validações
    if (!transcricao || typeof transcricao !== 'string') {
      return NextResponse.json(
        { error: 'Transcrição é obrigatória e deve ser uma string' },
        { status: 400 }
      )
    }

    if (!resposta_audio_id || typeof resposta_audio_id !== 'string') {
      return NextResponse.json(
        { error: 'resposta_audio_id é obrigatório e deve ser uma string' },
        { status: 400 }
      )
    }

    // Verificar se a resposta existe
    const { data: respostaExistente, error: respostaError } = await supabaseAdmin
      .from('respostas_audio')
      .select('id, candidato_id, pergunta_id')
      .eq('id', resposta_audio_id)
      .single()

    if (respostaError || !respostaExistente) {
      return NextResponse.json(
        { error: 'Resposta de áudio não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se já existe análise
    const { data: analiseExistente } = await supabaseAdmin
      .from('respostas_audio')
      .select('analise_emocional')
      .eq('id', resposta_audio_id)
      .single()

    if (analiseExistente?.analise_emocional) {
      console.log('Análise emocional já existe para esta resposta, será sobrescrita')
    }

    // Analisar emoção usando GPT-4
    console.log('Iniciando análise emocional com GPT-4...')
    const analise = await analisarEmocao(transcricao)
    console.log('Análise emocional concluída:', analise)

    // Salvar análise no banco (campo JSONB)
    const { data: respostaAtualizada, error: updateError } = await supabaseAdmin
      .from('respostas_audio')
      .update({
        analise_emocional: analise,
        updated_at: new Date().toISOString(),
      })
      .eq('id', resposta_audio_id)
      .select()
      .single()

    if (updateError) {
      console.error('Erro ao salvar análise no banco:', updateError)
      throw new Error(`Erro ao salvar análise: ${updateError.message}`)
    }

    // Log para auditoria
    console.log(`Análise emocional salva para resposta ${resposta_audio_id}`)
    console.log(`Candidato: ${respostaExistente.candidato_id}`)
    console.log(`Score geral: ${analise.score_geral}`)

    // Retornar sucesso
    return NextResponse.json({
      success: true,
      analise,
      message: 'Análise emocional concluída e salva com sucesso',
      resposta_audio_id,
    })
  } catch (error: any) {
    console.error('Erro na API de análise emocional:', error)

    // Retornar erro detalhado
    return NextResponse.json(
      {
        error: error.message || 'Erro ao processar análise emocional',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/analise-emocional?resposta_audio_id=xxx
 *
 * Retorna a análise emocional já salva de uma resposta
 */
export async function GET(req: NextRequest) {
  try {
    // Extrair query params
    const { searchParams } = new URL(req.url)
    const resposta_audio_id = searchParams.get('resposta_audio_id')

    if (!resposta_audio_id) {
      return NextResponse.json(
        { error: 'resposta_audio_id é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar análise no banco
    const { data, error } = await supabaseAdmin
      .from('respostas_audio')
      .select('analise_emocional, transcricao, created_at')
      .eq('id', resposta_audio_id)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Resposta não encontrada' },
        { status: 404 }
      )
    }

    if (!data.analise_emocional) {
      return NextResponse.json(
        { error: 'Análise emocional ainda não foi gerada para esta resposta' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      analise: data.analise_emocional as AnaliseEmocional,
      transcricao: data.transcricao,
      created_at: data.created_at,
    })
  } catch (error: any) {
    console.error('Erro ao buscar análise emocional:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar análise' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/analise-emocional?resposta_audio_id=xxx
 *
 * Remove a análise emocional de uma resposta (útil para reprocessamento)
 */
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const resposta_audio_id = searchParams.get('resposta_audio_id')

    if (!resposta_audio_id) {
      return NextResponse.json(
        { error: 'resposta_audio_id é obrigatório' },
        { status: 400 }
      )
    }

    // Remover análise
    const { error } = await supabaseAdmin
      .from('respostas_audio')
      .update({
        analise_emocional: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', resposta_audio_id)

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      message: 'Análise emocional removida com sucesso',
    })
  } catch (error: any) {
    console.error('Erro ao remover análise emocional:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao remover análise' },
      { status: 500 }
    )
  }
}
