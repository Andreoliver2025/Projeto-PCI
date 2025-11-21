# B4 & B5 - Setup e Documentação

## Resumo de Implementação

### B4 - Sistema de Perguntas Customizadas (CRUD completo)
✅ **4 arquivos criados:**
1. `/src/app/api/processos/[id]/perguntas/route.ts` - API GET/POST
2. `/src/app/api/perguntas/[id]/route.ts` - API PATCH/DELETE
3. `/src/app/dashboard/processo/[id]/perguntas/page.tsx` - Interface Admin
4. `/src/app/candidato/processo/[id]/perguntas/page.tsx` - Interface Candidato

### B5 - Upload e Armazenamento de Áudios
✅ **3 arquivos criados:**
1. `/src/app/api/upload-audio/route.ts` - Upload para Supabase Storage
2. `/src/app/api/respostas-audio/route.ts` - Salvar respostas + transcrição
3. `/src/app/api/candidato/processo/[id]/route.ts` - API auxiliar

✅ **Arquivos de configuração:**
- `/supabase/storage-setup.sql` - Setup do bucket de Storage

---

## 🚀 Setup Inicial

### 1. Configurar Supabase Storage

Execute o SQL no Supabase Dashboard:

```bash
# No Supabase Dashboard > SQL Editor
# Cole o conteúdo de: supabase/storage-setup.sql
```

Ou manualmente:
1. Vá em **Storage** no Supabase Dashboard
2. Crie um bucket chamado `audio-respostas`
3. Marque como **público** (public)
4. Configure políticas de acesso conforme `storage-setup.sql`

### 2. Variáveis de Ambiente

Certifique-se de ter no `.env.local`:

```env
# Já configurado:
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...
SUPABASE_SERVICE_ROLE_KEY=eyJh...

# Adicionar (para transcrição em background):
NEXT_PUBLIC_APP_URL=http://localhost:3000  # produção: https://seuapp.com
```

### 3. Testar Funcionalidades

```bash
npm run dev
```

---

## 📋 Funcionalidades

### Para Administradores (Dashboard)

#### Gerenciar Perguntas
- **URL:** `/dashboard/processo/[id]/perguntas`
- **Recursos:**
  - ✅ Criar novas perguntas com texto e tempo limite
  - ✅ Editar perguntas existentes
  - ✅ Deletar perguntas
  - ✅ Reordenar com botões ↑↓
  - ✅ Visualizar todas as perguntas do processo

**Tempos disponíveis:**
- 60s (1 min)
- 90s (1.5 min)
- 120s (2 min) - padrão
- 180s (3 min)
- 300s (5 min)

### Para Candidatos

#### Responder Perguntas em Áudio
- **URL:** `/candidato/processo/[id]/perguntas`
- **Recursos:**
  - ✅ Visualizar pergunta atual
  - ✅ Gravar resposta em áudio (via AudioRecorder)
  - ✅ Timer countdown visual
  - ✅ Progress bar (X de N perguntas)
  - ✅ Upload automático para Supabase Storage
  - ✅ Transcrição automática em background
  - ✅ Navegação entre perguntas
  - ✅ Tela de conclusão

---

## 🔌 APIs Implementadas

### 1. GET `/api/processos/[id]/perguntas`
Lista perguntas do processo ordenadas.

**Response:**
```json
{
  "perguntas": [
    {
      "id": "uuid",
      "processo_id": "uuid",
      "ordem": 1,
      "texto": "Conte sobre uma situação desafiadora...",
      "tempo_limite_segundos": 120,
      "created_at": "2025-11-21T00:00:00Z"
    }
  ]
}
```

### 2. POST `/api/processos/[id]/perguntas`
Cria nova pergunta.

**Body:**
```json
{
  "texto": "Qual sua maior conquista profissional?",
  "tempo_limite_segundos": 120
}
```

### 3. PATCH `/api/perguntas/[id]`
Edita pergunta existente.

**Body:**
```json
{
  "texto": "Novo texto da pergunta",
  "tempo_limite_segundos": 180,
  "ordem": 2
}
```

### 4. DELETE `/api/perguntas/[id]`
Remove pergunta e reordena as demais automaticamente.

### 5. POST `/api/upload-audio`
Faz upload de áudio para Supabase Storage.

**Body:** FormData
- `audio`: Blob do áudio (webm)
- `candidato_id`: UUID
- `pergunta_id`: UUID

**Response:**
```json
{
  "url": "https://projeto.supabase.co/storage/v1/object/public/audio-respostas/candidato-id/pergunta-id_timestamp.webm",
  "path": "candidato-id/pergunta-id_timestamp.webm",
  "size": 123456
}
```

### 6. POST `/api/respostas-audio`
Salva resposta no banco e inicia transcrição.

**Body:**
```json
{
  "candidato_id": "uuid",
  "pergunta_id": "uuid",
  "arquivo_url": "https://...",
  "duracao_segundos": 95,
  "transcrever": true
}
```

### 7. GET `/api/respostas-audio?candidato_id=xxx`
Lista respostas de um candidato.

### 8. GET `/api/candidato/processo/[id]`
Busca candidato do usuário logado para um processo.

---

## 🗄️ Estrutura de Banco de Dados

### Tabela: `perguntas_empresa`
```sql
- id (UUID, PK)
- processo_id (UUID, FK → processos)
- ordem (INTEGER, UNIQUE por processo)
- texto (TEXT, NOT NULL)
- tempo_limite_segundos (INTEGER, default 120)
- created_at (TIMESTAMP)
```

### Tabela: `respostas_audio`
```sql
- id (UUID, PK)
- candidato_id (UUID, FK → candidatos)
- pergunta_id (UUID, FK → perguntas_empresa)
- arquivo_url (TEXT, NOT NULL)
- transcricao (TEXT, nullable)
- transcricao_editada (TEXT, nullable)
- analise_emocional (JSONB, nullable)
- duracao_segundos (INTEGER, nullable)
- created_at (TIMESTAMP)
```

### Supabase Storage: `audio-respostas`
```
audio-respostas/
  {candidato_id}/
    {pergunta_id}_{timestamp}.webm
```

---

## 🔒 Segurança

- ✅ Autenticação via Clerk em todas as rotas
- ✅ Service Role Key para operações de Storage
- ✅ Validação de candidato para upload (só pode enviar para suas próprias respostas)
- ✅ RLS (Row Level Security) configurado no Supabase
- ✅ Bucket público apenas para leitura (upload requer autenticação)

---

## 🎨 Componentes Reutilizados

### AudioRecorder
Localizado em `/src/components/AudioRecorder.tsx`

**Props:**
- `onAudioReady: (blob: Blob, duration: number) => void`
- `maxDuration?: number` (default: 120s)

**Recursos:**
- Gravação via MediaRecorder API
- Pausar/Retomar gravação
- Preview do áudio gravado
- Timer visual
- Waveform animado
- Limite de tempo automático

---

## 🧪 Fluxo de Teste

### 1. Criar Perguntas (Admin)
1. Faça login como admin
2. Acesse `/dashboard/processo/{processo-id}/perguntas`
3. Crie 3 perguntas de teste
4. Teste edição e reordenação
5. Teste exclusão

### 2. Responder Perguntas (Candidato)
1. Faça login como candidato
2. Acesse `/candidato/processo/{processo-id}/perguntas`
3. Responda cada pergunta em áudio
4. Verifique progress bar e contador
5. Confirme tela de conclusão

### 3. Verificar Storage
1. Acesse Supabase Dashboard > Storage
2. Bucket `audio-respostas`
3. Verifique estrutura: `{candidato_id}/{pergunta_id}_{timestamp}.webm`
4. Teste URL pública do áudio

### 4. Verificar Respostas
1. Acesse Supabase Dashboard > Table Editor
2. Tabela `respostas_audio`
3. Verifique `arquivo_url` e `duracao_segundos`
4. Aguarde transcrição (campo `transcricao` será preenchido)

---

## ⚠️ Troubleshooting

### Erro: "Bucket não encontrado"
**Solução:** Execute `supabase/storage-setup.sql` no Supabase Dashboard

### Erro: "Unauthorized" no upload
**Solução:** Verifique `SUPABASE_SERVICE_ROLE_KEY` no `.env.local`

### Áudio não reproduz
**Solução:**
- Verifique se bucket é público
- Teste URL diretamente no navegador
- Verifique CORS no Supabase

### Transcrição não acontece
**Solução:**
- Verifique se `/api/transcricao` está implementada
- Verifique `NEXT_PUBLIC_APP_URL` no `.env.local`
- Confira logs do servidor

### Perguntas fora de ordem
**Solução:**
- DELETE reordena automaticamente
- Se não funcionar, execute SQL manual:
```sql
UPDATE perguntas_empresa
SET ordem = ordem - 1
WHERE processo_id = 'xxx' AND ordem > {ordem_deletada};
```

---

## 📦 Dependências

Todas já instaladas no projeto:
- `@supabase/supabase-js` - Cliente Supabase
- `@clerk/nextjs` - Autenticação
- `lucide-react` - Ícones
- `tailwindcss` - Estilos

---

## 🚢 Deploy

### Checklist Antes do Deploy:
- [ ] Execute `storage-setup.sql` no Supabase de produção
- [ ] Configure variáveis de ambiente no Netlify/Vercel:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `NEXT_PUBLIC_APP_URL` (URL de produção)
- [ ] Teste upload de áudio em produção
- [ ] Verifique URLs públicas dos áudios
- [ ] Teste transcrição em produção

---

## 📚 Próximos Passos (Opcionais)

- [ ] Implementar drag-and-drop nativo para reordenar
- [ ] Adicionar preview de áudio para admin revisar respostas
- [ ] Implementar análise de sentimento nos áudios
- [ ] Adicionar limite de tamanho de arquivo (ex: 10MB)
- [ ] Implementar retry automático em caso de falha de upload
- [ ] Adicionar indicador de progresso durante upload
- [ ] Salvar resposta localmente (localStorage) como backup

---

## 🎯 Performance

- Uploads são assíncronos (não bloqueia UI)
- Transcrição roda em background (não espera)
- Áudios são comprimidos em webm (menor tamanho)
- Bucket público = CDN automático do Supabase
- Queries otimizadas com índices

---

**Status:** ✅ Implementação Completa e Funcional

**Data:** 2025-11-21
