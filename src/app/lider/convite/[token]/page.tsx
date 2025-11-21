'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowRight, AlertCircle, Clock, CheckCircle, Loader } from 'lucide-react'

interface ConviteData {
  id: string
  token: string
  email: string
  nome: string
  tipo: string
  status: string
  processoId: string
  processo: {
    id: string
    nome: string
    descricao: string
    status: string
  } | null
}

interface ErrorType {
  message: string
  code: 'INVALID' | 'EXPIRED' | 'USED' | 'ERROR'
}

export default function ConviteLiderPage() {
  const router = useRouter()
  const params = useParams()
  const token = params.token as string

  const [convite, setConvite] = useState<ConviteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ErrorType | null>(null)
  const [isStarting, setIsStarting] = useState(false)

  useEffect(() => {
    const validarConvite = async () => {
      try {
        const response = await fetch(`/api/convites/${token}`)

        if (response.status === 404) {
          setError({
            message: 'Convite não encontrado ou inválido',
            code: 'INVALID',
          })
          return
        }

        if (response.status === 410) {
          setError({
            message: 'Convite expirado ou já foi utilizado',
            code: 'EXPIRED',
          })
          return
        }

        if (!response.ok) {
          setError({
            message: 'Erro ao validar convite',
            code: 'ERROR',
          })
          return
        }

        const data = await response.json()
        if (data.success && data.convite) {
          setConvite(data.convite)
        } else {
          setError({
            message: 'Convite inválido',
            code: 'INVALID',
          })
        }
      } catch (err) {
        console.error('Erro ao validar convite:', err)
        setError({
          message: 'Erro ao conectar com o servidor',
          code: 'ERROR',
        })
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      validarConvite()
    }
  }, [token])

  const handleComecarTestes = async () => {
    if (!convite) return

    setIsStarting(true)

    try {
      // Redirecionar para página de testes de líder passando o token do convite
      router.push(`/lider/testes/disc?convite=${token}`)
    } catch (err) {
      console.error('Erro ao iniciar testes:', err)
      setIsStarting(false)
    }
  }

  // Estado de carregamento
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-6 flex justify-center">
            <Loader className="w-12 h-12 text-primary animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-textPrimary mb-2">
            Validando convite...
          </h1>
          <p className="text-textSecondary">
            Aguarde enquanto verificamos seu convite
          </p>
        </div>
      </div>
    )
  }

  // Estado de erro
  if (error) {
    const isExpired = error.code === 'EXPIRED'

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="card text-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
              isExpired ? 'bg-red-100' : 'bg-red-100'
            }`}>
              <AlertCircle className={`w-10 h-10 ${
                isExpired ? 'text-red-600' : 'text-red-600'
              }`} />
            </div>

            <h1 className="text-2xl font-bold text-textPrimary mb-2">
              {isExpired ? 'Convite Expirado' : 'Convite Inválido'}
            </h1>

            <p className="text-textSecondary mb-6">
              {error.message}
            </p>

            {isExpired && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  Se você acredita que recebeu este convite recentemente, peça para a empresa reenviar um novo convite.
                </p>
              </div>
            )}

            <button
              onClick={() => router.push('/')}
              className="btn-primary w-full"
            >
              Voltar à Página Inicial
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Estado de sucesso com dados do convite
  if (convite && convite.processo) {
    const dataInicio = new Date(convite.processo.dataInicio)
    const dataFim = new Date(convite.processo.dataFim)

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="card">
            {/* Icon */}
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>

            {/* Greeting */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-textPrimary mb-2">
                Bem-vindo(a), {convite.nome}!
              </h1>
              <p className="text-textSecondary">
                Você foi convidado(a) como avaliador para um processo de seleção
              </p>
            </div>

            {/* Process Info */}
            <div className="bg-secondary-50 rounded-lg p-4 mb-6">
              <h2 className="font-semibold text-textPrimary mb-2">
                {convite.processo.nome}
              </h2>
              {convite.processo.descricao && (
                <p className="text-sm text-textSecondary mb-4">
                  {convite.processo.descricao}
                </p>
              )}

              {/* Timeline */}
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="text-textSecondary">
                      {dataInicio.toLocaleDateString('pt-BR')} - {dataFim.toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="mt-4 pt-4 border-t border-secondary-200">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  {convite.processo.status === 'ativo' ? 'Processo Ativo' : 'Processo'}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-900">
                <strong>Seu papel:</strong> Como avaliador, você completará testes comportamentais DISC e MBTI para definir o perfil ideal da liderança para este processo. O processo leva aproximadamente 15-20 minutos.
              </p>
            </div>

            {/* Action Button */}
            <button
              onClick={handleComecarTestes}
              disabled={isStarting}
              className="btn-primary w-full mb-3"
            >
              {isStarting ? 'Iniciando...' : 'Começar Testes'}
              {!isStarting && <ArrowRight className="w-5 h-5 ml-2" />}
            </button>

            {/* Secondary Action */}
            <button
              onClick={() => router.push('/')}
              className="btn-outline w-full"
            >
              Voltar
            </button>
          </div>

          {/* Footer Info */}
          <div className="text-center mt-6">
            <p className="text-xs text-textSecondary">
              Seu email: <span className="font-medium">{convite.email}</span>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return null
}
