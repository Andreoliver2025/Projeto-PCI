import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * PATCH /api/perguntas/[id]
 * Editar pergunta
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
    const { texto, tempo_limite_segundos, ordem } = body

    // Validação
    if (!texto && !tempo_limite_segundos && ordem === undefined) {
      return NextResponse.json(
        { error: 'Nenhum campo para atualizar' },
        { status: 400 }
      )
    }

    // Construir objeto de atualização
    const updates: any = {}
    if (texto !== undefined) updates.texto = texto.trim()
    if (tempo_limite_segundos !== undefined) updates.tempo_limite_segundos = tempo_limite_segundos
    if (ordem !== undefined) updates.ordem = ordem

    // Atualizar pergunta
    const { data: pergunta, error } = await supabase
      .from('perguntas_empresa')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ pergunta })
  } catch (error: any) {
    console.error('Erro ao atualizar pergunta:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/perguntas/[id]
 * Remover pergunta
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

    // Buscar pergunta para reordenar depois
    const { data: pergunta } = await supabase
      .from('perguntas_empresa')
      .select('processo_id, ordem')
      .eq('id', params.id)
      .single()

    if (!pergunta) {
      return NextResponse.json(
        { error: 'Pergunta não encontrada' },
        { status: 404 }
      )
    }

    // Deletar pergunta
    const { error: deleteError } = await supabase
      .from('perguntas_empresa')
      .delete()
      .eq('id', params.id)

    if (deleteError) throw deleteError

    // Reordenar perguntas (decrementar ordem das posteriores)
    await supabase
      .rpc('reordenar_perguntas_apos_delecao', {
        p_processo_id: pergunta.processo_id,
        p_ordem_deletada: pergunta.ordem
      })
      .then(() => {
        // RPC pode não existir, então fazemos manualmente
      })
      .catch(async () => {
        // Fallback: buscar e atualizar manualmente
        const { data: perguntasPosteriores } = await supabase
          .from('perguntas_empresa')
          .select('id, ordem')
          .eq('processo_id', pergunta.processo_id)
          .gt('ordem', pergunta.ordem)

        if (perguntasPosteriores) {
          for (const p of perguntasPosteriores) {
            await supabase
              .from('perguntas_empresa')
              .update({ ordem: p.ordem - 1 })
              .eq('id', p.id)
          }
        }
      })

    return NextResponse.json({ message: 'Pergunta removida com sucesso' })
  } catch (error: any) {
    console.error('Erro ao remover pergunta:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
