-- LIMPEZA NUCLEAR (SOLUÇÃO FINAL) ☢️
-- Este script apaga TODAS as referêncas a administradores nas tabelas públicas.
-- Use isso se você deletou o usuário no painel do Supabase e o site ainda acha que tem admin.

BEGIN;

-- 1. Limpar tabela legada de admins (Onde o "Zumbi" mora)
TRUNCATE TABLE public.admin_users CASCADE;

-- 2. Limpar perfis novos
TRUNCATE TABLE public.admin_profiles CASCADE;

-- 3. Limpar rádios (tenants)
TRUNCATE TABLE public.tenants CASCADE;

COMMIT;

-- Agora o site VAI deixar criar conta, porque não sobrou ninguém.
