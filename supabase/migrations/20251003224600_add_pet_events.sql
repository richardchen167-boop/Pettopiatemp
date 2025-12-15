/*
  # Add Pet Events System

  1. Changes to `pets` table
    - Add `current_event` (text, nullable) - Current active event affecting the pet
    - Add `event_started_at` (timestamptz, nullable) - When the current event started
    - Add `thirst` (integer) - New stat for thirst level (0-100)

  2. Notes
    - Events include: sick, injured, depressed, extra_hungry, thirsty, anxious, tired
    - Events are temporary conditions that affect pets
    - Events can be resolved through specific care actions
    - Thirst is a new stat that needs to be maintained
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pets' AND column_name = 'current_event'
  ) THEN
    ALTER TABLE pets ADD COLUMN current_event text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pets' AND column_name = 'event_started_at'
  ) THEN
    ALTER TABLE pets ADD COLUMN event_started_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pets' AND column_name = 'thirst'
  ) THEN
    ALTER TABLE pets ADD COLUMN thirst integer DEFAULT 50 CHECK (thirst >= 0 AND thirst <= 100);
  END IF;
END $$;