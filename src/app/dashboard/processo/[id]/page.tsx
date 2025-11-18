'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, UserPlus, Mail, FileText, TrendingUp, Crown, Briefcase } from 'lucide-react'
import FitComparacaoCompleta from '@/components/FitComparacaoCompleta'
import { PERFIS_IDEAIS_TEMPLATE } from '@/lib/tipos/perfil-ideal'

export default function ProcessoDetalhes() {
  const params = useParams()
  const processoId = params.id as string

  const [processo, setProcesso] = useState<any>(null)
  const [candidatos, setCandidatos] = useState<any[]>([])
  const [funcaoIdeal, setFuncaoIdeal] = useState<any>(null)
  const [liderPerfil, setLiderPerfil] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Carregar dados reais da API
    setProcesso({
      id: processoId,
      nome: 'Desenvolvedor Frontend Senior',
      status: 'ativo',
      lider_nome: 'Carlos Mendes',
      created_at: new Date().toISOString(),
    })

    // Mock perfil ideal da função (template "desenvolvedor")
    setFuncaoIdeal(PERFIS_IDEAIS_TEMPLATE.desenvolvedor)

    // Mock perfil do líder
    setLiderPerfil({
      disc_d: 75,
      disc_i: 50,
      disc_s: 60,
      disc_c: 80,
      mbti_type: 'INTJ',
      mbti_e_i: 30,
      mbti_s_n: 20,
      mbti_t_f: 85,
      mbti_j_p: 75,
    })

    // Mock candidatos
    setCandidatos([
      {
        id: '1',
        nome: 'João Silva',
        email: 'joao@example.com',
        status: 'em_avaliacao',
        fit_score: 85,
        fit_funcao: 82,
        fit_lider: 88,
        perfil: {
          disc_d: 65,
          disc_i: 45,
          disc_s: 55,
          disc_c: 70,
          mbti_type: 'ISTJ',
          mbti_e_i: 35,
          mbti_s_n: 65,
          mbti_t_f: 75,
          mbti_j_p: 80,
        },
      },
      {
        id: '2',
        nome: 'Maria Santos',
        email: 'maria@example.com',
        status: 'pendente',
        fit_score: null,
        perfil: null,
      },
    ])

    setLoading(false)
  }, [processoId])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar para Dashboard
          </Link>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-2xl font-bold text-textPrimary">{processo?.nome}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className={`badge ${processo?.status === 'ativo' ? 'badge-accent' : 'badge-secondary'}`}>
                  {processo?.status}
                </span>
                {processo?.lider_nome && (
                  <span className="text-caption text-textSecondary flex items-center gap-1">
                    <Crown className="w-3 h-3" aria-hidden="true" />
                    Líder: {processo.lider_nome}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/dashboard/definir-perfil-ideal?processo=${processoId}`}
                className="btn-outline flex items-center gap-2"
              >
                <Briefcase className="w-5 h-5" />
                Definir Perfil Ideal
              </Link>
              <button className="btn-primary flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Convidar Candidato
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Candidatos</p>
                <p className="text-2xl font-bold">{candidatos.length}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                <Mail className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold">
                  {candidatos.filter(c => c.status === 'pendente').length}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Em Avaliação</p>
                <p className="text-2xl font-bold">
                  {candidatos.filter(c => c.status === 'em_avaliacao').length}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Fit Médio</p>
                <p className="text-2xl font-bold">
                  {candidatos.filter(c => c.fit_score).length > 0
                    ? Math.round(
                        candidatos
                          .filter(c => c.fit_score)
                          .reduce((sum, c) => sum + c.fit_score, 0) /
                          candidatos.filter(c => c.fit_score).length
                      )
                    : '--'}
                  %
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Candidatos */}
        <div className="card">
          <h2 className="text-xl font-bold text-textPrimary mb-6">Candidatos</h2>

          <div className="space-y-6">
            {candidatos.map(candidato => (
              <div key={candidato.id} className="border border-gray-200 rounded-lg p-4 hover:border-primary/50 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{candidato.nome}</h3>
                    <p className="text-sm text-gray-600">{candidato.email}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`badge ${
                        candidato.status === 'em_avaliacao'
                          ? 'badge-accent'
                          : 'badge-secondary'
                      }`}
                    >
                      {candidato.status === 'em_avaliacao' ? 'Em Avaliação' : 'Pendente'}
                    </span>
                  </div>
                </div>

                {candidato.perfil && funcaoIdeal && (
                  <div className="mt-4">
                    <FitComparacaoCompleta
                      candidato={candidato.perfil}
                      funcaoIdeal={funcaoIdeal}
                      lider={liderPerfil}
                      nomeCandidato={candidato.nome}
                      nomeLider={processo?.lider_nome || 'Líder'}
                    />
                  </div>
                )}

                {!candidato.perfil && candidato.status === 'pendente' && (
                  <div className="mt-4 p-3 bg-secondary-50 rounded-lg text-center">
                    <p className="text-caption text-textSecondary">
                      Aguardando candidato completar testes comportamentais
                    </p>
                  </div>
                )}

                <div className="flex gap-3 mt-4">
                  {candidato.status === 'pendente' ? (
                    <button className="btn-outline btn-sm flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Reenviar Convite
                    </button>
                  ) : (
                    <Link href={`/dashboard/candidato/${candidato.id}`} className="btn-primary btn-sm">
                      Ver Análise Completa
                    </Link>
                  )}
                </div>
              </div>
            ))}

            {candidatos.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">Nenhum candidato convidado ainda.</p>
                <button className="btn-primary">Convidar Primeiro Candidato</button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
