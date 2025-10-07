import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EventType } from '@/types/trek';
import { StepProps } from './types';

interface BasicDetailsStepProps extends StepProps {
  imagePreview: string | null;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  gpxFile: File | null;
  handleGpxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const BasicDetailsStep: React.FC<BasicDetailsStepProps> = ({ 
  formData, 
  setFormData, 
  imagePreview, 
  handleImageChange, 
  gpxFile, 
  handleGpxChange, 
  errors 
}) => {
  const [imgError, setImgError] = useState('');

  const handleImageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImgError('');
    const file = e.target.files?.[0];
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

  const eventTypeLabel = formData.event_type === EventType.CAMPING ? 'Camping Event' : 'Trek';

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Basic Details</h3>
        <p className="text-sm text-muted-foreground">
          Provide the essential information for your {eventTypeLabel.toLowerCase()}
        </p>
      </div>

      <div className="space-y-4">
        {/* Event Name */}
        <div className="space-y-2">
          <Label htmlFor="name">{eventTypeLabel} Name *</Label>
          <Input 
            id="name" 
            name="name" 
            value={formData.name || ''} 
            onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} 
            required 
            placeholder={`Enter your ${eventTypeLabel.toLowerCase()} name`}
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && <div className="text-red-500 text-xs">{errors.name}</div>}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea 
            id="description" 
            name="description" 
            value={formData.description || ''} 
            onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} 
            rows={3} 
            placeholder={formData.event_type === EventType.CAMPING 
              ? 'Describe your camping event, activities, and what participants can expect.' 
              : 'Share a short, catchy description for your trek.'
            }
          />
        </div>

        {/* Event Image */}
        <div className="space-y-2">
          <Label htmlFor="trek-image">Event Image</Label>
          <Input 
            id="trek-image" 
            type="file" 
            accept="image/*" 
            onChange={handleImageInputChange} 
          />
          {imgError && <div className="text-red-500 text-xs">{imgError}</div>}
          {imagePreview && (
            <div className="mt-2">
              <img src={imagePreview} alt="Preview" className="w-32 h-24 object-cover rounded-lg border" />
            </div>
          )}
          <div className="text-gray-500 text-xs">
            Upload a high-quality image (JPG, PNG, or WEBP, max 2MB)
          </div>
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start_datetime">Start Date & Time *</Label>
            <Input 
              id="start_datetime" 
              name="start_datetime" 
              type="datetime-local" 
              value={formData.start_datetime || ''} 
              onChange={e => setFormData(f => ({ ...f, start_datetime: e.target.value }))} 
              required 
              className={errors.start_datetime ? 'border-red-500' : ''}
            />
            {errors.start_datetime && <div className="text-red-500 text-xs">{errors.start_datetime}</div>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="end_datetime">End Date & Time</Label>
            <Input 
              id="end_datetime" 
              name="end_datetime" 
              type="datetime-local" 
              value={formData.end_datetime || ''} 
              onChange={e => setFormData(f => ({ ...f, end_datetime: e.target.value }))} 
            />
          </div>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input 
            id="location" 
            name="location" 
            value={formData.location || ''} 
            onChange={e => setFormData(f => ({ ...f, location: e.target.value }))} 
            placeholder="Enter the location or starting point"
          />
        </div>

        {/* Category and Difficulty (for Trek events) */}
        {formData.event_type === EventType.TREK && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input 
                id="category" 
                name="category" 
                value={formData.category || ''} 
                onChange={e => setFormData(f => ({ ...f, category: e.target.value }))} 
                placeholder="E.g., Mountain Trek, Forest Walk"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <Select 
                value={formData.difficulty || ''} 
                onValueChange={value => setFormData(f => ({ ...f, difficulty: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Moderate">Moderate</SelectItem>
                  <SelectItem value="Difficult">Difficult</SelectItem>
                  <SelectItem value="Expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Pricing and Capacity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="base_price">Registration Fee (₹) *</Label>
            <Input 
              id="base_price" 
              name="base_price" 
              type="number" 
              min="0" 
              value={formData.base_price === undefined || formData.base_price === null ? '' : formData.base_price} 
              onChange={e => {
                const val = e.target.value;
                setFormData(f => ({ ...f, base_price: val === '' ? undefined : parseFloat(val) }));
              }} 
              required 
              placeholder="0"
              className={errors.base_price ? 'border-red-500' : ''}
            />
            {errors.base_price && <div className="text-red-500 text-xs">{errors.base_price}</div>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="max_participants">Max Participants *</Label>
            <Input 
              id="max_participants" 
              name="max_participants" 
              type="number" 
              min="1" 
              value={formData.max_participants === undefined || formData.max_participants === null ? '' : formData.max_participants} 
              onChange={e => {
                const val = e.target.value;
                setFormData(f => ({ ...f, max_participants: val === '' ? undefined : parseInt(val, 10) }));
              }} 
              required 
              placeholder="0"
              className={errors.max_participants ? 'border-red-500' : ''}
            />
            {errors.max_participants && <div className="text-red-500 text-xs">{errors.max_participants}</div>}
          </div>
        </div>

        {/* GPX File (for Trek events) */}
        {formData.event_type === EventType.TREK && (
          <div className="space-y-2">
            <Label htmlFor="gpx-file">GPX Route File</Label>
            <Input 
              id="gpx-file" 
              type="file" 
              accept=".gpx" 
              onChange={handleGpxChange} 
            />
            {gpxFile && (
              <div className="text-sm text-green-600">
                ✓ {gpxFile.name} uploaded
              </div>
            )}
            <div className="text-gray-500 text-xs">
              Upload a GPX file containing the route information (optional)
            </div>
          </div>
        )}

        {/* Status - Removed from form, managed only from admin table */}
      </div>
    </div>
  );
};
