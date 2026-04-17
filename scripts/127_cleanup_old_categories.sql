-- Migration: Cleanup old categories
-- Description: Deletes ALL categories that are NOT part of the new 13 categories from the PDF menu.

DELETE FROM categories 
WHERE slug NOT IN (
    'pizzeria',
    'main-dishes-carne',
    'side-dishes',
    'special-burger',
    'pastas',
    'bittings',
    'salads',
    'panini-sandwiches',
    'soups',
    'dolce-dessert',
    'starters',
    'breakfast-menu',
    'main-dishes-fish',
    'cocktails'
);
