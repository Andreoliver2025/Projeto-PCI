# 🚀 Guia de Setup - ProjetoPCI

## Resumo do Projeto

**ProjetoPCI** é uma plataforma de fit comportamental para recrutamento que combina DISC, MBTI, Big5 e Eneagrama para análise de compatibilidade entre contratante, candidato e liderança.

---

## ✅ O Que Foi Implementado

### Fase 1: Fundacional (Semana 1-2)

- ✅ **Estrutura do Banco de Dados**
  - 8 tabelas (Usuários, Perfis, Processos, Candidatos, etc.)
  - RLS Policies para segurança
  - Índices otimizados

- ✅ **Autenticação**
  - Clerk configurado
  - Middleware de proteção
  - Separação de papéis (Principal, Candidato, Líder)

- ✅ **Testes Comportamentais**
  - DISC (20 perguntas, scoring 0-100)
  - MBTI (16 perguntas, 16 tipos)
  - Interface completa com progress bar
  - Resultados visuais

- ✅ **Páginas Implementadas**
  - Landing Page profissional
  - Dashboard de processos
  - Criação de novo processo
  - Interface de testes DISC/MBTI

- ✅ **Validações por Agentes Especializados**
  - UI/UX Design validado
  - Code Review completo
  - Issues críticas identificadas e corrigidas

---

## 📋 Checklist de Setup

### 1. Instalar Dependências

```bash
cd ProjetoPCI
npm install --legacy-peer-deps
```

### 2. Configurar Variáveis de Ambiente

Copie `.env.example` para `.env.local`:

```bash
cp .env.example .env.local
```

Preencha com suas chaves:

```env
# Clerk (https://clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Supabase (https://supabase.com)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# OpenAI (https://platform.openai.com)
OPENAI_API_KEY=sk-...
```

### 3. Configurar Banco de Dados no Supabase

1. Criar projeto no Supabase
2. Executar o schema SQL:

```bash
# Conecte ao SQL Editor do Supabase e execute:
supabase/schema.sql
supabase/rls-policies.sql
```

### 4. Executar Projeto Localmente

```bash
npm run dev
```

Acesse: http://localhost:3000

---

## 🗺️ Estrutura do Projeto

```
ProjetoPCI/
├── src/
│   ├── app/                    # App Router (Next.js 14)
│   │   ├── page.tsx           # Landing page
│   │   ├── dashboard/         # Dashboard do usuário
│   │   │   ├── page.tsx
│   │   │   └── novo-processo/
│   │   └── testes/            # Testes comportamentais
│   │       ├── disc/
│   │       └── mbti/
│   ├── lib/                   # Utilitários
│   │   ├── supabase.ts       # Cliente Supabase
│   │   ├── env.ts            # Validação de env vars
│   │   └── testes/           # Lógica dos testes
│   │       ├── disc.ts
│   │       └── mbti.ts
│   └── types/                # TypeScript types
│       └── database.types.ts
├── supabase/
│   ├── schema.sql           # Schema do banco
│   └── rls-policies.sql     # Políticas de segurança
└── public/
```

---

## 🎯 Próximos Passos (Semana 3)

### Item 8: Gravação de Áudio

- [ ] Implementar MediaRecorder API
- [ ] Interface de gravação com timer
- [ ] Upload para Supabase Storage

### Item 9: Transcrição com Whisper

- [ ] API Route para Whisper
- [ ] Edição de transcrições
- [ ] Salvar no banco

### Item 10: Dashboard de Fit

- [ ] Gráficos Recharts
- [ ] Cálculo de compatibilidade
- [ ] Visualização de perfis

---

## 🔧 Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Lint
npm run lint

# Type check
npx tsc --noEmit
```

---

## 📊 Análises Realizadas

### Agente UI/UX Designer

**Recomendações Críticas:**
- Paleta de cores profissional para RH (azul/slate/violeta)
- Acessibilidade (estados de foco, contraste)
- Hierarquia tipográfica
- Tom de voz orientado a dados

**Arquivos Afetados:**
- `tailwind.config.ts` - Paleta de cores
- `src/app/globals.css` - Componentes
- `src/app/page.tsx` - Landing page

### Agente Code Reviewer

**Issues Críticas Corrigidas:**
- ✅ RLS Policies implementadas
- ✅ Validação de env vars
- ✅ Estrutura de banco otimizada
- ✅ Middleware do Clerk atualizado

**Issues Pendentes (Alta Prioridade):**
- [ ] Implementar API Routes (mover queries do cliente)
- [ ] Adicionar validação com Zod
- [ ] Rate limiting
- [ ] Error/Loading states

---

## 🚀 Deploy no Netlify

### Passo 1: Conectar Repositório

```bash
git init
git add .
git commit -m "Initial commit - ProjetoPCI MVP"
git branch -M main
git remote add origin <seu-repo-git>
git push -u origin main
```

### Passo 2: Configurar no Netlify

1. https://app.netlify.com → New site from Git
2. Conecte seu repositório
3. Configure:
   - Build command: `npm run build`
   - Publish directory: `.next`

### Passo 3: Variáveis de Ambiente

Adicione no Netlify (Site settings → Environment variables):

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY
```

### Passo 4: Deploy

Deploy automático a cada push!

---

## 📞 Suporte

Em caso de dúvidas:
1. Verifique este guia primeiro
2. Consulte a documentação:
   - Next.js: https://nextjs.org/docs
   - Clerk: https://clerk.com/docs
   - Supabase: https://supabase.com/docs

---

## 🎉 Pronto!

Seu ProjetoPCI está configurado e rodando. Próximo passo: implementar gravação de áudio e integração com Whisper!
