
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';

interface TrekEventFormData {
  trek_name: string;
  description: string;
  category: string;
  start_datetime: string;
  duration: string;
  cost: string;
  max_participants: string;
  location: string;
  transport_mode: 'cars' | 'mini_van' | 'bus' | '';
  pickup_time_window: string;
  cancellation_policy: string;
}

export default function CreateTrekEvent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<TrekEventFormData>({
    trek_name: '',
    description: '',
    category: '',
    start_datetime: '',
    duration: '',
    cost: '',
    max_participants: '',
    location: '',
    transport_mode: '',
    pickup_time_window: '',
    cancellation_policy: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Redirect if not logged in
  React.useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to create a trek event",
        variant: "destructive",
      });
      navigate('/auth');
    }
  }, [user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      
      // Convert form data to correct types
      const trekEventData = {
        trek_name: formData.trek_name,
        description: formData.description || null,
        category: formData.category || null,
        start_datetime: formData.start_datetime,
        duration: formData.duration || null,
        cost: parseFloat(formData.cost),
        max_participants: parseInt(formData.max_participants),
        current_participants: 0,
        transport_mode: formData.transport_mode || null,
        pickup_time_window: formData.pickup_time_window || null,
        cancellation_policy: formData.cancellation_policy || null,
        event_creator_type: 'internal'
      };
      
      // Quick validation
      if (!trekEventData.trek_name || !trekEventData.start_datetime || 
          isNaN(trekEventData.cost) || isNaN(trekEventData.max_participants)) {
        toast({
          title: "Validation error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }
      
      // Insert trek event
      const { data, error } = await supabase
        .from('trek_events')
        .insert(trekEventData)
        .select('trek_id')
        .single();
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Trek event created",
        description: "Your trek event has been created successfully",
      });
      
      // Navigate to the newly created trek event
      navigate(`/trek-events/${data.trek_id}`);
    } catch (error: any) {
      toast({
        title: "Error creating trek event",
        description: error.message || "Failed to create trek event",
        variant: "destructive",
      });
      console.error("Error creating trek event:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button 
        variant="outline" 
        className="mb-4"
        onClick={() => navigate('/trek-events')}
      >
        ← Back to Trek Events
      </Button>
      
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Create New Trek Event</CardTitle>
          <CardDescription>
            Fill in the details below to create a new trek event for the community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="trek_name">Trek Name *</Label>
                <Input
                  id="trek_name"
                  name="trek_name"
                  value={formData.trek_name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                />
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <Select 
                  onValueChange={(value) => handleSelectChange('category', value)}
                  value={formData.category}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="long-distance">Long Distance</SelectItem>
                    <SelectItem value="family">Family</SelectItem>
                    <SelectItem value="curated-experience">Curated Experience</SelectItem>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_datetime">Start Date and Time *</Label>
                  <Input
                    id="start_datetime"
                    name="start_datetime"
                    type="datetime-local"
                    value={formData.start_datetime}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="duration">Duration (e.g., "2 days")</Label>
                  <Input
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cost">Cost (₹) *</Label>
                  <Input
                    id="cost"
                    name="cost"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.cost}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="max_participants">Maximum Participants *</Label>
                  <Input
                    id="max_participants"
                    name="max_participants"
                    type="number"
                    min="1"
                    value={formData.max_participants}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Location description (full coordinates support coming soon)"
                />
              </div>
              
              <div>
                <Label htmlFor="transport_mode">Transport Mode</Label>
                <Select 
                  onValueChange={(value) => handleSelectChange('transport_mode', value)}
                  value={formData.transport_mode}
                >
                  <SelectTrigger id="transport_mode">
                    <SelectValue placeholder="Select transport mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cars">Cars</SelectItem>
                    <SelectItem value="mini_van">Mini Van</SelectItem>
                    <SelectItem value="bus">Bus</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="pickup_time_window">Pickup Time Window</Label>
                <Input
                  id="pickup_time_window"
                  name="pickup_time_window"
                  value={formData.pickup_time_window}
                  onChange={handleChange}
                  placeholder="e.g., '6:00 AM - 7:00 AM'"
                />
              </div>
              
              <div>
                <Label htmlFor="cancellation_policy">Cancellation Policy</Label>
                <Textarea
                  id="cancellation_policy"
                  name="cancellation_policy"
                  value={formData.cancellation_policy}
                  onChange={handleChange}
                  placeholder="Describe the cancellation policy and any penalties"
                  rows={3}
                />
              </div>
            </div>
            
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Trek Event'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
