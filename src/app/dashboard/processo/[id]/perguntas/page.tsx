'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Trash2, Edit2, GripVertical, Plus, Save, X, ArrowUp, ArrowDown } from 'lucide-react'

interface Pergunta {
  id: string
  texto: string
  ordem: number
  tempo_limite_segundos: number
  created_at: string
}

export default function GerenciarPerguntasPage() {
  const params = useParams()
  const router = useRouter()
  const processoId = params.id as string

  const [perguntas, setPerguntas] = useState<Pergunta[]>([])
  const [loading, setLoading] = useState(true)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [editTexto, setEditTexto] = useState('')
  const [editTempo, setEditTempo] = useState(120)

  // Novo formulário
  const [novaTexto, setNovaTexto] = useState('')
  const [novaTempo, setNovaTempo] = useState(120)
  const [criando, setCriando] = useState(false)

  useEffect(() => {
    carregarPerguntas()
  }, [processoId])

  const carregarPerguntas = async () => {
    try {
      const res = await fetch(`/api/processos/${processoId}/perguntas`)
      const data = await res.json()
      setPerguntas(data.perguntas || [])
    } catch (error) {
      console.error('Erro ao carregar perguntas:', error)
    } finally {
      setLoading(false)
    }
  }

  const criarPergunta = async () => {
    if (!novaTexto.trim()) return

    setCriando(true)
    try {
      const res = await fetch(`/api/processos/${processoId}/perguntas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          texto: novaTexto,
          tempo_limite_segundos: novaTempo,
        }),
      })

      if (res.ok) {
        setNovaTexto('')
        setNovaTempo(120)
        await carregarPerguntas()
      } else {
        const error = await res.json()
        alert(error.error || 'Erro ao criar pergunta')
      }
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao criar pergunta')
    } finally {
      setCriando(false)
    }
  }

  const iniciarEdicao = (p: Pergunta) => {
    setEditandoId(p.id)
    setEditTexto(p.texto)
    setEditTempo(p.tempo_limite_segundos)
  }

  const salvarEdicao = async (id: string) => {
    try {
      const res = await fetch(`/api/perguntas/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          texto: editTexto,
          tempo_limite_segundos: editTempo,
        }),
      })

      if (res.ok) {
        setEditandoId(null)
        await carregarPerguntas()
      }
    } catch (error) {
      console.error('Erro ao editar:', error)
    }
  }

  const deletarPergunta = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar esta pergunta?')) return

    try {
      const res = await fetch(`/api/perguntas/${id}`, { method: 'DELETE' })
      if (res.ok) {
        await carregarPerguntas()
      }
    } catch (error) {
      console.error('Erro ao deletar:', error)
    }
  }

  const moverPergunta = async (id: string, direcao: 'cima' | 'baixo') => {
    const index = perguntas.findIndex(p => p.id === id)
    if (index === -1) return
    if (direcao === 'cima' && index === 0) return
    if (direcao === 'baixo' && index === perguntas.length - 1) return

    const newIndex = direcao === 'cima' ? index - 1 : index + 1
    const pergunta = perguntas[index]
    const outraPergunta = perguntas[newIndex]

    try {
      // Trocar ordens
      await fetch(`/api/perguntas/${pergunta.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ordem: outraPergunta.ordem }),
      })

      await fetch(`/api/perguntas/${outraPergunta.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ordem: pergunta.ordem }),
      })

      await carregarPerguntas()
    } catch (error) {
      console.error('Erro ao mover:', error)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="text-primary hover:underline mb-4"
        >
          ← Voltar
        </button>
        <h1 className="text-3xl font-bold">Gerenciar Perguntas</h1>
        <p className="text-gray-600 mt-2">
          Configure as perguntas que os candidatos responderão em áudio
        </p>
      </div>

      {/* Formulário Nova Pergunta */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Adicionar Nova Pergunta
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Texto da Pergunta
            </label>
            <textarea
              value={novaTexto}
              onChange={(e) => setNovaTexto(e.target.value)}
              placeholder="Ex: Conte-me sobre uma situação desafiadora que você enfrentou..."
              className="input w-full min-h-[100px]"
              disabled={criando}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Tempo Limite
            </label>
            <select
              value={novaTempo}
              onChange={(e) => setNovaTempo(Number(e.target.value))}
              className="input w-full md:w-auto"
              disabled={criando}
            >
              <option value={60}>60 segundos (1 min)</option>
              <option value={90}>90 segundos (1.5 min)</option>
              <option value={120}>120 segundos (2 min)</option>
              <option value={180}>180 segundos (3 min)</option>
              <option value={300}>300 segundos (5 min)</option>
            </select>
          </div>
          <button
            onClick={criarPergunta}
            disabled={!novaTexto.trim() || criando}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {criando ? 'Criando...' : 'Adicionar Pergunta'}
          </button>
        </div>
      </div>

      {/* Lista de Perguntas */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          Perguntas ({perguntas.length})
        </h2>

        {perguntas.length === 0 ? (
          <div className="card text-center py-8 text-gray-500">
            Nenhuma pergunta cadastrada ainda
          </div>
        ) : (
          perguntas.map((p, idx) => (
            <div key={p.id} className="card">
              <div className="flex gap-4">
                {/* Controles de ordem */}
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => moverPergunta(p.id, 'cima')}
                    disabled={idx === 0}
                    className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <GripVertical className="w-4 h-4 text-gray-400" />
                  <button
                    onClick={() => moverPergunta(p.id, 'baixo')}
                    disabled={idx === perguntas.length - 1}
                    className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Conteúdo */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-sm font-medium text-primary">
                      Pergunta {p.ordem}
                    </span>
                    <div className="flex gap-2">
                      {editandoId === p.id ? (
                        <>
                          <button
                            onClick={() => salvarEdicao(p.id)}
                            className="btn-secondary p-2"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditandoId(null)}
                            className="btn-outline p-2"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => iniciarEdicao(p)}
                            className="btn-outline p-2"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deletarPergunta(p.id)}
                            className="btn-outline p-2 text-alert border-alert hover:bg-alert hover:text-white"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {editandoId === p.id ? (
                    <div className="space-y-3">
                      <textarea
                        value={editTexto}
                        onChange={(e) => setEditTexto(e.target.value)}
                        className="input w-full min-h-[80px]"
                      />
                      <select
                        value={editTempo}
                        onChange={(e) => setEditTempo(Number(e.target.value))}
                        className="input w-full md:w-auto"
                      >
                        <option value={60}>60 segundos</option>
                        <option value={90}>90 segundos</option>
                        <option value={120}>120 segundos</option>
                        <option value={180}>180 segundos</option>
                        <option value={300}>300 segundos</option>
                      </select>
                    </div>
                  ) : (
                    <>
                      <p className="text-gray-800 mb-2">{p.texto}</p>
                      <p className="text-sm text-gray-500">
                        Tempo limite: {p.tempo_limite_segundos}s
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
