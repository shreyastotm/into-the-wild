import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';

interface TrekEvent {
  trek_id: number;
  trek_name: string;
  start_datetime: string;
  image_url: string | null;
  category: string | null;
  cost: number;
}

interface TrekEventForm {
  trek_name: string;
  start_datetime: string;
  image: File | null;
  category: string;
  cost: number;
}

const initialForm: TrekEventForm = {
  trek_name: '',
  start_datetime: '',
  image: null,
  category: '',
  cost: 0,
};

const TrekEventsAdmin: React.FC = () => {
  const [treks, setTreks] = useState<TrekEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<TrekEventForm>(initialForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTreks();
  }, []);

  async function fetchTreks() {
    setLoading(true);
    const { data, error } = await supabase
      .from('trek_events')
      .select('trek_id, trek_name, start_datetime, image_url, category, cost')
      .order('start_datetime', { ascending: true });
    if (!error && data) setTreks(data);
    setLoading(false);
  }

  function resetForm() {
    setForm(initialForm);
    setEditId(null);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setForm(prev => ({ ...prev, image: file }));
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

    if (editId) {
      // Update trek event
      const { error } = await supabase.from('trek_events').update({
        trek_name: form.trek_name,
        start_datetime: form.start_datetime,
        category: form.category,
        cost: form.cost,
        ...(image_url ? { image_url } : {}),
      }).eq('trek_id', editId);
      if (error) {
        toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Trek updated' });
        fetchTreks();
        setOpen(false);
        resetForm();
      }
    } else {
      // Create trek event
      const { error } = await supabase.from('trek_events').insert({
        trek_name: form.trek_name,
        start_datetime: form.start_datetime,
        category: form.category,
        cost: form.cost,
        image_url: image_url || null,
      });
      if (error) {
        toast({ title: 'Creation failed', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Trek created' });
        fetchTreks();
        setOpen(false);
        resetForm();
      }
    }
    setSubmitting(false);
  }

  async function handleEdit(trek: TrekEvent) {
    setForm({
      trek_name: trek.trek_name,
      start_datetime: trek.start_datetime,
      image: null,
      category: trek.category || '',
      cost: trek.cost,
    });
    setEditId(trek.trek_id);
    setOpen(true);
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Delete this trek event?')) return;
    const { error } = await supabase.from('trek_events').delete().eq('trek_id', id);
    if (error) {
      toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Trek deleted' });
      fetchTreks();
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
              <Label htmlFor="image">Image</Label>
              <Input type="file" accept="image/*" name="image" onChange={handleFileChange} />
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
