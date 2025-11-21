# B4 & B5 - Exemplos de Uso

## 📌 Exemplos de Chamadas API

### 1. Criar Pergunta

```typescript
// Admin Dashboard
const criarPergunta = async (processoId: string) => {
  const response = await fetch(`/api/processos/${processoId}/perguntas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      texto: 'Descreva uma situação desafiadora que você enfrentou no trabalho.',
      tempo_limite_segundos: 180,
    }),
  })

  const data = await response.json()
  console.log('Pergunta criada:', data.pergunta)
}
```

### 2. Listar Perguntas

```typescript
const listarPerguntas = async (processoId: string) => {
  const response = await fetch(`/api/processos/${processoId}/perguntas`)
  const data = await response.json()

  data.perguntas.forEach((p: any) => {
    console.log(`${p.ordem}. ${p.texto} (${p.tempo_limite_segundos}s)`)
  })
}
```

### 3. Editar Pergunta

```typescript
const editarPergunta = async (perguntaId: string) => {
  const response = await fetch(`/api/perguntas/${perguntaId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      texto: 'Texto atualizado da pergunta',
      tempo_limite_segundos: 120,
    }),
  })

  const data = await response.json()
  console.log('Pergunta atualizada:', data.pergunta)
}
```

### 4. Deletar Pergunta

```typescript
const deletarPergunta = async (perguntaId: string) => {
  if (!confirm('Tem certeza?')) return

  const response = await fetch(`/api/perguntas/${perguntaId}`, {
    method: 'DELETE',
  })

  const data = await response.json()
  console.log(data.message) // "Pergunta removida com sucesso"
}
```

### 5. Reordenar Perguntas (Trocar Ordem)

```typescript
const moverParaCima = async (pergunta: any, outraPergunta: any) => {
  // Trocar ordens
  await fetch(`/api/perguntas/${pergunta.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ordem: outraPergunta.ordem }),
  })

  await fetch(`/api/perguntas/${outraPergunta.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ordem: pergunta.ordem }),
  })

  // Recarregar lista
}
```

### 6. Upload de Áudio

```typescript
const enviarAudio = async (
  audioBlob: Blob,
  candidatoId: string,
  perguntaId: string
) => {
  const formData = new FormData()
  formData.append('audio', audioBlob, 'resposta.webm')
  formData.append('candidato_id', candidatoId)
  formData.append('pergunta_id', perguntaId)

  const response = await fetch('/api/upload-audio', {
    method: 'POST',
    body: formData,
  })

  const data = await response.json()
  console.log('Upload concluído:', data.url)
  return data.url
}
```

### 7. Salvar Resposta de Áudio

```typescript
const salvarResposta = async (
  candidatoId: string,
  perguntaId: string,
  arquivoUrl: string,
  duracaoSegundos: number
) => {
  const response = await fetch('/api/respostas-audio', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      candidato_id: candidatoId,
      pergunta_id: perguntaId,
      arquivo_url: arquivoUrl,
      duracao_segundos: duracaoSegundos,
      transcrever: true, // Inicia transcrição em background
    }),
  })

  const data = await response.json()
  console.log(data.message) // "Resposta salva. Transcrição em andamento."
}
```

### 8. Fluxo Completo: Gravar e Enviar Resposta

```typescript
const handleAudioReady = async (blob: Blob, duracao: number) => {
  try {
    // 1. Upload
    const formData = new FormData()
    formData.append('audio', blob, 'resposta.webm')
    formData.append('candidato_id', candidatoId)
    formData.append('pergunta_id', perguntaId)

    const uploadRes = await fetch('/api/upload-audio', {
      method: 'POST',
      body: formData,
    })
    const uploadData = await uploadRes.json()

    // 2. Salvar resposta
    const respostaRes = await fetch('/api/respostas-audio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        candidato_id: candidatoId,
        pergunta_id: perguntaId,
        arquivo_url: uploadData.url,
        duracao_segundos: duracao,
        transcrever: true,
      }),
    })

    if (respostaRes.ok) {
      alert('Resposta enviada com sucesso!')
      // Avançar para próxima pergunta
    }
  } catch (error) {
    console.error('Erro:', error)
    alert('Erro ao enviar resposta')
  }
}
```

---

## 🎨 Exemplos de UI

### Component: Select de Tempo Limite

```tsx
const TimeLimitSelect = ({ value, onChange }: Props) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="input"
    >
      <option value={60}>60 segundos (1 min)</option>
      <option value={90}>90 segundos (1.5 min)</option>
      <option value={120}>120 segundos (2 min)</option>
      <option value={180}>180 segundos (3 min)</option>
      <option value={300}>300 segundos (5 min)</option>
    </select>
  )
}
```

### Component: Progress Bar de Perguntas

```tsx
const ProgressBar = ({ atual, total }: Props) => {
  const percentual = ((atual + 1) / total) * 100

  return (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium">
          Pergunta {atual + 1} de {total}
        </span>
        <span className="text-sm text-gray-500">
          {Math.round(percentual)}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all"
          style={{ width: `${percentual}%` }}
        />
      </div>
    </div>
  )
}
```

### Component: Card de Pergunta

```tsx
const PerguntaCard = ({ pergunta, onEdit, onDelete, onMoveUp, onMoveDown }: Props) => {
  return (
    <div className="card flex gap-4">
      {/* Controles de ordem */}
      <div className="flex flex-col gap-1">
        <button onClick={onMoveUp} className="p-1 hover:bg-gray-100 rounded">
          <ArrowUp className="w-4 h-4" />
        </button>
        <GripVertical className="w-4 h-4 text-gray-400" />
        <button onClick={onMoveDown} className="p-1 hover:bg-gray-100 rounded">
          <ArrowDown className="w-4 h-4" />
        </button>
      </div>

      {/* Conteúdo */}
      <div className="flex-1">
        <span className="text-sm font-medium text-primary">
          Pergunta {pergunta.ordem}
        </span>
        <p className="text-gray-800 my-2">{pergunta.texto}</p>
        <p className="text-sm text-gray-500">
          Tempo limite: {pergunta.tempo_limite_segundos}s
        </p>
      </div>

      {/* Ações */}
      <div className="flex gap-2">
        <button onClick={onEdit} className="btn-outline p-2">
          <Edit2 className="w-4 h-4" />
        </button>
        <button onClick={onDelete} className="btn-outline p-2 text-alert">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
```

### Component: Timer Countdown

```tsx
const TimerCountdown = ({ segundos }: Props) => {
  const minutos = Math.floor(segundos / 60)
  const segs = segundos % 60

  return (
    <div className="flex items-center gap-2">
      <Clock className="w-4 h-4" />
      <span className="font-mono text-lg">
        {minutos}:{segs.toString().padStart(2, '0')}
      </span>
    </div>
  )
}
```

---

## 🔧 Exemplos de Configuração

### Supabase Storage Policy (Manual)

```sql
-- Criar bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio-respostas', 'audio-respostas', true);

-- Permitir upload autenticado
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'audio-respostas');

-- Permitir leitura pública
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'audio-respostas');
```

### Variáveis de Ambiente (.env.local)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🧪 Exemplos de Teste (Manual)

### Teste 1: CRUD de Perguntas

```bash
# 1. Criar pergunta
curl -X POST http://localhost:3000/api/processos/UUID/perguntas \
  -H "Content-Type: application/json" \
  -d '{"texto":"Teste?","tempo_limite_segundos":120}'

# 2. Listar perguntas
curl http://localhost:3000/api/processos/UUID/perguntas

# 3. Editar pergunta
curl -X PATCH http://localhost:3000/api/perguntas/UUID \
  -H "Content-Type: application/json" \
  -d '{"texto":"Teste editado"}'

# 4. Deletar pergunta
curl -X DELETE http://localhost:3000/api/perguntas/UUID
```

### Teste 2: Upload de Áudio

```bash
# Upload de áudio de teste
curl -X POST http://localhost:3000/api/upload-audio \
  -F "audio=@test-audio.webm" \
  -F "candidato_id=UUID" \
  -F "pergunta_id=UUID"
```

### Teste 3: Verificar Storage

```javascript
// No console do navegador
const testStorage = async () => {
  const url = 'https://seu-projeto.supabase.co/storage/v1/object/public/audio-respostas/candidato-id/pergunta-id_timestamp.webm'

  const response = await fetch(url)
  console.log('Status:', response.status) // Deve ser 200
  console.log('Content-Type:', response.headers.get('content-type')) // audio/webm
}
```

---

## 📊 Exemplos de Queries SQL

### Buscar perguntas com respostas

```sql
SELECT
  p.id,
  p.texto,
  p.ordem,
  COUNT(r.id) as total_respostas
FROM perguntas_empresa p
LEFT JOIN respostas_audio r ON r.pergunta_id = p.id
WHERE p.processo_id = 'UUID'
GROUP BY p.id
ORDER BY p.ordem;
```

### Candidatos que não responderam todas

```sql
WITH total_perguntas AS (
  SELECT COUNT(*) as total
  FROM perguntas_empresa
  WHERE processo_id = 'UUID'
)
SELECT
  c.id,
  u.nome,
  COUNT(r.id) as respostas_enviadas,
  tp.total as total_perguntas
FROM candidatos c
JOIN usuarios u ON u.id = c.usuario_id
LEFT JOIN respostas_audio r ON r.candidato_id = c.id
CROSS JOIN total_perguntas tp
WHERE c.processo_id = 'UUID'
GROUP BY c.id, u.nome, tp.total
HAVING COUNT(r.id) < tp.total;
```

### Audios por candidato

```sql
SELECT
  r.id,
  p.ordem,
  p.texto,
  r.arquivo_url,
  r.duracao_segundos,
  r.transcricao,
  r.created_at
FROM respostas_audio r
JOIN perguntas_empresa p ON p.id = r.pergunta_id
WHERE r.candidato_id = 'UUID'
ORDER BY p.ordem;
```

---

## 🎯 Casos de Uso Completos

### Caso 1: Admin cria processo com perguntas

```typescript
const criarProcessoCompleto = async () => {
  // 1. Criar processo
  const processoRes = await fetch('/api/processos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nome: 'Vaga Desenvolvedor',
      descricao: 'Processo seletivo',
      nome_funcao: 'Desenvolvedor Full Stack',
      descricao_funcao: 'Desenvolvimento web',
    }),
  })
  const { processo } = await processoRes.json()

  // 2. Adicionar perguntas
  const perguntas = [
    'Fale sobre sua experiência com React',
    'Descreva um projeto desafiador',
    'Como você lida com deadlines apertados?',
  ]

  for (const texto of perguntas) {
    await fetch(`/api/processos/${processo.id}/perguntas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        texto,
        tempo_limite_segundos: 120,
      }),
    })
  }

  console.log('Processo criado com 3 perguntas!')
}
```

### Caso 2: Candidato responde todas as perguntas

```typescript
const responderPerguntas = async (processoId: string) => {
  // 1. Buscar candidato
  const candidatoRes = await fetch(`/api/candidato/processo/${processoId}`)
  const { candidato } = await candidatoRes.json()

  // 2. Buscar perguntas
  const perguntasRes = await fetch(`/api/processos/${processoId}/perguntas`)
  const { perguntas } = await perguntasRes.json()

  // 3. Para cada pergunta (simulado)
  for (const pergunta of perguntas) {
    // Gravar áudio (via AudioRecorder)
    const audioBlob = await gravarAudio(pergunta.tempo_limite_segundos)

    // Upload
    const formData = new FormData()
    formData.append('audio', audioBlob)
    formData.append('candidato_id', candidato.id)
    formData.append('pergunta_id', pergunta.id)

    const uploadRes = await fetch('/api/upload-audio', {
      method: 'POST',
      body: formData,
    })
    const { url } = await uploadRes.json()

    // Salvar resposta
    await fetch('/api/respostas-audio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        candidato_id: candidato.id,
        pergunta_id: pergunta.id,
        arquivo_url: url,
        duracao_segundos: 95,
        transcrever: true,
      }),
    })

    console.log(`Pergunta ${pergunta.ordem} respondida!`)
  }

  console.log('Todas as perguntas respondidas!')
}
```

---

**Nota:** Estes são exemplos simplificados. Sempre adicione tratamento de erros, validações e feedback ao usuário na implementação real.
