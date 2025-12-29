-- Adiciona colunas para salvar o placar oficial no banco de dados
ALTER TABLE public.app_settings 
ADD COLUMN IF NOT EXISTS score_team_a INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS score_team_b INTEGER DEFAULT 0;
