import React, { useState, useEffect, useMemo, useCallback } from 'react';
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

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from 'zod';
import { supabase } from '../../integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TrekEvent { 
  trek_id: number;
  name: string;
  description?: string | null;
  location?: string | null;
  category?: string | null;
  difficulty?: string | null;
  start_datetime: string; // From Supabase
  end_datetime?: string | null; // From Supabase
  base_price?: number | null;
  max_participants: number;
  status?: string | null;
  image_url?: string | null;
  // Add other fields corresponding to your trek_events table
}

const formSchema = z.object({ 
  name: z.string().min(1, { message: "Trek name is required." }),
  description: z.string().optional(),
  location: z.string().optional(),
  category: z.string().optional(),
  difficulty: z.string().optional(),
  start_datetime: z.date({ required_error: "Start date is required." }), // Use z.date()
  end_datetime: z.date().optional(), // Use z.date()
  base_price: z.preprocess(
    (val) => (val === "" || val === undefined || val === null || Number.isNaN(Number(val))) ? undefined : Number(val),
    z.number().positive({ message: "Base price must be a positive number." }).optional()
  ),
  max_participants: z.preprocess(
    (val) => (val === "" || val === undefined || val === null || Number.isNaN(Number(val))) ? undefined : Number(val),
    z.number().int().positive({ message: "Max participants must be a positive integer." })
  ),
  status: z.string().optional(),
  image_url: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  // Ensure all fields used in the form are in the schema
});

type TrekFormValues = z.infer<typeof formSchema>;

const TrekEventsAdmin = () => {
  const [treks, setTreks] = useState<TrekEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [trekToEdit, setTrekToEdit] = useState<TrekEvent | null>(null);

  const fetchTreks = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('trek_events')
        // Temporarily removed end_datetime to resolve TS error - investigate schema sync later
        .select('trek_id, name, description, location, category, difficulty, start_datetime, base_price, max_participants, status, image_url'); 
      
      if (fetchError) throw fetchError;
      // Cast to TrekEvent[] - assuming the fetched data matches the relevant parts
      setTreks((data as any[]) || []); // Use any[] temporarily due to type mismatch error
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

  const handleEdit = (trek: TrekEvent) => {
    setTrekToEdit(trek);
    setEditDialogOpen(true);
  };

  const handleAddNew = () => {
    setTrekToEdit(null);
    setEditDialogOpen(true);
  };

  // Define default values based on whether editing or adding
  const defaultValues: Partial<TrekFormValues> = useMemo(() => ({
    name: trekToEdit?.name ?? '',
    description: trekToEdit?.description ?? '',
    location: trekToEdit?.location ?? '',
    category: trekToEdit?.category ?? '',
    difficulty: trekToEdit?.difficulty ?? '',
    start_datetime: trekToEdit?.start_datetime ? new Date(trekToEdit.start_datetime) : undefined,
    end_datetime: undefined, // Explicitly set to undefined for now
    base_price: trekToEdit?.base_price ?? undefined,
    max_participants: trekToEdit?.max_participants ?? undefined,
    status: trekToEdit?.status ?? 'Draft',
    image_url: trekToEdit?.image_url ?? '',
  }), [trekToEdit]);

  const form = useForm<TrekFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: 'onChange', // Or 'onBlur' depending on preference
  });

  // Reset form when dialog opens or trekToEdit changes
  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  const onSubmit = async (data: TrekFormValues) => {
    setLoading(true);
    setError(null);

    // Construct the object for Supabase ensuring required fields are present
    const baseData = {
        name: data.name, // name is required by schema
        description: data.description || null,
        location: data.location || null,
        category: data.category || null,
        difficulty: data.difficulty || null,
        start_datetime: data.start_datetime.toISOString(), // required by schema
        end_datetime: data.end_datetime?.toISOString() || null,
        base_price: data.base_price ?? null, // Use null if undefined/NaN
        max_participants: Number(data.max_participants), // required by schema
        status: data.status || 'Draft',
        image_url: data.image_url || null,
    };

    // Conditionally add trek_id only when editing
    const upsertData = trekToEdit 
        ? { ...baseData, trek_id: trekToEdit.trek_id } 
        : baseData;

    console.log("Submitting data:", upsertData);

    try {
      const { error: upsertError } = await supabase
        .from('trek_events')
        .upsert(upsertData)
        .select('trek_id') 
        .single();

      if (upsertError) {
        throw upsertError;
      }

      await fetchTreks(); 
      setEditDialogOpen(false);
      setTrekToEdit(null); 

    } catch (err: any) {
      console.error('Error submitting trek:', err);
      setError(`Error saving trek: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Trek Events</h1>

      <Button onClick={handleAddNew} className="mb-4">Add New Trek</Button>

      {/* Error Display */}
      {error && !isEditDialogOpen && <p className="text-red-500 mb-4">{error}</p>} 

      {/* Loading State */}
      {loading && !isEditDialogOpen && <p>Loading treks...</p>}

      {/* Treks Table */}
      {!loading && treks.length > 0 && (
         <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {treks.map((trek) => (
                <TableRow key={trek.trek_id}>
                  <TableCell>{trek.name}</TableCell>
                  <TableCell>{format(new Date(trek.start_datetime), 'PPP')}</TableCell> 
                  <TableCell>{trek.status || 'N/A'}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(trek)}>
                      Edit
                    </Button>
                    {/* Add Delete button/logic here if needed */}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
      )}
      {!loading && treks.length === 0 && !error && <p>No treks found.</p>}

      {/* Add/Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => { 
          setEditDialogOpen(open); 
          if (!open) setTrekToEdit(null); // Clear trekToEdit when closing
          setError(null); // Clear dialog error on close
       }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{trekToEdit ? 'Edit Trek Event' : 'Add New Trek Event'}</DialogTitle>
            <DialogDescription>
              {trekToEdit ? 'Update the details for this trek.' : 'Fill in the details for the new trek.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Trek Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trek Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter trek name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter trek description" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Location */}
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter general location (e.g., Lonavala)" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {/* Category */}
                 <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        {/* Consider changing to Select if categories become fixed */}
                        <Input placeholder="Enter category (e.g., Monsoon Trek)" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Difficulty */}
                 <FormField
                  control={form.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Difficulty</FormLabel>
                      <FormControl>
                         {/* Consider changing to Select (Easy, Medium, Hard) */}
                        <Input placeholder="Enter difficulty (e.g., Easy, Medium)" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Image URL */}
              <FormField
                control={form.control}
                name="image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input type="url" placeholder="Enter image URL (optional)" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4"> {/* Grid for dates */}
                {/* Start DateTime */}
                <FormField
                  control={form.control}
                  name="start_datetime"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date & Time</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP HH:mm") // Display date and time
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            // Handle date selection - keeps existing time
                            onSelect={(date) => {
                              if (!date) return;
                              const currentVal = field.value || new Date();
                              date.setHours(currentVal.getHours());
                              date.setMinutes(currentVal.getMinutes());
                              date.setSeconds(0); // Clear seconds
                              field.onChange(date);
                            }}
                            initialFocus
                          />
                          {/* Time Input within Popover */}
                          <div className="p-3 border-t border-border">
                              <FormLabel className="text-sm">Time</FormLabel>
                              <Input 
                                type="time"
                                className="mt-1 w-full" // Ensure full width
                                value={field.value ? format(field.value, 'HH:mm') : ''}
                                onChange={(e) => {
                                    const time = e.target.value;
                                    if (!time) return;
                                    const [hours, minutes] = time.split(':').map(Number);
                                    const newDate = field.value ? new Date(field.value) : new Date();
                                    newDate.setHours(hours);
                                    newDate.setMinutes(minutes);
                                    newDate.setSeconds(0);
                                    field.onChange(newDate);
                                }}
                              />
                          </div>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* End DateTime */}
                 <FormField
                  control={form.control}
                  name="end_datetime" // Corrected name
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date & Time</FormLabel>
                       <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP HH:mm") // Display date and time
                              ) : (
                                <span>Pick a date (optional)</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            // Handle date selection - keeps existing time
                            onSelect={(date) => {
                              if (!date) { // Allow clearing optional date
                                  field.onChange(undefined);
                                  return;
                              }
                              const currentVal = field.value || new Date();
                              date.setHours(currentVal.getHours());
                              date.setMinutes(currentVal.getMinutes());
                              date.setSeconds(0);
                              field.onChange(date);
                            }}
                            // Add disabled prop to prevent selecting dates before start_datetime
                            disabled={(date) =>
                              form.getValues("start_datetime") ? date < form.getValues("start_datetime") : false
                            }
                            initialFocus
                          />
                           {/* Time Input within Popover */}
                           <div className="p-3 border-t border-border">
                              <FormLabel className="text-sm">Time</FormLabel>
                              <Input 
                                type="time"
                                className="mt-1 w-full"
                                // Disable time if no date is selected
                                disabled={!field.value} 
                                value={field.value ? format(field.value, 'HH:mm') : ''}
                                  onChange={(e) => {
                                    const time = e.target.value;
                                    if (!time || !field.value) return; // Need a date to set time on
                                    const [hours, minutes] = time.split(':').map(Number);
                                    // Create a new date object from existing field value to avoid mutation issues
                                    const newDate = new Date(field.value); 
                                    newDate.setHours(hours);
                                    newDate.setMinutes(minutes);
                                    newDate.setSeconds(0);
                                    field.onChange(newDate);
                                }}
                              />
                          </div>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4"> {/* Grid for price/participants */}
                {/* Base Price */}
                <FormField
                  control={form.control}
                  name="base_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base Price</FormLabel>
                      <FormControl>
                        {/* Use field.onChange to handle number conversion */}
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="Enter base price (optional)" 
                          {...field} 
                          value={field.value ?? ''} 
                          onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} // Handle empty string
                         />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Max Participants */}
                <FormField
                  control={form.control}
                  name="max_participants"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Participants</FormLabel>
                      <FormControl>
                         <Input 
                          type="number" 
                          placeholder="Enter max participants" 
                          {...field} 
                          value={field.value ?? ''} 
                          onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))} // Handle empty string & ensure integer
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Status */}
              <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                      <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? 'Draft'}> {/* Controlled component */}
                          <FormControl>
                          <SelectTrigger>
                              <SelectValue placeholder="Select trek status" />
                          </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                              <SelectItem value="Draft">Draft</SelectItem> 
                              <SelectItem value="Published">Published</SelectItem>
                              <SelectItem value="Completed">Completed</SelectItem>
                              <SelectItem value="Cancelled">Cancelled</SelectItem>
                          </SelectContent>
                      </Select>
                      <FormMessage />
                      </FormItem>
                  )}
                  />

              {/* Error Message Display inside Dialog */}
              {error && <p className="text-sm font-medium text-destructive pt-2">{error}</p>}

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={loading || !form.formState.isValid}>{loading ? 'Saving...' : 'Save Trek'}</Button> {/* Add isValid check */}
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TrekEventsAdmin; 