-- FORÇAR MODO "PRIMEIRO ACESSO" (LIMPEZA TOTAL)
-- Isso vai apagar TODOS os administradores para que o sistema volte ao estado inicial ("Primeiro Acesso").
-- Assim, o botão de login vai virar "Criar Admin" automaticamente.

TRUNCATE TABLE public.admin_users CASCADE;
TRUNCATE TABLE public.admin_profiles CASCADE;
DELETE FROM auth.users; -- Apaga todos os logins para recomeçar do zero

-- Garantir que a tabela tenants tenha ao menos o padrão
INSERT INTO public.tenants (name, slug, owner_email, status, valid_until)
VALUES ('Rádio Principal', 'radio-principal', 'gilcleberlocutor@gmail.com', 'active', NOW() + INTERVAL '10 years')
ON CONFLICT (slug) DO NOTHING;
