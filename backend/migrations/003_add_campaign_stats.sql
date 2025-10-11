-- Aggiungi colonne per le statistiche SendGrid alla tabella campaigns
ALTER TABLE public.campaigns 
ADD COLUMN IF NOT EXISTS open_rate DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS click_rate DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_clicks INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_updated TIMESTAMP NULL;

-- Aggiungi indice per performance
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON public.campaigns(created_at);
CREATE INDEX IF NOT EXISTS idx_campaigns_last_updated ON public.campaigns(last_updated);


