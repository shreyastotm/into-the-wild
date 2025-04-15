import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Step 1: Trek Details
function TrekDetailsStep({ formData, setFormData, imagePreview, handleImageChange, errors }) {
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
        <Input type="file" id="trek-image" accept="image/*" onChange={handleImageChange} />
        {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 w-full max-h-48 object-cover rounded" />}
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
    </div>
  );
}

// Step 2: Fixed Expenses
function FixedExpensesStep({ fixedExpenses, setFixedExpenses }) {
  const [expense, setExpense] = useState({ title: '', amount: '' });
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input placeholder="Expense Title" value={expense.title} onChange={e => setExpense(f => ({ ...f, title: e.target.value }))} />
        <Input placeholder="Amount" type="number" value={expense.amount} onChange={e => setExpense(f => ({ ...f, amount: e.target.value }))} />
        <Button type="button" onClick={() => {
          if (!expense.title || !expense.amount) return toast({ title: 'Fill all fields', variant: 'destructive' });
          setFixedExpenses(f => [...f, { ...expense, amount: parseFloat(expense.amount) }]);
          setExpense({ title: '', amount: '' });
        }}>Add</Button>
      </div>
      <ul className="mt-2 space-y-2">
        {fixedExpenses.map((exp, idx) => (
          <li key={idx} className="flex justify-between items-center border rounded px-2 py-1">
            <span>{exp.title} - ₹{exp.amount}</span>
            <Button variant="ghost" type="button" onClick={() => setFixedExpenses(f => f.filter((_, i) => i !== idx))}>Remove</Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Step 3: Packing List
function PackingListStep({ packingItems, selectedPacking, setSelectedPacking }) {
  return (
    <div className="space-y-4">
      <div className="font-semibold mb-2">Drag items to the event packing list:</div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="font-bold mb-1">Master List</div>
          <ul className="border rounded min-h-[120px] p-2">
            {packingItems.filter(item => !selectedPacking.some(sel => sel.item_id === item.item_id)).map(item => (
              <li key={item.item_id} className="cursor-pointer hover:bg-gray-100 p-1 rounded" onClick={() => setSelectedPacking(f => [...f, { ...item, mandatory: true }])}>
                {item.name}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="font-bold mb-1">Event Packing List</div>
          <ul className="border rounded min-h-[120px] p-2">
            {selectedPacking.map((item, idx) => (
              <li key={item.item_id} className="flex justify-between items-center">
                <span>{item.name}</span>
                <Button variant="ghost" type="button" onClick={() => setSelectedPacking(f => f.filter((_, i) => i !== idx))}>Remove</Button>
                <label className="ml-2 text-xs">
                  <input type="checkbox" checked={item.mandatory} onChange={e => setSelectedPacking(f => f.map((it, i) => i === idx ? { ...it, mandatory: e.target.checked } : it))} /> Mandatory
                </label>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// Step 4: Review & Submit
function ReviewStep({ formData, fixedExpenses, selectedPacking, imagePreview }) {
  return (
    <div className="space-y-4">
      <div><b>Trek Name:</b> {formData.trek_name}</div>
      <div><b>Description:</b> {formData.description}</div>
      <div><b>Start Date:</b> {formData.start_datetime}</div>
      <div><b>Location:</b> {formData.location}</div>
      {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 w-full max-h-32 object-cover rounded" />}
      <div>
        <b>Fixed Expenses:</b>
        <ul>{fixedExpenses.map((exp, i) => <li key={i}>{exp.title} - ₹{exp.amount}</li>)}</ul>
      </div>
      <div>
        <b>Packing List:</b>
        <ul>{selectedPacking.map((item, i) => <li key={i}>{item.name} {item.mandatory ? '(Mandatory)' : '(Optional)'}</li>)}</ul>
      </div>
    </div>
  );
}

// Main Multi-Step Form
export default function CreateTrekMultiStepForm() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({ trek_name: '', description: '', start_datetime: '', location: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fixedExpenses, setFixedExpenses] = useState<any[]>([]);
  const [packingItems, setPackingItems] = useState<any[]>([]);
  const [selectedPacking, setSelectedPacking] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Fetch master packing items on mount
  React.useEffect(() => {
    supabase.from('packing_items').select('*').then(({ data }) => setPackingItems(data || []));
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      let imageUrl: string | null = null;
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const filePath = `trek-images/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage.from('trek-assets').upload(filePath, imageFile, { upsert: false });
        if (uploadError) throw uploadError;
        const { data: publicUrlData } = supabase.storage.from('trek-assets').getPublicUrl(filePath);
        imageUrl = publicUrlData?.publicUrl || null;
      }
      // 1. Insert trek event
      const { data: trekData, error: trekError } = await supabase.from('trek_events').insert({ ...formData, image_url: imageUrl }).select('trek_id').single();
      if (trekError) throw trekError;
      const trek_id = trekData.trek_id;
      // 2. Insert fixed expenses
      for (const exp of fixedExpenses) {
        await supabase.from('trek_fixed_expenses').insert({ trek_id, title: exp.title, amount: exp.amount });
      }
      // 3. Insert packing list
      for (const item of selectedPacking) {
        await supabase.from('trek_packing_list').insert({ trek_id, item_id: item.item_id, mandatory: item.mandatory });
      }
      toast({ title: 'Trek created successfully!' });
      // Optionally redirect or reset form
    } catch (error: any) {
      toast({ title: 'Error creating trek', description: error.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  // Validation logic
  const validateStep = () => {
    const newErrors: { [key: string]: string } = {};
    if (step === 0) {
      if (!formData.trek_name) newErrors.trek_name = 'Trek name is required.';
      if (!formData.start_datetime) newErrors.start_datetime = 'Start date & time required.';
    }
    return newErrors;
  };

  const handleNext = () => {
    const validation = validateStep();
    setErrors(validation);
    if (Object.keys(validation).length === 0) setStep(s => s + 1);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-6 flex justify-between items-center">
        <div className="text-xl font-bold">Create New Trek</div>
        <div className="space-x-2">
          {['Trek Details', 'Fixed Expenses', 'Packing List', 'Review'].map((label, idx) => (
            <Button key={label} variant={step === idx ? 'default' : 'outline'} onClick={() => setStep(idx)}>{label}</Button>
          ))}
        </div>
      </div>
      <form onSubmit={e => { e.preventDefault(); if (step === 3) handleSubmit(); else handleNext(); }}>
        {step === 0 && <TrekDetailsStep formData={formData} setFormData={setFormData} imagePreview={imagePreview} handleImageChange={handleImageChange} errors={errors} />}
        {step === 1 && <FixedExpensesStep fixedExpenses={fixedExpenses} setFixedExpenses={setFixedExpenses} />}
        {step === 2 && <PackingListStep packingItems={packingItems} selectedPacking={selectedPacking} setSelectedPacking={setSelectedPacking} />}
        {step === 3 && <ReviewStep formData={formData} fixedExpenses={fixedExpenses} selectedPacking={selectedPacking} imagePreview={imagePreview} />}
        <div className="mt-8 flex justify-between">
          <Button type="button" variant="outline" disabled={step === 0} onClick={() => setStep(s => s - 1)}>Back</Button>
          <Button type="submit" disabled={submitting}>{step === 3 ? (submitting ? 'Submitting...' : 'Submit') : 'Next'}</Button>
        </div>
      </form>
    </div>
  );
}
