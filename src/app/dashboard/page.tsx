import { currentUser } from '@clerk/nextjs'
import Link from 'next/link'
import {
  Plus,
  Users,
  TrendingUp,
  FileText,
  Sparkles,
  UserCheck,
  Briefcase,
  Mail,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock
} from 'lucide-react'
import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function getProcessos(clerkId: string) {
  try {
    // Buscar usuário
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('id')
      .eq('clerk_id', clerkId)
      .single()

    if (!usuario) return []

    // Buscar processos com funções e contar candidatos
    const { data: processos } = await supabase
      .from('processos')
      .select(`
        *,
        funcoes(*)
      `)
      .eq('usuario_principal_id', usuario.id)
      .order('created_at', { ascending: false })

    if (!processos) return []

    // Para cada processo, buscar contagem de candidatos
    const processosComCandidatos = await Promise.all(
      processos.map(async (processo) => {
        const { count } = await supabase
          .from('candidatos')
          .select('*', { count: 'exact', head: true })
          .eq('processo_id', processo.id)

        return {
          ...processo,
          candidatos_count: count || 0,
        }
      })
    )

    return processosComCandidatos
  } catch (error) {
    console.error('Erro ao buscar processos:', error)
    return []
  }
}

export default async function Dashboard() {
  const user = await currentUser()

  if (!user) {
    redirect('/sign-in')
  }

  // Buscar dados reais do banco
  const processos = await getProcessos(user.id)
  const hasProcesses = processos.length > 0

  // Calcular stats reais
  const activeProcesses = processos.filter(
    (p: any) => p.status === 'ativo' || p.status === 'rascunho'
  ).length

  const totalCandidates = processos.reduce(
    (acc: number, p: any) => acc + (p.candidatos_count || 0),
    0
  )

  const stats = {
    activeProcesses,
    totalCandidates,
    successRate: totalCandidates > 0 ? Math.round((activeProcesses / processos.length) * 100) : 0
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-secondary-200 sticky top-0 z-40">
        <div className="container-wide py-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-display text-textPrimary">Dashboard</h1>
                <Sparkles className="w-6 h-6 text-primary animate-pulse-slow" />
              </div>
              <p className="text-textSecondary">
                Olá, <span className="font-medium text-textPrimary">{user.firstName}</span>!
                Bem-vindo ao seu painel de controle.
              </p>
            </div>
            <Link
              href="/dashboard/novo-processo"
              className="btn-primary btn-lg shadow-medium hover:shadow-strong"
            >
              <Plus className="w-5 h-5" />
              Criar Novo Processo
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
                  {stats.activeProcesses}
                </p>
                <div className="flex items-center gap-1 text-caption text-textSecondary">
                  <BarChart3 className="w-3 h-3" />
                  <span>Total em andamento</span>
                </div>
              </div>
              <div className="mt-2">
                <span className="badge-secondary">
                  <Clock className="w-3 h-3" />
                  Hoje
                </span>
              </div>
            </div>
          </div>

          {/* Candidatos Avaliados */}
          <div className="card-interactive group">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                    <Users className="w-6 h-6 text-accent" />
                  </div>
                </div>
                <p className="text-caption text-textSecondary mb-1">Candidatos Avaliados</p>
                <p className="text-4xl font-bold text-textPrimary mb-2">
                  {stats.totalCandidates}
                </p>
                <div className="flex items-center gap-1 text-caption text-textSecondary">
                  <UserCheck className="w-3 h-3" />
                  <span>Perfis analisados</span>
                </div>
              </div>
              <div className="mt-2">
                <span className="badge-accent">
                  <CheckCircle2 className="w-3 h-3" />
                  Ativo
                </span>
              </div>
            </div>
          </div>

          {/* Taxa de Sucesso */}
          <div className="card-interactive group">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-12 h-12 bg-secondary-200/50 rounded-xl flex items-center justify-center group-hover:bg-secondary-300/50 transition-colors">
                    <TrendingUp className="w-6 h-6 text-secondary-700" />
                  </div>
                </div>
                <p className="text-caption text-textSecondary mb-1">Taxa de Compatibilidade</p>
                <p className="text-4xl font-bold text-textPrimary mb-2">
                  {stats.successRate > 0 ? `${stats.successRate}%` : '--'}
                </p>
                <div className="flex items-center gap-1 text-caption text-textSecondary">
                  <Sparkles className="w-3 h-3" />
                  <span>Média geral</span>
                </div>
              </div>
              <div className="mt-2">
                <span className="badge-secondary">
                  Em breve
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo Principal */}
        {!hasProcesses ? (
          <>
            {/* Empty State - Elegante */}
            <div className="card shadow-medium border-2 border-dashed border-secondary-300">
              <div className="text-center py-16 px-6">
                <div className="max-w-2xl mx-auto space-md">
                  {/* Ilustração/Ícone */}
                  <div className="relative inline-block">
                    <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-scale-in">
                      <Briefcase className="w-12 h-12 text-primary" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center animate-pulse-slow">
                      <Plus className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  {/* Texto Principal */}
                  <div className="space-sm">
                    <h2 className="text-display text-textPrimary">
                      Comece Sua Jornada
                    </h2>
                    <p className="text-h3 text-textSecondary max-w-lg mx-auto">
                      Nenhum processo de seleção criado ainda. Que tal começar agora?
                    </p>
                    <p className="text-body text-textSecondary max-w-xl mx-auto">
                      Crie seu primeiro processo de seleção e descubra como a análise comportamental pode transformar sua forma de contratar.
                    </p>
                  </div>

                  {/* CTA Principal */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                    <Link
                      href="/dashboard/novo-processo"
                      className="btn-primary btn-lg shadow-medium hover:shadow-strong"
                    >
                      <Plus className="w-5 h-5" />
                      Criar Primeiro Processo
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      href="/dashboard/perfil"
                      className="btn-outline btn-lg"
                    >
                      <UserCheck className="w-5 h-5" />
                      Completar Meu Perfil
                    </Link>
                  </div>

                  {/* Benefícios Rápidos */}
                  <div className="grid sm:grid-cols-3 gap-4 pt-8 text-left">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-textPrimary text-sm">Análise IA</p>
                        <p className="text-caption text-textSecondary">Avaliação comportamental automática</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="w-4 h-4 text-accent" />
                      </div>
                      <div>
                        <p className="font-medium text-textPrimary text-sm">Decisões Precisas</p>
                        <p className="text-caption text-textSecondary">Match comportamental objetivo</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-secondary-300/50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Clock className="w-4 h-4 text-secondary-700" />
                      </div>
                      <div>
                        <p className="font-medium text-textPrimary text-sm">Economize Tempo</p>
                        <p className="text-caption text-textSecondary">Processo 70% mais rápido</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Guia Rápido - Melhorado */}
            <div className="space-md">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-title text-textPrimary">Como Começar</h3>
                  <p className="text-body text-textSecondary">Siga estes passos simples para começar</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="card-flat border-l-4 border-l-primary hover:shadow-soft transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <UserCheck className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-caption font-bold text-primary">PASSO 1</span>
                      </div>
                      <h4 className="font-semibold text-textPrimary mb-2">Complete Seu Perfil</h4>
                      <p className="text-caption text-textSecondary mb-3">
                        Faça os testes comportamentais para estabelecer sua baseline e entender melhor seu perfil.
                      </p>
                      <Link href="/dashboard/perfil" className="text-caption text-primary font-medium hover:underline inline-flex items-center gap-1">
                        Começar agora
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="card-flat border-l-4 border-l-accent hover:shadow-soft transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Briefcase className="w-5 h-5 text-accent" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-caption font-bold text-accent">PASSO 2</span>
                      </div>
                      <h4 className="font-semibold text-textPrimary mb-2">Crie um Processo</h4>
                      <p className="text-caption text-textSecondary mb-3">
                        Defina a vaga e o perfil comportamental ideal que você está buscando para a posição.
                      </p>
                      <Link href="/dashboard/novo-processo" className="text-caption text-accent font-medium hover:underline inline-flex items-center gap-1">
                        Criar processo
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="card-flat border-l-4 border-l-secondary-600 hover:shadow-soft transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-secondary-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-secondary-700" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-caption font-bold text-secondary-700">PASSO 3</span>
                      </div>
                      <h4 className="font-semibold text-textPrimary mb-2">Convide Candidatos</h4>
                      <p className="text-caption text-textSecondary mb-3">
                        Envie convites personalizados para os candidatos realizarem os testes comportamentais.
                      </p>
                      <span className="text-caption text-secondary-600 font-medium inline-flex items-center gap-1">
                        Disponível após criar processo
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Lista de Processos */
          <div className="space-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-title text-textPrimary">Seus Processos</h2>
            </div>

            {/* Cards de Processo */}
            <div className="grid gap-4">
              {processos.map((processo: any) => (
                <Link
                  key={processo.id}
                  href={`/dashboard/processo/${processo.id}`}
                  className="card-interactive hover:border-primary/30 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
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
                          <Briefcase className="w-4 h-4" />
                          {processo.funcoes?.length || 0} função(ões)
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {processo.candidatos_count} candidato(s)
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Criado em{' '}
                          {new Date(processo.created_at).toLocaleDateString(
                            'pt-BR'
                          )}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-textSecondary group-hover:text-primary transition-colors" />
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
