// Item 10 do Build Sequence: Cálculo de fit entre perfis

import { PerfilComportamental } from '@/types/database.types'

export interface FitScore {
  score_geral: number
  score_disc: number
  score_mbti: number
  detalhes: {
    disc_match: {
      d: number
      i: number
      s: number
      c: number
    }
    mbti_match: {
      e_i: number
      s_n: number
      t_f: number
      j_p: number
    }
  }
  nivel: 'alto' | 'medio' | 'baixo'
  recomendacao: string
}

export function calcularFit(
  perfil1: PerfilComportamental,
  perfil2: PerfilComportamental
): FitScore {
  // Calcular similaridade DISC (0-100)
  const disc_d = 100 - Math.abs(perfil1.disc_d - perfil2.disc_d)
  const disc_i = 100 - Math.abs(perfil1.disc_i - perfil2.disc_i)
  const disc_s = 100 - Math.abs(perfil1.disc_s - perfil2.disc_s)
  const disc_c = 100 - Math.abs(perfil1.disc_c - perfil2.disc_c)

  const score_disc = Math.round((disc_d + disc_i + disc_s + disc_c) / 4)

  // Calcular similaridade MBTI (0-100)
  const mbti_e_i = 100 - Math.abs(perfil1.mbti_e_i - perfil2.mbti_e_i)
  const mbti_s_n = 100 - Math.abs(perfil1.mbti_s_n - perfil2.mbti_s_n)
  const mbti_t_f = 100 - Math.abs(perfil1.mbti_t_f - perfil2.mbti_t_f)
  const mbti_j_p = 100 - Math.abs(perfil1.mbti_j_p - perfil2.mbti_j_p)

  const score_mbti = Math.round((mbti_e_i + mbti_s_n + mbti_t_f + mbti_j_p) / 4)

  // Score geral (média ponderada: DISC 60%, MBTI 40%)
  const score_geral = Math.round(score_disc * 0.6 + score_mbti * 0.4)

  // Determinar nível
  let nivel: 'alto' | 'medio' | 'baixo'
  let recomendacao: string

  if (score_geral >= 75) {
    nivel = 'alto'
    recomendacao = 'Excelente compatibilidade comportamental. Perfis muito alinhados.'
  } else if (score_geral >= 50) {
    nivel = 'medio'
    recomendacao = 'Boa compatibilidade. Algumas diferenças podem ser complementares.'
  } else {
    nivel = 'baixo'
    recomendacao = 'Compatibilidade moderada. Diferenças significativas nos perfis.'
  }

  return {
    score_geral,
    score_disc,
    score_mbti,
    detalhes: {
      disc_match: {
        d: Math.round(disc_d),
        i: Math.round(disc_i),
        s: Math.round(disc_s),
        c: Math.round(disc_c),
      },
      mbti_match: {
        e_i: Math.round(mbti_e_i),
        s_n: Math.round(mbti_s_n),
        t_f: Math.round(mbti_t_f),
        j_p: Math.round(mbti_j_p),
      },
    },
    nivel,
    recomendacao,
  }
}

export function gerarRelatorioFit(
  perfilContratante: PerfilComportamental,
  perfilCandidato: PerfilComportamental,
  nomeCandidato: string
): string {
  const fit = calcularFit(perfilContratante, perfilCandidato)

  return `
# Relatório de Fit Comportamental

**Candidato:** ${nomeCandidato}
**Data:** ${new Date().toLocaleDateString('pt-BR')}

---

## Score Geral: ${fit.score_geral}/100 (${fit.nivel.toUpperCase()})

${fit.recomendacao}

---

## Análise DISC (Score: ${fit.score_disc}/100)

**Compatibilidade por dimensão:**
- Dominância (D): ${fit.detalhes.disc_match.d}%
- Influência (I): ${fit.detalhes.disc_match.i}%
- Estabilidade (S): ${fit.detalhes.disc_match.s}%
- Conformidade (C): ${fit.detalhes.disc_match.c}%

**Interpretação:**
${fit.score_disc >= 75 ? 'Perfis DISC muito alinhados. Estilos de trabalho compatíveis.' :
  fit.score_disc >= 50 ? 'Boa compatibilidade DISC. Algumas diferenças podem gerar sinergia.' :
  'Perfis DISC distintos. Pode haver desafios de comunicação e estilo de trabalho.'}

---

## Análise MBTI (Score: ${fit.score_mbti}/100)

**Compatibilidade por dimensão:**
- Extroversão/Introversão: ${fit.detalhes.mbti_match.e_i}%
- Sensação/Intuição: ${fit.detalhes.mbti_match.s_n}%
- Pensamento/Sentimento: ${fit.detalhes.mbti_match.t_f}%
- Julgamento/Percepção: ${fit.detalhes.mbti_match.j_p}%

**Tipos:**
- Contratante: ${perfilContratante.mbti_type}
- Candidato: ${perfilCandidato.mbti_type}

**Interpretação:**
${fit.score_mbti >= 75 ? 'Tipos de personalidade muito compatíveis.' :
  fit.score_mbti >= 50 ? 'Personalidades complementares com boa sinergia.' :
  'Tipos de personalidade bastante diferentes. Requer adaptação mútua.'}

---

## Recomendação Final

${fit.nivel === 'alto' ? `
✅ **RECOMENDADO FORTEMENTE**

Este candidato apresenta excelente fit comportamental com você. A compatibilidade é alta tanto no DISC quanto no MBTI, indicando:
- Comunicação fluida
- Valores e estilos de trabalho alinhados
- Baixo risco de conflitos comportamentais
- Alta probabilidade de engajamento a longo prazo
` : fit.nivel === 'medio' ? `
⚠️ **RECOMENDADO COM RESSALVAS**

Este candidato apresenta boa compatibilidade geral, mas existem algumas diferenças comportamentais:
- Pode haver necessidade de adaptação inicial
- Diferenças podem ser complementares se bem gerenciadas
- Recomenda-se entrevista focada em fit cultural
- Avalie alinhamento de valores e expectativas
` : `
🔶 **AVALIAÇÃO CUIDADOSA NECESSÁRIA**

Este candidato apresenta diferenças comportamentais significativas:
- Estilos de trabalho e comunicação distintos
- Maior potencial para conflitos ou mal-entendidos
- Requer forte alinhamento em outros aspectos (técnico, cultural)
- Considere se as diferenças podem ser complementares ou problemáticas
`}

---

**Observação:** Este relatório é baseado em testes comportamentais e deve ser usado como uma das ferramentas de avaliação, não como critério único de decisão.
  `.trim()
}
