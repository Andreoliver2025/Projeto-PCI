'use client'

import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer } from 'recharts'

interface FitChartProps {
  perfil1: {
    disc_d: number
    disc_i: number
    disc_s: number
    disc_c: number
  }
  perfil2: {
    disc_d: number
    disc_i: number
    disc_s: number
    disc_c: number
  }
  label1?: string
  label2?: string
}

export default function FitChart({
  perfil1,
  perfil2,
  label1 = 'Contratante',
  label2 = 'Candidato'
}: FitChartProps) {
  const data = [
    {
      dimension: 'Dominância',
      [label1]: perfil1.disc_d,
      [label2]: perfil2.disc_d,
    },
    {
      dimension: 'Influência',
      [label1]: perfil1.disc_i,
      [label2]: perfil2.disc_i,
    },
    {
      dimension: 'Estabilidade',
      [label1]: perfil1.disc_s,
      [label2]: perfil2.disc_s,
    },
    {
      dimension: 'Conformidade',
      [label1]: perfil1.disc_c,
      [label2]: perfil2.disc_c,
    },
  ]

  return (
    <ResponsiveContainer width="100%" height={400}>
      <RadarChart data={data}>
        <PolarGrid stroke="#e5e7eb" />
        <PolarAngleAxis dataKey="dimension" tick={{ fill: '#6b7280', fontSize: 14 }} />
        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 12 }} />

        <Radar
          name={label1}
          dataKey={label1}
          stroke="#4F46E5"
          fill="#4F46E5"
          fillOpacity={0.3}
          strokeWidth={2}
        />

        <Radar
          name={label2}
          dataKey={label2}
          stroke="#10B981"
          fill="#10B981"
          fillOpacity={0.3}
          strokeWidth={2}
        />

        <Legend
          wrapperStyle={{ paddingTop: '20px' }}
          iconType="circle"
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
