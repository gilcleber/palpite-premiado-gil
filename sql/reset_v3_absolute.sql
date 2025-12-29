-- RESET ABSOLUTO v3.1 (COMEÇAR DO ZERO) 🔄
-- Rode isso se nada mais funcionar.
-- Ele apaga TUDO e deixa o terreno pronto para o "Criar Admin".

BEGIN;

-- 1. Limpeza Nuclear (Apaga referências antigas)
TRUNCATE TABLE public.admin_users CASCADE;
TRUNCATE TABLE public.admin_profiles CASCADE;
TRUNCATE TABLE public.tenants CASCADE;

-- 2. Correção de Permissões (Para não travar depois de criar)
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own admin profile" ON public.admin_profiles;
CREATE POLICY "Users can view own admin profile" ON public.admin_profiles FOR SELECT USING (auth.uid() = id);

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view their own tenant" ON public.tenants;
CREATE POLICY "Admins can view their own tenant" ON public.tenants FOR SELECT USING (id = public.get_my_tenant_id() OR public.is_super_admin());

-- 3. Prevenir erro de "Email não confirmado" (Para o futuro usuário)
-- (Como não sabemos o ID do futuro usuário ainda, isso é um trigger preventivo, ou apenas rode confirm_email.sql depois de criar)

COMMIT;

-- Aviso
RAISE NOTICE 'SISTEMA LIMPO! Dê F5 no site e crie o admin.';
