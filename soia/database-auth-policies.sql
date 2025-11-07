-- =====================================================
-- SOIA - Sistema de Autenticação
-- Políticas de Segurança (RLS) para o Supabase
-- =====================================================

-- 1. Habilitar RLS em todas as tabelas principais
-- =====================================================

ALTER TABLE IF EXISTS mercadolivre_registro_comentarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS mercadolivre_registro_msgposvenda ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS registro_notificacao_mercadolivre ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS mercadolivre_produtos ENABLE ROW LEVEL SECURITY;

-- 2. Remover políticas existentes (se houver)
-- =====================================================

DROP POLICY IF EXISTS "Permitir acesso para usuários autenticados" ON mercadolivre_registro_comentarios;
DROP POLICY IF EXISTS "Permitir acesso para usuários autenticados" ON mercadolivre_registro_msgposvenda;
DROP POLICY IF EXISTS "Permitir acesso para usuários autenticados" ON registro_notificacao_mercadolivre;
DROP POLICY IF EXISTS "Permitir acesso para usuários autenticados" ON clientes;
DROP POLICY IF EXISTS "Permitir acesso para usuários autenticados" ON mercadolivre_produtos;

-- 3. Criar políticas para mercadolivre_registro_comentarios
-- =====================================================

-- Permitir SELECT para usuários autenticados
CREATE POLICY "Permitir leitura de comentários para usuários autenticados"
ON mercadolivre_registro_comentarios
FOR SELECT
TO authenticated
USING (true);

-- Permitir INSERT para usuários autenticados
CREATE POLICY "Permitir inserção de comentários para usuários autenticados"
ON mercadolivre_registro_comentarios
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Permitir UPDATE para usuários autenticados
CREATE POLICY "Permitir atualização de comentários para usuários autenticados"
ON mercadolivre_registro_comentarios
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 4. Criar políticas para mercadolivre_registro_msgposvenda
-- =====================================================

CREATE POLICY "Permitir leitura de mensagens pós-venda para usuários autenticados"
ON mercadolivre_registro_msgposvenda
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Permitir inserção de mensagens pós-venda para usuários autenticados"
ON mercadolivre_registro_msgposvenda
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Permitir atualização de mensagens pós-venda para usuários autenticados"
ON mercadolivre_registro_msgposvenda
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 5. Criar políticas para registro_notificacao_mercadolivre
-- =====================================================

CREATE POLICY "Permitir leitura de notificações para usuários autenticados"
ON registro_notificacao_mercadolivre
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Permitir inserção de notificações para usuários autenticados"
ON registro_notificacao_mercadolivre
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Permitir atualização de notificações para usuários autenticados"
ON registro_notificacao_mercadolivre
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 6. Criar políticas para clientes
-- =====================================================

CREATE POLICY "Permitir leitura de clientes para usuários autenticados"
ON clientes
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Permitir inserção de clientes para usuários autenticados"
ON clientes
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Permitir atualização de clientes para usuários autenticados"
ON clientes
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 7. Criar políticas para mercadolivre_produtos
-- =====================================================

CREATE POLICY "Permitir leitura de produtos para usuários autenticados"
ON mercadolivre_produtos
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Permitir inserção de produtos para usuários autenticados"
ON mercadolivre_produtos
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Permitir atualização de produtos para usuários autenticados"
ON mercadolivre_produtos
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 8. Criar função para verificar se o usuário é admin (opcional)
-- =====================================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT (auth.jwt()->>'user_metadata')::json->>'role' = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Comentários e metadados
-- =====================================================

COMMENT ON POLICY "Permitir leitura de comentários para usuários autenticados" 
ON mercadolivre_registro_comentarios IS 
'Permite que usuários autenticados leiam todos os comentários do sistema';

COMMENT ON POLICY "Permitir leitura de mensagens pós-venda para usuários autenticados" 
ON mercadolivre_registro_msgposvenda IS 
'Permite que usuários autenticados leiam todas as mensagens pós-venda do sistema';

COMMENT ON POLICY "Permitir leitura de notificações para usuários autenticados" 
ON registro_notificacao_mercadolivre IS 
'Permite que usuários autenticados leiam todas as notificações do sistema';

COMMENT ON POLICY "Permitir leitura de clientes para usuários autenticados" 
ON clientes IS 
'Permite que usuários autenticados leiam todos os clientes do sistema';

-- =====================================================
-- FIM DA CONFIGURAÇÃO
-- =====================================================

-- Para verificar as políticas criadas, execute:
-- SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';
