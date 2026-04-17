-- 1. Create Social Media Posts table for loyalty
CREATE TABLE IF NOT EXISTS public.social_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('instagram', 'facebook', 'twitter', 'tiktok')),
    post_url TEXT,
    image_url TEXT,
    caption TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    points_awarded INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Bucket for Profile Pictures & Social Posts
-- (Assuming standard supabase storage initialization is handled elsewhere, 
-- but ensuring bucket exists via helper if possible, or documented)
-- For now, ensuring RLS allows bucket access.

-- 3. Update Profiles for bucket interaction
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS last_social_post TIMESTAMP WITH TIME ZONE;

-- 4. Social Media Points Trigger
CREATE OR REPLACE FUNCTION public.handle_social_points() 
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
        -- Award 50 points per approved post
        UPDATE public.profiles 
        SET loyalty_points = loyalty_points + 50 
        WHERE id = NEW.user_id;
        
        -- Log transaction
        INSERT INTO public.loyalty_transactions (user_id, points_change, type, notes)
        VALUES (NEW.user_id, 50, 'earn', 'Social media post reward: ' || NEW.platform);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_social_post_approved
    AFTER UPDATE ON public.social_posts
    FOR EACH ROW
    WHEN (NEW.status = 'approved' AND OLD.status = 'pending')
    EXECUTE FUNCTION public.handle_social_points();

-- 5. RLS for Social Posts
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own social posts"
    ON public.social_posts FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view and moderate all social posts"
    ON public.social_posts FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')
        )
    );
