/*
  # Fix House Inventory RLS Policies
  
  Replace insecure RLS policies with proper user ownership checks to ensure furniture placement data is correctly isolated per user.
  
  1. Security
    - Remove overly permissive policies allowing public access
    - Add restrictive policies checking auth.uid() = user_id
    - Ensure users can only access their own furniture placement data
*/

DROP POLICY IF EXISTS "Users can view own inventory" ON house_inventory;
DROP POLICY IF EXISTS "Users can view own inventory (public)" ON house_inventory;
DROP POLICY IF EXISTS "Users can insert own inventory" ON house_inventory;
DROP POLICY IF EXISTS "Users can insert own inventory (public)" ON house_inventory;
DROP POLICY IF EXISTS "Users can update own inventory" ON house_inventory;
DROP POLICY IF EXISTS "Users can update own inventory (public)" ON house_inventory;
DROP POLICY IF EXISTS "Users can delete own inventory" ON house_inventory;
DROP POLICY IF EXISTS "Users can delete own inventory (public)" ON house_inventory;

CREATE POLICY "Users can view own house inventory"
  ON house_inventory FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own house inventory"
  ON house_inventory FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own house inventory"
  ON house_inventory FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own house inventory"
  ON house_inventory FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);