import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { createClient } from '@supabase/supabase-js'
import { calcularFit } from '@/lib/fit-analysis'
import { calcularFitIdeal } from '@/lib/fit-ideal'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

/**
 * POST /api/fit-analises
 * Calcula e salva análise de fit para um candidato
 *
 * Body: { candidato_id, processo_id }
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const { candidato_id, processo_id } = body

    if (!candidato_id || !processo_id) {
      return NextResponse.json(
        { error: 'candidato_id e processo_id são obrigatórios' },
        { status: 400 }
      )
    }

    // 1. Buscar candidato com perfil
    const { data: candidato, error: candidatoError } = await supabase
      .from('candidatos')
      .select(`
        *,
        perfil:perfis_comportamentais(*),
        processo:processos(*)
      `)
      .eq('id', candidato_id)
      .eq('processo_id', processo_id)
      .single()

    if (candidatoError || !candidato) {
      return NextResponse.json(
        { error: 'Candidato não encontrado' },
        { status: 404 }
      )
    }

    if (!candidato.perfil) {
      return NextResponse.json(
        { error: 'Candidato ainda não completou os testes comportamentais' },
        { status: 400 }
      )
    }

    // 2. Buscar função com perfil ideal
    const { data: funcoes } = await supabase
      .from('funcoes')
      .select('*')
      .eq('processo_id', processo_id)
      .limit(1)

    if (!funcoes || funcoes.length === 0) {
      return NextResponse.json(
        { error: 'Perfil ideal da função não definido' },
        { status: 400 }
      )
    }

    const funcao = funcoes[0]

    // 3. Calcular fit com perfil ideal
    const fitIdeal = calcularFitIdeal(candidato.perfil, funcao.perfil_ideal)

    // 4. Calcular fit com líder (se houver)
    let fitLider = null
    let scoreLider = null

    if (candidato.processo.lider_id) {
      const { data: liderPerfil } = await supabase
        .from('perfis_comportamentais')
        .select('*')
        .eq('usuario_id', candidato.processo.lider_id)
        .single()

      if (liderPerfil) {
        fitLider = calcularFit(candidato.perfil, liderPerfil)
        scoreLider = fitLider.score_geral
      }
    }

    // 5. Calcular score geral (média ponderada)
    const scoreGeral = fitLider
      ? Math.round((fitIdeal.score_geral * 0.6 + scoreLider * 0.4))
      : fitIdeal.score_geral

    // 6. Gerar recomendação
    let recomendacao = ''
    if (scoreGeral >= 80) {
      recomendacao = 'Fit excelente. Candidato altamente recomendado para a posição.'
    } else if (scoreGeral >= 65) {
      recomendacao = 'Fit bom. Candidato apresenta bom alinhamento com os requisitos.'
    } else if (scoreGeral >= 50) {
      recomendacao = 'Fit moderado. Avaliar outros critérios antes de decidir.'
    } else {
      recomendacao = 'Fit baixo. Candidato pode não ser ideal para esta posição.'
    }

    // 7. Salvar análise no banco
    const analiseData = {
      candidato_id,
      processo_id,
      score_geral: scoreGeral,
      fit_funcao: fitIdeal.score_geral,
      fit_lider: scoreLider,
      detalhes: {
        fit_ideal: {
          disc_match: fitIdeal.detalhes.disc_match,
          mbti_compatibility: fitIdeal.detalhes.mbti_compatibility,
        },
        fit_lider: fitLider
          ? {
              disc_match: fitLider.detalhes.disc_match,
              mbti_compatibility: fitLider.detalhes.mbti_compatibility,
            }
          : null,
      },
      recomendacao,
      created_at: new Date().toISOString(),
    }

    const { data: analise, error: analiseError } = await supabase
      .from('fit_analises')
      .insert([analiseData])
      .select()
      .single()

    if (analiseError) {
      console.error('Erro ao salvar análise:', analiseError)
      throw analiseError
    }

    return NextResponse.json({
      success: true,
      message: 'Análise de fit calculada e salva com sucesso',
      analise,
    })
  } catch (error) {
    console.error('Erro na API POST /api/fit-analises:', error)
    return NextResponse.json(
      { error: 'Erro ao calcular fit' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/fit-analises?candidato_id=xxx
 * Busca análises de fit de um candidato
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const candidatoId = searchParams.get('candidato_id')
    const processoId = searchParams.get('processo_id')

    if (!candidatoId && !processoId) {
      return NextResponse.json(
        { error: 'candidato_id ou processo_id é obrigatório' },
        { status: 400 }
      )
    }

    let query = supabase.from('fit_analises').select('*')

    if (candidatoId) {
      query = query.eq('candidato_id', candidatoId)
    }

    if (processoId) {
      query = query.eq('processo_id', processoId)
    }

    const { data: analises, error } = await query.order('created_at', {
      ascending: false,
    })

    if (error) {
      console.error('Erro ao buscar análises:', error)
      throw error
    }

    return NextResponse.json({ analises })
  } catch (error) {
    console.error('Erro na API GET /api/fit-analises:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar análises' },
      { status: 500 }
    )
  }
}
