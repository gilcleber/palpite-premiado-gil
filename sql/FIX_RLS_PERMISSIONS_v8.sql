-- FIX RLS PERMISSIONS v8 (LIBERA GERAL PARA SUPER ADMIN) 🔓
-- Este script garante que o Super Admin possa EDITAR e DELETAR qualquer coisa.

BEGIN;

-- 1. Função auxiliar para verificar se é super admin ou dono
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
DECLARE
  v_role text;
BEGIN
  -- Verificar na tabela de profiles
  SELECT role INTO v_role
  FROM public.admin_profiles
  WHERE id = auth.uid();
  
  IF v_role = 'super_admin' THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Corrigir Policies de App Settings (Configurações)
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access" ON public.app_settings;
CREATE POLICY "Public read access" ON public.app_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Super Admin full access" ON public.app_settings;
CREATE POLICY "Super Admin full access" ON public.app_settings FOR ALL 
USING ( public.is_super_admin() )
WITH CHECK ( public.is_super_admin() );

-- Permitir também se for o dono do tenant (caso não seja super admin)
DROP POLICY IF EXISTS "Tenant Owner access" ON public.app_settings;
CREATE POLICY "Tenant Owner access" ON public.app_settings FOR ALL
USING ( 
  EXISTS (
    SELECT 1 FROM public.tenants 
    WHERE id = public.app_settings.tenant_id 
    AND owner_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

-- 3. Corrigir Policies de Prizes (Prêmios)
ALTER TABLE public.prizes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read prizes" ON public.prizes;
CREATE POLICY "Public read prizes" ON public.prizes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Super Admin prizes" ON public.prizes;
CREATE POLICY "Super Admin prizes" ON public.prizes FOR ALL
USING ( public.is_super_admin() )
WITH CHECK ( public.is_super_admin() );

-- 4. Corrigir Policies de Tenants
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read tenants" ON public.tenants;
CREATE POLICY "Public read tenants" ON public.tenants FOR SELECT USING (true);

DROP POLICY IF EXISTS "Super Admin tenants" ON public.tenants;
CREATE POLICY "Super Admin tenants" ON public.tenants FOR ALL
USING ( public.is_super_admin() )
WITH CHECK ( public.is_super_admin() );

-- 5. Corrigir Admin Profiles
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Super Admin profiles" ON public.admin_profiles;
CREATE POLICY "Super Admin profiles" ON public.admin_profiles FOR ALL
USING ( public.is_super_admin() )
WITH CHECK ( public.is_super_admin() );

DROP POLICY IF EXISTS "Users users own profile" ON public.admin_profiles;
CREATE POLICY "Users users own profile" ON public.admin_profiles FOR SELECT
USING ( auth.uid() = id );

COMMIT;

RAISE NOTICE '✅ RLS CORRIGIDO: Super Admin agora tem permissão total.';
