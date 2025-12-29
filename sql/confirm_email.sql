-- CONFIRMAÇÃO MANUAL DE EMAIL 📧
-- Este script força a confirmação do email do usuário para pular a etapa de verificação.

UPDATE auth.users
SET email_confirmed_at = NOW(),
    confirmation_token = NULL,
    confirmation_sent_at = NULL,
    raw_user_meta_data = jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{email_confirmed}', 'true')
WHERE email = 'gilcleberlocutor@gmail.com';

-- Garante que o usuário está ativo
UPDATE auth.users
SET raw_app_meta_data = jsonb_set(COALESCE(raw_app_meta_data, '{}'::jsonb), '{provider}', '"email"')
WHERE email = 'gilcleberlocutor@gmail.com';
