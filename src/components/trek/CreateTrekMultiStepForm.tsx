import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useUserVerificationStatus } from '@/components/auth/useUserVerificationStatus';
import { useAuth } from '@/components/auth/AuthProvider';
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

// Step 1: Trek Details
function TrekDetailsStep({ formData, setFormData, imagePreview, handleImageChange, gpxFile, handleGpxChange, errors }) {
  // --- Image Guardrails ---
  const [imgError, setImgError] = useState('');
  const handleImageInputChange = (e) => {
    setImgError('');
    const file = e.target.files[0];
    if (!file) return handleImageChange(e);
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setImgError('Only JPG, PNG, or WEBP images are allowed.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setImgError('Image must be less than 2MB.');
      return;
    }
    handleImageChange(e);
  };
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="trek_name">Trek Name *</Label>
        <Input id="trek_name" name="trek_name" value={formData.trek_name} onChange={e => setFormData(f => ({ ...f, trek_name: e.target.value }))} required />
        {errors.trek_name && <div className="text-red-500 text-xs mt-1">{errors.trek_name}</div>}
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} rows={3} />
        <div className="text-gray-500 text-xs mt-1">Share a short, catchy description for your trek.</div>
      </div>
      <div>
        <Label htmlFor="trek-image">Trek Image</Label>
        <Input type="file" id="trek-image" accept="image/*" onChange={handleImageInputChange} />
        {imgError && <div className="text-red-500 text-xs mt-1">{imgError}</div>}
        {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 w-full max-h-48 object-cover rounded" />}
        <div className="text-gray-500 text-xs mt-1">Max size: 2MB. Allowed: JPG, PNG, WEBP.</div>
      </div>
      <div>
        <Label htmlFor="gpx-file">GPX File (Route Map)</Label>
        <Input type="file" id="gpx-file" accept=".gpx" onChange={handleGpxChange} />
        {gpxFile && <div className="mt-2 text-xs text-green-700">Selected: {gpxFile.name}</div>}
      </div>
      <div>
        <Label htmlFor="start_datetime">Start Date and Time *</Label>
        <Input id="start_datetime" name="start_datetime" type="datetime-local" value={formData.start_datetime} onChange={e => setFormData(f => ({ ...f, start_datetime: e.target.value }))} required />
        {errors.start_datetime && <div className="text-red-500 text-xs mt-1">{errors.start_datetime}</div>}
        <div className="text-gray-500 text-xs mt-1">Choose when your trek begins. Participants will be notified.</div>
      </div>
      <div>
        <Label htmlFor="location">Location</Label>
        <Input id="location" name="location" value={formData.location} onChange={e => setFormData(f => ({ ...f, location: e.target.value }))} />
        <div className="text-gray-500 text-xs mt-1">Where will the trek start? (e.g., "Matheran Hill Base")</div>
      </div>
      <div>
        <Label htmlFor="base_price">Base Cost (₹) *</Label>
        <Input id="base_price" name="base_price" type="number" min="0" value={formData.base_price || ''} onChange={e => setFormData(f => ({ ...f, base_price: e.target.value }))} required />
        {errors.base_price && <div className="text-red-500 text-xs mt-1">{errors.base_price}</div>}
        <div className="text-gray-500 text-xs mt-1">Base cost per participant (required)</div>
      </div>
      <div>
        <Label htmlFor="max_participants">Max Participants *</Label>
        <Input id="max_participants" name="max_participants" type="text" value={formData.max_participants || ''} onChange={e => setFormData(f => ({ ...f, max_participants: e.target.value }))} required />
        {errors.max_participants && <div className="text-red-500 text-xs mt-1">{errors.max_participants}</div>}
        <div className="text-gray-500 text-xs mt-1">Maximum number of participants allowed (required)</div>
      </div>
    </div>
  );
}

// Step 2 (was 3): Packing List - Refactored
interface MasterPackingItem {
    id: number;
    name: string;
    category: string | null;
}

function PackingListStep({ selectedItems, setSelectedItems, mandatoryItems, setMandatoryItems }) {
  const [masterList, setMasterList] = useState<MasterPackingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMasterList = async () => {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('master_packing_items')
        .select('id, name, category')
        .order('category').order('name');

      if (fetchError) {
        console.error("Error fetching master packing list:", fetchError);
        setError("Failed to load master packing list.");
        setMasterList([]);
      } else {
        setMasterList(data || []);
      }
      setLoading(false);
    };
    fetchMasterList();
  }, []);

  const handleItemSelect = (itemId: number, checked: boolean) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(itemId);
      } else {
        newSet.delete(itemId);
        // Also uncheck mandatory if item is deselected
        setMandatoryItems(mPrev => {
            const newMandatorySet = new Set(mPrev);
            newMandatorySet.delete(itemId);
            return newMandatorySet;
        });
      }
      return newSet;
    });
  };

  const handleMandatoryToggle = (itemId: number, mandatory: boolean) => {
      // Only allow making mandatory if item is selected
      if (!selectedItems.has(itemId) && mandatory) return;

      setMandatoryItems(prev => {
          const newSet = new Set(prev);
          if (mandatory) {
              newSet.add(itemId);
          } else {
              newSet.delete(itemId);
          }
          return newSet;
      });
  };

  const groupedItems = masterList.reduce((acc, item) => {
      const category = item.category || 'Miscellaneous';
      if (!acc[category]) {
          acc[category] = [];
      }
      acc[category].push(item);
      return acc;
  }, {} as Record<string, MasterPackingItem[]>);

  if (loading) return <div>Loading packing items...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-4">
      <div className="font-semibold mb-2">Select items for this trek's packing list:</div>
      <ScrollArea className="h-72 w-full rounded-md border p-4">
          {Object.entries(groupedItems).map(([category, items]) => (
              <div key={category} className="mb-4">
                  <h3 className="font-medium text-lg mb-2">{category}</h3>
                  <ul className="space-y-2">
                      {items.map((item) => (
                          <li key={item.id} className="flex items-center justify-between">
                              <Label htmlFor={`item-${item.id}`} className="flex items-center gap-2 cursor-pointer">
                                  <Checkbox
                                      id={`item-${item.id}`}
                                      checked={selectedItems.has(item.id)}
                                      onCheckedChange={(checked) => handleItemSelect(item.id, !!checked)}
                                  />
                                  <span>{item.name}</span>
                              </Label>
                              {selectedItems.has(item.id) && (
                                <Label htmlFor={`mandatory-${item.id}`} className="flex items-center gap-1 text-xs cursor-pointer">
                                    <Checkbox
                                        id={`mandatory-${item.id}`}
                                        checked={mandatoryItems.has(item.id)}
                                        onCheckedChange={(checked) => handleMandatoryToggle(item.id, !!checked)}
                                    />
                                    <span>Mandatory</span>
                                </Label>
                              )}
                          </li>
                      ))}
                  </ul>
              </div>
          ))}
      </ScrollArea>
    </div>
  );
}

// Step 3 (was 4): Review & Submit
function ReviewStep({ formData, selectedPackingItems, mandatoryPackingItems, masterPackingList, imagePreview, gpxFile, gpxRouteData }) {
  // Find the names of selected packing items from the master list
  const getSelectedItemDetails = (itemId: number) => {
      return masterPackingList.find(item => item.id === itemId);
  }

  return (
    <div className="space-y-4">
      <div><b>Trek Name:</b> {formData.name}</div>
      <div><b>Description:</b> {formData.description}</div>
      <div><b>Start Date:</b> {formData.start_datetime}</div>
      <div><b>Location:</b> {formData.location}</div>
      <div><b>Base Cost:</b> ₹{formData.base_price}</div>
      <div><b>Max Participants:</b> {formData.max_participants}</div>
      {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 w-full max-h-32 object-cover rounded" />}
      {gpxFile && (
        <div className="text-xs text-blue-700">GPX File: {gpxFile.name}</div>
      )}
      {gpxRouteData && (
        <div className="text-xs text-green-700">
          Route: {gpxRouteData.distance_km} km, Elevation Gain: {gpxRouteData.elevation_gain} m, Points: {gpxRouteData.points}
        </div>
      )}
      <div>
        <b>Packing List:</b>
        {selectedPackingItems.size === 0 ? (
            <p className="text-muted-foreground">No items selected.</p>
        ) : (
            <ul className="list-disc pl-5">
            {[...selectedPackingItems].map((itemId) => {
                const itemDetails = getSelectedItemDetails(itemId);
                return (
                    <li key={itemId}>
                        {itemDetails?.name || `Item ID: ${itemId}`}
                        {mandatoryPackingItems.has(itemId) && <span className="text-red-600 font-semibold ml-2">(Mandatory)</span>}
                    </li>
                );
            })}
            </ul>
        )}
      </div>
    </div>
  );
}

// Main Multi-Step Form
export default function CreateTrekMultiStepForm() {
  const { user } = useAuth(); // Use basic useAuth
  const { isVerified, isIndemnityAccepted, userType, loading } = useUserVerificationStatus();

  // Validation for user type and status
  const validCreatorTypes = ['admin', 'micro_community'];
  const canCreate = !loading &&
                      userType &&
                      validCreatorTypes.includes(userType) &&
                      (userType === 'admin' || (userType === 'micro_community' && isVerified && isIndemnityAccepted));

  const [step, setStep] = useState(0);
  // Updated formData state to use name and base_price
  const [formData, setFormData] = useState({ name: '', description: '', start_datetime: '', location: '', base_price: '', max_participants: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [gpxFile, setGpxFile] = useState<File | null>(null);
  const [gpxRouteData, setGpxRouteData] = useState<any>(null);
  // Refactored Packing List state
  const [selectedPackingItems, setSelectedPackingItems] = useState<Set<number>>(new Set());
  const [mandatoryPackingItems, setMandatoryPackingItems] = useState<Set<number>>(new Set());
  const [masterPackingList, setMasterPackingList] = useState<MasterPackingItem[]>([]); // Need master list for Review step

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

   // Fetch master packing list once for the Review step
   useEffect(() => {
    const fetchMasterListForReview = async () => {
      const { data, error } = await supabase
        .from('master_packing_items')
        .select('id, name, category');
      if (!error) {
        setMasterPackingList(data || []);
      }
    };
    fetchMasterListForReview();
  }, []);

  if (loading) return <div>Loading user status...</div>;

  if (!canCreate) {
      let message = 'Trek creation not allowed.';
      if (userType === 'trekker') message = 'Trekkers cannot create trek events.';
      else if (userType === 'micro_community' && (!isVerified || !isIndemnityAccepted)) message = 'Micro-community users must be verified and accept indemnity to create events.';
      else if (!userType || !validCreatorTypes.includes(userType)) message = 'Invalid user type for trek creation.';

    return (
      <div className="max-w-2xl mx-auto p-8 text-center text-red-600">
        <h2 className="text-xl font-semibold mb-2">{message}</h2>
      </div>
    );
  }

  // Ensure location is always a string before submit
  function sanitizeLocation(location: any): string {
    if (typeof location === 'string') return location;
    // Handle potential GeoJSON Point object (example)
    if (location && typeof location === 'object' && location.type === 'Point' && Array.isArray(location.coordinates)) {
        return `Coords: ${location.coordinates[1]}, ${location.coordinates[0]}`;
    }
    return JSON.stringify(location) || ''; // Fallback
  }

  const handleGpxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setGpxFile(file);
      // Simple GPX parsing placeholder (replace with actual library if needed)
      const reader = new FileReader();
      reader.onload = (event) => {
          const text = event.target?.result as string;
          if (text) {
              try {
                  // Example: Count points (replace with real parsing)
                  const pointCount = (text.match(/<trkpt/g) || []).length;
                  setGpxRouteData({ points: pointCount, distance_km: 'N/A', elevation_gain: 'N/A' });
                  console.log("Simulated GPX data:", { points: pointCount });
              } catch (parseError) {
                  console.error("Error parsing GPX:", parseError);
                  toast({ title: 'GPX Parse Error', description: 'Could not read basic GPX data.', variant: 'destructive' });
                  setGpxRouteData(null);
              }
          } else {
              setGpxRouteData(null);
          }
      };
      reader.onerror = () => {
          toast({ title: 'GPX Read Error', description: 'Could not read the GPX file.', variant: 'destructive' });
          setGpxRouteData(null);
      };
      reader.readAsText(file);
    } else {
      setGpxFile(null);
      setGpxRouteData(null);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleSubmit = async () => {
    if (!user) return toast({ title: 'User not found', variant: 'destructive'});

    setSubmitting(true);
    try {
      let imageUrl: string | null = null;
      let gpxUrl: string | null = null;
      let routeData: any = gpxRouteData || null;

      // Upload Image
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const filePath = `trek-images/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('trek_assets').upload(filePath, imageFile, { upsert: false });
        if (uploadError) throw new Error(`Image Upload Error: ${uploadError.message}`);
        const { data: publicUrlData } = supabase.storage.from('trek_assets').getPublicUrl(filePath);
        imageUrl = publicUrlData?.publicUrl || null;
      }

      // Upload GPX
      if (gpxFile) {
        const fileExt = gpxFile.name.split('.').pop();
        const filePath = `trek-gpx/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('trek_assets').upload(filePath, gpxFile, { upsert: false });
        if (uploadError) throw new Error(`GPX Upload Error: ${uploadError.message}`);
        const { data: gpxPublicUrlData } = supabase.storage.from('trek_assets').getPublicUrl(filePath);
        gpxUrl = gpxPublicUrlData?.publicUrl || null;
      }

      // Sanitize data
      const sanitizedLocation = sanitizeLocation(formData.location);
      const sanitizedBasePrice = formData.base_price;
      const sanitizedMaxParticipants = formData.max_participants;

      // Validate required numeric fields
      if (sanitizedBasePrice === '' || isNaN(Number(sanitizedBasePrice))) {
        throw new Error('Base Cost is required and must be a valid number.');
      }
      if (sanitizedMaxParticipants === '' || isNaN(Number(sanitizedMaxParticipants))) {
        throw new Error('Max participants is required and must be a valid number.');
      }
      const maxParticipantsNumber = Number(sanitizedMaxParticipants);
      const basePriceNumber = Number(sanitizedBasePrice);

      // 1. Insert trek event
      const { data: trekData, error: trekError } = await supabase.from('trek_events').insert({
        name: formData.name, // Ensure correct key 'name'
        description: formData.description,
        start_datetime: formData.start_datetime,
        location: sanitizedLocation,
        image_url: imageUrl,
        gpx_file_url: gpxUrl,
        route_data: routeData,
        base_price: basePriceNumber, // Ensure correct key 'base_price'
        max_participants: maxParticipantsNumber,
        created_by: user.id // Set creator
        // Add other relevant fields from formData if needed (e.g., difficulty, category)
        // Ensuring NO old keys like trek_name or cost are present
      }).select('trek_id').single();

      if (trekError) throw trekError;
      const trek_id = Number(trekData.trek_id);

      // 2. (was 3) Insert trek_packing_list_assignments
      const assignmentsToInsert = Array.from(selectedPackingItems).map((itemId, index) => ({
          trek_id: trek_id,
          master_item_id: itemId,
          mandatory: mandatoryPackingItems.has(itemId),
          item_order: index // Add order based on selection sequence (optional)
      }));

      if (assignmentsToInsert.length > 0) {
          const { error: itemError } = await supabase.from('trek_packing_list_assignments').insert(assignmentsToInsert);
          if (itemError) throw itemError;
      }

      toast({ title: 'Trek created successfully!' });
      // Optionally redirect or reset form: reset state, setStep(0)
      setFormData({ name: '', description: '', start_datetime: '', location: '', base_price: '', max_participants: '' });
      setImageFile(null);
      setImagePreview(null);
      setGpxFile(null);
      setGpxRouteData(null);
      setSelectedPackingItems(new Set());
      setMandatoryPackingItems(new Set());
      setStep(0);

    } catch (error: any) {
      toast({ title: 'Error creating trek', description: error.message || JSON.stringify(error), variant: 'destructive' });
      console.error('Error creating trek event:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Validation logic
  const validateStep = () => {
    const newErrors: { [key: string]: string } = {};
    if (step === 0) {
      if (!formData.name) newErrors.name = 'Trek name is required.'; // Check name
      if (!formData.start_datetime) newErrors.start_datetime = 'Start date & time required.';
      if (!formData.base_price || formData.base_price === '') newErrors.base_price = 'Base Cost is required.'; // Check base_price
      if (!formData.max_participants || formData.max_participants === '') newErrors.max_participants = 'Max participants is required.';
      // Add further validation for numeric types if desired
      if (formData.base_price && isNaN(Number(formData.base_price))) newErrors.base_price = 'Base Cost must be a number.';
      if (formData.max_participants && isNaN(Number(formData.max_participants))) newErrors.max_participants = 'Max participants must be a number.';

    }
    // Add validation for other steps if needed
    return newErrors;
  };

  const handleNext = () => {
    const validation = validateStep();
    setErrors(validation);
    if (Object.keys(validation).length === 0) setStep(s => s + 1);
  };

  const steps = ['Trek Details', 'Packing List', 'Review']; // Removed 'Fixed Expenses'

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-6 flex justify-between items-center">
        <div className="text-xl font-bold">Create New Trek</div>
        <div className="space-x-2">
          {steps.map((label, idx) => (
            <Button key={label} variant={step === idx ? 'default' : 'outline'} onClick={() => setStep(idx)}>{idx + 1}. {label}</Button>
          ))}
        </div>
      </div>
      {/* Pass correct props to steps */} 
      {step === 0 && <TrekDetailsStep formData={formData} setFormData={setFormData} imagePreview={imagePreview} handleImageChange={handleImageChange} gpxFile={gpxFile} handleGpxChange={handleGpxChange} errors={errors} />}
      {step === 1 && <PackingListStep selectedItems={selectedPackingItems} setSelectedItems={setSelectedPackingItems} mandatoryItems={mandatoryPackingItems} setMandatoryItems={setMandatoryPackingItems} />}
      {step === 2 && <ReviewStep formData={formData} selectedPackingItems={selectedPackingItems} mandatoryPackingItems={mandatoryPackingItems} masterPackingList={masterPackingList} imagePreview={imagePreview} gpxFile={gpxFile} gpxRouteData={gpxRouteData} />}

      <form onSubmit={e => { e.preventDefault(); if (step === steps.length - 1) handleSubmit(); else handleNext(); }}>
        <div className="mt-8 flex justify-between">
          <Button type="button" variant="outline" disabled={step === 0} onClick={() => setStep(s => s - 1)}>Back</Button>
          <Button type="submit" disabled={submitting}>{step === steps.length - 1 ? (submitting ? 'Submitting...' : 'Create Trek') : 'Next'}</Button>
        </div>
      </form>
    </div>
  );
}
