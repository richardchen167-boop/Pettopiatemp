/*
  # Remove crown mutation tracking

  1. Changes
    - Remove `last_mutation_check` column from pets table
  
  2. Notes
    - Reverting the crown mutation feature
*/

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pets' AND column_name = 'last_mutation_check'
  ) THEN
    ALTER TABLE pets DROP COLUMN last_mutation_check;
  END IF;
END $$;