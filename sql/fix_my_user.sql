-- KIT DE REPARO RÁPIDO (FIX MY USER) 🛠️
-- Este script conserta o usuário que "entra mas não vê nada" ou fica rodando.
-- Ele cria manualmente o Perfil e a Rádio que o sistema automático pode ter falhado em criar.

DO $$
DECLARE
  target_email TEXT := 'gilcleberlocutor@gmail.com';
  user_id UUID;
  default_tenant_id UUID;
BEGIN
  -- 1. Pegar o ID do usuário (se ele estiver logado)
  SELECT id INTO user_id FROM auth.users WHERE email = target_email;

  IF user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário % não encontrado! Tem certeza que criou a conta?', target_email;
  END IF;

  RAISE NOTICE 'Usuário encontrado: %', user_id;

  -- 2. Garantir que a Rádio Principal existe
  INSERT INTO public.tenants (name, slug, owner_email, status, valid_until)
  VALUES ('Rádio Principal', 'radio-principal', target_email, 'active', NOW() + INTERVAL '10 years')
  ON CONFLICT (slug) DO UPDATE SET owner_email = target_email
  RETURNING id INTO default_tenant_id;

  IF default_tenant_id IS NULL THEN
    SELECT id INTO default_tenant_id FROM public.tenants WHERE slug = 'radio-principal';
  END IF;

  RAISE NOTICE 'Tenant ID: %', default_tenant_id;

  -- 3. FORÇAR a criação do Perfil de Super Admin (A chave de tudo)
  INSERT INTO public.admin_profiles (id, role, tenant_id)
  VALUES (user_id, 'super_admin', default_tenant_id)
  ON CONFLICT (id) DO UPDATE 
  SET role = 'super_admin', 
      tenant_id = default_tenant_id;

  -- 4. Garantir tabela legada também (pra via das dúvidas)
  INSERT INTO public.admin_users (id, email)
  VALUES (user_id, target_email)
  ON CONFLICT (id) DO NOTHING;

  -- 5. Confirmar email (pra não ter msg chata)
  UPDATE auth.users
  SET email_confirmed_at = NOW()
  WHERE id = user_id AND email_confirmed_at IS NULL;

  RAISE NOTICE 'CONSERTADO! Agora o usuario eh Super Admin de verdade.';
END $$;
