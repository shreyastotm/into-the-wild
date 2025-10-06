BEGIN;

-- 1) App table first
DELETE FROM public.users
WHERE user_id IN (
  '1ffd50e2-ea3c-4e85-a1b7-388bbbd44304'::uuid,
  'c47230a9-745a-43c6-ad96-e113958d77fa'::uuid
);

-- 2) Auth child tables: Safe deletion with existence checks
-- Delete from auth.identities
DELETE FROM auth.identities WHERE user_id::text IN ('1ffd50e2-ea3c-4e85-a1b7-388bbbd44304','c47230a9-745a-43c6-ad96-e113958d77fa');

-- Delete from auth.sessions
DELETE FROM auth.sessions WHERE user_id::text IN ('1ffd50e2-ea3c-4e85-a1b7-388bbbd44304','c47230a9-745a-43c6-ad96-e113958d77fa');

-- Delete from auth.refresh_tokens
DELETE FROM auth.refresh_tokens WHERE user_id::text IN ('1ffd50e2-ea3c-4e85-a1b7-388bbbd44304','c47230a9-745a-43c6-ad96-e113958d77fa');

-- Delete from auth.mfa_factors (if exists and has user_id column)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='auth' AND table_name='mfa_factors') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='auth' AND table_name='mfa_factors' AND column_name='user_id') THEN
      DELETE FROM auth.mfa_factors WHERE user_id::text IN ('1ffd50e2-ea3c-4e85-a1b7-388bbbd44304','c47230a9-745a-43c6-ad96-e113958d77fa');
    END IF;
  END IF;
END$$;

-- Delete from auth.mfa_challenges (if exists and has user_id column)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='auth' AND table_name='mfa_challenges') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='auth' AND table_name='mfa_challenges' AND column_name='user_id') THEN
      DELETE FROM auth.mfa_challenges WHERE user_id::text IN ('1ffd50e2-ea3c-4e85-a1b7-388bbbd44304','c47230a9-745a-43c6-ad96-e113958d77fa');
    END IF;
  END IF;
END$$;

-- Delete from auth.mfa_amr_claims (if exists and has user_id column)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='auth' AND table_name='mfa_amr_claims') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='auth' AND table_name='mfa_amr_claims' AND column_name='user_id') THEN
      DELETE FROM auth.mfa_amr_claims WHERE user_id::text IN ('1ffd50e2-ea3c-4e85-a1b7-388bbbd44304','c47230a9-745a-43c6-ad96-e113958d77fa');
    END IF;
  END IF;
END$$;

-- Delete from auth.audit_log_entries (if exists)
DO $$
DECLARE
  where_clauses TEXT := '';
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema='auth' AND table_name='audit_log_entries'
  ) THEN
    -- Support different possible schemas by detecting existing columns
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema='auth' AND table_name='audit_log_entries' AND column_name='actor_id'
    ) THEN
      where_clauses := where_clauses || CASE WHEN where_clauses <> '' THEN ' OR ' ELSE '' END ||
        'actor_id::text IN (''1ffd50e2-ea3c-4e85-a1b7-388bbbd44304'',''c47230a9-745a-43c6-ad96-e113958d77fa'')';
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema='auth' AND table_name='audit_log_entries' AND column_name='target_id'
    ) THEN
      where_clauses := where_clauses || CASE WHEN where_clauses <> '' THEN ' OR ' ELSE '' END ||
        'target_id::text IN (''1ffd50e2-ea3c-4e85-a1b7-388bbbd44304'',''c47230a9-745a-43c6-ad96-e113958d77fa'')';
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema='auth' AND table_name='audit_log_entries' AND column_name='user_id'
    ) THEN
      where_clauses := where_clauses || CASE WHEN where_clauses <> '' THEN ' OR ' ELSE '' END ||
        'user_id::text IN (''1ffd50e2-ea3c-4e85-a1b7-388bbbd44304'',''c47230a9-745a-43c6-ad96-e113958d77fa'')';
    END IF;

    -- If at least one relevant column exists, execute the delete
    IF where_clauses <> '' THEN
      EXECUTE 'DELETE FROM auth.audit_log_entries WHERE ' || where_clauses;
    END IF;
  END IF;
END$$;

-- 3) Finally delete the users
DELETE FROM auth.users
WHERE id::text IN ('1ffd50e2-ea3c-4e85-a1b7-388bbbd44304','c47230a9-745a-43c6-ad96-e113958d77fa');

COMMIT;
