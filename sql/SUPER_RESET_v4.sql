-- SUPER RESET v4 (A CARTA FINAL) 💀
-- Este script resolve:
-- 1. Erro "Database error checking email" (Triggers)
-- 2. Erro "Email already confirmed"
-- 3. Loop Infinito
-- 4. Usuários Zumbis (deleted_...)

BEGIN;

-- 1. MATAR TRIGGERS SILENCIOSOS (Causa principal do erro de banco)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. LIMPEZA DE ZUMBIS (Remove qualquer usuário com email 'deleted')
DELETE FROM public.admin_profiles WHERE id IN (SELECT id FROM auth.users WHERE email LIKE 'deleted_%');
DELETE FROM public.admin_users WHERE id IN (SELECT id FROM auth.users WHERE email LIKE 'deleted_%');
DELETE FROM public.tenants WHERE owner_email LIKE 'deleted_%';
DELETE FROM auth.users WHERE email LIKE 'deleted_%';

-- 3. LIMPEZA PROFUNDA DO SEU EMAIL (Para garantir recomeço)
-- Remove dependências primeiro
DELETE FROM public.admin_profiles WHERE id IN (SELECT id FROM auth.users WHERE email = 'gilcleberlocutor@gmail.com');
DELETE FROM public.admin_users WHERE id IN (SELECT id FROM auth.users WHERE email = 'gilcleberlocutor@gmail.com');
DELETE FROM public.tenants WHERE owner_email = 'gilcleberlocutor@gmail.com';
DELETE FROM auth.users WHERE email = 'gilcleberlocutor@gmail.com';

-- 4. DESTRAVAR PERMISSÕES (RLS)
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public insert admin_users" ON public.admin_users;
CREATE POLICY "Public insert admin_users" ON public.admin_users FOR INSERT WITH CHECK (true);

COMMIT;

RAISE NOTICE 'SISTEMA LIMPO. Pode criar o admin na v3.4 sem erros.';
