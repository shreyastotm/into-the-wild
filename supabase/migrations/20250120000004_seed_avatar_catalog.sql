-- Seed Avatar Catalog with Indian Fauna
-- Migration: 20250120000004_seed_avatar_catalog.sql

BEGIN;

-- ==============================
--       PRE-SEED VERIFICATION
-- ==============================

-- Ensure avatar_catalog table exists and has all required columns
DO $$
BEGIN
  -- Create table if it doesn't exist
  CREATE TABLE IF NOT EXISTS public.avatar_catalog (
    key TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('animal', 'bird', 'insect')),
    image_url TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
  );

  -- Add any missing columns
  BEGIN
    ALTER TABLE public.avatar_catalog ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'animal' CHECK (category IN ('animal', 'bird', 'insect'));
  EXCEPTION WHEN duplicate_column THEN
    -- Column already exists, continue
    NULL;
  END;

  BEGIN
    ALTER TABLE public.avatar_catalog ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE;
  EXCEPTION WHEN duplicate_column THEN
    NULL;
  END;

  BEGIN
    ALTER TABLE public.avatar_catalog ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;
  EXCEPTION WHEN duplicate_column THEN
    NULL;
  END;

  BEGIN
    ALTER TABLE public.avatar_catalog ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
  EXCEPTION WHEN duplicate_column THEN
    NULL;
  END;
END $$;

-- ==============================
--       SEED AVATAR CATALOG
-- ==============================

-- Avatar assets are now hosted locally in public/avatars/ directory

-- Animals (Mammals)
INSERT INTO public.avatar_catalog (key, name, category, image_url, sort_order) VALUES
('bengal_tiger', 'Bengal Tiger', 'animal', '/avatars/animals/bengal_tiger.svg', 1),
('indian_elephant', 'Indian Elephant', 'animal', '/avatars/animals/indian_elephant.svg', 2),
('indian_rhinoceros', 'Indian Rhinoceros', 'animal', '/avatars/animals/indian_rhinoceros.svg', 3),
('gaur', 'Gaur (Indian Bison)', 'animal', '/avatars/animals/gaur.svg', 4),
('nilgai', 'Nilgai (Blue Bull)', 'animal', '/avatars/animals/nilgai.svg', 5),
('blackbuck', 'Blackbuck', 'animal', '/avatars/animals/blackbuck.svg', 6),
('chousingha', 'Chousingha (Four-horned Antelope)', 'animal', '/avatars/animals/chousingha.svg', 7),
('indian_wild_boar', 'Indian Wild Boar', 'animal', '/avatars/animals/indian_wild_boar.svg', 8),
('golden_langur', 'Golden Langur', 'animal', '/avatars/animals/golden_langur.svg', 9),
('capped_langur', 'Capped Langur', 'animal', '/avatars/animals/capped_langur.svg', 10),
('indian_giant_squirrel', 'Indian Giant Squirrel', 'animal', '/avatars/animals/indian_giant_squirrel.svg', 11),
('red_panda', 'Red Panda', 'animal', '/avatars/animals/red_panda.svg', 12),
('sloth_bear', 'Sloth Bear', 'animal', '/avatars/animals/sloth_bear.svg', 13),
('indian_wolf', 'Indian Wolf', 'animal', '/avatars/animals/indian_wolf.svg', 14),
('striped_hyena', 'Striped Hyena', 'animal', '/avatars/animals/striped_hyena.svg', 15);

-- Birds
INSERT INTO public.avatar_catalog (key, name, category, image_url, sort_order) VALUES
('indian_peacock', 'Indian Peacock', 'bird', '/avatars/birds/indian_peacock.svg', 1),
('great_indian_bustard', 'Great Indian Bustard', 'bird', '/avatars/birds/great_indian_bustard.svg', 2),
('sarus_crane', 'Sarus Crane', 'bird', '/avatars/birds/sarus_crane.svg', 3),
('indian_roller', 'Indian Roller', 'bird', '/avatars/birds/indian_roller.svg', 4),
('green_bee_eater', 'Green Bee-eater', 'bird', '/avatars/birds/green_bee_eater.svg', 5),
('indian_pitta', 'Indian Pitta', 'bird', '/avatars/birds/indian_pitta.svg', 6),
('malabar_trogon', 'Malabar Trogon', 'bird', '/avatars/birds/malabar_trogon.svg', 7),
('great_hornbill', 'Great Hornbill', 'bird', '/avatars/birds/great_hornbill.svg', 8),
('indian_grey_hornbill', 'Indian Grey Hornbill', 'bird', '/avatars/birds/indian_grey_hornbill.svg', 9),
('red_wattled_lapwing', 'Red-wattled Lapwing', 'bird', '/avatars/birds/red_wattled_lapwing.svg', 10),
('indian_cuckoo', 'Indian Cuckoo', 'bird', '/avatars/birds/indian_cuckoo.svg', 11),
('asian_koel', 'Asian Koel', 'bird', '/avatars/birds/asian_koel.svg', 12),
('white_breasted_waterhen', 'White-breasted Waterhen', 'bird', '/avatars/birds/white_breasted_waterhen.svg', 13),
('purple_sunbird', 'Purple Sunbird', 'bird', '/avatars/birds/purple_sunbird.svg', 14),
('indian_silverbill', 'Indian Silverbill', 'bird', '/avatars/birds/indian_silverbill.svg', 15),
('red_munia', 'Red Munia', 'bird', '/avatars/birds/red_munia.svg', 16),
('spotted_owlet', 'Spotted Owlet', 'bird', '/avatars/birds/spotted_owlet.svg', 17),
('collared_scops_owl', 'Collared Scops Owl', 'bird', '/avatars/birds/collared_scops_owl.svg', 18),
('indian_eagle_owl', 'Indian Eagle Owl', 'bird', '/avatars/birds/indian_eagle_owl.svg', 19),
('black_kite', 'Black Kite', 'bird', '/avatars/birds/black_kite.svg', 20),
('brahminy_kite', 'Brahminy Kite', 'bird', '/avatars/birds/brahminy_kite.svg', 21),
('white_rumped_vulture', 'White-rumped Vulture', 'bird', '/avatars/birds/white_rumped_vulture.svg', 22),
('egyptian_vulture', 'Egyptian Vulture', 'bird', '/avatars/birds/egyptian_vulture.svg', 23),
('crested_serpent_eagle', 'Crested Serpent Eagle', 'bird', '/avatars/birds/crested_serpent_eagle.svg', 24);

-- Insects
INSERT INTO public.avatar_catalog (key, name, category, image_url, sort_order) VALUES
('atlas_moth', 'Atlas Moth', 'insect', '/avatars/insects/atlas_moth.svg', 1),
('common_rose_butterfly', 'Common Rose Butterfly', 'insect', '/avatars/insects/common_rose_butterfly.svg', 2),
('blue_mormon_butterfly', 'Blue Mormon Butterfly', 'insect', '/avatars/insects/blue_mormon_butterfly.svg', 3),
('southern_birdwing', 'Southern Birdwing', 'insect', '/avatars/insects/southern_birdwing.svg', 4),
('common_crow_butterfly', 'Common Crow Butterfly', 'insect', '/avatars/insects/common_crow_butterfly.svg', 5),
('plain_tiger_butterfly', 'Plain Tiger Butterfly', 'insect', '/avatars/insects/plain_tiger_butterfly.svg', 6),
('striped_tiger_butterfly', 'Striped Tiger Butterfly', 'insect', '/avatars/insects/striped_tiger_butterfly.svg', 7),
('common_sailor_butterfly', 'Common Sailor Butterfly', 'insect', '/avatars/insects/common_sailor_butterfly.svg', 8),
('blue_pansy_butterfly', 'Blue Pansy Butterfly', 'insect', '/avatars/insects/blue_pansy_butterfly.svg', 9),
('peacock_pansy_butterfly', 'Peacock Pansy Butterfly', 'insect', '/avatars/insects/peacock_pansy_butterfly.svg', 10),
('indian_cabbage_white', 'Indian Cabbage White', 'insect', '/avatars/insects/indian_cabbage_white.svg', 11),
('common_grass_yellow', 'Common Grass Yellow', 'insect', '/avatars/insects/common_grass_yellow.svg', 12),
('small_grass_yellow', 'Small Grass Yellow', 'insect', '/avatars/insects/small_grass_yellow.svg', 13),
('indian_red_flash', 'Indian Red Flash', 'insect', '/avatars/insects/indian_red_flash.svg', 14),
('tawny_coster', 'Tawny Coster', 'insect', '/avatars/insects/tawny_coster.svg', 15);

-- Additional Animals (Mammals) - Round 2
INSERT INTO public.avatar_catalog (key, name, category, image_url, sort_order) VALUES
('indian_leopard', 'Indian Leopard', 'animal', '/avatars/animals/indian_leopard.svg', 16),
('snow_leopard', 'Snow Leopard', 'animal', '/avatars/animals/snow_leopard.svg', 17),
('clouded_leopard', 'Clouded Leopard', 'animal', '/avatars/animals/clouded_leopard.svg', 18),
('jungle_cat', 'Jungle Cat', 'animal', '/avatars/animals/jungle_cat.svg', 19),
('fishing_cat', 'Fishing Cat', 'animal', '/avatars/animals/fishing_cat.svg', 20),
('leopard_cat', 'Leopard Cat', 'animal', '/avatars/animals/leopard_cat.svg', 21),
('marbled_cat', 'Marbled Cat', 'animal', '/avatars/animals/marbled_cat.svg', 22),
('indian_fox', 'Indian Fox', 'animal', '/avatars/animals/indian_fox.svg', 23),
('golden_jackal', 'Golden Jackal', 'animal', '/avatars/animals/golden_jackal.svg', 24),
('indian_hare', 'Indian Hare', 'animal', '/avatars/animals/indian_hare.svg', 25),
('himalayan_marmot', 'Himalayan Marmot', 'animal', '/avatars/animals/himalayan_marmot.svg', 26),
('indian_porcupine', 'Indian Porcupine', 'animal', '/avatars/animals/indian_porcupine.svg', 27);

-- Additional Birds - Round 2
INSERT INTO public.avatar_catalog (key, name, category, image_url, sort_order) VALUES
('indian_paradise_flycatcher', 'Indian Paradise Flycatcher', 'bird', '/avatars/birds/indian_paradise_flycatcher.svg', 25),
('asian_fairy_bluebird', 'Asian Fairy Bluebird', 'bird', '/avatars/birds/asian_fairy_bluebird.svg', 26),
('blue_whistling_thrush', 'Blue Whistling Thrush', 'bird', '/avatars/birds/blue_whistling_thrush.svg', 27),
('malabar_whistling_thrush', 'Malabar Whistling Thrush', 'bird', '/avatars/birds/malabar_whistling_thrush.svg', 28),
('orange_headed_thrush', 'Orange-headed Thrush', 'bird', '/avatars/birds/orange_headed_thrush.svg', 29),
('white_rumped_shama', 'White-rumped Shama', 'bird', '/avatars/birds/white_rumped_shama.svg', 30),
('indian_robin', 'Indian Robin', 'bird', '/avatars/birds/indian_robin.svg', 31),
('oriental_magpie_robin', 'Oriental Magpie Robin', 'bird', '/avatars/birds/oriental_magpie_robin.svg', 32),
('black_redstart', 'Black Redstart', 'bird', '/avatars/birds/black_redstart.svg', 33),
('blue_rock_thrush', 'Blue Rock Thrush', 'bird', '/avatars/birds/blue_rock_thrush.svg', 34),
('chestnut_bellied_nuthatch', 'Chestnut-bellied Nuthatch', 'bird', '/avatars/birds/chestnut_bellied_nuthatch.svg', 35),
('velvet_fronted_nuthatch', 'Velvet-fronted Nuthatch', 'bird', '/avatars/birds/velvet_fronted_nuthatch.svg', 36);

-- Additional Insects - Round 2
INSERT INTO public.avatar_catalog (key, name, category, image_url, sort_order) VALUES
('common_banded_awl', 'Common Banded Awl', 'insect', '/avatars/insects/common_banded_awl.svg', 16),
('dark_banded_bush_brown', 'Dark-banded Bush Brown', 'insect', '/avatars/insects/dark_banded_bush_brown.svg', 17),
('nigger_brown', 'Nigger Brown', 'insect', '/avatars/insects/nigger_brown.svg', 18),
('common_evening_brown', 'Common Evening Brown', 'insect', '/avatars/insects/common_evening_brown.svg', 19),
('great_eggfly', 'Great Eggfly', 'insect', '/avatars/insects/great_eggfly.svg', 20),
('blue_spotted_crow', 'Blue-spotted Crow', 'insect', '/avatars/insects/blue_spotted_crow.svg', 21),
('common_crow', 'Common Crow', 'insect', '/avatars/insects/common_crow.svg', 22),
('double_banded_crow', 'Double-banded Crow', 'insect', '/avatars/insects/double_banded_crow.svg', 23),
('brown_king_crow', 'Brown King Crow', 'insect', '/avatars/insects/brown_king_crow.svg', 24);

COMMIT;
