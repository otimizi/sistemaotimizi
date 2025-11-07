-- ========================================
-- FIX: Liberar acesso de leitura para todas as tabelas
-- ========================================
-- Execute este script no SQL Editor do Supabase

-- 1. CLIENTES
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir operações públicas (necessário para landing pages)
DROP POLICY IF EXISTS "Permitir leitura pública de clientes" ON public.clientes;
CREATE POLICY "Permitir leitura pública de clientes" 
  ON public.clientes
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Permitir inserção pública de clientes" ON public.clientes;
CREATE POLICY "Permitir inserção pública de clientes" 
  ON public.clientes
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir atualização pública de clientes" ON public.clientes;
CREATE POLICY "Permitir atualização pública de clientes" 
  ON public.clientes
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir exclusão de clientes" ON public.clientes;
CREATE POLICY "Permitir exclusão de clientes" 
  ON public.clientes
  FOR DELETE
  USING (true);

-- 2. DOCUMENTS
ALTER TABLE IF EXISTS public.documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access" ON public.documents;
CREATE POLICY "Allow public read access"
  ON public.documents
  FOR SELECT
  USING (true);

-- 3. MERCADOLIVRE_PRODUTOS
ALTER TABLE IF EXISTS public.mercadolivre_produtos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access" ON public.mercadolivre_produtos;
CREATE POLICY "Allow public read access"
  ON public.mercadolivre_produtos
  FOR SELECT
  USING (true);

-- 4. MERCADOLIVRE_REGISTRO_COMENTARIOS
ALTER TABLE IF EXISTS public.mercadolivre_registro_comentarios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access" ON public.mercadolivre_registro_comentarios;
CREATE POLICY "Allow public read access"
  ON public.mercadolivre_registro_comentarios
  FOR SELECT
  USING (true);

-- 5. MERCADOLIVRE_REGISTRO_MSGPOSVENDA
ALTER TABLE IF EXISTS public.mercadolivre_registro_msgposvenda ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access" ON public.mercadolivre_registro_msgposvenda;
CREATE POLICY "Allow public read access"
  ON public.mercadolivre_registro_msgposvenda
  FOR SELECT
  USING (true);

-- 6. N8N_CHAT_HISTORIES
ALTER TABLE IF EXISTS public.n8n_chat_histories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access" ON public.n8n_chat_histories;
CREATE POLICY "Allow public read access"
  ON public.n8n_chat_histories
  FOR SELECT
  USING (true);

-- 7. REGISTRO_NOTIFICACAO_MERCADOLIVRE
ALTER TABLE IF EXISTS public.registro_notificacao_mercadolivre ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access" ON public.registro_notificacao_mercadolivre;
CREATE POLICY "Allow public read access"
  ON public.registro_notificacao_mercadolivre
  FOR SELECT
  USING (true);

-- 8. REGISTROS_NOTIFICACAO
ALTER TABLE IF EXISTS public.registros_notificacao ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access" ON public.registros_notificacao;
CREATE POLICY "Allow public read access"
  ON public.registros_notificacao
  FOR SELECT
  USING (true);

-- 9. ROLETA_ATENDIMENTO
ALTER TABLE IF EXISTS public.roleta_atendimento ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access" ON public.roleta_atendimento;
CREATE POLICY "Allow public read access"
  ON public.roleta_atendimento
  FOR SELECT
  USING (true);

-- 10. VENDEDORES
ALTER TABLE IF EXISTS public.vendedores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access" ON public.vendedores;
CREATE POLICY "Allow public read access"
  ON public.vendedores
  FOR SELECT
  USING (true);

-- 11. GERENCIAMENTO_AI
ALTER TABLE IF EXISTS public.gerenciamento_ai ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access" ON public.gerenciamento_ai;
DROP POLICY IF EXISTS "Allow public insert access" ON public.gerenciamento_ai;
DROP POLICY IF EXISTS "Allow public update access" ON public.gerenciamento_ai;

CREATE POLICY "Allow public read access"
  ON public.gerenciamento_ai
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access"
  ON public.gerenciamento_ai
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access"
  ON public.gerenciamento_ai
  FOR UPDATE
  USING (true);

-- ========================================
-- VERIFICAÇÃO
-- ========================================

-- Verificar políticas criadas
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Contar registros em cada tabela
SELECT 'clientes' as tabela, COUNT(*) as registros FROM public.clientes
UNION ALL
SELECT 'mercadolivre_produtos', COUNT(*) FROM public.mercadolivre_produtos
UNION ALL
SELECT 'mercadolivre_registro_comentarios', COUNT(*) FROM public.mercadolivre_registro_comentarios
UNION ALL
SELECT 'mercadolivre_registro_msgposvenda', COUNT(*) FROM public.mercadolivre_registro_msgposvenda
UNION ALL
SELECT 'registro_notificacao_mercadolivre', COUNT(*) FROM public.registro_notificacao_mercadolivre
UNION ALL
SELECT 'gerenciamento_ai', COUNT(*) FROM public.gerenciamento_ai;
