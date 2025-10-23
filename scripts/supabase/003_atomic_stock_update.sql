-- Create a PostgreSQL function for atomic stock updates
-- This function handles concurrent requests safely using PostgreSQL's ACID guarantees

CREATE OR REPLACE FUNCTION update_pack_stock(pack_id TEXT, stock_delta INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_stock INTEGER;
BEGIN
  -- Update stock with atomic operation, preventing negative values
  UPDATE public.packs 
  SET stock_left = GREATEST(0, stock_left + stock_delta)
  WHERE id = pack_id
  RETURNING stock_left INTO new_stock;
  
  -- Return the new stock value, or 0 if pack not found
  RETURN COALESCE(new_stock, 0);
END;
$$;
