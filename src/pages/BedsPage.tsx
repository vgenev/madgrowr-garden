import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import type { Bed } from '@shared/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Edit, Trash2, Ruler, History } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
const bedSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  width: z.coerce.number().positive({ message: "Width must be a positive number." }),
  height: z.coerce.number().positive({ message: "Height must be a positive number." }),
});
type BedFormData = z.infer<typeof bedSchema>;
function BedForm({ bed, onFinished }: { bed?: Bed; onFinished: () => void }) {
  const queryClient = useQueryClient();
  const form = useForm<BedFormData>({
    resolver: zodResolver(bedSchema),
    defaultValues: bed
      ? { name: bed.name, width: bed.width, height: bed.height }
      : { name: "", width: 0, height: 0 },
  });
  const mutation = useMutation({
    mutationFn: (data: BedFormData) => {
      const apiCall = bed
        ? api(`/api/beds/${bed.id}`, { method: 'PUT', body: JSON.stringify(data) })
        : api('/api/beds', { method: 'POST', body: JSON.stringify(data) });
      return apiCall as Promise<Bed>;
    },
    onSuccess: () => {
      toast.success(`Bed ${bed ? 'updated' : 'created'} successfully!`);
      queryClient.invalidateQueries({ queryKey: ['beds'] });
      onFinished();
    },
    onError: (error) => {
      toast.error(`Failed to ${bed ? 'update' : 'create'} bed: ${error.message}`);
    },
  });
  function onSubmit(data: BedFormData) {
    mutation.mutate(data);
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bed Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 'Sunny Patch'" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="width"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Width (ft)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 4" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="height"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Height (ft)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 8" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <DialogFooter>
          <Button type="submit" disabled={mutation.isPending} className="bg-brand-green hover:bg-brand-green/90 text-brand-cream">
            {mutation.isPending ? 'Saving...' : 'Save Bed'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
export default function BedsPage() {
  const [isFormOpen, setFormOpen] = useState(false);
  const [isAlertOpen, setAlertOpen] = useState(false);
  const [selectedBed, setSelectedBed] = useState<Bed | undefined>(undefined);
  const queryClient = useQueryClient();
  const { data: beds, isLoading, error } = useQuery<Bed[]>({
    queryKey: ['beds'],
    queryFn: () => api('/api/beds'),
  });
  const deleteMutation = useMutation({
    mutationFn: (bedId: string) => api(`/api/beds/${bedId}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.success('Bed and its plantings have been deleted.');
      queryClient.invalidateQueries({ queryKey: ['beds'] });
      queryClient.invalidateQueries({ queryKey: ['plantings'] });
    },
    onError: (error) => {
      toast.error(`Failed to delete bed: ${error.message}`);
    },
  });
  const handleEdit = (bed: Bed) => {
    setSelectedBed(bed);
    setFormOpen(true);
  };
  const handleDelete = (bed: Bed) => {
    setSelectedBed(bed);
    setAlertOpen(true);
  };
  const confirmDelete = () => {
    if (selectedBed) {
      deleteMutation.mutate(selectedBed.id);
    }
    setAlertOpen(false);
  };
  if (error) return <div>Error loading beds: {error.message}</div>;
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="font-display text-5xl md:text-6xl text-brand-green">My Garden Beds</h1>
          <p className="text-lg text-brand-green/80">Manage your plots of land, from creation to harvest history.</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setFormOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="bg-brand-ochre hover:bg-brand-ochre/90 text-brand-green font-bold shadow-lg transition-transform hover:scale-105" onClick={() => setSelectedBed(undefined)}>
              <PlusCircle className="mr-2 h-5 w-5" />
              New Bed
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">{selectedBed ? 'Edit Bed' : 'Create a New Bed'}</DialogTitle>
              <DialogDescription>
                Give your new garden bed a name and dimensions. You can always change this later.
              </DialogDescription>
            </DialogHeader>
            <BedForm bed={selectedBed} onFinished={() => setFormOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 rounded-lg bg-brand-green/10" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {beds?.map((bed) => (
            <Card key={bed.id} className="bg-brand-cream border-brand-green/20 shadow-md hover:shadow-lg transition-shadow flex flex-col">
              <CardHeader>
                <CardTitle className="font-display text-2xl text-brand-green">{bed.name}</CardTitle>
                <CardDescription className="flex items-center gap-2 text-brand-green/70">
                  <Ruler className="h-4 w-4" /> {bed.width} ft x {bed.height} ft
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                {/* Future content: number of plantings */}
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link to={`/beds/${bed.id}`}>
                    <History className="h-4 w-4 mr-2" />
                    View History
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleEdit(bed)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(bed)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      <AlertDialog open={isAlertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the bed "{selectedBed?.name}" and all of its plantings. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}