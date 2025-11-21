'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChevronRight, CheckCircle, Clock } from 'lucide-react'
import AudioRecorder from '@/components/AudioRecorder'

interface Pergunta {
  id: string
  texto: string
  ordem: number
  tempo_limite_segundos: number
}

export default function RespostaPerguntasPage() {
  const params = useParams()
  const router = useRouter()
  const processoId = params.id as string

  const [perguntas, setPerguntas] = useState<Pergunta[]>([])
  const [perguntaAtual, setPerguntaAtual] = useState(0)
  const [loading, setLoading] = useState(true)
  const [uploadando, setUploadando] = useState(false)
  const [candidatoId, setCandidatoId] = useState<string | null>(null)
  const [concluido, setConcluido] = useState(false)

  useEffect(() => {
    inicializar()
  }, [processoId])

  const inicializar = async () => {
    try {
      // Buscar candidato ID
      const resCandidato = await fetch(`/api/candidato/processo/${processoId}`)
      if (!resCandidato.ok) throw new Error('Candidato não encontrado')
      const dataCandidato = await resCandidato.json()
      setCandidatoId(dataCandidato.candidato.id)

      // Buscar perguntas
      const res = await fetch(`/api/processos/${processoId}/perguntas`)
      const data = await res.json()
      setPerguntas(data.perguntas || [])

      // Buscar respostas já enviadas
      const resRespostas = await fetch(
        `/api/respostas-audio?candidato_id=${dataCandidato.candidato.id}`
      )
      const dataRespostas = await resRespostas.json()
      const respondidas = dataRespostas.respostas?.length || 0

      // Se já respondeu tudo
      if (respondidas === data.perguntas.length && data.perguntas.length > 0) {
        setConcluido(true)
      } else {
        // Ir para primeira pergunta não respondida
        setPerguntaAtual(respondidas)
      }
    } catch (error) {
      console.error('Erro ao inicializar:', error)
      alert('Erro ao carregar perguntas. Verifique se você é candidato deste processo.')
    } finally {
      setLoading(false)
    }
  }

  const handleAudioReady = async (blob: Blob, duracao: number) => {
    if (!candidatoId || !perguntas[perguntaAtual]) return

    setUploadando(true)
    try {
      // 1. Upload do áudio
      const formData = new FormData()
      formData.append('audio', blob, 'resposta.webm')
      formData.append('candidato_id', candidatoId)
      formData.append('pergunta_id', perguntas[perguntaAtual].id)

      const resUpload = await fetch('/api/upload-audio', {
        method: 'POST',
        body: formData,
      })

      if (!resUpload.ok) throw new Error('Erro no upload')
      const dataUpload = await resUpload.json()

      // 2. Salvar resposta
      const resSalvar = await fetch('/api/respostas-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidato_id: candidatoId,
          pergunta_id: perguntas[perguntaAtual].id,
          arquivo_url: dataUpload.url,
          duracao_segundos: duracao,
          transcrever: true,
        }),
      })

      if (!resSalvar.ok) throw new Error('Erro ao salvar resposta')

      // 3. Avançar ou concluir
      if (perguntaAtual < perguntas.length - 1) {
        setPerguntaAtual(perguntaAtual + 1)
      } else {
        setConcluido(true)
      }
    } catch (error) {
      console.error('Erro ao enviar resposta:', error)
      alert('Erro ao enviar resposta. Tente novamente.')
    } finally {
      setUploadando(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Carregando perguntas...</div>
      </div>
    )
  }

  if (perguntas.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Nenhuma pergunta disponível</h2>
          <p className="text-gray-600 mb-6">
            O processo ainda não possui perguntas configuradas.
          </p>
          <button onClick={() => router.back()} className="btn-primary">
            Voltar
          </button>
        </div>
      </div>
    )
  }

  if (concluido) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card text-center max-w-md">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Respostas Enviadas!</h2>
          <p className="text-gray-600 mb-6">
            Todas as suas respostas foram enviadas com sucesso. A equipe de
            recrutamento analisará seu perfil em breve.
          </p>
          <button
            onClick={() => router.push('/candidato/dashboard')}
            className="btn-primary"
          >
            Ir para Dashboard
          </button>
        </div>
      </div>
    )
  }

  const pergunta = perguntas[perguntaAtual]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Pergunta {perguntaAtual + 1} de {perguntas.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(((perguntaAtual + 1) / perguntas.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((perguntaAtual + 1) / perguntas.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Pergunta */}
        <div className="card mb-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-semibold">
              {pergunta.ordem}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {pergunta.texto}
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>
                  Tempo limite: {Math.floor(pergunta.tempo_limite_segundos / 60)}:
                  {(pergunta.tempo_limite_segundos % 60).toString().padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>

          {/* Dica */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Dica:</strong> Respire fundo, organize suas ideias e seja
              autêntico. Não há resposta certa ou errada, queremos conhecer você!
            </p>
          </div>
        </div>

        {/* Audio Recorder */}
        {uploadando ? (
          <div className="card text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-lg font-medium">Enviando sua resposta...</p>
            <p className="text-sm text-gray-500 mt-2">
              Por favor, aguarde enquanto processamos seu áudio
            </p>
          </div>
        ) : (
          <AudioRecorder
            onAudioReady={handleAudioReady}
            maxDuration={pergunta.tempo_limite_segundos}
          />
        )}

        {/* Navegação */}
        <div className="mt-6 flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-800"
          >
            ← Sair
          </button>
          <p className="text-sm text-gray-500">
            {perguntas.length - perguntaAtual - 1 > 0 ? (
              <>
                {perguntas.length - perguntaAtual - 1} pergunta
                {perguntas.length - perguntaAtual - 1 !== 1 ? 's' : ''} restante
                {perguntas.length - perguntaAtual - 1 !== 1 ? 's' : ''}
              </>
            ) : (
              'Última pergunta'
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
