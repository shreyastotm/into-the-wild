import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/components/auth/AuthProvider';

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

const TrekEventsMicroCommunity: React.FC = () => {
  const { user, userProfile } = useAuth();
  const [treks, setTreks] = useState<TrekEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({});
  const [editId, setEditId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Micro-community users can only edit/delete their own treks, but all users should be able to view all treks elsewhere
    if (userProfile?.user_type === 'micro_community') {
      fetchMyEvents();
    }
  }, [user, userProfile]);

  async function fetchMyEvents() {
    setLoading(true);
    const { data, error } = await supabase
      .from('trek_events')
      .select('*')
      .eq('partner_id', user?.id)
      .order('start_datetime', { ascending: true });
    if (!error && data) setTreks(data);
    setLoading(false);
  }

  function resetForm() {
    setForm({});
    setEditId(null);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    setForm((prev: any) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value || ''
    }));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setForm((prev: any) => ({ ...prev, image: file }));
  }

  function formatDateForSupabase(dateStr: string) {
    if (!dateStr) return null;
    const [date, time] = dateStr.split('T');
    if (!date || !time) return dateStr;
    const timeMatch = time.match(/^\d{2}:\d{2}/);
    return timeMatch ? `${date}T${timeMatch[0]}` : dateStr;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    let image_url = '';
    if (form.image) {
      const fileExt = form.image.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage.from('trek-assets').upload(fileName, form.image);
      if (!uploadError && uploadData) {
        const { data: urlData } = supabase.storage.from('trek-assets').getPublicUrl(fileName);
        image_url = urlData.publicUrl;
      }
    }
    try {
      if (editId !== null && editId !== undefined) {
        // Update trek event
        const { error } = await supabase.from('trek_events').update({
          trek_name: form.trek_name,
          start_datetime: formatDateForSupabase(form.start_datetime),
          category: form.category,
          cost: form.cost,
          max_participants: form.max_participants,
          image_url: image_url || form.image_url || null,
        }).eq('trek_id', editId);
        if (error) {
          toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
        } else {
          await fetchMyEvents();
          toast({ title: 'Trek updated' });
          setOpen(false);
          resetForm();
        }
      }
    } catch (err) {
      toast({ title: 'Unexpected error', description: String(err), variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEdit(trek: TrekEvent) {
    setForm({ ...trek, image: null });
    setEditId(trek.trek_id);
    setOpen(true);
  }

  async function handleDelete(id: number) {
    setSubmitting(true);
    try {
      const { error } = await supabase.from('trek_events').delete().eq('trek_id', id);
      if (error) {
        toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
      } else {
        await fetchMyEvents();
        toast({ title: 'Trek deleted' });
      }
    } catch (err) {
      toast({ title: 'Unexpected error', description: String(err), variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  }

  if (!userProfile || userProfile.user_type !== 'micro_community') {
    // Only render edit/delete for micro-community users; others should not see this component (editing is restricted)
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">My Micro-Community Events</h2>
      {loading ? (
        <div>Loading...</div>
      ) : treks.length === 0 ? (
        <div>No events found for your micro-community.</div>
      ) : (
        <div className="space-y-4">
          {treks.map((trek) => (
            <Card key={trek.trek_id} className="p-4 flex flex-col md:flex-row items-center justify-between">
              <div>
                <div className="font-semibold text-lg">{trek.trek_name}</div>
                <div className="text-sm text-gray-600">{trek.start_datetime}</div>
                <div className="text-sm">Category: {trek.category}</div>
                <div className="text-sm">Max Participants: {trek.max_participants}</div>
              </div>
              <div className="flex gap-2 mt-2 md:mt-0">
                {/* Only allow edit/delete for micro-community's own treks */}
                <Button variant="outline" onClick={() => handleEdit(trek)}>Edit</Button>
                <Button variant="destructive" onClick={() => handleDelete(trek.trek_id)}>Delete</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
      {/* Dialog for editing treks remains unchanged */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogTitle>Edit Trek Event</DialogTitle>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Label>Trek Name
              <Input name="trek_name" value={form.trek_name || ''} onChange={handleInputChange} required />
            </Label>
            <Label>Start Datetime
              <Input name="start_datetime" type="datetime-local" value={form.start_datetime || ''} onChange={handleInputChange} required />
            </Label>
            <Label>Category
              <Input name="category" value={form.category || ''} onChange={handleInputChange} />
            </Label>
            <Label>Cost
              <Input name="cost" type="number" value={form.cost || 0} onChange={handleInputChange} />
            </Label>
            <Label>Max Participants
              <Input name="max_participants" type="number" value={form.max_participants || 1} onChange={handleInputChange} />
            </Label>
            <Label>Image
              <Input name="image" type="file" accept="image/*" onChange={handleFileChange} />
            </Label>
            <DialogFooter>
              <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save Changes'}</Button>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TrekEventsMicroCommunity;
