/*
  # Add Pet Activities System

  1. Changes to `pets` table
    - Add `last_salon` (timestamptz) - Last time pet visited salon
    - Add `last_playground` (timestamptz) - Last time pet visited playground
    - Add `last_school` (timestamptz) - Last time pet attended school
    - Add `last_bakery` (timestamptz) - Last time pet visited bakery
    - Add `last_dance` (timestamptz) - Last time pet attended dance class
    - Add `last_sports` (timestamptz) - Last time pet did sports

  2. Notes
    - Activities have cooldowns (typically 5-10 minutes)
    - Each activity provides unique stat boosts and rewards
    - Some activities cost coins, others are free
    - Activities give more XP than basic actions
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pets' AND column_name = 'last_salon'
  ) THEN
    ALTER TABLE pets ADD COLUMN last_salon timestamptz DEFAULT now() - interval '1 hour';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pets' AND column_name = 'last_playground'
  ) THEN
    ALTER TABLE pets ADD COLUMN last_playground timestamptz DEFAULT now() - interval '1 hour';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pets' AND column_name = 'last_school'
  ) THEN
    ALTER TABLE pets ADD COLUMN last_school timestamptz DEFAULT now() - interval '1 hour';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pets' AND column_name = 'last_bakery'
  ) THEN
    ALTER TABLE pets ADD COLUMN last_bakery timestamptz DEFAULT now() - interval '1 hour';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pets' AND column_name = 'last_dance'
  ) THEN
    ALTER TABLE pets ADD COLUMN last_dance timestamptz DEFAULT now() - interval '1 hour';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pets' AND column_name = 'last_sports'
  ) THEN
    ALTER TABLE pets ADD COLUMN last_sports timestamptz DEFAULT now() - interval '1 hour';
  END IF;
END $$;