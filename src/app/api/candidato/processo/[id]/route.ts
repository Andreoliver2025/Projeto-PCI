import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * GET /api/candidato/processo/[id]
 * Busca o candidato do usuário logado para um processo específico
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

    const processoId = params.id

    // Buscar usuário
    const { data: usuario, error: userError } = await supabase
      .from('usuarios')
      .select('id')
      .eq('clerk_id', userId)
      .single()

    if (userError || !usuario) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Buscar candidato
    const { data: candidato, error: candidatoError } = await supabase
      .from('candidatos')
      .select('*')
      .eq('processo_id', processoId)
      .eq('usuario_id', usuario.id)
      .single()

    if (candidatoError || !candidato) {
      return NextResponse.json(
        { error: 'Você não é candidato deste processo' },
        { status: 404 }
      )
    }

    return NextResponse.json({ candidato })
  } catch (error: any) {
    console.error('Erro ao buscar candidato:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
