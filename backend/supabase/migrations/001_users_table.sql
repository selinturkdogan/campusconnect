-- ============================================================
-- CampusConnect — Week 1 Database Migration
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Users table (extends Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
    id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email       TEXT NOT NULL UNIQUE,
    name        TEXT NOT NULL,
    role        TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'student')),
    university  TEXT,
    department  TEXT,
    year        INTEGER CHECK (year BETWEEN 1 AND 6),
    avatar_url  TEXT,
    github_url  TEXT,
    linkedin_url TEXT,
    bio         TEXT,
    skills      TEXT[] DEFAULT '{}',
    courses     JSONB DEFAULT '[]',
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies

-- Anyone logged in can read any profile (public profiles)
CREATE POLICY "Users can view all profiles"
    ON public.users FOR SELECT
    USING (auth.role() = 'authenticated');

-- Users can only update their own profile
CREATE POLICY "Users can update own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

-- Only service role (admin backend) can insert new users
CREATE POLICY "Service role can insert users"
    ON public.users FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

-- Only service role can delete users
CREATE POLICY "Service role can delete users"
    ON public.users FOR DELETE
    USING (auth.role() = 'service_role');

-- 4. Insert the admin user
-- IMPORTANT: First create the admin user in Supabase Auth Dashboard
-- (Authentication → Users → Add User) with the admin email/password.
-- Then run this INSERT with the UUID you get from Supabase Auth.

-- INSERT INTO public.users (id, email, name, role)
-- VALUES ('PASTE-ADMIN-UUID-HERE', 'admin@university.edu', 'Administrator', 'admin');

-- ============================================================
-- HOW TO CREATE A STUDENT (run from backend service role)
-- ============================================================
-- Step 1: Create auth user via Supabase Admin API (done by backend)
-- Step 2: Insert into users table:
-- INSERT INTO public.users (id, email, name, role, university, department, year)
-- VALUES ('auth-uuid', 'student@university.edu', 'Ali Kaya', 'student', 'ITU', 'Software Engineering', 3);
