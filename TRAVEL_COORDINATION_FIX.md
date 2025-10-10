# Travel Coordination Fixes

## Issue 1: Database Schema Cache Error

**Error**: `Could not find the 'registration_number' column of 'trek_drivers' in the schema cache`

**Solution**: Run the migration file created at `supabase/migrations/20250111000000_ensure_trek_drivers_columns.sql`

This will:
1. Ensure all columns exist on `trek_drivers` table
2. Refresh the Supabase schema cache
3. Add proper comments to columns

**To apply**:
```bash
# If using Supabase CLI
supabase db push

# Or run the SQL directly in Supabase Dashboard SQL Editor
```

## Issue 2: Add Map Search Functionality

Add this function after the `LocationMarker` component (around line 115 in TravelCoordination.tsx):

```typescript
// Search for locations using Nominatim (OpenStreetMap)
const handleSearchLocation = async () => {
  if (!searchQuery.trim()) return;
  
  setSearching(true);
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
      `q=${encodeURIComponent(searchQuery + ', India')}&` +
      `format=json&limit=5&addressdetails=1`
    );
    const data = await response.json();
    setSearchResults(data);
  } catch (error) {
    console.error('Error searching location:', error);
    toast({ title: 'Search failed', description: 'Could not search for location', variant: 'destructive' });
  } finally {
    setSearching(false);
  }
};

const handleSelectSearchResult = (result: { display_name: string; lat: string; lon: string }) => {
  setNewLocation(prev => ({
    ...prev,
    name: result.display_name.split(',')[0],
    address: result.display_name,
    latitude: result.lat,
    longitude: result.lon
  }));
  setMapCenter([parseFloat(result.lat), parseFloat(result.lon)]);
  setSearchResults([]);
  setSearchQuery('');
};
```

Then update the map picker UI (around line 560):

```typescript
{/* Map Picker with Search */}
{showMap && (
  <div className="border rounded-md p-2">
    {/* Search Bar */}
    <div className="mb-2 space-y-2">
      <Label>Search Location</Label>
      <div className="flex gap-2">
        <Input
          placeholder="Search for a place in India..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearchLocation()}
        />
        <Button
          variant="outline"
          onClick={handleSearchLocation}
          disabled={searching || !searchQuery.trim()}
        >
          {searching ? 'Searching...' : 'Search'}
        </Button>
      </div>
      
      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="border rounded-md max-h-32 overflow-y-auto">
          {searchResults.map((result, idx) => (
            <div
              key={idx}
              className="p-2 hover:bg-muted cursor-pointer text-sm"
              onClick={() => handleSelectSearchResult(result)}
            >
              {result.display_name}
            </div>
          ))}
        </div>
      )}
    </div>

    <div className="text-sm font-medium mb-2">Click on the map to set coordinates</div>
    <div className="h-48 w-full">
      <MapContainer center={mapCenter} zoom={12} style={{ height: '100%', width: '100%' }} key={JSON.stringify(mapCenter)}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker
          position={newLocation.latitude && newLocation.longitude ? [parseFloat(newLocation.latitude), parseFloat(newLocation.longitude)] : mapCenter}
          onPositionChange={(latlng) => {
            setNewLocation(prev => ({
              ...prev,
              latitude: latlng[0].toString(),
              longitude: latlng[1].toString()
            }));
          }}
        />
      </MapContainer>
    </div>
    <div className="text-xs text-muted-foreground mt-1">
      Selected: {newLocation.latitude || 'N/A'}, {newLocation.longitude || 'N/A'}
    </div>
  </div>
)}
```

## Quick Steps

1. **Fix Database**: Run the migration in Supabase Dashboard
2. **Add Search Code**: Apply the code changes above to TravelCoordination.tsx
3. **Test**: Try adding a pickup location with map search
4. **Commit**: Once working, commit and push changes

The search uses Nominatim (free, no API key needed) and biases results towards India.

