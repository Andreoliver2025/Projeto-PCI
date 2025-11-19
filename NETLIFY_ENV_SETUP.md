# 🔐 Configuração de Variáveis de Ambiente - Netlify

## 📍 Acesso Rápido
https://app.netlify.com/sites/SEU-SITE/configuration/env

---

## ✅ Lista Completa de Variáveis (Copie e Cole)

### 1. CLERK (Autenticação)
**Onde obter:** https://dashboard.clerk.com/ → Seu projeto → API Keys

```
Key: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
Value: [Sua chave que começa com pk_live_...]
Scopes: All
```

```
Key: CLERK_SECRET_KEY
Value: [Sua chave que começa com sk_...]
Scopes: All
```

---

### 2. SUPABASE (Banco de Dados)
**Onde obter:** https://supabase.com/dashboard/ → Seu projeto → Settings → API

```
Key: NEXT_PUBLIC_SUPABASE_URL
Value: https://xxxxxxxxxxxxxxxxx.supabase.co
Scopes: All
```

```
Key: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IioqKioqKioqIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDU1MzE2MTAsImV4cCI6MTk2MTEwNzYxMH0.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Scopes: All
```

```
Key: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IioqKioqKioqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY0NTUzMTYxMCwiZXhwIjoxOTYxMTA3NjEwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Scopes: All
```

⚠️ **ATENÇÃO:** O service_role é sensível! Nunca exponha publicamente.

---

### 3. OPENAI (Transcrição de Áudio) ⚡ FALTANDO - CAUSA DO ERRO
**Onde obter:** https://platform.openai.com/api-keys → Create new secret key

```
Key: OPENAI_API_KEY
Value: sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Scopes: All
```

💰 **Configure limites de gasto:** https://platform.openai.com/account/billing/limits

---

### 4. APP URL (Adicionar DEPOIS do primeiro deploy bem-sucedido)

```
Key: NEXT_PUBLIC_APP_URL
Value: https://seu-site.netlify.app
Scopes: All
```

---

## 🚀 Passo a Passo Rápido

### 1️⃣ Criar Contas nos Serviços

- **Clerk:** https://clerk.com/sign-up
- **Supabase:** https://supabase.com/dashboard
- **OpenAI:** https://platform.openai.com/signup

### 2️⃣ Obter Chaves

**CLERK:**
1. https://dashboard.clerk.com/
2. Selecione seu app ou crie um novo
3. Vá em: **Developers** → **API Keys**
4. Copie: `Publishable key` e `Secret key`

**SUPABASE:**
1. https://supabase.com/dashboard/
2. Selecione seu projeto ou crie um novo
3. Vá em: **Settings** → **API**
4. Copie:
   - **Project URL** (campo URL)
   - **anon/public** (em Project API keys)
   - **service_role** (em Project API keys - clique em "Reveal" primeiro)

**OPENAI:**
1. https://platform.openai.com/api-keys
2. Clique em: **+ Create new secret key**
3. Dê um nome: "ProjetoPCI-Production"
4. **COPIE IMEDIATAMENTE** (só mostra uma vez!)
5. Configure billing: https://platform.openai.com/account/billing/payment-methods

### 3️⃣ Adicionar Variáveis no Netlify

1. Acesse: https://app.netlify.com/
2. Selecione seu site **Projeto-PCI**
3. Vá em: **Site configuration** → **Environment variables**
4. Clique em: **Add a variable**
5. Cole cada variável (Key e Value)
6. Escolha: **All deploy contexts**
7. Clique em: **Create variable**

### 4️⃣ Fazer Novo Deploy

Depois de adicionar TODAS as variáveis:

1. Vá em: **Deploys** (topo da página)
2. Clique em: **Trigger deploy** → **Clear cache and deploy**
3. Aguarde o build (2-3 minutos)
4. ✅ Deploy deve passar!

---

## 🔍 Verificar se as Variáveis Foram Adicionadas

No painel do Netlify, em **Environment variables**, você deve ver:

✅ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
✅ CLERK_SECRET_KEY
✅ NEXT_PUBLIC_SUPABASE_URL
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
✅ SUPABASE_SERVICE_ROLE_KEY
✅ **OPENAI_API_KEY** ⚡ **ESTA ESTÁ FALTANDO!**

---

## 📊 Custos Estimados (Mensal)

- **Clerk:** Free até 10k usuários ativos/mês
- **Supabase:** Free até 500MB storage + 2GB bandwidth
- **OpenAI Whisper:** ~$0.006 por minuto de áudio
  - Exemplo: 100 entrevistas de 5min = $3.00/mês
  - Configure limite de $10-20/mês para segurança

---

## 🆘 Troubleshooting

### Erro: "OPENAI_API_KEY is missing"
✅ **SOLUÇÃO:** Adicione a variável OPENAI_API_KEY no Netlify e faça novo deploy

### Erro: "Clerk publishable key is required"
✅ **SOLUÇÃO:** Use chave pk_live_xxx (não pk_test_xxx) para produção

### Erro: "Supabase URL is required"
✅ **SOLUÇÃO:** Verifique se a URL está no formato https://xxx.supabase.co

### Build passa mas site não funciona
✅ **SOLUÇÃO:**
1. Verifique se criou as tabelas no Supabase (executar schema.sql)
2. Adicione NEXT_PUBLIC_APP_URL com a URL do Netlify
3. Faça novo deploy

---

## 🔒 Segurança

❌ **NUNCA** commit estas chaves no Git
❌ **NUNCA** compartilhe CLERK_SECRET_KEY
❌ **NUNCA** compartilhe SUPABASE_SERVICE_ROLE_KEY
❌ **NUNCA** compartilhe OPENAI_API_KEY

✅ Use apenas o painel do Netlify
✅ Configure .env.local no .gitignore (já está)
✅ Use chaves diferentes para dev/prod

---

## 📞 Suporte

**Documentação Oficial:**
- Clerk: https://clerk.com/docs
- Supabase: https://supabase.com/docs
- OpenAI: https://platform.openai.com/docs
- Netlify: https://docs.netlify.com/environment-variables/get-started/

**Problemas com billing OpenAI:**
https://help.openai.com/en/

---

Última atualização: 2025-11-19
