-- Discount System Migration

-- 1. Product Discounts Table
CREATE TABLE IF NOT EXISTS public.product_discounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE,
    discount_percentage DECIMAL(5, 2) NOT NULL CHECK (discount_percentage > 0 AND discount_percentage <= 100),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(menu_item_id) -- Only one active discount per item at a time
);

-- 2. RLS Policies
ALTER TABLE public.product_discounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active discounts"
    ON public.product_discounts FOR SELECT
    USING (is_active = true AND end_time > NOW());

CREATE POLICY "Admins can manage all discounts"
    ON public.product_discounts FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')
        )
    );

-- 3. Automatic Expiry Logic (View for pricing)
-- This view returns the current discount for any menu item if it exists and is valid
CREATE OR REPLACE VIEW public.active_discounts AS
SELECT 
    *
FROM 
    public.product_discounts
WHERE 
    is_active = true 
    AND start_time <= NOW() 
    AND end_time > NOW();

-- 4. Helper function to check for expired discounts and deactivate them
CREATE OR REPLACE FUNCTION public.deactivate_expired_discounts()
RETURNS void AS $$
BEGIN
    UPDATE public.product_discounts
    SET is_active = false
    WHERE is_active = true AND end_time <= NOW();
END;
$$ LANGUAGE plpgsql;
