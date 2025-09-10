-- Fix Database Triggers for Like Count Updates
-- Run this in your Supabase SQL Editor

-- First, manually fix the current like count discrepancy
UPDATE confessions 
SET like_count = (
    SELECT COUNT(*) 
    FROM confession_likes 
    WHERE confession_likes.confession_id = confessions.id
);

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_like_count_on_insert ON confession_likes;
DROP TRIGGER IF EXISTS update_like_count_on_delete ON confession_likes;

-- Drop the function if it exists
DROP FUNCTION IF EXISTS update_confession_like_count();

-- Recreate the function with better error handling
CREATE OR REPLACE FUNCTION update_confession_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE confessions 
        SET like_count = like_count + 1 
        WHERE id = NEW.confession_id;
        
        -- Check if the update was successful
        IF NOT FOUND THEN
            RAISE WARNING 'Failed to update like count for confession_id: %', NEW.confession_id;
        END IF;
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE confessions 
        SET like_count = GREATEST(like_count - 1, 0)
        WHERE id = OLD.confession_id;
        
        -- Check if the update was successful
        IF NOT FOUND THEN
            RAISE WARNING 'Failed to update like count for confession_id: %', OLD.confession_id;
        END IF;
        
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Recreate the triggers
CREATE TRIGGER update_like_count_on_insert
    AFTER INSERT ON confession_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_confession_like_count();

CREATE TRIGGER update_like_count_on_delete
    AFTER DELETE ON confession_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_confession_like_count();

-- Test the trigger by checking current state
SELECT 
    c.id as confession_id,
    c.like_count as stored_count,
    COALESCE(like_counts.actual_count, 0) as actual_count,
    CASE 
        WHEN c.like_count = COALESCE(like_counts.actual_count, 0) THEN 'OK'
        ELSE 'MISMATCH'
    END as status
FROM confessions c
LEFT JOIN (
    SELECT 
        confession_id, 
        COUNT(*) as actual_count 
    FROM confession_likes 
    GROUP BY confession_id
) like_counts ON c.id = like_counts.confession_id
ORDER BY c.id;
