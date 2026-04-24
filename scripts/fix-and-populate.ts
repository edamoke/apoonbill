import postgres from "postgres"
import * as dotenv from "dotenv"

dotenv.config({ path: ".env" })

const sql = postgres(process.env.POSTGRES_URL_NON_POOLING!, {
  ssl: "require",
})

async function runMigration() {
  const migrationSql = `
    -- 1. Ensure Inventory Items exist with Grams as base unit
    -- We add a unique constraint on name if it doesn't exist
    DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'inventory_items_name_key') THEN
            ALTER TABLE public.inventory_items ADD CONSTRAINT inventory_items_name_key UNIQUE (name);
        END IF;
    END $$;

    INSERT INTO public.inventory_items (name, category, unit, current_stock, reorder_level, unit_cost)
    VALUES 
      ('Minced Beef', 'Meat', 'g', 10000, 2000, 0.8),
      ('Wheat Flour', 'Pantry', 'g', 5000, 1000, 0.1),
      ('Eggs', 'Dairy', 'pcs', 100, 24, 15)
    ON CONFLICT (name) DO NOTHING;

    -- 2. Ensure recipes table uses product_id and has a unique constraint
    DO $$
    BEGIN
        -- Rename column if needed
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recipes' AND column_name = 'menu_item_id') THEN
            ALTER TABLE public.recipes RENAME COLUMN menu_item_id TO product_id;
        END IF;
        
        -- Add unique constraint if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'recipes_product_id_inventory_item_id_key') THEN
            -- First remove duplicates if any
            DELETE FROM public.recipes a USING public.recipes b 
            WHERE a.id < b.id AND a.product_id = b.product_id AND a.inventory_item_id = b.inventory_item_id;
            
            ALTER TABLE public.recipes ADD CONSTRAINT recipes_product_id_inventory_item_id_key UNIQUE (product_id, inventory_item_id);
        END IF;
    END $$;

    -- 3. Map Products to Ingredients
    DO $$
    DECLARE
        v_beef_id UUID;
        v_flour_id UUID;
        v_egg_id UUID;
        v_prod RECORD;
    BEGIN
        SELECT id INTO v_beef_id FROM public.inventory_items WHERE name = 'Minced Beef';
        SELECT id INTO v_flour_id FROM public.inventory_items WHERE name = 'Wheat Flour';
        SELECT id INTO v_egg_id FROM public.inventory_items WHERE name = 'Eggs';

        -- Burger Recipes (150g beef per patty)
        FOR v_prod IN SELECT id FROM public.products WHERE name ILIKE '%Burger%' AND name NOT ILIKE '%Chicken%' LOOP
            INSERT INTO public.recipes (product_id, inventory_item_id, quantity_required)
            VALUES (v_prod.id, v_beef_id, 150)
            ON CONFLICT (product_id, inventory_item_id) DO UPDATE SET quantity_required = 150;
        END LOOP;

        -- Chicken Recipes (50g flour and 0.5 egg per piece)
        FOR v_prod IN SELECT id FROM public.products WHERE name ILIKE '%Chicken%' LOOP
            -- Flour mapping
            INSERT INTO public.recipes (product_id, inventory_item_id, quantity_required)
            VALUES (v_prod.id, v_flour_id, 50)
            ON CONFLICT (product_id, inventory_item_id) DO UPDATE SET quantity_required = 50;

            -- Egg mapping
            INSERT INTO public.recipes (product_id, inventory_item_id, quantity_required)
            VALUES (v_prod.id, v_egg_id, 0.5)
            ON CONFLICT (product_id, inventory_item_id) DO UPDATE SET quantity_required = 0.5;
        END LOOP;
    END $$;

    -- 4. Update the deduction trigger
    CREATE OR REPLACE FUNCTION public.deduct_inventory_on_order()
    RETURNS TRIGGER AS $$
    DECLARE
        item RECORD;
        recipe_row RECORD;
    BEGIN
        -- Only deduct when order is finalized
        IF (NEW.status = 'delivered' AND OLD.status != 'delivered') OR 
           (NEW.status = 'completed' AND OLD.status != 'completed') OR
           (NEW.status = 'served' AND OLD.status != 'served') THEN
           
            FOR item IN 
                SELECT product_id, quantity 
                FROM public.order_items 
                WHERE order_id = NEW.id
            LOOP
                -- Deduct based on recipes linked to the product
                FOR recipe_row IN
                    SELECT inventory_item_id, quantity_required
                    FROM public.recipes
                    WHERE product_id = item.product_id
                LOOP
                    -- 1. Deduct from inventory
                    UPDATE public.inventory_items
                    SET current_stock = current_stock - (recipe_row.quantity_required * item.quantity),
                        updated_at = NOW()
                    WHERE id = recipe_row.inventory_item_id;

                    -- 2. Log transaction
                    INSERT INTO public.inventory_transactions (
                        inventory_item_id,
                        type,
                        quantity,
                        reference_id,
                        notes
                    ) VALUES (
                        recipe_row.inventory_item_id,
                        'usage',
                        -(recipe_row.quantity_required * item.quantity),
                        NEW.id,
                        'Deduction for Order ' || NEW.id
                    );
                END LOOP;
            END LOOP;
        END IF;
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- Ensure the trigger is attached to the orders table
    DROP TRIGGER IF EXISTS trg_deduct_inventory ON public.orders;
    CREATE TRIGGER trg_deduct_inventory
    AFTER UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.deduct_inventory_on_order();
  `;

  try {
    console.log("Running migration...");
    await sql.unsafe(migrationSql);
    console.log("Migration successful!");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await sql.end();
  }
}

runMigration();
