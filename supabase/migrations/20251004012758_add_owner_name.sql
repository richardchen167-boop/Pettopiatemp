/*
  # Add Owner Name to Pets

  1. Changes
    - Add `owner_name` column to `pets` table to track who owns each pet
    - Default value is 'Anonymous' for existing pets
    - Cannot be null to ensure every pet has an owner name

  2. Notes
    - This allows users to identify themselves as pet owners
    - Displayed in pet cards and the global pets sidebar
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pets' AND column_name = 'owner_name'
  ) THEN
    ALTER TABLE pets ADD COLUMN owner_name text NOT NULL DEFAULT 'Anonymous';
  END IF;
END $$;
