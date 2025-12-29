-- Criar tabela de Administradores (necessária para o login funcionar)
CREATE TABLE public.admin_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id), # Relaciona com o usuário de Autenticação
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Segurança (RLS)
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso
-- Permite que qualquer um verifique se já existe admin (para saber se é o primeiro acesso)
CREATE POLICY "Leitura publica admins" ON public.admin_users
FOR SELECT USING (true);

-- Permite que o primeiro usuário se cadastre como admin
CREATE POLICY "Criacao de admin" ON public.admin_users
FOR INSERT WITH CHECK (true);
