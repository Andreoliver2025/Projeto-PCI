import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper functions para o banco de dados
export const db = {
  // Usuários
  async getUsuario(clerkId: string) {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('clerk_id', clerkId)
      .single()

    if (error) throw error
    return data
  },

  async criarUsuario(usuario: any) {
    const { data, error } = await supabase
      .from('usuarios')
      .insert(usuario)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Processos
  async getProcessos(usuarioId: string) {
    const { data, error } = await supabase
      .from('processos')
      .select('*, funcoes(*), candidatos(count)')
      .eq('usuario_principal_id', usuarioId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async criarProcesso(processo: any) {
    const { data, error } = await supabase
      .from('processos')
      .insert(processo)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Perfis Comportamentais
  async getPerfilComportamental(usuarioId: string) {
    const { data, error } = await supabase
      .from('perfis_comportamentais')
      .select('*')
      .eq('usuario_id', usuarioId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Não encontrado
      throw error
    }
    return data
  },

  async salvarPerfilComportamental(perfil: any) {
    const { data, error } = await supabase
      .from('perfis_comportamentais')
      .upsert(perfil)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Candidatos
  async getCandidatos(processoId: string) {
    const { data, error } = await supabase
      .from('candidatos')
      .select('*, usuarios(*), perfis_comportamentais(*), fit_analises(*)')
      .eq('processo_id', processoId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async adicionarCandidato(candidato: any) {
    const { data, error } = await supabase
      .from('candidatos')
      .insert(candidato)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Perguntas
  async getPerguntas(processoId: string) {
    const { data, error } = await supabase
      .from('perguntas_empresa')
      .select('*')
      .eq('processo_id', processoId)
      .order('ordem', { ascending: true })

    if (error) throw error
    return data
  },

  async salvarPergunta(pergunta: any) {
    const { data, error } = await supabase
      .from('perguntas_empresa')
      .insert(pergunta)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Respostas em Áudio
  async getRespostas(candidatoId: string) {
    const { data, error } = await supabase
      .from('respostas_audio')
      .select('*, perguntas_empresa(*)')
      .eq('candidato_id', candidatoId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data
  },

  async salvarResposta(resposta: any) {
    const { data, error } = await supabase
      .from('respostas_audio')
      .insert(resposta)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Análises de Fit
  async getFitAnalise(processoId: string, candidatoId: string) {
    const { data, error } = await supabase
      .from('fit_analises')
      .select('*')
      .eq('processo_id', processoId)
      .eq('candidato_id', candidatoId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return data
  },

  async salvarFitAnalise(analise: any) {
    const { data, error } = await supabase
      .from('fit_analises')
      .upsert(analise)
      .select()
      .single()

    if (error) throw error
    return data
  },
}
