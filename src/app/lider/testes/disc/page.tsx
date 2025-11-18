'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { discQuestions, calcularDISC, type DISCResult } from '@/lib/testes/disc'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'

export default function TesteDISCLider() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const processoId = searchParams.get('processo')

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [respostas, setRespostas] = useState<Record<number, number>>({})
  const [resultado, setResultado] = useState<DISCResult | null>(null)
  const [loading, setLoading] = useState(false)

  const handleResposta = (valor: number) => {
    setRespostas({
      ...respostas,
      [discQuestions[currentQuestion].id]: valor,
    })
  }

  const proximaPergunta = () => {
    if (currentQuestion < discQuestions.length - 1) {
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

    // Calcular resultado
    const result = calcularDISC(respostas)
    setResultado(result)

    // TODO: Salvar perfil do líder no banco via API
    console.log('Resultado DISC (Líder):', result)

    setLoading(false)
  }

  const salvarEContinuar = async () => {
    // TODO: Salvar perfil no banco
    router.push(`/lider/testes/mbti?processo=${processoId}`)
  }

  const pergunta = discQuestions[currentQuestion]
  const progress = ((currentQuestion + 1) / discQuestions.length) * 100
  const respondida = respostas[pergunta.id] !== undefined

  if (resultado) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="card text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-primary" />
            </div>

            <h1 className="text-3xl font-bold text-textPrimary mb-4">
              Teste DISC Concluído!
            </h1>

            <div className="mb-8">
              <p className="text-lg text-gray-600 mb-2">Seu perfil de liderança:</p>
              <div className="inline-block bg-primary text-white px-8 py-4 rounded-lg text-4xl font-bold mb-4">
                {resultado.perfil_principal}
              </div>
              <p className="text-gray-700">{resultado.descricao}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="card-flat">
                <p className="text-sm text-gray-600 mb-1">Dominância</p>
                <p className="text-2xl font-bold text-primary">{resultado.d}%</p>
              </div>
              <div className="card-flat">
                <p className="text-sm text-gray-600 mb-1">Influência</p>
                <p className="text-2xl font-bold text-secondary">{resultado.i}%</p>
              </div>
              <div className="card-flat">
                <p className="text-sm text-gray-600 mb-1">Estabilidade</p>
                <p className="text-2xl font-bold text-accent">{resultado.s}%</p>
              </div>
              <div className="card-flat">
                <p className="text-sm text-gray-600 mb-1">Conformidade</p>
                <p className="text-2xl font-bold text-gray-600">{resultado.c}%</p>
              </div>
            </div>

            <button onClick={salvarEContinuar} className="btn-primary">
              Continuar para Teste MBTI
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-secondary-200" role="banner">
        <div className="container-narrow py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-title text-textPrimary">Teste DISC - Perfil de Liderança</h1>
            <span className="text-caption text-textSecondary" aria-live="polite">
              Pergunta {currentQuestion + 1} de {discQuestions.length}
            </span>
          </div>

          <div className="progress-bar" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-caption text-textSecondary mt-1 text-center">
            Vamos entender seu estilo de liderança. Leva menos de 7 minutos.
          </p>
        </div>
      </header>

      {/* Question */}
      <main className="container-narrow py-6" id="main-content">
        <div className="card mb-6 animate-scale-in">
          <div className="mb-6">
            <div className="badge-primary mb-3">
              Dimensão: {pergunta.dimensao}
            </div>
            <h2 className="text-title text-textPrimary">
              {pergunta.texto}
            </h2>
          </div>

          <div className="space-sm" role="radiogroup" aria-labelledby="question-text">
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
                role="radio"
                aria-checked={respostas[pergunta.id] === valor}
                className={`w-full p-3 rounded-lg border-2 transition-all text-left hover:scale-[1.01] ${
                  respostas[pergunta.id] === valor
                    ? 'border-primary bg-primary/5 font-medium shadow-soft'
                    : 'border-secondary-300 hover:border-primary/50 hover:bg-secondary-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    respostas[pergunta.id] === valor
                      ? 'border-primary bg-primary'
                      : 'border-secondary-400'
                  }`}>
                    {respostas[pergunta.id] === valor && (
                      <Check className="w-3 h-3 text-white" aria-hidden="true" />
                    )}
                  </div>
                  <span className="text-body">{label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-4">
          <button
            onClick={perguntaAnterior}
            disabled={currentQuestion === 0}
            className="btn-outline flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Anterior
          </button>

          {currentQuestion === discQuestions.length - 1 ? (
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
      </main>
    </div>
  )
}
