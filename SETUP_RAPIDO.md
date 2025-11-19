# 🚀 SETUP RÁPIDO - 15 MINUTOS

## ✅ PASSO 1: Configurar Clerk (5 min)

**1.1 Acesse:**
```
https://dashboard.clerk.com/apps
```

**1.2 Selecione seu app "ProjetoPCI"**

**1.3 Vá em: Configure → Paths**

**1.4 Configure EXATAMENTE assim:**

```
Sign-in URL: https://projetopci.netlify.app/sign-in
Sign-up URL: https://projetopci.netlify.app/sign-up
Home URL: https://projetopci.netlify.app
After sign in URL: https://projetopci.netlify.app/dashboard
After sign up URL: https://projetopci.netlify.app/dashboard
```

**1.5 Vá em: Configure → Email, Phone, Username**
- Marque: **Email address** (required)
- Desmarque: Phone, Username (opcional)
- Clique: **Save**

---

## ✅ PASSO 2: Criar Tabelas no Supabase (5 min)

**2.1 Acesse:**
```
https://supabase.com/dashboard/
```

**2.2 Selecione seu projeto**

**2.3 Vá em: SQL Editor → + New query**

**2.4 Cole e Execute (botão RUN no canto inferior direito):**

```sql
-- Schema do banco de dados para ProjetoPCI

-- Tabela de Usuários
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id TEXT UNIQUE NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('Principal', 'Candidato', 'Lider')),
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Perfis Comportamentais
CREATE TABLE perfis_comportamentais (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  disc_d INTEGER CHECK (disc_d >= 0 AND disc_d <= 100),
  disc_i INTEGER CHECK (disc_i >= 0 AND disc_i <= 100),
  disc_s INTEGER CHECK (disc_s >= 0 AND disc_s <= 100),
  disc_c INTEGER CHECK (disc_c >= 0 AND disc_c <= 100),
  mbti_type TEXT CHECK (LENGTH(mbti_type) = 4),
  mbti_e_i INTEGER CHECK (mbti_e_i >= 0 AND mbti_e_i <= 100),
  mbti_s_n INTEGER CHECK (mbti_s_n >= 0 AND mbti_s_n <= 100),
  mbti_t_f INTEGER CHECK (mbti_t_f >= 0 AND mbti_t_f <= 100),
  mbti_j_p INTEGER CHECK (mbti_j_p >= 0 AND mbti_j_p <= 100),
  big5_openness INTEGER CHECK (big5_openness >= 0 AND big5_openness <= 100),
  big5_conscientiousness INTEGER CHECK (big5_conscientiousness >= 0 AND big5_conscientiousness <= 100),
  big5_extraversion INTEGER CHECK (big5_extraversion >= 0 AND big5_extraversion <= 100),
  big5_agreeableness INTEGER CHECK (big5_agreeableness >= 0 AND big5_agreeableness <= 100),
  big5_neuroticism INTEGER CHECK (big5_neuroticism >= 0 AND big5_neuroticism <= 100),
  eneagrama_type INTEGER CHECK (eneagrama_type >= 1 AND eneagrama_type <= 9),
  eneagrama_wing TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(usuario_id)
);

-- Tabela de Processos
CREATE TABLE processos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_principal_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  lider_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  status TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'ativo', 'finalizado', 'arquivado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Funções
CREATE TABLE funcoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  processo_id UUID NOT NULL REFERENCES processos(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  perfil_ideal JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Candidatos
CREATE TABLE candidatos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  processo_id UUID NOT NULL REFERENCES processos(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  perfil_comportamental_id UUID REFERENCES perfis_comportamentais(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_avaliacao', 'aprovado', 'reprovado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(processo_id, usuario_id)
);

-- Tabela de Perguntas da Empresa
CREATE TABLE perguntas_empresa (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  processo_id UUID NOT NULL REFERENCES processos(id) ON DELETE CASCADE,
  ordem INTEGER NOT NULL,
  texto TEXT NOT NULL,
  tempo_limite_segundos INTEGER DEFAULT 120,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(processo_id, ordem)
);

-- Tabela de Respostas em Áudio
CREATE TABLE respostas_audio (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidato_id UUID NOT NULL REFERENCES candidatos(id) ON DELETE CASCADE,
  pergunta_id UUID NOT NULL REFERENCES perguntas_empresa(id) ON DELETE CASCADE,
  arquivo_url TEXT NOT NULL,
  transcricao TEXT,
  transcricao_editada TEXT,
  analise_emocional JSONB,
  duracao_segundos INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(candidato_id, pergunta_id)
);

-- Tabela de Análises de Fit
CREATE TABLE fit_analises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  processo_id UUID NOT NULL REFERENCES processos(id) ON DELETE CASCADE,
  candidato_id UUID NOT NULL REFERENCES candidatos(id) ON DELETE CASCADE,
  score_contratante INTEGER CHECK (score_contratante >= 0 AND score_contratante <= 100),
  score_funcao INTEGER CHECK (score_funcao >= 0 AND score_funcao <= 100),
  score_lider INTEGER CHECK (score_lider >= 0 AND score_lider <= 100),
  score_geral INTEGER CHECK (score_geral >= 0 AND score_geral <= 100),
  analise_disc TEXT,
  analise_mbti TEXT,
  analise_big5 TEXT,
  analise_eneagrama TEXT,
  pontos_fortes TEXT[],
  pontos_atencao TEXT[],
  recomendacao TEXT NOT NULL CHECK (recomendacao IN ('forte', 'moderada', 'fraca', 'nao_recomendado')),
  justificativa TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(processo_id, candidato_id)
);

-- Índices para melhor performance
CREATE INDEX idx_usuarios_clerk_id ON usuarios(clerk_id);
CREATE INDEX idx_perfis_usuario_id ON perfis_comportamentais(usuario_id);
CREATE INDEX idx_processos_principal ON processos(usuario_principal_id);
CREATE INDEX idx_candidatos_processo ON candidatos(processo_id);
CREATE INDEX idx_perguntas_processo ON perguntas_empresa(processo_id);
CREATE INDEX idx_respostas_candidato ON respostas_audio(candidato_id);
CREATE INDEX idx_fit_processo ON fit_analises(processo_id);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_perfis_updated_at BEFORE UPDATE ON perfis_comportamentais
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_processos_updated_at BEFORE UPDATE ON processos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

✅ **Esperado:** "Success. No rows returned"

**2.5 Nova query → Cole e Execute o SQL de segurança:**

```sql
-- Row Level Security Policies para ProjetoPCI

-- Ativar RLS em todas as tabelas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfis_comportamentais ENABLE ROW LEVEL SECURITY;
ALTER TABLE processos ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidatos ENABLE ROW LEVEL SECURITY;
ALTER TABLE funcoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE perguntas_empresa ENABLE ROW LEVEL SECURITY;
ALTER TABLE respostas_audio ENABLE ROW LEVEL SECURITY;
ALTER TABLE fit_analises ENABLE ROW LEVEL SECURITY;

-- Helper function para pegar user_id do clerk_id
CREATE OR REPLACE FUNCTION get_user_id_from_clerk()
RETURNS UUID AS $$
  SELECT id FROM usuarios WHERE clerk_id = auth.jwt()->>'clerk_id'
$$ LANGUAGE sql SECURITY DEFINER;

-- Usuários podem ver e editar apenas seus próprios dados
CREATE POLICY "Users can view own data" ON usuarios
  FOR SELECT USING (clerk_id = auth.jwt()->>'clerk_id');

CREATE POLICY "Users can update own data" ON usuarios
  FOR UPDATE USING (clerk_id = auth.jwt()->>'clerk_id');

CREATE POLICY "Users can insert own data" ON usuarios
  FOR INSERT WITH CHECK (clerk_id = auth.jwt()->>'clerk_id');

-- Perfis Comportamentais
CREATE POLICY "Users can view own profile" ON perfis_comportamentais
  FOR SELECT USING (usuario_id = get_user_id_from_clerk());

CREATE POLICY "Users can update own profile" ON perfis_comportamentais
  FOR UPDATE USING (usuario_id = get_user_id_from_clerk());

CREATE POLICY "Users can insert own profile" ON perfis_comportamentais
  FOR INSERT WITH CHECK (usuario_id = get_user_id_from_clerk());

-- Processos
CREATE POLICY "View own processes" ON processos
  FOR SELECT USING (
    usuario_principal_id = get_user_id_from_clerk()
    OR lider_id = get_user_id_from_clerk()
  );

CREATE POLICY "Create own processes" ON processos
  FOR INSERT WITH CHECK (usuario_principal_id = get_user_id_from_clerk());

CREATE POLICY "Update own processes" ON processos
  FOR UPDATE USING (usuario_principal_id = get_user_id_from_clerk());

CREATE POLICY "Delete own processes" ON processos
  FOR DELETE USING (usuario_principal_id = get_user_id_from_clerk());

-- Funções
CREATE POLICY "View functions of accessible processes" ON funcoes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM processos
      WHERE processos.id = funcoes.processo_id
      AND (processos.usuario_principal_id = get_user_id_from_clerk()
           OR processos.lider_id = get_user_id_from_clerk())
    )
  );

CREATE POLICY "Manage functions of own processes" ON funcoes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM processos
      WHERE processos.id = funcoes.processo_id
      AND processos.usuario_principal_id = get_user_id_from_clerk()
    )
  );

-- Candidatos
CREATE POLICY "View own candidatures" ON candidatos
  FOR SELECT USING (
    usuario_id = get_user_id_from_clerk()
    OR EXISTS (
      SELECT 1 FROM processos
      WHERE processos.id = candidatos.processo_id
      AND (processos.usuario_principal_id = get_user_id_from_clerk()
           OR processos.lider_id = get_user_id_from_clerk())
    )
  );

CREATE POLICY "Manage candidates of own processes" ON candidatos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM processos
      WHERE processos.id = candidatos.processo_id
      AND processos.usuario_principal_id = get_user_id_from_clerk()
    )
  );

-- Perguntas
CREATE POLICY "View questions of accessible processes" ON perguntas_empresa
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM processos
      WHERE processos.id = perguntas_empresa.processo_id
      AND (processos.usuario_principal_id = get_user_id_from_clerk()
           OR processos.lider_id = get_user_id_from_clerk())
    )
    OR EXISTS (
      SELECT 1 FROM candidatos
      WHERE candidatos.processo_id = perguntas_empresa.processo_id
      AND candidatos.usuario_id = get_user_id_from_clerk()
    )
  );

CREATE POLICY "Manage questions of own processes" ON perguntas_empresa
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM processos
      WHERE processos.id = perguntas_empresa.processo_id
      AND processos.usuario_principal_id = get_user_id_from_clerk()
    )
  );

-- Respostas Audio
CREATE POLICY "View own answers" ON respostas_audio
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM candidatos
      WHERE candidatos.id = respostas_audio.candidato_id
      AND candidatos.usuario_id = get_user_id_from_clerk()
    )
    OR EXISTS (
      SELECT 1 FROM candidatos
      JOIN processos ON processos.id = candidatos.processo_id
      WHERE candidatos.id = respostas_audio.candidato_id
      AND (processos.usuario_principal_id = get_user_id_from_clerk()
           OR processos.lider_id = get_user_id_from_clerk())
    )
  );

CREATE POLICY "Create own answers" ON respostas_audio
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM candidatos
      WHERE candidatos.id = respostas_audio.candidato_id
      AND candidatos.usuario_id = get_user_id_from_clerk()
    )
  );

CREATE POLICY "Update own answers" ON respostas_audio
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM candidatos
      WHERE candidatos.id = respostas_audio.candidato_id
      AND candidatos.usuario_id = get_user_id_from_clerk()
    )
  );

-- Fit Analises
CREATE POLICY "View fit analyses of own processes" ON fit_analises
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM processos
      WHERE processos.id = fit_analises.processo_id
      AND (processos.usuario_principal_id = get_user_id_from_clerk()
           OR processos.lider_id = get_user_id_from_clerk())
    )
  );

CREATE POLICY "Manage fit analyses of own processes" ON fit_analises
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM processos
      WHERE processos.id = fit_analises.processo_id
      AND processos.usuario_principal_id = get_user_id_from_clerk()
    )
  );
```

✅ **Esperado:** "Success. No rows returned"

---

## ✅ PASSO 3: Adicionar Variável APP_URL no Netlify (2 min)

**3.1 Acesse:**
```
https://app.netlify.com/sites/projetopci/configuration/env
```

**3.2 Clique em: Add a variable**

**3.3 Configure:**
```
Key: NEXT_PUBLIC_APP_URL
Value: https://projetopci.netlify.app
Scopes: All deploy contexts
```

**3.4 Clique em: Create variable**

**3.5 Vá em: Deploys**
```
https://app.netlify.com/sites/projetopci/deploys
```

**3.6 Clique em: Trigger deploy → Deploy site**

---

## ✅ PASSO 4: Teste (2 min)

Aguarde o deploy terminar (2-3 min), depois:

**4.1 Acesse:** https://projetopci.netlify.app/

**4.2 Clique em: "Começar Teste Grátis"**

**4.3 Crie sua conta**

**4.4 Deve redirecionar para:** https://projetopci.netlify.app/dashboard

---

## 🆘 Se der erro

**Erro ao fazer login:**
- Verifique se configurou as URLs no Clerk (PASSO 1)
- Verifique se as variáveis estão no Netlify

**Erro "table does not exist":**
- Execute os SQLs do PASSO 2 novamente
- Verifique no Supabase → Table Editor se as tabelas foram criadas

**Site não carrega:**
- Aguarde o deploy terminar (verde no Netlify)
- Limpe cache: Ctrl+Shift+R (Windows) ou Cmd+Shift+R (Mac)
- Tente em aba anônima

---

✅ **PRONTO! Seu site deve estar 100% funcional!**
