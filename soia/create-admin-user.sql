-- =====================================================
-- SOIA - Criar Usuário Administrador
-- =====================================================
-- Este script cria um usuário admin no Supabase Auth
-- IMPORTANTE: Execute este script no SQL Editor do Supabase
-- =====================================================

-- Criar usuário admin
-- Email: otimiziambientes@gmail.com
-- Senha: otimizi2025#
-- Role: admin

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
  crypt('otimizi2025#', gen_salt('bf')), -- Senha criptografada com bcrypt
  NOW(),
  '{"provider":"email","providers":["email"],"role":"admin"}', -- Definir como admin
  '{"full_name":"Administrador SOIA","role":"admin"}', -- Metadados do usuário
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

-- Verificar se o usuário foi criado com sucesso
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
-- FIM DO SCRIPT
-- =====================================================
-- O usuário admin foi criado com sucesso!
-- 
-- Credenciais:
-- Email: otimiziambientes@gmail.com
-- Senha: otimizi2025#
-- 
-- Você pode fazer login imediatamente em: http://localhost:3000/login
-- =====================================================
