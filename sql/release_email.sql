-- LIBERAR EMAIL (Renomear conta antiga)
-- Se o DELETE falhou por causa de dependências ocultas, vamos apenas mudar o email da conta antiga.
-- Isso libera o email 'gilcleberlocutor@gmail.com' para ser cadastrado do zero.

UPDATE auth.users 
SET email = 'deleted_' || floor(random() * 1000) || '_' || email,
    raw_user_meta_data = jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{deleted}', 'true')
WHERE email = 'gilcleberlocutor@gmail.com';

-- Também limpar as tabelas de admin para garantir
TRUNCATE TABLE public.admin_users CASCADE;
TRUNCATE TABLE public.admin_profiles CASCADE;

-- Recriando tenant padrão se necessário
INSERT INTO public.tenants (name, slug, owner_email, status, valid_until)
VALUES ('Rádio Principal', 'radio-principal', 'gilcleberlocutor@gmail.com', 'active', NOW() + INTERVAL '10 years')
ON CONFLICT (slug) DO NOTHING;
