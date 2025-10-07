-- leads table
CREATE TABLE IF NOT EXISTS public.leads (
  id BIGSERIAL PRIMARY KEY,
  company_name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  city TEXT,
  region TEXT,
  country TEXT DEFAULT 'Italy',
  status TEXT NOT NULL DEFAULT 'not_contacted',
  email_sent_date TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS leads_unique_company_city ON public.leads (lower(company_name), lower(COALESCE(city,'')));

-- email_templates table
CREATE TABLE IF NOT EXISTS public.email_templates (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- interest_forms table
CREATE TABLE IF NOT EXISTS public.interest_forms (
  id BIGSERIAL PRIMARY KEY,
  lead_id BIGINT NULL REFERENCES public.leads(id) ON DELETE SET NULL,
  company_name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  city TEXT,
  message TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- campaigns table
CREATE TABLE IF NOT EXISTS public.campaigns (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  template_id BIGINT REFERENCES public.email_templates(id) ON DELETE SET NULL,
  total_sent INTEGER NOT NULL DEFAULT 0,
  total_interested INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- trigger updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_leads_updated_at ON public.leads;
CREATE TRIGGER trg_leads_updated_at BEFORE UPDATE ON public.leads
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

