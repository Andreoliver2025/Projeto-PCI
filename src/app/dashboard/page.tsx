import { currentUser } from '@clerk/nextjs'
import Link from 'next/link'
import { Plus, Users, TrendingUp, FileText } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function Dashboard() {
  const user = await currentUser()

  if (!user) {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-textPrimary">Dashboard</h1>
              <p className="text-gray-600">Bem-vindo, {user.firstName}!</p>
            </div>
            <Link href="/dashboard/novo-processo" className="btn-primary flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Novo Processo
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Processos Ativos</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Candidatos Avaliados</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Taxa de Sucesso</p>
                <p className="text-2xl font-bold">--%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div className="card text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Plus className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-3">
              Nenhum Processo Criado
            </h2>
            <p className="text-gray-600 mb-6">
              Comece criando seu primeiro processo de seleção para analisar a compatibilidade comportamental dos candidatos.
            </p>
            <Link href="/dashboard/novo-processo" className="btn-primary inline-block">
              Criar Primeiro Processo
            </Link>
          </div>
        </div>

        {/* Guia Rápido */}
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">Como Começar</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="card bg-gray-50">
              <h4 className="font-semibold mb-2">1. Complete Seu Perfil</h4>
              <p className="text-sm text-gray-600">
                Faça os testes comportamentais para estabelecer sua baseline
              </p>
            </div>
            <div className="card bg-gray-50">
              <h4 className="font-semibold mb-2">2. Crie um Processo</h4>
              <p className="text-sm text-gray-600">
                Defina a vaga e o perfil ideal que você procura
              </p>
            </div>
            <div className="card bg-gray-50">
              <h4 className="font-semibold mb-2">3. Convide Candidatos</h4>
              <p className="text-sm text-gray-600">
                Envie convites para candidatos fazerem os testes
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
