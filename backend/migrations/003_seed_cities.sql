-- cities table (support)
CREATE TABLE IF NOT EXISTS public.cities (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  population INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Seed (priorità Veneto, poi alcune del Nord/Centro/Sud, >50k)
INSERT INTO public.cities(name, region, population) VALUES
  ('Venezia', 'Veneto', 250000),
  ('Verona', 'Veneto', 257000),
  ('Padova', 'Veneto', 210000),
  ('Vicenza', 'Veneto', 110000),
  ('Treviso', 'Veneto', 85000),
  ('Rovigo', 'Veneto', 50000),
  ('Belluno', 'Veneto', 50000),
  -- Nord Italia
  ('Milano', 'Lombardia', 1350000),
  ('Bergamo', 'Lombardia', 120000),
  ('Brescia', 'Lombardia', 200000),
  ('Torino', 'Piemonte', 850000),
  ('Genova', 'Liguria', 560000),
  ('Bologna', 'Emilia-Romagna', 390000),
  -- Centro
  ('Firenze', 'Toscana', 360000),
  ('Prato', 'Toscana', 195000),
  ('Roma', 'Lazio', 2800000),
  -- Sud
  ('Napoli', 'Campania', 920000),
  ('Bari', 'Puglia', 320000),
  ('Palermo', 'Sicilia', 650000),
  ('Catania', 'Sicilia', 300000)
ON CONFLICT DO NOTHING;



