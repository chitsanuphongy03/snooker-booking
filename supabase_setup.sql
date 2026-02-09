-- =====================================================
-- SNOOKER BOOKING - COMPLETE DATABASE SETUP
-- =====================================================
-- Run this single file in the Supabase SQL Editor
-- It will create tables, RLS policies, and initial data
-- =====================================================

-- =====================================================
-- 1. CREATE TABLES
-- =====================================================

-- Tables (Snooker Tables)
CREATE TABLE IF NOT EXISTS tables (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('standard', 'vip')),
  status TEXT NOT NULL CHECK (status IN ('available', 'occupied', 'maintenance')) DEFAULT 'available',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Bookings
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_id UUID REFERENCES tables(id) ON DELETE CASCADE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  date DATE NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')) DEFAULT 'pending',
  total_price NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Shop Settings
CREATE TABLE IF NOT EXISTS shop_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_name TEXT NOT NULL DEFAULT 'Snooker Club',
  phone TEXT NOT NULL DEFAULT '02-123-4567',
  address TEXT NOT NULL DEFAULT 'Bangkok',
  open_time TEXT NOT NULL DEFAULT '10:00',
  close_time TEXT NOT NULL DEFAULT '02:00',
  standard_price NUMERIC NOT NULL DEFAULT 100,
  vip_price NUMERIC NOT NULL DEFAULT 200,
  late_threshold_minutes INTEGER NOT NULL DEFAULT 10
);

-- Audit Logs (Optional)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'STATUS_CHANGE')),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  old_data JSONB,
  new_data JSONB,
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add new columns for Payment Feature
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS slip_url TEXT;
ALTER TABLE shop_settings ADD COLUMN IF NOT EXISTS payment_qr_url TEXT;

-- =====================================================
-- 1.1 CREATE STORAGE BUCKETS
-- =====================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('slips', 'slips', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('shop-assets', 'shop-assets', true) ON CONFLICT DO NOTHING;

-- Policy for 'slips'
create policy "Anyone can upload slips" on storage.objects for insert with check ( bucket_id = 'slips' );
create policy "Anyone can view slips" on storage.objects for select using ( bucket_id = 'slips' );

-- Policy for 'shop-assets'
create policy "Authenticated can upload assets" on storage.objects for insert to authenticated with check ( bucket_id = 'shop-assets' );
create policy "Anyone can view assets" on storage.objects for select using ( bucket_id = 'shop-assets' );

-- =====================================================
-- 2. ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 3. CREATE RLS POLICIES
-- =====================================================

-- Tables: Public read, Authenticated write (manage)
DROP POLICY IF EXISTS "Anyone can read tables" ON tables;
DROP POLICY IF EXISTS "Authenticated can manage tables" ON tables;
CREATE POLICY "Anyone can read tables" ON tables FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage tables" ON tables FOR ALL 
  USING (auth.role() = 'authenticated') 
  WITH CHECK (auth.role() = 'authenticated');

-- Bookings: Public create/read, Authenticated update/delete
DROP POLICY IF EXISTS "Anyone can create bookings" ON bookings;
DROP POLICY IF EXISTS "Anyone can read bookings" ON bookings;
DROP POLICY IF EXISTS "Authenticated can update bookings" ON bookings;
DROP POLICY IF EXISTS "Authenticated can delete bookings" ON bookings;
CREATE POLICY "Anyone can create bookings" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read bookings" ON bookings FOR SELECT USING (true);
CREATE POLICY "Authenticated can update bookings" ON bookings FOR UPDATE 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can delete bookings" ON bookings FOR DELETE 
  USING (auth.role() = 'authenticated');

-- Shop Settings: Public read, Authenticated update
DROP POLICY IF EXISTS "Anyone can read shop_settings" ON shop_settings;
DROP POLICY IF EXISTS "Authenticated can update shop_settings" ON shop_settings;
CREATE POLICY "Anyone can read shop_settings" ON shop_settings FOR SELECT USING (true);
CREATE POLICY "Authenticated can update shop_settings" ON shop_settings FOR UPDATE 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Audit Logs: Public insert, Authenticated read
DROP POLICY IF EXISTS "Anyone can insert audit_logs" ON audit_logs;
DROP POLICY IF EXISTS "Authenticated can read audit_logs" ON audit_logs;
CREATE POLICY "Anyone can insert audit_logs" ON audit_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can read audit_logs" ON audit_logs FOR SELECT 
  USING (auth.role() = 'authenticated');

-- =====================================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_table_id ON bookings(table_id);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_phone ON bookings(customer_phone);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- =====================================================
-- 5. INSERT SAMPLE DATA
-- =====================================================

-- Sample tables (if not exists)
INSERT INTO tables (name, type, status) 
SELECT * FROM (VALUES 
  ('Table 1', 'standard', 'available'),
  ('Table 2', 'standard', 'available'),
  ('Table 3', 'vip', 'available'),
  ('Table 4', 'standard', 'available'),
  ('Table 5', 'standard', 'available'),
  ('Table 6', 'vip', 'available')
) AS t(name, type, status)
WHERE NOT EXISTS (SELECT 1 FROM tables LIMIT 1);

-- Sample shop settings (if not exists)
INSERT INTO shop_settings (shop_name, phone, address)
SELECT 'Snooker Club', '02-123-4567', 'Bangkok'
WHERE NOT EXISTS (SELECT 1 FROM shop_settings LIMIT 1);

-- =====================================================
-- DONE! ✅
-- =====================================================
-- Ready to use:
-- - Customer: Can book, check status
-- - Admin: Can manage everything (after login)
-- =====================================================
