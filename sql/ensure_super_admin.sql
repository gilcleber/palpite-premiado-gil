-- GARANTIR ACESSO SUPER ADMIN (RESGATE)
-- Este script força o cadastro do seu email como SUPER ADMIN.

DO $$
DECLARE
  target_email TEXT := 'gilcleberlocutor@gmail.com';
  user_id UUID;
  default_tenant_id UUID;
BEGIN
  -- 1. Encontrar o ID do usuário pelo email (auth.users)
  SELECT id INTO user_id FROM auth.users WHERE email = target_email LIMIT 1;

  IF user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário % não encontrado no sistema de autenticação. Faça Sign Up primeiro.', target_email;
  END IF;

  -- 2. Garantir que exite pelo menos uma "Rádio Padrão" (Tenant)
  INSERT INTO public.tenants (name, slug, owner_email, status, valid_until)
  VALUES ('Rádio Principal', 'radio-principal', target_email, 'active', NOW() + INTERVAL '10 years')
  ON CONFLICT (slug) DO UPDATE 
  SET owner_email = EXCLUDED.owner_email 
  RETURNING id INTO default_tenant_id;

  -- 3. Inserir ou Atualizar perfil de Admin
  INSERT INTO public.admin_profiles (id, role, tenant_id)
  VALUES (user_id, 'super_admin', default_tenant_id)
  ON CONFLICT (id) DO UPDATE
  SET 
    role = 'super_admin',
    tenant_id = default_tenant_id;

  RAISE NOTICE 'Usuário % promovido a SUPER ADMIN com sucesso!', target_email;
END $$;
