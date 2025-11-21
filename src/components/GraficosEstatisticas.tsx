'use client'

import { useMemo } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import {
  TrendingUp,
  Users,
  CheckCircle2,
  Clock,
  Target
} from 'lucide-react'

interface Candidato {
  id: string
  status: 'recebido' | 'triagem' | 'entrevista' | 'aprovado' | 'recusado'
  avaliacao?: number
  created_at: string
}

interface Processo {
  id: string
  nome: string
  created_at: string
  candidatos_count?: number
  funcoes?: any[]
}

interface GraficosEstatisticasProps {
  candidatos?: Candidato[]
  processos?: Processo[]
}

export default function GraficosEstatisticas({
  candidatos = [],
  processos = []
}: GraficosEstatisticasProps) {
  // Calcular estatísticas
  const stats = useMemo(() => {
    // Contagem por status de candidatos
    const statusCount = {
      recebido: 0,
      triagem: 0,
      entrevista: 0,
      aprovado: 0,
      recusado: 0
    }

    candidatos.forEach((c) => {
      if (c.status in statusCount) {
        statusCount[c.status as keyof typeof statusCount]++
      }
    })

    // Taxa de aprovação
    const totalCandidatos = candidatos.length
    const aprovados = statusCount.aprovado
    const taxaAprovacao = totalCandidatos > 0 ? Math.round((aprovados / totalCandidatos) * 100) : 0

    // Fit médio (baseado em avaliações)
    const avaliacoes = candidatos.filter((c) => c.avaliacao !== undefined).map((c) => c.avaliacao || 0)
    const fitMedio = avaliacoes.length > 0 ? (avaliacoes.reduce((a, b) => a + b, 0) / avaliacoes.length).toFixed(1) : '0'

    // Tempo médio entre criação de processos
    let tempoMedio = 0
    if (processos.length > 1) {
      const datas = processos.map((p) => new Date(p.created_at).getTime()).sort((a, b) => a - b)
      let diferenças = []
      for (let i = 1; i < datas.length; i++) {
        diferenças.push((datas[i] - datas[i - 1]) / (1000 * 60 * 60 * 24)) // em dias
      }
      tempoMedio = Math.round(diferenças.reduce((a, b) => a + b, 0) / diferenças.length)
    }

    return {
      statusCount,
      taxaAprovacao,
      fitMedio,
      tempoMedio,
      totalCandidatos
    }
  }, [candidatos, processos])

  // Dados para gráfico de pizza (candidatos por status)
  const piechartData = useMemo(() => {
    const data = [
      { name: 'Recebido', value: stats.statusCount.recebido, color: '#EF4444' },
      { name: 'Triagem', value: stats.statusCount.triagem, color: '#F97316' },
      { name: 'Entrevista', value: stats.statusCount.entrevista, color: '#EABI56' },
      { name: 'Aprovado', value: stats.statusCount.aprovado, color: '#22C55E' },
      { name: 'Recusado', value: stats.statusCount.recusado, color: '#9CA3AF' }
    ]
    return data.filter((item) => item.value > 0)
  }, [stats.statusCount])

  // Dados para gráfico de linha (processos por mês)
  const lineChartData = useMemo(() => {
    const meses: Record<string, number> = {}
    const mesNomes: Record<string, string> = {
      '01': 'Jan',
      '02': 'Fev',
      '03': 'Mar',
      '04': 'Abr',
      '05': 'Mai',
      '06': 'Jun',
      '07': 'Jul',
      '08': 'Ago',
      '09': 'Set',
      '10': 'Out',
      '11': 'Nov',
      '12': 'Dez'
    }

    processos.forEach((p) => {
      const data = new Date(p.created_at)
      const mes = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`
      meses[mes] = (meses[mes] || 0) + 1
    })

    return Object.keys(meses)
      .sort()
      .map((mes) => {
        const [ano, mesNum] = mes.split('-')
        return {
          name: `${mesNomes[mesNum]} ${ano.slice(2)}`,
          processos: meses[mes],
          mes: mes
        }
      })
  }, [processos])

  return (
    <div className="space-lg">
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Fit Médio */}
        <div className="card-interactive group">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Target className="w-6 h-6 text-primary" />
                </div>
              </div>
              <p className="text-caption text-textSecondary mb-1">Fit Médio</p>
              <p className="text-4xl font-bold text-textPrimary mb-2">
                {stats.fitMedio}
                <span className="text-lg text-textSecondary">/10</span>
              </p>
              <div className="flex items-center gap-1 text-caption text-textSecondary">
                <TrendingUp className="w-3 h-3" />
                <span>Avaliação média</span>
              </div>
            </div>
          </div>
        </div>

        {/* Taxa de Aprovação */}
        <div className="card-interactive group">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <CheckCircle2 className="w-6 h-6 text-accent" />
                </div>
              </div>
              <p className="text-caption text-textSecondary mb-1">Taxa de Aprovação</p>
              <p className="text-4xl font-bold text-textPrimary mb-2">
                {stats.taxaAprovacao}
                <span className="text-lg text-textSecondary">%</span>
              </p>
              <div className="flex items-center gap-1 text-caption text-textSecondary">
                <CheckCircle2 className="w-3 h-3" />
                <span>{stats.statusCount.aprovado} aprovados</span>
              </div>
            </div>
          </div>
        </div>

        {/* Total de Candidatos */}
        <div className="card-interactive group">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-12 h-12 bg-secondary-200/50 rounded-xl flex items-center justify-center group-hover:bg-secondary-300/50 transition-colors">
                  <Users className="w-6 h-6 text-secondary-700" />
                </div>
              </div>
              <p className="text-caption text-textSecondary mb-1">Total Candidatos</p>
              <p className="text-4xl font-bold text-textPrimary mb-2">
                {stats.totalCandidatos}
              </p>
              <div className="flex items-center gap-1 text-caption text-textSecondary">
                <Users className="w-3 h-3" />
                <span>Em todos processos</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tempo Médio */}
        <div className="card-interactive group">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center group-hover:bg-warning/20 transition-colors">
                  <Clock className="w-6 h-6 text-warning" />
                </div>
              </div>
              <p className="text-caption text-textSecondary mb-1">Tempo Médio</p>
              <p className="text-4xl font-bold text-textPrimary mb-2">
                {stats.tempoMedio}
                <span className="text-lg text-textSecondary">d</span>
              </p>
              <div className="flex items-center gap-1 text-caption text-textSecondary">
                <Clock className="w-3 h-3" />
                <span>Entre processos</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Gráfico de Pizza - Candidatos por Status */}
        <div className="card">
          <h3 className="text-h3 font-semibold text-textPrimary mb-6">
            Candidatos por Status
          </h3>
          {piechartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={piechartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {piechartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `${value} candidato(s)`}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex items-center justify-center text-textSecondary">
              <p>Nenhum candidato registrado ainda</p>
            </div>
          )}
        </div>

        {/* Gráfico de Linha - Processos Criados por Mês */}
        <div className="card">
          <h3 className="text-h3 font-semibold text-textPrimary mb-6">
            Processos Criados por Mês
          </h3>
          {lineChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  formatter={(value) => `${value} processo(s)`}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="processos"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 5 }}
                  activeDot={{ r: 7 }}
                  name="Processos"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex items-center justify-center text-textSecondary">
              <p>Nenhum processo registrado ainda</p>
            </div>
          )}
        </div>
      </div>

      {/* Resumo Detalhado - Status por Número */}
      {stats.totalCandidatos > 0 && (
        <div className="card">
          <h3 className="text-h3 font-semibold text-textPrimary mb-6">
            Resumo por Status
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'Recebido', value: stats.statusCount.recebido, color: 'bg-red-50', textColor: 'text-red-700' },
              { label: 'Triagem', value: stats.statusCount.triagem, color: 'bg-orange-50', textColor: 'text-orange-700' },
              { label: 'Entrevista', value: stats.statusCount.entrevista, color: 'bg-yellow-50', textColor: 'text-yellow-700' },
              { label: 'Aprovado', value: stats.statusCount.aprovado, color: 'bg-green-50', textColor: 'text-green-700' },
              { label: 'Recusado', value: stats.statusCount.recusado, color: 'bg-gray-50', textColor: 'text-gray-700' }
            ].map((status) => (
              <div key={status.label} className={`${status.color} p-4 rounded-lg text-center`}>
                <p className={`text-2xl font-bold ${status.textColor} mb-1`}>
                  {status.value}
                </p>
                <p className="text-caption text-textSecondary">{status.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
