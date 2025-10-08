// Debug script to test Supabase connection and identify issues
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lojnpkunoufmwwcifwan.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxvam5wa3Vub3VmbXd3Y2lmd2FuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzMDcyMTMsImV4cCI6MjA1OTg4MzIxM30.MullqAvDPGgkDc3yW-GIuenn87U-Z3KLDmpU6U1BJmU';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function debugSupabase() {
  console.log('🔍 Starting Supabase Debug...');
  
  try {
    // Test 1: Basic connection
    console.log('1. Testing basic connection...');
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    console.log('Session:', session ? '✅ Connected' : '❌ No session');
    if (sessionError) console.log('Session Error:', sessionError);
    
    // Test 2: Test users table access
    console.log('2. Testing users table access...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('user_id, name, email')
      .limit(1);
    
    if (usersError) {
      console.log('❌ Users table error:', usersError);
    } else {
      console.log('✅ Users table accessible:', users?.length || 0, 'records');
    }
    
    // Test 3: Test trek_events table
    console.log('3. Testing trek_events table...');
    const { data: events, error: eventsError } = await supabase
      .from('trek_events')
      .select('trek_id, name')
      .limit(1);
    
    if (eventsError) {
      console.log('❌ Trek events error:', eventsError);
    } else {
      console.log('✅ Trek events accessible:', events?.length || 0, 'records');
    }
    
    // Test 4: Test trek_registrations table
    console.log('4. Testing trek_registrations table...');
    const { data: registrations, error: regError } = await supabase
      .from('trek_registrations')
      .select('user_id, trek_id')
      .limit(1);
    
    if (regError) {
      console.log('❌ Registrations error:', regError);
    } else {
      console.log('✅ Registrations accessible:', registrations?.length || 0, 'records');
    }
    
    // Test 5: Test RPC functions
    console.log('5. Testing RPC functions...');
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('get_trek_participant_count', { p_trek_id: 1 });
    
    if (rpcError) {
      console.log('❌ RPC error:', rpcError);
    } else {
      console.log('✅ RPC function working:', rpcData);
    }
    
  } catch (error) {
    console.log('❌ Unexpected error:', error);
  }
}

debugSupabase();
