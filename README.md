# ProjetoPCI - Plataforma de Fit Comportamental

Plataforma que cruza perfis DISC, MBTI, Big5 e Eneagrama para análise de compatibilidade entre contratante, candidato e liderança.

## 🎯 Funcionalidades

- Testes comportamentais (DISC, MBTI, Big5, Eneagrama)
- Análise de compatibilidade entre 3 perfis
- Entrevistas por áudio com transcrição automática
- Dashboard com gráficos de fit
- Análise de linguagem emocional
- Relatórios de recomendação

## 🛠️ Stack

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Auth**: Clerk
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI (Whisper + GPT-4)
- **Charts**: Recharts
- **Deploy**: Netlify

## 📦 Instalação

```bash
npm install
```

## 🔧 Configuração

Copie `.env.example` para `.env.local` e configure suas chaves de API.

## 🚀 Desenvolvimento

```bash
npm run dev
```

## 📊 Estrutura do Projeto

```
src/
├── app/              # App Router do Next.js
├── components/       # Componentes reutilizáveis
├── lib/             # Utilitários e configurações
├── types/           # TypeScript types
└── styles/          # Estilos globais
```

## 📄 Licença

MIT
