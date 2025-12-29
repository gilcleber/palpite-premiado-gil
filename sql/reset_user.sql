-- EXCLUIR USUÁRIO PARA RE-CADASTRO (CORREÇÃO DE DEPENDÊNCIAS)
-- Agora apagamos na ordem certa: Primeiro as tabelas filhas (perfis), depois o login.

DO $$
DECLARE
  target_email TEXT := 'gilcleberlocutor@gmail.com';
  target_user_id UUID;
BEGIN
  -- 1. Descobrir o ID do usuário
  SELECT id INTO target_user_id FROM auth.users WHERE email = target_email;

  IF target_user_id IS NOT NULL THEN
    -- 2. Apagar da tabela filha PRIMEIRO (admin_profiles)
    DELETE FROM public.admin_profiles WHERE id = target_user_id;

    -- 3. Apagar da tabela legada (admin_users)
    DELETE FROM public.admin_users WHERE email = target_email;

    -- 4. AGORA sim apagar o login (auth.users)
    DELETE FROM auth.users WHERE id = target_user_id;

    RAISE NOTICE 'Conta % apagada com sucesso! Pode cadastrar de novo.', target_email;
  ELSE
    RAISE NOTICE 'Usuário % não encontrado ou já apagado.', target_email;
  END IF;
END $$;
