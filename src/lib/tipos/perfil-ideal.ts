/**
 * Tipos para Perfil Ideal de Função
 * Define os ranges esperados para cada dimensão comportamental
 */

export interface RangeDISC {
  min: number // 0-100
  max: number // 0-100
  peso: number // 0-1 (importância dessa dimensão)
}

export interface RangeMBTI {
  min: number // 0-100
  max: number // 0-100
  peso: number // 0-1
}

export interface PerfilIdeal {
  // DISC ranges
  disc_d: RangeDISC
  disc_i: RangeDISC
  disc_s: RangeDISC
  disc_c: RangeDISC

  // MBTI ranges
  mbti_e_i: RangeMBTI // E (100) ← → I (0)
  mbti_s_n: RangeMBTI // S (100) ← → N (0)
  mbti_t_f: RangeMBTI // T (100) ← → F (0)
  mbti_j_p: RangeMBTI // J (100) ← → P (0)

  // Tipos MBTI preferenciais (ordenados por prioridade)
  mbti_tipos_ideais?: string[] // Ex: ["ENTJ", "ESTJ", "INTJ"]

  // Big5 ranges (opcional para fase futura)
  big5_openness?: RangeDISC
  big5_conscientiousness?: RangeDISC
  big5_extraversion?: RangeDISC
  big5_agreeableness?: RangeDISC
  big5_neuroticism?: RangeDISC

  // Metadata
  nome_funcao: string
  descricao?: string
  created_at?: string
}

/**
 * Perfis ideais pré-configurados por tipo de função
 */
export const PERFIS_IDEAIS_TEMPLATE: Record<string, PerfilIdeal> = {
  vendedor: {
    nome_funcao: 'Vendedor',
    descricao: 'Perfil ideal para funções comerciais que exigem persuasão e relacionamento',
    // Alta Influência e Dominância
    disc_d: { min: 60, max: 90, peso: 0.8 },
    disc_i: { min: 70, max: 100, peso: 1.0 }, // Mais importante
    disc_s: { min: 30, max: 60, peso: 0.5 },
    disc_c: { min: 20, max: 50, peso: 0.4 },
    // Extrovertido, Intuitivo
    mbti_e_i: { min: 60, max: 100, peso: 1.0 }, // E
    mbti_s_n: { min: 40, max: 80, peso: 0.6 },
    mbti_t_f: { min: 30, max: 70, peso: 0.5 },
    mbti_j_p: { min: 40, max: 80, peso: 0.6 },
    mbti_tipos_ideais: ['ENFP', 'ENTP', 'ESFP', 'ESTP'],
  },

  analista: {
    nome_funcao: 'Analista de Dados',
    descricao: 'Perfil ideal para funções analíticas que exigem precisão e atenção aos detalhes',
    // Alta Conformidade e Estabilidade
    disc_d: { min: 30, max: 60, peso: 0.5 },
    disc_i: { min: 20, max: 50, peso: 0.4 },
    disc_s: { min: 60, max: 90, peso: 0.8 },
    disc_c: { min: 70, max: 100, peso: 1.0 }, // Mais importante
    // Introvertido, Sensorial, Pensador
    mbti_e_i: { min: 0, max: 40, peso: 0.7 }, // I
    mbti_s_n: { min: 60, max: 100, peso: 0.8 }, // S
    mbti_t_f: { min: 60, max: 100, peso: 1.0 }, // T
    mbti_j_p: { min: 60, max: 100, peso: 0.8 }, // J
    mbti_tipos_ideais: ['ISTJ', 'INTJ', 'ISTP', 'INTP'],
  },

  lider: {
    nome_funcao: 'Líder de Equipe',
    descricao: 'Perfil ideal para liderança que inspira e direciona equipes',
    // Alta Dominância e Influência equilibradas
    disc_d: { min: 70, max: 95, peso: 1.0 }, // Mais importante
    disc_i: { min: 60, max: 90, peso: 0.9 },
    disc_s: { min: 40, max: 70, peso: 0.6 },
    disc_c: { min: 40, max: 70, peso: 0.6 },
    // Extrovertido, Julgador
    mbti_e_i: { min: 60, max: 100, peso: 0.9 }, // E
    mbti_s_n: { min: 40, max: 80, peso: 0.6 },
    mbti_t_f: { min: 50, max: 90, peso: 0.7 },
    mbti_j_p: { min: 60, max: 100, peso: 0.8 }, // J
    mbti_tipos_ideais: ['ENTJ', 'ESTJ', 'ENFJ', 'ENTP'],
  },

  atendimento: {
    nome_funcao: 'Atendimento ao Cliente',
    descricao: 'Perfil ideal para funções de suporte que exigem empatia e paciência',
    // Alta Estabilidade e Influência
    disc_d: { min: 30, max: 60, peso: 0.5 },
    disc_i: { min: 65, max: 95, peso: 0.9 },
    disc_s: { min: 70, max: 100, peso: 1.0 }, // Mais importante
    disc_c: { min: 40, max: 70, peso: 0.6 },
    // Extrovertido, Sentimental
    mbti_e_i: { min: 55, max: 100, peso: 0.8 }, // E
    mbti_s_n: { min: 50, max: 90, peso: 0.6 },
    mbti_t_f: { min: 0, max: 50, peso: 0.9 }, // F
    mbti_j_p: { min: 40, max: 80, peso: 0.5 },
    mbti_tipos_ideais: ['ESFJ', 'ENFJ', 'ISFJ', 'ESFP'],
  },

  desenvolvedor: {
    nome_funcao: 'Desenvolvedor de Software',
    descricao: 'Perfil ideal para funções técnicas que exigem lógica e autonomia',
    // Alta Conformidade e moderada Dominância
    disc_d: { min: 50, max: 80, peso: 0.7 },
    disc_i: { min: 20, max: 50, peso: 0.4 },
    disc_s: { min: 50, max: 80, peso: 0.6 },
    disc_c: { min: 65, max: 95, peso: 1.0 }, // Mais importante
    // Introvertido, Intuitivo, Pensador
    mbti_e_i: { min: 0, max: 50, peso: 0.6 }, // I
    mbti_s_n: { min: 0, max: 50, peso: 0.8 }, // N
    mbti_t_f: { min: 60, max: 100, peso: 1.0 }, // T
    mbti_j_p: { min: 30, max: 80, peso: 0.5 },
    mbti_tipos_ideais: ['INTJ', 'INTP', 'ISTJ', 'ISTP'],
  },

  rh: {
    nome_funcao: 'Recursos Humanos',
    descricao: 'Perfil ideal para RH que equilibra empatia e estrutura',
    // Equilibrado com ênfase em Influência e Estabilidade
    disc_d: { min: 40, max: 70, peso: 0.6 },
    disc_i: { min: 65, max: 95, peso: 0.9 },
    disc_s: { min: 60, max: 90, peso: 0.9 },
    disc_c: { min: 50, max: 80, peso: 0.7 },
    // Extrovertido, Sentimental, Julgador
    mbti_e_i: { min: 55, max: 100, peso: 0.8 }, // E
    mbti_s_n: { min: 40, max: 80, peso: 0.6 },
    mbti_t_f: { min: 0, max: 50, peso: 0.9 }, // F
    mbti_j_p: { min: 55, max: 100, peso: 0.7 }, // J
    mbti_tipos_ideais: ['ENFJ', 'ESFJ', 'INFJ', 'ISFJ'],
  },
}

/**
 * Cria um perfil ideal vazio com valores padrão
 */
export function criarPerfilIdealVazio(nomeFuncao: string): PerfilIdeal {
  return {
    nome_funcao: nomeFuncao,
    disc_d: { min: 0, max: 100, peso: 0.5 },
    disc_i: { min: 0, max: 100, peso: 0.5 },
    disc_s: { min: 0, max: 100, peso: 0.5 },
    disc_c: { min: 0, max: 100, peso: 0.5 },
    mbti_e_i: { min: 0, max: 100, peso: 0.5 },
    mbti_s_n: { min: 0, max: 100, peso: 0.5 },
    mbti_t_f: { min: 0, max: 100, peso: 0.5 },
    mbti_j_p: { min: 0, max: 100, peso: 0.5 },
  }
}

/**
 * Valida se um perfil ideal está bem formado
 */
export function validarPerfilIdeal(perfil: PerfilIdeal): { valido: boolean; erros: string[] } {
  const erros: string[] = []

  // Validar DISC
  const dimensoesDISC: Array<keyof Pick<PerfilIdeal, 'disc_d' | 'disc_i' | 'disc_s' | 'disc_c'>> = [
    'disc_d',
    'disc_i',
    'disc_s',
    'disc_c',
  ]
  dimensoesDISC.forEach((dim) => {
    const range = perfil[dim]
    if (range.min < 0 || range.min > 100) erros.push(`${dim}.min deve estar entre 0 e 100`)
    if (range.max < 0 || range.max > 100) erros.push(`${dim}.max deve estar entre 0 e 100`)
    if (range.min > range.max) erros.push(`${dim}.min não pode ser maior que max`)
    if (range.peso < 0 || range.peso > 1) erros.push(`${dim}.peso deve estar entre 0 e 1`)
  })

  // Validar MBTI
  const dimensoesMBTI: Array<keyof Pick<PerfilIdeal, 'mbti_e_i' | 'mbti_s_n' | 'mbti_t_f' | 'mbti_j_p'>> = [
    'mbti_e_i',
    'mbti_s_n',
    'mbti_t_f',
    'mbti_j_p',
  ]
  dimensoesMBTI.forEach((dim) => {
    const range = perfil[dim]
    if (range.min < 0 || range.min > 100) erros.push(`${dim}.min deve estar entre 0 e 100`)
    if (range.max < 0 || range.max > 100) erros.push(`${dim}.max deve estar entre 0 e 100`)
    if (range.min > range.max) erros.push(`${dim}.min não pode ser maior que max`)
    if (range.peso < 0 || range.peso > 1) erros.push(`${dim}.peso deve estar entre 0 e 1`)
  })

  return {
    valido: erros.length === 0,
    erros,
  }
}
