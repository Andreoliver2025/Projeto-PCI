import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

/**
 * POST /api/perfis
 * Cria ou atualiza o perfil comportamental do usuário autenticado
 */
export async function POST(req: Request) {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await req.json()

    // Validar dados recebidos
    const {
      disc_d,
      disc_i,
      disc_s,
      disc_c,
      mbti_type,
      mbti_e_i,
      mbti_s_n,
      mbti_t_f,
      mbti_j_p,
    } = body

    // Buscar usuario_id do banco baseado no clerk_id
    const { data: usuario, error: usuarioError } = await supabase
      .from('usuarios')
      .select('id')
      .eq('clerk_id', userId)
      .single()

    if (usuarioError || !usuario) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Preparar dados para inserção
    const perfilData: any = {
      usuario_id: usuario.id,
      updated_at: new Date().toISOString(),
    }

    // Adicionar dados DISC se fornecidos
    if (disc_d !== undefined) perfilData.disc_d = disc_d
    if (disc_i !== undefined) perfilData.disc_i = disc_i
    if (disc_s !== undefined) perfilData.disc_s = disc_s
    if (disc_c !== undefined) perfilData.disc_c = disc_c

    // Adicionar dados MBTI se fornecidos
    if (mbti_type !== undefined) perfilData.mbti_type = mbti_type
    if (mbti_e_i !== undefined) perfilData.mbti_e_i = mbti_e_i
    if (mbti_s_n !== undefined) perfilData.mbti_s_n = mbti_s_n
    if (mbti_t_f !== undefined) perfilData.mbti_t_f = mbti_t_f
    if (mbti_j_p !== undefined) perfilData.mbti_j_p = mbti_j_p

    // Verificar se já existe perfil para este usuário
    const { data: perfilExistente } = await supabase
      .from('perfis_comportamentais')
      .select('id')
      .eq('usuario_id', usuario.id)
      .single()

    let perfil

    if (perfilExistente) {
      // Atualizar perfil existente
      const { data, error } = await supabase
        .from('perfis_comportamentais')
        .update(perfilData)
        .eq('usuario_id', usuario.id)
        .select()
        .single()

      if (error) {
        console.error('Erro ao atualizar perfil:', error)
        return NextResponse.json(
          { error: 'Erro ao atualizar perfil' },
          { status: 500 }
        )
      }

      perfil = data
    } else {
      // Criar novo perfil
      perfilData.created_at = new Date().toISOString()

      const { data, error } = await supabase
        .from('perfis_comportamentais')
        .insert([perfilData])
        .select()
        .single()

      if (error) {
        console.error('Erro ao criar perfil:', error)
        return NextResponse.json(
          { error: 'Erro ao criar perfil' },
          { status: 500 }
        )
      }

      perfil = data
    }

    return NextResponse.json({
      success: true,
      perfil,
      message: perfilExistente
        ? 'Perfil atualizado com sucesso'
        : 'Perfil criado com sucesso',
    })
  } catch (error) {
    console.error('Erro na API /api/perfis:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/perfis
 * Busca o perfil comportamental do usuário autenticado
 */
export async function GET() {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar usuario_id do banco baseado no clerk_id
    const { data: usuario, error: usuarioError } = await supabase
      .from('usuarios')
      .select('id')
      .eq('clerk_id', userId)
      .single()

    if (usuarioError || !usuario) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Buscar perfil comportamental
    const { data: perfil, error: perfilError } = await supabase
      .from('perfis_comportamentais')
      .select('*')
      .eq('usuario_id', usuario.id)
      .single()

    if (perfilError) {
      // Se não encontrou, retorna null (não é erro)
      if (perfilError.code === 'PGRST116') {
        return NextResponse.json({ perfil: null })
      }

      console.error('Erro ao buscar perfil:', perfilError)
      return NextResponse.json(
        { error: 'Erro ao buscar perfil' },
        { status: 500 }
      )
    }

    return NextResponse.json({ perfil })
  } catch (error) {
    console.error('Erro na API GET /api/perfis:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
