-- Migration for IoT Integration (Bar, Kegs, Tots)

-- 1. IoT Devices Table
CREATE TABLE IF NOT EXISTS public.iot_devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    device_type VARCHAR(50) NOT NULL, -- 'keg_monitor', 'tot_scale', 'gas_sensor'
    local_ip VARCHAR(50), -- LAN IP of the ESP32
    mac_address VARCHAR(50) UNIQUE,
    status VARCHAR(20) DEFAULT 'offline', -- 'online', 'offline', 'error'
    last_seen_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}', -- stores calibration data, capacity, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. IoT Weight Logs (historical data for sync)
CREATE TABLE IF NOT EXISTS public.iot_weight_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID REFERENCES public.iot_devices(id) ON DELETE CASCADE,
    inventory_item_id UUID REFERENCES public.inventory_items(id) ON DELETE SET NULL,
    weight_grams DECIMAL(12, 3) NOT NULL,
    liters_remaining DECIMAL(12, 3),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Inventory Item Extensions (Link to IoT)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='inventory_items' AND column_name='iot_device_id') THEN
        ALTER TABLE public.inventory_items ADD COLUMN iot_device_id UUID REFERENCES public.iot_devices(id);
        ALTER TABLE public.inventory_items ADD COLUMN tare_weight_grams DECIMAL(12, 3) DEFAULT 0;
        ALTER TABLE public.inventory_items ADD COLUMN full_weight_grams DECIMAL(12, 3) DEFAULT 0;
    END IF;
END $$;

-- 4. Pour Incidents (detected deltas)
CREATE TABLE IF NOT EXISTS public.pour_incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inventory_item_id UUID REFERENCES public.inventory_items(id) ON DELETE CASCADE,
    weight_delta_grams DECIMAL(12, 3) NOT NULL,
    estimated_units DECIMAL(12, 3), -- e.g. 1.2 tots
    pos_order_id UUID REFERENCES public.orders(id), -- Null if theft/waste
    status VARCHAR(20) DEFAULT 'unverified', -- 'verified', 'theft', 'waste', 'over-pour'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. RLS Policies
ALTER TABLE public.iot_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iot_weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pour_incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and Accountants manage IoT"
    ON public.iot_devices FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND (is_admin = true OR role = 'admin' OR is_accountant = true OR role = 'accountant')
        )
    );

CREATE POLICY "Staff can view IoT data"
    ON public.iot_devices FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- Same for logs and incidents
CREATE POLICY "Admins and Accountants manage incidents"
    ON public.pour_incidents FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND (is_admin = true OR role = 'admin' OR is_accountant = true OR role = 'accountant')
        )
    );
