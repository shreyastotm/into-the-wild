import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export default function PackingItemsAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    setLoading(true);
    const { data, error } = await supabase.from('trek_packing_items').select('*').order('item_id');
    if (error) toast({ title: 'Error loading items', description: error.message, variant: 'destructive' });
    setItems(data || []);
    setLoading(false);
  }

  async function addItem() {
    if (!newName.trim()) return;
    const { error } = await supabase.from('trek_packing_items').insert({ name: newName.trim() });
    if (error) toast({ title: 'Add failed', description: error.message, variant: 'destructive' });
    else toast({ title: 'Item added!' });
    setNewName('');
    fetchItems();
  }

  async function deleteItem(id: number) {
    const { error } = await supabase.from('trek_packing_items').delete().eq('item_id', id);
    if (error) toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
    else toast({ title: 'Item deleted!' });
    fetchItems();
  }

  async function startEdit(id: number, name: string) {
    setEditingId(id);
    setEditingName(name);
  }

  async function saveEdit() {
    if (!editingName.trim() || editingId === null) return;
    const { error } = await supabase.from('trek_packing_items').update({ name: editingName.trim() }).eq('item_id', editingId);
    if (error) toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
    else toast({ title: 'Item updated!' });
    setEditingId(null);
    setEditingName('');
    fetchItems();
  }

  return (
    <div className="max-w-lg mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Packing Items Admin</h2>
      <div className="flex gap-2 mb-6">
        <Input
          placeholder="New item name"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addItem()}
        />
        <Button onClick={addItem}>Add</Button>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <ul className="space-y-2">
          {items.map(item => (
            <li key={item.item_id} className="flex items-center gap-2 border-b pb-1">
              {editingId === item.item_id ? (
                <>
                  <Input
                    value={editingName}
                    onChange={e => setEditingName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && saveEdit()}
                    className="flex-1"
                  />
                  <Button size="sm" onClick={saveEdit}>Save</Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                </>
              ) : (
                <>
                  <span className="flex-1">{item.name}</span>
                  <Button size="sm" variant="outline" onClick={() => startEdit(item.item_id, item.name)}>Edit</Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteItem(item.item_id)}>Delete</Button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
