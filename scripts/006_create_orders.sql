-- Create orders table with comprehensive tracking
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name VARCHAR(200),
  customer_phone VARCHAR(20),
  customer_email VARCHAR(255),
  delivery_address TEXT,
  order_type TEXT DEFAULT 'delivery' CHECK (order_type IN ('delivery', 'pickup')),
  special_instructions TEXT,
  subtotal DECIMAL(10, 2),
  delivery_fee DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'received', 'processing', 'complete', 'on_transit', 'delivered', 'cancelled')),
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_reference TEXT,
  shipping_address JSONB,
  estimated_time INTEGER,
  table_number TEXT,
  assigned_rider_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_chef_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  chef_started_at TIMESTAMP WITH TIME ZONE,
  chef_completed_at TIMESTAMP WITH TIME ZONE,
  rider_picked_at TIMESTAMP WITH TIME ZONE,
  rider_delivered_at TIMESTAMP WITH TIME ZONE,
  customer_confirmed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Users can view their own orders
CREATE POLICY "Users can view their own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create orders
CREATE POLICY "Authenticated users can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Chefs can view all orders
CREATE POLICY "Chefs can view all orders"
  ON public.orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND (role = 'chef' OR role = 'admin' OR is_admin = true)
    )
  );

-- Chefs can update orders
CREATE POLICY "Chefs can update orders"
  ON public.orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND (role = 'chef' OR role = 'admin' OR is_admin = true)
    )
  );

-- Riders can view assigned orders
CREATE POLICY "Riders can view assigned orders"
  ON public.orders FOR SELECT
  USING (
    auth.uid() = assigned_rider_id OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND (role = 'rider' OR role = 'admin' OR is_admin = true)
    )
  );

-- Riders can update assigned orders
CREATE POLICY "Riders can update assigned orders"
  ON public.orders FOR UPDATE
  USING (
    auth.uid() = assigned_rider_id OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND (role = 'admin' OR is_admin = true)
    )
  );

-- Admins have full access
CREATE POLICY "Admins can manage all orders"
  ON public.orders FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND (role = 'admin' OR is_admin = true)
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_assigned_rider ON public.orders(assigned_rider_id);
CREATE INDEX IF NOT EXISTS idx_orders_assigned_chef ON public.orders(assigned_chef_id);
