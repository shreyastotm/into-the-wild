// Debug script to check the test treks and their registrations (simplified)
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://lojnpkunoufmwwcifwan.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxvam5wa3Vub3VmbXd3Y2lmd2FuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzMDcyMTMsImV4cCI6MjA1OTg4MzIxM30.MullqAvDPGgkDc3yW-GIuenn87U-Z3KLDmpU6U1BJmU";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function debugTestTreks() {
  console.log("🔍 Debugging Test Treks...");

  try {
    // Find the test treks
    const { data: testTreks, error: treksError } = await supabase
      .from("trek_events")
      .select("trek_id, name, start_datetime, status")
      .like("name", "Test Past Trek%");

    if (treksError) {
      console.log("❌ Test treks error:", treksError);
      return;
    }

    console.log("✅ Test treks found:", testTreks?.length || 0);
    if (testTreks?.length > 0) {
      testTreks.forEach((trek) => {
        console.log(
          `  - ${trek.name} (ID: ${trek.trek_id}, Status: ${trek.status})`,
        );
      });

      // Get registrations for these treks
      const trekIds = testTreks.map((t) => t.trek_id);
      const { data: registrations, error: regError } = await supabase
        .from("trek_registrations")
        .select("trek_id, user_id, payment_status")
        .in("trek_id", trekIds);

      if (regError) {
        console.log("❌ Registrations error:", regError);
      } else {
        console.log("✅ Registrations found:", registrations?.length || 0);
        if (registrations?.length > 0) {
          registrations.forEach((reg) => {
            console.log(
              `  - Trek ID ${reg.trek_id}: User ID ${reg.user_id} - ${reg.payment_status}`,
            );
          });

          // Get user details for these user IDs
          const userIds = [...new Set(registrations.map((r) => r.user_id))];
          const { data: users, error: usersError } = await supabase
            .from("users")
            .select("user_id, email, full_name")
            .in("user_id", userIds);

          if (usersError) {
            console.log("❌ Users error:", usersError);
          } else {
            console.log("✅ Users found:", users?.length || 0);
            if (users?.length > 0) {
              users.forEach((user) => {
                console.log(
                  `  - User ID ${user.user_id}: ${user.email} (${user.full_name})`,
                );
              });
            }
          }
        }
      }
    }
  } catch (error) {
    console.log("❌ Unexpected error:", error);
  }
}

debugTestTreks();
