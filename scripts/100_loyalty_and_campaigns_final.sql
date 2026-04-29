-- CRM & LOYALTY SYSTEM MIGRATION
-- This script sets up the database schema for the improved loyalty program,
-- social media moderation, and marketing campaigns.

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENHANCE PROFILES FOR LOYALTY
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS loyalty_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS lifetime_spend DECIMAL(12, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_orders INTEGER DEFAULT 0;

-- 3. LOYALTY TRANSACTIONS (Audit trail for points)
CREATE TABLE IF NOT EXISTS public.loyalty_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    points_change INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('earn', 'redeem', 'bonus', 'adjustment')),
    description TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. SOCIAL POSTS (For bonus points moderation)
CREATE TABLE IF NOT EXISTS public.social_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    post_url TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    points_awarded INTEGER,
    reviewed_by UUID REFERENCES public.profiles(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. LOYALTY REWARDS (Catalog)
CREATE TABLE IF NOT EXISTS public.loyalty_rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE,
    points_cost INTEGER NOT NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. MARKETING CAMPAIGNS (Tracking)
CREATE TABLE IF NOT EXISTS public.marketing_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    channel TEXT NOT NULL, -- Email, Social, Push, SMS, Automated
    audience TEXT,
    status TEXT DEFAULT 'Running' CHECK (status IN ('Draft', 'Running', 'Completed', 'Active')),
    budget DECIMAL(12, 2),
    reach INTEGER DEFAULT 0,
    roi TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. ENABLE RLS
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;

-- 8. POLICIES
-- Profiles: Users see own, Admins see all
-- (Assuming profiles policies already exist, but ensuring loyalty fields are visible)

-- Loyalty Transactions
CREATE POLICY "Users can view their own loyalty transactions"
    ON public.loyalty_transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all loyalty transactions"
    ON public.loyalty_transactions FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')));

-- Social Posts
CREATE POLICY "Users can manage their own social posts"
    ON public.social_posts FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can moderate all social posts"
    ON public.social_posts FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')));

-- Rewards
CREATE POLICY "Anyone can view available rewards"
    ON public.loyalty_rewards FOR SELECT
    USING (is_available = true);

CREATE POLICY "Admins can manage rewards"
    ON public.loyalty_rewards FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')));

-- Campaigns
CREATE POLICY "Admins can manage campaigns"
    ON public.marketing_campaigns FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')));

-- 9. SEED INITIAL CAMPAIGNS
INSERT INTO public.marketing_campaigns (name, description, channel, audience, status, budget, reach, roi)
VALUES 
('Fry-Day Extravaganza: Loaded Fries 20% Off', 'Promotion for Masala, Peri Peri, and Garlic Fries.', 'Social', 'Fries Lovers', 'Running', 3000, 8500, '5.2x'),
('New Menu Launch: Sweet Potato Fries', 'Introduction of new healthy fries variety.', 'Push', 'All Members', 'Completed', 2000, 5000, '3.2x'),
('Lapsed Customer Win-back', 'Email campaign for customers inactive > 30 days.', 'Email', 'Inactive > 30d', 'Running', 5000, 1200, '4.5x');

-- 10. HELPER VIEW FOR ANALYTICS
CREATE OR REPLACE VIEW public.customer_crm_analytics AS
SELECT 
    p.id as user_id,
    p.full_name,
    p.email,
    p.loyalty_points,
    p.total_orders,
    p.created_at as member_since,
    (SELECT MAX(created_at) FROM public.orders WHERE user_id = p.id) as last_order_date,
    COALESCE((SELECT SUM(points_change) FROM public.loyalty_transactions WHERE user_id = p.id AND points_change > 0), 0) as lifetime_points_earned
FROM public.profiles p;
