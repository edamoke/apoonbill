-- Seed products with the provided meal images and generate AI images for rest
-- This script adds sample products with real images mixed with AI-generated images
-- Includes free test meals for workflow testing

-- First, let's create a few test categories if they don't exist
INSERT INTO public.categories (name, slug, description, is_active) VALUES
  ('Main Courses', 'main-courses', 'Our signature main dishes', true),
  ('Sides', 'sides', 'Perfect side dishes', true),
  ('Breakfast', 'breakfast', 'Morning favorites', true),
  ('Test Category', 'test', 'Free test items', true)
ON CONFLICT (slug) DO NOTHING;

-- Get category IDs for insertion
WITH categories AS (
  SELECT id, slug FROM public.categories WHERE slug IN ('main-courses', 'sides', 'breakfast', 'test')
)

-- Insert products with real images (randomly distributed)
INSERT INTO public.products (
  name, slug, description, price, category_id, image_url, 
  preparation_time, ingredients, portion_size, is_vegetarian, 
  is_vegan, calories, spice_level, is_active
) 

-- Real meal images from the user
SELECT 'Grilled Potatoes with Bacon and Kale', 'grilled-potatoes-bacon-kale', 
  'Crispy golden potatoes with crispy bacon pieces and sautéed kale, a classic hearty meal', 
  250, (SELECT id FROM categories WHERE slug = 'main-courses'),
  '/images/pxl-20251209-120738148.jpg',
  15, ARRAY['Potatoes', 'Bacon', 'Kale', 'Garlic', 'Olive Oil'],
  'Regular', false, false, 380, 0, true
UNION ALL

SELECT 'Chocolate Crepes', 'chocolate-crepes',
  'Delightfully thin and soft crepes topped with chocolate chips, perfect for breakfast or dessert',
  180, (SELECT id FROM categories WHERE slug = 'breakfast'),
  '/images/pxl-20251209-114620748.jpg',
  10, ARRAY['Flour', 'Eggs', 'Milk', 'Chocolate', 'Butter'],
  'Regular', true, false, 250, 0, true
UNION ALL

SELECT 'Lentil and Greens Bowl', 'lentil-greens-bowl',
  'Nutritious cooked lentils with fresh sautéed greens, protein-packed and delicious',
  200, (SELECT id FROM categories WHERE slug = 'main-courses'),
  '/images/pxl-20251209-125043384.jpg',
  20, ARRAY['Lentils', 'Kale', 'Onions', 'Tomatoes', 'Spices'],
  'Regular', true, true, 280, 1, true
UNION ALL

SELECT 'Grilled Beef Steak', 'grilled-beef-steak',
  'Premium grilled beef steak cooked to perfection, tender and flavorful',
  450, (SELECT id FROM categories WHERE slug = 'main-courses'),
  '/images/pxl-20251209-115126549-20-28custom-29.jpg',
  25, ARRAY['Beef', 'Garlic', 'Rosemary', 'Salt', 'Pepper'],
  'Regular', false, false, 520, 0, true
UNION ALL

SELECT 'Mixed Grill Plate', 'mixed-grill-plate',
  'Combination platter with grilled meat, sautéed kale, and homemade sauce',
  380, (SELECT id FROM categories WHERE slug = 'main-courses'),
  '/images/pxl-20251209-123652576.jpg',
  20, ARRAY['Beef', 'Kale', 'Tomatoes', 'Spices', 'Garlic'],
  'Regular', false, false, 450, 1, true
UNION ALL

SELECT 'Gourmet Grill Platter', 'gourmet-grill-platter',
  'Premium grilled meats with vegetables and traditional sauce',
  420, (SELECT id FROM categories WHERE slug = 'main-courses'),
  '/images/pxl-20251209-123701932.jpg',
  22, ARRAY['Beef', 'Greens', 'Sauce', 'Spices'],
  'Regular', false, false, 480, 1, true
UNION ALL

SELECT 'Crispy Sweet Potato Fries', 'crispy-sweet-potato-fries',
  'Golden-fried sweet potato wedges with red onions and fresh garnish',
  150, (SELECT id FROM categories WHERE slug = 'sides'),
  '/images/pxl-20251209-115244688.jpg',
  12, ARRAY['Sweet Potatoes', 'Red Onions', 'Cilantro', 'Spices'],
  'Regular', true, true, 220, 0, true
UNION ALL

SELECT 'Legumes and Kale Medley', 'legumes-kale-medley',
  'Hearty combination of cooked legumes with fresh kale and rich sauce',
  190, (SELECT id FROM categories WHERE slug = 'main-courses'),
  '/images/pxl-20251209-125642606.jpg',
  18, ARRAY['Mixed Beans', 'Kale', 'Garlic', 'Tomatoes'],
  'Regular', true, true, 310, 1, true

-- Add AI-generated images for additional diversity
UNION ALL
SELECT 'Jollof Rice', 'jollof-rice',
  'Fragrant and colorful rice cooked with tomatoes and spices',
  180, (SELECT id FROM categories WHERE slug = 'main-courses'),
  '/placeholder.svg?height=400&width=400',
  16, ARRAY['Rice', 'Tomatoes', 'Peppers', 'Spices', 'Onions'],
  'Regular', true, true, 350, 1, true

UNION ALL
SELECT 'Grilled Chicken Breast', 'grilled-chicken-breast',
  'Tender grilled chicken breast with herbs and lemon marinade',
  280, (SELECT id FROM categories WHERE slug = 'main-courses'),
  '/placeholder.svg?height=400&width=400',
  18, ARRAY['Chicken', 'Lemon', 'Herbs', 'Garlic', 'Olive Oil'],
  'Regular', false, false, 380, 0, true

UNION ALL
SELECT 'Vegetable Stir Fry', 'vegetable-stir-fry',
  'Fresh seasonal vegetables stir-fried with soy sauce and ginger',
  160, (SELECT id FROM categories WHERE slug = 'sides'),
  '/placeholder.svg?height=400&width=400',
  12, ARRAY['Mixed Vegetables', 'Soy Sauce', 'Ginger', 'Garlic'],
  'Regular', true, true, 220, 0, true

UNION ALL
SELECT 'Fish in Tomato Sauce', 'fish-tomato-sauce',
  'Fresh fish fillet cooked in a rich tomato and herb sauce',
  320, (SELECT id FROM categories WHERE slug = 'main-courses'),
  '/placeholder.svg?height=400&width=400',
  20, ARRAY['Fish', 'Tomatoes', 'Basil', 'Garlic', 'Olive Oil'],
  'Regular', false, false, 420, 0, true

UNION ALL
SELECT 'Ugali with Greens', 'ugali-greens',
  'Traditional corn meal served with sautéed collard greens',
  120, (SELECT id FROM categories WHERE slug = 'main-courses'),
  '/placeholder.svg?height=400&width=400',
  15, ARRAY['Cornmeal', 'Greens', 'Butter', 'Salt'],
  'Regular', true, true, 240, 0, true

UNION ALL
SELECT 'Spiced Rice with Vegetables', 'spiced-rice-vegetables',
  'Aromatic rice with mixed vegetables and warm spices',
  140, (SELECT id FROM categories WHERE slug = 'main-courses'),
  '/placeholder.svg?height=400&width=400',
  14, ARRAY['Rice', 'Carrots', 'Peas', 'Spices', 'Onions'],
  'Regular', true, true, 300, 1, true

UNION ALL
SELECT 'Grilled Tilapia', 'grilled-tilapia',
  'Whole tilapia grilled with lemon and fresh herbs',
  350, (SELECT id FROM categories WHERE slug = 'main-courses'),
  '/placeholder.svg?height=400&width=400',
  22, ARRAY['Tilapia', 'Lemon', 'Herbs', 'Garlic', 'Olive Oil'],
  'Regular', false, false, 380, 0, true

-- FREE TEST MEALS (for workflow testing)
UNION ALL
SELECT 'Free Test Meal - Sampler', 'free-test-meal-sampler',
  '🎁 FREE TEST MEAL - Use this to test the complete order workflow with cart and tracking',
  0, (SELECT id FROM categories WHERE slug = 'test'),
  '/placeholder.svg?height=400&width=400',
  5, ARRAY['Test Item', 'For Workflow Testing'],
  'Test', true, true, 100, 0, true

UNION ALL
SELECT 'Free Appetizer - Testing', 'free-appetizer-testing',
  '🎁 FREE ITEM - Perfect for testing add to cart and checkout workflow',
  0, (SELECT id FROM categories WHERE slug = 'test'),
  '/placeholder.svg?height=400&width=400',
  3, ARRAY['Test Item', 'Quick Test'],
  'Small', true, true, 50, 0, true

UNION ALL
SELECT 'Free Beverage - Test', 'free-beverage-test',
  '🎁 FREE ITEM - Test item for payment flow and order tracking',
  0, (SELECT id FROM categories WHERE slug = 'test'),
  '/placeholder.svg?height=400&width=400',
  2, ARRAY['Test Drink'],
  'Small', true, true, 0, 0, true
ON CONFLICT (slug) DO NOTHING;
