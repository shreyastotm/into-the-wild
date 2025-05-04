import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogFooter, DialogHeader, DialogClose } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/components/auth/AuthProvider';
import { getUniqueParticipantCount, formatCurrency } from '@/lib/utils';
import { PlusCircle, Edit, Trash, ExternalLink, AlertCircle, Users, PackageCheck } from 'lucide-react'; // Removed Image, X
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Database } from '@/integrations/supabase/types'; // Added Database import

// Define interface for Trek Event based on trek_events schema + necessary UI fields
interface TrekEvent {
  trek_id: number;
  name: string; // Changed from trek_name to match schema
  start_datetime: string;
  end_datetime: string; // Added from schema
  // image_url: string | null; // Removed - Column likely doesn't exist in schema
  category: string | null; // This seems to be UI-derived, not directly in trek_events
  cost: number; // This should map from base_price
  max_participants: number;
  event_creator_type: string; // UI-derived based on partner_id
  partner_id: string | null; // Matches schema
  description?: string | null; // Matches schema
  difficulty?: string | null; // Matches schema (used for duration in list?)
  // Fields from schema not necessarily used directly in TrekEvent list/card but needed for edit form
  location?: string | null;
  base_price?: number | null; // The actual schema field for cost
  status?: string | null;
  is_finalized?: boolean | null;
  // latitude?: number | null; // Removed - Not in trek_events
  // longitude?: number | null; // Removed - Not in trek_events
  destination_latitude?: number | null; // Keep destination coords
  destination_longitude?: number | null; // Keep destination coords

  // Fields NOT directly in trek_events schema, needed for UI/form
  duration?: string | null; // Seems UI derived from difficulty?
  pickup_time_window?: string | null; // Where does this come from?
  transport_mode?: string | null; // Where does this come from?
  cancellation_policy?: string | null; // Where does this come from?
}

// Define interface for the form state - aligned with trek_events schema
interface TrekEventForm {
  name: string; // Changed from trek_name
  start_datetime: string;
  end_datetime: string; // Added
  image: File | null; // Keep for upload handling, not direct DB field
  category: string; // Keep for form, but map from/to where?
  base_price: number | string; // Changed from cost, allow string for input
  max_participants: number | string; // Allow string for input
  partner_id: string | null;
  description: string;
  difficulty: string; // Changed from duration
  location: string; // Added
  status: string; // Added
  is_finalized: boolean; // Added
  // latitude?: number | string; // Removed
  // longitude?: number | string; // Removed
  destination_latitude?: number | string; // Keep optional destination coords
  destination_longitude?: number | string; // Keep optional destination coords
}

// Initial state for the form - aligned with TrekEventForm
const initialForm: TrekEventForm = {
  name: '',
  start_datetime: '',
  end_datetime: '', // Added
  image: null,
  category: '', // Still here, needs mapping
  base_price: '', // Changed from cost
  max_participants: 10,
  partner_id: null,
  description: '',
  difficulty: '', // Changed from duration
  location: '', // Added
  status: 'planned', // Added default
  is_finalized: false, // Added default
  // latitude: '', // Removed
  // longitude: '', // Removed
  destination_latitude: '', // Keep destination
  destination_longitude: '' // Keep destination
};

// Define interface for Partner (uses 'name' from users table)
interface Partner {
  user_id: string;
  name: string; // Changed from full_name
  // email: string; // Removed - Column doesn't exist
}

// Interface for master packing items from trek_packing_items
interface MasterPackingItem {
    item_id: number;
    name: string;
    // description: string | null; // Column doesn't exist based on migration ...0010...
    category: string | null;
}

const TrekEventsAdmin: React.FC = () => {
  const { user, userProfile } = useAuth();
  const isAdmin = userProfile?.user_type === 'admin';

  const [treks, setTreks] = useState<TrekEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<TrekEventForm>(initialForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [participantCounts, setParticipantCounts] = useState<Record<number, number>>({});

  const [masterPackingItems, setMasterPackingItems] = useState<MasterPackingItem[]>([]);
  const [selectedPackingItemIds, setSelectedPackingItemIds] = useState<Set<number>>(new Set());
  const [mandatoryItemIds, setMandatoryItemIds] = useState<Set<number>>(new Set());
  const [loadingPackingItems, setLoadingPackingItems] = useState(false);

  useEffect(() => {
    fetchTreks();
    if (isAdmin) {
      fetchPartners();
      fetchMasterPackingItems();
    }
  }, [isAdmin]);

  async function fetchPartners() {
    const { data, error } = await supabase
      .from('users')
      .select('user_id, name') // Removed email
      .eq('user_type', 'micro_community');

    if (!error && data) {
      setPartners(data as Partner[]); // Cast should be correct
    } else if (error) {
       console.error("Error fetching partners:", error);
    }
  }

  async function fetchTreks() {
    setLoading(true);
    const { data, error } = await supabase
      .from('trek_events')
      .select('*') // Fetch all columns
      .order('start_datetime', { ascending: true });

    if (!error && data) {
      // Map fetched data to the local TrekEvent interface for display/state
      const mappedTreks = data.map(trek => ({
        ...trek, // Spread existing fields first
        trek_id: trek.trek_id,
        name: trek.name,
        start_datetime: trek.start_datetime,
        end_datetime: trek.end_datetime,
        // image_url: trek.image_url, // Removed
        category: trek.difficulty || 'General', // Example: Derive category from difficulty
        cost: trek.base_price ?? 0, // Map base_price to cost for display
        max_participants: trek.max_participants ?? 0,
        event_creator_type: trek.partner_id ? 'Partner' : 'Admin', // Derive type
        partner_id: trek.partner_id,
        description: trek.description,
        difficulty: trek.difficulty,
        location: trek.location,
        base_price: trek.base_price,
        status: trek.status,
        is_finalized: trek.is_finalized,
        // latitude: trek.latitude, // Removed
        // longitude: trek.longitude, // Removed
        destination_latitude: trek.destination_latitude, // Keep
        destination_longitude: trek.destination_longitude, // Keep
        // Assign defaults or derive values for UI-only fields if needed
        duration: trek.difficulty ? `${trek.difficulty} day(s)` : null, // Example derivation
        pickup_time_window: null, // Assign default if not from DB
        transport_mode: null, // Assign default if not from DB
        cancellation_policy: null, // Assign default if not from DB
      })) as TrekEvent[]; // Cast the mapped result
      setTreks(mappedTreks);

      // Fetch participant counts
      const counts: Record<number, number> = {};
      await Promise.all(
        mappedTreks.map(async (trek) => { // Use mappedTreks
          const { count, error: countError } = await supabase
            .from('trek_registrations')
            .select('*', { count: 'exact', head: true })
            .eq('trek_id', trek.trek_id)
            .not('payment_status', 'eq', 'Cancelled');

          if (!countError) {
            counts[trek.trek_id] = count ?? 0;
          } else {
            console.error(`Error getting count for trek ${trek.trek_id}:`, countError);
            counts[trek.trek_id] = 0;
          }
        })
      );
      setParticipantCounts(counts);
    } else if(error) {
       console.error("Error fetching treks:", error);
       toast({ title: 'Error loading treks', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  }

  // --- Packing List Fetch Functions ---
  async function fetchMasterPackingItems() {
    setLoadingPackingItems(true);
    const { data, error } = await supabase
        .from('trek_packing_items')
        .select('item_id, name, category') // Removed non-existent description
        .order('name');

    if (!error && data) {
        // Cast should be correct now
        setMasterPackingItems(data as MasterPackingItem[]);
    } else {
        console.error("Error fetching master packing items:", error);
        toast({ title: 'Error Loading Master Packing Items', description: error?.message, variant: 'destructive' });
    }
    setLoadingPackingItems(false);
  }

  async function fetchTrekSpecificPackingList(trekId: number) {
      const { data, error } = await supabase
          .from('trek_packing_lists')
          .select('item_id, mandatory')
          .eq('trek_id', trekId);

      if (!error && data) {
          setSelectedPackingItemIds(new Set(data.map(item => item.item_id)));
          setMandatoryItemIds(new Set(data.filter(item => item.mandatory).map(item => item.item_id)));
      } else {
          console.error(`Error fetching packing list for trek ${trekId}:`, error);
          setSelectedPackingItemIds(new Set());
          setMandatoryItemIds(new Set());
      }
  }

  function resetForm() {
    setForm(initialForm);
    setEditId(null);
    setSelectedPackingItemIds(new Set());
    setMandatoryItemIds(new Set());
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    const isNumericField = name === 'base_price' || name === 'max_participants' || name === 'destination_latitude' || name === 'destination_longitude';
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' || isNumericField ? (value === '' ? '' : Number(value)) : value
    }));
  }

  function handleSelectChange(name: string, value: string) {
     setForm(prev => ({ ...prev, [name]: value }));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setForm(prev => ({ ...prev, image: file }));
  }

  // --- Packing List Change Handlers ---
  function handlePackingItemChange(itemId: number, checked: boolean) {
    setSelectedPackingItemIds(prev => {
        const newSet = new Set(prev);
        if (checked) {
            newSet.add(itemId);
        } else {
            newSet.delete(itemId);
            setMandatoryItemIds(mSet => {
                const newMSet = new Set(mSet);
                newMSet.delete(itemId);
                return newMSet;
            });
        }
        return newSet;
    });
  }

  function handleMandatoryChange(itemId: number, checked: boolean) {
      setMandatoryItemIds(prev => {
          const newSet = new Set(prev);
          if(checked) {
              newSet.add(itemId);
          } else {
              newSet.delete(itemId);
          }
          return newSet;
      });
  }

  function formatDateTimeLocal(isoString: string | null): string {
      if (!isoString) return '';
      try {
          // Assuming server stores in UTC, convert to local for input
          const date = new Date(isoString);
          if (isNaN(date.getTime())) return ''; // Invalid date check

          // Format to 'YYYY-MM-DDTHH:mm' which is required by datetime-local input
          // This manual formatting avoids timezone shifts during conversion for input value
          const year = date.getFullYear();
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const day = date.getDate().toString().padStart(2, '0');
          const hours = date.getHours().toString().padStart(2, '0');
          const minutes = date.getMinutes().toString().padStart(2, '0');

          return `${year}-${month}-${day}T${hours}:${minutes}`;
      } catch (error) {
          console.error("Error formatting date:", error);
          return '';
      }
  }


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isAdmin) return;
    setSubmitting(true);

    let uploadedImageUrl: string | null = null;
    if (form.image) {
      // Upload image logic (gets public URL from storage)
      const fileExt = form.image.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage.from('trek-assets').upload(fileName, form.image);
      if (uploadError) {
        toast({ title: 'Image upload failed', description: uploadError.message, variant: 'destructive' });
        setSubmitting(false);
        return;
      }
      const { data: urlData } = supabase.storage.from('trek-assets').getPublicUrl(fileName);
      uploadedImageUrl = urlData.publicUrl; // Store the URL from storage
      // Note: We are NOT saving this URL to the trek_events table itself
    }

    // Create object matching trek_events schema from form state
    // Explicitly define the type based on the Database generated type
    const trekDataToSubmit: Partial<Database['public']['Tables']['trek_events']['Row']> = {
        name: form.name,
        start_datetime: new Date(form.start_datetime).toISOString(),
        end_datetime: new Date(form.end_datetime).toISOString(),
        description: form.description || null,
        location: form.location || null,
        difficulty: form.difficulty || null,
        max_participants: form.max_participants ? Number(form.max_participants) : null,
        base_price: form.base_price ? Number(form.base_price) : null,
        status: form.status || 'planned',
        partner_id: form.partner_id || null,
        is_finalized: form.is_finalized || false,
        // latitude: form.latitude ? Number(form.latitude) : null, // Removed
        // longitude: form.longitude ? Number(form.longitude) : null, // Removed
        destination_latitude: form.destination_latitude ? Number(form.destination_latitude) : null, // Keep
        destination_longitude: form.destination_longitude ? Number(form.destination_longitude) : null, // Keep
        // image_url is NOT submitted here as the column likely doesn't exist
    };

    try {
      let error: any = null;
      let currentTrekId = editId;

      if (editId) {
        // Update existing trek
        const { error: updateError } = await supabase
          .from('trek_events')
          .update(trekDataToSubmit)
          .eq('trek_id', editId);
        error = updateError;
      } else {
        // Insert new trek
        const { data: insertData, error: insertError } = await supabase
          .from('trek_events')
          // Cast to Insert type to satisfy required fields check
          .insert(trekDataToSubmit as Database['public']['Tables']['trek_events']['Insert'])
          .select('trek_id') // Select the ID after insert
          .single();
        error = insertError;
        if (!error && insertData) {
             currentTrekId = insertData.trek_id; // Get the new ID
        } else if (!error && !insertData) {
            throw new Error("Failed to get new trek ID after creation."); // Should not happen with .single() unless error
        }
      }

      if (error) throw error;

      // --- Packing List Update Logic ---
      if (currentTrekId) {
        // Delete existing entries for this trek
        const { error: deleteError } = await supabase
            .from('trek_packing_lists')
            .delete()
            .eq('trek_id', currentTrekId);
        if (deleteError) throw deleteError;

        // Insert new entries based on selected items
        const itemsToInsert = Array.from(selectedPackingItemIds).map(itemId => ({
            trek_id: currentTrekId,
            item_id: itemId,
            mandatory: mandatoryItemIds.has(itemId) // Set mandatory status
        }));

        if (itemsToInsert.length > 0) {
            const { error: insertItemsError } = await supabase
                .from('trek_packing_lists')
                .insert(itemsToInsert);
            if (insertItemsError) throw insertItemsError;
        }
      }
      // --- End Packing List Update ---

      toast({ title: editId ? 'Trek Updated' : 'Trek Created', description: 'Your trek details have been saved.'});
      setOpen(false);
      resetForm();
      fetchTreks(); // Refresh the list

    } catch (error: any) {
      console.error("Error saving trek:", error);
      toast({ title: 'Save Failed', description: error.message || 'Could not save trek details.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEdit(trek: TrekEvent) {
    // Populate form with data matching the TrekEventForm structure
    setForm({
        name: trek.name ?? '', // Use name
        start_datetime: formatDateTimeLocal(trek.start_datetime),
        end_datetime: formatDateTimeLocal(trek.end_datetime), // Use end_datetime
        image: null, // Reset image file input
        category: trek.category ?? '', // Needs mapping?
        base_price: trek.base_price ?? '', // Use base_price
        max_participants: trek.max_participants ?? '',
        partner_id: trek.partner_id ?? null,
        description: trek.description ?? '',
        difficulty: trek.difficulty ?? '', // Use difficulty
        location: trek.location ?? '', // Added
        status: trek.status ?? 'planned', // Added
        is_finalized: trek.is_finalized ?? false, // Added
        // latitude: trek.latitude ?? '', // Removed
        // longitude: trek.longitude ?? '', // Removed
        destination_latitude: trek.destination_latitude ?? '', // Keep
        destination_longitude: trek.destination_longitude ?? '' // Keep
    });
    setEditId(trek.trek_id);
    fetchTrekSpecificPackingList(trek.trek_id);
    setOpen(true);
  }

  async function handleDelete(trekId: number) {
    if (!isAdmin) return;
    if (!confirm('Are you sure you want to delete this trek event? This cannot be undone.')) return;

    try {
      // Optionally delete related packing list items first if needed
      // await supabase.from('trek_packing_lists').delete().eq('trek_id', trekId);

      const { error } = await supabase
        .from('trek_events')
        .delete()
        .eq('trek_id', trekId);

      if (error) throw error;

      toast({ title: 'Trek Deleted', description: 'The trek event has been removed.'});
      fetchTreks(); // Refresh list
    } catch (error: any) {
      console.error("Error deleting trek:", error);
      toast({ title: 'Delete Failed', description: error.message || 'Could not delete trek.', variant: 'destructive' });
    }
  }

  // --- JSX RENDER PART ---
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Manage Trek Events</h2>
        {isAdmin && (
          <Dialog open={open} onOpenChange={(isOpen) => { setOpen(isOpen); if (!isOpen) resetForm(); }}>
            <DialogTrigger asChild>
              <Button> <PlusCircle className="mr-2 h-4 w-4" /> Create New Trek</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto"> {/* Increased width */}
              <DialogHeader>
                <DialogTitle>{editId ? 'Edit Trek Event' : 'Create New Trek Event'}</DialogTitle>
                <DialogDescription>
                  {editId ? 'Update the details for this trek.' : 'Enter the details for the new trek.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  {/* Form Fields Aligned with TrekEventForm */}
                  <div className="space-y-1">
                      <Label htmlFor="name">Trek Name</Label>
                      <Input id="name" name="name" value={form.name} onChange={handleInputChange} required />
                    </div>
                    {/* Start DateTime */}
                    <div className="space-y-1">
                      <Label htmlFor="start_datetime">Start Date & Time</Label>
                      <Input id="start_datetime" name="start_datetime" type="datetime-local" value={form.start_datetime} onChange={handleInputChange} required />
                    </div>
                    {/* End DateTime */}
                    <div className="space-y-1">
                      <Label htmlFor="end_datetime">End Date & Time</Label>
                      <Input id="end_datetime" name="end_datetime" type="datetime-local" value={form.end_datetime} onChange={handleInputChange} required />
                    </div>
                    {/* Location */}
                    <div className="space-y-1">
                      <Label htmlFor="location">Location</Label>
                      <Input id="location" name="location" value={form.location} onChange={handleInputChange} placeholder="e.g., Skandagiri Hills"/>
                    </div>
                    {/* Description */}
                    <div className="space-y-1">
                      <Label htmlFor="description">Description</Label>
                      <Input id="description" name="description" value={form.description} onChange={handleInputChange} />
                    </div>
                    {/* Difficulty */}
                    <div className="space-y-1">
                      <Label htmlFor="difficulty">Difficulty</Label>
                      <Input id="difficulty" name="difficulty" value={form.difficulty} onChange={handleInputChange} placeholder="e.g., Moderate, Difficult"/>
                    </div>
                    {/* Base Price */}
                    <div className="space-y-1">
                      <Label htmlFor="base_price">Base Price (INR)</Label>
                      <Input id="base_price" name="base_price" type="number" value={form.base_price} onChange={handleInputChange} required />
                    </div>
                    {/* Max Participants */}
                    <div className="space-y-1">
                      <Label htmlFor="max_participants">Max Participants</Label>
                      <Input id="max_participants" name="max_participants" type="number" value={form.max_participants} onChange={handleInputChange} required />
                    </div>
                    {/* Partner ID */}
                    <div className="space-y-1">
                      <Label htmlFor="partner_id">Partner (Optional)</Label>
                      <Select name="partner_id" value={form.partner_id || 'none'} onValueChange={(value) => handleSelectChange('partner_id', value === 'none' ? '' : value)}>
                          <SelectTrigger>
                              <SelectValue placeholder="Select Partner (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="none">-- None --</SelectItem>
                              {partners.map(partner => (
                                  <SelectItem key={partner.user_id} value={partner.user_id}>
                                      {partner.name} {/* Removed email display */}
                                  </SelectItem>
                              ))}
                          </SelectContent>
                      </Select>
                    </div>
                    {/* Status */}
                    <div className="space-y-1">
                      <Label htmlFor="status">Status</Label>
                      <Select name="status" value={form.status} onValueChange={(value) => handleSelectChange('status', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="planned">Planned</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="ongoing">Ongoing</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Destination Coordinates (Optional) */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="destination_latitude">Dest. Latitude (Optional)</Label>
                        <Input id="destination_latitude" name="destination_latitude" type="number" step="any" value={form.destination_latitude} onChange={handleInputChange} />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="destination_longitude">Dest. Longitude (Optional)</Label>
                        <Input id="destination_longitude" name="destination_longitude" type="number" step="any" value={form.destination_longitude} onChange={handleInputChange} />
                      </div>
                    </div>
                    {/* Is Finalized Checkbox */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="is_finalized"
                        name="is_finalized"
                        checked={form.is_finalized}
                        onCheckedChange={(checked) => setForm(prev => ({...prev, is_finalized: Boolean(checked)}))}
                      />
                      <Label htmlFor="is_finalized">Event Finalized?</Label>
                    </div>
                    {/* Image Upload Section - Not linked to DB column */}
                    <div className="space-y-1">
                       <Label htmlFor="image">Featured Image (Upload new to replace)</Label>
                       <Input id="image" name="image" type="file" onChange={handleFileChange} accept="image/*" />
                       {/* Cannot easily show current image preview without image_url */}
                    </div>

                    {/* Packing List Section */}
                    {editId !== null && ( // Only show packing list when editing
                        <>
                            <Separator className="my-4" />
                            <h4 className="font-medium mb-2">Packing List Items</h4>
                            {loadingPackingItems ? <p>Loading packing list...</p> :
                                <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                                    {masterPackingItems.map((item) => (
                                        <div key={item.item_id} className="flex items-center justify-between p-2 border rounded">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`item-${item.item_id}`}
                                                    checked={selectedPackingItemIds.has(item.item_id)}
                                                    onCheckedChange={(checked) => handlePackingItemChange(item.item_id, Boolean(checked))}
                                                />
                                                <Label htmlFor={`item-${item.item_id}`} className="cursor-pointer">
                                                    {item.name}
                                                </Label>
                                            </div>
                                            {selectedPackingItemIds.has(item.item_id) && (
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`mandatory-${item.item_id}`}
                                                        checked={mandatoryItemIds.has(item.item_id)}
                                                        onCheckedChange={(checked) => handleMandatoryChange(item.item_id, Boolean(checked))}
                                                    />
                                                    <Label htmlFor={`mandatory-${item.item_id}`} className="text-xs cursor-pointer">Mandatory</Label>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            }
                        </>
                    )}
                </div>
                <DialogFooter className="sm:col-span-2 mt-4">
                  <DialogClose asChild>
                     <Button type="button" variant="outline">Cancel</Button>
                   </DialogClose>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Saving...' : (editId ? 'Update Trek' : 'Create Trek')}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Trek List Display */}
      {loading ? (
        <p>Loading treks...</p>
      ) : treks.length === 0 ? (
        <p>No treks created yet.</p>
      ) : (
        <div className="space-y-4">
          {treks.map((trek) => (
            <Card key={trek.trek_id} className="flex flex-col sm:flex-row gap-4 p-4 items-start">
              {/* Image Removed */}
              <div className="flex-1">
                <div className="font-semibold text-lg mb-1">{trek.name}</div>
                <div className="text-xs text-muted-foreground space-y-0.5">
                  <p>ID: {trek.trek_id}</p>
                  <p>Starts: {format(new Date(trek.start_datetime), 'PPpp')}</p>
                  <p>Category: {trek.category || 'N/A'}</p>
                  <p>Cost: {formatCurrency(trek.cost)}</p>
                  <p>Capacity: {participantCounts[trek.trek_id] ?? '...'} / {trek.max_participants}</p>
                  <p>Status: <span className="capitalize">{trek.status}</span> {trek.is_finalized && <span className="text-green-600">(Finalized)</span>}</p>
                  {trek.partner_id && <p>Partner: {partners.find(p=>p.user_id === trek.partner_id)?.name || trek.partner_id}</p>}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
                {/* Action Buttons */}
                {isAdmin && (
                  <Button variant="outline" size="sm" onClick={() => handleEdit(trek)}>
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                )}
                {isAdmin && (
                   <Button variant="destructive" size="sm" onClick={() => handleDelete(trek.trek_id)}>
                     <Trash className="h-4 w-4 mr-1" /> Delete
                   </Button>
                )}
                 <a href={`/trek-events/${trek.trek_id}`} target="_blank" rel="noopener noreferrer">
                    <Button variant="secondary" size="sm">
                       <ExternalLink className="h-4 w-4 mr-1" /> View Details
                    </Button>
                 </a>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrekEventsAdmin;
