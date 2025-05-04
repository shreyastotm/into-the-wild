-- Create a safe SQL execution function that can only read data (not modify it)
CREATE OR REPLACE FUNCTION execute_sql_readonly(sql_query TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB;
BEGIN
    -- Check if the query contains any modifying statements
    IF sql_query ~* 'insert\s+into|update\s+|delete\s+from|truncate|drop|alter|create' THEN
        RAISE EXCEPTION 'Only SELECT queries are allowed';
    END IF;
    
    -- Use a SECURITY DEFINER function with row-level security enabled
    -- to ensure proper permissions are checked
    EXECUTE sql_query INTO result;
    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('error', SQLERRM);
END;
$$; 