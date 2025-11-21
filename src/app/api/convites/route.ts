import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { supabase } from '@/lib/supabase'

// Item 6 do Build Sequence: Envio de convite por e-mail
export async function POST(req: NextRequest) {
  const { userId } = auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { processoId, email, nome, tipo = 'candidato' } = await req.json()

    // Validar tipo
    if (!['candidato', 'lider'].includes(tipo)) {
      return NextResponse.json(
        { error: 'Tipo inválido. Deve ser "candidato" ou "lider"' },
        { status: 400 }
      )
    }

    // Gerar token único para o convite
    const token = crypto.randomUUID()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // Expira em 7 dias

    // Salvar convite no banco
    const { data: convite, error: conviteError } = await supabase
      .from('convites')
      .insert({
        processo_id: processoId,
        email,
        nome,
        tipo,
        token,
        expires_at: expiresAt.toISOString(),
        status: 'pendente',
      })
      .select()
      .single()

    if (conviteError) throw conviteError

    // Montar link único baseado no tipo
    const baseUrl = tipo === 'lider' ? 'lider' : 'candidato'
    const conviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://projetopci.netlify.app'}/${baseUrl}/convite/${token}`

    // TODO: Integrar com serviço de email (Resend, SendGrid, etc)
    // Por enquanto, apenas retornar o link
    const emailContent = {
      to: email,
      subject: 'Convite para Processo de Seleção',
      html: `
        <h1>Olá ${nome}!</h1>
        <p>Você foi convidado(a) para participar de um processo de seleção.</p>
        <p>Clique no link abaixo para fazer os testes comportamentais:</p>
        <a href="${conviteUrl}">${conviteUrl}</a>
        <p>Este link expira em 7 dias.</p>
      `,
    }

    // Log para desenvolvimento
    console.log('Email a ser enviado:', emailContent)
    console.log('Link do convite:', conviteUrl)

    return NextResponse.json({
      success: true,
      conviteUrl,
      message: 'Convite criado com sucesso. Em produção, um email seria enviado.'
    })
  } catch (error: any) {
    console.error('Error creating convite:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
