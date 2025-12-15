/*
  # Add Toy Play Tracking

  1. Changes
    - Add `last_toy_played` column to track when pet last played with toy
    - Add `toy_play_count` column to track daily toy play usage (max 5 per day)
  
  2. Purpose
    - Enable daily limit of 5 toy plays per pet
    - Track toy play activity separately from regular play action
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pets' AND column_name = 'last_toy_played'
  ) THEN
    ALTER TABLE pets ADD COLUMN last_toy_played timestamptz DEFAULT now();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pets' AND column_name = 'toy_play_count'
  ) THEN
    ALTER TABLE pets ADD COLUMN toy_play_count integer DEFAULT 0;
  END IF;
END $$;