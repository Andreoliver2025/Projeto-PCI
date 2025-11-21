# B4 & B5 - Início Rápido (5 minutos)

## ⚡ Setup Rápido

### 1. Configure o Supabase Storage (2 min)

Acesse: https://supabase.com/dashboard/project/{seu-projeto}/storage/buckets

**Opção A - Via Dashboard (Recomendado):**
1. Clique em "New bucket"
2. Nome: `audio-respostas`
3. Public bucket: ✅ Ativado
4. Clique em "Save"

**Opção B - Via SQL:**
```bash
# Copie o conteúdo de: supabase/storage-setup.sql
# Cole no Supabase Dashboard > SQL Editor > Execute
```

### 2. Verifique Variáveis de Ambiente (1 min)

```bash
# Abra .env.local e confirme que existem:
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...
SUPABASE_SERVICE_ROLE_KEY=eyJh...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Inicie o Servidor (1 min)

```bash
npm run dev
```

Aguarde: `✓ Ready in X ms`

---

## 🧪 Teste Rápido

### Como Admin (1 min)

1. Acesse: `http://localhost:3000/dashboard/processo/{seu-processo-id}/perguntas`

2. Crie uma pergunta:
   - Texto: "Fale sobre você"
   - Tempo: 120 segundos
   - Clique em "Adicionar Pergunta"

3. Veja a pergunta aparecer na lista

### Como Candidato (2 min)

1. Acesse: `http://localhost:3000/candidato/processo/{processo-id}/perguntas`

2. Grave uma resposta:
   - Clique em "Iniciar Gravação"
   - Fale por 10 segundos
   - Clique em "Parar"
   - Clique em "Confirmar"

3. Veja mensagem de sucesso

4. Verifique no Supabase:
   - Dashboard > Storage > audio-respostas
   - Deve aparecer pasta com seu candidato ID
   - Dentro, arquivo .webm

---

## ✅ Verificação Final

Execute este comando para verificar tudo:

```bash
# 1. Verificar arquivos criados
ls src/app/api/processos/*/perguntas/route.ts
ls src/app/api/upload-audio/route.ts
ls src/app/dashboard/processo/*/perguntas/page.tsx
ls src/app/candidato/processo/*/perguntas/page.tsx

# 2. Verificar banco
# Acesse Supabase > Table Editor > perguntas_empresa
# Deve ter registro da pergunta criada

# 3. Verificar storage
# Acesse Supabase > Storage > audio-respostas
# Deve ter arquivo de áudio
```

---

## 🎯 URLs Importantes

- **Admin - Gerenciar Perguntas:**
  ```
  /dashboard/processo/{processo-id}/perguntas
  ```

- **Candidato - Responder:**
  ```
  /candidato/processo/{processo-id}/perguntas
  ```

- **APIs:**
  ```
  GET    /api/processos/{id}/perguntas
  POST   /api/processos/{id}/perguntas
  PATCH  /api/perguntas/{id}
  DELETE /api/perguntas/{id}
  POST   /api/upload-audio
  POST   /api/respostas-audio
  ```

---

## 🆘 Problemas Comuns

### Erro: "Bucket não encontrado"
```bash
# Execute storage-setup.sql no Supabase Dashboard
# Ou crie manualmente: Storage > New bucket > "audio-respostas"
```

### Erro: "Unauthorized"
```bash
# Verifique .env.local tem SUPABASE_SERVICE_ROLE_KEY
```

### Áudio não grava
```bash
# Permita acesso ao microfone no navegador
# Chrome: Configurações > Privacidade > Microfone
```

### Página em branco
```bash
# Verifique console do navegador (F12)
# Veja se há erro de autenticação
```

---

## 📖 Documentação Completa

Para detalhes completos, consulte:

- **B4_B5_SETUP.md** - Guia completo de configuração
- **B4_B5_EXAMPLES.md** - Exemplos de código
- **B4_B5_CHECKLIST.md** - Checklist de verificação

---

## 🎉 Pronto!

Agora você tem:
- ✅ Sistema de perguntas customizadas funcionando
- ✅ Upload de áudio para Supabase Storage
- ✅ Interface admin para gerenciar perguntas
- ✅ Interface candidato para responder

**Tempo total:** ~5 minutos

---

**Próximos passos:** Leia `B4_B5_SETUP.md` para recursos avançados.
