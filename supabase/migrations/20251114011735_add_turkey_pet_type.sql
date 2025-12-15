/*
  # Add Turkey Pet Type

  1. Changes
    - Add 'turkey' to the pet type constraint
    
  2. Notes
    - Turkey unlocks at level 35
*/

ALTER TABLE pets DROP CONSTRAINT IF EXISTS pets_type_check;

ALTER TABLE pets ADD CONSTRAINT pets_type_check 
  CHECK (type IN ('cat', 'dog', 'fox', 'bird', 'rabbit', 'bear', 'panda', 'koala', 'hamster', 'mouse', 'pig', 'frog', 'monkey', 'lion', 'tiger', 'cow', 'turkey', 'dragon'));
