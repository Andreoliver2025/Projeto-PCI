'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Save, Sparkles, Info } from 'lucide-react'
import { PERFIS_IDEAIS_TEMPLATE, type PerfilIdeal, criarPerfilIdealVazio } from '@/lib/tipos/perfil-ideal'

export default function DefinirPerfilIdeal() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const processoId = searchParams.get('processo')
  const funcaoId = searchParams.get('funcao')

  const [templateSelecionado, setTemplateSelecionado] = useState<string | null>(null)
  const [perfil, setPerfil] = useState<PerfilIdeal>(criarPerfilIdealVazio('Nova Função'))
  const [loading, setLoading] = useState(false)

  const aplicarTemplate = (key: string) => {
    setTemplateSelecionado(key)
    setPerfil(PERFIS_IDEAIS_TEMPLATE[key])
  }

  const atualizarRange = (
    dimensao: keyof PerfilIdeal,
    campo: 'min' | 'max' | 'peso',
    valor: number
  ) => {
    setPerfil({
      ...perfil,
      [dimensao]: {
        ...(perfil[dimensao] as any),
        [campo]: valor,
      },
    })
  }

  const salvarPerfil = async () => {
    if (!funcaoId) {
      alert('ID da função não encontrado')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/funcoes/${funcaoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ perfil_ideal: perfil }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao salvar perfil ideal')
      }

      const data = await response.json()
      console.log('Perfil ideal salvo com sucesso:', data)

      // Redirecionar para a página do processo
      router.push(`/dashboard/processo/${processoId}`)
    } catch (error) {
      console.error('Erro ao salvar perfil ideal:', error)
      alert(
        error instanceof Error
          ? error.message
          : 'Erro ao salvar perfil ideal. Tente novamente.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-secondary-200">
        <div className="container-wide py-3">
          <div className="flex items-center gap-3 mb-2">
            <button onClick={() => router.back()} className="btn-ghost p-2">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-title text-textPrimary">Definir Perfil Ideal da Função</h1>
          </div>
          <p className="text-caption text-textSecondary ml-11">
            Configure os ranges comportamentais esperados para esta função. Isso ajudará a calcular o fit dos candidatos.
          </p>
        </div>
      </header>

      <main className="container-wide py-6">
        {/* Templates Pré-configurados */}
        <div className="card mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-primary" aria-hidden="true" />
            <h2 className="text-title">Templates Pré-configurados</h2>
          </div>
          <p className="text-body text-textSecondary mb-3">
            Escolha um template como ponto de partida ou crie um perfil customizado.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(PERFIS_IDEAIS_TEMPLATE).map(([key, template]) => (
              <button
                key={key}
                onClick={() => aplicarTemplate(key)}
                className={`card-interactive text-left p-3 ${
                  templateSelecionado === key ? 'border-primary bg-primary/5' : ''
                }`}
              >
                <h3 className="font-medium text-textPrimary mb-1">{template.nome_funcao}</h3>
                <p className="text-caption text-textSecondary">{template.descricao}</p>
              </button>
            ))}

            <button
              onClick={() => {
                setTemplateSelecionado('custom')
                setPerfil(criarPerfilIdealVazio('Função Customizada'))
              }}
              className={`card-interactive text-left p-3 border-2 border-dashed ${
                templateSelecionado === 'custom' ? 'border-primary bg-primary/5' : 'border-secondary-300'
              }`}
            >
              <h3 className="font-medium text-textPrimary mb-1">Customizado</h3>
              <p className="text-caption text-textSecondary">Criar do zero</p>
            </button>
          </div>
        </div>

        {/* Editor de Ranges - DISC */}
        {templateSelecionado && (
          <>
            <div className="card mb-6">
              <h2 className="text-title mb-3">DISC - Ranges</h2>
              <p className="text-caption text-textSecondary mb-4">
                Defina os valores mínimo e máximo esperados para cada dimensão (0-100).
                O peso determina a importância dessa dimensão no cálculo final.
              </p>

              <div className="space-md">
                {/* Dominância */}
                <RangeEditor
                  label="Dominância (D)"
                  descricao="Orientação para resultados, decisão, controle"
                  min={perfil.disc_d.min}
                  max={perfil.disc_d.max}
                  peso={perfil.disc_d.peso}
                  onChangeMin={(v) => atualizarRange('disc_d', 'min', v)}
                  onChangeMax={(v) => atualizarRange('disc_d', 'max', v)}
                  onChangePeso={(v) => atualizarRange('disc_d', 'peso', v)}
                />

                {/* Influência */}
                <RangeEditor
                  label="Influência (I)"
                  descricao="Sociabilidade, persuasão, entusiasmo"
                  min={perfil.disc_i.min}
                  max={perfil.disc_i.max}
                  peso={perfil.disc_i.peso}
                  onChangeMin={(v) => atualizarRange('disc_i', 'min', v)}
                  onChangeMax={(v) => atualizarRange('disc_i', 'max', v)}
                  onChangePeso={(v) => atualizarRange('disc_i', 'peso', v)}
                />

                {/* Estabilidade */}
                <RangeEditor
                  label="Estabilidade (S)"
                  descricao="Paciência, consistência, colaboração"
                  min={perfil.disc_s.min}
                  max={perfil.disc_s.max}
                  peso={perfil.disc_s.peso}
                  onChangeMin={(v) => atualizarRange('disc_s', 'min', v)}
                  onChangeMax={(v) => atualizarRange('disc_s', 'max', v)}
                  onChangePeso={(v) => atualizarRange('disc_s', 'peso', v)}
                />

                {/* Conformidade */}
                <RangeEditor
                  label="Conformidade (C)"
                  descricao="Precisão, análise, atenção aos detalhes"
                  min={perfil.disc_c.min}
                  max={perfil.disc_c.max}
                  peso={perfil.disc_c.peso}
                  onChangeMin={(v) => atualizarRange('disc_c', 'min', v)}
                  onChangeMax={(v) => atualizarRange('disc_c', 'max', v)}
                  onChangePeso={(v) => atualizarRange('disc_c', 'peso', v)}
                />
              </div>
            </div>

            {/* Editor de Ranges - MBTI */}
            <div className="card mb-6">
              <h2 className="text-title mb-3">MBTI - Ranges</h2>
              <p className="text-caption text-textSecondary mb-4">
                Valores próximos a 100 indicam preferência pelo primeiro polo (E, S, T, J).
                Valores próximos a 0 indicam preferência pelo segundo polo (I, N, F, P).
              </p>

              <div className="space-md">
                {/* Extroversão-Introversão */}
                <RangeEditor
                  label="Extroversão (E) ↔ Introversão (I)"
                  descricao="100 = muito extrovertido | 0 = muito introvertido"
                  min={perfil.mbti_e_i.min}
                  max={perfil.mbti_e_i.max}
                  peso={perfil.mbti_e_i.peso}
                  onChangeMin={(v) => atualizarRange('mbti_e_i', 'min', v)}
                  onChangeMax={(v) => atualizarRange('mbti_e_i', 'max', v)}
                  onChangePeso={(v) => atualizarRange('mbti_e_i', 'peso', v)}
                />

                {/* Sensorial-Intuitivo */}
                <RangeEditor
                  label="Sensorial (S) ↔ Intuitivo (N)"
                  descricao="100 = sensorial/prático | 0 = intuitivo/abstrato"
                  min={perfil.mbti_s_n.min}
                  max={perfil.mbti_s_n.max}
                  peso={perfil.mbti_s_n.peso}
                  onChangeMin={(v) => atualizarRange('mbti_s_n', 'min', v)}
                  onChangeMax={(v) => atualizarRange('mbti_s_n', 'max', v)}
                  onChangePeso={(v) => atualizarRange('mbti_s_n', 'peso', v)}
                />

                {/* Pensamento-Sentimento */}
                <RangeEditor
                  label="Pensamento (T) ↔ Sentimento (F)"
                  descricao="100 = lógico/objetivo | 0 = empático/subjetivo"
                  min={perfil.mbti_t_f.min}
                  max={perfil.mbti_t_f.max}
                  peso={perfil.mbti_t_f.peso}
                  onChangeMin={(v) => atualizarRange('mbti_t_f', 'min', v)}
                  onChangeMax={(v) => atualizarRange('mbti_t_f', 'max', v)}
                  onChangePeso={(v) => atualizarRange('mbti_t_f', 'peso', v)}
                />

                {/* Julgamento-Percepção */}
                <RangeEditor
                  label="Julgamento (J) ↔ Percepção (P)"
                  descricao="100 = estruturado/planejador | 0 = flexível/espontâneo"
                  min={perfil.mbti_j_p.min}
                  max={perfil.mbti_j_p.max}
                  peso={perfil.mbti_j_p.peso}
                  onChangeMin={(v) => atualizarRange('mbti_j_p', 'min', v)}
                  onChangeMax={(v) => atualizarRange('mbti_j_p', 'max', v)}
                  onChangePeso={(v) => atualizarRange('mbti_j_p', 'peso', v)}
                />
              </div>
            </div>

            {/* Ações */}
            <div className="flex justify-end gap-3">
              <button onClick={() => router.back()} className="btn-outline">
                Cancelar
              </button>
              <button onClick={salvarPerfil} disabled={loading} className="btn-primary">
                <Save className="w-5 h-5" />
                {loading ? 'Salvando...' : 'Salvar Perfil Ideal'}
              </button>
            </div>
          </>
        )}

        {/* Empty state */}
        {!templateSelecionado && (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Info className="w-8 h-8 text-secondary-500" />
            </div>
            <p className="text-body text-textSecondary">
              Selecione um template acima para começar a configurar o perfil ideal.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

// Componente auxiliar para editar ranges
interface RangeEditorProps {
  label: string
  descricao: string
  min: number
  max: number
  peso: number
  onChangeMin: (v: number) => void
  onChangeMax: (v: number) => void
  onChangePeso: (v: number) => void
}

function RangeEditor({
  label,
  descricao,
  min,
  max,
  peso,
  onChangeMin,
  onChangeMax,
  onChangePeso,
}: RangeEditorProps) {
  return (
    <div className="card-flat">
      <div className="mb-2">
        <h3 className="font-medium text-textPrimary">{label}</h3>
        <p className="text-caption text-textSecondary">{descricao}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Min */}
        <div>
          <label className="input-label">Mínimo ({min})</label>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={min}
            onChange={(e) => onChangeMin(Number(e.target.value))}
            className="w-full h-2 bg-secondary-200 rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>

        {/* Max */}
        <div>
          <label className="input-label">Máximo ({max})</label>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={max}
            onChange={(e) => onChangeMax(Number(e.target.value))}
            className="w-full h-2 bg-secondary-200 rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>

        {/* Peso */}
        <div>
          <label className="input-label">
            Peso ({(peso * 100).toFixed(0)}%)
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={peso}
            onChange={(e) => onChangePeso(Number(e.target.value))}
            className="w-full h-2 bg-secondary-200 rounded-lg appearance-none cursor-pointer accent-accent"
          />
        </div>
      </div>

      {/* Visual do range */}
      <div className="mt-2 relative h-2 bg-secondary-200 rounded-full">
        <div
          className="absolute h-full bg-primary/30 rounded-full"
          style={{
            left: `${min}%`,
            width: `${max - min}%`,
          }}
        />
      </div>
    </div>
  )
}
