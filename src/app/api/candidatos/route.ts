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
 * POST /api/candidatos
 * Cria um candidato quando aceita um convite
 *
 * Body: { convite_token }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { convite_token } = body

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

    // 2. Verificar se convite já foi aceito
    if (convite.status === 'aceito') {
      // Buscar candidato existente
      const { data: candidatoExistente } = await supabase
        .from('candidatos')
        .select('id')
        .eq('email', convite.email)
        .eq('processo_id', convite.processo_id)
        .single()

      if (candidatoExistente) {
        return NextResponse.json({
          success: true,
          candidato: candidatoExistente,
          message: 'Candidato já existe',
        })
      }
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
          clerk_id: null, // Candidatos podem não ter Clerk ID
        })
        .select('id')
        .single()

      if (usuarioError) {
        console.error('Erro ao criar usuário:', usuarioError)
        throw usuarioError
      }

      usuarioId = novoUsuario.id
    }

    // 5. Criar candidato
    const { data: candidato, error: candidatoError } = await supabase
      .from('candidatos')
      .insert({
        processo_id: convite.processo_id,
        usuario_id: usuarioId,
        email: convite.email,
        status: 'pendente',
      })
      .select()
      .single()

    if (candidatoError) {
      console.error('Erro ao criar candidato:', candidatoError)
      throw candidatoError
    }

    // 6. Atualizar status do convite para 'aceito'
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
      candidato,
      message: 'Candidato criado com sucesso',
    })
  } catch (error) {
    console.error('Erro na API POST /api/candidatos:', error)
    return NextResponse.json(
      { error: 'Erro ao criar candidato' },
      { status: 500 }
    )
  }
}
