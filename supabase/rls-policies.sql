-- Row Level Security Policies para ProjetoPCI
-- CRÍTICO: Implementar antes de ir para produção

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

-- ======== USUARIOS ========
-- Usuários podem ver e editar apenas seus próprios dados
CREATE POLICY "Users can view own data" ON usuarios
  FOR SELECT USING (clerk_id = auth.jwt()->>'clerk_id');

CREATE POLICY "Users can update own data" ON usuarios
  FOR UPDATE USING (clerk_id = auth.jwt()->>'clerk_id');

CREATE POLICY "Users can insert own data" ON usuarios
  FOR INSERT WITH CHECK (clerk_id = auth.jwt()->>'clerk_id');

-- ======== PERFIS COMPORTAMENTAIS ========
CREATE POLICY "Users can view own profile" ON perfis_comportamentais
  FOR SELECT USING (usuario_id = get_user_id_from_clerk());

CREATE POLICY "Users can update own profile" ON perfis_comportamentais
  FOR UPDATE USING (usuario_id = get_user_id_from_clerk());

CREATE POLICY "Users can insert own profile" ON perfis_comportamentais
  FOR INSERT WITH CHECK (usuario_id = get_user_id_from_clerk());

-- ======== PROCESSOS ========
-- Usuário principal pode ver/editar seus processos
-- Líder pode ver processos onde é líder
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

-- ======== FUNÇÕES ========
-- Acesso baseado no processo
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

-- ======== CANDIDATOS ========
-- Candidatos podem ver suas próprias candidaturas
-- Donos do processo podem ver todos os candidatos
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

-- ======== PERGUNTAS ========
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

-- ======== RESPOSTAS AUDIO ========
-- Candidatos podem ver/criar suas respostas
-- Donos podem ver todas as respostas do processo
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

-- ======== FIT ANALISES ========
-- Apenas donos do processo podem ver análises
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
