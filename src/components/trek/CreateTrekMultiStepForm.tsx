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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { TrekEventStatus } from '@/types/trek';

// Define TrekEvent type based on TrekEventsAdmin.tsx for the prop
interface AdminTrekEvent {
  trek_id: number;
  name: string;
  description?: string | null;
  location?: string | null;
  category?: string | null; // Added from form
  difficulty?: string | null; // Added from form
  start_datetime: string;
  end_datetime?: string | null;
  base_price?: number | null;
  max_participants: number;
  status?: string | null;
  image_url?: string | null;
  // Note: CreateTrekMultiStepForm also handles gpx_file_url internally
  // and packing list items, which are not part of this AdminTrekEvent interface directly
}

interface CreateTrekMultiStepFormProps {
  trekToEdit?: AdminTrekEvent | null;
  onFormSubmit: (trekData: any) => Promise<void>; // Callback after successful submission
  onCancel: () => void; // Callback for cancelling/closing the form
}

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
        <Label htmlFor="name">Trek Name *</Label>
        <Input id="name" name="name" value={formData.name || ''} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} required />
        {errors.name && <div className="text-red-500 text-xs mt-1">{errors.name}</div>}
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" value={formData.description || ''} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} rows={3} />
        <div className="text-gray-500 text-xs mt-1">Share a short, catchy description for your trek.</div>
      </div>
      <div>
        <Label htmlFor="trek-image">Trek Image (Main)</Label>
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
        <Input id="start_datetime" name="start_datetime" type="datetime-local" value={formData.start_datetime || ''} onChange={e => setFormData(f => ({ ...f, start_datetime: e.target.value }))} required />
        {errors.start_datetime && <div className="text-red-500 text-xs mt-1">{errors.start_datetime}</div>}
        <div className="text-gray-500 text-xs mt-1">Choose when your trek begins. Participants will be notified.</div>
      </div>
      <div>
        <Label htmlFor="location">Location</Label>
        <Input id="location" name="location" value={formData.location || ''} onChange={e => setFormData(f => ({ ...f, location: e.target.value }))} />
        <div className="text-gray-500 text-xs mt-1">Where will the trek start? (e.g., "Matheran Hill Base")</div>
      </div>
      <div>
        <Label htmlFor="category">Category</Label>
        <Input id="category" name="category" value={formData.category || ''} onChange={e => setFormData(f => ({ ...f, category: e.target.value }))} />
      </div>
      <div>
        <Label htmlFor="difficulty">Difficulty</Label>
        <Input id="difficulty" name="difficulty" value={formData.difficulty || ''} onChange={e => setFormData(f => ({ ...f, difficulty: e.target.value }))} />
      </div>
      <div>
        <Label htmlFor="base_price">Base Cost (₹) *</Label>
        <Input 
          id="base_price" 
          name="base_price" 
          type="number" 
          min="0" 
          value={formData.base_price === undefined || formData.base_price === null ? '' : formData.base_price} 
          onChange={e => {
            const val = e.target.value;
            setFormData(f => ({ ...f, base_price: val === '' ? undefined : parseFloat(val) }));
          }} 
          required 
        />
        {errors.base_price && <div className="text-red-500 text-xs mt-1">{errors.base_price}</div>}
        <div className="text-gray-500 text-xs mt-1">Base cost per participant (required)</div>
      </div>
      <div>
        <Label htmlFor="max_participants">Max Participants *</Label>
        <Input 
          id="max_participants" 
          name="max_participants" 
          type="number" 
          min="1" 
          value={formData.max_participants === undefined || formData.max_participants === null ? '' : formData.max_participants} 
          onChange={e => {
            const val = e.target.value;
            setFormData(f => ({ ...f, max_participants: val === '' ? undefined : parseInt(val, 10) }));
          }} 
          required 
        />
        {errors.max_participants && <div className="text-red-500 text-xs mt-1">{errors.max_participants}</div>}
        <div className="text-gray-500 text-xs mt-1">Maximum number of participants allowed (required)</div>
      </div>
      <div>
        <Label htmlFor="status">Status</Label>
        <select 
          id="status" 
          name="status" 
          value={formData.status || TrekEventStatus.DRAFT} 
          onChange={e => setFormData(f => ({ ...f, status: e.target.value }))} 
          className="w-full p-2 border rounded"
        >
          <option value={TrekEventStatus.DRAFT}>Draft</option>
          <option value={TrekEventStatus.UPCOMING}>Upcoming</option>
          <option value={TrekEventStatus.OPEN_FOR_REGISTRATION}>Open for Registration</option>
          <option value={TrekEventStatus.CANCELLED}>Cancelled</option>
        </select>
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
  const getSelectedItemDetails = (itemId: number) => {
    const item = masterPackingList.find(i => i.id === itemId);
    if (!item) return { name: "Unknown Item", category: "N/A", mandatory: false };
    return { name: item.name, category: item.category || 'Misc', mandatory: mandatoryPackingItems.has(itemId) };
  };

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-lg">Review Your Trek Details</h3>
      
      {/* Trek Details Review */}
      <div className="p-4 border rounded-md bg-gray-50">
        <h4 className="font-semibold mb-2">General Information</h4>
        <p><strong>Name:</strong> {formData.name || 'N/A'}</p>
        <p><strong>Description:</strong> {formData.description || 'N/A'}</p>
        <p><strong>Location:</strong> {formData.location || 'N/A'}</p>
        <p><strong>Start Date:</strong> {formData.start_datetime ? new Date(formData.start_datetime).toLocaleString() : 'N/A'}</p>
        <p><strong>Cost:</strong> ₹{formData.base_price ?? '0'}</p>
        <p><strong>Max Participants:</strong> {formData.max_participants || 'N/A'}</p>
        <p><strong>Status:</strong> {formData.status || 'Draft'}</p>
        {imagePreview && <img src={imagePreview} alt="Trek" className="mt-2 w-full max-h-40 object-cover rounded"/>}
        {gpxFile && <div className="mt-2 text-sm text-green-700">GPX File: {gpxFile.name}</div>}
      </div>

      {/* Packing List Review */}
      <div className="p-4 border rounded-md bg-gray-50">
          <h4 className="font-semibold mb-2">Packing List</h4>
          {selectedPackingItems.size > 0 ? (
              <ul className="list-disc pl-5">
                  {Array.from(selectedPackingItems).map((id: number) => {
                      const itemDetails = getSelectedItemDetails(id);
                      return <li key={id}>{itemDetails.name} {itemDetails.mandatory && <strong>(Mandatory)</strong>}</li>;
                  })}
              </ul>
          ) : (
              <p>No packing items selected.</p>
          )}
      </div>
    </div>
  );
}

// Main Multi-Step Form
export default function CreateTrekMultiStepForm({ trekToEdit, onFormSubmit, onCancel }: CreateTrekMultiStepFormProps) {
  const { user } = useAuth();
  const { isVerified, isIndemnityAccepted, userType, loading: authLoading } = useUserVerificationStatus();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<AdminTrekEvent>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [gpxFile, setGpxFile] = useState<File | null>(null);
  const [gpxRouteData, setGpxRouteData] = useState<any>(null); // To store parsed GPX data

  // Packing List state
  const [selectedPackingItems, setSelectedPackingItems] = useState<Set<number>>(new Set());
  const [mandatoryPackingItems, setMandatoryPackingItems] = useState<Set<number>>(new Set());
  const [masterPackingList, setMasterPackingList] = useState<MasterPackingItem[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch master packing list once for the review step
    const fetchMasterListForReview = async () => {
        const { data, error } = await supabase.from('master_packing_items').select('id, name, category');
        if (data) setMasterPackingList(data);
    };
    fetchMasterListForReview();
  }, []);

  useEffect(() => {
    if (trekToEdit) {
      // Pre-fill form data from trekToEdit
      setFormData({
        ...trekToEdit,
        start_datetime: trekToEdit.start_datetime ? new Date(trekToEdit.start_datetime).toISOString().slice(0, 16) : '',
        end_datetime: trekToEdit.end_datetime ? new Date(trekToEdit.end_datetime).toISOString().slice(0, 16) : '',
      });
      if (trekToEdit.image_url) {
        setImagePreview(trekToEdit.image_url);
      }

      // Fetch assigned packing items for the trek being edited
      const fetchAssignedItems = async () => {
          const { data, error } = await supabase
              .from('trek_packing_list_assignments')
              .select('master_item_id, mandatory')
              .eq('trek_id', trekToEdit.trek_id);

          if (error) {
              console.error("Error fetching assigned packing items:", error);
              return;
          }

          const selectedIds = new Set<number>();
          const mandatoryIds = new Set<number>();
          data.forEach(item => {
              selectedIds.add(item.master_item_id);
              if (item.mandatory) {
                  mandatoryIds.add(item.master_item_id);
              }
          });
          setSelectedPackingItems(selectedIds);
          setMandatoryPackingItems(mandatoryIds);
      };
      fetchAssignedItems();
    }
  }, [trekToEdit]);

  function sanitizeLocation(location: any): string {
    if (typeof location === 'string') return location;
    if (location && typeof location === 'object' && typeof location.name === 'string') {
      return location.name;
    }
    return '';
  }

  const handleGpxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setGpxFile(file);
      // Optional: Parse GPX here to show a preview if needed
      // For simplicity, we'll just store the file and process on submit
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    if (!user) {
      toast({ title: "Authentication Error", description: "You must be logged in to create a trek.", variant: "destructive" });
      return;
    }
    if (!isVerified) {
      toast({ title: "Verification Required", description: "Your account must be verified to create treks.", variant: "destructive" });
      return;
    }

    setLoading(true);

    let imageUrl = trekToEdit?.image_url || null;
    if (imageFile) {
      const { data: imageData, error: imageError } = await supabase.storage
        .from('trek-assets')
        .upload(`${user.id}/${Date.now()}_${imageFile.name}`, imageFile);
      if (imageError) {
        toast({ title: "Image Upload Failed", description: imageError.message, variant: "destructive" });
        setLoading(false);
        return;
      }
      const { data: urlData } = supabase.storage.from('trek-assets').getPublicUrl(imageData.path);
      imageUrl = urlData.publicUrl;
    }

    let gpxFileUrl: string | null = null;
    if (gpxFile) {
        const { data: gpxData, error: gpxError } = await supabase.storage
            .from('trek-assets') // Use the same bucket for GPX files
            .upload(`gpx/${user.id}/${Date.now()}_${gpxFile.name}`, gpxFile);
        if (gpxError) {
            toast({ title: "GPX Upload Failed", description: gpxError.message, variant: "destructive" });
            setLoading(false);
            return;
        }
        const { data: urlData } = supabase.storage.from('trek-assets').getPublicUrl(gpxData.path);
        gpxFileUrl = urlData.publicUrl;
    }

    const trekDataToSubmit = {
      ...formData,
      image_url: imageUrl,
      gpx_file_url: gpxFileUrl, // Add GPX file URL to the data
      created_by: user.id,
      location: sanitizeLocation(formData.location), // Sanitize location
    };
    
    // Remove trek_id if it's a new trek
    if (!trekToEdit) {
      delete trekDataToSubmit.trek_id;
    }

    // This now calls the callback function passed in props
    try {
      await onFormSubmit({
        trekData: trekDataToSubmit,
        packingList: Array.from(selectedPackingItems).map(id => ({
          master_item_id: id,
          is_mandatory: mandatoryPackingItems.has(id),
        })),
      });
      toast({ title: "Success", description: `Trek ${trekToEdit ? 'updated' : 'created'} successfully!` });
    } catch (error: any) {
      console.error("Error submitting form from multi-step", error);
      toast({ title: "Submission Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { name: 'Trek Details', component: <TrekDetailsStep formData={formData} setFormData={setFormData} imagePreview={imagePreview} handleImageChange={handleImageChange} gpxFile={gpxFile} handleGpxChange={handleGpxChange} errors={errors} /> },
    { name: 'Packing List', component: <PackingListStep selectedItems={selectedPackingItems} setSelectedItems={setSelectedPackingItems} mandatoryItems={mandatoryPackingItems} setMandatoryItems={setMandatoryPackingItems} /> },
    { name: 'Review & Submit', component: <ReviewStep formData={formData} selectedPackingItems={selectedPackingItems} mandatoryPackingItems={mandatoryPackingItems} masterPackingList={masterPackingList} imagePreview={imagePreview} gpxFile={gpxFile} gpxRouteData={gpxRouteData} /> },
  ];

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!formData.name) newErrors.name = "Trek name is required.";
      if (!formData.start_datetime) newErrors.start_datetime = "Start date is required.";
      if (formData.base_price === undefined || formData.base_price === null) newErrors.base_price = "Base cost is required.";
      if (formData.max_participants === undefined || formData.max_participants === null) newErrors.max_participants = "Max participants is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(s => Math.min(s + 1, steps.length));
    }
  };
  const handlePrev = () => setStep(s => Math.max(s - 1, 1));

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{trekToEdit ? 'Edit Trek' : 'Create New Trek'}</DialogTitle>
          <DialogDescription>
            Step {step} of {steps.length}: {steps[step - 1].name}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[70vh] w-full p-4">
          <div className="p-1">{steps[step - 1].component}</div>
        </ScrollArea>
        <DialogFooter>
          <div className="flex justify-between w-full">
            <div>
              {step > 1 && <Button variant="outline" onClick={handlePrev}>Previous</Button>}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={onCancel}>Cancel</Button>
              {step < steps.length && <Button onClick={handleNext}>Next</Button>}
              {step === steps.length && <Button onClick={handleSubmit} disabled={loading}>{loading ? 'Submitting...' : 'Submit'}</Button>}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
