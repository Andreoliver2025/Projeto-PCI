-- Configuração do Storage para áudios de respostas

-- 1. Criar bucket 'audio-respostas' se não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio-respostas', 'audio-respostas', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Políticas de acesso para o bucket
-- 2.1. Permitir que usuários autenticados façam upload
CREATE POLICY "Usuários autenticados podem fazer upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'audio-respostas');

-- 2.2. Permitir leitura pública (para poder reproduzir áudios)
CREATE POLICY "Leitura pública de áudios"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'audio-respostas');

-- 2.3. Permitir que usuários deletem seus próprios uploads
CREATE POLICY "Usuários podem deletar seus uploads"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'audio-respostas');

-- 2.4. Permitir update para service role (para transcrições)
CREATE POLICY "Service role pode atualizar"
ON storage.objects FOR UPDATE
TO service_role
USING (bucket_id = 'audio-respostas');

-- Comentários sobre uso:
-- - Upload: POST /storage/v1/object/audio-respostas/{path}
-- - URL pública: https://{project-ref}.supabase.co/storage/v1/object/public/audio-respostas/{path}
-- - Formato de path: {candidato_id}/{pergunta_id}_{timestamp}.webm
