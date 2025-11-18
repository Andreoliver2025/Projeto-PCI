// Teste DISC - Versão simplificada com scoring automatizado

export interface DISCQuestion {
  id: number
  texto: string
  dimensao: 'D' | 'I' | 'S' | 'C'
}

export interface DISCResult {
  d: number // Dominância (0-100)
  i: number // Influência (0-100)
  s: number // Estabilidade (0-100)
  c: number // Conformidade (0-100)
  perfil_principal: 'D' | 'I' | 'S' | 'C'
  descricao: string
}

// Perguntas do teste DISC (versão simplificada - 20 perguntas, 5 por dimensão)
export const discQuestions: DISCQuestion[] = [
  // Dominância (D)
  { id: 1, texto: "Eu assumo o controle em situações difíceis", dimensao: 'D' },
  { id: 2, texto: "Eu gosto de desafios e competição", dimensao: 'D' },
  { id: 3, texto: "Eu tomo decisões rapidamente", dimensao: 'D' },
  { id: 4, texto: "Eu sou direto ao falar o que penso", dimensao: 'D' },
  { id: 5, texto: "Eu prefiro liderar do que seguir", dimensao: 'D' },

  // Influência (I)
  { id: 6, texto: "Eu sou entusiasmado e otimista", dimensao: 'I' },
  { id: 7, texto: "Eu gosto de trabalhar em equipe e socializar", dimensao: 'I' },
  { id: 8, texto: "Eu convence pessoas facilmente", dimensao: 'I' },
  { id: 9, texto: "Eu sou expressivo e comunicativo", dimensao: 'I' },
  { id: 10, texto: "Eu gosto de ser o centro das atenções", dimensao: 'I' },

  // Estabilidade (S)
  { id: 11, texto: "Eu prefiro rotina e previsibilidade", dimensao: 'S' },
  { id: 12, texto: "Eu sou paciente e calmo sob pressão", dimensao: 'S' },
  { id: 13, texto: "Eu valorizo harmonia e cooperação", dimensao: 'S' },
  { id: 14, texto: "Eu sou leal e confiável", dimensao: 'S' },
  { id: 15, texto: "Eu escuto mais do que falo", dimensao: 'S' },

  // Conformidade (C)
  { id: 16, texto: "Eu presto atenção a detalhes", dimensao: 'C' },
  { id: 17, texto: "Eu sigo regras e procedimentos", dimensao: 'C' },
  { id: 18, texto: "Eu analiso informações cuidadosamente antes de decidir", dimensao: 'C' },
  { id: 19, texto: "Eu valorizo precisão e qualidade", dimensao: 'C' },
  { id: 20, texto: "Eu prefiro fatos a opiniões", dimensao: 'C' },
]

// Escala Likert: 1-5 (Discordo totalmente - Concordo totalmente)
export function calcularDISC(respostas: Record<number, number>): DISCResult {
  const scores = { D: 0, I: 0, S: 0, C: 0 }

  // Somar pontos por dimensão
  discQuestions.forEach(q => {
    const resposta = respostas[q.id] || 1
    scores[q.dimensao] += resposta
  })

  // Converter para escala 0-100 (5 perguntas, máx 25 pontos = 100%)
  const result = {
    d: Math.round((scores.D / 25) * 100),
    i: Math.round((scores.I / 25) * 100),
    s: Math.round((scores.S / 25) * 100),
    c: Math.round((scores.C / 25) * 100),
  }

  // Determinar perfil principal
  const max = Math.max(result.d, result.i, result.s, result.c)
  let perfil_principal: 'D' | 'I' | 'S' | 'C' = 'D'

  if (max === result.d) perfil_principal = 'D'
  else if (max === result.i) perfil_principal = 'I'
  else if (max === result.s) perfil_principal = 'S'
  else if (max === result.c) perfil_principal = 'C'

  return {
    ...result,
    perfil_principal,
    descricao: getDescricaoDISC(perfil_principal),
  }
}

function getDescricaoDISC(perfil: 'D' | 'I' | 'S' | 'C'): string {
  const descricoes = {
    D: "Dominante: Direto, decisivo, orientado a resultados. Gosta de desafios e assume controle.",
    I: "Influente: Comunicativo, entusiasmado, persuasivo. Gosta de trabalhar com pessoas.",
    S: "Estável: Calmo, paciente, leal. Valoriza harmonia e previsibilidade.",
    C: "Conforme: Analítico, preciso, meticuloso. Valoriza qualidade e detalhes.",
  }
  return descricoes[perfil]
}
