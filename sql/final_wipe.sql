-- OPÇÃO NUCLEAR (FINAL WIPE) ☢️
-- Este script faz o seguinte:
-- 1. Esvazia todas as tabelas de admin (users, profiles, tenants).
-- 2. "Apaga" o seu email da tabela de login (renomeando para deleted_...) para liberar o cadastro.
-- 3. Prepara o terreno para o "Primeiro Acesso" real.

BEGIN;

-- 1. Limpar tabelas de dados
TRUNCATE TABLE public.admin_users CASCADE;
TRUNCATE TABLE public.admin_profiles CASCADE;
TRUNCATE TABLE public.tenants CASCADE;

-- 2. Liberar o email (Renomeando o antigo para não dar conflito)
UPDATE auth.users 
SET email = 'deleted_' || floor(random() * 100000) || '_' || email,
    raw_user_meta_data = jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{deleted}', 'true')
WHERE email = 'gilcleberlocutor@gmail.com';

COMMIT;

-- 3. Garantir Políticas de Segurança (Para não travar login depois)
-- (Rodar fora do bloco transacional se der erro, mas aqui costuma ir bem)

ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own admin profile" ON public.admin_profiles;
CREATE POLICY "Users can view own admin profile" ON public.admin_profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Super Admins can view all profiles" ON public.admin_profiles;
CREATE POLICY "Super Admins can view all profiles" ON public.admin_profiles FOR SELECT USING (public.is_super_admin());

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view their own tenant" ON public.tenants;
CREATE POLICY "Admins can view their own tenant" ON public.tenants FOR SELECT USING (id = public.get_my_tenant_id() OR public.is_super_admin());
