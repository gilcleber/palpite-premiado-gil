-- Adicionar colunas para Logos dos Times na tabela de configurações
ALTER TABLE public.app_settings 
ADD COLUMN team_a_logo_url TEXT,
ADD COLUMN team_b_logo_url TEXT;

-- Garantir que a coluna email exista na tabela de palpites (caso não tenha rodado antes)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'palpites' AND column_name = 'email') THEN 
        ALTER TABLE public.palpites ADD COLUMN email TEXT; 
    END IF; 
END $$;
