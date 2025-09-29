import { useState } from 'react';
import type { Bed, Planting } from "@shared/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Leaf, ThumbsUp, ThumbsDown, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Badge } from './ui/badge';
interface BedCardProps {
  bed: Bed;
  plantings: Planting[];
}
const plantingSchema = z.object({
  cropName: z.string().min(2, "Crop name is required."),
  plantingDate: z.date({ message: "Planting date is required." }),
});
type PlantingFormData = z.infer<typeof plantingSchema>;
function CompanionPopover({ companions }: { companions: { good: string[], bad: string[] } }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="mt-4">
          <Info className="mr-2 h-4 w-4" /> View Companion Tips
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-brand-green flex items-center"><ThumbsUp className="h-4 w-4 mr-2 text-green-500" /> Plant With</h4>
            <div className="flex flex-wrap gap-1 mt-2">
              {companions.good.map(p => <Badge key={p} variant="secondary" className="bg-green-100 text-green-800">{p}</Badge>)}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-brand-green flex items-center"><ThumbsDown className="h-4 w-4 mr-2 text-red-500" /> Avoid Planting With</h4>
            <div className="flex flex-wrap gap-1 mt-2">
              {companions.bad.map(p => <Badge key={p} variant="destructive" className="bg-red-100 text-red-800">{p}</Badge>)}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
function AddPlantingForm({ bedId, onFinished }: { bedId: string; onFinished: (newPlanting?: Planting) => void }) {
  const queryClient = useQueryClient();
  const form = useForm<PlantingFormData>({
    resolver: zodResolver(plantingSchema),
    defaultValues: { cropName: "", plantingDate: new Date() },
  });
  const mutation = useMutation({
    mutationFn: (data: Omit<Planting, 'id' | 'createdAt' | 'bedId'> & { bedId: string }) => api<Planting>('/api/plantings', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: (newPlanting) => {
      toast.success("New crop planted!");
      queryClient.invalidateQueries({ queryKey: ['plantings'] });
      onFinished(newPlanting);
    },
    onError: (error) => {
      toast.error(`Failed to add planting: ${error.message}`);
    },
  });
  function onSubmit(data: PlantingFormData) {
    mutation.mutate({
      ...data,
      bedId,
      plantingDate: data.plantingDate.getTime(),
    });
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="cropName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Crop Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 'Cherry Tomatoes'" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="plantingDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Planting Date</FormLabel>
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
                      {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button type="submit" disabled={mutation.isPending} className="bg-brand-green hover:bg-brand-green/90 text-brand-cream">
            {mutation.isPending ? 'Planting...' : 'Plant Crop'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
export function BedCard({ bed, plantings }: BedCardProps) {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [lastPlanted, setLastPlanted] = useState<Planting | undefined>();
  const handleFinish = (newPlanting?: Planting) => {
    if (newPlanting?.companionPlants) {
      setLastPlanted(newPlanting);
    } else {
      setDialogOpen(false);
    }
  };
  const currentPlantings = plantings.filter(p => !p.harvestDate);
  return (
    <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) setLastPlanted(undefined); setDialogOpen(open); }}>
      <Card className="flex flex-col bg-brand-green/5 border-brand-green/20 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <CardHeader>
          <CardTitle className="font-display text-2xl text-brand-green">{bed.name}</CardTitle>
          <CardDescription className="text-brand-green/70">{bed.width}ft x {bed.height}ft</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          {currentPlantings.length > 0 ? (
            <ul className="space-y-2">
              {currentPlantings.map((p) => (
                <li key={p.id} className="flex items-center gap-2 text-sm text-brand-green">
                  <Leaf className="h-4 w-4 text-brand-ochre" />
                  <span>{p.cropName}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-brand-green/60 italic">This bed is empty. Time to plant something!</p>
          )}
        </CardContent>
        <CardFooter>
          <DialogTrigger asChild>
            <Button variant="ghost" className="w-full text-brand-green hover:bg-brand-green/10 hover:text-brand-green">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Planting
            </Button>
          </DialogTrigger>
        </CardFooter>
      </Card>
      <DialogContent>
        {lastPlanted?.companionPlants ? (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">Success! "{lastPlanted.cropName}" Planted</DialogTitle>
              <DialogDescription>
                Here are some companion planting tips to help your new crop thrive.
              </DialogDescription>
            </DialogHeader>
            <div className="text-center">
              <CompanionPopover companions={lastPlanted.companionPlants} />
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">Add a Planting to "{bed.name}"</DialogTitle>
              <DialogDescription>
                What new crop are you adding to this bed? Log it here to keep track.
              </DialogDescription>
            </DialogHeader>
            <AddPlantingForm bedId={bed.id} onFinished={handleFinish} />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}