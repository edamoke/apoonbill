-- Update profiles table to include loyalty fields
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS loyalty_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_orders INTEGER DEFAULT 0;

-- Create loyalty_transactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.loyalty_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    points_change INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('earn', 'redeem', 'bonus', 'adjustment')),
    description TEXT,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create social_posts table for moderation
CREATE TABLE IF NOT EXISTS public.social_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    post_url TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    points_awarded INTEGER DEFAULT 0,
    reviewed_by UUID REFERENCES public.profiles(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create site_settings table if it doesn't exist for loyalty rules
CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed default loyalty settings
INSERT INTO public.site_settings (key, value)
VALUES ('loyalty_config', '{"points_per_100_kes": 10, "social_bonus_points": 50, "min_spend_for_points": 500}')
ON CONFLICT (key) DO NOTHING;

-- Enable RLS
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own transactions" ON public.loyalty_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own social posts" ON public.social_posts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can submit their own social posts" ON public.social_posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all loyalty data" ON public.loyalty_transactions
    FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')));

CREATE POLICY "Admins can manage all social posts" ON public.social_posts
    FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')));
