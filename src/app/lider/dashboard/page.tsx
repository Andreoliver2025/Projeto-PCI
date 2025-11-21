import { currentUser } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Users,
  TrendingUp,
  FileText,
  Sparkles,
  Briefcase,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock,
  Crown,
} from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function getProcessosLider(clerkId: string) {
  try {
    // Buscar usuário
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('id')
      .eq('clerk_id', clerkId)
      .single()

    if (!usuario) return []

    // Buscar processos onde é líder
    const { data: processos } = await supabase
      .from('processos')
      .select(`
        id,
        nome,
        descricao,
        status,
        created_at,
        updated_at
      `)
      .eq('lider_id', usuario.id)
      .order('created_at', { ascending: false })

    if (!processos) return []

    // Para cada processo, contar candidatos
    const processosComCandidatos = await Promise.all(
      processos.map(async (processo) => {
        const { count: totalCandidatos } = await supabase
          .from('candidatos')
          .select('*', { count: 'exact', head: true })
          .eq('processo_id', processo.id)

        const { count: emAvaliacao } = await supabase
          .from('candidatos')
          .select('*', { count: 'exact', head: true })
          .eq('processo_id', processo.id)
          .eq('status', 'em_avaliacao')

        const { count: pendentes } = await supabase
          .from('candidatos')
          .select('*', { count: 'exact', head: true })
          .eq('processo_id', processo.id)
          .eq('status', 'pendente')

        return {
          ...processo,
          candidatos_count: totalCandidatos || 0,
          candidatos_em_avaliacao: emAvaliacao || 0,
          candidatos_pendentes: pendentes || 0,
        }
      })
    )

    return processosComCandidatos
  } catch (error) {
    console.error('Erro ao buscar processos do líder:', error)
    return []
  }
}

export default async function LiderDashboard() {
  const user = await currentUser()

  if (!user) {
    redirect('/sign-in')
  }

  const processos = await getProcessosLider(user.id)
  const hasProcesses = processos.length > 0

  // Calcular estatísticas
  const totalCandidatos = processos.reduce(
    (acc, p) => acc + (p.candidatos_count || 0),
    0
  )

  const totalEmAvaliacao = processos.reduce(
    (acc, p) => acc + (p.candidatos_em_avaliacao || 0),
    0
  )

  const processosAtivos = processos.filter(
    (p) => p.status === 'ativo' || p.status === 'rascunho'
  ).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-secondary-200 sticky top-0 z-40">
        <div className="container-wide py-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Crown className="w-6 h-6 text-accent" />
                <h1 className="text-display text-textPrimary">Dashboard de Líder</h1>
                <Sparkles className="w-6 h-6 text-primary animate-pulse-slow" />
              </div>
              <p className="text-textSecondary">
                Olá, <span className="font-medium text-textPrimary">{user.firstName}</span>!
                Acompanhe os processos onde você é líder.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="btn-outline btn-lg"
            >
              <ArrowRight className="w-5 h-5 rotate-180" />
              Dashboard Principal
            </Link>
          </div>
        </div>
      </header>

      <main className="container-wide py-8 space-lg">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Processos Ativos */}
          <div className="card-interactive group">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <p className="text-caption text-textSecondary mb-1">Processos Ativos</p>
                <p className="text-4xl font-bold text-textPrimary mb-2">
                  {processosAtivos}
                </p>
                <div className="flex items-center gap-1 text-caption text-textSecondary">
                  <BarChart3 className="w-3 h-3" />
                  <span>Como líder</span>
                </div>
              </div>
              <div className="mt-2">
                <span className="badge-secondary">
                  <Crown className="w-3 h-3" />
                  Líder
                </span>
              </div>
            </div>
          </div>

          {/* Total Candidatos */}
          <div className="card-interactive group">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                    <Users className="w-6 h-6 text-accent" />
                  </div>
                </div>
                <p className="text-caption text-textSecondary mb-1">Total de Candidatos</p>
                <p className="text-4xl font-bold text-textPrimary mb-2">
                  {totalCandidatos}
                </p>
                <div className="flex items-center gap-1 text-caption text-textSecondary">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Todos os processos</span>
                </div>
              </div>
              <div className="mt-2">
                <span className="badge-accent">
                  <Users className="w-3 h-3" />
                  Total
                </span>
              </div>
            </div>
          </div>

          {/* Em Avaliação */}
          <div className="card-interactive group">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-12 h-12 bg-secondary-200/50 rounded-xl flex items-center justify-center group-hover:bg-secondary-300/50 transition-colors">
                    <TrendingUp className="w-6 h-6 text-secondary-700" />
                  </div>
                </div>
                <p className="text-caption text-textSecondary mb-1">Em Avaliação</p>
                <p className="text-4xl font-bold text-textPrimary mb-2">
                  {totalEmAvaliacao}
                </p>
                <div className="flex items-center gap-1 text-caption text-textSecondary">
                  <Clock className="w-3 h-3" />
                  <span>Aguardando análise</span>
                </div>
              </div>
              <div className="mt-2">
                <span className="badge-secondary">
                  Ativo
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo Principal */}
        {!hasProcesses ? (
          /* Empty State */
          <div className="card shadow-medium border-2 border-dashed border-secondary-300">
            <div className="text-center py-16 px-6">
              <div className="max-w-2xl mx-auto space-md">
                {/* Ilustração */}
                <div className="relative inline-block">
                  <div className="w-24 h-24 bg-gradient-to-br from-accent/20 to-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-scale-in">
                    <Crown className="w-12 h-12 text-accent" />
                  </div>
                </div>

                {/* Texto Principal */}
                <div className="space-sm">
                  <h2 className="text-display text-textPrimary">
                    Nenhum Processo Como Líder
                  </h2>
                  <p className="text-h3 text-textSecondary max-w-lg mx-auto">
                    Você ainda não foi designado como líder em nenhum processo de seleção.
                  </p>
                  <p className="text-body text-textSecondary max-w-xl mx-auto">
                    Quando um gerente de RH te adicionar como líder em um processo, você poderá acompanhar os candidatos e avaliar o fit comportamental com sua equipe.
                  </p>
                </div>

                {/* CTA */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                  <Link
                    href="/dashboard"
                    className="btn-primary btn-lg"
                  >
                    <ArrowRight className="w-5 h-5 rotate-180" />
                    Ir para Dashboard Principal
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Lista de Processos */
          <div className="space-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-title text-textPrimary">Processos Onde Sou Líder</h2>
            </div>

            {/* Cards de Processo */}
            <div className="grid gap-4">
              {processos.map((processo) => (
                <Link
                  key={processo.id}
                  href={`/dashboard/processo/${processo.id}`}
                  className="card-interactive hover:border-accent/30 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Crown className="w-5 h-5 text-accent" />
                        <h3 className="text-h3 font-semibold text-textPrimary">
                          {processo.nome}
                        </h3>
                        <span
                          className={`badge ${
                            processo.status === 'ativo'
                              ? 'badge-success'
                              : processo.status === 'rascunho'
                              ? 'badge-warning'
                              : 'badge-secondary'
                          }`}
                        >
                          {processo.status === 'ativo'
                            ? 'Ativo'
                            : processo.status === 'rascunho'
                            ? 'Rascunho'
                            : processo.status === 'finalizado'
                            ? 'Finalizado'
                            : 'Arquivado'}
                        </span>
                      </div>
                      {processo.descricao && (
                        <p className="text-body text-textSecondary mb-3">
                          {processo.descricao}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-caption text-textSecondary">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {processo.candidatos_count} candidato(s)
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          {processo.candidatos_em_avaliacao} em avaliação
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {processo.candidatos_pendentes} pendente(s)
                        </span>
                        <span className="flex items-center gap-1 ml-auto">
                          <Clock className="w-4 h-4" />
                          Criado em{' '}
                          {new Date(processo.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-textSecondary group-hover:text-accent transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
