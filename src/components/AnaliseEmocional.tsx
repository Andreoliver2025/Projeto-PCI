/**
 * Componente: Análise Emocional
 * Visualiza resultados da análise emocional de transcrições
 */

'use client'

import React from 'react'
import {
  Smile,
  Meh,
  Frown,
  TrendingUp,
  MessageCircle,
  Sparkles,
  Award,
  Info,
} from 'lucide-react'

export interface AnaliseEmocionalData {
  tom_emocional: 'positivo' | 'neutro' | 'negativo'
  nivel_confianca: number // 0-100
  nivel_entusiasmo: number // 0-100
  nivel_clareza: number // 0-100
  keywords_emocionais: string[]
  score_geral: number // 0-100
  observacoes?: string
}

interface AnaliseEmocionalProps {
  analise: AnaliseEmocionalData
  className?: string
}

export default function AnaliseEmocional({ analise, className = '' }: AnaliseEmocionalProps) {
  // Determinar cor do score geral
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-blue-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  // Determinar cor de fundo do score
  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200'
    if (score >= 60) return 'bg-blue-50 border-blue-200'
    if (score >= 40) return 'bg-yellow-50 border-yellow-200'
    return 'bg-red-50 border-red-200'
  }

  // Ícone e cor para tom emocional
  const getTomEmocionalDisplay = () => {
    switch (analise.tom_emocional) {
      case 'positivo':
        return {
          icon: <Smile className="w-6 h-6" />,
          label: 'Positivo',
          color: 'text-green-600',
          bgColor: 'bg-green-100',
        }
      case 'neutro':
        return {
          icon: <Meh className="w-6 h-6" />,
          label: 'Neutro',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
        }
      case 'negativo':
        return {
          icon: <Frown className="w-6 h-6" />,
          label: 'Negativo',
          color: 'text-red-600',
          bgColor: 'bg-red-100',
        }
    }
  }

  const tomDisplay = getTomEmocionalDisplay()

  // Classificar keywords em positivas/negativas/neutras (simplificado)
  const palavrasPositivas = [
    'apaixonado',
    'entusiasmado',
    'confiante',
    'motivado',
    'conquista',
    'sucesso',
    'excelente',
    'ótimo',
    'amor',
    'feliz',
    'alegre',
    'positivo',
    'crescimento',
    'oportunidade',
  ]

  const palavrasNegativas = [
    'difícil',
    'problema',
    'desafio',
    'receio',
    'medo',
    'inseguro',
    'preocupado',
    'negativo',
    'frustrado',
    'estresse',
    'ansioso',
    'complicado',
  ]

  const getKeywordColor = (keyword: string) => {
    const kw = keyword.toLowerCase()
    if (palavrasPositivas.some((p) => kw.includes(p))) {
      return 'bg-green-100 text-green-800 border-green-200'
    }
    if (palavrasNegativas.some((p) => kw.includes(p))) {
      return 'bg-red-100 text-red-800 border-red-200'
    }
    return 'bg-gray-100 text-gray-800 border-gray-200'
  }

  return (
    <div className={`bg-white rounded-xl border-2 border-gray-200 shadow-lg ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-bold text-gray-900">Análise Emocional</h3>
        </div>
        <p className="text-sm text-gray-600 mt-1">Insights extraídos pela IA</p>
      </div>

      {/* Body */}
      <div className="p-6 space-y-6">
        {/* Score Geral - Destaque */}
        <div className={`rounded-xl border-2 p-6 ${getScoreBgColor(analise.score_geral)}`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Score Geral</span>
              </div>
              <p className="text-xs text-gray-600">Avaliação holística da comunicação</p>
            </div>
            <div className="text-center">
              <div className={`text-5xl font-bold ${getScoreColor(analise.score_geral)}`}>
                {analise.score_geral}
              </div>
              <div className="text-sm text-gray-600 font-medium">/ 100</div>
            </div>
          </div>
        </div>

        {/* Tom Emocional */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Tom Emocional</span>
          </div>
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${tomDisplay.bgColor} ${tomDisplay.color}`}
          >
            {tomDisplay.icon}
            <span className="font-semibold">{tomDisplay.label}</span>
          </div>
        </div>

        {/* Barras de Progresso */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Métricas Detalhadas</span>
          </div>

          {/* Confiança */}
          <ProgressBar
            label="Confiança"
            value={analise.nivel_confianca}
            color="blue"
            icon="💪"
          />

          {/* Entusiasmo */}
          <ProgressBar
            label="Entusiasmo"
            value={analise.nivel_entusiasmo}
            color="orange"
            icon="🔥"
          />

          {/* Clareza */}
          <ProgressBar
            label="Clareza"
            value={analise.nivel_clareza}
            color="green"
            icon="💎"
          />

          {/* Score Geral (repetido como barra) */}
          <ProgressBar
            label="Score Geral"
            value={analise.score_geral}
            color="purple"
            icon="⭐"
          />
        </div>

        {/* Keywords Emocionais */}
        {analise.keywords_emocionais && analise.keywords_emocionais.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Keywords Emocionais</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {analise.keywords_emocionais.map((keyword, index) => (
                <span
                  key={index}
                  className={`px-3 py-1 rounded-full text-sm font-medium border ${getKeywordColor(
                    keyword
                  )}`}
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Observações */}
        {analise.observacoes && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-blue-900 mb-1">Observações</h4>
                <p className="text-sm text-blue-800">{analise.observacoes}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Componente auxiliar: Barra de Progresso
 */
interface ProgressBarProps {
  label: string
  value: number // 0-100
  color: 'blue' | 'green' | 'orange' | 'purple' | 'red'
  icon?: string
}

function ProgressBar({ label, value, color, icon }: ProgressBarProps) {
  const getColorClasses = () => {
    switch (color) {
      case 'blue':
        return {
          bg: 'bg-blue-500',
          light: 'bg-blue-100',
          text: 'text-blue-700',
        }
      case 'green':
        return {
          bg: 'bg-green-500',
          light: 'bg-green-100',
          text: 'text-green-700',
        }
      case 'orange':
        return {
          bg: 'bg-orange-500',
          light: 'bg-orange-100',
          text: 'text-orange-700',
        }
      case 'purple':
        return {
          bg: 'bg-purple-500',
          light: 'bg-purple-100',
          text: 'text-purple-700',
        }
      case 'red':
        return {
          bg: 'bg-red-500',
          light: 'bg-red-100',
          text: 'text-red-700',
        }
    }
  }

  const colors = getColorClasses()

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon && <span className="text-base">{icon}</span>}
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        <span className={`text-sm font-bold ${colors.text}`}>{value}%</span>
      </div>
      <div className={`w-full h-3 rounded-full ${colors.light} overflow-hidden`}>
        <div
          className={`h-full ${colors.bg} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}
