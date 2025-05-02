import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'; // Import Card components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Import Select components
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogFooter, DialogHeader, DialogClose } from '@/components/ui/dialog'; // Import Dialog components
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/components/auth/AuthProvider';
import { getUniqueParticipantCount } from '@/lib/utils';
import { PlusCircle, Edit, Trash, ExternalLink, Image as ImageIcon, AlertCircle } from 'lucide-react'; // Added icons
import { format } from 'date-fns'; // For date formatting
import { toZonedTime } from 'date-fns-tz'; // For timezone conversion

// Define interface for Trek Event
interface TrekEvent {
  trek_id: number;
  trek_name: string;
  start_datetime: string;
  image_url: string | null;
  category: string | null;
  cost: number;
  max_participants: number;
  event_creator_type: string;
  partner_id: string | null;
  // Include other fields as needed
  description?: string | null;
  duration?: string | null;
  pickup_time_window?: string | null;
  transport_mode?: string | null;
  cancellation_policy?: string | null;
}

// Define interface for the form state
interface TrekEventForm {
  trek_name: string;
  start_datetime: string;
  image: File | null;
  category: string;
  cost: number;
  max_participants: number;
  partner_id: string | null;
  description: string;
  duration: string;
  pickup_time_window: string;
  transport_mode: string;
  cancellation_policy: string;
}

// Initial state for the form
const initialForm: TrekEventForm = {
  trek_name: '',
  start_datetime: '',
  image: null,
  category: '',
  cost: 0,
  max_participants: 10, // Default value
  partner_id: null,
  description: '',
  duration: '',
  pickup_time_window: '',
  transport_mode: 'cars', // Default value
  cancellation_policy: ''
};

// Define interface for Partner
interface Partner {
  user_id: string;
  full_name: string;
  email: string;
}

const TrekEventsAdmin: React.FC = () => {
  const { user, userProfile } = useAuth();
  
  // Simplified admin check
  const isAdmin = userProfile?.user_type === 'admin';

  const [treks, setTreks] = useState<TrekEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false); // Dialog open state
  const [form, setForm] = useState<TrekEventForm>(initialForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [participantCounts, setParticipantCounts] = useState<Record<number, number>>({});

  useEffect(() => {
    fetchTreks();
    if (isAdmin) { // Only fetch partners if admin
      fetchPartners();
    }
  }, [isAdmin]);

  async function fetchPartners() {
    const { data, error } = await supabase
      .from('users')
      .select('user_id, full_name, email')
      .eq('user_type', 'micro_community');
      
    if (!error && data) {
      setPartners(data as Partner[]);
    } else if (error) {
       console.error("Error fetching partners:", error);
    }
  }

  async function fetchTreks() {
    setLoading(true);
    const { data, error } = await supabase
      .from('trek_events')
      .select('*') // Select all fields initially
      .order('start_datetime', { ascending: true });
      
    if (!error && data) {
      const validTreks = data.filter((t: any) => Number.isInteger(Number(t.trek_id)));
      setTreks(validTreks as TrekEvent[]);
      
      // Fetch participant counts
      const counts: Record<number, number> = {};
      await Promise.all(
        validTreks.map(async (trek: TrekEvent) => {
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

  function resetForm() {
    setForm(initialForm);
    setEditId(null);
    // Also reset file input if needed (might require direct DOM manipulation or key change)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    const isNumericField = name === 'cost' || name === 'max_participants';
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' || isNumericField ? (value === '' ? '' : Number(value)) : value
    }));
  }

  // Separate handler for Select component
  function handleSelectChange(name: string, value: string) {
     setForm(prev => ({ ...prev, [name]: value }));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setForm(prev => ({ ...prev, image: file }));
  }

  // Format date for datetime-local input
  function formatDateTimeLocal(isoString: string | null): string {
      if (!isoString) return '';
      try {
          const date = new Date(isoString);
          if (isNaN(date.getTime())) return '';
          // Format to YYYY-MM-DDTHH:mm (required by input type=datetime-local)
          const year = date.getFullYear();
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const day = date.getDate().toString().padStart(2, '0');
          const hours = date.getHours().toString().padStart(2, '0');
          const minutes = date.getMinutes().toString().padStart(2, '0');
          return `${year}-${month}-${day}T${hours}:${minutes}`;
      } catch (e) {
          console.error("Error formatting date:", isoString, e);
          return '';
      }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isAdmin) {
       toast({ title: 'Permission Denied', description: 'Only admins can create or modify events.', variant: 'destructive' });
       return;
    }
    setSubmitting(true);
    
    let imageUrl = editId !== null ? treks.find(t => t.trek_id === editId)?.image_url || null : null;
    
    // Upload new image if provided
    if (form.image) {
      const fileExt = form.image.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage.from('trek-assets').upload(fileName, form.image);
      
      if (uploadError) {
        toast({ title: 'Image upload failed', description: uploadError.message, variant: 'destructive' });
        setSubmitting(false);
        return;
      }
      const { data: urlData } = supabase.storage.from('trek-assets').getPublicUrl(fileName);
      imageUrl = urlData.publicUrl;
    }

    // Prepare data payload
    const payload: Omit<TrekEvent, 'trek_id'> = {
        trek_name: form.trek_name,
        start_datetime: new Date(form.start_datetime).toISOString(), // Convert local time to ISO string
        category: form.category || null,
        cost: Number(form.cost) || 0,
        max_participants: Number(form.max_participants) || 1,
        event_creator_type: form.partner_id ? 'external' : 'internal',
        partner_id: form.partner_id || null,
        image_url: imageUrl,
        // Include other form fields
        description: form.description || null,
        duration: form.duration || null,
        pickup_time_window: form.pickup_time_window || null,
        transport_mode: form.transport_mode || null,
        cancellation_policy: form.cancellation_policy || null,
    };

    try {
      if (editId !== null) {
        // Update existing trek
        const { error } = await supabase
          .from('trek_events')
          .update(payload)
          .eq('trek_id', editId);
          
        if (error) throw error;
        toast({ title: 'Trek Event Updated', variant: 'success' });
      } else {
        // Create new trek
        const { error } = await supabase
          .from('trek_events')
          .insert(payload);
          
        if (error) throw error;
        toast({ title: 'Trek Event Created', variant: 'success' });
      }
      
      setOpen(false); // Close dialog
      resetForm();
      await fetchTreks(); // Refresh list
      
    } catch (error: any) {
      console.error('Error submitting trek event:', error);
      toast({ 
         title: editId ? 'Update Failed' : 'Creation Failed', 
         description: error.message, 
         variant: 'destructive' 
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEdit(trek: TrekEvent) {
     setEditId(trek.trek_id);
     setForm({
        trek_name: trek.trek_name || '',
        start_datetime: formatDateTimeLocal(trek.start_datetime), // Format for input
        image: null, // Don't prefill file input
        category: trek.category || '',
        cost: trek.cost ?? 0,
        max_participants: trek.max_participants ?? 10,
        partner_id: trek.partner_id || null,
        description: trek.description || '',
        duration: trek.duration || '',
        pickup_time_window: trek.pickup_time_window || '',
        transport_mode: trek.transport_mode || 'cars',
        cancellation_policy: trek.cancellation_policy || ''
     });
     setOpen(true); // Open the dialog
  }

  async function handleDelete(trekId: number) {
     if (!isAdmin) {
       toast({ title: 'Permission Denied', description: 'Only admins can delete events.', variant: 'destructive' });
       return;
    }
    
    // Basic confirmation - consider a modal for better UX
    if (!window.confirm(`Are you sure you want to delete trek event #${trekId}? This may affect related data.`)) {
       return;
    }

    try {
      setSubmitting(true); // Reuse submitting state for delete
      
      // Add checks/deletes for dependent data (registrations, comments, packing lists etc.) if needed
      // Example: Delete associated packing list items first
       const { error: packingError } = await supabase
         .from('trek_packing_lists') // Assuming this table links treks and items
         .delete()
         .eq('trek_id', trekId);
      
      if(packingError) {
         console.warn("Could not delete associated packing items:", packingError);
         // Decide if deletion should proceed or stop
      }
      
      // Now delete the trek event
      const { error } = await supabase
        .from('trek_events')
        .delete()
        .eq('trek_id', trekId);
        
      if (error) throw error;
      
      toast({ title: 'Trek Event Deleted', variant: 'success' });
      await fetchTreks(); // Refresh list
      
    } catch (error: any) {
       console.error('Error deleting trek event:', error);
       toast({ title: 'Delete Failed', description: error.message, variant: 'destructive' });
    } finally {
       setSubmitting(false);
    }
  }

   // Only render if admin
   if (!isAdmin) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><AlertCircle className="h-5 w-5 text-destructive"/> Access Denied</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">You do not have permission to manage Trek Events.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>Manage Trek Events</CardTitle>
        <Button onClick={() => { resetForm(); setOpen(true); }} className="gap-1">
          <PlusCircle className="h-4 w-4" /> Add Trek Event
        </Button>
      </CardHeader>
      <CardContent>
         {/* Dialog for Add/Edit */} 
         <Dialog open={open} onOpenChange={(isOpen) => { setOpen(isOpen); if (!isOpen) resetForm(); }}>
           <DialogContent className="sm:max-w-[600px]">
             <DialogHeader>
               <DialogTitle>{editId ? 'Edit Trek Event' : 'Add New Trek Event'}</DialogTitle>
               <DialogDescription>
                  {editId ? 'Update the details below.' : 'Fill in the details for the new trek event.'}
               </DialogDescription>
             </DialogHeader>
             <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 max-h-[70vh] overflow-y-auto px-2">
                {/* Form Fields */} 
                <div className="sm:col-span-2">
                  <Label htmlFor="trek_name">Trek Name</Label>
                  <Input id="trek_name" name="trek_name" value={form.trek_name} onChange={handleInputChange} required />
                </div>
                <div>
                  <Label htmlFor="start_datetime">Start Date & Time</Label>
                  <Input id="start_datetime" type="datetime-local" name="start_datetime" value={form.start_datetime} onChange={handleInputChange} required />
                </div>
                 <div>
                  <Label htmlFor="category">Category</Label>
                  <Input id="category" name="category" value={form.category} onChange={handleInputChange} placeholder="e.g., Weekend, Advanced" />
                </div>
                 <div>
                  <Label htmlFor="cost">Cost (INR)</Label>
                  <Input id="cost" type="number" name="cost" value={form.cost} onChange={handleInputChange} required min={0} />
                </div>
                 <div>
                  <Label htmlFor="max_participants">Max Participants</Label>
                  <Input id="max_participants" type="number" name="max_participants" value={form.max_participants} onChange={handleInputChange} required min={1} />
                </div>
                 
                <div className="sm:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea 
                     id="description" 
                     name="description" 
                     value={form.description} 
                     onChange={handleInputChange} 
                     rows={3}
                     className="w-full border rounded px-2 py-1 text-sm" // Basic styling for textarea
                     placeholder="Detailed description of the trek..."
                  />
                </div>
                 
                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <Input id="duration" name="duration" value={form.duration} onChange={handleInputChange} placeholder="e.g., 2 Days / 1 Night" />
                </div>
                 <div>
                  <Label htmlFor="pickup_time_window">Pickup Time Window</Label>
                  <Input id="pickup_time_window" name="pickup_time_window" value={form.pickup_time_window} onChange={handleInputChange} placeholder="e.g., 6:00 AM - 6:30 AM" />
                </div>
                 
                <div>
                  <Label htmlFor="transport_mode">Transport Mode</Label>
                   <Select name="transport_mode" value={form.transport_mode} onValueChange={(value) => handleSelectChange('transport_mode', value)}>
                     <SelectTrigger>
                       <SelectValue placeholder="Select transport" />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="cars">Cars</SelectItem>
                       <SelectItem value="mini_van">Mini Van</SelectItem>
                       <SelectItem value="bus">Bus</SelectItem>
                       <SelectItem value="self">Self (No organised transport)</SelectItem>
                     </SelectContent>
                   </Select>
                </div>
                 
                 <div>
                   <Label htmlFor="image">Cover Image</Label>
                   <Input id="image" type="file" accept="image/*" name="image" onChange={handleFileChange} />
                   {/* Show current image if editing? */} 
                 </div>
                 
                 <div className="sm:col-span-2">
                   <Label htmlFor="cancellation_policy">Cancellation Policy</Label>
                   <textarea 
                      id="cancellation_policy" 
                      name="cancellation_policy" 
                      value={form.cancellation_policy} 
                      onChange={handleInputChange} 
                      rows={3}
                      className="w-full border rounded px-2 py-1 text-sm" 
                      placeholder="Details about refunds and cancellations..."
                   />
                 </div>

                {/* Partner Assignment (Admin only) */} 
                {isAdmin && (
                    <div className="sm:col-span-2">
                      <Label htmlFor="partner_id">Assign to Micro-Community (optional)</Label>
                      <Select name="partner_id" value={form.partner_id || ''} onValueChange={(value) => handleSelectChange('partner_id', value === '' ? null : value)}>
                         <SelectTrigger>
                            <SelectValue placeholder="Select Partner..." />
                         </SelectTrigger>
                         <SelectContent>
                            <SelectItem value="">-- Into the Wild (Internal) --</SelectItem>
                            {partners.map(p => (
                              <SelectItem key={p.user_id} value={p.user_id}>
                                {p.full_name}{p.email ? ` (${p.email})` : ''}
                              </SelectItem>
                            ))}
                         </SelectContent>
                      </Select>
                    </div>
                )}
                
                 <DialogFooter className="sm:col-span-2 mt-4">
                    <DialogClose asChild>
                        <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                    </DialogClose>
                    <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : (editId ? 'Update Event' : 'Create Event')}</Button>
                 </DialogFooter>
             </form>
           </DialogContent>
         </Dialog>
         
         {/* Trek List Table/Cards */} 
         {loading ? (
           <div className="text-center py-8 text-muted-foreground">Loading events...</div>
         ) : treks.length === 0 ? (
           <div className="text-center py-8 text-muted-foreground">No trek events found. Click 'Add Trek Event' to create one.</div>
         ) : (
           <div className="space-y-4">
             {treks.map(trek => (
               <Card key={trek.trek_id} className="p-4 flex flex-col sm:flex-row gap-4 items-start">
                 {/* Image */} 
                 <div className="w-full sm:w-32 h-24 flex-shrink-0 bg-muted rounded overflow-hidden border">
                   {trek.image_url ? (
                     <img src={trek.image_url} alt={trek.trek_name} className="w-full h-full object-cover" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <ImageIcon className="h-8 w-8" />
                     </div>
                   )}
                 </div>
                 {/* Details */} 
                 <div className="flex-1">
                   <div className="font-semibold text-lg mb-1">{trek.trek_name}</div>
                   <div className="text-xs text-muted-foreground space-y-0.5">
                     <p>ID: {trek.trek_id}</p>
                     <p>Category: {trek.category || 'N/A'}</p>
                     <p>Starts: {format(toZonedTime(new Date(trek.start_datetime), 'Asia/Kolkata'), 'PPpp')} IST</p>
                     <p>Cost: {formatCurrency(trek.cost)} | Max: {trek.max_participants} | Current: {participantCounts[trek.trek_id] ?? 'N/A'}</p>
                     <p>Type: {trek.event_creator_type}{trek.partner_id ? ` (Partner ID: ${trek.partner_id})` : ' (Internal)'}</p>
                   </div>
                 </div>
                 {/* Actions */} 
                 <div className="flex flex-row sm:flex-col gap-2 flex-shrink-0 mt-2 sm:mt-0">
                   <Button variant="outline" size="sm" onClick={() => handleEdit(trek)} className="gap-1">
                      <Edit className="h-3.5 w-3.5" /> Edit
                   </Button>
                   <Button variant="destructive" size="sm" onClick={() => handleDelete(trek.trek_id)} className="gap-1">
                     <Trash className="h-3.5 w-3.5" /> Delete
                   </Button>
                   <Button variant="ghost" size="sm" asChild className="gap-1">
                       <a href={`/trek-events/${trek.trek_id}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3.5 w-3.5" /> View
                       </a>
                   </Button>
                 </div>
               </Card>
             ))}
           </div>
         )}
      </CardContent>
    </Card>
  );
};

export default TrekEventsAdmin;
