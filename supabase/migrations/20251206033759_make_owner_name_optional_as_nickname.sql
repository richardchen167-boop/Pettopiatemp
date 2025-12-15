/*
  # Make owner_name optional and rename concept to nickname
  
  1. Changes
    - Change `owner_name` column in `pets` table to be nullable
    - This allows users to use their username from auth instead of a separate owner name
    - The owner_name field is now treated as an optional "nickname" for the pet's owner
  
  2. Notes
    - Existing pets will keep their current owner_name values
    - New pets can have NULL owner_name if the user doesn't provide a nickname
    - When NULL, the app will display the user's username instead
*/

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pets' AND column_name = 'owner_name' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE pets ALTER COLUMN owner_name DROP NOT NULL;
  END IF;
END $$;
