import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  const { token } = params

  if (!token) {
    return NextResponse.json(
      { error: 'Token não fornecido' },
      { status: 400 }
    )
  }

  try {
    // Buscar convite pelo token
    const { data: convite, error: conviteError } = await supabase
      .from('convites')
      .select(
        `
        id,
        token,
        email,
        nome,
        tipo,
        status,
        expires_at,
        created_at,
        processo_id,
        processos (
          id,
          nome,
          descricao,
          status
        )
      `
      )
      .eq('token', token)
      .single()

    if (conviteError) {
      if (conviteError.code === 'PGRST116') {
        // Token não encontrado
        return NextResponse.json(
          { error: 'Convite inválido ou expirado' },
          { status: 404 }
        )
      }
      throw conviteError
    }

    if (!convite) {
      return NextResponse.json(
        { error: 'Convite não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o convite expirou
    const expiresAt = new Date(convite.expires_at)
    const now = new Date()

    if (now > expiresAt) {
      return NextResponse.json(
        { error: 'Convite expirado' },
        { status: 410 }
      )
    }

    // Verificar se já foi usado
    if (convite.status === 'usado') {
      return NextResponse.json(
        { error: 'Convite já foi utilizado' },
        { status: 410 }
      )
    }

    // Retornar dados do convite e do processo
    const processo = convite.processos ? (Array.isArray(convite.processos) ? convite.processos[0] : convite.processos) : null

    return NextResponse.json({
      success: true,
      convite: {
        id: convite.id,
        token: convite.token,
        email: convite.email,
        nome: convite.nome,
        tipo: convite.tipo,
        status: convite.status,
        processoId: convite.processo_id,
        processo: processo ? {
          id: processo.id,
          nome: processo.nome,
          descricao: processo.descricao,
          status: processo.status,
        } : null,
      },
    })
  } catch (error: any) {
    console.error('Erro ao validar convite:', error)
    return NextResponse.json(
      { error: 'Erro ao validar convite' },
      { status: 500 }
    )
  }
}
