/*
  # Add Dragon Pet Type
  
  1. Changes
    - Temporarily add 'dragon' to the pet type constraint for testing purposes
    
  2. Notes
    - This is a temporary change for testing
*/

ALTER TABLE pets DROP CONSTRAINT IF EXISTS pets_type_check;

ALTER TABLE pets ADD CONSTRAINT pets_type_check 
  CHECK (type IN ('cat', 'dog', 'fox', 'bird', 'rabbit', 'bear', 'panda', 'koala', 'hamster', 'mouse', 'pig', 'frog', 'monkey', 'lion', 'tiger', 'cow', 'dragon'));
