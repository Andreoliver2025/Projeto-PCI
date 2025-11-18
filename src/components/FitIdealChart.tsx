'use client'

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import type { PerfilComportamental } from '@/types/database.types'
import type { PerfilIdeal } from '@/lib/tipos/perfil-ideal'

interface FitIdealChartProps {
  perfil: PerfilComportamental
  ideal: PerfilIdeal
  labelPerfil?: string
  className?: string
}

/**
 * Gráfico radar comparando perfil real contra perfil ideal
 * Mostra o valor do candidato e o range esperado (min-max)
 */
export default function FitIdealChart({
  perfil,
  ideal,
  labelPerfil = 'Candidato',
  className = '',
}: FitIdealChartProps) {
  // Preparar dados para o gráfico
  const data = [
    {
      dimension: 'Dominância',
      [labelPerfil]: perfil.disc_d || 0,
      'Mínimo Ideal': ideal.disc_d.min,
      'Máximo Ideal': ideal.disc_d.max,
    },
    {
      dimension: 'Influência',
      [labelPerfil]: perfil.disc_i || 0,
      'Mínimo Ideal': ideal.disc_i.min,
      'Máximo Ideal': ideal.disc_i.max,
    },
    {
      dimension: 'Estabilidade',
      [labelPerfil]: perfil.disc_s || 0,
      'Mínimo Ideal': ideal.disc_s.min,
      'Máximo Ideal': ideal.disc_s.max,
    },
    {
      dimension: 'Conformidade',
      [labelPerfil]: perfil.disc_c || 0,
      'Mínimo Ideal': ideal.disc_c.min,
      'Máximo Ideal': ideal.disc_c.max,
    },
  ]

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={400}>
        <RadarChart data={data}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis dataKey="dimension" tick={{ fill: '#6B7280', fontSize: 13 }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#9CA3AF', fontSize: 11 }} />

          {/* Range ideal (área sombreada entre min e max) */}
          <Radar
            name="Mínimo Ideal"
            dataKey="Mínimo Ideal"
            stroke="#12B76A"
            fill="#12B76A"
            fillOpacity={0.1}
            strokeWidth={1}
            strokeDasharray="3 3"
          />
          <Radar
            name="Máximo Ideal"
            dataKey="Máximo Ideal"
            stroke="#12B76A"
            fill="#12B76A"
            fillOpacity={0.1}
            strokeWidth={1}
            strokeDasharray="3 3"
          />

          {/* Perfil real */}
          <Radar
            name={labelPerfil}
            dataKey={labelPerfil}
            stroke="#1E2A78"
            fill="#1E2A78"
            fillOpacity={0.4}
            strokeWidth={2}
          />

          <Legend
            wrapperStyle={{ fontSize: '13px' }}
            iconType="circle"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              fontSize: '13px',
            }}
          />
        </RadarChart>
      </ResponsiveContainer>

      {/* Legenda de interpretação */}
      <div className="mt-3 p-3 bg-secondary-50 rounded-lg">
        <p className="text-caption text-textSecondary">
          💡 <strong>Como interpretar:</strong> Os valores em azul são o perfil do candidato.
          A área verde tracejada representa o range ideal para a função.
          Quanto mais o azul estiver dentro do verde, melhor o fit.
        </p>
      </div>
    </div>
  )
}

/**
 * Componente simplificado mostrando apenas DISC
 */
export function FitIdealChartSimple({
  perfil,
  ideal,
  labelPerfil = 'Você',
}: FitIdealChartProps) {
  const dimensoes = [
    { key: 'disc_d', label: 'D', valor: perfil.disc_d || 0, ideal: ideal.disc_d },
    { key: 'disc_i', label: 'I', valor: perfil.disc_i || 0, ideal: ideal.disc_i },
    { key: 'disc_s', label: 'S', valor: perfil.disc_s || 0, ideal: ideal.disc_s },
    { key: 'disc_c', label: 'C', valor: perfil.disc_c || 0, ideal: ideal.disc_c },
  ]

  return (
    <div className="space-md">
      {dimensoes.map(({ key, label, valor, ideal: idealRange }) => {
        const dentroRange = valor >= idealRange.min && valor <= idealRange.max
        const progresso = valor

        return (
          <div key={key}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-caption font-medium text-textPrimary">{label}</span>
              <span className="text-caption text-textSecondary">
                {valor} / {idealRange.min}-{idealRange.max}
                {dentroRange && <span className="ml-1 text-accent">✓</span>}
              </span>
            </div>

            {/* Barra de progresso com range ideal destacado */}
            <div className="relative h-3 bg-secondary-200 rounded-full overflow-hidden">
              {/* Range ideal (fundo verde claro) */}
              <div
                className="absolute h-full bg-accent/20"
                style={{
                  left: `${idealRange.min}%`,
                  width: `${idealRange.max - idealRange.min}%`,
                }}
              />

              {/* Valor real */}
              <div
                className={`absolute h-full rounded-full transition-all ${
                  dentroRange ? 'bg-accent' : 'bg-primary'
                }`}
                style={{ width: `${progresso}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
