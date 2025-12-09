-- Migration: Add performance indexes for query optimization
-- Created: 2025-01-04
-- Description: Adds composite indexes to improve query performance for experiments and RLS policies

-- Composite index for experiment_photos to optimize queries filtering by experiment_id and ordering by order
CREATE INDEX IF NOT EXISTS idx_experiment_photos_experiment_id_order ON experiment_photos(experiment_id, "order");

-- Composite index for RLS policies that check both id and user_id
CREATE INDEX IF NOT EXISTS idx_recipes_id_user_id ON recipes(id, user_id);

