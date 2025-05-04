-- Trek Ratings table
CREATE TABLE IF NOT EXISTS public.trek_ratings (
    id SERIAL PRIMARY KEY,
    trek_id INTEGER NOT NULL REFERENCES public.trek_events(trek_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    difficulty_rating INTEGER NOT NULL CHECK (difficulty_rating BETWEEN 1 AND 5),
    enjoyment_rating INTEGER NOT NULL CHECK (enjoyment_rating BETWEEN 1 AND 5),
    scenic_rating INTEGER NOT NULL CHECK (scenic_rating BETWEEN 1 AND 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(trek_id, user_id)
);

-- Trek Participant Ratings table
CREATE TABLE IF NOT EXISTS public.trek_participant_ratings (
    id SERIAL PRIMARY KEY,
    trek_id INTEGER NOT NULL REFERENCES public.trek_events(trek_id) ON DELETE CASCADE,
    rated_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rated_by_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    teamwork_rating INTEGER NOT NULL CHECK (teamwork_rating BETWEEN 1 AND 5),
    punctuality_rating INTEGER NOT NULL CHECK (punctuality_rating BETWEEN 1 AND 5),
    contribution_rating INTEGER NOT NULL CHECK (contribution_rating BETWEEN 1 AND 5),
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(trek_id, rated_user_id, rated_by_user_id),
    CHECK (rated_user_id != rated_by_user_id) -- Cannot rate yourself
);

-- Badges Definitions table
CREATE TABLE IF NOT EXISTS public.badges (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    icon_url TEXT,
    category VARCHAR(50) NOT NULL,
    points INTEGER NOT NULL DEFAULT 0,
    requirements JSON, -- JSON structure defining how to earn this badge
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Badges table
CREATE TABLE IF NOT EXISTS public.user_badges (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_id INTEGER NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);

-- User Points History
CREATE TABLE IF NOT EXISTS public.user_points_history (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    points INTEGER NOT NULL,
    reason VARCHAR(100) NOT NULL,
    source_type VARCHAR(50) NOT NULL, -- 'badge', 'trek', 'rating', etc.
    source_id INTEGER, -- ID reference to the source (badge_id, trek_id, etc.)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add points column to users table if it doesn't exist
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;

-- Create triggers for updated_at columns
CREATE TRIGGER set_updated_at_on_trek_ratings
BEFORE UPDATE ON public.trek_ratings
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER set_updated_at_on_trek_participant_ratings
BEFORE UPDATE ON public.trek_participant_ratings
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- RLS policies
ALTER TABLE public.trek_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trek_participant_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_points_history ENABLE ROW LEVEL SECURITY;

-- Trek Ratings Policies
CREATE POLICY "Users can view ratings for treks they completed or are admin"
ON public.trek_ratings
FOR SELECT
TO authenticated
USING (
    -- User completed the trek (assuming payment status implies completion for now)
    EXISTS (
        SELECT 1 FROM public.trek_registrations
        WHERE trek_registrations.trek_id = trek_ratings.trek_id
        AND trek_registrations.user_id = auth.uid()
        -- AND trek_registrations.payment_status != 'Cancelled' -- Removed dependency
    )
    -- Or user is admin
    OR EXISTS (
        SELECT 1 FROM public.users
        WHERE user_id = auth.uid() AND user_type = 'admin'
    )
);

CREATE POLICY "Users can create their own trek ratings"
ON public.trek_ratings
FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
        SELECT 1 FROM public.trek_registrations
        WHERE trek_registrations.trek_id = trek_id
        AND trek_registrations.user_id = auth.uid()
        -- AND trek_registrations.payment_status != 'Cancelled' -- Removed dependency
    )
);

CREATE POLICY "Users can update their own trek ratings"
ON public.trek_ratings
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Trek Participant Ratings Policies
CREATE POLICY "Participant ratings are viewable by the rater, rated, or admins"
ON public.trek_participant_ratings
FOR SELECT
TO authenticated
USING (
    auth.uid() = rated_by_user_id
    OR auth.uid() = rated_user_id
    OR EXISTS (
        SELECT 1 FROM public.users
        WHERE user_id = auth.uid() AND user_type = 'admin'
    )
);

CREATE POLICY "Users can create their own participant ratings"
ON public.trek_participant_ratings
FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = rated_by_user_id AND
    auth.uid() != rated_user_id AND
    EXISTS (
        SELECT 1 FROM public.trek_registrations r1
        WHERE r1.trek_id = public.trek_participant_ratings.trek_id -- Explicit trek_id
          AND r1.user_id = auth.uid()
          -- AND r1.payment_status != 'Cancelled' -- Removed
          AND EXISTS ( SELECT 1 FROM public.trek_registrations r2
                       WHERE r2.trek_id = public.trek_participant_ratings.trek_id -- Explicit trek_id
                         AND r2.user_id = public.trek_participant_ratings.rated_user_id -- Explicit rated_user_id
                         -- AND r2.payment_status != 'Cancelled' -- Removed
                     )
    )
);

CREATE POLICY "Users can update their own participant ratings"
ON public.trek_participant_ratings
FOR UPDATE
TO authenticated
USING (auth.uid() = rated_by_user_id)
WITH CHECK (auth.uid() = rated_by_user_id);

-- Badges Policies
CREATE POLICY "Badges are viewable by all authenticated users"
ON public.badges
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only admins can manage badges"
ON public.badges
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE user_id = auth.uid() AND user_type = 'admin'
    )
);

-- User Badges Policies
CREATE POLICY "User badges are viewable by all authenticated users"
ON public.user_badges
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only admins can manage user badges"
ON public.user_badges
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE user_id = auth.uid() AND user_type = 'admin'
    )
);

-- User Points History Policies
CREATE POLICY "Users can view their own points history"
ON public.user_points_history
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all points history"
ON public.user_points_history
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE user_id = auth.uid() AND user_type = 'admin'
    )
);

CREATE POLICY "Only admins can manage points history"
ON public.user_points_history
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE user_id = auth.uid() AND user_type = 'admin'
    )
);

-- Insert default badges
INSERT INTO public.badges (name, description, category, points, requirements)
VALUES
    ('Trail Blazer', 'Participated in your first trek', 'Participation', 10, '{"treks_count": 1}'),
    ('Mountain Goat', 'Completed 5 treks', 'Participation', 50, '{"treks_count": 5}'),
    ('Adventure Seeker', 'Completed 10 treks', 'Participation', 100, '{"treks_count": 10}'),
    ('Team Player', 'Received high teamwork ratings from 3 different trekkers', 'Social', 30, '{"min_teamwork_rating": 4, "unique_raters": 3}'),
    ('Punctual Peaker', 'Perfect punctuality in 5 treks', 'Reliability', 25, '{"min_punctuality_rating": 5, "treks_count": 5}'),
    ('Driver', 'Drove for a trek group', 'Contribution', 20, '{"was_driver": true}'),
    ('Guide', 'Led a trek as the designated trek leader', 'Leadership', 50, '{"was_trek_lead": true}'),
    ('Splitwise Settler', 'Settled all expenses within 48 hours for 3 treks', 'Reliability', 15, '{"expenses_settled_quickly": true, "treks_count": 3}'),
    ('Photographer', 'Uploaded 20+ photos across treks', 'Contribution', 20, '{"photos_uploaded": 20}'),
    ('Experienced Hiker', 'Completed treks of all difficulty levels', 'Achievement', 75, '{"completed_all_difficulties": true}')
ON CONFLICT (name) DO NOTHING;

-- Create function to update user points
CREATE OR REPLACE FUNCTION update_user_points()
RETURNS TRIGGER AS $$
BEGIN
    -- Add points to user's total
    UPDATE public.users
    SET points = points + NEW.points
    WHERE user_id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update user points when points history changes
CREATE TRIGGER update_user_points_trigger
AFTER INSERT ON public.user_points_history
FOR EACH ROW EXECUTE FUNCTION update_user_points(); 