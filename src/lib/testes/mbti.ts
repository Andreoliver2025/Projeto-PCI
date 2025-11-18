// Teste MBTI - Versão simplificada com scoring automatizado

export interface MBTIQuestion {
  id: number
  texto: string
  dimensao: 'E-I' | 'S-N' | 'T-F' | 'J-P'
  direcao: 'A' | 'B' // A = primeiro da dupla (E, S, T, J), B = segundo (I, N, F, P)
}

export interface MBTIResult {
  tipo: string // Ex: "INTJ"
  e_i: number // 0-100 (0 = muito I, 100 = muito E)
  s_n: number // 0-100 (0 = muito S, 100 = muito N)
  t_f: number // 0-100 (0 = muito T, 100 = muito F)
  j_p: number // 0-100 (0 = muito J, 100 = muito P)
  descricao: string
}

// Perguntas do teste MBTI (versão simplificada - 16 perguntas, 4 por dimensão)
export const mbtiQuestions: MBTIQuestion[] = [
  // Extroversão (E) vs Introversão (I)
  { id: 1, texto: "Eu ganho energia estando com pessoas", dimensao: 'E-I', direcao: 'A' },
  { id: 2, texto: "Eu prefiro trabalhar sozinho", dimensao: 'E-I', direcao: 'B' },
  { id: 3, texto: "Eu sou expansivo e falo facilmente com estranhos", dimensao: 'E-I', direcao: 'A' },
  { id: 4, texto: "Eu preciso de tempo sozinho para recarregar", dimensao: 'E-I', direcao: 'B' },

  // Sensação (S) vs Intuição (N)
  { id: 5, texto: "Eu foco em fatos e detalhes concretos", dimensao: 'S-N', direcao: 'A' },
  { id: 6, texto: "Eu gosto de pensar em possibilidades futuras", dimensao: 'S-N', direcao: 'B' },
  { id: 7, texto: "Eu confio mais na experiência prática", dimensao: 'S-N', direcao: 'A' },
  { id: 8, texto: "Eu sou imaginativo e criativo", dimensao: 'S-N', direcao: 'B' },

  // Pensamento (T) vs Sentimento (F)
  { id: 9, texto: "Eu tomo decisões baseadas em lógica", dimensao: 'T-F', direcao: 'A' },
  { id: 10, texto: "Eu considero como as pessoas se sentirão", dimensao: 'T-F', direcao: 'B' },
  { id: 11, texto: "Eu valorizo verdade e justiça acima de harmonia", dimensao: 'T-F', direcao: 'A' },
  { id: 12, texto: "Eu sou empático e compreensivo", dimensao: 'T-F', direcao: 'B' },

  // Julgamento (J) vs Percepção (P)
  { id: 13, texto: "Eu gosto de planejar e ter tudo organizado", dimensao: 'J-P', direcao: 'A' },
  { id: 14, texto: "Eu prefiro manter opções em aberto", dimensao: 'J-P', direcao: 'B' },
  { id: 15, texto: "Eu cumpro prazos com antecedência", dimensao: 'J-P', direcao: 'A' },
  { id: 16, texto: "Eu sou espontâneo e flexível", dimensao: 'J-P', direcao: 'B' },
]

// Escala Likert: 1-5
export function calcularMBTI(respostas: Record<number, number>): MBTIResult {
  const scores = {
    'E-I': { A: 0, B: 0 },
    'S-N': { A: 0, B: 0 },
    'T-F': { A: 0, B: 0 },
    'J-P': { A: 0, B: 0 },
  }

  // Somar pontos
  mbtiQuestions.forEach(q => {
    const resposta = respostas[q.id] || 3
    scores[q.dimensao][q.direcao] += resposta
  })

  // Calcular percentuais (0-100, onde 50 = neutro)
  const calcPercentual = (a: number, b: number) => {
    const total = a + b
    return Math.round((a / total) * 100)
  }

  const e_i = calcPercentual(scores['E-I'].A, scores['E-I'].B)
  const s_n = calcPercentual(scores['S-N'].A, scores['S-N'].B)
  const t_f = calcPercentual(scores['T-F'].A, scores['T-F'].B)
  const j_p = calcPercentual(scores['J-P'].A, scores['J-P'].B)

  // Determinar tipo (usar 50 como threshold)
  const tipo =
    (e_i >= 50 ? 'E' : 'I') +
    (s_n >= 50 ? 'S' : 'N') +
    (t_f >= 50 ? 'T' : 'F') +
    (j_p >= 50 ? 'J' : 'P')

  return {
    tipo,
    e_i,
    s_n,
    t_f,
    j_p,
    descricao: getDescricaoMBTI(tipo),
  }
}

function getDescricaoMBTI(tipo: string): string {
  const descricoes: Record<string, string> = {
    'INTJ': "O Arquiteto: Estratégico, independente, inovador. Confia em lógica e planejamento.",
    'INTP': "O Lógico: Analítico, criativo, flexível. Busca entender sistemas complexos.",
    'ENTJ': "O Comandante: Líder natural, decisivo, estratégico. Orientado a metas.",
    'ENTP': "O Inovador: Criativo, persuasivo, questionador. Gosta de debates e novidades.",
    'INFJ': "O Conselheiro: Empático, idealista, organizado. Busca significado profundo.",
    'INFP': "O Mediador: Idealista, criativo, empático. Guiado por valores pessoais.",
    'ENFJ': "O Protagonista: Carismático, inspirador, organizado. Líder empático.",
    'ENFP': "O Ativista: Entusiasta, criativo, sociável. Busca possibilidades e conexões.",
    'ISTJ': "O Logístico: Responsável, detalhista, prático. Valoriza tradição e ordem.",
    'ISFJ': "O Defensor: Leal, dedicado, prestativo. Busca harmonia e segurança.",
    'ESTJ': "O Executivo: Organizado, prático, decisivo. Valoriza eficiência e ordem.",
    'ESFJ': "O Cônsul: Sociável, prestativo, organizado. Busca harmonia e cooperação.",
    'ISTP': "O Virtuoso: Prático, adaptável, observador. Gosta de resolver problemas.",
    'ISFP': "O Aventureiro: Artístico, sensível, flexível. Valoriza experiências estéticas.",
    'ESTP': "O Empreendedor: Enérgico, pragmático, direto. Gosta de ação e resultados.",
    'ESFP': "O Animador: Entusiasmado, sociável, espontâneo. Vive o momento.",
  }

  return descricoes[tipo] || `Tipo ${tipo}: Perfil único e valioso.`
}
