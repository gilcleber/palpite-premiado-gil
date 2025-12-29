-- CORREÇÃO DE LOOP INFINITO (CRÍTICO) 🔄
-- O "Carregando Eterno" acontece porque o banco de dados entra num loop infinito verificando permissões.
-- Este script QUEBRA o loop recriando as funções com permissão especial (SECURITY DEFINER).

-- 1. Limpar políticas antigas que causam o loop
DROP POLICY IF EXISTS "Super Admins can view all profiles" ON public.admin_profiles;
DROP POLICY IF EXISTS "Admins can view their own tenant" ON public.tenants;
DROP POLICY IF EXISTS "Admins can update app_settings" ON public.app_settings;

-- 2. Recriar Função IS_SUPER_ADMIN (Bypass RLS)
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS 'SELECT EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND role = ''super_admin'');';

-- 3. Recriar Função GET_MY_TENANT_ID (Bypass RLS)
CREATE OR REPLACE FUNCTION public.get_my_tenant_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS 'SELECT tenant_id FROM admin_profiles WHERE id = auth.uid();';

-- 4. Reaplicar as Políticas (Agora seguras)

-- Perfis: Super admin vê tudo (agora sem travar)
CREATE POLICY "Super Admins can view all profiles" 
ON public.admin_profiles 
FOR SELECT 
USING (public.is_super_admin());

-- Tenants: Ver apenas o seu
CREATE POLICY "Admins can view their own tenant" 
ON public.tenants 
FOR SELECT 
USING (id = public.get_my_tenant_id() OR public.is_super_admin());

-- Configurações: Editar apenas o seu
CREATE POLICY "Admins can update app_settings" 
ON public.app_settings 
FOR UPDATE 
USING (
  public.is_super_admin() 
  OR tenant_id = public.get_my_tenant_id()
  OR (tenant_id IS NULL AND auth.role() = 'authenticated')
);
