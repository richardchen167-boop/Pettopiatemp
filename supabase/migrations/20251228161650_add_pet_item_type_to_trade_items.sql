/*
  # Add Pet Item Type to Trade Items

  1. Changes
    - Update trade_items item_type CHECK constraint to include 'pet'
    - Allows pets to be traded alongside accessories and house items

  2. Security
    - Existing RLS policies remain effective
    - Pet trades validated through trade_items policies
*/

DO $$
BEGIN
  -- Drop the existing CHECK constraint
  ALTER TABLE trade_items DROP CONSTRAINT IF EXISTS trade_items_item_type_check;
  
  -- Add the new CHECK constraint with 'pet' included
  ALTER TABLE trade_items ADD CONSTRAINT trade_items_item_type_check 
    CHECK (item_type IN ('hat', 'eyewear', 'toy', 'furniture', 'decor', 'pet'));
END $$;
