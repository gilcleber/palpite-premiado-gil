-- FORCE FIX ALL ISSUES v9 (O REMÉDIO AMARGO) 💊
-- Este script força a atualização de tudo e garante permissões.

BEGIN;

-- 1. Forçar Atualização de Perfil
UPDATE public.admin_profiles
SET role = 'super_admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'gilcleberlocutor@gmail.com');

-- 2. Garantir que Tenant exista e esteja ativo
UPDATE public.tenants
SET status = 'active', valid_until = (NOW() + interval '10 years')
WHERE owner_email = 'gilcleberlocutor@gmail.com';

-- 3. FORÇAR RLS EM TUDO (RE-APPLY)
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- 4. Criar Funções de Segurança Definitivas
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Policies "DOADOR UNIVERSAL" (Permite tudo para o Super Admin)
DROP POLICY IF EXISTS "Super Admin ALL app_settings" ON public.app_settings;
CREATE POLICY "Super Admin ALL app_settings" ON public.app_settings FOR ALL
USING ( public.is_super_admin() ) WITH CHECK ( public.is_super_admin() );

DROP POLICY IF EXISTS "Super Admin ALL prizes" ON public.prizes;
CREATE POLICY "Super Admin ALL prizes" ON public.prizes FOR ALL
USING ( public.is_super_admin() ) WITH CHECK ( public.is_super_admin() );

DROP POLICY IF EXISTS "Super Admin ALL tenants" ON public.tenants;
CREATE POLICY "Super Admin ALL tenants" ON public.tenants FOR ALL
USING ( public.is_super_admin() ) WITH CHECK ( public.is_super_admin() );

-- 6. Garantir que o usuário "legacy" não atrapalhe
DELETE FROM public.admin_users WHERE email = 'gilcleberlocutor@gmail.com' AND id != (SELECT id FROM auth.users WHERE email = 'gilcleberlocutor@gmail.com');

COMMIT;

RAISE NOTICE '✅ PERMISSÕES REPARADAS. Tente salvar agora.';
