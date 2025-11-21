/**
 * Helper para Análise Emocional usando GPT-4
 * Analisa transcrições de áudio para extrair insights emocionais
 */

import OpenAI from 'openai'

// Inicializar OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

/**
 * Tipos para Análise Emocional
 */
export interface AnaliseEmocional {
  tom_emocional: 'positivo' | 'neutro' | 'negativo'
  nivel_confianca: number // 0-100
  nivel_entusiasmo: number // 0-100
  nivel_clareza: number // 0-100
  keywords_emocionais: string[]
  score_geral: number // 0-100
  observacoes?: string
}

/**
 * Analisa uma transcrição de áudio e extrai insights emocionais usando GPT-4
 *
 * @param transcricao - Texto transcrito do áudio do candidato
 * @returns Promise<AnaliseEmocional> - Análise emocional estruturada
 */
export async function analisarEmocao(transcricao: string): Promise<AnaliseEmocional> {
  try {
    // Validar entrada
    if (!transcricao || transcricao.trim().length === 0) {
      throw new Error('Transcrição vazia ou inválida')
    }

    // Validar API key
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY não configurada')
    }

    // Prompt estruturado para análise emocional
    const prompt = `Você é um especialista em análise emocional e comunicação. Analise a seguinte transcrição de uma resposta de entrevista e forneça uma análise emocional detalhada.

TRANSCRIÇÃO:
"""
${transcricao}
"""

Analise os seguintes aspectos e retorne APENAS um objeto JSON válido (sem explicações adicionais):

{
  "tom_emocional": "positivo" | "neutro" | "negativo",
  "nivel_confianca": 0-100,
  "nivel_entusiasmo": 0-100,
  "nivel_clareza": 0-100,
  "keywords_emocionais": ["palavra1", "palavra2", ...],
  "score_geral": 0-100,
  "observacoes": "breve observação sobre a análise"
}

CRITÉRIOS DE ANÁLISE:

1. TOM EMOCIONAL:
   - "positivo": uso de palavras otimistas, proativas, confiantes
   - "neutro": comunicação objetiva, sem grande carga emocional
   - "negativo": palavras pessimistas, defensivas, inseguras

2. NÍVEL DE CONFIANÇA (0-100):
   - 80-100: Muito confiante, assertivo, decisivo
   - 60-79: Confiante, seguro nas respostas
   - 40-59: Moderadamente confiante, algumas hesitações
   - 20-39: Pouco confiante, várias hesitações
   - 0-19: Inseguro, muito hesitante

3. NÍVEL DE ENTUSIASMO (0-100):
   - 80-100: Muito entusiasmado, energético, apaixonado
   - 60-79: Entusiasmado, demonstra interesse
   - 40-59: Moderadamente interessado
   - 20-39: Pouco entusiasmado
   - 0-19: Desinteressado ou apático

4. NÍVEL DE CLAREZA (0-100):
   - 80-100: Comunicação muito clara, estruturada, objetiva
   - 60-79: Comunicação clara e compreensível
   - 40-59: Razoavelmente clara, alguns pontos confusos
   - 20-39: Comunicação confusa ou desestruturada
   - 0-19: Muito confuso, difícil de compreender

5. KEYWORDS EMOCIONAIS:
   - Identifique 5-10 palavras-chave que revelam estado emocional
   - Inclua verbos de ação, adjetivos emocionais, expressões marcantes
   - Exemplos: "apaixonado", "desafiador", "conquistar", "receio", etc.

6. SCORE GERAL (0-100):
   - Média ponderada considerando todos os fatores
   - Pontuação holística do impacto emocional da comunicação
   - Leve em conta tom, confiança, entusiasmo e clareza

Retorne APENAS o JSON, sem markdown, sem explicações adicionais.`

    // Fazer chamada à API do GPT-4
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview', // ou 'gpt-4-0125-preview'
      messages: [
        {
          role: 'system',
          content: 'Você é um especialista em análise emocional e psicologia da comunicação. Sempre retorna JSON válido.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3, // Baixa temperatura para consistência
      max_tokens: 800,
      response_format: { type: 'json_object' }, // Garantir resposta JSON
    })

    // Extrair resposta
    const responseContent = completion.choices[0]?.message?.content

    if (!responseContent) {
      throw new Error('Resposta vazia do GPT-4')
    }

    // Parse do JSON
    const analise = JSON.parse(responseContent) as AnaliseEmocional

    // Validar estrutura da resposta
    validarAnaliseEmocional(analise)

    return analise
  } catch (error: any) {
    console.error('Erro ao analisar emoção:', error)

    // Se for erro de parsing JSON, tentar extrair manualmente
    if (error instanceof SyntaxError) {
      throw new Error('Resposta do GPT-4 não é um JSON válido')
    }

    throw new Error(`Erro na análise emocional: ${error.message}`)
  }
}

/**
 * Valida se a análise emocional retornada está bem formada
 */
function validarAnaliseEmocional(analise: any): asserts analise is AnaliseEmocional {
  const erros: string[] = []

  // Validar tom_emocional
  if (!['positivo', 'neutro', 'negativo'].includes(analise.tom_emocional)) {
    erros.push('tom_emocional deve ser "positivo", "neutro" ou "negativo"')
  }

  // Validar níveis (0-100)
  const niveis = ['nivel_confianca', 'nivel_entusiasmo', 'nivel_clareza', 'score_geral']
  niveis.forEach((nivel) => {
    const valor = analise[nivel]
    if (typeof valor !== 'number' || valor < 0 || valor > 100) {
      erros.push(`${nivel} deve ser um número entre 0 e 100`)
    }
  })

  // Validar keywords
  if (!Array.isArray(analise.keywords_emocionais)) {
    erros.push('keywords_emocionais deve ser um array')
  }

  if (erros.length > 0) {
    throw new Error(`Análise emocional inválida: ${erros.join(', ')}`)
  }
}

/**
 * Analisa múltiplas transcrições em lote
 * Útil para processar várias respostas de um candidato
 */
export async function analisarEmocaoLote(
  transcricoes: string[]
): Promise<AnaliseEmocional[]> {
  const promises = transcricoes.map((transcricao) => analisarEmocao(transcricao))
  return Promise.all(promises)
}

/**
 * Calcula análise emocional agregada de múltiplas respostas
 * Útil para ter uma visão geral do candidato
 */
export function calcularAnaliseAgregada(analises: AnaliseEmocional[]): AnaliseEmocional {
  if (analises.length === 0) {
    throw new Error('Nenhuma análise fornecida')
  }

  // Calcular médias
  const somaConfianca = analises.reduce((sum, a) => sum + a.nivel_confianca, 0)
  const somaEntusiasmo = analises.reduce((sum, a) => sum + a.nivel_entusiasmo, 0)
  const somaClareza = analises.reduce((sum, a) => sum + a.nivel_clareza, 0)
  const somaScore = analises.reduce((sum, a) => sum + a.score_geral, 0)

  const n = analises.length

  // Determinar tom predominante
  const tons = analises.map((a) => a.tom_emocional)
  const tomPredominate = tons.sort(
    (a, b) =>
      tons.filter((v) => v === a).length - tons.filter((v) => v === b).length
  )[0] as 'positivo' | 'neutro' | 'negativo'

  // Agregar keywords (top 10 mais frequentes)
  const todasKeywords = analises.flatMap((a) => a.keywords_emocionais)
  const keywordFrequencia = todasKeywords.reduce((acc, kw) => {
    acc[kw] = (acc[kw] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const topKeywords = Object.entries(keywordFrequencia)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map((entry) => entry[0])

  return {
    tom_emocional: tomPredominate,
    nivel_confianca: Math.round(somaConfianca / n),
    nivel_entusiasmo: Math.round(somaEntusiasmo / n),
    nivel_clareza: Math.round(somaClareza / n),
    score_geral: Math.round(somaScore / n),
    keywords_emocionais: topKeywords,
    observacoes: `Análise agregada de ${n} respostas`,
  }
}
