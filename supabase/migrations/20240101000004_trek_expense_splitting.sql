DROP TABLE IF EXISTS public.trek_ad_hoc_expense_shares CASCADE;
DROP TABLE IF EXISTS public.trek_ad_hoc_expenses CASCADE;

-- Create trek_ad_hoc_expenses table
CREATE TABLE IF NOT EXISTS public.trek_ad_hoc_expenses (
    id SERIAL PRIMARY KEY,
    trek_id INTEGER NOT NULL REFERENCES public.trek_events(trek_id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    expense_type VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    description TEXT,
    expense_date TIMESTAMP WITH TIME ZONE NOT NULL,
    receipt_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trek_ad_hoc_expense_shares table
CREATE TABLE IF NOT EXISTS public.trek_ad_hoc_expense_shares (
    id SERIAL PRIMARY KEY,
    expense_id INTEGER NOT NULL REFERENCES public.trek_ad_hoc_expenses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    payment_method VARCHAR(50),
    payment_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_expense_share_status CHECK (status IN ('pending', 'paid', 'rejected'))
);

-- Create expense categories lookup table
CREATE TABLE IF NOT EXISTS public.trek_expense_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default expense categories
INSERT INTO public.trek_expense_categories (name, description, icon)
VALUES 
    ('Food', 'Meals, snacks, groceries, etc.', 'utensils'),
    ('Transport', 'Fuel, tolls, parking, etc.', 'car'),
    ('Accommodation', 'Hotel, camping, homestay charges', 'home'),
    ('Activities', 'Tickets, rentals, guides, etc.', 'map'),
    ('Equipment', 'Gear rentals, purchases, etc.', 'tool'),
    ('Misc', 'Other uncategorized expenses', 'package')
ON CONFLICT (name) DO NOTHING;

-- Create RLS policies
ALTER TABLE public.trek_ad_hoc_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trek_ad_hoc_expense_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trek_expense_categories ENABLE ROW LEVEL SECURITY;

-- RLS policies for trek_ad_hoc_expenses
CREATE POLICY "Users can view expenses for treks they're registered for"
ON public.trek_ad_hoc_expenses
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.trek_registrations
        WHERE trek_registrations.trek_id = trek_ad_hoc_expenses.trek_id
        AND trek_registrations.user_id = auth.uid()
    )
    OR creator_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.users
        WHERE users.user_id = auth.uid() AND users.user_type = 'admin'
    )
);

CREATE POLICY "Users can create expenses for treks they're registered for"
ON public.trek_ad_hoc_expenses
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.trek_registrations
        WHERE trek_registrations.trek_id = trek_ad_hoc_expenses.trek_id
        AND trek_registrations.user_id = auth.uid()
    )
);

CREATE POLICY "Users can update their own expenses"
ON public.trek_ad_hoc_expenses
FOR UPDATE
TO authenticated
USING (creator_id = auth.uid())
WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Users can delete their own expenses"
ON public.trek_ad_hoc_expenses
FOR DELETE
TO authenticated
USING (creator_id = auth.uid());

-- RLS policies for trek_ad_hoc_expense_shares
CREATE POLICY "Users can view expense shares for treks they're registered for"
ON public.trek_ad_hoc_expense_shares
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.trek_ad_hoc_expenses e
        JOIN public.trek_registrations r ON e.trek_id = r.trek_id
        WHERE e.id = trek_ad_hoc_expense_shares.expense_id
        AND r.user_id = auth.uid()
    )
    OR user_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.trek_ad_hoc_expenses e
        WHERE e.id = trek_ad_hoc_expense_shares.expense_id
        AND e.creator_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM public.users
        WHERE users.user_id = auth.uid() AND users.user_type = 'admin'
    )
);

CREATE POLICY "Expense creators can insert shares"
ON public.trek_ad_hoc_expense_shares
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.trek_ad_hoc_expenses e
        WHERE e.id = expense_id
        AND e.creator_id = auth.uid()
    )
);

CREATE POLICY "Users can update their own expense shares"
ON public.trek_ad_hoc_expense_shares
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- RLS policies for expense categories
CREATE POLICY "Expense categories are viewable by all authenticated users"
ON public.trek_expense_categories
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Expense categories can be managed by admins"
ON public.trek_expense_categories
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.user_id = auth.uid() AND users.user_type = 'admin'
    )
);

-- Create triggers for updated_at columns
CREATE TRIGGER set_updated_at_on_trek_ad_hoc_expenses
BEFORE UPDATE ON public.trek_ad_hoc_expenses
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER set_updated_at_on_trek_ad_hoc_expense_shares
BEFORE UPDATE ON public.trek_ad_hoc_expense_shares
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Create storage bucket for expense receipts
INSERT INTO storage.buckets (id, name, public)
VALUES ('expense_receipts', 'expense_receipts', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy to allow authenticated users to upload receipts
CREATE POLICY "Authenticated users can upload receipts"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'expense_receipts' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage policy to allow users to view their own receipts
CREATE POLICY "Users can view their own receipts"
ON storage.objects
FOR SELECT
TO authenticated
USING (
    bucket_id = 'expense_receipts' AND
    (
        (storage.foldername(name))[1] = auth.uid()::text
        OR bucket_id = 'expense_receipts' AND objects.owner = auth.uid()
    )
);

-- Create function to validate expense shares add up to expense amount
CREATE OR REPLACE FUNCTION validate_expense_shares()
RETURNS TRIGGER AS $$
DECLARE
    expense_total DECIMAL(10, 2);
    shares_total DECIMAL(10, 2);
BEGIN
    -- Get the expense amount
    SELECT amount INTO expense_total
    FROM public.trek_ad_hoc_expenses
    WHERE id = NEW.expense_id;
    
    -- Get the total of all shares for this expense
    SELECT COALESCE(SUM(amount), 0) INTO shares_total
    FROM public.trek_ad_hoc_expense_shares
    WHERE expense_id = NEW.expense_id;
    
    -- Add the new share amount
    shares_total := shares_total + NEW.amount;
    
    -- Validate that shares don't exceed the expense total
    IF shares_total > expense_total THEN
        RAISE EXCEPTION 'Total shares (%) cannot exceed expense amount (%)', shares_total, expense_total;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to validate expense shares
CREATE TRIGGER validate_expense_shares_trigger
BEFORE INSERT ON public.trek_ad_hoc_expense_shares
FOR EACH ROW EXECUTE FUNCTION validate_expense_shares(); 