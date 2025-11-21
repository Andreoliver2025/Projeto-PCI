'use client'

import { useState, useEffect } from 'react'
import { Edit3, X, Loader2 } from 'lucide-react'

interface EditarProcessoModalProps {
  isOpen: boolean
  onClose: () => void
  processo: {
    id: string
    nome: string
    descricao?: string
    status: string
  }
  onSuccess?: () => void
}

interface FormData {
  nome: string
  descricao: string
  status: string
}

const STATUS_OPTIONS = [
  { value: 'rascunho', label: 'Rascunho', color: 'text-yellow-600' },
  { value: 'ativo', label: 'Ativo', color: 'text-green-600' },
  { value: 'finalizado', label: 'Finalizado', color: 'text-blue-600' },
  { value: 'arquivado', label: 'Arquivado', color: 'text-gray-600' },
]

export default function EditarProcessoModal({
  isOpen,
  onClose,
  processo,
  onSuccess,
}: EditarProcessoModalProps) {
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    descricao: '',
    status: 'rascunho',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Atualizar form quando processo mudar
  useEffect(() => {
    if (processo) {
      setFormData({
        nome: processo.nome || '',
        descricao: processo.descricao || '',
        status: processo.status || 'rascunho',
      })
    }
  }, [processo])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError(null)
  }

  const validarFormulario = (): boolean => {
    if (!formData.nome.trim()) {
      setError('Nome do processo é obrigatório')
      return false
    }
    if (formData.nome.trim().length < 3) {
      setError('Nome deve ter pelo menos 3 caracteres')
      return false
    }
    return true
  }

  const handleSalvar = async () => {
    if (!validarFormulario()) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/processos/${processo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: formData.nome.trim(),
          descricao: formData.descricao.trim(),
          status: formData.status,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao atualizar processo')
      }

      // Sucesso
      if (onSuccess) {
        onSuccess()
      }

      // Fechar modal
      handleFechar()

      // Toast de sucesso
      if (typeof window !== 'undefined') {
        alert('Processo atualizado com sucesso!')
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar processo. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleFechar = () => {
    setError(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="card max-w-lg w-full animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Editar Processo</h2>
          </div>
          <button
            onClick={handleFechar}
            disabled={loading}
            className="p-1 hover:bg-secondary-100 rounded-lg transition-colors disabled:opacity-50"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário */}
        <div className="space-y-4 mb-6">
          {/* Campo Nome */}
          <div>
            <label htmlFor="nome" className="block text-sm font-medium mb-2">
              Nome do Processo <span className="text-alert">*</span>
            </label>
            <input
              id="nome"
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleInputChange}
              placeholder="Ex: Gerente de Vendas - Q1 2025"
              disabled={loading}
              className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-secondary-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Campo Descrição */}
          <div>
            <label htmlFor="descricao" className="block text-sm font-medium mb-2">
              Descrição
            </label>
            <textarea
              id="descricao"
              name="descricao"
              value={formData.descricao}
              onChange={handleInputChange}
              placeholder="Descrição opcional do processo seletivo..."
              disabled={loading}
              rows={3}
              className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-secondary-50 disabled:cursor-not-allowed resize-none"
            />
          </div>

          {/* Campo Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium mb-2">
              Status <span className="text-alert">*</span>
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              disabled={loading}
              className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-secondary-50 disabled:cursor-not-allowed"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-caption text-textSecondary mt-1">
              {formData.status === 'rascunho' && 'Processo em construção, ainda não visível para candidatos'}
              {formData.status === 'ativo' && 'Processo ativo, candidatos podem ser convidados'}
              {formData.status === 'finalizado' && 'Processo finalizado, não aceita novos candidatos'}
              {formData.status === 'arquivado' && 'Processo arquivado, mantido apenas para histórico'}
            </p>
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
            className="flex-1 btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={handleSalvar}
            disabled={loading}
            className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Edit3 className="w-4 h-4" />
                Salvar Alterações
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
