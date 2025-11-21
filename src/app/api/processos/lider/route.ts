import { NextRequest, NextResponse } from 'next/server'
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
 * GET /api/processos/lider
 * Retorna processos onde o usuário autenticado é o líder
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar usuário pelo clerk_id
    const { data: usuario, error: userError } = await supabase
      .from('usuarios')
      .select('id')
      .eq('clerk_id', userId)
      .single()

    if (userError || !usuario) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Buscar processos onde o usuário é líder
    const { data: processos, error: processosError } = await supabase
      .from('processos')
      .select(`
        id,
        nome,
        descricao,
        status,
        created_at,
        updated_at
      `)
      .eq('lider_id', usuario.id)
      .order('created_at', { ascending: false })

    if (processosError) {
      console.error('Erro ao buscar processos:', processosError)
      throw processosError
    }

    // Para cada processo, contar candidatos
    const processosComCandidatos = await Promise.all(
      (processos || []).map(async (processo) => {
        // Contar total de candidatos
        const { count: totalCandidatos } = await supabase
          .from('candidatos')
          .select('*', { count: 'exact', head: true })
          .eq('processo_id', processo.id)

        // Contar candidatos em avaliação
        const { count: emAvaliacao } = await supabase
          .from('candidatos')
          .select('*', { count: 'exact', head: true })
          .eq('processo_id', processo.id)
          .eq('status', 'em_avaliacao')

        // Contar candidatos pendentes
        const { count: pendentes } = await supabase
          .from('candidatos')
          .select('*', { count: 'exact', head: true })
          .eq('processo_id', processo.id)
          .eq('status', 'pendente')

        return {
          ...processo,
          candidatos_count: totalCandidatos || 0,
          candidatos_em_avaliacao: emAvaliacao || 0,
          candidatos_pendentes: pendentes || 0,
        }
      })
    )

    return NextResponse.json({
      success: true,
      processos: processosComCandidatos,
    })
  } catch (error) {
    console.error('Erro na API GET /api/processos/lider:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar processos' },
      { status: 500 }
    )
  }
}
