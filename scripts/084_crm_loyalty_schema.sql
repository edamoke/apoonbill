-- CRM & Loyalty Point System Migration

-- 1. Add loyalty fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS loyalty_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS lifetime_spend DECIMAL(12, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_orders INTEGER DEFAULT 0;

-- 2. Loyalty Transactions Table (Earned/Spent history)
CREATE TABLE IF NOT EXISTS public.loyalty_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    points_change INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('earn', 'redeem', 'adjustment')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Loyalty Rewards Table (Catalog of free gifts)
CREATE TABLE IF NOT EXISTS public.loyalty_rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE,
    points_cost INTEGER NOT NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. RLS Policies
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own loyalty transactions"
    ON public.loyalty_transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all loyalty data"
    ON public.loyalty_transactions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')
        )
    );

CREATE POLICY "Anyone can view available rewards"
    ON public.loyalty_rewards FOR SELECT
    TO authenticated
    USING (is_available = true);

CREATE POLICY "Admins can manage rewards"
    ON public.loyalty_rewards FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')
        )
    );

-- 5. Auto Points View for CRM Deep Analysis
CREATE OR REPLACE VIEW public.customer_crm_analytics AS
SELECT 
    p.id as user_id,
    p.full_name,
    p.email,
    p.loyalty_points,
    p.lifetime_spend,
    p.total_orders,
    p.created_at as member_since,
    (SELECT MAX(created_at) FROM public.orders WHERE user_id = p.id) as last_visit,
    COALESCE((SELECT SUM(points_change) FROM public.loyalty_transactions WHERE user_id = p.id AND type = 'earn'), 0) as total_points_earned,
    COALESCE((SELECT SUM(ABS(points_change)) FROM public.loyalty_transactions WHERE user_id = p.id AND type = 'redeem'), 0) as total_points_redeemed
FROM public.profiles p;
