-- ============================================
-- SKEMA DATABASE: SISTEM ANGGOTA (SPBU), IURAN & EVENT
-- Catatan: "anggota yang bayar iuran" = unit usaha (SPBU)
--          "yang login & terima WA"   = pemilik (owner)
--          satu pemilik bisa punya banyak unit usaha
-- ============================================

-- PEMILIK (orang yang login & terima notifikasi WA)
CREATE TABLE owners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) UNIQUE,                  -- E.164, dipakai login OTP. Nullable: sebagian data sumber tidak punya HP.
    role VARCHAR(20) NOT NULL DEFAULT 'owner', -- owner | admin | treasurer
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    data_issues TEXT[] NOT NULL DEFAULT '{}',  -- misal: {"missing_phone","name_from_business_fallback"}
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- UNIT USAHA / SPBU (ini yang jadi "anggota" penagihan iuran)
CREATE TABLE business_units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
    business_name VARCHAR(200) NOT NULL,       -- kolom "USAHA" di excel, misal "PT PURBAYA BAGELEN MANDIRI"
    business_type VARCHAR(50) NOT NULL,        -- kolom "BIDANG USAHA", misal "SPBU"
    unit_number VARCHAR(30),                   -- kolom "NOMOR", misal "54 601 01"
    address TEXT,
    city VARCHAR(100),
    contact_email VARCHAR(150),                -- email operasional unit ini (bisa beda2 walau pemilik sama)
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    data_issues TEXT[] NOT NULL DEFAULT '{}',  -- misal: {"missing_unit_number","missing_address"}
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_business_units_owner ON business_units(owner_id);

-- LOGIN OTP (kode sementara dikirim via WA ke pemilik)
CREATE TABLE otp_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(20) NOT NULL,
    code_hash VARCHAR(255) NOT NULL,
    purpose VARCHAR(30) NOT NULL DEFAULT 'login', -- login | change_phone | sensitive_action
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_otp_phone ON otp_codes(phone);

-- SESSION LOGIN AKTIF
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- PERIODE IURAN (misal: "Iuran Q1 2026")
CREATE TABLE membership_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    amount_due NUMERIC(12,2) NOT NULL,         -- nominal per unit usaha
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- PEMBAYARAN IURAN (per unit usaha, bukan per pemilik)
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_unit_id UUID NOT NULL REFERENCES business_units(id) ON DELETE CASCADE,
    period_id UUID NOT NULL REFERENCES membership_periods(id),
    amount NUMERIC(12,2) NOT NULL,
    method VARCHAR(20) NOT NULL,               -- manual_transfer | qris | virtual_account
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending | verified | rejected
    proof_url TEXT,
    gateway_ref VARCHAR(100),
    gateway_payload JSONB,
    verified_by UUID REFERENCES owners(id),
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_payments_unit ON payments(business_unit_id);
CREATE INDEX idx_payments_period ON payments(period_id);

-- EVENT
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(150) NOT NULL,
    description TEXT,
    event_date TIMESTAMPTZ NOT NULL,
    location VARCHAR(200),
    requires_paid_membership BOOLEAN NOT NULL DEFAULT true, -- gating: semua unit milik pemilik harus lunas
    is_public BOOLEAN NOT NULL DEFAULT false,
    created_by UUID REFERENCES owners(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- REGISTRASI EVENT (per pemilik/orang yang hadir, bukan per SPBU)
CREATE TABLE event_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
    qr_code VARCHAR(100) UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'registered', -- registered | checked_in | cancelled
    registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(event_id, owner_id)
);

-- ABSENSI EVENT (scan QR)
CREATE TABLE event_checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID NOT NULL REFERENCES event_registrations(id) ON DELETE CASCADE,
    checked_in_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    checked_in_by UUID REFERENCES owners(id)
);

-- FEEDBACK / RATING SETELAH EVENT
CREATE TABLE event_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID NOT NULL REFERENCES event_registrations(id) ON DELETE CASCADE,
    rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- LOG BLAST WHATSAPP (dikirim ke pemilik)
CREATE TABLE wa_blast_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id),
    message TEXT NOT NULL,
    target_filter VARCHAR(50),                  -- all | unpaid_unit | registered_event, dst
    sent_count INT NOT NULL DEFAULT 0,
    failed_count INT NOT NULL DEFAULT 0,
    created_by UUID REFERENCES owners(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AUDIT LOG
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES owners(id),
    action VARCHAR(50) NOT NULL,
    entity VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    old_value JSONB,
    new_value JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
