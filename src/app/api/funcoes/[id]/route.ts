import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * GET /api/funcoes/[id]
 * Retorna os detalhes de uma função
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: funcao, error } = await supabase
      .from('funcoes')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) throw error
    if (!funcao) {
      return NextResponse.json({ error: 'Função não encontrada' }, { status: 404 })
    }

    return NextResponse.json({ funcao })
  } catch (error) {
    console.error('Erro ao buscar função:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar função' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/funcoes/[id]
 * Atualiza o perfil ideal de uma função
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

    const body = await req.json()
    const { perfil_ideal, nome, descricao } = body

    // Validações
    if (!perfil_ideal && !nome && !descricao) {
      return NextResponse.json(
        { error: 'Nenhum campo para atualizar' },
        { status: 400 }
      )
    }

    // Construir objeto de atualização
    const updates: any = {}
    if (perfil_ideal) updates.perfil_ideal = perfil_ideal
    if (nome) updates.nome = nome
    if (descricao) updates.descricao = descricao

    // Atualizar função
    const { data: funcao, error } = await supabase
      .from('funcoes')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      message: 'Função atualizada com sucesso',
      funcao,
    })
  } catch (error) {
    console.error('Erro ao atualizar função:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar função' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/funcoes/[id]
 * Remove uma função
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('funcoes')
      .delete()
      .eq('id', params.id)

    if (error) throw error

    return NextResponse.json({
      message: 'Função removida com sucesso',
    })
  } catch (error) {
    console.error('Erro ao remover função:', error)
    return NextResponse.json(
      { error: 'Erro ao remover função' },
      { status: 500 }
    )
  }
}
