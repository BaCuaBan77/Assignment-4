-- Create database schema for Sensor Monitoring System

-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Owner table
CREATE TABLE IF NOT EXISTS owner (
    id VARCHAR(255) PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email_address VARCHAR(255) NOT NULL UNIQUE,
    dob DATE NOT NULL
);

-- Create Location table
CREATE TABLE IF NOT EXISTS location (
    id VARCHAR(255) PRIMARY KEY,
    longitude NUMERIC(10, 7) NOT NULL,
    latitude NUMERIC(10, 7) NOT NULL,
    country VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL
);

-- Create Sensor table
CREATE TABLE IF NOT EXISTS sensor (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sensor_type VARCHAR(255) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    threshold NUMERIC(10, 2) NOT NULL,
    owner_id VARCHAR(255) NOT NULL,
    location_id VARCHAR(255) NOT NULL,
    FOREIGN KEY (owner_id) REFERENCES owner(id) ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES location(id) ON DELETE CASCADE
);

-- Create Observation table
CREATE TABLE IF NOT EXISTS observation (
    id VARCHAR(255) PRIMARY KEY,
    sensor_id VARCHAR(255) NOT NULL,
    value NUMERIC(10, 2) NOT NULL,
    timestamp BIGINT NOT NULL,
    FOREIGN KEY (sensor_id) REFERENCES sensor(id) ON DELETE CASCADE
);

-- Create Alarm table
CREATE TABLE IF NOT EXISTS alarm (
    id VARCHAR(255) PRIMARY KEY,
    sensor_id VARCHAR(255) NOT NULL,
    alarm_value NUMERIC(10, 2) NOT NULL,
    timestamp BIGINT NOT NULL,
    FOREIGN KEY (sensor_id) REFERENCES sensor(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sensor_owner_id ON sensor(owner_id);
CREATE INDEX IF NOT EXISTS idx_sensor_location_id ON sensor(location_id);
CREATE INDEX IF NOT EXISTS idx_observation_sensor_id ON observation(sensor_id);
CREATE INDEX IF NOT EXISTS idx_observation_timestamp ON observation(timestamp);
CREATE INDEX IF NOT EXISTS idx_alarm_sensor_id ON alarm(sensor_id);
CREATE INDEX IF NOT EXISTS idx_alarm_timestamp ON alarm(timestamp);
CREATE INDEX IF NOT EXISTS idx_owner_email ON owner(email_address);

-- Insert sample data

-- Insert Owners
INSERT INTO owner (id, first_name, last_name, email_address, dob) VALUES
('owner_1704067200000_abc123def', 'John', 'Smith', 'john.smith@example.com', '1985-03-15'),
('owner_1704067201000_xyz789ghi', 'Emma', 'Johnson', 'emma.johnson@example.com', '1990-07-22'),
('owner_1704067202000_mno456pqr', 'Michael', 'Brown', 'michael.brown@example.com', '1988-11-08'),
('owner_1704067203000_stu321vwx', 'Sarah', 'Davis', 'sarah.davis@example.com', '1992-05-30');

-- Insert Locations
INSERT INTO location (id, longitude, latitude, country, city) VALUES
('location_1704067200000_nyc123abc', -74.0060, 40.7128, 'USA', 'New York'),
('location_1704067201000_lon456def', -0.1276, 51.5074, 'UK', 'London'),
('location_1704067202000_par789ghi', 2.3522, 48.8566, 'France', 'Paris'),
('location_1704067203000_ber321jkl', 13.4050, 52.5200, 'Germany', 'Berlin');

-- Insert Sensors
INSERT INTO sensor (id, name, sensor_type, unit, threshold, owner_id, location_id) VALUES
('sensor_1704067204000_temp001ny', 'Temperature Sensor NY', 'temperature', 'Celsius', 30.00, 'owner_1704067200000_abc123def', 'location_1704067200000_nyc123abc'),
('sensor_1704067205000_hum002ny', 'Humidity Sensor NY', 'humidity', 'Percent', 80.00, 'owner_1704067200000_abc123def', 'location_1704067200000_nyc123abc'),
('sensor_1704067206000_temp003ld', 'Temperature Sensor London', 'temperature', 'Celsius', 25.00, 'owner_1704067201000_xyz789ghi', 'location_1704067201000_lon456def'),
('sensor_1704067207000_pre004pr', 'Pressure Sensor Paris', 'pressure', 'Pascal', 101325.00, 'owner_1704067202000_mno456pqr', 'location_1704067202000_par789ghi'),
('sensor_1704067208000_temp005be', 'Temperature Sensor Berlin', 'temperature', 'Celsius', 28.00, 'owner_1704067203000_stu321vwx', 'location_1704067203000_ber321jkl'),
('sensor_1704067209000_co2006ny', 'CO2 Sensor NY', 'co2', 'PPM', 1000.00, 'owner_1704067200000_abc123def', 'location_1704067200000_nyc123abc');

-- Insert Observations
INSERT INTO observation (id, sensor_id, value, timestamp) VALUES
('obs_1704067200000_obs001abc', 'sensor_1704067204000_temp001ny', 22.5, 1704067200000),
('obs_1704070800000_obs002def', 'sensor_1704067204000_temp001ny', 23.1, 1704070800000),
('obs_1704074400000_obs003ghi', 'sensor_1704067204000_temp001ny', 24.3, 1704074400000),
('obs_1704067200000_obs004jkl', 'sensor_1704067205000_hum002ny', 65.0, 1704067200000),
('obs_1704070800000_obs005mno', 'sensor_1704067205000_hum002ny', 68.5, 1704070800000),
('obs_1704067200000_obs006pqr', 'sensor_1704067206000_temp003ld', 18.2, 1704067200000),
('obs_1704070800000_obs007stu', 'sensor_1704067206000_temp003ld', 19.0, 1704070800000),
('obs_1704067200000_obs008vwx', 'sensor_1704067207000_pre004pr', 101300.00, 1704067200000),
('obs_1704070800000_obs009yza', 'sensor_1704067207000_pre004pr', 101315.00, 1704070800000),
('obs_1704067200000_obs010bcd', 'sensor_1704067208000_temp005be', 20.8, 1704067200000),
('obs_1704070800000_obs011efg', 'sensor_1704067208000_temp005be', 21.5, 1704070800000),
('obs_1704067200000_obs012hij', 'sensor_1704067209000_co2006ny', 450.00, 1704067200000),
('obs_1704070800000_obs013klm', 'sensor_1704067209000_co2006ny', 520.00, 1704070800000),
('obs_1704078000000_obs014nop', 'sensor_1704067204000_temp001ny', 31.5, 1704078000000),
('obs_1704078000000_obs015qrs', 'sensor_1704067205000_hum002ny', 85.0, 1704078000000);

-- Insert Alarms
INSERT INTO alarm (id, sensor_id, alarm_value, timestamp) VALUES
('alarm_1704078000000_alm001abc', 'sensor_1704067204000_temp001ny', 31.5, 1704078000000),
('alarm_1704078000000_alm002def', 'sensor_1704067205000_hum002ny', 85.0, 1704078000000),
('alarm_1704081600000_alm003ghi', 'sensor_1704067209000_co2006ny', 1200.00, 1704081600000);

