'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import {
  User,
  Mail,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
} from 'lucide-react'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts'

interface PerfilComportamental {
  id: string
  usuario_id: string
  disc_d?: number
  disc_i?: number
  disc_s?: number
  disc_c?: number
  mbti_type?: string
  mbti_e_i?: number
  mbti_s_n?: number
  mbti_t_f?: number
  mbti_j_p?: number
  created_at: string
  updated_at: string
}

export default function PerfilPage() {
  const router = useRouter()
  const { user } = useUser()
  const [perfil, setPerfil] = useState<PerfilComportamental | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPerfil()
  }, [])

  const fetchPerfil = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/perfis')

      if (!response.ok) {
        throw new Error('Erro ao carregar perfil')
      }

      const data = await response.json()

      if (!data.perfil) {
        // Usuário não tem perfil, redirecionar para testes
        router.push('/testes/disc?origem=perfil')
        return
      }

      setPerfil(data.perfil)
    } catch (err) {
      console.error('Erro ao buscar perfil:', err)
      setError('Erro ao carregar seu perfil. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const temDISC =
    perfil &&
    perfil.disc_d !== null &&
    perfil.disc_i !== null &&
    perfil.disc_s !== null &&
    perfil.disc_c !== null

  const temMBTI = perfil && perfil.mbti_type !== null

  const dadosDISC = temDISC
    ? [
        { dimensao: 'Dominância', valor: perfil.disc_d },
        { dimensao: 'Influência', valor: perfil.disc_i },
        { dimensao: 'Estabilidade', valor: perfil.disc_s },
        { dimensao: 'Conformidade', valor: perfil.disc_c },
      ]
    : []

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-textSecondary">Carregando seu perfil...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
          <h2 className="text-h3 font-semibold text-textPrimary mb-2">
            Ops! Algo deu errado
          </h2>
          <p className="text-body text-textSecondary mb-6">{error}</p>
          <button onClick={fetchPerfil} className="btn-primary">
            <RefreshCw className="w-4 h-4" />
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-border">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-h2 font-bold text-textPrimary">Meu Perfil</h1>
              <p className="text-caption text-textSecondary mt-1">
                Seus resultados comportamentais
              </p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="btn-outline"
            >
              Voltar ao Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="container-custom py-8">
        {/* Informações do Usuário */}
        <div className="card p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-h2 font-bold">
              {user?.firstName?.[0] || user?.emailAddresses[0]?.emailAddress[0]}
            </div>
            <div className="flex-1">
              <h2 className="text-h3 font-semibold text-textPrimary">
                {user?.firstName} {user?.lastName}
              </h2>
              <div className="flex items-center gap-2 text-body text-textSecondary mt-1">
                <Mail className="w-4 h-4" />
                {user?.emailAddresses[0]?.emailAddress}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Resultados DISC */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-h3 font-semibold text-textPrimary">
                  Perfil DISC
                </h3>
                <p className="text-caption text-textSecondary mt-1">
                  Análise comportamental
                </p>
              </div>
              {temDISC ? (
                <CheckCircle2 className="w-6 h-6 text-success" />
              ) : (
                <AlertCircle className="w-6 h-6 text-warning" />
              )}
            </div>

            {temDISC ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={dadosDISC}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis
                      dataKey="dimensao"
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                    />
                    <Radar
                      dataKey="valor"
                      stroke="#4F46E5"
                      fill="#4F46E5"
                      fillOpacity={0.3}
                    />
                  </RadarChart>
                </ResponsiveContainer>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="p-3 bg-primary/5 rounded-lg">
                    <p className="text-caption text-textSecondary">Dominância</p>
                    <p className="text-h3 font-bold text-primary">
                      {perfil.disc_d}%
                    </p>
                  </div>
                  <div className="p-3 bg-primary/5 rounded-lg">
                    <p className="text-caption text-textSecondary">Influência</p>
                    <p className="text-h3 font-bold text-primary">
                      {perfil.disc_i}%
                    </p>
                  </div>
                  <div className="p-3 bg-primary/5 rounded-lg">
                    <p className="text-caption text-textSecondary">
                      Estabilidade
                    </p>
                    <p className="text-h3 font-bold text-primary">
                      {perfil.disc_s}%
                    </p>
                  </div>
                  <div className="p-3 bg-primary/5 rounded-lg">
                    <p className="text-caption text-textSecondary">
                      Conformidade
                    </p>
                    <p className="text-h3 font-bold text-primary">
                      {perfil.disc_c}%
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => router.push('/testes/disc?origem=perfil')}
                  className="btn-outline btn-sm w-full mt-6"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refazer Teste DISC
                </button>
              </>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-warning mx-auto mb-4" />
                <p className="text-body text-textSecondary mb-4">
                  Você ainda não completou o teste DISC
                </p>
                <button
                  onClick={() => router.push('/testes/disc?origem=perfil')}
                  className="btn-primary"
                >
                  Fazer Teste DISC
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Resultados MBTI */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-h3 font-semibold text-textPrimary">
                  Perfil MBTI
                </h3>
                <p className="text-caption text-textSecondary mt-1">
                  Tipo de personalidade
                </p>
              </div>
              {temMBTI ? (
                <CheckCircle2 className="w-6 h-6 text-success" />
              ) : (
                <AlertCircle className="w-6 h-6 text-warning" />
              )}
            </div>

            {temMBTI ? (
              <>
                <div className="text-center py-8">
                  <div className="inline-block px-8 py-6 bg-gradient-to-br from-primary to-secondary rounded-2xl mb-6">
                    <p className="text-6xl font-bold text-white">
                      {perfil.mbti_type}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-caption text-textSecondary mb-1">
                      <span>Extroversão / Introversão</span>
                      <span>{perfil.mbti_e_i}%</span>
                    </div>
                    <div className="w-full bg-border rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${perfil.mbti_e_i}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-caption text-textSecondary mb-1">
                      <span>Sensação / Intuição</span>
                      <span>{perfil.mbti_s_n}%</span>
                    </div>
                    <div className="w-full bg-border rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${perfil.mbti_s_n}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-caption text-textSecondary mb-1">
                      <span>Pensamento / Sentimento</span>
                      <span>{perfil.mbti_t_f}%</span>
                    </div>
                    <div className="w-full bg-border rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${perfil.mbti_t_f}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-caption text-textSecondary mb-1">
                      <span>Julgamento / Percepção</span>
                      <span>{perfil.mbti_j_p}%</span>
                    </div>
                    <div className="w-full bg-border rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${perfil.mbti_j_p}%` }}
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => router.push('/testes/mbti?origem=perfil')}
                  className="btn-outline btn-sm w-full mt-6"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refazer Teste MBTI
                </button>
              </>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-warning mx-auto mb-4" />
                <p className="text-body text-textSecondary mb-4">
                  Você ainda não completou o teste MBTI
                </p>
                <button
                  onClick={() => router.push('/testes/mbti?origem=perfil')}
                  className="btn-primary"
                >
                  Fazer Teste MBTI
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Info adicional */}
        <div className="card p-6 mt-6 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="text-body font-semibold text-textPrimary mb-1">
                Sobre seu perfil comportamental
              </h4>
              <p className="text-caption text-textSecondary">
                Seu perfil é utilizado para análise de compatibilidade com vagas
                e líderes em processos seletivos. Você pode refazer os testes a
                qualquer momento para atualizar seus resultados.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
