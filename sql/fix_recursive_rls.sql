-- CORREÇÃO DO LOOP DE SEGURANÇA (CRÍTICO)
-- As regras anteriores criaram um "loop infinito" no banco de dados.
-- Este script limpa as regras antigas e cria funções seguras para verificar permissões.

-- 1. Limpar Policies Antigas (para evitar conflitos)
DROP POLICY IF EXISTS "Users can view their own admin profile" ON public.admin_profiles;
DROP POLICY IF EXISTS "Super Admins can view all profiles" ON public.admin_profiles;
DROP POLICY IF EXISTS "Admins can view their own tenant" ON public.tenants;
DROP POLICY IF EXISTS "Super Admins can view all tenants" ON public.tenants;

-- 2. Criar Funções de Segurança (SECURITY DEFINER = acessa dados sem ser bloqueado pelo RLS)
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_profiles 
    WHERE id = auth.uid() 
    AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_my_tenant_id()
RETURNS UUID AS $$
DECLARE
  tid UUID;
BEGIN
  SELECT tenant_id INTO tid FROM public.admin_profiles WHERE id = auth.uid();
  RETURN tid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Recriar Policies de Forma Segura

-- ADMIN_PROFILES:
-- Cada um vê o seu
CREATE POLICY "Users can view their own admin profile" 
ON public.admin_profiles
FOR SELECT
USING (auth.uid() = id);

-- Super admin vê todos (usando a função segura)
CREATE POLICY "Super Admins can view all profiles" 
ON public.admin_profiles
FOR SELECT
USING (public.is_super_admin());

-- Insert/Update só Super Admin (ou triggers automáticos)
CREATE POLICY "Super Admins can manage profiles" 
ON public.admin_profiles
FOR ALL
USING (public.is_super_admin());


-- TENANTS:
-- Admin vê sua rádio
CREATE POLICY "Admins can view their own tenant" 
ON public.tenants
FOR SELECT
USING (id = public.get_my_tenant_id());

-- Super admin vê todas
CREATE POLICY "Super Admins can view all tenants" 
ON public.tenants
FOR ALL
USING (public.is_super_admin());
