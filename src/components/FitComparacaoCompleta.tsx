'use client'

import { useState } from 'react'
import { Users, Briefcase, Crown } from 'lucide-react'
import type { PerfilComportamental } from '@/types/database.types'
import type { PerfilIdeal } from '@/lib/tipos/perfil-ideal'
import FitChart from './FitChart'
import FitIdealChart from './FitIdealChart'
import { calcularFit } from '@/lib/fit-analysis'
import { calcularFitIdeal } from '@/lib/fit-ideal'

interface FitComparacaoCompletaProps {
  candidato: PerfilComportamental
  funcaoIdeal: PerfilIdeal
  lider?: PerfilComportamental | null
  nomeCandidato?: string
  nomeLider?: string
  className?: string
}

type AbaAtiva = 'funcao' | 'lider' | 'ambos'

/**
 * Componente completo de comparação de fit
 * Mostra 3 análises:
 * 1. Candidato vs Função (ideal)
 * 2. Candidato vs Líder
 * 3. Visão consolidada
 */
export default function FitComparacaoCompleta({
  candidato,
  funcaoIdeal,
  lider,
  nomeCandidato = 'Candidato',
  nomeLider = 'Líder',
  className = '',
}: FitComparacaoCompletaProps) {
  const [abaAtiva, setAbaAtiva] = useState<AbaAtiva>('funcao')

  // Calcular fits
  const fitFuncao = calcularFitIdeal(candidato, funcaoIdeal)
  const fitLider = lider ? calcularFit(candidato, lider) : null

  // Score médio
  const scoreMedio = fitLider
    ? Math.round((fitFuncao.score_geral + fitLider.score_geral) / 2)
    : fitFuncao.score_geral

  return (
    <div className={className}>
      {/* Header com scores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        {/* Fit Função */}
        <div className="card-flat">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="w-4 h-4 text-primary" aria-hidden="true" />
            <span className="text-caption font-medium text-textSecondary">
              Fit com Função
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-primary">
              {fitFuncao.score_geral}
            </span>
            <span className="text-caption text-textSecondary">/100</span>
          </div>
          <span
            className={`badge mt-2 ${
              fitFuncao.nivel === 'alto'
                ? 'badge-accent'
                : fitFuncao.nivel === 'medio'
                ? 'badge-primary'
                : 'badge-error'
            }`}
          >
            {fitFuncao.nivel === 'alto'
              ? 'Alto'
              : fitFuncao.nivel === 'medio'
              ? 'Médio'
              : 'Baixo'}
          </span>
        </div>

        {/* Fit Líder */}
        {fitLider ? (
          <div className="card-flat">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-4 h-4 text-accent" aria-hidden="true" />
              <span className="text-caption font-medium text-textSecondary">
                Fit com Líder
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-accent">
                {fitLider.score_geral}
              </span>
              <span className="text-caption text-textSecondary">/100</span>
            </div>
            <span
              className={`badge mt-2 ${
                fitLider.nivel === 'alto'
                  ? 'badge-accent'
                  : fitLider.nivel === 'medio'
                  ? 'badge-primary'
                  : 'badge-error'
              }`}
            >
              {fitLider.nivel === 'alto'
                ? 'Alto'
                : fitLider.nivel === 'medio'
                ? 'Médio'
                : 'Baixo'}
            </span>
          </div>
        ) : (
          <div className="card-flat opacity-50">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-4 h-4 text-secondary-500" aria-hidden="true" />
              <span className="text-caption font-medium text-textSecondary">
                Fit com Líder
              </span>
            </div>
            <p className="text-caption text-textSecondary">
              Líder ainda não completou os testes
            </p>
          </div>
        )}

        {/* Score Consolidado */}
        <div className="card-highlighted">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-primary" aria-hidden="true" />
            <span className="text-caption font-medium text-textPrimary">
              Score Consolidado
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-primary">
              {scoreMedio}
            </span>
            <span className="text-caption text-textSecondary">/100</span>
          </div>
          <p className="text-caption text-textSecondary mt-1">
            Média entre função e líder
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b border-secondary-200">
        <button
          onClick={() => setAbaAtiva('funcao')}
          className={`px-3 py-2 text-caption font-medium transition-colors border-b-2 ${
            abaAtiva === 'funcao'
              ? 'border-primary text-primary'
              : 'border-transparent text-textSecondary hover:text-textPrimary'
          }`}
        >
          <Briefcase className="w-4 h-4 inline-block mr-1" aria-hidden="true" />
          vs Função
        </button>

        {lider && (
          <button
            onClick={() => setAbaAtiva('lider')}
            className={`px-3 py-2 text-caption font-medium transition-colors border-b-2 ${
              abaAtiva === 'lider'
                ? 'border-accent text-accent'
                : 'border-transparent text-textSecondary hover:text-textPrimary'
            }`}
          >
            <Crown className="w-4 h-4 inline-block mr-1" aria-hidden="true" />
            vs Líder
          </button>
        )}

        {lider && (
          <button
            onClick={() => setAbaAtiva('ambos')}
            className={`px-3 py-2 text-caption font-medium transition-colors border-b-2 ${
              abaAtiva === 'ambos'
                ? 'border-primary text-primary'
                : 'border-transparent text-textSecondary hover:text-textPrimary'
            }`}
          >
            <Users className="w-4 h-4 inline-block mr-1" aria-hidden="true" />
            Visão Completa
          </button>
        )}
      </div>

      {/* Conteúdo das abas */}
      <div className="card">
        {abaAtiva === 'funcao' && (
          <div>
            <h3 className="text-title mb-3">
              Compatibilidade com {funcaoIdeal.nome_funcao}
            </h3>
            <FitIdealChart
              perfil={candidato}
              ideal={funcaoIdeal}
              labelPerfil={nomeCandidato}
            />
            <div className="mt-4 p-3 bg-secondary-50 rounded-lg">
              <p className="text-body font-medium text-textPrimary mb-1">
                Recomendação:
              </p>
              <p className="text-caption text-textSecondary">
                {fitFuncao.recomendacao}
              </p>
            </div>
          </div>
        )}

        {abaAtiva === 'lider' && lider && fitLider && (
          <div>
            <h3 className="text-title mb-3">
              Compatibilidade com {nomeLider}
            </h3>
            <FitChart
              perfil1={candidato}
              perfil2={lider}
              label1={nomeCandidato}
              label2={nomeLider}
            />
            <div className="mt-4 p-3 bg-secondary-50 rounded-lg">
              <p className="text-body font-medium text-textPrimary mb-1">
                Recomendação:
              </p>
              <p className="text-caption text-textSecondary">
                {fitLider.recomendacao}
              </p>
            </div>
          </div>
        )}

        {abaAtiva === 'ambos' && lider && fitLider && (
          <div>
            <h3 className="text-title mb-4">Análise Consolidada</h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              {/* Dimensões DISC comparadas */}
              <div>
                <h4 className="text-caption font-medium text-textPrimary mb-2">
                  DISC - Função
                </h4>
                <div className="space-sm">
                  {['disc_d', 'disc_i', 'disc_s', 'disc_c'].map((dim) => {
                    const key = dim as keyof Pick<
                      typeof fitFuncao.detalhes,
                      'disc_d' | 'disc_i' | 'disc_s' | 'disc_c'
                    >
                    const detalhe = fitFuncao.detalhes[key]
                    return (
                      <div key={dim} className="flex justify-between text-caption">
                        <span className="text-textSecondary">
                          {dim.replace('disc_', '').toUpperCase()}:
                        </span>
                        <span
                          className={
                            detalhe.dentro_range ? 'text-accent' : 'text-textPrimary'
                          }
                        >
                          {detalhe.valor} {detalhe.dentro_range ? '✓' : ''}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div>
                <h4 className="text-caption font-medium text-textPrimary mb-2">
                  DISC - Líder
                </h4>
                <div className="space-sm">
                  {['d', 'i', 's', 'c'].map((dim) => {
                    const key = dim as keyof typeof fitLider.detalhes.disc_match
                    const score = fitLider.detalhes.disc_match[key]
                    return (
                      <div key={dim} className="flex justify-between text-caption">
                        <span className="text-textSecondary">
                          {dim.toUpperCase()}:
                        </span>
                        <span className="text-textPrimary">{score}%</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Conclusão */}
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-body font-medium text-primary mb-2">
                💡 Análise Final
              </p>
              <p className="text-caption text-textSecondary mb-2">
                <strong>Função:</strong> {fitFuncao.recomendacao}
              </p>
              <p className="text-caption text-textSecondary">
                <strong>Líder:</strong> {fitLider.recomendacao}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
