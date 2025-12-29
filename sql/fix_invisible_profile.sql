-- CORREÇÃO DE PERFIL INVISÍVEL
-- O login funcionou, mas você "não existe" para o Banco de Dados, por isso a lista sumiu.
-- Vamos criar seu crachá oficial de Super Admin agora.

DO $$
DECLARE
  target_email TEXT := 'gilcleberlocutor@gmail.com';
  user_id UUID;
  new_tenant_id UUID;
BEGIN
  -- 1. Pegar seu ID de login
  SELECT id INTO user_id FROM auth.users WHERE email = target_email;

  IF user_id IS NOT NULL THEN
    -- 2. Garantir que a Rádio Principal existe
    INSERT INTO public.tenants (name, slug, owner_email, status, valid_until)
    VALUES ('Rádio Principal', 'radio-principal', target_email, 'active', NOW() + INTERVAL '10 years')
    ON CONFLICT (slug) DO UPDATE SET owner_email = EXCLUDED.owner_email
    RETURNING id INTO new_tenant_id;

    -- 3. Criar ou Atualizar seu Perfil de Super Admin
    -- Agora sim o Banco vai te reconhecer!
    INSERT INTO public.admin_profiles (id, role, tenant_id)
    VALUES (user_id, 'super_admin', new_tenant_id)
    ON CONFLICT (id) DO UPDATE
    SET role = 'super_admin', tenant_id = new_tenant_id;

    RAISE NOTICE 'Perfil de Super Admin criado com sucesso para %!', target_email;
  ELSE
    RAISE NOTICE 'Usuário % ainda não fez login/cadastro. Faça isso antes.', target_email;
  END IF;
END $$;
