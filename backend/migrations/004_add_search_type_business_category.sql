-- Aggiungi campi per tipo di ricerca e categoria business
ALTER TABLE public.leads 
ADD COLUMN search_type TEXT,
ADD COLUMN business_category TEXT;

-- Aggiungi commenti per documentare i campi
COMMENT ON COLUMN public.leads.search_type IS 'Tipo di ricerca che ha originato il lead (es. registratori di cassa, POS, etc.)';
COMMENT ON COLUMN public.leads.business_category IS 'Categoria di business del lead (es. ristoranti, negozi, bar, etc.)';
