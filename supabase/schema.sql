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

  -- DISC (0-100)
  disc_d INTEGER CHECK (disc_d >= 0 AND disc_d <= 100),
  disc_i INTEGER CHECK (disc_i >= 0 AND disc_i <= 100),
  disc_s INTEGER CHECK (disc_s >= 0 AND disc_s <= 100),
  disc_c INTEGER CHECK (disc_c >= 0 AND disc_c <= 100),

  -- MBTI
  mbti_type TEXT CHECK (LENGTH(mbti_type) = 4),
  mbti_e_i INTEGER CHECK (mbti_e_i >= 0 AND mbti_e_i <= 100),
  mbti_s_n INTEGER CHECK (mbti_s_n >= 0 AND mbti_s_n <= 100),
  mbti_t_f INTEGER CHECK (mbti_t_f >= 0 AND mbti_t_f <= 100),
  mbti_j_p INTEGER CHECK (mbti_j_p >= 0 AND mbti_j_p <= 100),

  -- Big5 (0-100)
  big5_openness INTEGER CHECK (big5_openness >= 0 AND big5_openness <= 100),
  big5_conscientiousness INTEGER CHECK (big5_conscientiousness >= 0 AND big5_conscientiousness <= 100),
  big5_extraversion INTEGER CHECK (big5_extraversion >= 0 AND big5_extraversion <= 100),
  big5_agreeableness INTEGER CHECK (big5_agreeableness >= 0 AND big5_agreeableness <= 100),
  big5_neuroticism INTEGER CHECK (big5_neuroticism >= 0 AND big5_neuroticism <= 100),

  -- Eneagrama
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

  -- Scores (0-100)
  score_contratante INTEGER CHECK (score_contratante >= 0 AND score_contratante <= 100),
  score_funcao INTEGER CHECK (score_funcao >= 0 AND score_funcao <= 100),
  score_lider INTEGER CHECK (score_lider >= 0 AND score_lider <= 100),
  score_geral INTEGER CHECK (score_geral >= 0 AND score_geral <= 100),

  -- Análises
  analise_disc TEXT,
  analise_mbti TEXT,
  analise_big5 TEXT,
  analise_eneagrama TEXT,

  -- Pontos
  pontos_fortes TEXT[],
  pontos_atencao TEXT[],

  -- Recomendação
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
