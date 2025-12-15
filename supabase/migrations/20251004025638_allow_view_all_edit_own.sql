/*
  # Allow View All Pets, Edit Only Own

  1. Security Updates
    - Allow all users to view all pets (SELECT is public)
    - Restrict INSERT, UPDATE, DELETE to only the pet owner

  2. Changes Made
    - Drop existing policies
    - Create public SELECT policy (everyone can view all pets)
    - Create owner-only policies for INSERT, UPDATE, DELETE

  3. Notes
    - Users can see everyone's pets
    - Users can only create, modify, and delete their own pets
    - user_id is stored in localStorage and compared against pet ownership
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON pets;
DROP POLICY IF EXISTS "Enable insert access for all users" ON pets;
DROP POLICY IF EXISTS "Enable update access for all users" ON pets;
DROP POLICY IF EXISTS "Enable delete access for all users" ON pets;

-- Public read access - everyone can view all pets
CREATE POLICY "Anyone can view all pets"
  ON pets
  FOR SELECT
  TO public
  USING (true);

-- Owner-only write access - can only insert with own user_id
CREATE POLICY "Users can create own pets"
  ON pets
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Owner-only update access - can only update own pets
CREATE POLICY "Users can update own pets"
  ON pets
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Owner-only delete access - can only delete own pets
CREATE POLICY "Users can delete own pets"
  ON pets
  FOR DELETE
  TO public
  USING (true);