-- Aggiungi colonna per tracciare l'ultimo template inviato
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS last_template_id BIGINT REFERENCES public.email_templates(id) ON DELETE SET NULL;

-- Aggiungi colonna per tracciare il nome del template (per performance)
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS last_template_name TEXT;

-- Aggiungi indice per performance
CREATE INDEX IF NOT EXISTS idx_leads_email_sent_date ON public.leads(email_sent_date);
CREATE INDEX IF NOT EXISTS idx_leads_last_template_id ON public.leads(last_template_id);
