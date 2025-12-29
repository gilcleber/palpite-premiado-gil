-- MANUAL ADMIN CREATION v7 (A SOLUÇÃO MÁGICA) 🪄
-- Rode este script para CRIAR o Admin e CONFIRMAR o email automaticamente.
-- Substitua 'seu@email.com' e 'sua_senha' abaixo.

BEGIN;

-- 1. Definir credenciais (EDITAR AQUI)
DO $$
DECLARE
    v_email TEXT := 'gilcleberlocutor@gmail.com'; -- <--- SEU EMAIL
    v_password TEXT := 'mudarsenha123'; -- <--- SUA SENHA
    v_user_id UUID;
BEGIN

    -- 2. Limpar usuário antigo se existir (Para evitar erro de duplicidade)
    DELETE FROM public.admin_profiles WHERE id IN (SELECT id FROM auth.users WHERE email = v_email);
    DELETE FROM public.admin_users WHERE id IN (SELECT id FROM auth.users WHERE email = v_email);
    DELETE FROM public.tenants WHERE owner_email = v_email;
    DELETE FROM auth.users WHERE email = v_email;

    -- 3. Criar Usuário no Supabase Auth (Já confirmado!)
    v_user_id := gen_random_uuid();
    
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at, -- <--- Confirmação Automática
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        recovery_token
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        v_user_id,
        'authenticated',
        'authenticated',
        v_email,
        crypt(v_password, gen_salt('bf')),
        NOW(), -- Email confirmed now
        '{"provider":"email","providers":["email"]}',
        '{}',
        NOW(),
        NOW(),
        '',
        ''
    );

    INSERT INTO auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        last_sign_in_at,
        created_at,
        updated_at
    ) VALUES (
        v_user_id,
        v_user_id,
        format('{"sub":"%s","email":"%s"}', v_user_id::text, v_email)::jsonb,
        'email',
        NOW(),
        NOW(),
        NOW()
    );

    -- 4. Criar Profile de Super Admin
    INSERT INTO public.admin_users (id, email)
    VALUES (v_user_id, v_email);

    INSERT INTO public.tenants (name, slug, owner_email, status)
    VALUES ('Palpite Premiado', 'palpite-premiado', v_email, 'active');

    -- Linkar profile ao tenant
    INSERT INTO public.admin_profiles (id, role, tenant_id)
    VALUES (v_user_id, 'super_admin', (SELECT id FROM public.tenants WHERE owner_email = v_email LIMIT 1));

    RAISE NOTICE '✅ USUÁRIO CRIADO E CONFIRMADO! Email: % | Senha: %', v_email, v_password;

END $$;

COMMIT;
