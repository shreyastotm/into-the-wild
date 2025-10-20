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
import { toast } from '@/components/ui/use-toast';
import { Trash2, Eye, Copy, Search, Filter, Download, CheckSquare, Square } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [eventToDelete, setEventToDelete] = useState<TrekEvent | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [selectedEvents, setSelectedEvents] = useState<number[]>([]);
  const [isBulkActionLoading, setIsBulkActionLoading] = useState<boolean>(false);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('trek_events')
        .select('trek_id, name, description, location, category, difficulty, start_datetime, end_datetime, base_price, max_participants, status, image_url, image, gpx_file_url, route_data, event_type, government_id_required')
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

  const handleDelete = (event: TrekEvent) => {
    setEventToDelete(event);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!eventToDelete) return;
    
    setIsDeleting(true);
    try {
      // First, check if there are any registrations for this event
      const { data: registrations, error: regError } = await supabase
        .from('trek_registrations')
        .select('registration_id')
        .eq('trek_id', eventToDelete.trek_id);

      if (regError) throw regError;

      if (registrations && registrations.length > 0) {
        toast({
          title: "Cannot Delete Event",
          description: `This event has ${registrations.length} registration(s). Please cancel or complete the event instead of deleting it.`,
          variant: "destructive",
        });
        return;
      }

      // Delete related data first (in order of dependencies)
      await supabase.from('trek_packing_list_assignments').delete().eq('trek_id', eventToDelete.trek_id);
      await supabase.from('trek_costs').delete().eq('trek_id', eventToDelete.trek_id);
      await supabase.from('tent_inventory').delete().eq('event_id', eventToDelete.trek_id);
      await supabase.from('trek_event_images').delete().eq('trek_id', eventToDelete.trek_id);

      // Finally delete the main event
      const { error: deleteError } = await supabase
        .from('trek_events')
        .delete()
        .eq('trek_id', eventToDelete.trek_id);

      if (deleteError) throw deleteError;

      toast({
        title: "Event Deleted",
        description: `"${eventToDelete.name}" has been successfully deleted.`,
      });

      // Refresh the events list
      await fetchEvents();
      setDeleteDialogOpen(false);
      setEventToDelete(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete event";
      toast({
        title: "Error Deleting Event",
        description: errorMessage,
        variant: "destructive",
      });
      console.error("Delete error:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDuplicate = async (event: TrekEvent) => {
    try {
      const { data: newEvent, error: insertError } = await supabase
        .from('trek_events')
        .insert({
          name: `${event.name} (Copy)`,
          description: event.description,
          location: event.location,
          category: event.category,
          difficulty: event.difficulty,
          start_datetime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
          base_price: event.base_price,
          max_participants: event.max_participants,
          status: TrekEventStatus.DRAFT,
          event_type: event.event_type,
          image_url: event.image_url,
          gpx_file_url: event.gpx_file_url,
        })
        .select('trek_id')
        .single();

      if (insertError) throw insertError;

      toast({
        title: "Event Duplicated",
        description: `"${event.name}" has been duplicated successfully.`,
      });

      await fetchEvents();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to duplicate event";
      toast({
        title: "Error Duplicating Event",
        description: errorMessage,
        variant: "destructive",
      });
      console.error("Duplicate error:", err);
    }
  };

  const handleViewEvent = (event: TrekEvent) => {
    // Navigate to the event details page
    window.open(`/trek-events/${event.trek_id}`, '_blank');
  };

  const handleExportEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('trek_events')
        .select('*')
        .order('start_datetime', { ascending: false });

      if (error) throw error;

      // Convert to CSV
      const headers = ['ID', 'Name', 'Description', 'Location', 'Category', 'Start Date', 'End Date', 'Price', 'Max Participants', 'Status', 'Event Type'];
      const csvContent = [
        headers.join(','),
        ...(data || []).map(event => [
          event.trek_id,
          `"${event.name || ''}"`,
          `"${event.description || ''}"`,
          `"${event.location || ''}"`,
          `"${event.category || ''}"`,
          event.start_datetime,
          event.end_datetime || '',
          event.base_price || '',
          event.max_participants,
          event.status || '',
          event.event_type || ''
        ].join(','))
      ].join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `events-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: "Events data has been exported to CSV.",
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to export events";
      toast({
        title: "Export Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Filter events based on search and filters
  const filteredEvents = events.filter(event => {
    const matchesSearch = !searchTerm || 
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (event.location && event.location.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = !statusFilter || statusFilter === 'all' || event.status === statusFilter;
    const matchesType = !typeFilter || typeFilter === 'all' || event.event_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleSelectEvent = (eventId: number, checked: boolean) => {
    if (checked) {
      setSelectedEvents(prev => [...prev, eventId]);
    } else {
      setSelectedEvents(prev => prev.filter(id => id !== eventId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEvents(filteredEvents.map(event => event.trek_id));
    } else {
      setSelectedEvents([]);
    }
  };

  const handleBulkStatusChange = async (newStatus: TrekEventStatus) => {
    if (selectedEvents.length === 0) return;
    
    setIsBulkActionLoading(true);
    try {
      const { error } = await supabase
        .from('trek_events')
        .update({ status: newStatus })
        .in('trek_id', selectedEvents);

      if (error) throw error;

      toast({
        title: "Bulk Update Successful",
        description: `Updated ${selectedEvents.length} event(s) to ${newStatus} status.`,
      });

      await fetchEvents();
      setSelectedEvents([]);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update events";
      toast({
        title: "Bulk Update Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsBulkActionLoading(false);
    }
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
        console.log('Admin Form: Deleting existing packing list for trek', trekIdToUpdate);
        await supabase.from('trek_packing_list_assignments').delete().eq('trek_id', trekIdToUpdate);

        if (packingList && packingList.length > 0) {
            console.log('Admin Form: Inserting new packing list:', packingList);
            const assignments = packingList.map(item => ({ trek_id: trekIdToUpdate, master_item_id: item.master_item_id, mandatory: item.mandatory }));
            const { error: assignmentError } = await supabase.from('trek_packing_list_assignments').insert(assignments);
            if (assignmentError) {
                console.error('Admin Form: Packing list assignment error:', assignmentError);
                throw new Error(`Failed to assign packing list: ${assignmentError.message}`);
            } else {
                console.log('Admin Form: Packing list saved successfully');
            }
        } else {
            console.log('Admin Form: No packing list data to save');
        }

        // Step 3: Clear and re-insert fixed costs
        await supabase.from('trek_costs').delete().eq('trek_id', trekIdToUpdate);
        if (costs && costs.length > 0) {
          const costsToInsert = costs
            .filter(cost => cost && cost.amount && cost.amount > 0) // Filter out invalid costs
            .map(cost => ({
              trek_id: trekIdToUpdate,
              cost_type: cost.cost_type || 'OTHER', // Ensure cost_type is never null
              amount: cost.amount,
              description: cost.description || '',
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
    <div className="py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Manage Events</h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={handleExportEvents} variant="outline" size="sm" className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={handleAddNew} className="w-full sm:w-auto">
            Create New Event
          </Button>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6 p-3 sm:p-4 bg-muted/30 dark:bg-muted/20 rounded-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.values(TrekEventStatus).map(status => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="trek">Trek</SelectItem>
              <SelectItem value="camping">Camping</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('');
              setTypeFilter('');
            }}
            className="w-full sm:w-auto"
          >
            <Filter className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        </div>
      </div>

      {error && !isEditDialogOpen && <p className="text-red-500 mb-4">{error}</p>} 
      {loading && !isEditDialogOpen && <p>Loading events...</p>}

      {/* Bulk Actions */}
      {selectedEvents.length > 0 && (
        <div className="mb-4 p-4 bg-info/10 border border-info/20 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-info-foreground">
              {selectedEvents.length} event(s) selected
            </span>
            <div className="flex gap-2">
              <Select onValueChange={handleBulkStatusChange} disabled={isBulkActionLoading}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Bulk status change" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(TrekEventStatus).map(status => (
                    <SelectItem key={status} value={status}>
                      Set to {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSelectedEvents([])}
                disabled={isBulkActionLoading}
              >
                Clear Selection
              </Button>
            </div>
          </div>
        </div>
      )}

      {!loading && filteredEvents.length > 0 && (
        <>
          {/* Mobile Card Layout */}
          <div className="block md:hidden space-y-4">
            {filteredEvents.map((event) => (
              <div key={event.trek_id} className="border rounded-lg p-4 bg-white shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSelectEvent(event.trek_id, !selectedEvents.includes(event.trek_id))}
                      className="p-1"
                    >
                      {selectedEvents.includes(event.trek_id) ? (
                        <CheckSquare className="h-4 w-4 text-primary dark:text-primary" />
                      ) : (
                        <Square className="h-4 w-4 text-muted-foreground dark:text-muted-foreground" />
                      )}
                    </Button>
                    <h3 className="font-semibold text-sm line-clamp-2">{event.name}</h3>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    event.event_type === EventType.CAMPING 
                      ? 'bg-success/10 text-success border border-success/20 dark:bg-success/20 dark:text-success-foreground dark:border-success/30'
                      : 'bg-info/10 text-info border border-info/20 dark:bg-info/20 dark:text-info-foreground dark:border-info/30'
                  }`}>
                    {event.event_type === EventType.CAMPING ? 'Camping' : 'Trek'}
                  </span>
                </div>
                
                <div className="space-y-2 text-xs text-muted-foreground mb-3">
                  <div className="flex justify-between">
                    <span>Start Date:</span>
                    <span>{format(new Date(event.start_datetime), 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price:</span>
                    <span>{event.base_price !== null && event.base_price !== undefined ? `₹${event.base_price}` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Max Participants:</span>
                    <span>{event.max_participants}</span>
                  </div>
                </div>
                
                <div className="mb-3">
                  <Select
                    value={event.status || ''}
                    onValueChange={(newStatusValue) => {
                      handleStatusChange(event.trek_id, newStatusValue as TrekEventStatus);
                    }}
                  >
                    <SelectTrigger className="w-full">
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
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleViewEvent(event)}
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEdit(event)}
                    className="flex-1"
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDuplicate(event)}
                    className="flex-1"
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handleDelete(event)}
                    className="flex-1"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table Layout */}
          <div className="hidden md:block overflow-x-auto border rounded-lg bg-card/80 dark:bg-card/60">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSelectAll(selectedEvents.length !== filteredEvents.length)}
                    >
                      {selectedEvents.length === filteredEvents.length ? (
                        <CheckSquare className="h-4 w-4 text-primary dark:text-primary" />
                      ) : (
                        <Square className="h-4 w-4 text-muted-foreground dark:text-muted-foreground" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead className="text-foreground dark:text-foreground">Name</TableHead>
                  <TableHead className="text-foreground dark:text-foreground">Type</TableHead>
                  <TableHead className="text-foreground dark:text-foreground">Start Date</TableHead>
                  <TableHead className="text-foreground dark:text-foreground">Status</TableHead>
                  <TableHead className="text-foreground dark:text-foreground">Price</TableHead>
                  <TableHead className="text-foreground dark:text-foreground">Participants</TableHead>
                  <TableHead className="text-foreground dark:text-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((event) => (
                  <TableRow key={event.trek_id}>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSelectEvent(event.trek_id, !selectedEvents.includes(event.trek_id))}
                      >
                        {selectedEvents.includes(event.trek_id) ? (
                          <CheckSquare className="h-4 w-4 text-primary dark:text-primary" />
                        ) : (
                          <Square className="h-4 w-4 text-muted-foreground dark:text-muted-foreground" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell>{event.name}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        event.event_type === EventType.CAMPING 
                          ? 'bg-success/10 text-success border border-success/20 dark:bg-success/20 dark:text-success-foreground dark:border-success/30'
                          : 'bg-info/10 text-info border border-info/20 dark:bg-info/20 dark:text-info-foreground dark:border-info/30'
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
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleViewEvent(event)}
                          title="View Event"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEdit(event)}
                          title="Edit Event"
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDuplicate(event)}
                          title="Duplicate Event"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleDelete(event)}
                          title="Delete Event"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
      {!loading && filteredEvents.length === 0 && events.length > 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No events match your current filters.</p>
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('');
              setTypeFilter('');
            }}
            className="mt-2"
          >
            Clear Filters
          </Button>
        </div>
      )}
      {!loading && events.length === 0 && !error && <p>No events found.</p>}

      {isEditDialogOpen && (
        <CreateTrekMultiStepFormNew 
          trekToEdit={eventToEdit} 
          onFormSubmit={handleFormSubmit} 
          onCancel={handleFormCancel} 
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{eventToDelete?.name}"? This action cannot be undone.
              {eventToDelete && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800">
                    <strong>Warning:</strong> This will permanently delete the event and all associated data including:
                  </p>
                  <ul className="text-sm text-red-700 mt-1 ml-4 list-disc">
                    <li>Event details and settings</li>
                    <li>Packing list assignments</li>
                    <li>Cost information</li>
                    <li>Tent inventory (for camping events)</li>
                    <li>Event images</li>
                  </ul>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete Event"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TrekEventsAdmin; 