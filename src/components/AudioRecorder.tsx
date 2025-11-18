'use client'

import { useState, useRef, useEffect } from 'react'
import { Mic, Square, Play, Pause, Trash2, Upload } from 'lucide-react'

// Item 8 do Build Sequence: Gravação de áudio via MediaRecorder API

interface AudioRecorderProps {
  onAudioReady: (blob: Blob, duration: number) => void
  maxDuration?: number // segundos
}

export default function AudioRecorder({ onAudioReady, maxDuration = 120 }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (audioUrl) URL.revokeObjectURL(audioUrl)
    }
  }, [audioUrl])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      })

      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)

        // Parar todas as tracks
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setDuration(0)

      // Timer
      timerRef.current = setInterval(() => {
        setDuration(prev => {
          const newDuration = prev + 1
          if (newDuration >= maxDuration) {
            stopRecording()
          }
          return newDuration
        })
      }, 1000)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Erro ao acessar microfone. Verifique as permissões.')
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume()
        if (timerRef.current) clearInterval(timerRef.current)
        timerRef.current = setInterval(() => {
          setDuration(prev => prev + 1)
        }, 1000)
      } else {
        mediaRecorderRef.current.pause()
        if (timerRef.current) clearInterval(timerRef.current)
      }
      setIsPaused(!isPaused)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const deleteRecording = () => {
    setAudioBlob(null)
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
      setAudioUrl(null)
    }
    setDuration(0)
    setCurrentTime(0)
  }

  const confirmAudio = () => {
    if (audioBlob) {
      onAudioReady(audioBlob, duration)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Gravação de Resposta</h3>

      {/* Timer / Player */}
      <div className="flex items-center justify-center mb-6">
        <div className={`text-4xl font-mono ${isRecording ? 'text-alert' : 'text-textPrimary'}`}>
          {formatTime(audioUrl ? currentTime : duration)}
        </div>
        {maxDuration && (
          <span className="text-gray-500 ml-2">/ {formatTime(maxDuration)}</span>
        )}
      </div>

      {/* Waveform Visual (simplified) */}
      {isRecording && (
        <div className="flex items-center justify-center gap-1 h-16 mb-6">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-alert rounded-full animate-pulse"
              style={{
                height: `${Math.random() * 60 + 20}%`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Audio Player */}
      {audioUrl && !isRecording && (
        <div className="mb-6">
          <audio
            ref={audioRef}
            src={audioUrl}
            controls
            className="w-full"
            onTimeUpdate={(e) => setCurrentTime(Math.floor(e.currentTarget.currentTime))}
          />
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-3 justify-center">
        {!isRecording && !audioBlob && (
          <button onClick={startRecording} className="btn-primary flex items-center gap-2">
            <Mic className="w-5 h-5" />
            Iniciar Gravação
          </button>
        )}

        {isRecording && (
          <>
            <button onClick={pauseRecording} className="btn-secondary flex items-center gap-2">
              {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
              {isPaused ? 'Retomar' : 'Pausar'}
            </button>
            <button onClick={stopRecording} className="btn-outline flex items-center gap-2">
              <Square className="w-5 h-5" />
              Parar
            </button>
          </>
        )}

        {audioBlob && !isRecording && (
          <>
            <button onClick={deleteRecording} className="btn-outline text-alert border-alert flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Deletar
            </button>
            <button onClick={confirmAudio} className="btn-primary flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Confirmar
            </button>
          </>
        )}
      </div>

      {/* Info */}
      <div className="mt-4 text-sm text-gray-600 text-center">
        {isRecording && !isPaused && (
          <p className="flex items-center justify-center gap-2">
            <span className="w-2 h-2 bg-alert rounded-full animate-pulse" />
            Gravando...
          </p>
        )}
        {isPaused && <p>Gravação pausada</p>}
        {!isRecording && !audioBlob && (
          <p>Tempo máximo: {maxDuration} segundos</p>
        )}
      </div>
    </div>
  )
}
