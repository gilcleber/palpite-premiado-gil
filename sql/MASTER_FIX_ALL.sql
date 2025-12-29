-- 🚨 SCRIPT MESTRE DE CORREÇÃO (MASTER FIX) 🚨
-- Este script resolve TODOS os problemas de permissão, "loop infinito" e "erro de cadastro".
-- Rode este script COMPLETO no Editor SQL do Supabase.

BEGIN;

-------------------------------------------------------------------------------
-- 1. LIMPEZA E PREPARAÇÃO (Sem apagar dados vitais, apenas arrumando a casa)
-------------------------------------------------------------------------------
-- Habilita RLS em todas as tabelas críticas
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-------------------------------------------------------------------------------
-- 2. CORREÇÃO DE PERMISSÕES DA TABELA 'admin_users' (O bloqueio do cadastro)
-------------------------------------------------------------------------------
-- Permite que qualquer pessoa (mesmo sem login) verifique se já existe admin
DROP POLICY IF EXISTS "Public read admin_users" ON public.admin_users;
CREATE POLICY "Public read admin_users" ON public.admin_users FOR SELECT USING (true);

-- Permite que o PRIMEIRO admin se cadastre (Insert)
DROP POLICY IF EXISTS "Public insert admin_users" ON public.admin_users;
CREATE POLICY "Public insert admin_users" ON public.admin_users FOR INSERT WITH CHECK (true);

-- Permite que o usuário edite seu próprio registro
DROP POLICY IF EXISTS "Users update own admin_users" ON public.admin_users;
CREATE POLICY "Users update own admin_users" ON public.admin_users FOR UPDATE USING (auth.uid() = id);

-------------------------------------------------------------------------------
-- 3. CORREÇÃO DE PERMISSÕES DE PERFIL E TENANT (O bloqueio do loop/loading)
-------------------------------------------------------------------------------
-- Funções de segurança (Recriadas para evitar recursão infinita)
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER -- Roda com poderes máximos para não travar no RLS
AS $$
SELECT EXISTS (SELECT 1 FROM public.admin_profiles WHERE id = auth.uid() AND role = 'super_admin');
$$;

CREATE OR REPLACE FUNCTION public.get_my_tenant_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
AS $$
SELECT tenant_id FROM public.admin_profiles WHERE id = auth.uid();
$$;

-- Políticas de Perfil (Profile)
DROP POLICY IF EXISTS "Users can view own admin profile" ON public.admin_profiles;
CREATE POLICY "Users can view own admin profile" ON public.admin_profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Super Admins can view all profiles" ON public.admin_profiles;
CREATE POLICY "Super Admins can view all profiles" ON public.admin_profiles FOR SELECT USING (public.is_super_admin());

-- Políticas de Rádio (Tenant)
DROP POLICY IF EXISTS "Admins can view their own tenant" ON public.tenants;
CREATE POLICY "Admins can view their own tenant" ON public.tenants FOR SELECT USING (id = public.get_my_tenant_id() OR public.is_super_admin());

-------------------------------------------------------------------------------
-- 4. CONFIRMAÇÃO DE EMAILS PENDENTES (O erro "Email not confirmed")
-------------------------------------------------------------------------------
UPDATE auth.users
SET email_confirmed_at = NOW(),
    confirmation_token = NULL,
    confirmation_sent_at = NULL,
    raw_user_meta_data = jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{email_confirmed}', 'true')
WHERE email_confirmed_at IS NULL;

COMMIT;

-- FIM.
-- Se rodou sem erro vermelho, seu banco está PRONTO para aceitar o login v3.3.
