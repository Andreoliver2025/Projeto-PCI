import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { createClient } from '@supabase/supabase-js'

// Cliente Supabase com permissões de service_role (bypassa RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Interface para o payload do Clerk
interface ClerkWebhookEvent {
  data: {
    id: string
    email_addresses: Array<{
      email_address: string
      id: string
    }>
    first_name: string | null
    last_name: string | null
    primary_email_address_id: string
  }
  object: 'event'
  type: 'user.created' | 'user.updated' | string
}

export async function POST(req: Request) {
  // Obter o webhook secret do Clerk
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    console.error('[Clerk Webhook] Missing CLERK_WEBHOOK_SECRET')
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    )
  }

  // Obter headers
  const headerPayload = headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // Validar presença dos headers do Svix
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error('[Clerk Webhook] Missing svix headers')
    return NextResponse.json(
      { error: 'Missing svix headers' },
      { status: 400 }
    )
  }

  // Obter o body da requisição
  const payload = await req.text()
  const body = payload

  // Criar instância do Svix
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: ClerkWebhookEvent

  // Verificar a assinatura do webhook
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as ClerkWebhookEvent
  } catch (err: any) {
    console.error('[Clerk Webhook] Error verifying webhook:', err.message)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  // Processar o evento
  const eventType = evt.type
  console.log(`[Clerk Webhook] Received event: ${eventType}`)

  try {
    if (eventType === 'user.created' || eventType === 'user.updated') {
      const { id, email_addresses, first_name, last_name, primary_email_address_id } = evt.data

      // Encontrar o email principal
      const primaryEmail = email_addresses.find(
        email => email.id === primary_email_address_id
      )

      if (!primaryEmail) {
        console.error('[Clerk Webhook] No primary email found for user:', id)
        return NextResponse.json(
          { error: 'No primary email found' },
          { status: 400 }
        )
      }

      // Montar o nome completo
      const nome = [first_name, last_name].filter(Boolean).join(' ') || 'Usuário'

      // Dados do usuário
      const userData = {
        clerk_id: id,
        nome: nome,
        email: primaryEmail.email_address,
        tipo: 'Principal' as const, // Tipo padrão para novos usuários
        updated_at: new Date().toISOString(),
      }

      console.log('[Clerk Webhook] Processing user:', {
        clerk_id: id,
        email: primaryEmail.email_address,
        nome: nome,
        eventType
      })

      if (eventType === 'user.created') {
        // Inserir novo usuário
        const { data, error } = await supabaseAdmin
          .from('usuarios')
          .insert({
            ...userData,
            created_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (error) {
          // Se o erro for de duplicação, tentar atualizar
          if (error.code === '23505') {
            console.log('[Clerk Webhook] User already exists, updating instead')
            const { data: updateData, error: updateError } = await supabaseAdmin
              .from('usuarios')
              .update(userData)
              .eq('clerk_id', id)
              .select()
              .single()

            if (updateError) {
              console.error('[Clerk Webhook] Error updating existing user:', updateError)
              return NextResponse.json(
                { error: 'Failed to update existing user', details: updateError.message },
                { status: 500 }
              )
            }

            console.log('[Clerk Webhook] User updated successfully:', updateData)
            return NextResponse.json({
              success: true,
              action: 'updated',
              user: updateData
            })
          }

          console.error('[Clerk Webhook] Error creating user:', error)
          return NextResponse.json(
            { error: 'Failed to create user', details: error.message },
            { status: 500 }
          )
        }

        console.log('[Clerk Webhook] User created successfully:', data)
        return NextResponse.json({
          success: true,
          action: 'created',
          user: data
        })
      }

      if (eventType === 'user.updated') {
        // Atualizar usuário existente
        const { data, error } = await supabaseAdmin
          .from('usuarios')
          .update(userData)
          .eq('clerk_id', id)
          .select()
          .single()

        if (error) {
          console.error('[Clerk Webhook] Error updating user:', error)
          return NextResponse.json(
            { error: 'Failed to update user', details: error.message },
            { status: 500 }
          )
        }

        console.log('[Clerk Webhook] User updated successfully:', data)
        return NextResponse.json({
          success: true,
          action: 'updated',
          user: data
        })
      }
    }

    // Evento não tratado
    console.log(`[Clerk Webhook] Unhandled event type: ${eventType}`)
    return NextResponse.json({
      success: true,
      message: 'Event received but not processed'
    })
  } catch (error: any) {
    console.error('[Clerk Webhook] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
