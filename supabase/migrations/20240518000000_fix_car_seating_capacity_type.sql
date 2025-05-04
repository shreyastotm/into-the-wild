-- Migration: Fix car_seating_capacity column type in users table
ALTER TABLE public.users 
ALTER COLUMN car_seating_capacity TYPE INTEGER USING car_seating_capacity::INTEGER;

-- Add a comment for clarity
COMMENT ON COLUMN public.users.car_seating_capacity IS 'How many passengers can the user''s car accommodate (excluding driver).'; 