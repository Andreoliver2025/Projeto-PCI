# ✅ B4 & B5 - Checklist de Verificação

## 📁 Arquivos Criados

Verifique se todos os arquivos foram criados:

```bash
# Verificar arquivos B4 e B5
ls -la /home/user/Projeto-PCI/src/app/api/processos/*/perguntas/route.ts
ls -la /home/user/Projeto-PCI/src/app/api/perguntas/*/route.ts
ls -la /home/user/Projeto-PCI/src/app/api/upload-audio/route.ts
ls -la /home/user/Projeto-PCI/src/app/api/respostas-audio/route.ts
ls -la /home/user/Projeto-PCI/src/app/api/candidato/processo/*/route.ts
ls -la /home/user/Projeto-PCI/src/app/dashboard/processo/*/perguntas/page.tsx
ls -la /home/user/Projeto-PCI/src/app/candidato/processo/*/perguntas/page.tsx
ls -la /home/user/Projeto-PCI/supabase/storage-setup.sql
```

### Resultado esperado:
- ✅ 7 arquivos TypeScript/TSX
- ✅ 1 arquivo SQL
- ✅ 3 arquivos de documentação (.md)

---

## 🔧 Setup Inicial

### 1. Supabase Storage

- [ ] Bucket `audio-respostas` criado
- [ ] Bucket marcado como público
- [ ] Políticas de acesso configuradas
- [ ] Testado upload manual via Dashboard

**Como verificar:**
1. Acesse Supabase Dashboard → Storage
2. Deve aparecer bucket `audio-respostas`
3. Configurações → Public bucket: ✅

### 2. Variáveis de Ambiente

- [ ] `NEXT_PUBLIC_SUPABASE_URL` configurado
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` configurado
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configurado
- [ ] `NEXT_PUBLIC_APP_URL` configurado

**Como verificar:**
```bash
cat .env.local | grep SUPABASE
cat .env.local | grep APP_URL
```

### 3. Dependências

- [ ] `@supabase/supabase-js` instalado
- [ ] `@clerk/nextjs` instalado
- [ ] `lucide-react` instalado

**Como verificar:**
```bash
npm list @supabase/supabase-js @clerk/nextjs lucide-react
```

---

## 🧪 Testes Funcionais

### Teste 1: CRUD de Perguntas (Admin)

- [ ] Acessar `/dashboard/processo/{id}/perguntas`
- [ ] Criar nova pergunta
- [ ] Editar pergunta existente
- [ ] Mover pergunta para cima (botão ↑)
- [ ] Mover pergunta para baixo (botão ↓)
- [ ] Deletar pergunta
- [ ] Verificar reordenação automática após deletar

**Passos detalhados:**
1. Faça login como admin
2. Crie um processo seletivo
3. Acesse página de perguntas
4. Adicione 3 perguntas
5. Edite a segunda pergunta
6. Mova primeira para baixo
7. Delete a última
8. Verifique ordem no banco

### Teste 2: Responder Perguntas (Candidato)

- [ ] Acessar `/candidato/processo/{id}/perguntas`
- [ ] Visualizar primeira pergunta
- [ ] Gravar áudio de resposta
- [ ] Ver preview do áudio
- [ ] Enviar resposta
- [ ] Avançar para próxima pergunta
- [ ] Completar todas as perguntas
- [ ] Ver tela de conclusão

**Passos detalhados:**
1. Faça login como candidato
2. Acesse processo como candidato
3. Inicie perguntas
4. Grave resposta de 30 segundos
5. Confirme envio
6. Repita para todas perguntas
7. Verifique mensagem de conclusão

### Teste 3: Upload de Áudio

- [ ] Áudio gravado via AudioRecorder
- [ ] Upload para Supabase Storage bem-sucedido
- [ ] URL pública retornada
- [ ] Áudio reproduz no navegador
- [ ] Arquivo salvo em pasta correta

**Como verificar:**
1. Após responder pergunta, copie URL do áudio
2. Cole no navegador
3. Deve reproduzir áudio
4. Verifique Storage no Supabase:
   - Pasta: `{candidato_id}/`
   - Arquivo: `{pergunta_id}_{timestamp}.webm`

### Teste 4: Salvar Resposta no Banco

- [ ] Registro criado em `respostas_audio`
- [ ] `arquivo_url` preenchido
- [ ] `duracao_segundos` salvo
- [ ] `candidato_id` correto
- [ ] `pergunta_id` correto
- [ ] Sem duplicatas

**Como verificar:**
```sql
-- No Supabase Dashboard → SQL Editor
SELECT
  r.*,
  p.texto as pergunta_texto,
  u.nome as candidato_nome
FROM respostas_audio r
JOIN perguntas_empresa p ON p.id = r.pergunta_id
JOIN candidatos c ON c.id = r.candidato_id
JOIN usuarios u ON u.id = c.usuario_id
ORDER BY r.created_at DESC
LIMIT 10;
```

### Teste 5: Transcrição (Opcional)

- [ ] Transcrição iniciada em background
- [ ] Campo `transcricao` preenchido
- [ ] API `/api/transcricao` funcionando

**Como verificar:**
```sql
-- Aguardar alguns minutos e verificar
SELECT id, transcricao
FROM respostas_audio
WHERE transcricao IS NOT NULL
LIMIT 5;
```

---

## 🔒 Segurança

### Autenticação

- [ ] Rotas protegidas com `auth()` do Clerk
- [ ] Retorna 401 se não autenticado
- [ ] Validação de permissões

**Como testar:**
```bash
# Deve retornar 401
curl http://localhost:3000/api/processos/UUID/perguntas

# Com token deve funcionar
curl http://localhost:3000/api/processos/UUID/perguntas \
  -H "Authorization: Bearer TOKEN"
```

### Storage

- [ ] Upload requer autenticação
- [ ] Leitura é pública
- [ ] Validação de tipo de arquivo
- [ ] Limite de tamanho (se configurado)

### Validações

- [ ] Texto de pergunta obrigatório
- [ ] Tempo limite validado
- [ ] Candidato só pode enviar para si mesmo
- [ ] Sem duplicatas de respostas

---

## 🎯 Performance

### Tempos Esperados

- [ ] Criar pergunta: < 500ms
- [ ] Listar perguntas: < 300ms
- [ ] Upload áudio (5MB): < 3s
- [ ] Salvar resposta: < 500ms

### Otimizações

- [ ] Queries com índices
- [ ] Upload assíncrono
- [ ] Transcrição em background
- [ ] CDN do Supabase para áudios

---

## 📊 Monitoramento

### Logs

- [ ] Console sem erros
- [ ] Network requests retornando 200
- [ ] Storage mostrando arquivos
- [ ] Banco com registros corretos

**Onde verificar:**
- Browser DevTools → Console
- Browser DevTools → Network
- Supabase Dashboard → Storage
- Supabase Dashboard → Table Editor

### Métricas

- [ ] Número de perguntas por processo
- [ ] Taxa de conclusão de candidatos
- [ ] Tamanho médio dos áudios
- [ ] Tempo médio de resposta

**Query exemplo:**
```sql
-- Taxa de conclusão
SELECT
  COUNT(DISTINCT c.id) as total_candidatos,
  COUNT(DISTINCT r.candidato_id) as candidatos_responderam,
  ROUND(
    COUNT(DISTINCT r.candidato_id)::numeric / 
    NULLIF(COUNT(DISTINCT c.id), 0) * 100, 
    2
  ) as taxa_conclusao
FROM candidatos c
LEFT JOIN respostas_audio r ON r.candidato_id = c.id
WHERE c.processo_id = 'UUID';
```

---

## 🚀 Deploy

### Pré-Deploy

- [ ] Storage setup executado em produção
- [ ] Env vars configuradas no hosting
- [ ] Build local funcionando
- [ ] TypeScript sem erros
- [ ] Testes manuais passando

**Comandos:**
```bash
npm run build
npm run start
```

### Pós-Deploy

- [ ] URLs de produção funcionando
- [ ] Storage de produção acessível
- [ ] Autenticação funcionando
- [ ] Upload de áudio testado
- [ ] Transcrição funcionando

### Rollback

- [ ] Backup do banco antes do deploy
- [ ] Plan B se Storage falhar
- [ ] Monitoramento de erros ativo

---

## 📞 Troubleshooting Rápido

### Erro: "Bucket não encontrado"
```bash
# Executar storage-setup.sql no Supabase
```

### Erro: "Unauthorized"
```bash
# Verificar .env.local
cat .env.local | grep SUPABASE_SERVICE_ROLE_KEY
```

### Áudio não reproduz
```bash
# Verificar CORS e bucket público
# Testar URL diretamente no navegador
```

### Perguntas fora de ordem
```sql
-- Reordenar manualmente
UPDATE perguntas_empresa
SET ordem = ROW_NUMBER() OVER (ORDER BY created_at)
WHERE processo_id = 'UUID';
```

### Transcrição não acontece
```bash
# Verificar se API de transcrição existe
curl http://localhost:3000/api/transcricao

# Verificar logs do servidor
npm run dev
```

---

## ✅ Checklist Final

Antes de considerar concluído:

- [ ] Todos os arquivos criados
- [ ] Storage configurado
- [ ] Variáveis de ambiente OK
- [ ] Testes funcionais passando
- [ ] Segurança validada
- [ ] Performance aceitável
- [ ] Documentação lida
- [ ] Exemplos testados
- [ ] Deploy bem-sucedido
- [ ] Monitoramento ativo

---

**Status:** [ ] Pronto para Produção

**Data de Verificação:** __________

**Responsável:** __________

**Observações:**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
