/**
 * Cálculo de Fit Comportamental contra Perfil Ideal
 * Compara um perfil real (candidato/líder) com o perfil ideal da função
 */

import type { PerfilComportamental } from '@/types/database.types'
import type { PerfilIdeal, RangeDISC, RangeMBTI } from './tipos/perfil-ideal'

export interface FitIdealScore {
  score_geral: number // 0-100
  score_disc: number // 0-100
  score_mbti: number // 0-100
  nivel: 'alto' | 'medio' | 'baixo' // alto: 75+, medio: 50-74, baixo: <50
  detalhes: {
    disc_d: { score: number; dentro_range: boolean; valor: number; range: string }
    disc_i: { score: number; dentro_range: boolean; valor: number; range: string }
    disc_s: { score: number; dentro_range: boolean; valor: number; range: string }
    disc_c: { score: number; dentro_range: boolean; valor: number; range: string }
    mbti_e_i: { score: number; dentro_range: boolean; valor: number; range: string }
    mbti_s_n: { score: number; dentro_range: boolean; valor: number; range: string }
    mbti_t_f: { score: number; dentro_range: boolean; valor: number; range: string }
    mbti_j_p: { score: number; dentro_range: boolean; valor: number; range: string }
    mbti_tipo_match: boolean
  }
  recomendacao: string
}

/**
 * Calcula o fit de uma dimensão contra seu range ideal
 */
function calcularFitDimensao(valor: number, range: RangeDISC | RangeMBTI): number {
  // Se está dentro do range = 100%
  if (valor >= range.min && valor <= range.max) {
    return 100
  }

  // Se está fora, calcular distância ao range mais próximo
  let distancia: number
  if (valor < range.min) {
    distancia = range.min - valor
  } else {
    distancia = valor - range.max
  }

  // Penalidade proporcional (máx 100 pontos de distância)
  const penalidade = Math.min(distancia, 100)
  return Math.max(0, 100 - penalidade)
}

/**
 * Calcula o fit comportamental contra perfil ideal
 */
export function calcularFitIdeal(
  perfil: PerfilComportamental,
  ideal: PerfilIdeal
): FitIdealScore {
  // === DISC ===
  const disc_d_score = calcularFitDimensao(perfil.disc_d || 0, ideal.disc_d)
  const disc_i_score = calcularFitDimensao(perfil.disc_i || 0, ideal.disc_i)
  const disc_s_score = calcularFitDimensao(perfil.disc_s || 0, ideal.disc_s)
  const disc_c_score = calcularFitDimensao(perfil.disc_c || 0, ideal.disc_c)

  // Média ponderada DISC
  const peso_total_disc =
    ideal.disc_d.peso + ideal.disc_i.peso + ideal.disc_s.peso + ideal.disc_c.peso
  const score_disc = Math.round(
    (disc_d_score * ideal.disc_d.peso +
      disc_i_score * ideal.disc_i.peso +
      disc_s_score * ideal.disc_s.peso +
      disc_c_score * ideal.disc_c.peso) /
      peso_total_disc
  )

  // === MBTI ===
  const mbti_e_i_score = calcularFitDimensao(perfil.mbti_e_i || 50, ideal.mbti_e_i)
  const mbti_s_n_score = calcularFitDimensao(perfil.mbti_s_n || 50, ideal.mbti_s_n)
  const mbti_t_f_score = calcularFitDimensao(perfil.mbti_t_f || 50, ideal.mbti_t_f)
  const mbti_j_p_score = calcularFitDimensao(perfil.mbti_j_p || 50, ideal.mbti_j_p)

  // Média ponderada MBTI
  const peso_total_mbti =
    ideal.mbti_e_i.peso + ideal.mbti_s_n.peso + ideal.mbti_t_f.peso + ideal.mbti_j_p.peso
  const score_mbti = Math.round(
    (mbti_e_i_score * ideal.mbti_e_i.peso +
      mbti_s_n_score * ideal.mbti_s_n.peso +
      mbti_t_f_score * ideal.mbti_t_f.peso +
      mbti_j_p_score * ideal.mbti_j_p.peso) /
      peso_total_mbti
  )

  // Verificar se tipo MBTI está na lista de ideais
  const mbti_tipo_match =
    ideal.mbti_tipos_ideais?.includes(perfil.mbti_type || '') || false

  // Bonus se tipo MBTI é exatamente um dos ideais (+10 pontos no score MBTI)
  const score_mbti_final = mbti_tipo_match
    ? Math.min(100, score_mbti + 10)
    : score_mbti

  // === SCORE GERAL ===
  // DISC 60% + MBTI 40% (conforme especificação original)
  const score_geral = Math.round(score_disc * 0.6 + score_mbti_final * 0.4)

  // === NÍVEL ===
  let nivel: 'alto' | 'medio' | 'baixo'
  if (score_geral >= 75) nivel = 'alto'
  else if (score_geral >= 50) nivel = 'medio'
  else nivel = 'baixo'

  // === RECOMENDAÇÃO ===
  let recomendacao: string
  if (nivel === 'alto') {
    recomendacao = `Excelente fit para ${ideal.nome_funcao}. Perfil altamente compatível com as expectativas da função.`
  } else if (nivel === 'medio') {
    recomendacao = `Fit moderado para ${ideal.nome_funcao}. Avaliar outros aspectos e competências técnicas antes de decidir.`
  } else {
    recomendacao = `Fit baixo para ${ideal.nome_funcao}. Considerar outras funções ou avaliar se há flexibilidade nos requisitos.`
  }

  // Adicionar alerta se tipo MBTI não é ideal
  if (ideal.mbti_tipos_ideais && !mbti_tipo_match && perfil.mbti_type) {
    recomendacao += ` Atenção: tipo ${perfil.mbti_type} não está entre os tipos mais indicados para esta função.`
  }

  return {
    score_geral,
    score_disc,
    score_mbti: score_mbti_final,
    nivel,
    detalhes: {
      disc_d: {
        score: disc_d_score,
        dentro_range: perfil.disc_d! >= ideal.disc_d.min && perfil.disc_d! <= ideal.disc_d.max,
        valor: perfil.disc_d || 0,
        range: `${ideal.disc_d.min}-${ideal.disc_d.max}`,
      },
      disc_i: {
        score: disc_i_score,
        dentro_range: perfil.disc_i! >= ideal.disc_i.min && perfil.disc_i! <= ideal.disc_i.max,
        valor: perfil.disc_i || 0,
        range: `${ideal.disc_i.min}-${ideal.disc_i.max}`,
      },
      disc_s: {
        score: disc_s_score,
        dentro_range: perfil.disc_s! >= ideal.disc_s.min && perfil.disc_s! <= ideal.disc_s.max,
        valor: perfil.disc_s || 0,
        range: `${ideal.disc_s.min}-${ideal.disc_s.max}`,
      },
      disc_c: {
        score: disc_c_score,
        dentro_range: perfil.disc_c! >= ideal.disc_c.min && perfil.disc_c! <= ideal.disc_c.max,
        valor: perfil.disc_c || 0,
        range: `${ideal.disc_c.min}-${ideal.disc_c.max}`,
      },
      mbti_e_i: {
        score: mbti_e_i_score,
        dentro_range: perfil.mbti_e_i! >= ideal.mbti_e_i.min && perfil.mbti_e_i! <= ideal.mbti_e_i.max,
        valor: perfil.mbti_e_i || 50,
        range: `${ideal.mbti_e_i.min}-${ideal.mbti_e_i.max}`,
      },
      mbti_s_n: {
        score: mbti_s_n_score,
        dentro_range: perfil.mbti_s_n! >= ideal.mbti_s_n.min && perfil.mbti_s_n! <= ideal.mbti_s_n.max,
        valor: perfil.mbti_s_n || 50,
        range: `${ideal.mbti_s_n.min}-${ideal.mbti_s_n.max}`,
      },
      mbti_t_f: {
        score: mbti_t_f_score,
        dentro_range: perfil.mbti_t_f! >= ideal.mbti_t_f.min && perfil.mbti_t_f! <= ideal.mbti_t_f.max,
        valor: perfil.mbti_t_f || 50,
        range: `${ideal.mbti_t_f.min}-${ideal.mbti_t_f.max}`,
      },
      mbti_j_p: {
        score: mbti_j_p_score,
        dentro_range: perfil.mbti_j_p! >= ideal.mbti_j_p.min && perfil.mbti_j_p! <= ideal.mbti_j_p.max,
        valor: perfil.mbti_j_p || 50,
        range: `${ideal.mbti_j_p.min}-${ideal.mbti_j_p.max}`,
      },
      mbti_tipo_match,
    },
    recomendacao,
  }
}

/**
 * Gera relatório visual de fit ideal
 */
export function gerarRelatorioFitIdeal(fit: FitIdealScore): string {
  const { detalhes } = fit

  let relatorio = `📊 RELATÓRIO DE FIT COMPORTAMENTAL\n\n`
  relatorio += `Score Geral: ${fit.score_geral}/100 (${fit.nivel.toUpperCase()})\n`
  relatorio += `DISC: ${fit.score_disc}/100 | MBTI: ${fit.score_mbti}/100\n\n`

  relatorio += `--- DISC ---\n`
  relatorio += `Dominância (D): ${detalhes.disc_d.valor} → Range ${detalhes.disc_d.range} ${detalhes.disc_d.dentro_range ? '✅' : '❌'} (${detalhes.disc_d.score}%)\n`
  relatorio += `Influência (I): ${detalhes.disc_i.valor} → Range ${detalhes.disc_i.range} ${detalhes.disc_i.dentro_range ? '✅' : '❌'} (${detalhes.disc_i.score}%)\n`
  relatorio += `Estabilidade (S): ${detalhes.disc_s.valor} → Range ${detalhes.disc_s.range} ${detalhes.disc_s.dentro_range ? '✅' : '❌'} (${detalhes.disc_s.score}%)\n`
  relatorio += `Conformidade (C): ${detalhes.disc_c.valor} → Range ${detalhes.disc_c.range} ${detalhes.disc_c.dentro_range ? '✅' : '❌'} (${detalhes.disc_c.score}%)\n\n`

  relatorio += `--- MBTI ---\n`
  relatorio += `E-I: ${detalhes.mbti_e_i.valor} → Range ${detalhes.mbti_e_i.range} ${detalhes.mbti_e_i.dentro_range ? '✅' : '❌'} (${detalhes.mbti_e_i.score}%)\n`
  relatorio += `S-N: ${detalhes.mbti_s_n.valor} → Range ${detalhes.mbti_s_n.range} ${detalhes.mbti_s_n.dentro_range ? '✅' : '❌'} (${detalhes.mbti_s_n.score}%)\n`
  relatorio += `T-F: ${detalhes.mbti_t_f.valor} → Range ${detalhes.mbti_t_f.range} ${detalhes.mbti_t_f.dentro_range ? '✅' : '❌'} (${detalhes.mbti_t_f.score}%)\n`
  relatorio += `J-P: ${detalhes.mbti_j_p.valor} → Range ${detalhes.mbti_j_p.range} ${detalhes.mbti_j_p.dentro_range ? '✅' : '❌'} (${detalhes.mbti_j_p.score}%)\n`
  relatorio += `Tipo ideal: ${detalhes.mbti_tipo_match ? '✅ Match' : '❌ Fora dos tipos ideais'}\n\n`

  relatorio += `💡 RECOMENDAÇÃO:\n${fit.recomendacao}\n`

  return relatorio
}
