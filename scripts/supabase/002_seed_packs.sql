-- Seed script to initialize the packs table with all 5 volumes
-- This script is idempotent and safe to run multiple times

INSERT INTO public.packs (id, title, price_single_inr, stock_left) VALUES 
  ('vol-1', 'Desi Bass Edits Vol. 1', 499, 996),
  ('vol-2', 'Desi Bass Edits Vol. 2', 499, 996),
  ('vol-3', 'Desi Bass Edits Vol. 3', 499, 996),
  ('vol-4', 'Desi Bass Edits Vol. 4', 499, 996),
  ('vol-5', 'Desi Bass Edits Vol. 5', 499, 996)
ON CONFLICT (id) DO NOTHING;
