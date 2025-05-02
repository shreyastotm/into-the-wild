import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'; // Import Card components
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'; // Import Table components
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { PlusCircle, Edit2, Trash2, Save, XCircle } from 'lucide-react'; // Import icons

// Define interface for packing items
interface PackingItem {
  item_id: number;
  name: string;
  // Add other fields like category if needed
}

export default function PackingItemsAdmin() {
  const [items, setItems] = useState<PackingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    setLoading(true);
    const { data, error } = await supabase
      .from('trek_packing_items')
      .select('*')
      .order('item_id', { ascending: true }); // Ensure consistent ordering
      
    if (error) {
      toast({ title: 'Error loading items', description: error.message, variant: 'destructive' });
    } else {
       setItems(data || []);
    }
    setLoading(false);
  }

  async function addItem() {
    if (!newName.trim()) {
       toast({ title: 'Input required', description: 'Please enter an item name.', variant: 'default' });
       return;
    }
    const { error } = await supabase.from('trek_packing_items').insert({ name: newName.trim() });
    if (error) {
      toast({ title: 'Add failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Item added!', variant: 'default' });
      setNewName('');
      fetchItems(); // Refresh the list
    }
  }

  async function deleteItem(id: number) {
    // Add confirmation dialog here if desired
    const { error } = await supabase.from('trek_packing_items').delete().eq('item_id', id);
    if (error) {
       toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
    } else {
       toast({ title: 'Item deleted!', variant: 'default' });
       fetchItems(); // Refresh the list
    }
  }

  function startEdit(id: number, name: string) {
    setEditingId(id);
    setEditingName(name);
  }
  
  function cancelEdit() {
     setEditingId(null);
     setEditingName('');
  }

  async function saveEdit() {
    if (!editingName.trim() || editingId === null) {
      toast({ title: 'Input required', description: 'Please enter an item name.', variant: 'default' });
      return;
    }
    const { error } = await supabase
      .from('trek_packing_items')
      .update({ name: editingName.trim() })
      .eq('item_id', editingId);
      
    if (error) {
       toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
    } else {
       toast({ title: 'Item updated!', variant: 'default' });
       cancelEdit();
       fetchItems(); // Refresh the list
    }
  }

  return (
     <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Manage Packing Items</CardTitle>
      </CardHeader>
      <CardContent>
         <div className="flex gap-2 mb-6">
           <Input
             placeholder="New item name..."
             value={newName}
             onChange={e => setNewName(e.target.value)}
             onKeyDown={e => e.key === 'Enter' && addItem()}
             className="flex-grow"
           />
           <Button onClick={addItem} className="gap-1">
              <PlusCircle className="h-4 w-4" /> Add Item
           </Button>
         </div>

         {loading ? (
           <div className="text-center py-4 text-muted-foreground">Loading items...</div>
         ) : items.length === 0 ? (
           <div className="text-center py-4 text-muted-foreground">No packing items found. Add some above!</div>
         ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead className="w-[180px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map(item => (
                  <TableRow key={item.item_id}>
                    <TableCell>
                      {editingId === item.item_id ? (
                        <Input
                          value={editingName}
                          onChange={e => setEditingName(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && saveEdit()}
                          autoFocus
                          className="h-8"
                        />
                      ) : (
                        <span>{item.name}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {editingId === item.item_id ? (
                        <div className="flex justify-end gap-2">
                           <Button size="icon" variant="ghost" onClick={saveEdit} className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-100">
                              <Save className="h-4 w-4" />
                           </Button>
                           <Button size="icon" variant="ghost" onClick={cancelEdit} className="h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100">
                              <XCircle className="h-4 w-4" />
                           </Button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                           <Button size="icon" variant="ghost" onClick={() => startEdit(item.item_id, item.name)} className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-100">
                              <Edit2 className="h-4 w-4" />
                           </Button>
                           <Button size="icon" variant="ghost" onClick={() => deleteItem(item.item_id)} className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-100">
                              <Trash2 className="h-4 w-4" />
                           </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
         )}
      </CardContent>
     </Card>
  );
}
