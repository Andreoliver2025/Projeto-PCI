'use client'

import Link from 'next/link'
import {
  Sparkles,
  CheckCircle2,
  Target,
  Brain,
  Users,
  TrendingUp,
  Zap,
  Shield,
  Award,
  BarChart3,
  Eye,
  Heart,
  MessageSquare,
  UserPlus,
  ArrowRight,
  Star,
  Clock,
  Globe
} from 'lucide-react'
import { useEffect, useState } from 'react'

export default function Home() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section - Extraordinário */}
      <section className="relative bg-gradient-to-br from-primary via-primary-600 to-primary-700 text-white overflow-hidden">
        {/* Elementos de fundo animados */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 bg-white/5 rounded-full blur-3xl animate-float top-10 -left-20"></div>
          <div className="absolute w-96 h-96 bg-white/5 rounded-full blur-3xl animate-float-delayed top-40 -right-20"></div>
          <div className="absolute w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-pulse-slow bottom-20 left-1/3"></div>
        </div>

        <div className="container-wide py-24 md:py-32 relative z-10">
          <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Badge animado */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 animate-bounce-slow border border-white/20">
              <Sparkles className="w-5 h-5 text-accent-100 animate-spin-slow" aria-hidden="true" />
              <span className="text-sm font-medium">
                🚀 A Plataforma Mais Completa de Testes Comportamentais
              </span>
            </div>

            {/* Headline impactante */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-slide-up">
              Contrate o <span className="text-accent-100 animate-gradient">Talento Certo</span>
              <br />
              <span className="text-white/90">Toda Vez</span>
            </h1>

            <p className="text-xl md:text-2xl opacity-90 mb-4 max-w-3xl mx-auto animate-fade-in-delayed">
              Combine <strong className="text-accent-100">DISC, MBTI, Big5 e Eneagrama</strong> em uma única plataforma.
              Veja compatibilidade comportamental em tempo real e tome decisões baseadas em ciência.
            </p>

            {/* Stats em destaque */}
            <div className="flex flex-wrap items-center justify-center gap-6 mb-10 text-sm">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <CheckCircle2 className="w-5 h-5 text-accent-100" aria-hidden="true" />
                <span>✅ Validado por Psicólogos</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <Shield className="w-5 h-5 text-accent-100" aria-hidden="true" />
                <span>🔒 100% Conforme LGPD</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <Clock className="w-5 h-5 text-accent-100" aria-hidden="true" />
                <span>⚡ 14 Dias Grátis</span>
              </div>
            </div>

            {/* CTAs destacados */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/sign-up"
                className="group relative btn-lg bg-white text-primary hover:bg-accent-50 hover:scale-105 transition-all duration-300 shadow-strong hover:shadow-accent/50 min-w-64"
              >
                <Zap className="w-5 h-5 group-hover:animate-pulse" />
                Começar Grátis Agora
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#demo"
                className="btn-lg border-2 border-white text-white hover:bg-white/10 backdrop-blur-sm hover:scale-105 transition-all duration-300 min-w-64"
              >
                <Eye className="w-5 h-5" />
                Ver Demonstração
              </Link>
            </div>

            {/* Social Proof */}
            <div className="mt-12 flex items-center justify-center gap-2 text-sm opacity-80">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-white/20 border-2 border-white flex items-center justify-center text-xs">
                    👤
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-accent-100 fill-accent-100" />
                <Star className="w-4 h-4 text-accent-100 fill-accent-100" />
                <Star className="w-4 h-4 text-accent-100 fill-accent-100" />
                <Star className="w-4 h-4 text-accent-100 fill-accent-100" />
                <Star className="w-4 h-4 text-accent-100 fill-accent-100" />
              </div>
              <span>+500 empresas já transformaram suas contratações</span>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0,64 C360,20 720,20 1080,64 C1440,108 1440,120 1440,120 L0,120 Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Logos de Empresas (Social Proof) */}
      <section className="py-12 bg-white border-b border-secondary-200">
        <div className="container-wide">
          <p className="text-center text-sm text-textSecondary mb-6 uppercase tracking-wider">
            Empresas que confiam no ProjetoPCI
          </p>
          <div className="flex flex-wrap items-center justify-center gap-12 opacity-50 grayscale">
            <Globe className="w-12 h-12" />
            <Award className="w-12 h-12" />
            <Shield className="w-12 h-12" />
            <Target className="w-12 h-12" />
            <Heart className="w-12 h-12" />
          </div>
        </div>
      </section>

      {/* Recursos Principais - Cards Visuais */}
      <section className="py-20 bg-gradient-to-b from-white to-secondary-50">
        <div className="container-wide">
          <div className="text-center mb-16">
            <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">
              ✨ Por que somos diferentes
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              4 Testes. 1 Plataforma. <span className="text-primary">Decisões Certeiras.</span>
            </h2>
            <p className="text-xl text-textSecondary max-w-2xl mx-auto">
              Não se limite a um único teste. Tenha uma visão 360° do perfil comportamental de cada candidato.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card DISC */}
            <div className="group card-interactive hover:shadow-strong hover:border-primary/30 bg-gradient-to-br from-white to-primary-50">
              <div className="flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-primary">DISC</h3>
              <p className="text-textSecondary mb-4">
                Identifique estilos de comportamento: Dominância, Influência, Estabilidade e Conformidade.
              </p>
              <div className="flex items-center text-primary font-semibold text-sm group-hover:translate-x-2 transition-transform">
                Saiba mais <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </div>

            {/* Card MBTI */}
            <div className="group card-interactive hover:shadow-strong hover:border-accent/30 bg-gradient-to-br from-white to-accent-50">
              <div className="flex items-center justify-center w-16 h-16 bg-accent rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-accent">MBTI</h3>
              <p className="text-textSecondary mb-4">
                Descubra tipos de personalidade baseados em preferências cognitivas e sociais.
              </p>
              <div className="flex items-center text-accent font-semibold text-sm group-hover:translate-x-2 transition-transform">
                Saiba mais <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </div>

            {/* Card Big5 */}
            <div className="group card-interactive hover:shadow-strong hover:border-primary/30 bg-gradient-to-br from-white to-primary-50">
              <div className="flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-primary-600">Big5</h3>
              <p className="text-textSecondary mb-4">
                Avalie 5 dimensões fundamentais da personalidade com base científica sólida.
              </p>
              <div className="flex items-center text-primary-600 font-semibold text-sm group-hover:translate-x-2 transition-transform">
                Saiba mais <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </div>

            {/* Card Eneagrama */}
            <div className="group card-interactive hover:shadow-strong hover:border-accent/30 bg-gradient-to-br from-white to-accent-50">
              <div className="flex items-center justify-center w-16 h-16 bg-accent-600 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-accent-600">Eneagrama</h3>
              <p className="text-textSecondary mb-4">
                Compreenda motivações profundas, medos e padrões de comportamento.
              </p>
              <div className="flex items-center text-accent-600 font-semibold text-sm group-hover:translate-x-2 transition-transform">
                Saiba mais <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona - Timeline Animada */}
      <section id="como-funciona" className="py-20 bg-white">
        <div className="container-wide">
          <div className="text-center mb-16">
            <div className="inline-block bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-semibold mb-4">
              🎯 Simples e Eficaz
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Como Funciona o <span className="text-primary">ProjetoPCI</span>
            </h2>
            <p className="text-xl text-textSecondary max-w-2xl mx-auto">
              Em 4 passos simples, você transforma seu processo de recrutamento
            </p>
          </div>

          <div className="max-w-5xl mx-auto relative">
            {/* Linha vertical conectando os passos */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-accent to-primary transform -translate-x-1/2"></div>

            {/* Passo 1 */}
            <div className="relative flex flex-col md:flex-row items-center gap-8 mb-16">
              <div className="md:w-1/2 md:text-right md:pr-12">
                <div className="inline-block md:block">
                  <div className="inline-flex items-center gap-3 bg-primary/10 px-4 py-2 rounded-full mb-3">
                    <span className="text-2xl font-bold text-primary">01</span>
                    <UserPlus className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Crie seu Processo</h3>
                  <p className="text-textSecondary">
                    Cadastre a vaga e defina o perfil comportamental ideal. Nossa IA sugere características baseadas na função.
                  </p>
                </div>
              </div>
              <div className="hidden md:flex w-16 h-16 bg-primary rounded-full items-center justify-center text-white font-bold text-xl z-10 ring-8 ring-white shadow-strong">
                1
              </div>
              <div className="md:w-1/2 md:pl-12">
                <div className="card bg-gradient-to-br from-primary-50 to-white p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-primary/20 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-3 bg-primary/20 rounded mb-2 w-3/4"></div>
                      <div className="h-2 bg-primary/10 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="h-2 bg-primary/10 rounded mb-2"></div>
                  <div className="h-2 bg-primary/10 rounded w-5/6"></div>
                </div>
              </div>
            </div>

            {/* Passo 2 */}
            <div className="relative flex flex-col md:flex-row-reverse items-center gap-8 mb-16">
              <div className="md:w-1/2 md:text-left md:pl-12">
                <div className="inline-block md:block">
                  <div className="inline-flex items-center gap-3 bg-accent/10 px-4 py-2 rounded-full mb-3">
                    <span className="text-2xl font-bold text-accent">02</span>
                    <Users className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Convide Candidatos</h3>
                  <p className="text-textSecondary">
                    Envie convites personalizados. Os candidatos fazem os testes de forma simples e intuitiva, em 15-20 minutos.
                  </p>
                </div>
              </div>
              <div className="hidden md:flex w-16 h-16 bg-accent rounded-full items-center justify-center text-white font-bold text-xl z-10 ring-8 ring-white shadow-strong">
                2
              </div>
              <div className="md:w-1/2 md:pr-12">
                <div className="card bg-gradient-to-br from-accent-50 to-white p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 bg-accent/20 rounded-full"></div>
                    <div className="w-10 h-10 bg-accent/20 rounded-full"></div>
                    <div className="w-10 h-10 bg-accent/20 rounded-full"></div>
                  </div>
                  <div className="h-2 bg-accent/10 rounded mb-2"></div>
                  <div className="h-2 bg-accent/10 rounded w-4/5 mb-2"></div>
                  <div className="h-8 bg-accent/20 rounded-lg w-32 mt-4"></div>
                </div>
              </div>
            </div>

            {/* Passo 3 */}
            <div className="relative flex flex-col md:flex-row items-center gap-8 mb-16">
              <div className="md:w-1/2 md:text-right md:pr-12">
                <div className="inline-block md:block">
                  <div className="inline-flex items-center gap-3 bg-primary/10 px-4 py-2 rounded-full mb-3">
                    <span className="text-2xl font-bold text-primary">03</span>
                    <BarChart3 className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Analise os Resultados</h3>
                  <p className="text-textSecondary">
                    Veja gráficos de compatibilidade, relatórios detalhados e análise emocional com IA. Tudo em um dashboard intuitivo.
                  </p>
                </div>
              </div>
              <div className="hidden md:flex w-16 h-16 bg-primary-600 rounded-full items-center justify-center text-white font-bold text-xl z-10 ring-8 ring-white shadow-strong">
                3
              </div>
              <div className="md:w-1/2 md:pl-12">
                <div className="card bg-gradient-to-br from-primary-50 to-white p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm font-semibold text-primary">FIT: 87%</div>
                    <TrendingUp className="w-5 h-5 text-accent" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-2 bg-accent rounded-full" style={{ width: '87%' }}></div>
                      <span className="text-xs text-textSecondary">87%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 bg-primary rounded-full" style={{ width: '72%' }}></div>
                      <span className="text-xs text-textSecondary">72%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 bg-accent-600 rounded-full" style={{ width: '94%' }}></div>
                      <span className="text-xs text-textSecondary">94%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Passo 4 */}
            <div className="relative flex flex-col md:flex-row-reverse items-center gap-8">
              <div className="md:w-1/2 md:text-left md:pl-12">
                <div className="inline-block md:block">
                  <div className="inline-flex items-center gap-3 bg-accent/10 px-4 py-2 rounded-full mb-3">
                    <span className="text-2xl font-bold text-accent">04</span>
                    <CheckCircle2 className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Contrate com Confiança</h3>
                  <p className="text-textSecondary">
                    Tome decisões embasadas em dados científicos. Reduza turnover e construa equipes de alta performance.
                  </p>
                </div>
              </div>
              <div className="hidden md:flex w-16 h-16 bg-accent-600 rounded-full items-center justify-center text-white font-bold text-xl z-10 ring-8 ring-white shadow-strong">
                4
              </div>
              <div className="md:w-1/2 md:pr-12">
                <div className="card bg-gradient-to-br from-accent-50 to-white p-6 text-center">
                  <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-10 h-10 text-accent" />
                  </div>
                  <div className="text-2xl font-bold text-accent mb-2">Contratado!</div>
                  <div className="text-sm text-textSecondary">Fit: 92% • Cultura: 89%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Visual - Gráficos */}
      <section id="demo" className="py-20 bg-gradient-to-b from-secondary-50 to-white">
        <div className="container-wide">
          <div className="text-center mb-16">
            <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">
              👁️ Veja em Ação
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Visualize o <span className="text-accent">Fit Comportamental</span>
            </h2>
            <p className="text-xl text-textSecondary max-w-2xl mx-auto">
              Nossos gráficos interativos revelam compatibilidade em tempo real
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Gráfico Demo 1 */}
            <div className="card bg-white p-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Target className="w-6 h-6 text-primary" />
                Análise DISC
              </h3>
              <div className="relative w-full aspect-square">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  {/* Círculo exterior */}
                  <circle cx="100" cy="100" r="90" fill="none" stroke="#E5E7EB" strokeWidth="2" />
                  <circle cx="100" cy="100" r="60" fill="none" stroke="#E5E7EB" strokeWidth="1" />
                  <circle cx="100" cy="100" r="30" fill="none" stroke="#E5E7EB" strokeWidth="1" />

                  {/* Linhas de divisão */}
                  <line x1="100" y1="10" x2="100" y2="190" stroke="#E5E7EB" strokeWidth="1" />
                  <line x1="10" y1="100" x2="190" y2="100" stroke="#E5E7EB" strokeWidth="1" />

                  {/* Forma do perfil (exemplo) */}
                  <polygon
                    points="100,30 160,100 100,140 40,100"
                    fill="#1E2A78"
                    fillOpacity="0.3"
                    stroke="#1E2A78"
                    strokeWidth="2"
                  />

                  {/* Labels */}
                  <text x="100" y="25" textAnchor="middle" className="text-xs fill-primary font-bold">D</text>
                  <text x="175" y="105" textAnchor="middle" className="text-xs fill-primary font-bold">I</text>
                  <text x="100" y="195" textAnchor="middle" className="text-xs fill-primary font-bold">S</text>
                  <text x="25" y="105" textAnchor="middle" className="text-xs fill-primary font-bold">C</text>
                </svg>
              </div>
              <div className="mt-6 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-textSecondary">Dominância</span>
                  <span className="font-bold text-primary">Alto (85%)</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-textSecondary">Influência</span>
                  <span className="font-bold text-primary">Médio (62%)</span>
                </div>
              </div>
            </div>

            {/* Gráfico Demo 2 */}
            <div className="card bg-white p-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-accent" />
                Comparação de Fit
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Match com Perfil Ideal</span>
                    <span className="text-lg font-bold text-accent">92%</span>
                  </div>
                  <div className="progress-bar h-3">
                    <div className="progress-fill bg-accent" style={{ width: '92%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Compatibilidade com Gestor</span>
                    <span className="text-lg font-bold text-primary">87%</span>
                  </div>
                  <div className="progress-bar h-3">
                    <div className="progress-fill bg-primary" style={{ width: '87%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Fit Cultural</span>
                    <span className="text-lg font-bold text-primary-600">89%</span>
                  </div>
                  <div className="progress-bar h-3">
                    <div className="progress-fill bg-primary-600" style={{ width: '89%' }}></div>
                  </div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-accent-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-accent-700">
                    <strong>Recomendação:</strong> Candidato com alto fit para a vaga. Perfil ideal para liderança e gestão de equipes.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefícios - Grid Visual */}
      <section className="py-20 bg-white">
        <div className="container-wide">
          <div className="text-center mb-16">
            <div className="inline-block bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-semibold mb-4">
              💡 Resultados Comprovados
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Por Que <span className="text-primary">ProjetoPCI</span>?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-strong">
                <TrendingUp className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Reduza Turnover em 40%</h3>
              <p className="text-textSecondary text-lg">
                Contratações mais assertivas significam menos recontratações e custos reduzidos
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-accent to-accent-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-strong">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Decisões 100% Baseadas em Dados</h3>
              <p className="text-textSecondary text-lg">
                Elimine viés subjetivo com análise comportamental científica e validada
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-600 to-accent-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-strong">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Cultura Forte e Coesa</h3>
              <p className="text-textSecondary text-lg">
                Construa equipes com alta sinergia e compatibilidade cultural
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testemunhos */}
      <section className="py-20 bg-gradient-to-b from-secondary-50 to-white">
        <div className="container-wide">
          <div className="text-center mb-16">
            <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">
              💬 O Que Dizem Nossos Clientes
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Histórias de <span className="text-accent">Sucesso</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="card bg-white p-6">
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-5 h-5 text-accent fill-accent" />
                ))}
              </div>
              <p className="text-textSecondary mb-6 italic">
                "O ProjetoPCI transformou nossa forma de contratar. Reduzimos o turnover em 45% e aumentamos a satisfação da equipe."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
                  MR
                </div>
                <div>
                  <div className="font-semibold">Maria Rodriguez</div>
                  <div className="text-sm text-textSecondary">Diretora de RH, TechCorp</div>
                </div>
              </div>
            </div>

            <div className="card bg-white p-6">
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-5 h-5 text-accent fill-accent" />
                ))}
              </div>
              <p className="text-textSecondary mb-6 italic">
                "Finalmente uma ferramenta que une ciência e praticidade. Os relatórios são claros e as decisões ficaram muito mais fáceis."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center text-accent font-bold">
                  JS
                </div>
                <div>
                  <div className="font-semibold">João Silva</div>
                  <div className="text-sm text-textSecondary">CEO, StartupX</div>
                </div>
              </div>
            </div>

            <div className="card bg-white p-6">
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-5 h-5 text-accent fill-accent" />
                ))}
              </div>
              <p className="text-textSecondary mb-6 italic">
                "A análise de fit cultural nos ajudou a construir uma equipe muito mais alinhada. Os candidatos também adoram a experiência!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-600/20 rounded-full flex items-center justify-center text-primary-600 font-bold">
                  AC
                </div>
                <div>
                  <div className="font-semibold">Ana Costa</div>
                  <div className="text-sm text-textSecondary">Head de People, InnovateCo</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final Poderoso */}
      <section className="py-20 bg-gradient-to-br from-primary via-primary-600 to-accent text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse-slow top-0 right-0"></div>
          <div className="absolute w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse-slow bottom-0 left-0"></div>
        </div>

        <div className="container-wide text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <Sparkles className="w-16 h-16 mx-auto mb-6 animate-pulse text-accent-100" />
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Pronto para Contratar<br />com <span className="text-accent-100">Confiança</span>?
            </h2>
            <p className="text-xl md:text-2xl opacity-90 mb-10">
              Junte-se a centenas de empresas que já transformaram<br />
              seus processos de recrutamento com o ProjetoPCI
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Link
                href="/sign-up"
                className="group btn-lg bg-white text-primary hover:bg-accent-50 hover:scale-105 transition-all duration-300 shadow-strong min-w-72"
              >
                <Zap className="w-6 h-6 group-hover:animate-pulse" />
                <span className="text-lg">Começar Grátis Agora</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="flex items-center justify-center gap-6 text-sm opacity-80">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>Sem cartão de crédito</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>14 dias grátis</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>Cancele quando quiser</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-backgroundDark text-white py-16">
        <div className="container-wide">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-8 h-8 text-accent" />
                <span className="text-xl font-bold">ProjetoPCI</span>
              </div>
              <p className="text-sm text-white/70">
                A plataforma mais completa de testes comportamentais para RH.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Produto</h3>
              <ul className="space-y-2 text-sm text-white/70">
                <li><a href="#" className="hover:text-accent transition-colors">Funcionalidades</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Testes</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Pricing</a></li>
                <li><a href="#demo" className="hover:text-accent transition-colors">Demo</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-sm text-white/70">
                <li><a href="#" className="hover:text-accent transition-colors">Sobre Nós</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Carreiras</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Contato</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-white/70">
                <li><a href="#" className="hover:text-accent transition-colors">Privacidade</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Termos</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">LGPD</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Segurança</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/70">
              <p>© 2025 ProjetoPCI. Todos os direitos reservados.</p>
              <div className="flex items-center gap-4">
                <a href="#" className="hover:text-accent transition-colors">Twitter</a>
                <a href="#" className="hover:text-accent transition-colors">LinkedIn</a>
                <a href="#" className="hover:text-accent transition-colors">Instagram</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
