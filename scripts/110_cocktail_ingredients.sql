-- Migration: Add Cocktail Ingredients to Inventory
-- Category: Bar

INSERT INTO public.inventory_items (name, sku, category, unit, unit_cost, current_stock, reorder_level)
VALUES 
    -- Spirits (tracked in ml)
    ('Vodka', 'BAR-VDK', 'Bar', 'ml', 2.00, 10000, 2000),
    ('Gin', 'BAR-GIN', 'Bar', 'ml', 2.50, 10000, 2000),
    ('Tequila Silver', 'BAR-TEQ-SIL', 'Bar', 'ml', 3.00, 5000, 1000),
    ('Tequila Gold', 'BAR-TEQ-GLD', 'Bar', 'ml', 3.50, 5000, 1000),
    ('White Rum', 'BAR-RUM-WHT', 'Bar', 'ml', 2.00, 10000, 2000),
    ('Dark Rum', 'BAR-RUM-DRK', 'Bar', 'ml', 2.20, 10000, 2000),
    ('Whisky Scotch', 'BAR-WHI-SCO', 'Bar', 'ml', 4.00, 5000, 1000),
    ('Whisky Bourbon', 'BAR-WHI-BOU', 'Bar', 'ml', 3.80, 5000, 1000),
    ('Triple Sec', 'BAR-TRI-SEC', 'Bar', 'ml', 2.50, 5000, 1000),
    ('Campari', 'BAR-CAM', 'Bar', 'ml', 3.50, 3000, 500),
    ('Sweet Vermouth', 'BAR-VER-SWT', 'Bar', 'ml', 2.50, 3000, 500),
    ('Dry Vermouth', 'BAR-VER-DRY', 'Bar', 'ml', 2.50, 3000, 500),

    -- Mixers & Juices (tracked in ml)
    ('Pineapple Juice', 'BAR-JUI-PIN', 'Bar', 'ml', 0.20, 20000, 5000),
    ('Orange Juice', 'BAR-JUI-ORA', 'Bar', 'ml', 0.20, 20000, 5000),
    ('Lime Juice', 'BAR-JUI-LIM', 'Bar', 'ml', 0.50, 5000, 1000),
    ('Lemon Juice', 'BAR-JUI-LEM', 'Bar', 'ml', 0.40, 5000, 1000),
    ('Cranberry Juice', 'BAR-JUI-CRA', 'Bar', 'ml', 0.60, 10000, 2000),
    ('Tomato Juice', 'BAR-JUI-TOM', 'Bar', 'ml', 0.40, 5000, 1000),
    ('Coconut Cream', 'BAR-MIX-COC', 'Bar', 'ml', 0.80, 5000, 1000),
    ('Grenadine Syrup', 'BAR-SYR-GRE', 'Bar', 'ml', 0.50, 2000, 500),
    ('Simple Syrup', 'BAR-SYR-SIM', 'Bar', 'ml', 0.10, 5000, 1000),
    ('Angostura Bitters', 'BAR-BIT-ANG', 'Bar', 'ml', 5.00, 500, 100),
    ('Soda Water', 'BAR-MIX-SOD', 'Bar', 'ml', 0.10, 20000, 5000),
    ('Tonic Water', 'BAR-MIX-TON', 'Bar', 'ml', 0.15, 20000, 5000),
    ('Ginger Ale', 'BAR-MIX-GIN', 'Bar', 'ml', 0.15, 10000, 2000),
    ('Cola', 'BAR-MIX-COL', 'Bar', 'ml', 0.10, 20000, 5000)
ON CONFLICT (sku) DO NOTHING;
