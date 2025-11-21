import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * POST /api/processos/[id]/lider
 * Associa um líder ao processo e envia convite para testes
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

    const { email_lider, nome_lider } = await req.json()

    if (!email_lider) {
      return NextResponse.json(
        { error: 'Email do líder é obrigatório' },
        { status: 400 }
      )
    }

    // 1. Verificar se processo existe e pertence ao usuário
    const { data: processo, error: processoError } = await supabase
      .from('processos')
      .select('*, usuarios!processos_usuario_principal_id_fkey(clerk_id)')
      .eq('id', params.id)
      .single()

    if (processoError || !processo) {
      return NextResponse.json(
        { error: 'Processo não encontrado' },
        { status: 404 }
      )
    }

    if (processo.usuarios.clerk_id !== userId) {
      return NextResponse.json(
        { error: 'Você não tem permissão para este processo' },
        { status: 403 }
      )
    }

    // 2. Verificar se líder já existe no sistema
    let liderId: string
    const { data: usuarioExistente } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', email_lider)
      .single()

    if (usuarioExistente) {
      liderId = usuarioExistente.id
    } else {
      // 3. Criar usuário temporário para o líder
      const { data: novoUsuario, error: usuarioError } = await supabase
        .from('usuarios')
        .insert({
          email: email_lider,
          nome: nome_lider || email_lider.split('@')[0],
          papel: 'Líder',
        })
        .select()
        .single()

      if (usuarioError) throw usuarioError
      liderId = novoUsuario.id
    }

    // 4. Associar líder ao processo
    const { error: updateError } = await supabase
      .from('processos')
      .update({ lider_id: liderId })
      .eq('id', params.id)

    if (updateError) throw updateError

    // 5. Criar token de convite para testes
    const token = crypto.randomUUID()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 14) // 14 dias para líder completar

    // Salvar convite na tabela convites
    const { error: conviteError } = await supabase
      .from('convites')
      .insert({
        processo_id: params.id,
        email: email_lider,
        nome: nome_lider || email_lider.split('@')[0],
        tipo: 'lider',
        token,
        expires_at: expiresAt.toISOString(),
        status: 'pendente',
      })

    if (conviteError) {
      console.error('Erro ao salvar convite:', conviteError)
      // Continua mesmo com erro para não travar o fluxo
    }

    const conviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://projetopci.netlify.app'}/lider/convite/${token}`

    console.log(`Convite para líder: ${conviteUrl}`)

    // TODO: Integrar com serviço de email (Resend, SendGrid)
    // Por enquanto apenas retorna a URL

    return NextResponse.json({
      message: 'Líder associado com sucesso',
      convite_url: conviteUrl,
    })
  } catch (error) {
    console.error('Erro ao associar líder:', error)
    return NextResponse.json(
      { error: 'Erro ao associar líder' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/processos/[id]/lider
 * Atualiza perfil comportamental do líder
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
    } = await req.json()

    // 1. Buscar processo e verificar se usuário é o líder
    const { data: processo, error: processoError } = await supabase
      .from('processos')
      .select('*, lider:usuarios!processos_lider_id_fkey(clerk_id)')
      .eq('id', params.id)
      .single()

    if (processoError || !processo) {
      return NextResponse.json(
        { error: 'Processo não encontrado' },
        { status: 404 }
      )
    }

    if (!processo.lider || processo.lider.clerk_id !== userId) {
      return NextResponse.json(
        { error: 'Você não é o líder deste processo' },
        { status: 403 }
      )
    }

    // 2. Buscar ou criar perfil comportamental do líder
    const { data: usuarioLider } = await supabase
      .from('usuarios')
      .select('id')
      .eq('clerk_id', userId)
      .single()

    if (!usuarioLider) {
      return NextResponse.json(
        { error: 'Usuário líder não encontrado' },
        { status: 404 }
      )
    }

    // 3. Verificar se perfil já existe
    const { data: perfilExistente } = await supabase
      .from('perfis_comportamentais')
      .select('id')
      .eq('usuario_id', usuarioLider.id)
      .single()

    let perfil
    if (perfilExistente) {
      // Atualizar
      const { data, error } = await supabase
        .from('perfis_comportamentais')
        .update({
          disc_d,
          disc_i,
          disc_s,
          disc_c,
          mbti_type,
          mbti_e_i,
          mbti_s_n,
          mbti_t_f,
          mbti_j_p,
          updated_at: new Date().toISOString(),
        })
        .eq('id', perfilExistente.id)
        .select()
        .single()

      if (error) throw error
      perfil = data
    } else {
      // Criar novo
      const { data, error } = await supabase
        .from('perfis_comportamentais')
        .insert({
          usuario_id: usuarioLider.id,
          disc_d,
          disc_i,
          disc_s,
          disc_c,
          mbti_type,
          mbti_e_i,
          mbti_s_n,
          mbti_t_f,
          mbti_j_p,
        })
        .select()
        .single()

      if (error) throw error
      perfil = data
    }

    return NextResponse.json({
      message: 'Perfil do líder atualizado com sucesso',
      perfil,
    })
  } catch (error) {
    console.error('Erro ao atualizar perfil do líder:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar perfil do líder' },
      { status: 500 }
    )
  }
}
