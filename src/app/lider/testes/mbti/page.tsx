'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { mbtiQuestions, calcularMBTI, type MBTIResult } from '@/lib/testes/mbti'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'

export default function TesteMBTILider() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const processoId = searchParams.get('processo')

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

    // Calcular resultado
    const result = calcularMBTI(respostas)
    setResultado(result)

    // TODO: Salvar perfil do líder no banco via API
    console.log('Resultado MBTI (Líder):', result)

    setLoading(false)
  }

  const concluir = async () => {
    // TODO: Atualizar status do líder no processo
    router.push(`/lider/dashboard?processo=${processoId}`)
  }

  const pergunta = mbtiQuestions[currentQuestion]
  const progress = ((currentQuestion + 1) / mbtiQuestions.length) * 100
  const respondida = respostas[pergunta.id] !== undefined

  if (resultado) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="card text-center">
            <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-accent" />
            </div>

            <h1 className="text-3xl font-bold text-textPrimary mb-4">
              Perfil Completo!
            </h1>

            <div className="mb-8">
              <p className="text-lg text-gray-600 mb-2">Seu tipo de personalidade:</p>
              <div className="inline-block bg-accent text-white px-8 py-4 rounded-lg text-4xl font-bold mb-4">
                {resultado.tipo}
              </div>
              <p className="text-gray-700">{resultado.descricao}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="card-flat">
                <p className="text-sm text-gray-600 mb-1">E - I</p>
                <p className="text-2xl font-bold text-primary">{resultado.e_i}%</p>
              </div>
              <div className="card-flat">
                <p className="text-sm text-gray-600 mb-1">S - N</p>
                <p className="text-2xl font-bold text-secondary">{resultado.s_n}%</p>
              </div>
              <div className="card-flat">
                <p className="text-sm text-gray-600 mb-1">T - F</p>
                <p className="text-2xl font-bold text-accent">{resultado.t_f}%</p>
              </div>
              <div className="card-flat">
                <p className="text-sm text-gray-600 mb-1">J - P</p>
                <p className="text-2xl font-bold text-gray-600">{resultado.j_p}%</p>
              </div>
            </div>

            <div className="success-message mb-6">
              <Check className="w-4 h-4" />
              <p>Perfil de liderança salvo com sucesso! Agora você pode acompanhar os candidatos.</p>
            </div>

            <button onClick={concluir} className="btn-accent">
              Ir para Dashboard
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
            <h1 className="text-title text-textPrimary">Teste MBTI - Perfil de Liderança</h1>
            <span className="text-caption text-textSecondary" aria-live="polite">
              Pergunta {currentQuestion + 1} de {mbtiQuestions.length}
            </span>
          </div>

          <div className="progress-bar" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-caption text-textSecondary mt-1 text-center">
            Último passo para completar seu perfil de liderança.
          </p>
        </div>
      </header>

      {/* Question */}
      <main className="container-narrow py-6" id="main-content">
        <div className="card mb-6 animate-scale-in">
          <div className="mb-6">
            <div className="badge-accent mb-3">
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
                    ? 'border-accent bg-accent/5 font-medium shadow-soft'
                    : 'border-secondary-300 hover:border-accent/50 hover:bg-secondary-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    respostas[pergunta.id] === valor
                      ? 'border-accent bg-accent'
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

          {currentQuestion === mbtiQuestions.length - 1 ? (
            <button
              onClick={finalizarTeste}
              disabled={!respondida || loading}
              className="btn-accent flex-1"
            >
              {loading ? 'Finalizando...' : 'Finalizar Teste'}
              <Check className="w-5 h-5 ml-2" />
            </button>
          ) : (
            <button
              onClick={proximaPergunta}
              disabled={!respondida}
              className="btn-accent flex-1"
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
