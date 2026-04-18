-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  bio text,
  role text,
  phone text,
  address text,
  city text,
  state text,
  postal_code text,
  country text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Insert profiles data
INSERT INTO public.profiles (id, full_name, avatar_url, bio, role, phone, address, city, state, postal_code, country, created_at, updated_at)
VALUES
  ('6d8c4d8f-1b2c-4e5f-8a9b-0c1d2e3f4a5b', 'Admin User', NULL, 'System Administrator', 'admin', '+1234567890', '123 Main St', 'New York', 'NY', '10001', 'USA', NOW(), NOW()),
  ('7e9d5e9f-2c3d-5f6a-9b0c-1d2e3f4a5b6c', 'John Doe', NULL, 'Customer Service Manager', 'manager', '+1234567891', '456 Oak Ave', 'Los Angeles', 'CA', '90001', 'USA', NOW(), NOW()),
  ('8f0e6f0f-3d4e-6a7b-0c1d-2e3f4a5b6c7d', 'Jane Smith', NULL, 'Operations Lead', 'staff', '+1234567892', '789 Pine Rd', 'Chicago', 'IL', '60601', 'USA', NOW(), NOW()),
  ('9f1f7f1f-4e5f-7b8c-1d2e-3f4a5b6c7d8e', 'Mike Johnson', NULL, 'Delivery Driver', 'rider', '+1234567893', '321 Elm St', 'Houston', 'TX', '77001', 'USA', NOW(), NOW()),
  ('0f2f8f2f-5f6a-8c9d-2e3f-4a5b6c7d8e9f', 'Sarah Williams', NULL, 'Head Chef', 'chef', '+1234567894', '654 Maple Dr', 'Phoenix', 'AZ', '85001', 'USA', NOW(), NOW()),
  ('1f3f9f3f-6a7b-9d0e-3f4a-5b6c7d8e9f0a', 'David Brown', NULL, 'Accountant', 'admin', '+1234567895', '987 Birch Ln', 'Philadelphia', 'PA', '19101', 'USA', NOW(), NOW()),
  ('2f4f0f4f-7b8c-0e1f-4a5b-6c7d8e9f0a1b', 'Emma Davis', NULL, 'Customer', 'customer', '+1234567896', '147 Cedar Way', 'San Antonio', 'TX', '78201', 'USA', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  avatar_url = EXCLUDED.avatar_url,
  bio = EXCLUDED.bio,
  role = EXCLUDED.role,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  city = EXCLUDED.city,
  state = EXCLUDED.state,
  postal_code = EXCLUDED.postal_code,
  country = EXCLUDED.country,
  updated_at = NOW();
