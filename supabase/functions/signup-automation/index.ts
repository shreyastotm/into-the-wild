// Supabase Edge Function: signup-automation
// This function automates user onboarding for all user types (admin, micro-community, trekker)
// - Sets user_type, partner_id, indemnity, verification fields in public.users
// - Updates app_metadata for JWT claims
// - Designed for use with Supabase Auth hooks (on signup)

// @ts-expect-error: 'std/server' is a Deno runtime import
import { serve } from 'std/server';
import { createClient } from '@supabase/supabase-js';

serve(async (req) => {
  // Parse signup data from request body
  const { user, data } = await req.json();
  // user: { id, email, ... }
  // data: { user_type, partner_id, indemnity_accepted, verification_docs }

  // Log all received data for debugging
  console.log('Edge Function signup-automation received:', { user, data });

  // Use service role key for admin privileges
  // @ts-expect-error: 'Deno.env' is only available in Deno runtime
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  // Prepare user fields
  const userType = data.user_type || 'trekker';
  const partnerId = userType === 'micro_community' ? data.partner_id : null;
  const indemnityAccepted = !!data.indemnity_accepted;
  const indemnityAcceptedAt = indemnityAccepted ? new Date().toISOString() : null;
  const verificationStatus = userType === 'micro_community' ? 'pending' : 'verified';
  const verificationDocs = data.verification_docs || null;

  // Defensive: Check for required fields
  if (!user.id || !user.email) {
    return new Response(JSON.stringify({ error: 'Missing required user fields in Edge Function.' }), { status: 400 });
  }

  // Update public.users table
  const { error: userUpdateError } = await supabase
    .from('users')
    .update({
      user_type: userType,
      partner_id: partnerId,
      indemnity_accepted: indemnityAccepted,
      indemnity_accepted_at: indemnityAcceptedAt,
      verification_status: verificationStatus,
      verification_docs: verificationDocs
    })
    .eq('user_id', user.id);

  if (userUpdateError) {
    console.error('Edge Function userUpdateError:', userUpdateError);
    return new Response(JSON.stringify({ error: userUpdateError.message }), { status: 500 });
  }

  // Update app_metadata for JWT claims
  const { error: metaError } = await supabase.auth.admin.updateUserById(user.id, {
    app_metadata: {
      user_type: userType,
      partner_id: partnerId
    }
  });

  if (metaError) {
    console.error('Edge Function metaError:', metaError);
    return new Response(JSON.stringify({ error: metaError.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
});
