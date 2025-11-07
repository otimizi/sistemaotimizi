-- ========================================
-- FIX RLS COMPLETO - CLIENTES E N8N_CHAT_HISTORIES
-- Execute este script COMPLETO no SQL Editor do Supabase
-- ========================================

-- ============================================================
-- 1. LIMPAR TODAS AS POLÍTICAS ANTIGAS DA TABELA CLIENTES
-- ============================================================

-- Remover TODAS as políticas antigas
DO $$ 
DECLARE 
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'clientes'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.clientes', pol.policyname);
  END LOOP;
END $$;

-- ============================================================
-- 2. CRIAR NOVAS POLÍTICAS PARA CLIENTES
-- ============================================================

-- Habilitar RLS
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

-- SELECT: Permitir leitura pública
CREATE POLICY "clientes_select_public" 
  ON public.clientes
  FOR SELECT
  USING (true);

-- INSERT: Permitir inserção pública
CREATE POLICY "clientes_insert_public" 
  ON public.clientes
  FOR INSERT
  WITH CHECK (true);

-- UPDATE: Permitir atualização pública
CREATE POLICY "clientes_update_public" 
  ON public.clientes
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- DELETE: Permitir exclusão pública
CREATE POLICY "clientes_delete_public" 
  ON public.clientes
  FOR DELETE
  USING (true);

-- ============================================================
-- 3. LIMPAR TODAS AS POLÍTICAS ANTIGAS DA TABELA N8N_CHAT_HISTORIES
-- ============================================================

DO $$ 
DECLARE 
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'n8n_chat_histories'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.n8n_chat_histories', pol.policyname);
  END LOOP;
END $$;

-- ============================================================
-- 4. CRIAR NOVAS POLÍTICAS PARA N8N_CHAT_HISTORIES
-- ============================================================

-- Habilitar RLS
ALTER TABLE public.n8n_chat_histories ENABLE ROW LEVEL SECURITY;

-- SELECT: Permitir leitura pública
CREATE POLICY "chat_histories_select_public" 
  ON public.n8n_chat_histories
  FOR SELECT
  USING (true);

-- INSERT: Permitir inserção pública (necessário para landing pages)
CREATE POLICY "chat_histories_insert_public" 
  ON public.n8n_chat_histories
  FOR INSERT
  WITH CHECK (true);

-- UPDATE: Permitir atualização pública
CREATE POLICY "chat_histories_update_public" 
  ON public.n8n_chat_histories
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- DELETE: Permitir exclusão pública
CREATE POLICY "chat_histories_delete_public" 
  ON public.n8n_chat_histories
  FOR DELETE
  USING (true);

-- ============================================================
-- 5. VERIFICAR POLÍTICAS CRIADAS
-- ============================================================

-- Ver políticas de CLIENTES
SELECT 
  '=== CLIENTES ===' as tabela,
  policyname as politica,
  cmd as comando,
  qual as condicao,
  with_check as verificacao
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'clientes'
ORDER BY cmd, policyname;

-- Ver políticas de N8N_CHAT_HISTORIES
SELECT 
  '=== N8N_CHAT_HISTORIES ===' as tabela,
  policyname as politica,
  cmd as comando,
  qual as condicao,
  with_check as verificacao
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'n8n_chat_histories'
ORDER BY cmd, policyname;

-- ============================================================
-- 6. TESTE DE INSERÇÃO (OPCIONAL - DESCOMENTE PARA TESTAR)
-- ============================================================

/*
-- Teste inserir cliente
INSERT INTO public.clientes (nome, telefone, email) 
VALUES ('Teste RLS', '27988491255', 'teste@rls.com')
RETURNING id, nome, telefone;

-- Teste inserir mensagem no chat
INSERT INTO public.n8n_chat_histories (session_id, message)
VALUES (
  '5527988491255',
  '{"type":"ai","content":"Teste RLS","tool_calls":[],"additional_kwargs":{},"response_metadata":{},"invalid_tool_calls":[]}'::jsonb
)
RETURNING id, session_id;
*/

-- ============================================================
-- RESULTADO ESPERADO:
-- Você deve ver 4 políticas para cada tabela:
-- - SELECT (leitura)
-- - INSERT (criação)
-- - UPDATE (atualização)
-- - DELETE (exclusão)
-- Todas com "true" como condição (acesso público)
-- ============================================================
