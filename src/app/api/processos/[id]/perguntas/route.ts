import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * GET /api/processos/[id]/perguntas
 * Lista perguntas do processo (ordenadas)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: perguntas, error } = await supabase
      .from('perguntas_empresa')
      .select('*')
      .eq('processo_id', params.id)
      .order('ordem', { ascending: true })

    if (error) throw error

    return NextResponse.json({ perguntas })
  } catch (error: any) {
    console.error('Erro ao buscar perguntas:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/processos/[id]/perguntas
 * Criar pergunta (texto, ordem, tempo_limite_segundos)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { texto, tempo_limite_segundos = 120 } = body

    if (!texto || texto.trim() === '') {
      return NextResponse.json(
        { error: 'Texto da pergunta é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar última ordem
    const { data: ultimaPergunta } = await supabase
      .from('perguntas_empresa')
      .select('ordem')
      .eq('processo_id', params.id)
      .order('ordem', { ascending: false })
      .limit(1)
      .single()

    const novaOrdem = ultimaPergunta ? ultimaPergunta.ordem + 1 : 1

    // Criar pergunta
    const { data: pergunta, error } = await supabase
      .from('perguntas_empresa')
      .insert({
        processo_id: params.id,
        texto: texto.trim(),
        tempo_limite_segundos,
        ordem: novaOrdem,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ pergunta }, { status: 201 })
  } catch (error: any) {
    console.error('Erro ao criar pergunta:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
