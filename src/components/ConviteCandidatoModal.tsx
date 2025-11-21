'use client'

import { useState, useRef } from 'react'
import { Mail, X, Copy, CheckCircle } from 'lucide-react'

interface ConviteCandidatoModalProps {
  isOpen: boolean
  onClose: () => void
  processoId: string
}

interface ConviteFormData {
  nome: string
  email: string
}

interface ConviteResponse {
  success: boolean
  conviteUrl: string
  message: string
}

export default function ConviteCandidatoModal({ isOpen, onClose, processoId }: ConviteCandidatoModalProps) {
  const [formData, setFormData] = useState<ConviteFormData>({ nome: '', email: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [conviteUrl, setConviteUrl] = useState<string | null>(null)
  const [copiado, setCopiado] = useState(false)
  const inputEmailRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError(null)
  }

  const validarFormulario = (): boolean => {
    if (!formData.nome.trim()) {
      setError('Nome é obrigatório')
      return false
    }
    if (!formData.email.trim()) {
      setError('Email é obrigatório')
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Email inválido')
      return false
    }
    return true
  }

  const handleEnviarConvite = async () => {
    if (!validarFormulario()) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/convites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          processoId,
          email: formData.email.trim(),
          nome: formData.nome.trim(),
          tipo: 'candidato',
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao enviar convite')
      }

      const data: ConviteResponse = await response.json()
      setConviteUrl(data.conviteUrl)

      // Toast de sucesso
      if (typeof window !== 'undefined') {
        alert(`Convite enviado com sucesso para ${formData.email}!`)
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar convite. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopiarLink = async () => {
    if (!conviteUrl) return

    try {
      await navigator.clipboard.writeText(conviteUrl)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch (err) {
      setError('Erro ao copiar link')
    }
  }

  const handleFechar = () => {
    setFormData({ nome: '', email: '' })
    setConviteUrl(null)
    setError(null)
    setCopiado(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="card max-w-md w-full animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Convidar Candidato</h2>
          </div>
          <button
            onClick={handleFechar}
            className="p-1 hover:bg-secondary-100 rounded-lg transition-colors"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo */}
        {!conviteUrl ? (
          <>
            {/* Formulário */}
            <div className="space-y-4 mb-6">
              {/* Campo Nome */}
              <div>
                <label htmlFor="nome" className="block text-sm font-medium mb-2">
                  Nome <span className="text-alert">*</span>
                </label>
                <input
                  id="nome"
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  placeholder="Nome completo"
                  disabled={loading}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-secondary-50"
                />
              </div>

              {/* Campo Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email <span className="text-alert">*</span>
                </label>
                <input
                  ref={inputEmailRef}
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="email@exemplo.com"
                  disabled={loading}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-secondary-50"
                />
              </div>

              {/* Mensagem de erro */}
              {error && (
                <div className="bg-alert/10 border border-alert text-alert text-sm px-3 py-2 rounded-lg">
                  {error}
                </div>
              )}
            </div>

            {/* Botões */}
            <div className="flex gap-3">
              <button
                onClick={handleFechar}
                disabled={loading}
                className="flex-1 btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={handleEnviarConvite}
                disabled={loading}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="inline-block animate-spin">⏳</span>
                    Enviando...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    Enviar Convite
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Sucesso - Link Copiável */}
            <div className="space-y-4">
              {/* Ícone de sucesso */}
              <div className="flex justify-center">
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>

              {/* Mensagem */}
              <div className="text-center">
                <p className="font-semibold text-textPrimary">Convite enviado com sucesso!</p>
                <p className="text-sm text-textSecondary mt-1">
                  Compartilhe o link abaixo com {formData.nome}
                </p>
              </div>

              {/* Link copiável */}
              <div className="bg-secondary-50 rounded-lg p-3 border border-secondary-300">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={conviteUrl}
                    readOnly
                    className="flex-1 bg-transparent text-sm font-mono text-textPrimary outline-none"
                  />
                  <button
                    onClick={handleCopiarLink}
                    className={`p-2 rounded-lg transition-colors ${
                      copiado
                        ? 'bg-green-100 text-green-600'
                        : 'bg-primary/10 text-primary hover:bg-primary/20'
                    }`}
                    title={copiado ? 'Copiado!' : 'Copiar link'}
                  >
                    {copiado ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="text-xs text-textSecondary text-center bg-secondary-50 p-2 rounded">
                Link válido por 7 dias
              </div>
            </div>

            {/* Botão Fechar */}
            <button
              onClick={handleFechar}
              className="w-full btn-primary mt-6"
            >
              Fechar
            </button>
          </>
        )}
      </div>
    </div>
  )
}
