/*
  # Restore Public Access to Pets

  1. Security Updates
    - Replace restrictive RLS policies with public access policies
    - Allow all users to view, create, update, and delete any pets

  2. Changes Made
    - Drop user_id-based policies
    - Restore public access policies for simplified demo experience

  3. Notes
    - This reverts to the original public access model
    - All users can see and interact with all pets
*/

-- Drop restrictive policies
DROP POLICY IF EXISTS "Users can view own pets" ON pets;
DROP POLICY IF EXISTS "Users can create pets with own user_id" ON pets;
DROP POLICY IF EXISTS "Users can update own pets" ON pets;
DROP POLICY IF EXISTS "Users can delete own pets" ON pets;

-- Restore public policies
CREATE POLICY "Enable read access for all users"
  ON pets
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Enable insert access for all users"
  ON pets
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Enable update access for all users"
  ON pets
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete access for all users"
  ON pets
  FOR DELETE
  TO public
  USING (true);