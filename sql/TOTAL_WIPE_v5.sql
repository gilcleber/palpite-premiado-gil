-- TOTAL WIPE v5 (APAGA TUDO REAIS) ☢️
-- Use este script para LIMPAR COMPLETAMENTE o banco e começar do zero.
-- Ele remove todos os usuários, tenants, configs e perfis.

BEGIN;

-- 1. Desabilitar Triggers para evitar erros
ALTER TABLE auth.users DISABLE TRIGGER ALL;
ALTER TABLE public.admin_profiles DISABLE TRIGGER ALL;
ALTER TABLE public.tenants DISABLE TRIGGER ALL;

-- 2. Limpar tabelas públicas (Ordem importa por causa das FKs)
TRUNCATE TABLE public.admin_profiles CASCADE;
TRUNCATE TABLE public.tenants CASCADE;
TRUNCATE TABLE public.admin_users CASCADE;
TRUNCATE TABLE public.app_settings CASCADE;
TRUNCATE TABLE public.prizes CASCADE;

-- 3. Limpar Usuários do Supabase Auth
TRUNCATE TABLE auth.users CASCADE;
TRUNCATE TABLE auth.identities CASCADE;
TRUNCATE TABLE auth.sessions CASCADE;

-- 4. Reabilitar Triggers
ALTER TABLE auth.users ENABLE TRIGGER ALL;
ALTER TABLE public.admin_profiles ENABLE TRIGGER ALL;
ALTER TABLE public.tenants ENABLE TRIGGER ALL;

-- 5. Garantir que as Policies permitam o primeiro acesso
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public insert admin_users" ON public.admin_users;
CREATE POLICY "Public insert admin_users" ON public.admin_users FOR INSERT WITH CHECK (true);

COMMIT;

RAISE NOTICE 'SISTEMA ZERADO. O próximo usuário a se cadastrar será o Super Admin.';
