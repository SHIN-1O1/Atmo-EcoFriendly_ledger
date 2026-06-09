-- Enable necessary performance and optimization extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- Table: User Core Ledger
CREATE TABLE public.users (
    id UUID PRIMARY KEY,
    current_xp INTEGER DEFAULT 0 NOT NULL CHECK (current_xp >= 0),
    current_level INTEGER DEFAULT 1 NOT NULL CHECK (current_level >= 1),
    current_streak INTEGER DEFAULT 0 NOT NULL CHECK (current_streak >= 0),
    highest_streak INTEGER DEFAULT 0 NOT NULL CHECK (highest_streak >= 0),
    last_active_date DATE DEFAULT CURRENT_DATE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexing Strategy for User Gamification Lookup Performance
CREATE INDEX idx_users_streak_eval ON public.users(last_active_date, current_streak);

-- Table: Carbon Habit Master Dictionary
CREATE TABLE public.carbon_habits_dictionary (
    id VARCHAR(50) PRIMARY KEY,
    display_name TEXT NOT NULL,
    category VARCHAR(30) NOT NULL,
    co2_saved_kg NUMERIC(6,3) NOT NULL,
    xp_reward INTEGER NOT NULL
);

-- Table: Daily Activity Log (Partitioned by Month to ensure linear read-write scaling)
CREATE TABLE public.daily_habit_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    habit_id VARCHAR(50) NOT NULL REFERENCES public.carbon_habits_dictionary(id),
    logged_date DATE DEFAULT CURRENT_DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    PRIMARY KEY (id, logged_date)
) PARTITION BY RANGE (logged_date);

-- Create partitions for next few months for demo purposes
CREATE TABLE public.daily_habit_logs_2026_06 PARTITION OF public.daily_habit_logs FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
CREATE TABLE public.daily_habit_logs_2026_07 PARTITION OF public.daily_habit_logs FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');

-- Fast Lookups for Dashboard Views
CREATE INDEX idx_habit_logs_user_date ON public.daily_habit_logs(user_id, logged_date);

-- Atomic XP Mutation Trigger
CREATE OR REPLACE FUNCTION public.proc_calculate_gamification_impact()
RETURNS TRIGGER AS $$
DECLARE
    v_xp_gain INTEGER;
    v_current_xp INTEGER;
    v_new_xp INTEGER;
    v_level_boundary INTEGER;
    v_user_level INTEGER;
BEGIN
    -- Fetch rewards from dictionary securely
    SELECT xp_reward INTO v_xp_gain 
    FROM public.carbon_habits_dictionary 
    WHERE id = NEW.habit_id;

    -- Update User State Atomically while computing level progression boundaries
    -- Level Scale Curve Formula: Level * 100 XP
    UPDATE public.users
    SET 
        current_xp = current_xp + v_xp_gain,
        current_streak = CASE 
            WHEN last_active_date = CURRENT_DATE THEN current_streak
            WHEN last_active_date = CURRENT_DATE - INTERVAL '1 day' THEN current_streak + 1
            ELSE 1
        END,
        highest_streak = CASE 
            WHEN current_streak + 1 > highest_streak THEN current_streak + 1
            ELSE highest_streak
        END,
        last_active_date = CURRENT_DATE,
        updated_at = TIMEZONE('utc'::text, NOW())
    WHERE id = NEW.user_id
    RETURNING current_xp, current_level INTO v_new_xp, v_user_level;

    -- Evaluate Dynamic Level Ups
    v_level_boundary := v_user_level * 100;
    IF v_new_xp >= v_level_boundary THEN
        UPDATE public.users
        SET 
            current_level = current_level + 1,
            current_xp = v_new_xp - v_level_boundary
        WHERE id = NEW.user_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind the trigger directly to daily log entries
CREATE TRIGGER trg_after_habit_logged
AFTER INSERT ON public.daily_habit_logs
FOR EACH ROW EXECUTE FUNCTION public.proc_calculate_gamification_impact();

-- Insert master dictionary data
INSERT INTO public.carbon_habits_dictionary (id, display_name, category, co2_saved_kg, xp_reward) VALUES
('plant_meal', 'Ate Plant-Based', 'diet', 2.500, 30),
('active_transit', 'Bike / Public Transit', 'transit', 4.200, 50),
('cold_wash', 'Cold Water Wash', 'utility', 1.100, 20),
('unplug_vampire', 'Killed Phantom Loads', 'utility', 0.600, 15);

-- Create a mock user for testing without full auth setup
INSERT INTO public.users (id, current_xp, current_level, current_streak, highest_streak) 
VALUES ('00000000-0000-0000-0000-000000000000', 0, 1, 0, 0);
