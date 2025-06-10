CREATE POLICY "Allow new users to be created"
ON public.users
FOR INSERT
WITH CHECK (auth.uid() = user_id); 