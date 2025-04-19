import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';

export default function PackingListTemplatesAdmin() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDesc, setNewTemplateDesc] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemMandatory, setNewItemMandatory] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  async function fetchTemplates() {
    setLoading(true);
    const { data, error } = await supabase.from('packing_list_templates').select('*').order('created_at');
    if (error) toast({ title: 'Error loading templates', description: error.message, variant: 'destructive' });
    setTemplates(data || []);
    setLoading(false);
  }

  async function fetchItems(template_id: string) {
    setLoading(true);
    const { data, error } = await supabase.from('packing_list_items').select('*').eq('template_id', template_id).order('item_order');
    if (error) toast({ title: 'Error loading items', description: error.message, variant: 'destructive' });
    setItems(data || []);
    setLoading(false);
  }

  async function createTemplate() {
    if (!newTemplateName.trim()) return;
    setLoading(true);
    const { data, error } = await supabase.from('packing_list_templates').insert({ name: newTemplateName.trim(), description: newTemplateDesc }).select().single();
    if (error) {
      toast({ title: 'Error creating template', description: error.message, variant: 'destructive' });
    } else {
      setTemplates(t => [...t, data]);
      setNewTemplateName('');
      setNewTemplateDesc('');
    }
    setLoading(false);
  }

  async function addItem() {
    if (!selectedTemplate || !newItemName.trim()) return;
    setLoading(true);
    const { data, error } = await supabase.from('packing_list_items').insert({ template_id: selectedTemplate.template_id, name: newItemName.trim(), mandatory: newItemMandatory }).select().single();
    if (error) {
      toast({ title: 'Error adding item', description: error.message, variant: 'destructive' });
    } else {
      setItems(i => [...i, data]);
      setNewItemName('');
      setNewItemMandatory(false);
    }
    setLoading(false);
  }

  function handleSelectTemplate(template: any) {
    setSelectedTemplate(template);
    fetchItems(template.template_id);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-2">Packing List Templates</h2>
        <div className="flex gap-2 mb-2">
          <Input placeholder="Template name" value={newTemplateName} onChange={e => setNewTemplateName(e.target.value)} />
          <Input placeholder="Description (optional)" value={newTemplateDesc} onChange={e => setNewTemplateDesc(e.target.value)} />
          <Button onClick={createTemplate} disabled={loading}>Create Template</Button>
        </div>
        <ul className="space-y-1">
          {templates.map(t => (
            <li key={t.template_id} className={selectedTemplate?.template_id === t.template_id ? 'font-bold' : ''}>
              <Button variant="ghost" onClick={() => handleSelectTemplate(t)}>{t.name}</Button>
            </li>
          ))}
        </ul>
      </div>
      {selectedTemplate && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Items in "{selectedTemplate.name}"</h3>
          <div className="flex gap-2 mb-2">
            <Input placeholder="Item name" value={newItemName} onChange={e => setNewItemName(e.target.value)} />
            <label className="flex items-center gap-1 text-xs">
              <input type="checkbox" checked={newItemMandatory} onChange={e => setNewItemMandatory(e.target.checked)} /> Mandatory
            </label>
            <Button onClick={addItem} disabled={loading}>Add Item</Button>
          </div>
          <ul className="space-y-1">
            {items.map(item => (
              <li key={item.item_id} className="flex items-center gap-2">
                <span>{item.name}</span>
                {item.mandatory && <span className="text-xs text-red-600">(Mandatory)</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
