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
 * GET /api/processos/[id]
 * Retorna dados completos de um processo incluindo:
 * - Processo base
 * - Funções com perfil ideal
 * - Líder com perfil comportamental
 * - Candidatos com perfis e fits calculados
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

    const processoId = params.id

    // 1. Buscar processo base
    const { data: processo, error: processoError } = await supabase
      .from('processos')
      .select('*')
      .eq('id', processoId)
      .single()

    if (processoError || !processo) {
      return NextResponse.json(
        { error: 'Processo não encontrado' },
        { status: 404 }
      )
    }

    // 2. Buscar funções associadas ao processo
    const { data: funcoes, error: funcoesError } = await supabase
      .from('funcoes')
      .select('*')
      .eq('processo_id', processoId)

    if (funcoesError) {
      console.error('Erro ao buscar funções:', funcoesError)
    }

    // 3. Buscar líder (se houver) com perfil comportamental
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

    // 4. Buscar candidatos com perfis
    const { data: candidatos, error: candidatosError } = await supabase
      .from('candidatos')
      .select(`
        *,
        usuario:usuarios(id, nome, email),
        perfil:perfis_comportamentais(*)
      `)
      .eq('processo_id', processoId)
      .order('created_at', { ascending: false })

    if (candidatosError) {
      console.error('Erro ao buscar candidatos:', candidatosError)
    }

    // 5. Buscar fits calculados para cada candidato (se existirem)
    let candidatosComFits = candidatos || []

    if (candidatos && candidatos.length > 0) {
      candidatosComFits = await Promise.all(
        candidatos.map(async (candidato) => {
          const { data: fits } = await supabase
            .from('fit_analises')
            .select('*')
            .eq('candidato_id', candidato.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          return {
            ...candidato,
            fit_analise: fits || null,
          }
        })
      )
    }

    // Montar resposta completa
    const response = {
      processo,
      funcoes: funcoes || [],
      lider: lider
        ? {
            ...lider,
            perfil: liderPerfil,
          }
        : null,
      candidatos: candidatosComFits,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Erro na API GET /api/processos/[id]:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/processos/[id]
 * Atualiza dados do processo (nome, descrição, status)
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
    const { nome, descricao, status } = body

    // Validar que há algo para atualizar
    if (!nome && !descricao && !status) {
      return NextResponse.json(
        { error: 'Nenhum campo para atualizar' },
        { status: 400 }
      )
    }

    // Construir objeto de atualização
    const updates: any = {
      updated_at: new Date().toISOString(),
    }

    if (nome) updates.nome = nome
    if (descricao) updates.descricao = descricao
    if (status) {
      // Validar status
      const statusValidos = ['rascunho', 'ativo', 'finalizado', 'arquivado']
      if (!statusValidos.includes(status)) {
        return NextResponse.json({ error: 'Status inválido' }, { status: 400 })
      }
      updates.status = status
    }

    // Atualizar processo
    const { data: processo, error } = await supabase
      .from('processos')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar processo:', error)
      throw error
    }

    return NextResponse.json({
      success: true,
      message: 'Processo atualizado com sucesso',
      processo,
    })
  } catch (error) {
    console.error('Erro na API PATCH /api/processos/[id]:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar processo' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/processos/[id]
 * Remove um processo (cascade remove candidatos, funções, etc)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Deletar processo (cascade vai remover relacionados)
    const { error } = await supabase
      .from('processos')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Erro ao deletar processo:', error)
      throw error
    }

    return NextResponse.json({
      success: true,
      message: 'Processo removido com sucesso',
    })
  } catch (error) {
    console.error('Erro na API DELETE /api/processos/[id]:', error)
    return NextResponse.json(
      { error: 'Erro ao remover processo' },
      { status: 500 }
    )
  }
}
