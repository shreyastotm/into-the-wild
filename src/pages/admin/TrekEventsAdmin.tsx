import React, { useState, useEffect, useCallback } from 'react';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

// Dialog imports removed - CreateTrekMultiStepFormNew handles its own dialog
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { supabase } from '../../integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import CreateTrekMultiStepFormNew from '@/components/trek/CreateTrekMultiStepFormNew';
import { TrekEventStatus, EventType } from '@/types/trek';

interface TrekEvent { 
  trek_id: number;
  name: string;
  description?: string | null;
  location?: string | null;
  category?: string | null;
  difficulty?: string | null;
  start_datetime: string;
  end_datetime?: string | null;
  base_price?: number | null;
  max_participants: number;
  status?: TrekEventStatus | string | null;
  image_url?: string | null;
  gpx_file_url?: string | null;
  route_data?: Record<string, unknown> | null;
  event_type?: EventType;
}

const TrekEventsAdmin = () => {
  const [events, setEvents] = useState<TrekEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [eventToEdit, setEventToEdit] = useState<TrekEvent | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('trek_events')
        .select('trek_id, name, description, location, category, difficulty, start_datetime, end_datetime, base_price, max_participants, status, image_url, gpx_file_url, route_data, event_type')
        .order('start_datetime', { ascending: false }); 
      
      if (fetchError) throw fetchError;
      setEvents((data as TrekEvent[]) || []);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch events";
      setError(`Failed to fetch events: ${errorMessage}`);
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleStatusChange = async (trekId: number, newStatus: TrekEventStatus) => {
    try {
      const { error: updateError } = await supabase
        .from('trek_events')
        .update({ status: newStatus })
        .eq('trek_id', trekId);

      if (updateError) throw updateError;

      // Update local state to reflect change immediately
      setEvents(prevEvents => 
        prevEvents.map(e => 
          e.trek_id === trekId ? { ...e, status: newStatus } : e
        )
      );
      // Optionally, show a success toast
      // toast({ title: "Status Updated", description: `Event status changed to ${newStatus}` });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update status";
      setError(`Failed to update status: ${errorMessage}`);
      console.error("Status update error:", err);
      // Optionally, show an error toast
      // toast({ title: "Error Updating Status", description: err.message, variant: "destructive" });
    }
  };

  const handleEdit = (event: TrekEvent) => {
    setEventToEdit(event);
    setEditDialogOpen(true);
  };

  const handleAddNew = () => {
    setEventToEdit(null);
    setEditDialogOpen(true);
  };

  const handleFormSubmit = async ({ trekData, packingList, costs, tentInventory }) => {
    setFormSubmitting(true);
    setError(null);

    // Debug: Log the incoming data to understand the issue

    // Sanitize date fields before submission
    const sanitizedTrekData = {
      ...trekData,
      start_datetime: trekData.start_datetime || null,
      end_datetime: trekData.end_datetime || null,
    };


    // Validate required fields before submission
    if (!sanitizedTrekData.name || sanitizedTrekData.name.trim() === '') {
      throw new Error('Event name is required and cannot be empty.');
    }

    if (!sanitizedTrekData.event_type) {
      throw new Error('Event type is required.');
    }

    if (!sanitizedTrekData.start_datetime) {
      throw new Error('Start date and time is required.');
    }

    try {
        let trekIdToUpdate;
        // Step 1: Upsert the main trek data
        if (eventToEdit?.trek_id) {
            trekIdToUpdate = eventToEdit.trek_id;
            const { error: trekError } = await supabase
                .from('trek_events')
                .update(sanitizedTrekData)
                .eq('trek_id', trekIdToUpdate);
            if (trekError) throw new Error(`Failed to update trek: ${trekError.message}`);
        } else {
            const { data: newTrek, error: trekError } = await supabase
                .from('trek_events')
                .insert(sanitizedTrekData)
                .select('trek_id')
                .single();
            if (trekError) throw new Error(`Failed to create trek: ${trekError.message}`);
            trekIdToUpdate = newTrek.trek_id;
        }

        if (!trekIdToUpdate) {
            throw new Error("Could not determine trek ID for subsequent updates.");
        }

        // Step 2: Clear and re-insert packing list assignments
        await supabase.from('trek_packing_list_assignments').delete().eq('trek_id', trekIdToUpdate);
        if (packingList && packingList.length > 0) {
            const assignments = packingList.map(item => ({ trek_id: trekIdToUpdate, master_item_id: item.master_item_id, mandatory: item.is_mandatory }));
            const { error: assignmentError } = await supabase.from('trek_packing_list_assignments').insert(assignments);
            if (assignmentError) throw new Error(`Failed to assign packing list: ${assignmentError.message}`);
        }

        // Step 3: Clear and re-insert fixed costs
        await supabase.from('trek_costs').delete().eq('trek_id', trekIdToUpdate);
        if (costs && costs.length > 0) {
          const costsToInsert = costs.map(cost => ({
            trek_id: trekIdToUpdate,
            cost_type: cost.cost_type,
            amount: cost.amount,
            description: cost.description,
            url: cost.url,
            file_url: cost.file_url,
          }));
          const { error: costError } = await supabase.from('trek_costs').insert(costsToInsert);
          if (costError) throw new Error(`Failed to save costs: ${costError.message}`);
        }

        // Step 4: Handle tent inventory for camping events
        if (trekData.event_type === 'camping' && tentInventory && tentInventory.length > 0) {
          // Clear existing tent inventory for this event
          await supabase.from('tent_inventory').delete().eq('event_id', trekIdToUpdate);
          
          // Insert new tent inventory
          const tentInventoryToInsert = tentInventory
            .filter(tent => tent.total_available > 0) // Only insert tents with availability > 0
            .map(tent => ({
              event_id: trekIdToUpdate,
              tent_type_id: tent.tent_type_id,
              total_available: tent.total_available,
              reserved_count: 0
            }));
          
          if (tentInventoryToInsert.length > 0) {
            const { error: tentError } = await supabase.from('tent_inventory').insert(tentInventoryToInsert);
            if (tentError) throw new Error(`Failed to save tent inventory: ${tentError.message}`);
          }
        }

        // Step 5: Refresh UI
        await fetchEvents();
        setEditDialogOpen(false);
        setEventToEdit(null);

    } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : "Submission failed";
        setError(`Submission failed: ${errorMessage}`);
        console.error("Form submission error:", e);
    } finally {
        setFormSubmitting(false);
    }
  };

  const handleFormCancel = () => {
    setEditDialogOpen(false);
    setEventToEdit(null);
    setError(null);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Events</h1>

      <Button onClick={handleAddNew} className="mb-4">Create New Event</Button>

      {error && !isEditDialogOpen && <p className="text-red-500 mb-4">{error}</p>} 
      {loading && !isEditDialogOpen && <p>Loading events...</p>}

      {!loading && events.length > 0 && (
         <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Participants</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.trek_id}>
                  <TableCell>{event.name}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      event.event_type === EventType.CAMPING 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {event.event_type === EventType.CAMPING ? 'Camping' : 'Trek'}
                    </span>
                  </TableCell>
                  <TableCell>{format(new Date(event.start_datetime), 'PPP')}</TableCell> 
                  <TableCell>
                    <Select
                      value={event.status || ''}
                      onValueChange={(newStatusValue) => {
                        handleStatusChange(event.trek_id, newStatusValue as TrekEventStatus);
                      }}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Set status" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(TrekEventStatus).map((statusVal) => (
                          <SelectItem key={statusVal} value={statusVal}>
                            {statusVal}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>{event.base_price !== null && event.base_price !== undefined ? `₹${event.base_price}` : 'N/A'}</TableCell>
                  <TableCell>{event.max_participants}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(event)}>
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
      )}
      {!loading && events.length === 0 && !error && <p>No events found.</p>}

      {isEditDialogOpen && (
        <CreateTrekMultiStepFormNew 
          trekToEdit={eventToEdit} 
          onFormSubmit={handleFormSubmit} 
          onCancel={handleFormCancel} 
        />
      )}
    </div>
  );
};

export default TrekEventsAdmin; 