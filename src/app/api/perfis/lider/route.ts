import { NextRequest, NextResponse } from 'next/server'
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
 * POST /api/perfis/lider
 * Cria perfil para líder através de convite (não requer autenticação)
 * e associa o líder ao processo
 *
 * Body: {
 *   convite_token: string,
 *   disc_d, disc_i, disc_s, disc_c,
 *   mbti_type, mbti_e_i, mbti_s_n, mbti_t_f, mbti_j_p
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      convite_token,
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

    if (!convite_token) {
      return NextResponse.json(
        { error: 'Token do convite é obrigatório' },
        { status: 400 }
      )
    }

    // 1. Buscar convite pelo token
    const { data: convite, error: conviteError } = await supabase
      .from('convites')
      .select('*')
      .eq('token', convite_token)
      .single()

    if (conviteError || !convite) {
      return NextResponse.json(
        { error: 'Convite não encontrado' },
        { status: 404 }
      )
    }

    // 2. Verificar se é convite de líder
    if (convite.tipo !== 'lider') {
      return NextResponse.json(
        { error: 'Este convite não é para líder' },
        { status: 400 }
      )
    }

    // 3. Verificar se convite expirou
    const expiresAt = new Date(convite.expires_at)
    const now = new Date()

    if (now > expiresAt) {
      return NextResponse.json(
        { error: 'Convite expirado' },
        { status: 410 }
      )
    }

    // 4. Buscar ou criar usuário
    let usuarioId: string

    const { data: usuarioExistente } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', convite.email)
      .single()

    if (usuarioExistente) {
      usuarioId = usuarioExistente.id
    } else {
      // Criar novo usuário
      const { data: novoUsuario, error: usuarioError } = await supabase
        .from('usuarios')
        .insert({
          email: convite.email,
          nome: convite.nome,
          clerk_id: null, // Líderes podem não ter Clerk ID inicialmente
        })
        .select('id')
        .single()

      if (usuarioError) {
        console.error('Erro ao criar usuário:', usuarioError)
        throw usuarioError
      }

      usuarioId = novoUsuario.id
    }

    // 5. Criar ou atualizar perfil comportamental
    const perfilData: any = {
      usuario_id: usuarioId,
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
      .eq('usuario_id', usuarioId)
      .single()

    let perfil

    if (perfilExistente) {
      // Atualizar perfil existente
      const { data, error } = await supabase
        .from('perfis_comportamentais')
        .update(perfilData)
        .eq('usuario_id', usuarioId)
        .select()
        .single()

      if (error) {
        console.error('Erro ao atualizar perfil:', error)
        throw error
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
        throw error
      }

      perfil = data
    }

    // 6. Associar líder ao processo
    const { error: updateProcessoError } = await supabase
      .from('processos')
      .update({
        lider_id: usuarioId,
      })
      .eq('id', convite.processo_id)

    if (updateProcessoError) {
      console.error('Erro ao associar líder ao processo:', updateProcessoError)
      throw updateProcessoError
    }

    // 7. Atualizar status do convite para 'aceito'
    const { error: updateError } = await supabase
      .from('convites')
      .update({
        status: 'aceito',
        accepted_at: new Date().toISOString(),
      })
      .eq('id', convite.id)

    if (updateError) {
      console.error('Erro ao atualizar convite:', updateError)
    }

    return NextResponse.json({
      success: true,
      perfil,
      processo_id: convite.processo_id,
      message: 'Perfil de líder criado e associado ao processo com sucesso',
    })
  } catch (error) {
    console.error('Erro na API POST /api/perfis/lider:', error)
    return NextResponse.json(
      { error: 'Erro ao criar perfil do líder' },
      { status: 500 }
    )
  }
}
