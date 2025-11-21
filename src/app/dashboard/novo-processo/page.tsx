'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NovoProcesso() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    nome_funcao: '',
    descricao_funcao: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/processos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao criar processo')
      }

      const data = await response.json()
      console.log('Processo criado com sucesso:', data)

      // Redirecionar para a página do processo criado
      router.push(`/dashboard/processo/${data.processo.id}`)
    } catch (error) {
      console.error('Erro ao criar processo:', error)
      alert(
        error instanceof Error
          ? error.message
          : 'Erro ao criar processo. Tente novamente.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar para Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-textPrimary mb-2">
            Novo Processo de Seleção
          </h1>
          <p className="text-gray-600">
            Preencha as informações básicas para começar seu processo
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Informações do Processo</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-textPrimary mb-2">
                  Nome do Processo *
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Contratação Desenvolvedor Senior"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-textPrimary mb-2">
                  Descrição
                </label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descreva o contexto e objetivos deste processo"
                  className="input-field min-h-[100px] resize-y"
                  rows={4}
                />
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Função/Vaga</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-textPrimary mb-2">
                  Nome da Função *
                </label>
                <input
                  type="text"
                  value={formData.nome_funcao}
                  onChange={(e) => setFormData({ ...formData, nome_funcao: e.target.value })}
                  placeholder="Ex: Desenvolvedor Frontend Senior"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-textPrimary mb-2">
                  Descrição da Função
                </label>
                <textarea
                  value={formData.descricao_funcao}
                  onChange={(e) => setFormData({ ...formData, descricao_funcao: e.target.value })}
                  placeholder="Principais responsabilidades e características desejadas"
                  className="input-field min-h-[120px] resize-y"
                  rows={5}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? 'Criando...' : 'Criar Processo'}
            </button>
            <Link
              href="/dashboard"
              className="btn-outline flex-1 text-center"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </main>
    </div>
  )
}
