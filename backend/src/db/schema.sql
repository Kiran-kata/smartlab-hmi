-- SmartLab HMI Controller Database Schema
-- PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Devices table
CREATE TABLE IF NOT EXISTS devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    firmware_version TEXT,
    last_seen TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Readings table - stores sensor data
CREATE TABLE IF NOT EXISTS readings (
    id BIGSERIAL PRIMARY KEY,
    device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
    temperature NUMERIC(5, 2),
    humidity NUMERIC(5, 2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Command logs table - stores all commands sent to devices
CREATE TABLE IF NOT EXISTS command_logs (
    id BIGSERIAL PRIMARY KEY,
    device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
    command_type TEXT NOT NULL,
    payload JSONB,
    status TEXT DEFAULT 'sent',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Device events table - stores events from physical devices
CREATE TABLE IF NOT EXISTS device_events (
    id BIGSERIAL PRIMARY KEY,
    device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_readings_device_id ON readings(device_id);
CREATE INDEX IF NOT EXISTS idx_readings_created_at ON readings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_readings_device_time ON readings(device_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_command_logs_device_id ON command_logs(device_id);
CREATE INDEX IF NOT EXISTS idx_command_logs_created_at ON command_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_device_events_device_id ON device_events(device_id);
CREATE INDEX IF NOT EXISTS idx_device_events_created_at ON device_events(created_at DESC);

-- Insert a sample device for testing
INSERT INTO devices (id, name, firmware_version, last_seen)
VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'SmartLab-001',
    '1.0.0',
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Comments
COMMENT ON TABLE devices IS 'SmartLab IoT devices registry';
COMMENT ON TABLE readings IS 'Sensor readings from devices (temperature, humidity)';
COMMENT ON TABLE command_logs IS 'Log of all commands sent to devices';
COMMENT ON TABLE device_events IS 'Events received from physical devices (button presses, mode changes)';
