-- SAFE WIPE v6 (SEM ERRO DE PERMISSÃO) 🛡️
-- Apaga tudo usando DELETE (permitido) em vez de TRUNCATE (restrito).

BEGIN;

-- 1. Limpar tabelas do SEU sistema (Schema Public)
DELETE FROM public.admin_profiles;
DELETE FROM public.tenants;
DELETE FROM public.admin_users;
DELETE FROM public.app_settings;
DELETE FROM public.prizes;

-- 2. Limpar usuários do Auth (Usando DELETE para evitar erro "must be owner")
-- Nota: O Supabase pode impedir isso dependendo do nível de acesso.
-- Se der erro aqui, você terá que deletar os usuários pelo menu "Authentication" do painel.
DELETE FROM auth.identities;
DELETE FROM auth.sessions;
DELETE FROM auth.users;

-- 3. Resetar permissões para garantir o cadastro
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public insert admin_users" ON public.admin_users;
CREATE POLICY "Public insert admin_users" ON public.admin_users FOR INSERT WITH CHECK (true);

COMMIT;

RAISE NOTICE 'Limpeza concluída. Tente criar o Super Admin agora.';
