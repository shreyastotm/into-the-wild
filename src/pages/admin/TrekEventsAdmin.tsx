import React, { useState, useEffect, useCallback } from 'react';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { 
  DialogContent as UiDialogContent, 
  DialogFooter, 
  DialogClose 
} from "@/components/ui/dialog";
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
import CreateTrekMultiStepForm from '@/components/trek/CreateTrekMultiStepForm';
import { TrekEventStatus } from '@/types/trek';

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
  route_data?: any | null;
}

const TrekEventsAdmin = () => {
  const [treks, setTreks] = useState<TrekEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [trekToEdit, setTrekToEdit] = useState<TrekEvent | null>(null);

  const fetchTreks = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('trek_events')
        .select('trek_id, name, description, location, category, difficulty, start_datetime, end_datetime, base_price, max_participants, status, image_url, gpx_file_url, route_data')
        .order('start_datetime', { ascending: false }); 
      
      if (fetchError) throw fetchError;
      setTreks((data as TrekEvent[]) || []);
    } catch (err: any) {
      setError(`Failed to fetch treks: ${err.message}`);
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTreks();
  }, [fetchTreks]);

  const handleStatusChange = async (trekId: number, newStatus: TrekEventStatus) => {
    try {
      const { error: updateError } = await supabase
        .from('trek_events')
        .update({ status: newStatus })
        .eq('trek_id', trekId);

      if (updateError) throw updateError;

      // Update local state to reflect change immediately
      setTreks(prevTreks => 
        prevTreks.map(t => 
          t.trek_id === trekId ? { ...t, status: newStatus } : t
        )
      );
      // Optionally, show a success toast
      // toast({ title: "Status Updated", description: `Trek status changed to ${newStatus}` });
    } catch (err: any) {
      setError(`Failed to update status: ${err.message}`);
      console.error("Status update error:", err);
      // Optionally, show an error toast
      // toast({ title: "Error Updating Status", description: err.message, variant: "destructive" });
    }
  };

  const handleEdit = (trek: TrekEvent) => {
    setTrekToEdit(trek);
    setEditDialogOpen(true);
  };

  const handleAddNew = () => {
    setTrekToEdit(null);
    setEditDialogOpen(true);
  };

  const handleFormSubmit = async ({ trekData, packingList }) => {
    setFormSubmitting(true);
    setError(null);

    try {
        let trekIdToUpdate;
        // Step 1: Upsert the main trek data
        if (trekToEdit?.trek_id) {
            // We are editing an existing trek
            trekIdToUpdate = trekToEdit.trek_id;
            const { error: trekError } = await supabase
                .from('trek_events')
                .update(trekData)
                .eq('trek_id', trekIdToUpdate);

            if (trekError) throw new Error(`Failed to update trek: ${trekError.message}`);
        } else {
            // We are creating a new trek
            const { data: newTrek, error: trekError } = await supabase
                .from('trek_events')
                .insert(trekData)
                .select('trek_id')
                .single();

            if (trekError) throw new Error(`Failed to create trek: ${trekError.message}`);
            trekIdToUpdate = newTrek.trek_id;
        }

        if (!trekIdToUpdate) {
            throw new Error("Could not determine trek ID for packing list update.");
        }

        // Step 2: Clear existing packing list assignments for this trek
        const { error: deleteError } = await supabase
            .from('trek_packing_list_assignments')
            .delete()
            .eq('trek_id', trekIdToUpdate);
        
        if (deleteError) {
            // Log the error but don't block the user; maybe the table was empty.
            console.warn(`Could not clear old packing list, continuing...`, deleteError);
        }

        // Step 3: Insert new packing list assignments if any are provided
        if (packingList && packingList.length > 0) {
            const assignments = packingList.map(item => ({
                trek_id: trekIdToUpdate,
                master_item_id: item.master_item_id,
                mandatory: item.is_mandatory,
            }));

            const { error: assignmentError } = await supabase
                .from('trek_packing_list_assignments')
                .insert(assignments);

            if (assignmentError) throw new Error(`Failed to assign packing list: ${assignmentError.message}`);
        }

        // Step 4: Refresh UI
        await fetchTreks();
        setEditDialogOpen(false);
        setTrekToEdit(null);

    } catch (e: any) {
        setError(`Submission failed: ${e.message}`);
        console.error("Form submission error:", e);
    } finally {
        setFormSubmitting(false);
    }
  };

  const handleFormCancel = () => {
    setEditDialogOpen(false);
    setTrekToEdit(null);
    setError(null);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Trek Events</h1>

      <Button onClick={handleAddNew} className="mb-4">Add New Trek</Button>

      {error && !isEditDialogOpen && <p className="text-red-500 mb-4">{error}</p>} 
      {loading && !isEditDialogOpen && <p>Loading treks...</p>}

      {!loading && treks.length > 0 && (
         <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Participants</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {treks.map((trek) => (
                <TableRow key={trek.trek_id}>
                  <TableCell>{trek.name}</TableCell>
                  <TableCell>{format(new Date(trek.start_datetime), 'PPP')}</TableCell> 
                  <TableCell>
                    <Select
                      value={trek.status || ''}
                      onValueChange={(newStatusValue) => {
                        handleStatusChange(trek.trek_id, newStatusValue as TrekEventStatus);
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
                  <TableCell>{trek.base_price !== null && trek.base_price !== undefined ? `₹${trek.base_price}` : 'N/A'}</TableCell>
                  <TableCell>{trek.max_participants}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(trek)}>
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
      )}
      {!loading && treks.length === 0 && !error && <p>No treks found.</p>}

      <Dialog open={isEditDialogOpen} onOpenChange={(open) => { 
          if (!open) {
            handleFormCancel();
          } else {
          setEditDialogOpen(open); 
          }
       }}>
        <DialogContent className="sm:max-w-2xl p-0">
          {isEditDialogOpen && (
            <CreateTrekMultiStepForm 
              trekToEdit={trekToEdit} 
              onFormSubmit={handleFormSubmit} 
              onCancel={handleFormCancel} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TrekEventsAdmin; 