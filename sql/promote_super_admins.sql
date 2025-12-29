-- PROMOÇÃO DE SUPER ADMINS
-- Rode este script no Editor SQL do Supabase

DO $$
DECLARE
    main_tenant_id UUID;
    user_locutor UUID;
    user_producoes UUID;
BEGIN
    -- 1. Criar ou Pegar um 'Tenant' Padrão (Rádio Principal) para seus usuários
    -- Isso garante que você tenha um tenant vinculado, além de ser Super Admin
    INSERT INTO public.tenants (name, slug, owner_email, status, valid_until)
    VALUES ('Rádio Principal', 'radio-principal', 'gilcleberlocutor@gmail.com', 'active', NULL)
    ON CONFLICT (slug) DO UPDATE SET status = 'active'
    RETURNING id INTO main_tenant_id;

    -- 2. Buscar os IDs dos Usuários pelo Email
    SELECT id INTO user_locutor FROM auth.users WHERE email = 'gilcleberlocutor@gmail.com';
    SELECT id INTO user_producoes FROM auth.users WHERE email = 'gilcleberproducoes@gmail.com';

    -- 3. Promover gilcleberlocutor@gmail.com
    IF user_locutor IS NOT NULL THEN
        INSERT INTO public.admin_profiles (id, tenant_id, role)
        VALUES (user_locutor, main_tenant_id, 'super_admin')
        ON CONFLICT (id) DO UPDATE 
        SET role = 'super_admin', tenant_id = main_tenant_id;
    END IF;

    -- 4. Promover gilcleberproducoes@gmail.com
    IF user_producoes IS NOT NULL THEN
        INSERT INTO public.admin_profiles (id, tenant_id, role)
        VALUES (user_producoes, main_tenant_id, 'super_admin')
        ON CONFLICT (id) DO UPDATE 
        SET role = 'super_admin', tenant_id = main_tenant_id;
    END IF;

END $$;
