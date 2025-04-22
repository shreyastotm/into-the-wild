import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/components/auth/AuthProvider';
import { getUniqueParticipantCount } from '@/lib/utils';

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
}

interface TrekEventForm {
  trek_name: string;
  start_datetime: string;
  image: File | null;
  category: string;
  cost: number;
  max_participants: number;
  partner_id: string | null;
}

const initialForm: TrekEventForm = {
  trek_name: '',
  start_datetime: '',
  image: null,
  category: '',
  cost: 0,
  max_participants: 1,
  partner_id: null,
};

const TrekEventsAdmin: React.FC = () => {
  const { user, userProfile } = useAuth();
  // Defensive: fallback for missing or invalid user_type in profile
  const validTypes = ['admin', 'micro_community', 'trekker'];
  const adminEmails = ["shreyasmadhan82@gmail.com"];
  const isAdmin = (userProfile && validTypes.includes(userProfile.user_type) && userProfile.user_type === 'admin') || (userProfile?.email && adminEmails.includes(userProfile.email));

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center text-red-600">
        <h2 className="text-xl font-semibold mb-2">Only admins can create or assign trek events.</h2>
        <p className="mb-4">If you are a micro-community, please contact admin for event assignment.</p>
      </div>
    );
  }

  const [treks, setTreks] = useState<TrekEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<TrekEventForm>(initialForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [partners, setPartners] = useState<{user_id: string, full_name: string, email: string}[]>([]);
  const [participantCounts, setParticipantCounts] = useState<Record<number, number>>({});

  useEffect(() => {
    fetchTreks();
    async function fetchPartners() {
      const { data, error } = await supabase
        .from('users')
        .select('user_id, full_name, email')
        .eq('user_type', 'micro_community');
      if (!error && data) setPartners(data);
    }
    fetchPartners();
  }, []);

  async function fetchTreks() {
    setLoading(true);
    const { data, error } = await supabase
      .from('trek_events')
      .select('trek_id, trek_name, start_datetime, image_url, category, cost, max_participants, event_creator_type, partner_id')
      .order('start_datetime', { ascending: true });
    if (!error && data) {
      // Defensive: filter out trek events with non-integer trek_id
      const filteredTreks = data.filter((t: any) => Number.isInteger(Number(t.trek_id)));
      setTreks(filteredTreks);
      // Fetch participant counts for each trek
      const counts: Record<number, number> = {};
      await Promise.all(
        filteredTreks.map(async (trek: any) => {
          const { data: regs, error: regsError } = await supabase
            .from('trek_registrations')
            .select('user_id, payment_status')
            .eq('trek_id', trek.trek_id)
            .not('payment_status', 'eq', 'Cancelled');
          if (!regsError && regs) {
            counts[trek.trek_id] = getUniqueParticipantCount(regs);
          } else {
            counts[trek.trek_id] = 0;
          }
        })
      );
      setParticipantCounts(counts);
    }
    setLoading(false);
  }

  function resetForm() {
    setForm(initialForm);
    setEditId(null);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' || name === 'cost' || name === 'max_participants' ? Number(value) : value || ''
    }));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setForm(prev => ({ ...prev, image: file }));
  }

  function formatDateForSupabase(dateStr: string) {
    if (!dateStr) return null;
    // Accepts 'yyyy-MM-ddTHH:mm' or ISO string
    // Converts to 'yyyy-MM-ddTHH:mm:ss' (or without seconds if not needed)
    // Remove timezone if present
    const [date, time] = dateStr.split('T');
    if (!date || !time) return dateStr;
    // time may include seconds or timezone, take only hh:mm or hh:mm:ss
    const timeMatch = time.match(/^(\d{2}:\d{2})(?::\d{2})?/);
    return timeMatch ? `${date}T${timeMatch[0]}` : dateStr;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    let image_url = '';
    if (form.image) {
      // Upload image to Supabase Storage
      const fileExt = form.image.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage.from('trek-assets').upload(fileName, form.image);
      if (uploadError) {
        toast({ title: 'Image upload failed', description: uploadError.message, variant: 'destructive' });
        setSubmitting(false);
        return;
      }
      const { data: urlData } = supabase.storage.from('trek-assets').getPublicUrl(fileName);
      image_url = urlData.publicUrl;
    }

    // Log session and user info
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    console.log('[handleSubmit] Current user:', user, 'User error:', userError);
    console.log('[handleSubmit] Session data:', sessionData, 'Session error:', sessionError);

    try {
      const event_creator_type = form.partner_id ? 'external' : 'internal';
      const partner_id = form.partner_id || null;
      if (editId !== null && editId !== undefined) {
        // Defensive: ensure editId is integer and matches a trek event
        const trekIdNum = Number(editId);
        if (!Number.isInteger(trekIdNum)) {
          toast({ title: 'Update failed', description: `Invalid trek_id (${editId}). It must be an integer.`, variant: 'destructive' });
          setSubmitting(false);
          return;
        }
        // Update trek event
        const { error, data, count } = await supabase.from('trek_events').update({
          trek_name: form.trek_name,
          start_datetime: formatDateForSupabase(form.start_datetime),
          category: form.category,
          cost: form.cost,
          max_participants: form.max_participants,
          event_creator_type,
          partner_id,
          ...(image_url ? { image_url } : {}),
        }).eq('trek_id', trekIdNum).select();
        console.log('UPDATE payload:', {
          trek_name: form.trek_name,
          start_datetime: formatDateForSupabase(form.start_datetime),
          category: form.category,
          cost: form.cost,
          max_participants: form.max_participants,
          event_creator_type,
          partner_id,
          ...(image_url ? { image_url } : {}),
        }, 'response:', data, error, 'editId:', editId, 'trekIdNum:', trekIdNum, 'user:', user, 'session:', sessionData);
        if (error) {
          console.error('Supabase update error:', error);
          toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
        } else if (!data || data.length === 0) {
          toast({ title: 'Update failed', description: 'No trek event was updated. Please check if the event exists.', variant: 'destructive' });
        } else {
          await fetchTreks();
          toast({ title: 'Trek updated' });
          setOpen(false);
          resetForm();
        }
      } else {
        // Create trek event
        const { data, error } = await supabase.from('trek_events').insert({
          trek_name: form.trek_name,
          start_datetime: formatDateForSupabase(form.start_datetime),
          category: form.category,
          cost: form.cost,
          max_participants: form.max_participants,
          event_creator_type,
          partner_id,
          image_url: image_url || null,
        }).select();
        console.log('INSERT payload:', {
          trek_name: form.trek_name,
          start_datetime: formatDateForSupabase(form.start_datetime),
          category: form.category,
          cost: form.cost,
          max_participants: form.max_participants,
          event_creator_type,
          partner_id,
          image_url: image_url || null,
        }, 'response:', data, error);
        if (error) {
          console.error('Supabase insert error:', error, form, {
            trek_name: form.trek_name,
            start_datetime: formatDateForSupabase(form.start_datetime),
            category: form.category,
            cost: form.cost,
            max_participants: form.max_participants,
            event_creator_type,
            partner_id,
            image_url: image_url || null,
          });
          toast({ title: 'Creation failed', description: error.message, variant: 'destructive' });
        } else {
          await fetchTreks();
          toast({ title: 'Trek created' });
          setOpen(false);
          resetForm();
        }
      }
    } catch (err) {
      console.error('Unexpected error in handleSubmit:', err);
      toast({ title: 'Unexpected error', description: String(err), variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEdit(trek: TrekEvent) {
    setForm({
      trek_name: trek.trek_name,
      start_datetime: trek.start_datetime,
      image: null,
      category: trek.category || '',
      cost: trek.cost,
      max_participants: trek.max_participants,
      partner_id: trek.partner_id || null,
    });
    setEditId(trek.trek_id);
    setOpen(true);
  }

  async function handleDelete(id: number | string) {
    console.log('[handleDelete] Received id:', id, 'Type:', typeof id);

    // Ensure trek_id is a valid integer
    const trekIdNum = Number(id);
    console.log('[handleDelete] After Number():', trekIdNum, 'Type:', typeof trekIdNum);

    // Check if the id is a valid integer
    if (!id || isNaN(trekIdNum) || !Number.isInteger(trekIdNum)) {
      toast({
        title: 'Delete failed',
        description: `Invalid trek_id (${id}). It must be an integer.`,
        variant: 'destructive'
      });
      return;
    }

    try {
      setSubmitting(true);
      // First check if there are any records in trek_packing_lists
      const { data: packingListData, error: packingListSelectError } = await supabase
        .from('trek_packing_lists')
        .select('*')
        .eq('trek_id', trekIdNum);
      if (packingListSelectError) {
        console.error('Packing list select error:', packingListSelectError);
        toast({
          title: 'Packing list select failed',
          description: packingListSelectError.message,
          variant: 'destructive'
        });
        setSubmitting(false);
        return;
      }
      // If there are records, delete them
      if (packingListData && packingListData.length > 0) {
        const { error: packingListDeleteError } = await supabase
          .from('trek_packing_lists')
          .delete()
          .eq('trek_id', trekIdNum);
        if (packingListDeleteError) {
          console.error('Packing list delete error:', packingListDeleteError);
          toast({
            title: 'Packing list delete failed',
            description: packingListDeleteError.message,
            variant: 'destructive'
          });
          setSubmitting(false);
          return;
        }
      }
      // Now delete the trek event
      const { error } = await supabase
        .from('trek_events')
        .delete()
        .eq('trek_id', trekIdNum);
      if (error) {
        toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
      } else {
        await fetchTreks();
        toast({ title: 'Trek deleted' });
      }
    } catch (err) {
      console.error('Unexpected error in handleDelete:', err);
      toast({
        title: 'Unexpected error',
        description: String(err),
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Trek Events Admin</h2>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => { setOpen(true); resetForm(); }}>
          + Add Trek Event
        </Button>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogTitle>{editId ? 'Edit Trek Event' : 'Add Trek Event'}</DialogTitle>
          <DialogDescription>
            {editId ? 'Edit the details of your trek event and save changes.' : 'Fill in the details to create a new trek event.'}
          </DialogDescription>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="trek_name">Trek Name</Label>
              <Input name="trek_name" value={form.trek_name} onChange={handleInputChange} required />
            </div>
            <div>
              <Label htmlFor="start_datetime">Start Date & Time</Label>
              <Input type="datetime-local" name="start_datetime" value={form.start_datetime} onChange={handleInputChange} required />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Input name="category" value={form.category} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="cost">Cost</Label>
              <Input type="number" name="cost" value={form.cost} onChange={handleInputChange} required min={0} />
            </div>
            <div>
              <Label htmlFor="max_participants">Max Participants</Label>
              <Input type="number" name="max_participants" value={form.max_participants} onChange={handleInputChange} required min={1} />
            </div>
            <div>
              <Label htmlFor="image">Image</Label>
              <Input type="file" accept="image/*" name="image" onChange={handleFileChange} />
            </div>
            <div>
              <Label htmlFor="partner_id">Assign to Micro-Community (optional)</Label>
              <select
                id="partner_id"
                value={form.partner_id || ''}
                onChange={e => setForm(f => ({ ...f, partner_id: e.target.value || null }))}
                className="block w-full border rounded px-2 py-1 mb-4"
              >
                <option value="">Into the Wild (default)</option>
                {partners.map(p => (
                  <option key={p.user_id} value={p.user_id}>
                    {p.full_name}{p.email ? ` (${p.email})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={submitting}>{editId ? 'Update' : 'Create'}</Button>
              <Button type="button" variant="secondary" onClick={() => { setOpen(false); resetForm(); }}>Cancel</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-4">
          {treks.map(trek => (
            <Card key={trek.trek_id} className="p-4 flex gap-4 items-center">
              <div className="w-32 h-20 flex items-center justify-center bg-gray-100 border rounded overflow-hidden">
                {trek.image_url ? (
                  <img
                    src={trek.image_url}
                    alt={trek.trek_name}
                    className="object-cover w-full h-full"
                    onError={e => { (e.target as HTMLImageElement).src = '/no-image.png'; }}
                  />
                ) : (
                  <img
                    src="/no-image.png"
                    alt="No Image"
                    className="object-cover w-full h-full"
                  />
                )}
              </div>
              <div className="flex-1">
                <div className="font-semibold">{trek.trek_name}</div>
                <div className="text-xs text-gray-500 mb-1">{trek.category || 'No Category'}</div>
                <div className="text-xs text-gray-500">{new Date(trek.start_datetime).toLocaleString()}</div>
                <div className="text-xs text-gray-500">Cost: ₹{trek.cost}</div>
                <div className="text-xs text-gray-500">Max Participants: {trek.max_participants}</div>
                <div className="text-xs text-gray-500">Current Participants: {participantCounts[trek.trek_id] ?? 0}</div>
                {trek.image_url && (
                  <div className="break-all text-xs mt-1">
                    <span className="font-mono">{trek.image_url}</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(trek)}>Edit</Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(trek.trek_id)}>Delete</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrekEventsAdmin;
