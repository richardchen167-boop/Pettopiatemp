/*
  # Add Furniture and Decor to Shop

  1. Changes
    - Update shop_items type constraint to include 'furniture' and 'decor'
    - Add furniture and decor items for house customization
    
  2. New Item Types
    - furniture: Large items like sofas, beds, tables
    - decor: Decorative items like plants, paintings, rugs
    
  3. Security
    - Maintains existing RLS policies
*/

ALTER TABLE shop_items DROP CONSTRAINT IF EXISTS shop_items_type_check;

ALTER TABLE shop_items ADD CONSTRAINT shop_items_type_check 
  CHECK (type IN ('hat', 'eyewear', 'toy', 'furniture', 'decor'));

INSERT INTO shop_items (name, type, emoji, price) VALUES
  ('Red Sofa', 'furniture', '🛋️', 200),
  ('Wooden Table', 'furniture', '🪑', 150),
  ('King Bed', 'furniture', '🛏️', 300),
  ('Bookshelf', 'furniture', '📚', 180),
  ('Desk', 'furniture', '🪵', 120),
  ('Dining Table', 'furniture', '🍽️', 250),
  ('Armchair', 'furniture', '🪑', 100),
  ('TV Stand', 'furniture', '📺', 220),
  
  ('Potted Plant', 'decor', '🪴', 50),
  ('Cactus', 'decor', '🌵', 40),
  ('Floor Lamp', 'decor', '💡', 80),
  ('Wall Clock', 'decor', '🕐', 60),
  ('Picture Frame', 'decor', '🖼️', 90),
  ('Vase', 'decor', '🏺', 70),
  ('Rug', 'decor', '🧺', 110),
  ('Mirror', 'decor', '🪞', 130),
  ('Candles', 'decor', '🕯️', 45),
  ('Trophy', 'decor', '🏆', 150),
  ('Globe', 'decor', '🌍', 95),
  ('Aquarium', 'decor', '🐠', 200)
ON CONFLICT DO NOTHING;
