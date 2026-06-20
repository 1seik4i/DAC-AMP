-- DAC Studio Supabase Schema
-- Create this in your Supabase SQL Editor

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'Custom',
    image_url TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    
    -- EQ is an array of exactly 10 integers (or floats)
    eq INTEGER[] NOT NULL DEFAULT '{0,0,0,0,0,0,0,0,0,0}',
    
    -- Additional profile settings
    gain_stage TEXT DEFAULT 'Low', -- 'Low' or 'High'
    volume INTEGER DEFAULT 80,
    routing TEXT DEFAULT 'Balanced', -- 'Balanced' or 'Single-Ended'
    sample_rate INTEGER DEFAULT 384000,
    bit_depth INTEGER DEFAULT 24,
    device_compatibility TEXT[] DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Profile Versions Table
CREATE TABLE IF NOT EXISTS public.profile_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    snapshot JSONB NOT NULL, -- The entire profile state at that time
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Firmware Table
CREATE TABLE IF NOT EXISTS public.firmware (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version TEXT NOT NULL UNIQUE,
    release_date DATE NOT NULL,
    notes TEXT,
    storage_path TEXT NOT NULL, -- Path in Supabase Storage
    crc16 TEXT NOT NULL, -- Expected CRC16 of the binary
    is_stable BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Settings Table
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Diagnostics Table
CREATE TABLE IF NOT EXISTS public.diagnostics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id TEXT NOT NULL,
    usb_status TEXT,
    crc_errors INTEGER DEFAULT 0,
    packet_drops INTEGER DEFAULT 0,
    command_latency_ms NUMERIC,
    temperature NUMERIC,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 6. Logs Table
CREATE TABLE IF NOT EXISTS public.logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level TEXT DEFAULT 'info',
    device_id TEXT,
    command TEXT,
    sequence_id INTEGER,
    duration_ms NUMERIC,
    status TEXT,
    error_message TEXT,
    message TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 7. Devices Table (Registered Devices History)
CREATE TABLE IF NOT EXISTS public.devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    serial_number TEXT UNIQUE NOT NULL,
    model TEXT NOT NULL,
    last_firmware TEXT,
    last_connected TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 8. System Config
CREATE TABLE IF NOT EXISTS public.system_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Setup RLS (Disable for local proxy driver simplicity, or enable if using Auth)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_versions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.firmware DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostics DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_config DISABLE ROW LEVEL SECURITY;

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_modtime
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_settings_modtime
BEFORE UPDATE ON public.settings
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
