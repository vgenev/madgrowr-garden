import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import type { JournalEntry, Bed } from '@shared/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Edit, Trash2, CalendarIcon, BookHeart } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
const journalSchema = z.object({
  date: z.date({ message: "A date is required." }),
  notes: z.string().min(3, { message: "Notes must be at least 3 characters." }),
  bedId: z.string().optional(),
});
type JournalFormData = z.infer<typeof journalSchema>;
function JournalForm({ entry, onFinished }: { entry?: JournalEntry; onFinished: () => void }) {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const defaultBedId = searchParams.get('bedId') || undefined;
  const { data: beds } = useQuery<Bed[]>({ queryKey: ['beds'], queryFn: () => api('/api/beds') });
  const form = useForm<JournalFormData>({
    resolver: zodResolver(journalSchema),
    defaultValues: entry 
      ? { ...entry, date: new Date(entry.date) } 
      : { date: new Date(), notes: "", bedId: defaultBedId },
  });
  const mutation = useMutation({
    mutationFn: (data: JournalFormData) => {
      const payload = { ...data, date: data.date.getTime() };
      const apiCall = entry
        ? api(`/api/journal/${entry.id}`, { method: 'PUT', body: JSON.stringify(payload) })
        : api('/api/journal', { method: 'POST', body: JSON.stringify(payload) });
      return apiCall as Promise<JournalEntry>;
    },
    onSuccess: () => {
      toast.success(`Journal entry ${entry ? 'updated' : 'created'} successfully!`);
      queryClient.invalidateQueries({ queryKey: ['journal'] });
      onFinished();
    },
    onError: (error) => {
      toast.error(`Failed to ${entry ? 'update' : 'create'} entry: ${error.message}`);
    },
  });
  function onSubmit(data: JournalFormData) {
    mutation.mutate(data);
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="date" render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Date</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="bedId" render={({ field }) => (
          <FormItem>
            <FormLabel>Related Bed (Optional)</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger><SelectValue placeholder="Select a bed" /></SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {beds?.map(bed => <SelectItem key={bed.id} value={bed.id}>{bed.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="notes" render={({ field }) => (
          <FormItem>
            <FormLabel>Notes</FormLabel>
            <FormControl><Textarea placeholder="What did you observe today? Any pests, growth spurts, or new ideas?" {...field} rows={5} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <DialogFooter>
          <Button type="submit" disabled={mutation.isPending} className="bg-brand-green hover:bg-brand-green/90 text-brand-cream">
            {mutation.isPending ? 'Saving...' : 'Save Entry'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
export default function JournalPage() {
  const [isFormOpen, setFormOpen] = useState(false);
  const [isAlertOpen, setAlertOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | undefined>(undefined);
  const queryClient = useQueryClient();
  const { data: entries, isLoading, error } = useQuery<JournalEntry[]>({
    queryKey: ['journal'],
    queryFn: () => api('/api/journal'),
  });
  const { data: beds } = useQuery<Bed[]>({ queryKey: ['beds'], queryFn: () => api('/api/beds') });
  const bedsById = useMemo(() => new Map(beds?.map(b => [b.id, b.name])), [beds]);
  const deleteMutation = useMutation({
    mutationFn: (entryId: string) => api(`/api/journal/${entryId}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.success('Journal entry deleted.');
      queryClient.invalidateQueries({ queryKey: ['journal'] });
    },
    onError: (error) => toast.error(`Failed to delete entry: ${error.message}`),
  });
  const handleEdit = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setFormOpen(true);
  };
  const handleDelete = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setAlertOpen(true);
  };
  const confirmDelete = () => {
    if (selectedEntry) deleteMutation.mutate(selectedEntry.id);
    setAlertOpen(false);
  };
  if (error) return <div>Error loading journal entries: {error.message}</div>;
  const sortedEntries = entries?.sort((a, b) => b.date - a.date);
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="font-display text-5xl md:text-6xl text-brand-green">Gardening Journal</h1>
          <p className="text-lg text-brand-green/80">Log your observations, thoughts, and progress.</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setFormOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="bg-brand-ochre hover:bg-brand-ochre/90 text-brand-green font-bold shadow-lg transition-transform hover:scale-105" onClick={() => setSelectedEntry(undefined)}>
              <PlusCircle className="mr-2 h-5 w-5" />
              New Entry
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">{selectedEntry ? 'Edit Entry' : 'Create a New Journal Entry'}</DialogTitle>
              <DialogDescription>Record your gardening journey.</DialogDescription>
            </DialogHeader>
            <JournalForm entry={selectedEntry} onFinished={() => setFormOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-lg bg-brand-green/10" />)}
        </div>
      ) : (
        <div className="space-y-6">
          {sortedEntries?.map((entry) => (
            <Card key={entry.id} className="bg-brand-cream border-brand-green/20 shadow-md">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div>
                  <CardTitle className="text-xl font-semibold text-brand-green">{format(new Date(entry.date), "MMMM d, yyyy")}</CardTitle>
                  {entry.bedId && bedsById.has(entry.bedId) && (
                    <p className="text-sm text-brand-green/70">Bed: {bedsById.get(entry.bedId)}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(entry)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(entry)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-brand-green/90 whitespace-pre-wrap">{entry.notes}</p>
              </CardContent>
            </Card>
          ))}
           {sortedEntries?.length === 0 && (
            <div className="text-center border-2 border-dashed border-brand-green/30 rounded-lg p-12 space-y-6">
              <div className="flex justify-center">
                <BookHeart className="w-24 h-24 text-brand-green/50" />
              </div>
              <h2 className="font-display text-4xl text-brand-green">Your Journal is Empty</h2>
              <p className="text-brand-green/80 max-w-md mx-auto">
                Start documenting your garden's story. What did you notice today?
              </p>
            </div>
          )}
        </div>
      )}
      <AlertDialog open={isAlertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete this journal entry. This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}