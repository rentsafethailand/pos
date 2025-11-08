-- Car Rental Platform Database Schema
-- สร้างฐานข้อมูลสำหรับระบบจองรถเช่า

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================
-- 1. Users Table (ผู้ใช้งานทั้งหมด)
-- ===========================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('customer', 'partner', 'admin')),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- ===========================
-- 2. Customer Profiles
-- ===========================
CREATE TABLE customer_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date_of_birth DATE,
    id_card_number VARCHAR(20),
    address TEXT,
    preferred_language VARCHAR(2) DEFAULT 'th' CHECK (preferred_language IN ('th', 'en')),
    total_bookings INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_customer_profiles_user_id ON customer_profiles(user_id);

-- ===========================
-- 3. Partner Profiles
-- ===========================
CREATE TABLE partner_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(255) NOT NULL,
    business_license VARCHAR(100),
    tax_id VARCHAR(20),
    bank_account_name VARCHAR(255),
    bank_account_number VARCHAR(50),
    bank_name VARCHAR(100),
    rating_average DECIMAL(3, 2) DEFAULT 0.00,
    total_jobs INTEGER DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    approval_status VARCHAR(20) DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    approval_date TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES users(id),
    commission_rate DECIMAL(5, 2) DEFAULT 15.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_partner_profiles_user_id ON partner_profiles(user_id);
CREATE INDEX idx_partner_profiles_approval_status ON partner_profiles(approval_status);

-- ===========================
-- 4. Vehicles (รถ)
-- ===========================
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID REFERENCES partner_profiles(id) ON DELETE CASCADE,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL,
    license_plate VARCHAR(20) NOT NULL,
    vehicle_type VARCHAR(20) NOT NULL CHECK (vehicle_type IN ('sedan', 'suv', 'van', 'pickup', 'luxury')),
    seats INTEGER NOT NULL,
    transmission VARCHAR(10) CHECK (transmission IN ('auto', 'manual')),
    fuel_type VARCHAR(20) CHECK (fuel_type IN ('petrol', 'diesel', 'hybrid', 'electric')),
    color VARCHAR(50),
    daily_rate_self_drive DECIMAL(10, 2) NOT NULL,
    daily_rate_with_driver DECIMAL(10, 2) NOT NULL,
    description TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    images JSONB DEFAULT '[]'::jsonb,
    available BOOLEAN DEFAULT TRUE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_vehicles_partner_id ON vehicles(partner_id);
CREATE INDEX idx_vehicles_type ON vehicles(vehicle_type);
CREATE INDEX idx_vehicles_available ON vehicles(available);
CREATE INDEX idx_vehicles_status ON vehicles(status);

-- ===========================
-- 5. Bookings (การจอง)
-- ===========================
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_number VARCHAR(20) UNIQUE NOT NULL,
    customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    partner_id UUID REFERENCES partner_profiles(id),
    vehicle_id UUID REFERENCES vehicles(id),
    assigned_by UUID REFERENCES users(id),
    rental_type VARCHAR(20) NOT NULL CHECK (rental_type IN ('self_drive', 'with_driver')),
    pickup_date DATE NOT NULL,
    pickup_time TIME NOT NULL,
    return_date DATE NOT NULL,
    return_time TIME NOT NULL,
    pickup_location JSONB NOT NULL,
    return_location JSONB NOT NULL,
    itinerary TEXT,
    special_requests TEXT,
    vehicle_type_requested VARCHAR(20) NOT NULL,
    total_days INTEGER NOT NULL,
    base_price DECIMAL(10, 2) NOT NULL,
    addons_price DECIMAL(10, 2) DEFAULT 0.00,
    service_fee DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    deposit_amount DECIMAL(10, 2) NOT NULL,
    deposit_paid BOOLEAN DEFAULT FALSE,
    deposit_paid_at TIMESTAMP WITH TIME ZONE,
    full_payment_paid BOOLEAN DEFAULT FALSE,
    full_payment_paid_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'PENDING_ASSIGNMENT' CHECK (
        status IN (
            'PENDING_ASSIGNMENT',
            'PENDING_PARTNER_CONFIRMATION',
            'CONFIRMED',
            'IN_PROGRESS',
            'PICKED_UP',
            'RETURNED',
            'COMPLETED',
            'CANCELLED'
        )
    ),
    partner_response VARCHAR(20) CHECK (partner_response IN ('accepted', 'rejected', 'pending')),
    partner_response_at TIMESTAMP WITH TIME ZONE,
    partner_reject_reason TEXT,
    cancellation_reason TEXT,
    cancelled_by VARCHAR(20) CHECK (cancelled_by IN ('customer', 'admin', 'system')),
    cancelled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX idx_bookings_partner_id ON bookings(partner_id);
CREATE INDEX idx_bookings_vehicle_id ON bookings(vehicle_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_booking_number ON bookings(booking_number);
CREATE INDEX idx_bookings_pickup_date ON bookings(pickup_date);

-- ===========================
-- 6. Booking Add-ons (บริการเสริม)
-- ===========================
CREATE TABLE booking_addons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    addon_type VARCHAR(20) CHECK (addon_type IN ('gps', 'child_seat', 'insurance', 'extra_driver')),
    addon_name VARCHAR(100) NOT NULL,
    price_per_day DECIMAL(10, 2) NOT NULL,
    quantity INTEGER DEFAULT 1,
    total_days INTEGER NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_booking_addons_booking_id ON booking_addons(booking_id);

-- ===========================
-- 7. Payments (การชำระเงิน)
-- ===========================
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    payment_type VARCHAR(20) CHECK (payment_type IN ('deposit', 'full_payment', 'refund')),
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(20) CHECK (payment_method IN ('credit_card', 'qr_code', 'bank_transfer', 'cash')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'success', 'failed', 'refunded')),
    transaction_id VARCHAR(255),
    payment_proof_url TEXT,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(payment_status);

-- ===========================
-- 8. Partner Payouts (จ่ายเงิน Partner)
-- ===========================
CREATE TABLE partner_payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID REFERENCES partner_profiles(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id),
    amount DECIMAL(10, 2) NOT NULL,
    commission_amount DECIMAL(10, 2) NOT NULL,
    net_amount DECIMAL(10, 2) NOT NULL,
    payout_status VARCHAR(20) DEFAULT 'pending' CHECK (payout_status IN ('pending', 'processing', 'paid', 'failed')),
    paid_at TIMESTAMP WITH TIME ZONE,
    payment_slip_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_partner_payouts_partner_id ON partner_payouts(partner_id);
CREATE INDEX idx_partner_payouts_booking_id ON partner_payouts(booking_id);
CREATE INDEX idx_partner_payouts_status ON partner_payouts(payout_status);

-- ===========================
-- 9. Reviews (รีวิว)
-- ===========================
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES users(id),
    partner_id UUID REFERENCES partner_profiles(id),
    vehicle_id UUID REFERENCES vehicles(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    reply TEXT,
    replied_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_reviews_booking_id ON reviews(booking_id);
CREATE INDEX idx_reviews_partner_id ON reviews(partner_id);
CREATE INDEX idx_reviews_vehicle_id ON reviews(vehicle_id);

-- ===========================
-- 10. Attractions (สถานที่ท่องเที่ยว)
-- ===========================
CREATE TABLE attractions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location JSONB NOT NULL,
    category VARCHAR(50),
    images JSONB DEFAULT '[]'::jsonb,
    is_recommended BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_attractions_category ON attractions(category);
CREATE INDEX idx_attractions_recommended ON attractions(is_recommended);

-- ===========================
-- 11. Events (กิจกรรม)
-- ===========================
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    event_end_date DATE,
    location JSONB NOT NULL,
    images JSONB DEFAULT '[]'::jsonb,
    is_featured BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_featured ON events(is_featured);

-- ===========================
-- 12. Notifications (การแจ้งเตือน)
-- ===========================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) CHECK (type IN ('booking', 'payment', 'review', 'system', 'message')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link_url TEXT,
    read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- ===========================
-- 13. Messages (ข้อความ/แชท)
-- ===========================
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id),
    message_text TEXT NOT NULL,
    attachment_url TEXT,
    read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_messages_booking_id ON messages(booking_id);

-- ===========================
-- 14. System Settings (ตั้งค่าระบบ)
-- ===========================
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_system_settings_key ON system_settings(setting_key);

-- ===========================
-- 15. Promo Codes (โค้ดส่วนลด)
-- ===========================
CREATE TABLE promo_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type VARCHAR(20) CHECK (discount_type IN ('percentage', 'fixed_amount')),
    discount_value DECIMAL(10, 2) NOT NULL,
    minimum_booking_amount DECIMAL(10, 2) DEFAULT 0.00,
    max_discount_amount DECIMAL(10, 2),
    usage_limit INTEGER DEFAULT 0,
    used_count INTEGER DEFAULT 0,
    valid_from DATE NOT NULL,
    valid_until DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_promo_codes_code ON promo_codes(code);
CREATE INDEX idx_promo_codes_status ON promo_codes(status);

-- ===========================
-- Functions & Triggers
-- ===========================

-- อัพเดท updated_at อัตโนมัติ
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- สร้าง trigger สำหรับทุกตารางที่มี updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_profiles_updated_at BEFORE UPDATE ON customer_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partner_profiles_updated_at BEFORE UPDATE ON partner_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attractions_updated_at BEFORE UPDATE ON attractions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===========================
-- Insert Default System Settings
-- ===========================
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('site_name', '"Car Rental Platform"', 'ชื่อเว็บไซต์'),
('deposit_percentage', '30', 'เปอร์เซ็นต์เงินมัดจำ'),
('service_fee_percentage', '10', 'เปอร์เซ็นต์ค่าบริการระบบ'),
('default_commission_rate', '15', 'เปอร์เซ็นต์ค่าคอมมิชชั่น Partner'),
('cancellation_policy', '{"before_24h": 100, "before_48h": 50, "before_72h": 25, "more_than_72h": 0}', 'นโยบายการคืนเงิน (%)'),
('payment_methods', '["credit_card", "qr_code", "bank_transfer", "cash"]', 'วิธีชำระเงินที่เปิดใช้');

-- ===========================
-- Create Default Admin User
-- ===========================
-- สร้าง admin user (password: admin123)
-- ต้อง hash password ด้วย bcrypt ก่อนใช้งานจริง
INSERT INTO users (email, password_hash, role, first_name, last_name, phone, email_verified, status) VALUES
('admin@example.com', '$2b$10$abcdefghijklmnopqrstuvwxyz', 'admin', 'Admin', 'User', '0812345678', TRUE, 'active');

-- ===========================
-- Row Level Security (RLS)
-- ===========================
-- สามารถเพิ่ม RLS policies ตามความต้องการเพื่อความปลอดภัย

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Example RLS Policy: Users can only see their own data
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Additional policies can be added based on requirements

-- ===========================
-- COMPLETE!
-- ===========================
-- Database schema created successfully
-- Next steps:
-- 1. Create storage buckets in Supabase dashboard:
--    - vehicles (for vehicle images)
--    - avatars (for user avatars)
--    - documents (for licenses, etc.)
-- 2. Configure authentication in Supabase
-- 3. Update RLS policies as needed
