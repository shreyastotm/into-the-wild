import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { TrekEventStatus, EventType, CampingItinerary, ActivitySchedule, VolunteerRoles, TentType, TentInventory } from '@/types/trek';
import { Loader2, ArrowRight, ArrowLeft, CheckCircle, XCircle, MapPin, Car, PawPrint, PlusCircle, Trash2, Upload, Calendar, Users, Clock } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Define TrekEvent type based on TrekEventsAdmin.tsx for the prop
interface AdminTrekEvent {
  trek_id: number;
  name: string;
  description?: string | null;
  location?: string | null;
  category?: string | null; // Added from form
  difficulty?: string | null; // Added from form
  start_datetime: string;
  end_datetime?: string | null;
  base_price?: number | null;
  max_participants: number;
  status?: string | null;
  image_url?: string | null;
  // New event type fields
  event_type?: EventType;
  itinerary?: CampingItinerary | null;
  activity_schedule?: ActivitySchedule | null;
  volunteer_roles?: VolunteerRoles | null;
  // Tent rental fields
  tent_inventory?: TentInventory[];
  // Note: CreateTrekMultiStepForm also handles gpx_file_url internally
  // and packing list items, which are not part of this AdminTrekEvent interface directly
}

interface TrekCost {
  id?: number; // For existing costs
  cost_type: 'ACCOMMODATION' | 'TICKETS' | 'LOCAL_VEHICLE' | 'GUIDE' | 'OTHER';
  amount: number;
  description?: string;
  url?: string;
  file?: File | null;
  // For UI state
  isUploading?: boolean;
  filePath?: string;
}

interface MasterPackingItem {
    id: number;
    name: string;
    category: string | null;
}

interface CreateTrekMultiStepFormProps {
  trekToEdit?: AdminTrekEvent | null;
  onFormSubmit: (data: { trekData: Partial<AdminTrekEvent>; packingList: { master_item_id: number; is_mandatory: boolean; }[]; costs: TrekCost[]; tentInventory: TentInventory[] }) => Promise<void>;
  onCancel: () => void;
}

// Step 1: Event Type Selection
function EventTypeStep({ formData, setFormData, errors }: { formData: Partial<AdminTrekEvent>, setFormData: React.Dispatch<React.SetStateAction<Partial<AdminTrekEvent>>>, errors: Record<string, string> }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Choose Event Type</h2>
        <p className="text-gray-600 mb-6">What type of event would you like to create?</p>
      </div>
      
      <RadioGroup 
        value={formData.event_type || EventType.TREK} 
        onValueChange={(value: EventType) => setFormData(f => ({ ...f, event_type: value }))}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div className="relative">
          <RadioGroupItem value={EventType.TREK} id="trek" className="peer sr-only" />
          <Label 
            htmlFor="trek" 
            className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 peer-checked:border-blue-500 peer-checked:bg-blue-50 transition-all"
          >
            <MapPin className="h-12 w-12 text-blue-500 mb-3" />
            <span className="text-lg font-semibold">Trek Event</span>
            <span className="text-sm text-gray-500 text-center mt-2">
              Traditional hiking and trekking experiences with routes, difficulty levels, and outdoor adventures.
            </span>
          </Label>
        </div>
        
        <div className="relative">
          <RadioGroupItem value={EventType.CAMPING} id="camping" className="peer sr-only" />
          <Label 
            htmlFor="camping" 
            className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-green-300 peer-checked:border-green-500 peer-checked:bg-green-50 transition-all"
          >
            <PawPrint className="h-12 w-12 text-green-500 mb-3" />
            <span className="text-lg font-semibold">Camping Event</span>
            <span className="text-sm text-gray-500 text-center mt-2">
              Multi-activity camping with detailed itineraries, volunteer roles, and group activities.
            </span>
          </Label>
        </div>
      </RadioGroup>
      
      {errors.event_type && <div className="text-red-500 text-xs text-center">{errors.event_type}</div>}
      
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium mb-2">
          {formData.event_type === EventType.CAMPING ? 'Camping Event Features:' : 'Trek Event Features:'}
        </h3>
        <ul className="text-sm text-gray-600 space-y-1">
          {formData.event_type === EventType.CAMPING ? (
            <>
              <li>• Day-by-day itinerary planning</li>
              <li>• Volunteer role assignments</li>
              <li>• Activity scheduling</li>
              <li>• Group coordination tools</li>
              <li>• Equipment and resource management</li>
            </>
          ) : (
            <>
              <li>• Route planning with GPX files</li>
              <li>• Difficulty level management</li>
              <li>• Traditional packing lists</li>
              <li>• Basic trek logistics</li>
              <li>• Simple registration flow</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}

// Step 2: Basic Details
function BasicDetailsStep({ formData, setFormData, imagePreview, handleImageChange, gpxFile, handleGpxChange, errors }: { formData: Partial<AdminTrekEvent>, setFormData: React.Dispatch<React.SetStateAction<Partial<AdminTrekEvent>>>, imagePreview: string | null, handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void, gpxFile: File | null, handleGpxChange: (e: React.ChangeEvent<HTMLInputElement>) => void, errors: Record<string, string> }) {
  // --- Image Guardrails ---
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
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">{formData.event_type === EventType.CAMPING ? 'Camping Event Name' : 'Trek Name'} *</Label>
        <Input id="name" name="name" value={formData.name || ''} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} required />
        {errors.name && <div className="text-red-500 text-xs mt-1">{errors.name}</div>}
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" value={formData.description || ''} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} rows={3} />
        <div className="text-gray-500 text-xs mt-1">
          {formData.event_type === EventType.CAMPING 
            ? 'Describe your camping event, activities, and what participants can expect.' 
            : 'Share a short, catchy description for your trek.'
          }
        </div>
      </div>
      <div>
        <Label htmlFor="trek-image">{formData.event_type === EventType.CAMPING ? 'Event Image (Main)' : 'Trek Image (Main)'}</Label>
        <Input type="file" id="trek-image" accept="image/*" onChange={handleImageInputChange} />
        {imgError && <div className="text-red-500 text-xs mt-1">{imgError}</div>}
        {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 w-full max-h-48 object-cover rounded" />}
        <div className="text-gray-500 text-xs mt-1">Max size: 2MB. Allowed: JPG, PNG, WEBP.</div>
      </div>
      {formData.event_type === EventType.TREK && (
        <div>
          <Label htmlFor="gpx-file">GPX File (Route Map)</Label>
          <Input type="file" id="gpx-file" accept=".gpx" onChange={handleGpxChange} />
          {gpxFile && <div className="mt-2 text-xs text-green-700">Selected: {gpxFile.name}</div>}
          <div className="text-gray-500 text-xs mt-1">Upload a GPX file for the trek route (optional)</div>
        </div>
      )}
      <div>
        <Label htmlFor="start_datetime">Start Date and Time *</Label>
        <Input id="start_datetime" name="start_datetime" type="datetime-local" value={formData.start_datetime || ''} onChange={e => setFormData(f => ({ ...f, start_datetime: e.target.value }))} required />
        {errors.start_datetime && <div className="text-red-500 text-xs mt-1">{errors.start_datetime}</div>}
        <div className="text-gray-500 text-xs mt-1">
          {formData.event_type === EventType.CAMPING 
            ? 'When does your camping event begin? Participants will be notified.' 
            : 'Choose when your trek begins. Participants will be notified.'
          }
        </div>
      </div>
      <div>
        <Label htmlFor="location">Location</Label>
        <Input id="location" name="location" value={formData.location || ''} onChange={e => setFormData(f => ({ ...f, location: e.target.value }))} />
        <div className="text-gray-500 text-xs mt-1">
          {formData.event_type === EventType.CAMPING 
            ? 'Where will the camping event take place? (e.g., "Riverside Campground, Pune")' 
            : 'Where will the trek start? (e.g., "Matheran Hill Base")'
          }
        </div>
      </div>
      <div>
        <Label htmlFor="category">Category</Label>
        <Input id="category" name="category" value={formData.category || ''} onChange={e => setFormData(f => ({ ...f, category: e.target.value }))} />
        <div className="text-gray-500 text-xs mt-1">
          {formData.event_type === EventType.CAMPING 
            ? 'E.g., "Family Camping", "Adventure Camp", "Nature Retreat"' 
            : 'E.g., "Mountain Trek", "Forest Trail", "Coastal Walk"'
          }
        </div>
      </div>
      {formData.event_type === EventType.TREK && (
        <div>
          <Label htmlFor="difficulty">Difficulty Level</Label>
          <Input id="difficulty" name="difficulty" value={formData.difficulty || ''} onChange={e => setFormData(f => ({ ...f, difficulty: e.target.value }))} />
          <div className="text-gray-500 text-xs mt-1">E.g., "Easy", "Moderate", "Difficult", "Expert"</div>
        </div>
      )}
      <div>
        <Label htmlFor="base_price">Base Cost (₹) *</Label>
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
        />
        {errors.base_price && <div className="text-red-500 text-xs mt-1">{errors.base_price}</div>}
        <div className="text-gray-500 text-xs mt-1">Base cost per participant (required)</div>
      </div>
      <div>
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
        />
        {errors.max_participants && <div className="text-red-500 text-xs mt-1">{errors.max_participants}</div>}
        <div className="text-gray-500 text-xs mt-1">Maximum number of participants allowed (required)</div>
      </div>
      <div>
        <Label htmlFor="status">Status</Label>
        <select 
          id="status" 
          name="status" 
          value={formData.status || TrekEventStatus.DRAFT} 
          onChange={e => setFormData(f => ({ ...f, status: e.target.value }))} 
          className="w-full p-2 border rounded"
        >
          <option value={TrekEventStatus.DRAFT}>Draft</option>
          <option value={TrekEventStatus.UPCOMING}>Upcoming</option>
          <option value={TrekEventStatus.OPEN_FOR_REGISTRATION}>Open for Registration</option>
          <option value={TrekEventStatus.CANCELLED}>Cancelled</option>
        </select>
      </div>
    </div>
  );
}

// Step 3: Camping Details (Conditional)
function CampingDetailsStep({ formData, setFormData, errors }: { formData: Partial<AdminTrekEvent>, setFormData: React.Dispatch<React.SetStateAction<Partial<AdminTrekEvent>>>, errors: Record<string, string> }) {
  const [activeItineraryDay, setActiveItineraryDay] = useState(1);
  const [activeVolunteerRole, setActiveVolunteerRole] = useState('');
  const [tentTypes, setTentTypes] = useState<TentType[]>([]);
  const [loading, setLoading] = useState(false);

  // Initialize empty structures if not exists
  const itinerary = formData.itinerary || {};
  const volunteer_roles = formData.volunteer_roles || { roles: [] };
  const tent_inventory = formData.tent_inventory || [];

  // Fetch tent types on component mount
  useEffect(() => {
    fetchTentTypes();
  }, []);

  const fetchTentTypes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tent_types')
        .select('*')
        .eq('is_active', true)
        .order('capacity');
      
      if (error) throw error;
      setTentTypes(data || []);
    } catch (error) {
      console.error('Error fetching tent types:', error);
    } finally {
      setLoading(false);
    }
  };

  const addItineraryDay = () => {
    const dayKey = `day_${activeItineraryDay}`;
    const newItinerary = {
      ...itinerary,
      [dayKey]: {
        date: '',
        activities: []
      }
    };
    setFormData(f => ({ ...f, itinerary: newItinerary }));
  };

  const addVolunteerRole = () => {
    if (!activeVolunteerRole.trim()) return;
    const newRoles = {
      roles: [...volunteer_roles.roles, {
        id: activeVolunteerRole.toLowerCase().replace(/\s+/g, '_'),
        name: activeVolunteerRole,
        description: '',
        slots: 1,
        requirements: []
      }]
    };
    setFormData(f => ({ ...f, volunteer_roles: newRoles }));
    setActiveVolunteerRole('');
  };

  const updateTentInventory = (tentTypeId: number, totalAvailable: number) => {
    const existingIndex = tent_inventory.findIndex(t => t.tent_type_id === tentTypeId);
    let newInventory;
    
    if (existingIndex >= 0) {
      newInventory = [...tent_inventory];
      newInventory[existingIndex] = {
        ...newInventory[existingIndex],
        total_available: totalAvailable
      };
    } else {
      newInventory = [...tent_inventory, {
        id: 0, // Will be set by backend
        event_id: 0, // Will be set when event is created
        tent_type_id: tentTypeId,
        total_available: totalAvailable,
        reserved_count: 0
      }];
    }
    
    setFormData(f => ({ ...f, tent_inventory: newInventory }));
  };

  const getTentInventory = (tentTypeId: number) => {
    return tent_inventory.find(t => t.tent_type_id === tentTypeId)?.total_available || 0;
  };

  if (formData.event_type !== EventType.CAMPING) {
    return null; // Don't render for trek events
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Camping Event Details</h2>
        <p className="text-gray-600">Configure your camping event's itinerary and volunteer roles</p>
      </div>

      {/* Itinerary Section */}
      <div className="border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold">Event Itinerary</h3>
        </div>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input 
              type="number" 
              placeholder="Day number" 
              value={activeItineraryDay} 
              onChange={(e) => setActiveItineraryDay(parseInt(e.target.value) || 1)}
              className="w-32"
            />
            <Button onClick={addItineraryDay} variant="outline">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Day
            </Button>
          </div>
          <div className="text-sm text-gray-600">
            You can set up a detailed itinerary during event creation or update it later from the admin panel.
          </div>
        </div>
      </div>

      {/* Volunteer Roles Section */}
      <div className="border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-green-500" />
          <h3 className="text-lg font-semibold">Volunteer Roles</h3>
        </div>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input 
              placeholder="Role name (e.g., Lead Cook, Activity Guide)" 
              value={activeVolunteerRole} 
              onChange={(e) => setActiveVolunteerRole(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addVolunteerRole()}
            />
            <Button onClick={addVolunteerRole} variant="outline" disabled={!activeVolunteerRole.trim()}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Role
            </Button>
          </div>
          {volunteer_roles.roles.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Current Roles:</div>
              {volunteer_roles.roles.map((role, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <span className="flex-1">{role.name}</span>
                  <span className="text-sm text-gray-500">{role.slots} slot(s)</span>
                </div>
              ))}
            </div>
          )}
          <div className="text-sm text-gray-600">
            Define volunteer roles needed for your camping event. You can configure detailed requirements and assign volunteers later.
          </div>
        </div>
      </div>

      {/* Activity Schedule Preview */}
      <div className="border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-purple-500" />
          <h3 className="text-lg font-semibold">Activity Schedule</h3>
        </div>
        <div className="text-sm text-gray-600">
          Detailed activity scheduling will be available after creating the event. You can add timed activities, equipment requirements, and volunteer assignments from the admin panel.
        </div>
      </div>

      {/* Tent Rental Management */}
      <div className="border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <PawPrint className="h-5 w-5 text-orange-500" />
          <h3 className="text-lg font-semibold">Tent Rentals</h3>
        </div>
        
        {loading ? (
          <div className="text-sm text-gray-600">Loading tent types...</div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Set the number of tents available for rental at this camping event.
            </div>
            
            {tentTypes.map((tentType) => (
              <div key={tentType.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{tentType.name}</div>
                  <div className="text-sm text-gray-600">
                    Capacity: {tentType.capacity} people • ₹{tentType.rental_price_per_night}/night
                  </div>
                  {tentType.description && (
                    <div className="text-xs text-gray-500 mt-1">{tentType.description}</div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor={`tent-${tentType.id}`} className="text-sm whitespace-nowrap">
                    Available:
                  </Label>
                  <Input
                    id={`tent-${tentType.id}`}
                    type="number"
                    min="0"
                    max="100"
                    value={getTentInventory(tentType.id)}
                    onChange={(e) => updateTentInventory(tentType.id, parseInt(e.target.value) || 0)}
                    className="w-20"
                  />
                </div>
              </div>
            ))}
            
            {tentTypes.length === 0 && (
              <div className="text-sm text-gray-500 text-center py-4">
                No tent types available. Contact admin to add tent types.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Step 4: Packing List - Refactored
function PackingListStep({ selectedItems, setSelectedItems, mandatoryItems, setMandatoryItems, packingListLoading, packingListError, masterPackingList, fetchMasterList }: { selectedItems: Set<number>, setSelectedItems: React.Dispatch<React.SetStateAction<Set<number>>>, mandatoryItems: Set<number>, setMandatoryItems: React.Dispatch<React.SetStateAction<Set<number>>>, packingListLoading: boolean, packingListError: string | null, masterPackingList: MasterPackingItem[], fetchMasterList: () => void }) {
  useEffect(() => {
    if (masterPackingList.length === 0 && !packingListLoading) {
      fetchMasterList();
    }
  }, [fetchMasterList, masterPackingList, packingListLoading]);

  const handleItemSelect = (itemId: number, checked: boolean) => {
    const newSelected = new Set(selectedItems);
    if (checked) {
      newSelected.add(itemId);
    } else {
      newSelected.delete(itemId);
      const newMandatory = new Set(mandatoryItems);
      newMandatory.delete(itemId);
      setMandatoryItems(newMandatory);
    }
    setSelectedItems(newSelected);
  };

  const handleMandatoryToggle = (itemId: number, checked: boolean) => {
    if (!selectedItems.has(itemId) && checked) return;
    const newMandatory = new Set(mandatoryItems);
    if (checked) {
      newMandatory.add(itemId);
    } else {
      newMandatory.delete(itemId);
    }
    setMandatoryItems(newMandatory);
  };

  const groupedItems = useMemo(() => {
    if (!masterPackingList) return {};
    return masterPackingList.reduce((acc, item) => {
        const category = item.category || 'Miscellaneous';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(item);
        return acc;
    }, {} as Record<string, MasterPackingItem[]>);
  }, [masterPackingList]);

  return (
    <div className="space-y-4">
      <div className="font-semibold mb-2">Select items for this trek's packing list:</div>
      <ScrollArea className="h-72 w-full rounded-md border p-4">
        {packingListLoading && <div className="flex justify-center items-center"><Loader2 className="animate-spin" /></div>}
        {packingListError && <div className="text-red-500">{packingListError}</div>}
        {!packingListLoading && !packingListError && (
          Object.keys(groupedItems).map((category) => {
            const items = groupedItems[category] as MasterPackingItem[];
            return (
              <div key={category} className="mb-4">
                <h3 className="font-medium text-lg mb-2">{category}</h3>
                <ul className="space-y-2">
                  {items.map((item) => (
                    <li key={item.id} className="flex items-center justify-between">
                      <Label htmlFor={`item-${item.id}`} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          id={`item-${item.id}`}
                          checked={selectedItems.has(item.id)}
                          onCheckedChange={(checked) => handleItemSelect(item.id, !!checked)}
                        />
                        <span>{item.name}</span>
                      </Label>
                      {selectedItems.has(item.id) && (
                        <Label htmlFor={`mandatory-${item.id}`} className="flex items-center gap-1 text-xs cursor-pointer">
                          <Checkbox
                            id={`mandatory-${item.id}`}
                            checked={mandatoryItems.has(item.id)}
                            onCheckedChange={(checked) => handleMandatoryToggle(item.id, !!checked)}
                          />
                          <span>Mandatory</span>
                        </Label>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })
        )}
      </ScrollArea>
    </div>
  );
}

// Step 3: Fixed Costs
function FixedCostsStep({ costs, setCosts }: { costs: TrekCost[], setCosts: React.Dispatch<React.SetStateAction<TrekCost[]>> }) {
    const costTypes = ['ACCOMMODATION', 'TICKETS', 'LOCAL_VEHICLE', 'GUIDE', 'OTHER'];
    
    const addCost = () => {
        setCosts(prev => [...prev, { cost_type: 'OTHER', amount: 0, description: '' }]);
    };

    const removeCost = (index: number) => {
        setCosts(prev => prev.filter((_, i) => i !== index));
    };

    const updateCost = (index: number, field: keyof TrekCost, value: string | number | File | null) => {
        setCosts(prev => {
            const newCosts = [...prev];
            const costToUpdate = { ...newCosts[index] };
            (costToUpdate as Record<keyof TrekCost, string | number | File | null | undefined | boolean>)[field] = value;
            newCosts[index] = costToUpdate;
            return newCosts;
        });
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Fixed Costs Management</h3>
            <p className="text-sm text-gray-500">Add any fixed costs associated with the trek, like guide fees or permits. These will be used for expense tracking.</p>
            {costs.map((cost, index) => (
                <div key={index} className="p-4 border rounded-md space-y-3 relative">
                    <button onClick={() => removeCost(index)} className="absolute top-2 right-2 p-1 hover:bg-red-100 rounded-full">
                        <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label>Cost Type</Label>
                            <select 
                                value={cost.cost_type} 
                                onChange={(e) => updateCost(index, 'cost_type', e.target.value as TrekCost['cost_type'])}
                                className="w-full p-2 border rounded"
                            >
                                {costTypes.map(type => <option key={type} value={type}>{type}</option>)}
                            </select>
                        </div>
                        <div>
                            <Label>Amount (₹)</Label>
                            <Input 
                                type="number" 
                                value={cost.amount} 
                                onChange={(e) => updateCost(index, 'amount', parseFloat(e.target.value))} 
                            />
                        </div>
                    </div>
                    <div>
                        <Label>Description</Label>
                        <Input 
                            type="text" 
                            value={cost.description || ''} 
                            onChange={(e) => updateCost(index, 'description', e.target.value)}
                            placeholder="e.g., National Park Entry Fee"
                        />
                    </div>
                </div>
            ))}
            <Button onClick={addCost} variant="outline" size="sm">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Cost Item
            </Button>
        </div>
    );
}

// Step 4: Review & Submit
function ReviewStep({ formData, costs, selectedPackingItems, mandatoryPackingItems, masterPackingList, imagePreview, gpxFile }: { formData: Partial<AdminTrekEvent>, costs: TrekCost[], selectedPackingItems: Set<number>, mandatoryPackingItems: Set<number>, masterPackingList: MasterPackingItem[], imagePreview: string | null, gpxFile: File | null }) {
  const getSelectedItemDetails = (itemId: number) => {
    const item = masterPackingList.find(i => i.id === itemId);
    if (!item) return { name: "Unknown Item", category: "N/A", mandatory: false };
    return { name: item.name, category: item.category || 'Misc', mandatory: mandatoryPackingItems.has(itemId) };
  };

  const selectedList = Array.from(selectedPackingItems).map(getSelectedItemDetails);

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-lg">Review Your Trek Details</h3>
      
      {/* Trek Details Review */}
      <div className="p-4 border rounded-md bg-gray-50">
        <h4 className="font-semibold mb-2">General Information</h4>
        <p><strong>Name:</strong> {formData.name || 'N/A'}</p>
        <p><strong>Description:</strong> {formData.description || 'N/A'}</p>
        <p><strong>Location:</strong> {formData.location || 'N/A'}</p>
        <p><strong>Start Date:</strong> {formData.start_datetime ? new Date(formData.start_datetime).toLocaleString() : 'N/A'}</p>
        <p><strong>Cost:</strong> ₹{formData.base_price ?? '0'}</p>
        <p><strong>Max Participants:</strong> {formData.max_participants || 'N/A'}</p>
        <p><strong>Status:</strong> {formData.status || 'Draft'}</p>
        {imagePreview && <img src={imagePreview} alt="Trek" className="mt-2 w-full max-h-40 object-cover rounded"/>}
        {gpxFile && <div className="mt-2 text-sm text-green-700">GPX File: {gpxFile.name}</div>}
      </div>

      {/* Fixed Costs Review */}
      <div className="p-4 border rounded-md bg-gray-50">
        <h4 className="font-semibold mb-2">Fixed Costs</h4>
        <ul className="list-disc pl-5">
          {costs.filter(c => c.amount > 0).map((cost, index) => (
            <li key={index} className="capitalize">
              {cost.cost_type.replace('_', ' ').toLowerCase()}: ₹{cost.amount}
              {cost.description && ` (${cost.description})`}
              {cost.url && <a href={cost.url} target="_blank" rel="noreferrer" className="text-blue-500 ml-2">(View Link)</a>}
              {cost.file && <span className="text-green-600 ml-2"> (File selected)</span>}
            </li>
          ))}
        </ul>
      </div>

      {/* Packing List Review */}
      <div className="p-4 border rounded-md bg-gray-50">
          <h4 className="font-semibold mb-2">Packing List</h4>
          {selectedList.length > 0 ? (
              <ul className="list-disc pl-5">
                  {selectedList.map((item, index) => (
                      <li key={index}>{item.name} {item.mandatory && <strong>(Mandatory)</strong>}</li>
                  ))}
              </ul>
          ) : (
              <p>No packing items selected.</p>
          )}
      </div>
    </div>
  );
}

// Main Multi-Step Form
export default function CreateTrekMultiStepForm({ trekToEdit, onFormSubmit, onCancel }: CreateTrekMultiStepFormProps) {
  const { user, userProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<AdminTrekEvent>>({});
  const [selectedPackingItems, setSelectedPackingItems] = useState<Set<number>>(new Set());
  const [mandatoryPackingItems, setMandatoryPackingItems] = useState<Set<number>>(new Set());
  const [masterPackingList, setMasterPackingList] = useState<MasterPackingItem[]>([]);
  const [costs, setCosts] = useState<TrekCost[]>([]);
  const [packingListLoading, setPackingListLoading] = useState(false);
  const [packingListError, setPackingListError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [gpxFile, setGpxFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalSteps = formData.event_type === EventType.CAMPING ? 6 : 5;

  const fetchMasterList = useCallback(async () => {
    setPackingListLoading(true);
    setPackingListError(null);
    try {
      const { data, error } = await supabase.from('master_packing_items').select('*');
      if (error) throw error;
      setMasterPackingList(data || []);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      console.error("Error fetching master packing list:", error);
      setPackingListError(errorMessage);
    } finally {
      setPackingListLoading(false);
    }
  }, []);

  useEffect(() => {
    if (trekToEdit) {
      setFormData({
        trek_id: trekToEdit.trek_id,
        name: trekToEdit.name,
        description: trekToEdit.description,
        location: trekToEdit.location,
        category: trekToEdit.category,
        difficulty: trekToEdit.difficulty,
        start_datetime: trekToEdit.start_datetime ? new Date(trekToEdit.start_datetime).toISOString().slice(0, 16) : '',
        end_datetime: trekToEdit.end_datetime ? new Date(trekToEdit.end_datetime).toISOString().slice(0, 16) : '',
        base_price: trekToEdit.base_price,
        max_participants: trekToEdit.max_participants,
        status: trekToEdit.status || TrekEventStatus.DRAFT,
      });

      if (trekToEdit.image_url) {
        setImagePreview(trekToEdit.image_url);
      }

      const fetchAssignedItems = async () => {
        if (!trekToEdit.trek_id) return;
        setPackingListLoading(true);
        try {
          const { data, error } = await supabase
            .from('trek_packing_list_items')
            .select('item_id, is_mandatory')
            .eq('trek_id', trekToEdit.trek_id);
          if (error) throw error;
          
          const selected = new Set((data || []).map(item => item.item_id));
          const mandatory = new Set((data || []).filter(item => item.is_mandatory).map(item => item.item_id));
          setSelectedPackingItems(selected);
          setMandatoryPackingItems(mandatory);
        } catch (error) {
          console.error("Error fetching assigned packing items:", error);
          toast({ title: 'Error', description: 'Could not fetch assigned packing items.', variant: 'destructive' });
        } finally {
          setPackingListLoading(false);
        }
      };
      
      fetchMasterList();
      fetchAssignedItems();
    } else {
        setFormData({ 
          status: TrekEventStatus.DRAFT,
          event_type: EventType.TREK // Default to trek
        });
    }
  }, [trekToEdit, fetchMasterList]);

  function sanitizeLocation(location: unknown): string {
    if (typeof location === 'string') return location;
    if (location && typeof location === 'object' && 'name' in location && typeof (location as { name: unknown }).name === 'string') {
      return (location as { name: string }).name;
    }
    return '';
  }

  const handleGpxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setGpxFile(file);
      // Optional: Parse GPX here to show a preview if needed
      // For simplicity, we'll just store the file and process on submit
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    if (!user) {
      toast({ title: "Authentication Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    if (userProfile?.verification_status !== 'VERIFIED') {
      toast({ title: "Verification Required", description: "Your account must be verified to create treks.", variant: "destructive" });
      return;
    }
    
    setIsSubmitting(true);

    let imageUrl = trekToEdit?.image_url || null;
    if (imageFile) {
      const { data: imageData, error: imageError } = await supabase.storage
        .from('trek-assets')
        .upload(`${user.id}/${Date.now()}_${imageFile.name}`, imageFile);
      if (imageError) {
        toast({ title: "Image Upload Failed", description: imageError.message, variant: "destructive" });
        setIsSubmitting(false);
        return;
      }
      const { data: urlData } = supabase.storage.from('trek-assets').getPublicUrl(imageData.path);
      imageUrl = urlData.publicUrl;
    }

    let gpxFileUrl: string | null = null;
    if (gpxFile) {
        const { data: gpxData, error: gpxError } = await supabase.storage
            .from('trek-assets')
            .upload(`gpx/${user.id}/${Date.now()}_${gpxFile.name}`, gpxFile);
        if (gpxError) {
            toast({ title: "GPX Upload Failed", description: gpxError.message, variant: "destructive" });
            setIsSubmitting(false);
            return;
        }
        const { data: urlData } = supabase.storage.from('trek-assets').getPublicUrl(gpxData.path);
        gpxFileUrl = urlData.publicUrl;
    }

    const trekDataToSubmit = {
      ...formData,
      image_url: imageUrl,
      gpx_file_url: gpxFileUrl,
      created_by: user.id,
      location: sanitizeLocation(formData.location),
    };
    
    if (!trekToEdit) {
      delete (trekDataToSubmit as Partial<AdminTrekEvent>).trek_id;
    }

    // Handle ticket file upload for costs
    const costsWithUrls = await Promise.all(costs.map(async (cost) => {
      if (cost.cost_type === 'TICKETS' && cost.file) {
        const { data, error } = await supabase.storage
          .from('trek-assets')
          .upload(`tickets/${user.id}/${Date.now()}_${cost.file.name}`, cost.file);
        if (error) {
          throw new Error(`Failed to upload ticket: ${error.message}`);
        }
        const { data: urlData } = supabase.storage.from('trek-assets').getPublicUrl(data.path);
        return { ...cost, file_url: urlData.publicUrl, file: undefined };
      }
      return { ...cost, file: undefined };
    }));

    try {
      await onFormSubmit({
        trekData: trekDataToSubmit,
        packingList: Array.from(selectedPackingItems).map(id => ({
          master_item_id: id,
          is_mandatory: mandatoryPackingItems.has(id),
        })),
        costs: costsWithUrls.filter(c => c.amount > 0),
        tentInventory: formData.tent_inventory || [],
      });
      toast({ title: "Success", description: `Trek ${trekToEdit ? 'updated' : 'created'} successfully!` });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      console.error("Error submitting form", error);
      toast({ title: "Submission Error", description: errorMessage, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => { if (validateStep()) setStep(s => Math.min(s + 1, totalSteps)); };
  const handlePrev = () => setStep(s => Math.max(s - 1, 1));

  const getSteps = () => {
    const baseSteps = [
      { name: 'Event Type', component: <EventTypeStep formData={formData} setFormData={setFormData} errors={errors} /> },
      { name: 'Basic Details', component: <BasicDetailsStep formData={formData} setFormData={setFormData} imagePreview={imagePreview} handleImageChange={handleImageChange} gpxFile={gpxFile} handleGpxChange={handleGpxChange} errors={errors} /> },
    ];

    if (formData.event_type === EventType.CAMPING) {
      baseSteps.push({ name: 'Camping Details', component: <CampingDetailsStep formData={formData} setFormData={setFormData} errors={errors} /> });
    }

    baseSteps.push(
      { name: 'Packing List', component: <PackingListStep selectedItems={selectedPackingItems} setSelectedItems={setSelectedPackingItems} mandatoryItems={mandatoryPackingItems} setMandatoryItems={setMandatoryPackingItems} packingListLoading={packingListLoading} packingListError={packingListError} masterPackingList={masterPackingList} fetchMasterList={fetchMasterList} /> },
      { name: 'Fixed Costs', component: <FixedCostsStep costs={costs} setCosts={setCosts} /> },
      { name: 'Review & Submit', component: <ReviewStep formData={formData} costs={costs} selectedPackingItems={selectedPackingItems} mandatoryPackingItems={mandatoryPackingItems} masterPackingList={masterPackingList} imagePreview={imagePreview} gpxFile={gpxFile} /> }
    );

    return baseSteps;
  };

  const steps = getSteps();

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    
    if (step === 1) {
      // Event Type Step - minimal validation
      if (!formData.event_type) newErrors.event_type = "Please select an event type.";
    } else if (step === 2) {
      // Basic Details Step
      if (!formData.name) newErrors.name = "Name is required.";
      if (!formData.start_datetime) newErrors.start_datetime = "Start date is required.";
      if (formData.base_price === undefined || formData.base_price === null) newErrors.base_price = "Base cost is required.";
      if (formData.max_participants === undefined || formData.max_participants === null) newErrors.max_participants = "Max participants is required.";
    }
    // Steps 3+ don't need validation for now
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <Dialog open onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="sr-only">
            {formData.event_type === EventType.CAMPING ? 'Camping Event Form' : 'Trek Event Form'}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[70vh] w-full p-4">
          <div className="p-1">{steps[step - 1].component}</div>
        </ScrollArea>
        <DialogFooter>
          <div className="flex justify-between w-full">
            <div>
              {step > 1 && <Button variant="outline" onClick={handlePrev} disabled={step === 1 || isSubmitting}>Previous</Button>}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={onCancel}>Cancel</Button>
              {step < totalSteps ? (
                <Button onClick={handleNext} disabled={isSubmitting}>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                  {trekToEdit 
                    ? `Update ${formData.event_type === EventType.CAMPING ? 'Event' : 'Trek'}` 
                    : `Create ${formData.event_type === EventType.CAMPING ? 'Camping Event' : 'Trek'}`
                  }
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
