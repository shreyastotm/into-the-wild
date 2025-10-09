# Avatar Assets

This directory contains avatar assets for the Into The Wild community forum.

## Structure

```
public/avatars/
├── animals/
│   ├── bengal_tiger.svg
│   ├── indian_elephant.svg
│   └── ...
├── birds/
│   ├── indian_peacock.svg
│   ├── great_indian_bustard.svg
│   └── ...
└── insects/
    ├── atlas_moth.svg
    ├── common_rose_butterfly.svg
    └── ...
```

## Asset Requirements

- **Format:** SVG (scalable, small file size)
- **Size:** Optimized for 80x80px display (avatar component uses h-20 w-20)
- **Style:** Simple, recognizable silhouettes or icons
- **Colors:** Use the site's color palette (teal, terracotta, neutral grays)
- **Theme:** Indian wildlife focus

## Usage in Database

Avatar URLs should point to these local assets:
- `/avatars/animals/bengal_tiger.svg`
- `/avatars/birds/indian_peacock.svg`
- `/avatars/insects/atlas_moth.svg`

## Adding New Avatars

1. Create SVG file in appropriate category directory
2. Update `supabase/migrations/20250120000004_seed_avatar_catalog.sql`
3. Run migration to update database
4. Test in AvatarPicker component
