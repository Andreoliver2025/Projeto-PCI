import { NextRequest, NextResponse } from 'next/server'
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
 * POST /api/perfis/candidato
 * Cria perfil para candidato através de convite (não requer autenticação)
 *
 * Body: {
 *   convite_token: string,
 *   disc_d, disc_i, disc_s, disc_c,
 *   mbti_type, mbti_e_i, mbti_s_n, mbti_t_f, mbti_j_p
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      convite_token,
      disc_d,
      disc_i,
      disc_s,
      disc_c,
      mbti_type,
      mbti_e_i,
      mbti_s_n,
      mbti_t_f,
      mbti_j_p,
    } = body

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

    // 2. Verificar se convite expirou
    const expiresAt = new Date(convite.expires_at)
    const now = new Date()

    if (now > expiresAt) {
      return NextResponse.json(
        { error: 'Convite expirado' },
        { status: 410 }
      )
    }

    // 3. Buscar ou criar usuário
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

    // 4. Criar ou atualizar perfil comportamental
    const perfilData: any = {
      usuario_id: usuarioId,
      updated_at: new Date().toISOString(),
    }

    // Adicionar dados DISC se fornecidos
    if (disc_d !== undefined) perfilData.disc_d = disc_d
    if (disc_i !== undefined) perfilData.disc_i = disc_i
    if (disc_s !== undefined) perfilData.disc_s = disc_s
    if (disc_c !== undefined) perfilData.disc_c = disc_c

    // Adicionar dados MBTI se fornecidos
    if (mbti_type !== undefined) perfilData.mbti_type = mbti_type
    if (mbti_e_i !== undefined) perfilData.mbti_e_i = mbti_e_i
    if (mbti_s_n !== undefined) perfilData.mbti_s_n = mbti_s_n
    if (mbti_t_f !== undefined) perfilData.mbti_t_f = mbti_t_f
    if (mbti_j_p !== undefined) perfilData.mbti_j_p = mbti_j_p

    // Verificar se já existe perfil para este usuário
    const { data: perfilExistente } = await supabase
      .from('perfis_comportamentais')
      .select('id')
      .eq('usuario_id', usuarioId)
      .single()

    let perfil

    if (perfilExistente) {
      // Atualizar perfil existente
      const { data, error } = await supabase
        .from('perfis_comportamentais')
        .update(perfilData)
        .eq('usuario_id', usuarioId)
        .select()
        .single()

      if (error) {
        console.error('Erro ao atualizar perfil:', error)
        throw error
      }

      perfil = data
    } else {
      // Criar novo perfil
      perfilData.created_at = new Date().toISOString()

      const { data, error } = await supabase
        .from('perfis_comportamentais')
        .insert([perfilData])
        .select()
        .single()

      if (error) {
        console.error('Erro ao criar perfil:', error)
        throw error
      }

      perfil = data
    }

    // 5. Criar ou atualizar candidato
    const { data: candidatoExistente } = await supabase
      .from('candidatos')
      .select('id')
      .eq('email', convite.email)
      .eq('processo_id', convite.processo_id)
      .single()

    let candidato

    if (candidatoExistente) {
      // Atualizar candidato existente
      const { data, error } = await supabase
        .from('candidatos')
        .update({
          perfil_comportamental_id: perfil.id,
          status: 'em_avaliacao',
        })
        .eq('id', candidatoExistente.id)
        .select()
        .single()

      if (error) {
        console.error('Erro ao atualizar candidato:', error)
        throw error
      }

      candidato = data
    } else {
      // Criar novo candidato
      const { data, error } = await supabase
        .from('candidatos')
        .insert({
          processo_id: convite.processo_id,
          usuario_id: usuarioId,
          email: convite.email,
          perfil_comportamental_id: perfil.id,
          status: 'em_avaliacao',
        })
        .select()
        .single()

      if (error) {
        console.error('Erro ao criar candidato:', error)
        throw error
      }

      candidato = data
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

    // 7. Calcular fit automaticamente se o perfil estiver completo (DISC e MBTI)
    let fitAnalise = null
    const perfilCompleto = perfil.disc_d !== null && perfil.disc_d !== undefined &&
                          perfil.mbti_type !== null && perfil.mbti_type !== undefined

    if (perfilCompleto && candidato) {
      try {
        // Buscar função com perfil ideal
        const { data: funcoes } = await supabase
          .from('funcoes')
          .select('*')
          .eq('processo_id', convite.processo_id)
          .limit(1)

        if (funcoes && funcoes.length > 0) {
          const funcao = funcoes[0]

          // Calcular fit com perfil ideal
          const fitIdeal = calcularFitIdeal(perfil, funcao.perfil_ideal)

          // Calcular fit com líder (se houver)
          let fitLider = null
          let scoreLider = null

          const { data: processo } = await supabase
            .from('processos')
            .select('lider_id')
            .eq('id', convite.processo_id)
            .single()

          if (processo?.lider_id) {
            const { data: liderPerfil } = await supabase
              .from('perfis_comportamentais')
              .select('*')
              .eq('usuario_id', processo.lider_id)
              .single()

            if (liderPerfil) {
              fitLider = calcularFit(perfil, liderPerfil)
              scoreLider = fitLider.score_geral
            }
          }

          // Calcular score geral (média ponderada)
          const scoreGeral = fitLider
            ? Math.round((fitIdeal.score_geral * 0.6 + scoreLider * 0.4))
            : fitIdeal.score_geral

          // Gerar recomendação
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

          // Salvar análise no banco
          const analiseData = {
            candidato_id: candidato.id,
            processo_id: convite.processo_id,
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

          if (!analiseError && analise) {
            fitAnalise = analise
            console.log('Fit calculado automaticamente:', fitAnalise)
          } else {
            console.error('Erro ao salvar análise de fit:', analiseError)
          }
        }
      } catch (fitError) {
        console.error('Erro ao calcular fit:', fitError)
        // Não falhar a request se o fit calculation falhar
      }
    }

    return NextResponse.json({
      success: true,
      perfil,
      candidato,
      fitAnalise,
      message: perfilCompleto && fitAnalise
        ? 'Perfil, candidato e fit criados com sucesso'
        : 'Perfil e candidato criados com sucesso',
    })
  } catch (error) {
    console.error('Erro na API POST /api/perfis/candidato:', error)
    return NextResponse.json(
      { error: 'Erro ao criar perfil do candidato' },
      { status: 500 }
    )
  }
}
