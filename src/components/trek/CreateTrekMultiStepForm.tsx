import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useUserVerificationStatus } from '@/components/auth/useUserVerificationStatus';

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
        <Input id="cost" name="cost" type="number" min="0" value={formData.cost || ''} onChange={e => setFormData(f => ({ ...f, cost: e.target.value }))} required />
        {errors.cost && <div className="text-red-500 text-xs mt-1">{errors.cost}</div>}
        <div className="text-gray-500 text-xs mt-1">Total cost per participant (required)</div>
      </div>
      <div>
        <Label htmlFor="max_participants">Max Participants *</Label>
        <Input id="max_participants" name="max_participants" type="text" value={formData.max_participants || ''} onChange={e => setFormData(f => ({ ...f, max_participants: e.target.value }))} required />
        {errors.max_participants && <div className="text-red-500 text-xs mt-1">{errors.max_participants}</div>}
        <div className="text-gray-500 text-xs mt-1">Maximum number of participants allowed (required)</div>
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
function PackingListStep({ packingList, setPackingList }) {
  const categories = ['Clothing', 'Footwear', 'Headgear', 'Electronics', 'First Aid', 'Miscellaneous'];
  const [newItem, setNewItem] = useState({ category: '', item: '' });

  const handleAddItem = () => {
    if (!newItem.category || !newItem.item) return;
    setPackingList(f => [...f, { category: newItem.category, item: newItem.item, checked: false }]);
    setNewItem({ category: '', item: '' });
  };

  return (
    <div className="space-y-4">
      <div className="font-semibold mb-2">Packing List:</div>
      <ul className="space-y-2">
        {categories.map(category => (
          <li key={category}>
            <h3 className="font-medium">{category}</h3>
            <ul className="pl-4 space-y-1">
              {packingList.filter(item => item.category === category).map((item, idx) => (
                <li key={idx}>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => setPackingList(f => f.map(i => i === item ? { ...i, checked: !i.checked } : i))}
                    />
                    <span>{item.item}</span>
                  </label>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <select value={newItem.category} onChange={e => setNewItem(f => ({ ...f, category: e.target.value }))}>
          <option value="">Select Category</option>
          {categories.map(category => <option key={category} value={category}>{category}</option>)}
        </select>
        <Input placeholder="Item" value={newItem.item} onChange={e => setNewItem(f => ({ ...f, item: e.target.value }))} />
        <Button type="button" onClick={handleAddItem}>Add</Button>
      </div>
    </div>
  );
}

// Step 4: Review & Submit
function ReviewStep({ formData, fixedExpenses, packingList, imagePreview, gpxFile, gpxRouteData }) {
  return (
    <div className="space-y-4">
      <div><b>Trek Name:</b> {formData.trek_name}</div>
      <div><b>Description:</b> {formData.description}</div>
      <div><b>Start Date:</b> {formData.start_datetime}</div>
      <div><b>Location:</b> {formData.location}</div>
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
        <ul>
          {packingList.map((item, i) => (
            <li key={i}>
              <span className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => {}}
                />
                <span>{item.item}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Main Multi-Step Form
export default function CreateTrekMultiStepForm() {
  const { isVerified, isIndemnityAccepted, userType, loading } = useUserVerificationStatus();
  // Defensive: Restrict form for invalid/missing user types
  const validTypes = ['admin', 'micro_community', 'trekker'];
  if (!loading && (!userType || !validTypes.includes(userType) || userType === 'trekker' || (userType === 'micro_community' && (!isVerified || !isIndemnityAccepted)))) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center text-red-600">
        <h2 className="text-xl font-semibold mb-2">
          {userType === 'trekker'
            ? 'Trekkers cannot create trek events.'
            : userType === 'micro_community' && (!isVerified || !isIndemnityAccepted)
            ? 'Micro-community users must be verified and accept indemnity to create events.'
            : 'Invalid or missing user type.'}
        </h2>
      </div>
    );
  }
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({ trek_name: '', description: '', start_datetime: '', location: '', cost: '', max_participants: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [gpxFile, setGpxFile] = useState<File | null>(null);
  const [gpxRouteData, setGpxRouteData] = useState<any>(null);
  const [fixedExpenses, setFixedExpenses] = useState<any[]>([]);
  const [packingList, setPackingList] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Ensure location is always a string before submit
  function sanitizeLocation(location: any): string {
    if (typeof location === 'string') return location;
    if (location && typeof location === 'object' && location.type === 'Point' && Array.isArray(location.coordinates)) {
      // If accidentally passed as geojson, convert to string
      return `${location.coordinates[1]},${location.coordinates[0]}`;
    }
    return String(location || '');
  }

  // GPX file handler
  const handleGpxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setGpxFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        try {
          const parser = new DOMParser();
          const xml = parser.parseFromString(text, 'application/xml');
          const trkpts = xml.getElementsByTagName('trkpt');
          // Prepopulate location from first trkpt
          if (trkpts.length > 0) {
            const firstLat = trkpts[0].getAttribute('lat');
            const firstLon = trkpts[0].getAttribute('lon');
            if (firstLat && firstLon) {
              setFormData(f => ({ ...f, location: `${firstLat},${firstLon}` }));
              // Force update the location field in the DOM as well
              const locationInput = document.getElementById('location');
              if (locationInput && 'value' in locationInput) {
                locationInput.value = `${firstLat},${firstLon}`;
              }
            }
          }
          let totalDistance = 0;
          let minElev = null;
          let maxElev = null;
          let lastLat = null;
          let lastLon = null;
          let lastEle = null;
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
        const { data: publicUrlData } = supabase.storage.from('trek-assets').getPublicUrl(filePath);
        gpxUrl = publicUrlData?.publicUrl || null;
      }
      // Sanitize location before insert
      const sanitizedLocation = sanitizeLocation(formData.location);
      // Ensure cost is present and numeric
      let sanitizedCost = formData.cost;
      if (sanitizedCost === undefined || sanitizedCost === null) sanitizedCost = '';
      sanitizedCost = sanitizedCost.toString();
      sanitizedCost = sanitizedCost.trim();
      if (sanitizedCost === '' || isNaN(Number(sanitizedCost))) {
        throw new Error('Cost is required and must be a valid number.');
      }
      // Ensure max_participants is present and numeric
      let sanitizedMaxParticipants = formData.max_participants;
      if (sanitizedMaxParticipants === undefined || sanitizedMaxParticipants === null) sanitizedMaxParticipants = '';
      sanitizedMaxParticipants = sanitizedMaxParticipants.toString();
      sanitizedMaxParticipants = sanitizedMaxParticipants.trim();
      if (sanitizedMaxParticipants === '' || isNaN(Number(sanitizedMaxParticipants))) {
        throw new Error('Max participants is required and must be a valid number.');
      }
      const maxParticipantsNumber = Number(sanitizedMaxParticipants);

      // 1. Insert trek event
      const { data: trekData, error: trekError } = await supabase.from('trek_events').insert({
        trek_name: formData.trek_name,
        description: formData.description,
        start_datetime: formData.start_datetime,
        location: sanitizedLocation,
        image_url: imageUrl,
        gpx_file_url: gpxUrl,
        route_data: routeData,
        cost: Number(sanitizedCost),
        max_participants: maxParticipantsNumber
      }).select('trek_id').single();
      if (trekError) {
        console.error('Supabase Insert trek_events Error:', trekError);
        throw trekError;
      }
      const trek_id = Number(trekData.trek_id);
      // 2. Insert expenses
      for (const exp of fixedExpenses) {
        const { error: expError } = await supabase.from('trek_expenses').insert({
          trek_id,
          title: exp.title,
          amount: typeof exp.amount === 'string' ? parseFloat(exp.amount) : exp.amount,
        });
        if (expError) {
          console.error('Supabase Insert trek_expenses Error:', expError);
          throw expError;
        }
      }
      // 3. Insert trek_packing_list items
      for (const item of packingList) {
        const { error: itemError } = await supabase.from('trek_packing_list_items').insert({
          trek_id,
          category: item.category,
          item: item.item,
        });
        if (itemError) {
          console.error('Supabase Insert trek_packing_list_items Error:', itemError);
          throw itemError;
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
      if (!formData.cost || formData.cost === '') newErrors.cost = 'Cost is required.';
      if (!formData.max_participants || formData.max_participants === '') newErrors.max_participants = 'Max participants is required.';
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
        {step === 2 && <PackingListStep packingList={packingList} setPackingList={setPackingList} />}
        {step === 3 && <ReviewStep formData={formData} fixedExpenses={fixedExpenses} packingList={packingList} imagePreview={imagePreview} gpxFile={gpxFile} gpxRouteData={gpxRouteData} />}
        <div className="mt-8 flex justify-between">
          <Button type="button" variant="outline" disabled={step === 0} onClick={() => setStep(s => s - 1)}>Back</Button>
          <Button type="submit" disabled={submitting}>{step === 3 ? (submitting ? 'Submitting...' : 'Submit') : 'Next'}</Button>
        </div>
      </form>
    </div>
  );
}
