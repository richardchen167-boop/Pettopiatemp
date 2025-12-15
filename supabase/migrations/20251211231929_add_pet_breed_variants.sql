/*
  # Add Pet Breed Variants
  
  1. Changes
    - Add `breed` column to pets table to store breed variants
    - Breed is optional and stores alternate emoji representations for certain pet types
    
  2. Usage
    - Dogs can be: 🐶 (default) or 🐩 (poodle)
    - Cats can be: 🐱 (default) or 🐈‍⬛ (black cat)
    - Other pets don't use this field
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pets' AND column_name = 'breed'
  ) THEN
    ALTER TABLE pets ADD COLUMN breed text;
  END IF;
END $$;