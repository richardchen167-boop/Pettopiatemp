/*
  # Add Sleeping State for Pets

  1. Changes
    - Add `is_sleeping` column to track if pet is currently sleeping
    - Add `sleep_started_at` column to track when sleep began
    - Add `sleep_ends_at` column to track when sleep will end
    
  2. Purpose
    - Enables sleep mask toy functionality
    - Pets gain 3 energy per minute while sleeping
    - Pets cannot perform actions while sleeping
    
  3. Security
    - Maintains existing RLS policies
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pets' AND column_name = 'is_sleeping'
  ) THEN
    ALTER TABLE pets ADD COLUMN is_sleeping boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pets' AND column_name = 'sleep_started_at'
  ) THEN
    ALTER TABLE pets ADD COLUMN sleep_started_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pets' AND column_name = 'sleep_ends_at'
  ) THEN
    ALTER TABLE pets ADD COLUMN sleep_ends_at timestamptz;
  END IF;
END $$;
