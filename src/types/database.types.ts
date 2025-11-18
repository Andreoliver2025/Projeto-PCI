// Tipos do banco de dados

export type UserType = 'Principal' | 'Candidato' | 'Lider'
export type ProcessStatus = 'rascunho' | 'ativo' | 'finalizado' | 'arquivado'

export interface Usuario {
  id: string
  clerk_id: string
  tipo: UserType
  nome: string
  email: string
  created_at: string
  updated_at: string
}

export interface PerfilComportamental {
  id: string
  usuario_id: string

  // DISC
  disc_d: number // Dominância
  disc_i: number // Influência
  disc_s: number // Estabilidade
  disc_c: number // Conformidade

  // MBTI
  mbti_type: string // Ex: "INTJ"
  mbti_e_i: number // Extroversão vs Introversão
  mbti_s_n: number // Sensação vs Intuição
  mbti_t_f: number // Pensamento vs Sentimento
  mbti_j_p: number // Julgamento vs Percepção

  // Big5
  big5_openness: number
  big5_conscientiousness: number
  big5_extraversion: number
  big5_agreeableness: number
  big5_neuroticism: number

  // Eneagrama
  eneagrama_type: number // 1-9
  eneagrama_wing: string // Ex: "5w4"

  created_at: string
  updated_at: string
}

export interface Funcao {
  id: string
  processo_id: string
  nome: string
  descricao: string
  perfil_ideal: PerfilIdeal
  created_at: string
}

export interface PerfilIdeal {
  disc_d_min: number
  disc_d_max: number
  disc_i_min: number
  disc_i_max: number
  disc_s_min: number
  disc_s_max: number
  disc_c_min: number
  disc_c_max: number
  mbti_preferred: string[]
  big5_ranges: {
    openness: [number, number]
    conscientiousness: [number, number]
    extraversion: [number, number]
    agreeableness: [number, number]
    neuroticism: [number, number]
  }
  eneagrama_preferred: number[]
}

export interface Processo {
  id: string
  usuario_principal_id: string
  lider_id: string | null
  funcao_id: string
  nome: string
  descricao: string
  status: ProcessStatus
  created_at: string
  updated_at: string
}

export interface Candidato {
  id: string
  processo_id: string
  usuario_id: string
  perfil_comportamental_id: string
  status: 'pendente' | 'em_avaliacao' | 'aprovado' | 'reprovado'
  created_at: string
}

export interface PerguntaEmpresa {
  id: string
  processo_id: string
  ordem: number
  texto: string
  tempo_limite_segundos: number
  created_at: string
}

export interface RespostaAudio {
  id: string
  candidato_id: string
  pergunta_id: string
  arquivo_url: string
  transcricao: string
  transcricao_editada: string | null
  analise_emocional: AnaliseEmocional | null
  duracao_segundos: number
  created_at: string
}

export interface AnaliseEmocional {
  sentimento_geral: 'positivo' | 'neutro' | 'negativo'
  confianca: number // 0-100
  entusiasmo: number // 0-100
  clareza: number // 0-100
  palavras_chave: {
    palavra: string
    categoria: string
    sentimento: string
  }[]
  insights: string[]
}

export interface FitAnalise {
  id: string
  processo_id: string
  candidato_id: string

  // Scores de compatibilidade (0-100)
  score_contratante: number
  score_funcao: number
  score_lider: number | null
  score_geral: number

  // Análises detalhadas
  analise_disc: string
  analise_mbti: string
  analise_big5: string
  analise_eneagrama: string

  // Pontos fortes e fracos
  pontos_fortes: string[]
  pontos_atencao: string[]

  // Recomendação final
  recomendacao: 'forte' | 'moderada' | 'fraca' | 'nao_recomendado'
  justificativa: string

  created_at: string
}
