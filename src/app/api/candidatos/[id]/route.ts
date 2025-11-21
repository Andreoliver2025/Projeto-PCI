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
 * GET /api/candidatos/[id]
 * Retorna dados completos de um candidato incluindo:
 * - Dados do candidato (nome, email, status)
 * - Perfil comportamental completo
 * - Dados do processo
 * - Perfil ideal da função
 * - Perfil do líder (se houver)
 * - Análises de fit
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const candidatoId = params.id

    // 1. Buscar candidato base com usuário
    const { data: candidato, error: candidatoError } = await supabase
      .from('candidatos')
      .select(`
        *,
        usuario:usuarios(id, nome, email, tipo)
      `)
      .eq('id', candidatoId)
      .single()

    if (candidatoError || !candidato) {
      return NextResponse.json(
        { error: 'Candidato não encontrado' },
        { status: 404 }
      )
    }

    // 2. Buscar perfil comportamental do candidato
    let perfilCandidato = null
    if (candidato.perfil_comportamental_id) {
      const { data: perfilData } = await supabase
        .from('perfis_comportamentais')
        .select('*')
        .eq('id', candidato.perfil_comportamental_id)
        .single()

      perfilCandidato = perfilData
    }

    // 3. Buscar processo
    const { data: processo, error: processoError } = await supabase
      .from('processos')
      .select('*')
      .eq('id', candidato.processo_id)
      .single()

    if (processoError || !processo) {
      return NextResponse.json(
        { error: 'Processo não encontrado' },
        { status: 404 }
      )
    }

    // 4. Buscar função ideal do processo
    let funcaoIdeal = null
    const { data: funcoes } = await supabase
      .from('funcoes')
      .select('*')
      .eq('processo_id', processo.id)
      .limit(1)

    if (funcoes && funcoes.length > 0) {
      funcaoIdeal = funcoes[0]
    }

    // 5. Buscar líder (se houver) com perfil comportamental
    let lider = null
    let liderPerfil = null

    if (processo.lider_id) {
      const { data: liderData } = await supabase
        .from('usuarios')
        .select('id, nome, email')
        .eq('id', processo.lider_id)
        .single()

      if (liderData) {
        lider = liderData

        // Buscar perfil do líder
        const { data: perfilData } = await supabase
          .from('perfis_comportamentais')
          .select('*')
          .eq('usuario_id', lider.id)
          .single()

        liderPerfil = perfilData
      }
    }

    // 6. Buscar análises de fit (se existirem)
    const { data: fitAnalise } = await supabase
      .from('fit_analises')
      .select('*')
      .eq('candidato_id', candidatoId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // Montar resposta completa
    const response = {
      candidato: {
        ...candidato,
        perfil: perfilCandidato,
      },
      processo,
      funcao: funcaoIdeal,
      lider: lider
        ? {
            ...lider,
            perfil: liderPerfil,
          }
        : null,
      fit_analise: fitAnalise || null,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Erro na API GET /api/candidatos/[id]:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/candidatos/[id]
 * Atualiza status do candidato (aprovar/reprovar)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const { status } = body

    // Validar status
    const statusValidos = ['pendente', 'em_avaliacao', 'aprovado', 'reprovado']
    if (!status || !statusValidos.includes(status)) {
      return NextResponse.json(
        { error: 'Status inválido. Use: pendente, em_avaliacao, aprovado ou reprovado' },
        { status: 400 }
      )
    }

    // Atualizar candidato
    const { data: candidato, error } = await supabase
      .from('candidatos')
      .update({ status })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar candidato:', error)
      throw error
    }

    return NextResponse.json({
      success: true,
      message: `Candidato ${status === 'aprovado' ? 'aprovado' : status === 'reprovado' ? 'reprovado' : 'atualizado'} com sucesso`,
      candidato,
    })
  } catch (error) {
    console.error('Erro na API PATCH /api/candidatos/[id]:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar candidato' },
      { status: 500 }
    )
  }
}
