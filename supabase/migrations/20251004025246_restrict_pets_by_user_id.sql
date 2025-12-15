/*
  # Restrict Pet Access by User ID

  1. Security Updates
    - Replace existing RLS policies on `pets` table
    - Restrict SELECT access to only the pet owner
    - Restrict INSERT to set correct user_id
    - Restrict UPDATE to only the pet owner
    - Restrict DELETE to only the pet owner

  2. Changes Made
    - Drop all existing public policies that allowed unrestricted access
    - Create new policies that check user_id matches
    - Ensure each user can only see and manage their own pets

  3. Notes
    - This prevents users from seeing or modifying other users' pets
    - Each browser session will have a unique user_id stored in localStorage
    - Users can only interact with pets they own
*/

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Enable read access for all users" ON pets;
DROP POLICY IF EXISTS "Enable insert access for all users" ON pets;
DROP POLICY IF EXISTS "Enable update access for all users" ON pets;
DROP POLICY IF EXISTS "Enable delete access for all users" ON pets;

-- Create restrictive policies based on user_id
CREATE POLICY "Users can view own pets"
  ON pets
  FOR SELECT
  TO public
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'user_id' 
    OR user_id = current_setting('app.user_id', true));

CREATE POLICY "Users can create pets with own user_id"
  ON pets
  FOR INSERT
  TO public
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'user_id' 
    OR user_id = current_setting('app.user_id', true));

CREATE POLICY "Users can update own pets"
  ON pets
  FOR UPDATE
  TO public
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'user_id' 
    OR user_id = current_setting('app.user_id', true))
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'user_id' 
    OR user_id = current_setting('app.user_id', true));

CREATE POLICY "Users can delete own pets"
  ON pets
  FOR DELETE
  TO public
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'user_id' 
    OR user_id = current_setting('app.user_id', true));