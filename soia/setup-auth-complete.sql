-- =====================================================
-- SOIA - CONFIGURAÇÃO COMPLETA DE AUTENTICAÇÃO
-- =====================================================
-- Execute este script COMPLETO no SQL Editor do Supabase
-- Ele irá:
-- 1. Configurar políticas RLS para todas as tabelas
-- 2. Criar o usuário administrador
-- =====================================================

-- ============================================================
-- PARTE 1: CONFIGURAR POLÍTICAS RLS
-- ============================================================

-- 1. Habilitar RLS em todas as tabelas principais
ALTER TABLE IF EXISTS mercadolivre_registro_comentarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS mercadolivre_registro_msgposvenda ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS registro_notificacao_mercadolivre ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS mercadolivre_produtos ENABLE ROW LEVEL SECURITY;

-- 2. Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Permitir acesso para usuários autenticados" ON mercadolivre_registro_comentarios;
DROP POLICY IF EXISTS "Permitir acesso para usuários autenticados" ON mercadolivre_registro_msgposvenda;
DROP POLICY IF EXISTS "Permitir acesso para usuários autenticados" ON registro_notificacao_mercadolivre;
DROP POLICY IF EXISTS "Permitir acesso para usuários autenticados" ON clientes;
DROP POLICY IF EXISTS "Permitir acesso para usuários autenticados" ON mercadolivre_produtos;

-- 3. Criar políticas para mercadolivre_registro_comentarios
CREATE POLICY "Permitir leitura de comentários para usuários autenticados"
ON mercadolivre_registro_comentarios
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Permitir inserção de comentários para usuários autenticados"
ON mercadolivre_registro_comentarios
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Permitir atualização de comentários para usuários autenticados"
ON mercadolivre_registro_comentarios
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 4. Criar políticas para mercadolivre_registro_msgposvenda
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

-- ============================================================
-- PARTE 2: CRIAR USUÁRIO ADMINISTRADOR
-- ============================================================

-- Verificar se o usuário já existe e removê-lo se necessário
DELETE FROM auth.identities WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'otimiziambientes@gmail.com'
);

DELETE FROM auth.users WHERE email = 'otimiziambientes@gmail.com';

-- Criar usuário admin
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'otimiziambientes@gmail.com',
  crypt('otimizi2025#', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"],"role":"admin"}',
  '{"full_name":"Administrador SOIA","role":"admin"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Criar entrada na tabela identities
DO $$
DECLARE
  new_identity_id uuid := gen_random_uuid();
  admin_user_id uuid;
BEGIN
  -- Obter o ID do usuário admin recém-criado
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'otimiziambientes@gmail.com';
  
  -- Inserir na tabela identities com provider_id
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    new_identity_id,
    admin_user_id,
    format('{"sub":"%s","email":"%s"}', admin_user_id::text, 'otimiziambientes@gmail.com')::jsonb,
    'email',
    admin_user_id::text,
    NOW(),
    NOW(),
    NOW()
  );
END $$;

-- ============================================================
-- VERIFICAÇÃO FINAL
-- ============================================================

-- Verificar políticas criadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN (
    'mercadolivre_registro_comentarios',
    'mercadolivre_registro_msgposvenda',
    'registro_notificacao_mercadolivre',
    'clientes',
    'mercadolivre_produtos'
  )
ORDER BY tablename, policyname;

-- Verificar usuário admin criado
SELECT 
  id,
  email,
  email_confirmed_at,
  raw_app_meta_data->>'role' as role,
  raw_user_meta_data->>'full_name' as full_name,
  created_at
FROM auth.users 
WHERE email = 'otimiziambientes@gmail.com';

-- =====================================================
-- FIM DA CONFIGURAÇÃO
-- =====================================================
-- ✅ Políticas RLS configuradas com sucesso!
-- ✅ Usuário administrador criado com sucesso!
-- 
-- CREDENCIAIS DO ADMIN:
-- Email: otimiziambientes@gmail.com
-- Senha: otimizi2025#
-- 
-- Você pode fazer login em: http://localhost:3000/login
-- =====================================================
