'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowUpDown,
  Filter,
  Users,
  TrendingUp,
  Mail,
  CheckCircle2,
  XCircle,
  Loader2,
  BarChart3,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'

interface Candidato {
  id: string
  nome: string
  email: string
  status: string
  fit_funcao: number | null
  fit_lider: number | null
  score_medio: number | null
  perfil: any
}

type SortField = 'nome' | 'fit_funcao' | 'fit_lider' | 'score_medio'
type SortDirection = 'asc' | 'desc'

export default function ComparacaoMultiCandidatos() {
  const params = useParams()
  const processoId = params.id as string

  const [processo, setProcesso] = useState<any>(null)
  const [candidatos, setCandidatos] = useState<Candidato[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filtros e ordenação
  const [sortField, setSortField] = useState<SortField>('score_medio')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [statusFilter, setStatusFilter] = useState<string>('todos')
  const [fitMinimo, setFitMinimo] = useState<number>(0)

  // Seleção múltipla
  const [selectedCandidatos, setSelectedCandidatos] = useState<string[]>([])

  useEffect(() => {
    fetchProcesso()
  }, [processoId])

  const fetchProcesso = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/processos/${processoId}`)

      if (!response.ok) {
        throw new Error('Erro ao carregar processo')
      }

      const data = await response.json()

      setProcesso(data.processo)

      // Mapear candidatos
      const candidatosMapeados: Candidato[] = data.candidatos.map((c: any) => {
        const fitFuncao = c.fit_analise?.fit_funcao || null
        const fitLider = c.fit_analise?.fit_lider || null
        const scoreMedio = fitFuncao && fitLider ? (fitFuncao + fitLider) / 2 : null

        return {
          id: c.id,
          nome: c.usuario?.nome || 'Sem nome',
          email: c.usuario?.email || '',
          status: c.status,
          fit_funcao: fitFuncao,
          fit_lider: fitLider,
          score_medio: scoreMedio,
          perfil: c.perfil,
        }
      })

      setCandidatos(candidatosMapeados)
    } catch (err) {
      console.error('Erro ao buscar processo:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar processo')
    } finally {
      setLoading(false)
    }
  }

  // Filtrar e ordenar candidatos
  const candidatosFiltrados = useMemo(() => {
    let resultado = [...candidatos]

    // Filtrar por status
    if (statusFilter !== 'todos') {
      resultado = resultado.filter((c) => c.status === statusFilter)
    }

    // Filtrar por fit mínimo
    resultado = resultado.filter((c) => {
      if (c.score_medio === null) return fitMinimo === 0
      return c.score_medio >= fitMinimo
    })

    // Ordenar
    resultado.sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]

      // Tratar nulos
      if (aValue === null) aValue = -1
      if (bValue === null) bValue = -1

      if (sortField === 'nome') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return resultado
  }, [candidatos, statusFilter, fitMinimo, sortField, sortDirection])

  // Dados para o gráfico
  const dadosGrafico = useMemo(() => {
    return candidatosFiltrados
      .filter((c) => c.score_medio !== null)
      .slice(0, 10) // Top 10
      .map((c) => ({
        nome: c.nome.split(' ')[0], // Só primeiro nome
        'Fit Função': c.fit_funcao || 0,
        'Fit Líder': c.fit_lider || 0,
        'Score Médio': c.score_medio || 0,
      }))
  }, [candidatosFiltrados])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const toggleSelectCandidato = (id: string) => {
    setSelectedCandidatos((prev) =>
      prev.includes(id) ? prev.filter((cId) => cId !== id) : [...prev, id]
    )
  }

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-gray-400'
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number | null) => {
    if (score === null) return 'bg-gray-100'
    if (score >= 80) return 'bg-green-100'
    if (score >= 60) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-textSecondary">Carregando comparação...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <XCircle className="w-16 h-16 text-alert mx-auto mb-4" />
          <h2 className="text-h3 font-semibold text-textPrimary mb-2">
            Erro ao carregar comparação
          </h2>
          <p className="text-body text-textSecondary mb-6">{error}</p>
          <Link href={`/dashboard/processo/${processoId}`} className="btn-primary">
            Voltar ao Processo
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link
            href={`/dashboard/processo/${processoId}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar para Processo
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-textPrimary">
                Comparação de Candidatos
              </h1>
              <p className="text-body text-textSecondary">
                {processo?.nome}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="badge-secondary">
                <Users className="w-3 h-3" />
                {candidatosFiltrados.length} candidato(s)
              </span>
              {selectedCandidatos.length > 0 && (
                <span className="badge-accent">
                  <CheckCircle2 className="w-3 h-3" />
                  {selectedCandidatos.length} selecionado(s)
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Gráfico de Barras */}
        {dadosGrafico.length > 0 && (
          <div className="card mb-8">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-textPrimary">
                Top Candidatos por Score
              </h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosGrafico}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="nome" tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="Fit Função" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Fit Líder" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Score Médio" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Filtros */}
        <div className="card mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-textPrimary">Filtros</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {/* Filtro Status */}
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="todos">Todos</option>
                <option value="pendente">Pendentes</option>
                <option value="em_avaliacao">Em Avaliação</option>
                <option value="aprovado">Aprovados</option>
                <option value="reprovado">Reprovados</option>
              </select>
            </div>

            {/* Filtro Fit Mínimo */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Fit Mínimo: {fitMinimo}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={fitMinimo}
                onChange={(e) => setFitMinimo(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Stats */}
            <div className="flex items-end">
              <div className="text-sm text-textSecondary">
                Mostrando <span className="font-semibold text-textPrimary">{candidatosFiltrados.length}</span> de{' '}
                <span className="font-semibold text-textPrimary">{candidatos.length}</span> candidatos
              </div>
            </div>
          </div>
        </div>

        {/* Tabela */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary-50 border-b border-secondary-200">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selectedCandidatos.length === candidatosFiltrados.length &&
                        candidatosFiltrados.length > 0
                      }
                      onChange={() => {
                        if (selectedCandidatos.length === candidatosFiltrados.length) {
                          setSelectedCandidatos([])
                        } else {
                          setSelectedCandidatos(candidatosFiltrados.map((c) => c.id))
                        }
                      }}
                      className="rounded"
                    />
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('nome')}
                      className="flex items-center gap-1 font-semibold text-sm text-textPrimary hover:text-primary"
                    >
                      Nome
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <span className="font-semibold text-sm text-textPrimary">Email</span>
                  </th>
                  <th className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleSort('fit_funcao')}
                      className="flex items-center gap-1 font-semibold text-sm text-textPrimary hover:text-primary mx-auto"
                    >
                      Fit Função
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleSort('fit_lider')}
                      className="flex items-center gap-1 font-semibold text-sm text-textPrimary hover:text-primary mx-auto"
                    >
                      Fit Líder
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleSort('score_medio')}
                      className="flex items-center gap-1 font-semibold text-sm text-textPrimary hover:text-primary mx-auto"
                    >
                      Score Médio
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-center">
                    <span className="font-semibold text-sm text-textPrimary">Status</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {candidatosFiltrados.map((candidato) => (
                  <tr
                    key={candidato.id}
                    className={`border-b border-secondary-100 hover:bg-secondary-50 transition-colors ${
                      selectedCandidatos.includes(candidato.id) ? 'bg-primary/5' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedCandidatos.includes(candidato.id)}
                        onChange={() => toggleSelectCandidato(candidato.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/candidato/${candidato.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {candidato.nome}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-sm text-textSecondary">
                        <Mail className="w-3 h-3" />
                        {candidato.email}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-16 px-2 py-1 rounded-full text-sm font-semibold ${
                          candidato.fit_funcao !== null
                            ? `${getScoreBgColor(candidato.fit_funcao)} ${getScoreColor(
                                candidato.fit_funcao
                              )}`
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {candidato.fit_funcao !== null ? `${Math.round(candidato.fit_funcao)}%` : '--'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-16 px-2 py-1 rounded-full text-sm font-semibold ${
                          candidato.fit_lider !== null
                            ? `${getScoreBgColor(candidato.fit_lider)} ${getScoreColor(
                                candidato.fit_lider
                              )}`
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {candidato.fit_lider !== null ? `${Math.round(candidato.fit_lider)}%` : '--'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-16 px-2 py-1 rounded-full text-sm font-semibold ${
                          candidato.score_medio !== null
                            ? `${getScoreBgColor(candidato.score_medio)} ${getScoreColor(
                                candidato.score_medio
                              )}`
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {candidato.score_medio !== null ? `${Math.round(candidato.score_medio)}%` : '--'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`badge ${
                          candidato.status === 'em_avaliacao'
                            ? 'badge-accent'
                            : candidato.status === 'aprovado'
                            ? 'badge-success'
                            : candidato.status === 'reprovado'
                            ? 'badge-error'
                            : 'badge-secondary'
                        }`}
                      >
                        {candidato.status === 'em_avaliacao'
                          ? 'Em Avaliação'
                          : candidato.status === 'aprovado'
                          ? 'Aprovado'
                          : candidato.status === 'reprovado'
                          ? 'Reprovado'
                          : 'Pendente'}
                      </span>
                    </td>
                  </tr>
                ))}

                {candidatosFiltrados.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-textSecondary">
                        Nenhum candidato encontrado com os filtros selecionados.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Comparação Lado a Lado (se houver seleção) */}
        {selectedCandidatos.length > 0 && (
          <div className="card mt-6">
            <h2 className="text-xl font-semibold text-textPrimary mb-4">
              Comparação Detalhada ({selectedCandidatos.length} selecionados)
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedCandidatos.map((id) => {
                const candidato = candidatos.find((c) => c.id === id)
                if (!candidato) return null

                return (
                  <div
                    key={id}
                    className="border border-secondary-200 rounded-lg p-4 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-textPrimary">{candidato.nome}</h3>
                      <button
                        onClick={() => toggleSelectCandidato(id)}
                        className="text-textSecondary hover:text-alert"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-textSecondary">Fit Função:</span>
                        <span
                          className={`font-semibold ${getScoreColor(candidato.fit_funcao)}`}
                        >
                          {candidato.fit_funcao !== null
                            ? `${Math.round(candidato.fit_funcao)}%`
                            : '--'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-textSecondary">Fit Líder:</span>
                        <span
                          className={`font-semibold ${getScoreColor(candidato.fit_lider)}`}
                        >
                          {candidato.fit_lider !== null
                            ? `${Math.round(candidato.fit_lider)}%`
                            : '--'}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-secondary-200 pt-2">
                        <span className="text-textPrimary font-medium">Score Médio:</span>
                        <span
                          className={`font-bold ${getScoreColor(candidato.score_medio)}`}
                        >
                          {candidato.score_medio !== null
                            ? `${Math.round(candidato.score_medio)}%`
                            : '--'}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
