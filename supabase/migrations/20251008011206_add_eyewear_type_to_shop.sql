/*
  # Add eyewear type to shop items

  1. Changes
    - Drop the existing type check constraint on shop_items
    - Add new constraint that includes 'eyewear' type
    - This allows the shop to have eyewear items instead of collars
  
  2. Security
    - No changes to RLS policies
*/

-- Drop the old constraint
ALTER TABLE shop_items DROP CONSTRAINT IF EXISTS shop_items_type_check;

-- Add new constraint with eyewear type
ALTER TABLE shop_items ADD CONSTRAINT shop_items_type_check 
  CHECK (type = ANY (ARRAY['hat'::text, 'eyewear'::text, 'toy'::text]));