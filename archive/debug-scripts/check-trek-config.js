// Script to check trek configuration for ID requirements and packing list
// Run this with: node check-trek-config.js

const { createClient } = require("@supabase/supabase-js");

// You'll need to set your Supabase URL and anon key
const supabaseUrl = process.env.VITE_SUPABASE_URL || "your-supabase-url";
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "your-anon-key";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTrekConfig(trekId) {
  console.log(`Checking configuration for trek ID: ${trekId}\n`);

  try {
    // Check trek basic info
    const { data: trek, error: trekError } = await supabase
      .from("trek_events")
      .select("trek_id, name, government_id_required, status")
      .eq("trek_id", trekId)
      .single();

    if (trekError) {
      console.error("Error fetching trek:", trekError);
      return;
    }

    console.log("=== TREK INFO ===");
    console.log(`Name: ${trek.name}`);
    console.log(`Government ID Required: ${trek.government_id_required}`);
    console.log(`Status: ${trek.status}\n`);

    // Check ID requirements
    const { data: idRequirements, error: idError } = await supabase
      .from("trek_id_requirements")
      .select(
        `
        id_type_id,
        is_mandatory,
        id_types (
          name,
          display_name,
          description
        )
      `,
      )
      .eq("trek_id", trekId);

    if (idError) {
      console.error("Error fetching ID requirements:", idError);
    } else {
      console.log("=== ID REQUIREMENTS ===");
      if (idRequirements && idRequirements.length > 0) {
        idRequirements.forEach((req) => {
          console.log(
            `- ${req.id_types?.display_name}: ${req.is_mandatory ? "Mandatory" : "Optional"}`,
          );
        });
      } else {
        console.log("No ID requirements configured");
      }
      console.log("");
    }

    // Check packing list
    const { data: packingList, error: packingError } = await supabase
      .from("trek_packing_list_assignments")
      .select(
        `
        mandatory,
        master_packing_items (
          name,
          category
        )
      `,
      )
      .eq("trek_id", trekId);

    if (packingError) {
      console.error("Error fetching packing list:", packingError);
    } else {
      console.log("=== PACKING LIST ===");
      if (packingList && packingList.length > 0) {
        const mandatoryItems = packingList.filter((item) => item.mandatory);
        console.log(`Total items: ${packingList.length}`);
        console.log(`Mandatory items: ${mandatoryItems.length}`);

        if (mandatoryItems.length > 0) {
          console.log("\nMandatory items:");
          mandatoryItems.forEach((item) => {
            console.log(
              `- ${item.master_packing_items?.name} (${item.master_packing_items?.category})`,
            );
          });
        } else {
          console.log("No mandatory items configured");
        }
      } else {
        console.log("No packing list items assigned");
      }
    }
  } catch (error) {
    console.error("Unexpected error:", error);
  }
}

// Usage: node check-trek-config.js 123 (where 123 is the trek ID)
const trekId = process.argv[2];
if (!trekId) {
  console.log("Usage: node check-trek-config.js <trek_id>");
  process.exit(1);
}

checkTrekConfig(parseInt(trekId));
