-- ========================================
-- FIX RLS - PERMITIR INSERÇÃO PÚBLICA DE CLIENTES
-- (Para Landing Pages funcionarem)
-- ========================================

-- Política para permitir SELECT público em clientes (para verificar duplicatas)
DROP POLICY IF EXISTS "Permitir leitura pública de clientes" ON public.clientes;
CREATE POLICY "Permitir leitura pública de clientes" 
  ON public.clientes
  FOR SELECT
  USING (true);

-- Política para permitir INSERT público em clientes (para formulários de captura)
DROP POLICY IF EXISTS "Permitir inserção pública de clientes" ON public.clientes;
CREATE POLICY "Permitir inserção pública de clientes" 
  ON public.clientes
  FOR INSERT
  WITH CHECK (true);

-- Política para permitir UPDATE público em clientes (para atualizar dados existentes)
DROP POLICY IF EXISTS "Permitir atualização pública de clientes" ON public.clientes;
CREATE POLICY "Permitir atualização pública de clientes" 
  ON public.clientes
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Verificar políticas aplicadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'clientes'
ORDER BY policyname;
