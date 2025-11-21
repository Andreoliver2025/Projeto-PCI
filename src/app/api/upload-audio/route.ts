import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * POST /api/upload-audio
 * Faz upload de áudio para Supabase Storage
 * Formato: {candidato_id}/{pergunta_id}_{timestamp}.webm
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse FormData
    const formData = await req.formData()
    const audioBlob = formData.get('audio') as File
    const candidatoId = formData.get('candidato_id') as string
    const perguntaId = formData.get('pergunta_id') as string

    if (!audioBlob || !candidatoId || !perguntaId) {
      return NextResponse.json(
        { error: 'Audio, candidato_id e pergunta_id são obrigatórios' },
        { status: 400 }
      )
    }

    // Validar tipo de arquivo
    if (!audioBlob.type.includes('audio')) {
      return NextResponse.json(
        { error: 'Arquivo deve ser um áudio' },
        { status: 400 }
      )
    }

    // Gerar nome do arquivo
    const timestamp = Date.now()
    const fileExtension = audioBlob.type.split('/')[1] || 'webm'
    const fileName = `${candidatoId}/${perguntaId}_${timestamp}.${fileExtension}`

    // Converter File para ArrayBuffer
    const arrayBuffer = await audioBlob.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload para Supabase Storage
    const { data, error } = await supabase.storage
      .from('audio-respostas')
      .upload(fileName, buffer, {
        contentType: audioBlob.type,
        upsert: false,
      })

    if (error) {
      console.error('Erro ao fazer upload:', error)
      throw error
    }

    // Obter URL pública
    const { data: publicUrlData } = supabase.storage
      .from('audio-respostas')
      .getPublicUrl(fileName)

    return NextResponse.json({
      url: publicUrlData.publicUrl,
      path: fileName,
      size: audioBlob.size,
    })
  } catch (error: any) {
    console.error('Erro no upload de áudio:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao fazer upload do áudio' },
      { status: 500 }
    )
  }
}
