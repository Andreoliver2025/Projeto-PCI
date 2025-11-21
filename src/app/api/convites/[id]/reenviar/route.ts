import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: conviteId } = params

  if (!conviteId) {
    return NextResponse.json(
      { error: 'ID do convite não fornecido' },
      { status: 400 }
    )
  }

  try {
    // Buscar o convite existente
    const { data: convite, error: conviteError } = await supabase
      .from('convites')
      .select('*')
      .eq('id', conviteId)
      .single()

    if (conviteError) {
      if (conviteError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Convite não encontrado' },
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

    // Verificar se o usuário tem permissão para reenviar este convite
    // (opcional: adicionar verificação de autorização baseada no processo_id)

    // Gerar novo token
    const novoToken = crypto.randomUUID()

    // Calcular nova data de expiração (+7 dias)
    const novaDataExpiracao = new Date()
    novaDataExpiracao.setDate(novaDataExpiracao.getDate() + 7)

    // Atualizar convite com novo token e data de expiração
    const { data: conviteAtualizado, error: updateError } = await supabase
      .from('convites')
      .update({
        token: novoToken,
        expires_at: novaDataExpiracao.toISOString(),
        status: 'pendente',
        updated_at: new Date().toISOString(),
      })
      .eq('id', conviteId)
      .select()
      .single()

    if (updateError) throw updateError

    // Montar novo link
    const baseUrl = conviteAtualizado.tipo === 'lider' ? 'lider' : 'candidato'
    const novaConviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://projetopci.netlify.app'}/${baseUrl}/convite/${novoToken}`

    // Log para desenvolvimento
    console.log(`Convite reenviado para ${conviteAtualizado.email}`)
    console.log('Novo link:', novaConviteUrl)

    // TODO: Integrar com serviço de email para reenviar
    // Por enquanto, apenas retornar o novo link

    return NextResponse.json({
      success: true,
      conviteUrl: novaConviteUrl,
      message: 'Convite reenviado com sucesso',
      convite: {
        id: conviteAtualizado.id,
        email: conviteAtualizado.email,
        nome: conviteAtualizado.nome,
        status: conviteAtualizado.status,
        expiresAt: conviteAtualizado.expires_at,
        tipo: conviteAtualizado.tipo,
      },
    })
  } catch (error: any) {
    console.error('Erro ao reenviar convite:', error)
    return NextResponse.json(
      {
        error: error.message || 'Erro ao reenviar convite',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
