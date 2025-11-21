'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  User,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import FitComparacaoCompleta from '@/components/FitComparacaoCompleta'
import type { PerfilComportamental } from '@/types/database.types'
import type { PerfilIdeal } from '@/lib/tipos/perfil-ideal'

interface CandidatoData {
  candidato: {
    id: string
    status: string
    usuario: {
      nome: string
      email: string
    }
    perfil: PerfilComportamental | null
  }
  processo: {
    id: string
    nome: string
  }
  funcao: {
    perfil_ideal: PerfilIdeal
  } | null
  lider: {
    nome: string
    perfil: PerfilComportamental | null
  } | null
}

export default function CandidatoDetalhes() {
  const params = useParams()
  const router = useRouter()
  const candidatoId = params.id as string

  const [data, setData] = useState<CandidatoData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchCandidato()
  }, [candidatoId])

  const fetchCandidato = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/candidatos/${candidatoId}`)

      if (!response.ok) {
        throw new Error('Erro ao carregar candidato')
      }

      const responseData = await response.json()
      setData(responseData)
    } catch (err) {
      console.error('Erro ao buscar candidato:', err)
      setError(
        err instanceof Error ? err.message : 'Erro ao carregar candidato'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: 'aprovado' | 'reprovado') => {
    if (!confirm(`Tem certeza que deseja ${newStatus === 'aprovado' ? 'aprovar' : 'reprovar'} este candidato?`)) {
      return
    }

    try {
      setActionLoading(true)

      const response = await fetch(`/api/candidatos/${candidatoId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar status')
      }

      // Recarregar dados
      await fetchCandidato()

      alert(`Candidato ${newStatus === 'aprovado' ? 'aprovado' : 'reprovado'} com sucesso!`)
    } catch (err) {
      console.error('Erro ao atualizar status:', err)
      alert('Erro ao atualizar status do candidato')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-textSecondary">Carregando candidato...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-error" />
          </div>
          <h2 className="text-h3 font-semibold text-textPrimary mb-2">
            Erro ao carregar candidato
          </h2>
          <p className="text-body text-textSecondary mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={fetchCandidato} className="btn-primary">
              Tentar Novamente
            </button>
            <Link href="/dashboard" className="btn-outline">
              Voltar ao Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const { candidato, processo, funcao, lider } = data
  const perfil = candidato.perfil

  // Se não tem perfil ainda
  if (!perfil) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <Link
              href={`/dashboard/processo/${processo.id}`}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-primary transition-colors mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar para o Processo
            </Link>
            <h1 className="text-2xl font-bold text-textPrimary">
              {candidato.usuario.nome}
            </h1>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="card text-center py-12">
            <AlertCircle className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
            <h2 className="text-h3 font-semibold text-textPrimary mb-2">
              Testes Pendentes
            </h2>
            <p className="text-body text-textSecondary mb-6">
              Este candidato ainda não completou os testes comportamentais.
            </p>
            <Link
              href={`/dashboard/processo/${processo.id}`}
              className="btn-primary inline-flex"
            >
              Voltar ao Processo
            </Link>
          </div>
        </main>
      </div>
    )
  }

  // Preparar dados do DISC para o radar chart
  const discData = [
    {
      dimension: 'Dominância',
      valor: perfil.disc_d || 0,
    },
    {
      dimension: 'Influência',
      valor: perfil.disc_i || 0,
    },
    {
      dimension: 'Estabilidade',
      valor: perfil.disc_s || 0,
    },
    {
      dimension: 'Conformidade',
      valor: perfil.disc_c || 0,
    },
  ]

  // Preparar dados do MBTI para barras de progresso
  const mbtiDimensoes = [
    {
      label: 'Extroversão / Introversão',
      valor: perfil.mbti_e_i || 50,
      left: 'Introvertido',
      right: 'Extrovertido',
    },
    {
      label: 'Sensação / Intuição',
      valor: perfil.mbti_s_n || 50,
      left: 'Intuitivo',
      right: 'Sensorial',
    },
    {
      label: 'Pensamento / Sentimento',
      valor: perfil.mbti_t_f || 50,
      left: 'Sentimental',
      right: 'Pensador',
    },
    {
      label: 'Julgamento / Percepção',
      valor: perfil.mbti_j_p || 50,
      left: 'Perceptivo',
      right: 'Julgador',
    },
  ]

  // Status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'aprovado':
        return <span className="badge badge-accent">Aprovado</span>
      case 'reprovado':
        return <span className="badge badge-error">Reprovado</span>
      case 'em_avaliacao':
        return <span className="badge badge-primary">Em Avaliação</span>
      default:
        return <span className="badge badge-secondary">Pendente</span>
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link
            href={`/dashboard/processo/${processo.id}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar para o Processo
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-textPrimary mb-2">
                {candidato.usuario.nome}
              </h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-textSecondary">
                  <Mail className="w-4 h-4" />
                  <span className="text-body">{candidato.usuario.email}</span>
                </div>
                {getStatusBadge(candidato.status)}
              </div>
            </div>

            {/* Botões de ação */}
            {candidato.status !== 'aprovado' && candidato.status !== 'reprovado' && (
              <div className="flex gap-3">
                <button
                  onClick={() => handleStatusChange('reprovado')}
                  disabled={actionLoading}
                  className="btn-outline flex items-center gap-2 border-error text-error hover:bg-error hover:text-white disabled:opacity-50"
                >
                  {actionLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <XCircle className="w-5 h-5" />
                  )}
                  Reprovar
                </button>
                <button
                  onClick={() => handleStatusChange('aprovado')}
                  disabled={actionLoading}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50"
                >
                  {actionLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <CheckCircle className="w-5 h-5" />
                  )}
                  Aprovar
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Grid de Perfis */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Perfil DISC - Radar Chart */}
          <div className="card">
            <h2 className="text-h3 font-bold text-textPrimary mb-4">
              Perfil DISC
            </h2>
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={discData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis
                  dataKey="dimension"
                  tick={{ fill: '#6b7280', fontSize: 14 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                />
                <Radar
                  name="Candidato"
                  dataKey="valor"
                  stroke="#1E2A78"
                  fill="#1E2A78"
                  fillOpacity={0.4}
                  strokeWidth={2}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
              </RadarChart>
            </ResponsiveContainer>

            {/* Valores DISC */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-3 bg-secondary-50 rounded-lg">
                <div className="text-caption font-medium text-textSecondary">
                  Dominância
                </div>
                <div className="text-h3 font-bold text-primary">
                  {perfil.disc_d}
                </div>
              </div>
              <div className="p-3 bg-secondary-50 rounded-lg">
                <div className="text-caption font-medium text-textSecondary">
                  Influência
                </div>
                <div className="text-h3 font-bold text-primary">
                  {perfil.disc_i}
                </div>
              </div>
              <div className="p-3 bg-secondary-50 rounded-lg">
                <div className="text-caption font-medium text-textSecondary">
                  Estabilidade
                </div>
                <div className="text-h3 font-bold text-primary">
                  {perfil.disc_s}
                </div>
              </div>
              <div className="p-3 bg-secondary-50 rounded-lg">
                <div className="text-caption font-medium text-textSecondary">
                  Conformidade
                </div>
                <div className="text-h3 font-bold text-primary">
                  {perfil.disc_c}
                </div>
              </div>
            </div>
          </div>

          {/* Perfil MBTI */}
          <div className="card">
            <h2 className="text-h3 font-bold text-textPrimary mb-4">
              Perfil MBTI
            </h2>

            {/* Tipo MBTI */}
            <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg text-center">
              <div className="text-caption text-textSecondary mb-1">Tipo</div>
              <div className="text-4xl font-bold text-primary">
                {perfil.mbti_type || 'N/A'}
              </div>
            </div>

            {/* Barras de progresso */}
            <div className="space-y-4">
              {mbtiDimensoes.map((dim, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-caption text-textSecondary">
                      {dim.label}
                    </span>
                    <span className="text-caption font-medium text-textPrimary">
                      {dim.valor}
                    </span>
                  </div>
                  <div className="relative">
                    <div className="h-3 bg-secondary-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${dim.valor}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-textSecondary">{dim.left}</span>
                      <span className="text-xs text-textSecondary">{dim.right}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fit Triplo - FitComparacaoCompleta */}
        {funcao && funcao.perfil_ideal && (
          <div className="card">
            <h2 className="text-h3 font-bold text-textPrimary mb-6">
              Análise de Compatibilidade
            </h2>
            <FitComparacaoCompleta
              candidato={perfil}
              funcaoIdeal={funcao.perfil_ideal}
              lider={lider?.perfil || null}
              nomeCandidato={candidato.usuario.nome}
              nomeLider={lider?.nome || 'Líder'}
            />
          </div>
        )}

        {!funcao && (
          <div className="card text-center py-8">
            <AlertCircle className="w-12 h-12 text-secondary-400 mx-auto mb-3" />
            <p className="text-body text-textSecondary">
              Perfil ideal da função ainda não foi definido. Configure o perfil
              ideal para ver a análise de compatibilidade.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
