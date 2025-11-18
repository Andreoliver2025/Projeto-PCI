import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { userId } = auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { nome, descricao, nome_funcao, descricao_funcao } = body

    // Buscar usuário
    const { data: usuario, error: userError } = await supabase
      .from('usuarios')
      .select('id')
      .eq('clerk_id', userId)
      .single()

    if (userError || !usuario) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Criar processo
    const { data: processo, error: processoError } = await supabase
      .from('processos')
      .insert({
        usuario_principal_id: usuario.id,
        nome,
        descricao,
        status: 'rascunho',
      })
      .select()
      .single()

    if (processoError) throw processoError

    // Criar função
    const { data: funcao, error: funcaoError } = await supabase
      .from('funcoes')
      .insert({
        processo_id: processo.id,
        nome: nome_funcao,
        descricao: descricao_funcao,
        perfil_ideal: {
          disc_d_min: 0,
          disc_d_max: 100,
          disc_i_min: 0,
          disc_i_max: 100,
          disc_s_min: 0,
          disc_s_max: 100,
          disc_c_min: 0,
          disc_c_max: 100,
          mbti_preferred: [],
          big5_ranges: {
            openness: [0, 100],
            conscientiousness: [0, 100],
            extraversion: [0, 100],
            agreeableness: [0, 100],
            neuroticism: [0, 100],
          },
          eneagrama_preferred: [],
        },
      })
      .select()
      .single()

    if (funcaoError) throw funcaoError

    return NextResponse.json({ processo, funcao })
  } catch (error: any) {
    console.error('Error creating processo:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const { userId } = auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('id')
      .eq('clerk_id', userId)
      .single()

    if (!usuario) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { data: processos, error } = await supabase
      .from('processos')
      .select('*, funcoes(*)')
      .eq('usuario_principal_id', usuario.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(processos)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
