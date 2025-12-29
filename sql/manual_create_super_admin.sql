-- 🆘 CRIAR SUPER ADMIN MANUALMENTE (Prompt 2)
-- Use este script se o cadastro pelo site estiver impossível.
-- Ele cria o usuário na autenticação (se não existir) e força as tabelas de admin.

-- 1. Variáveis (Edite a senha se quiser)
DO $$
DECLARE
  target_email TEXT := 'gilcleberlocutor@gmail.com';
  target_password TEXT := 'mudarsenha123'; -- Senha provisória
  user_id UUID;
  default_tenant_id UUID;
  encrypted_pw TEXT;
BEGIN
  -- 2. Tentar criar usuário no Auth (se não existir)
  -- Nota: Normalmente não conseguimos inserir em auth.users via SQL puro por segurança do Supabase.
  -- Mas podemos verificar se ele JÁ EXISTE para prosseguir.
  
  SELECT id INTO user_id FROM auth.users WHERE email = target_email;

  IF user_id IS NULL THEN
    RAISE EXCEPTION '❌ O usuário não existe no Auth! Você PRECISA criar a conta pelo site ("Criar Admin") ou no painel do Supabase (Authentication > Add User). Este script só conserta permissões, não cria logins do zero devido a criptografia.';
  END IF;

  RAISE NOTICE '✅ Usuário encontrado: %', user_id;

  -- 3. Confirmar Email
  UPDATE auth.users
  SET email_confirmed_at = NOW(), raw_user_meta_data = '{"email_confirmed": true}'
  WHERE id = user_id;

  -- 4. Criar Rádio Principal (Tenant)
  INSERT INTO public.tenants (name, slug, owner_email, status, valid_until)
  VALUES ('Rádio Principal', 'radio-principal', target_email, 'active', NOW() + INTERVAL '10 years')
  ON CONFLICT (slug) DO UPDATE SET owner_email = target_email
  RETURNING id INTO default_tenant_id;
  
  -- Fallback se não retornou (caso já exista)
  IF default_tenant_id IS NULL THEN
    SELECT id INTO default_tenant_id FROM public.tenants WHERE slug = 'radio-principal';
  END IF;

  -- 5. Criar Registro Público (admin_users)
  INSERT INTO public.admin_users (id, email)
  VALUES (user_id, target_email)
  ON CONFLICT (id) DO NOTHING;

  -- 6. Criar Perfil Super Admin (admin_profiles)
  INSERT INTO public.admin_profiles (id, role, tenant_id)
  VALUES (user_id, 'super_admin', default_tenant_id)
  ON CONFLICT (id) DO UPDATE 
  SET role = 'super_admin', tenant_id = default_tenant_id;

  RAISE NOTICE '🎉 SUCESSO! O usuário % agora é Super Admin na Rádio Principal.', target_email;
END $$;
