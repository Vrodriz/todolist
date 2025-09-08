-- Initialize database with basic setup
-- This script runs automatically when PostgreSQL container starts

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Set timezone
SET timezone = 'America/Sao_Paulo';

-- Database is already created by docker-compose environment variables