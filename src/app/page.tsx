import Link from 'next/link'
import { UserPlus, Users, TrendingUp, CheckCircle2, Sparkles } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section - Tom calmo e confiável */}
      <section className="bg-gradient-to-br from-primary to-primary-700 text-white">
        <div className="container-wide py-20">
          <div className="text-center animate-fade-in">
            {/* Eyebrow - contexto rápido */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-full mb-4">
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              <span className="text-caption font-medium">
                Plataforma de Testes Comportamentais para RH
              </span>
            </div>

            <h1 className="text-display mb-4">
              Descubra o Fit Comportamental Real dos Candidatos
            </h1>

            <p className="text-h3 opacity-90 mb-3 max-w-3xl mx-auto">
              Combine DISC, MBTI, Big5 e Eneagrama em uma plataforma única.
              Veja compatibilidade em tempo real entre candidato, vaga e gestor.
            </p>

            {/* Prova social */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-6 text-caption opacity-80">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                <span>Validado por psicólogos</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                <span>Conforme LGPD</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                <span>14 dias grátis</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/sign-up" className="btn-lg bg-white text-primary hover:bg-secondary-50">
                Começar Teste Grátis
              </Link>
              <Link href="#como-funciona" className="btn-lg border-2 border-white text-white hover:bg-white/10">
                Ver Demo (2 min)
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section id="como-funciona" className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Como Funciona
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Cadastro</h3>
              <p className="text-gray-600">
                Crie seu processo e defina o perfil ideal da vaga
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Testes</h3>
              <p className="text-gray-600">
                Você e os candidatos fazem testes comportamentais
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Análise</h3>
              <p className="text-gray-600">
                Veja gráficos de compatibilidade e fit comportamental
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">4. Decisão</h3>
              <p className="text-gray-600">
                Contrate com confiança baseado em dados
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Por Que Usar ProjetoPCI?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card">
              <h3 className="text-xl font-semibold mb-3">
                Reduza Turnover
              </h3>
              <p className="text-gray-600">
                Contratações mais assertivas reduzem custos de recontratação
              </p>
            </div>

            <div className="card">
              <h3 className="text-xl font-semibold mb-3">
                Decisões Baseadas em Dados
              </h3>
              <p className="text-gray-600">
                Menos viés subjetivo, mais ciência comportamental
              </p>
            </div>

            <div className="card">
              <h3 className="text-xl font-semibold mb-3">
                Cultura Forte
              </h3>
              <p className="text-gray-600">
                Construa equipes com compatibilidade e sinergia
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Pronto para Contratar com Confiança?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Comece seu primeiro processo de seleção gratuitamente.
          </p>
          <Link href="/sign-up" className="btn-primary inline-block">
            Criar Conta Gratuita
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="opacity-80">
            © 2025 ProjetoPCI. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
