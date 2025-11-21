'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { mbtiQuestions, calcularMBTI, type MBTIResult } from '@/lib/testes/mbti'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'

export default function TesteMBTI() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const processoId = searchParams.get('processo')
  const conviteToken = searchParams.get('convite')

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [respostas, setRespostas] = useState<Record<number, number>>({})
  const [resultado, setResultado] = useState<MBTIResult | null>(null)
  const [loading, setLoading] = useState(false)

  const handleResposta = (valor: number) => {
    setRespostas({
      ...respostas,
      [mbtiQuestions[currentQuestion].id]: valor,
    })
  }

  const proximaPergunta = () => {
    if (currentQuestion < mbtiQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const perguntaAnterior = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const finalizarTeste = async () => {
    setLoading(true)

    try {
      // Calcular resultado
      const result = calcularMBTI(respostas)
      setResultado(result)

      // Determinar endpoint e body baseado em convite
      const endpoint = conviteToken ? '/api/perfis/candidato' : '/api/perfis'
      const requestBody: any = {
        mbti_type: result.tipo,
        mbti_e_i: result.e_i,
        mbti_s_n: result.s_n,
        mbti_t_f: result.t_f,
        mbti_j_p: result.j_p,
      }

      // Se vier de convite, adicionar token
      if (conviteToken) {
        requestBody.convite_token = conviteToken
      }

      // Salvar no banco via API
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error('Erro ao salvar perfil')
      }

      console.log('Perfil MBTI salvo com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar perfil MBTI:', error)
      // Continua mesmo com erro para não travar o usuário
    } finally {
      setLoading(false)
    }
  }

  const salvarEContinuar = async () => {
    const origem = searchParams.get('origem')

    if (origem === 'perfil') {
      // Se veio da página de perfil, voltar para lá
      router.push('/dashboard/perfil')
    } else if (conviteToken) {
      // Se veio de um convite, mostrar mensagem de sucesso
      // (Por enquanto redireciona para uma página simples - pode ser melhorado)
      alert('Testes concluídos com sucesso! Aguarde o contato do recrutador.')
      window.location.href = '/'
    } else {
      // Se veio de um processo, ir para dashboard
      router.push(`/dashboard?perfil_completo=true`)
    }
  }

  const pergunta = mbtiQuestions[currentQuestion]
  const progress = ((currentQuestion + 1) / mbtiQuestions.length) * 100
  const respondida = respostas[pergunta.id] !== undefined

  if (resultado) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="card text-center">
            <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-secondary" />
            </div>

            <h1 className="text-3xl font-bold text-textPrimary mb-4">
              Teste MBTI Concluído!
            </h1>

            <div className="mb-8">
              <p className="text-lg text-gray-600 mb-2">Seu tipo de personalidade:</p>
              <div className="inline-block bg-secondary text-white px-8 py-4 rounded-lg text-4xl font-bold mb-4">
                {resultado.tipo}
              </div>
              <p className="text-gray-700">{resultado.descricao}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="card-flat">
                <p className="text-sm text-gray-600 mb-1">
                  {resultado.e_i >= 50 ? 'Extrovertido' : 'Introvertido'}
                </p>
                <p className="text-2xl font-bold text-primary">{resultado.e_i}%</p>
              </div>
              <div className="card-flat">
                <p className="text-sm text-gray-600 mb-1">
                  {resultado.s_n >= 50 ? 'Sensorial' : 'Intuitivo'}
                </p>
                <p className="text-2xl font-bold text-secondary">{resultado.s_n}%</p>
              </div>
              <div className="card-flat">
                <p className="text-sm text-gray-600 mb-1">
                  {resultado.t_f >= 50 ? 'Pensador' : 'Sentimental'}
                </p>
                <p className="text-2xl font-bold text-accent">{resultado.t_f}%</p>
              </div>
              <div className="card-flat">
                <p className="text-sm text-gray-600 mb-1">
                  {resultado.j_p >= 50 ? 'Julgador' : 'Perceptivo'}
                </p>
                <p className="text-2xl font-bold text-gray-600">{resultado.j_p}%</p>
              </div>
            </div>

            <button onClick={salvarEContinuar} className="btn-primary">
              Finalizar e Ver Dashboard
              <Check className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-textPrimary">Teste MBTI</h1>
            <span className="text-sm text-gray-600">
              Pergunta {currentQuestion + 1} de {mbtiQuestions.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-secondary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="card mb-8">
          <div className="mb-8">
            <div className="inline-block bg-secondary/10 text-secondary px-3 py-1 rounded-full text-sm font-semibold mb-4">
              Dimensão: {pergunta.dimensao}
            </div>
            <h2 className="text-2xl font-bold text-textPrimary">
              {pergunta.texto}
            </h2>
          </div>

          <div className="space-y-3">
            {[
              { valor: 1, label: 'Discordo totalmente' },
              { valor: 2, label: 'Discordo parcialmente' },
              { valor: 3, label: 'Neutro' },
              { valor: 4, label: 'Concordo parcialmente' },
              { valor: 5, label: 'Concordo totalmente' },
            ].map(({ valor, label }) => (
              <button
                key={valor}
                onClick={() => handleResposta(valor)}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  respostas[pergunta.id] === valor
                    ? 'border-secondary bg-secondary/5 font-semibold'
                    : 'border-gray-200 hover:border-secondary/50 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    respostas[pergunta.id] === valor
                      ? 'border-secondary bg-secondary'
                      : 'border-gray-300'
                  }`}>
                    {respostas[pergunta.id] === valor && (
                      <Check className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span>{label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={perguntaAnterior}
            disabled={currentQuestion === 0}
            className="btn-outline flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Anterior
          </button>

          {currentQuestion === mbtiQuestions.length - 1 ? (
            <button
              onClick={finalizarTeste}
              disabled={!respondida || loading}
              className="btn-primary flex-1"
            >
              {loading ? 'Finalizando...' : 'Finalizar Teste'}
              <Check className="w-5 h-5 ml-2" />
            </button>
          ) : (
            <button
              onClick={proximaPergunta}
              disabled={!respondida}
              className="btn-primary flex-1"
            >
              Próxima
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
