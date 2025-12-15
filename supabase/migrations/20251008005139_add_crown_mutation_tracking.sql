/*
  # Add crown mutation tracking

  1. Changes
    - Add `last_mutation_check` column to pets table to track when crown mutations were last checked
  
  2. Notes
    - Defaults to current timestamp
    - Used for the crown's magical mutation ability
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pets' AND column_name = 'last_mutation_check'
  ) THEN
    ALTER TABLE pets ADD COLUMN last_mutation_check timestamptz DEFAULT now();
  END IF;
END $$;