import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
        <Input id="start_datetime" name="start_datetime" type="datetime-local" value={formData.start_datetime} onChange={e => setFormData(f => ({ ...f, start_datetime: e.target.value }))} required />
        {errors.start_datetime && <div className="text-red-500 text-xs mt-1">{errors.start_datetime}</div>}
        <div className="text-gray-500 text-xs mt-1">Choose when your trek begins. Participants will be notified.</div>
      </div>
      <div>
        <Label htmlFor="location">Location</Label>
        <Input id="location" name="location" value={formData.location} onChange={e => setFormData(f => ({ ...f, location: e.target.value }))} />
        <div className="text-gray-500 text-xs mt-1">Where will the trek start? (e.g., "Matheran Hill Base")</div>
      </div>
      <div>
        <Label htmlFor="cost">Trek Cost (₹) *</Label>
        <Input id="cost" name="cost" type="number" value={formData.cost} onChange={e => setFormData(f => ({ ...f, cost: e.target.value }))} required min={0} />
        {errors.cost && <div className="text-red-500 text-xs mt-1">{errors.cost}</div>}
      </div>
      <div>
        <Label htmlFor="max_participants">Maximum Participants *</Label>
        <Input id="max_participants" name="max_participants" type="number" value={formData.max_participants} onChange={e => setFormData(f => ({ ...f, max_participants: e.target.value }))} required min={1} />
        {errors.max_participants && <div className="text-red-500 text-xs mt-1">{errors.max_participants}</div>}
      </div>
    </div>
  );
}

// Step 2: Fixed Expenses
function FixedExpensesStep({ fixedExpenses, setFixedExpenses }) {
  const [expense, setExpense] = useState({ title: '', amount: '' });
  // Drag state
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  // Handle drag events
  const handleDragStart = (idx: number) => setDraggedIdx(idx);
  const handleDragOver = (e: React.DragEvent<HTMLLIElement>, idx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;
    const updated = [...fixedExpenses];
    const [removed] = updated.splice(draggedIdx, 1);
    updated.splice(idx, 0, removed);
    setFixedExpenses(updated);
    setDraggedIdx(idx);
  };
  const handleDragEnd = () => setDraggedIdx(null);

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
          <li key={idx}
              className={`flex justify-between items-center border rounded px-2 py-1 ${draggedIdx === idx ? 'bg-blue-50' : ''}`}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={e => handleDragOver(e, idx)}
              onDragEnd={handleDragEnd}
          >
            <span className="cursor-move">☰</span>
            <span className="flex-1 ml-2">{exp.title} - ₹{exp.amount}</span>
            <Button variant="ghost" type="button" onClick={() => setFixedExpenses(f => f.filter((_, i) => i !== idx))}>Remove</Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Step 3: Packing List
function PackingListStep({ packingItems, selectedPacking, setSelectedPacking }) {
  // Drag state
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  // Custom item state
  const [customItem, setCustomItem] = useState<string>('');
  const [customMandatory, setCustomMandatory] = useState<boolean>(false);

  const handleDragStart = (idx: number) => setDraggedIdx(idx);
  const handleDragOver = (e: React.DragEvent<HTMLLIElement>, idx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;
    const updated = [...selectedPacking];
    const [removed] = updated.splice(draggedIdx, 1);
    updated.splice(idx, 0, removed);
    setSelectedPacking(updated);
    setDraggedIdx(idx);
  };
  const handleDragEnd = () => setDraggedIdx(null);

  // Add custom item handler
  const handleAddCustom = () => {
    if (!customItem.trim()) return;
    setSelectedPacking(f => [...f, { name: customItem.trim(), mandatory: customMandatory, isCustom: true, item_id: `custom-${Date.now()}` }]);
    setCustomItem('');
    setCustomMandatory(false);
  };

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
          <div className="mt-4">
            <div className="font-bold mb-1">Add Custom Item</div>
            <div className="flex gap-2">
              <input
                type="text"
                className="border rounded px-2 py-1 flex-1"
                placeholder="Custom item name"
                value={customItem}
                onChange={e => setCustomItem(e.target.value)}
              />
              <label className="flex items-center text-xs">
                <input type="checkbox" checked={customMandatory} onChange={e => setCustomMandatory(e.target.checked)} /> Mandatory
              </label>
              <Button type="button" onClick={handleAddCustom} size="sm">Add</Button>
            </div>
          </div>
        </div>
        <div>
          <div className="font-bold mb-1">Event Packing List</div>
          <ul className="border rounded min-h-[120px] p-2">
            {selectedPacking.map((item, idx) => (
              <li key={item.item_id}
                  className={`flex justify-between items-center ${draggedIdx === idx ? 'bg-blue-50' : ''}`}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={e => handleDragOver(e, idx)}
                  onDragEnd={handleDragEnd}
              >
                <span className="cursor-move">☰</span>
                <span>{item.name}{item.isCustom && <span className="ml-1 text-xs text-blue-500">(Custom)</span>}</span>
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
function ReviewStep({ formData, fixedExpenses, selectedPacking, imagePreview, gpxFile, gpxRouteData }) {
  return (
    <div className="space-y-4">
      <div><b>Trek Name:</b> {formData.trek_name}</div>
      <div><b>Description:</b> {formData.description}</div>
      <div><b>Start Date:</b> {formData.start_datetime}</div>
      <div><b>Location:</b> {formData.location}</div>
      <div><b>Cost:</b> ₹{formData.cost}</div>
      <div><b>Maximum Participants:</b> {formData.max_participants}</div>
      {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 w-full max-h-32 object-cover rounded" />}
      {gpxFile && (
        <div className="text-xs text-blue-700">GPX File: {gpxFile.name}</div>
      )}
      {gpxRouteData && (
        <div className="text-xs text-green-700">
          Route: {gpxRouteData.distance_km} km, Elevation Gain: {gpxRouteData.elevation_gain} m, Points: {gpxRouteData.points}
        </div>
      )}
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
  const [formData, setFormData] = useState({ trek_name: '', description: '', start_datetime: '', location: '', cost: '', max_participants: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [gpxFile, setGpxFile] = useState<File | null>(null);
  const [gpxRouteData, setGpxRouteData] = useState<any>(null);
  const [fixedExpenses, setFixedExpenses] = useState<any[]>([]);
  const [packingItems, setPackingItems] = useState<any[]>([]);
  const [selectedPacking, setSelectedPacking] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Fetch master packing items on mount
  React.useEffect(() => {
    supabase.from('packing_items').select('*').then(({ data }) => setPackingItems(data || []));
  }, []);

  // GPX file handler
  const handleGpxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setGpxFile(file);
    if (file) {
      // Parse GPX file client-side to extract route summary
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        try {
          const parser = new DOMParser();
          const xml = parser.parseFromString(text, 'application/xml');
          // Extract key info (distance, elevation, etc.)
          let totalDistance = 0;
          let minElev = null;
          let maxElev = null;
          let lastLat = null;
          let lastLon = null;
          let lastEle = null;
          const trkpts = xml.getElementsByTagName('trkpt');
          for (let i = 0; i < trkpts.length; i++) {
            const lat = parseFloat(trkpts[i].getAttribute('lat'));
            const lon = parseFloat(trkpts[i].getAttribute('lon'));
            const ele = parseFloat(trkpts[i].getElementsByTagName('ele')[0]?.textContent || '0');
            if (minElev === null || ele < minElev) minElev = ele;
            if (maxElev === null || ele > maxElev) maxElev = ele;
            if (lastLat !== null && lastLon !== null) {
              // Haversine formula for distance
              const R = 6371e3;
              const φ1 = lastLat * Math.PI/180;
              const φ2 = lat * Math.PI/180;
              const Δφ = (lat-lastLat) * Math.PI/180;
              const Δλ = (lon-lastLon) * Math.PI/180;
              const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
              totalDistance += R * c;
            }
            lastLat = lat;
            lastLon = lon;
            lastEle = ele;
          }
          setGpxRouteData({
            distance_km: (totalDistance/1000).toFixed(2),
            elevation_min: minElev,
            elevation_max: maxElev,
            elevation_gain: maxElev && minElev ? (maxElev-minElev).toFixed(1) : null,
            points: trkpts.length
          });
        } catch (err) {
          setGpxRouteData(null);
        }
      };
      reader.readAsText(file);
    } else {
      setGpxRouteData(null);
    }
  };

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
      let gpxUrl: string | null = null;
      let routeData: any = gpxRouteData || null;
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const filePath = `trek-images/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage.from('trek-assets').upload(filePath, imageFile, { upsert: false });
        if (uploadError) {
          console.error('Supabase Storage Upload Error:', uploadError);
          throw uploadError;
        }
        const { data: publicUrlData } = supabase.storage.from('trek-assets').getPublicUrl(filePath);
        imageUrl = publicUrlData?.publicUrl || null;
      }
      if (gpxFile) {
        const fileExt = gpxFile.name.split('.').pop();
        const filePath = `trek-gpx/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage.from('trek-assets').upload(filePath, gpxFile, { upsert: false });
        if (uploadError) {
          console.error('Supabase Storage Upload Error (GPX):', uploadError);
          throw uploadError;
        }
        const { data: gpxPublicUrlData } = supabase.storage.from('trek-assets').getPublicUrl(filePath);
        gpxUrl = gpxPublicUrlData?.publicUrl || null;
      }
      // 1. Insert trek event
      const { data: trekData, error: trekError } = await supabase.from('trek_events').insert({ ...formData, cost: Number(formData.cost), max_participants: Number(formData.max_participants), image_url: imageUrl, gpx_file_url: gpxUrl, route_data: routeData }).select('trek_id').single();
      if (trekError) {
        console.error('Supabase Insert trek_events Error:', trekError);
        throw trekError;
      }
      const trek_id = trekData.trek_id;
      // 2. Insert expenses
      for (const exp of fixedExpenses) {
        const { error: expError } = await supabase.from('trek_expenses').insert({ trek_id, title: exp.title, amount: exp.amount });
        if (expError) {
          console.error('Supabase Insert trek_expenses Error:', expError);
          throw expError;
        }
      }
      // 3. Insert packing list
      for (const [order, item] of selectedPacking.entries()) {
        // Defensive: Only insert if item.name is present and item.mandatory is boolean
        // Log the full item for debugging
        console.log('Packing item for insert:', item);
        // Log trek_id and its type for debugging
        console.log('Packing list trek_id raw:', trekData.trek_id, 'Type:', typeof trekData.trek_id);
        const trekIdInt = trekData && typeof trekData.trek_id === 'number' ? trekData.trek_id : parseInt(trekData.trek_id, 10);
        console.log('Packing list trekIdInt:', trekIdInt, 'Type:', typeof trekIdInt);
        // Remove item_id and other extraneous fields from item
        const { item_id, isCustom, ...restItem } = item;
        const insertObj = {
          trek_id: trekIdInt,
          name: String(item.name),
          mandatory: Boolean(item.mandatory),
          item_order: Number(order)
        };
        // Validate required fields
        if (!insertObj.name || typeof insertObj.mandatory !== 'boolean' || isNaN(insertObj.item_order) || isNaN(insertObj.trek_id)) {
          console.error('Skipping invalid packing list item (sanitized):', insertObj, item);
          continue;
        }
        console.log('Inserting packing list object:', insertObj);
        // --- FIX: Always insert into trek_packing_lists (plural) ---
        const { error: packError } = await supabase.from('trek_packing_lists').insert(insertObj);
        if (packError) {
          console.error('Supabase Insert trek_packing_lists Error:', packError, insertObj);
          toast({ title: 'Packing List DB Error', description: packError.message || JSON.stringify(packError), variant: 'destructive' });
          throw packError;
        }
      }
      toast({ title: 'Trek created successfully!' });
      // Optionally redirect or reset form
    } catch (error: any) {
      toast({ title: 'Error creating trek', description: error.message || JSON.stringify(error), variant: 'destructive' });
      console.error('Error creating trek event:', error);
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
      if (!formData.cost || isNaN(Number(formData.cost))) newErrors.cost = 'Trek cost is required.';
      if (!formData.max_participants || isNaN(Number(formData.max_participants)) || Number(formData.max_participants) < 1) newErrors.max_participants = 'Maximum participants is required.';
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
        {step === 0 && <TrekDetailsStep formData={formData} setFormData={setFormData} imagePreview={imagePreview} handleImageChange={handleImageChange} gpxFile={gpxFile} handleGpxChange={handleGpxChange} errors={errors} />}
        {step === 1 && <FixedExpensesStep fixedExpenses={fixedExpenses} setFixedExpenses={setFixedExpenses} />}
        {step === 2 && <PackingListStep packingItems={packingItems} selectedPacking={selectedPacking} setSelectedPacking={setSelectedPacking} />}
        {step === 3 && <ReviewStep formData={formData} fixedExpenses={fixedExpenses} selectedPacking={selectedPacking} imagePreview={imagePreview} gpxFile={gpxFile} gpxRouteData={gpxRouteData} />}
        <div className="mt-8 flex justify-between">
          <Button type="button" variant="outline" disabled={step === 0} onClick={() => setStep(s => s - 1)}>Back</Button>
          <Button type="submit" disabled={submitting}>{step === 3 ? (submitting ? 'Submitting...' : 'Submit') : 'Next'}</Button>
        </div>
      </form>
    </div>
  );
}
