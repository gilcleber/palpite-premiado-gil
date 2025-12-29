-- 🚨 LIMPEZA DE EMERGÊNCIA (Triggers e Zumbis) 🚨
-- Este script corrige o erro "Database error checking email" e remove usuários travados.

BEGIN;

-- 1. REMOVER TRIGGERS QUEBRADOS
-- Se existir algum gatilho automático falhando, ele impede novos cadastros e deleções.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. DERRUBAR RESTRIÇÕES (Temporariamente para limpar)
-- Remove o usuário Zumbi (aquele 'deleted_...')
-- Substitua o ID abaixo se for diferente, mas peguei do seu print.
DELETE FROM public.admin_profiles WHERE id = 'c3d85334-efb9-40b5-8410-6033ca292aa7';
DELETE FROM public.admin_users WHERE id = 'c3d85334-efb9-40b5-8410-6033ca292aa7';
-- Tenta deletar qualquer tenant que ele seja dono
DELETE FROM public.tenants WHERE owner_email LIKE 'deleted_%';

-- 3. FINALMENTE, DELETAR O ZUMBI DA AUTENTICAÇÃO
DELETE FROM auth.users WHERE id = 'c3d85334-efb9-40b5-8410-6033ca292aa7';

-- 4. LIMPAR O EMAIL ORIGINAL (Para garantir que está livre)
DELETE FROM auth.users WHERE email = 'gilcleberlocutor@gmail.com';

COMMIT;

-- 5. RECRIAR O ADMIN CORRETAMENTE (Opcional, mas recomendado)
-- Se você quiser já criar o admin aqui direto, descomente as linhas abaixo:
/*
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'gilcleberlocutor@gmail.com', crypt('mudarsenha123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '');
*/

RAISE NOTICE 'Limpeza concluída! Tente criar o usuário novamente.';
