import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import type { UserProfile } from '@shared/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useEffect } from 'react';
const profileSchema = z.object({
  location: z.string().min(2, { message: "Location must be at least 2 characters." }),
});
type ProfileFormData = z.infer<typeof profileSchema>;
interface SettingsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}
export function SettingsModal({ isOpen, onOpenChange }: SettingsModalProps) {
  const queryClient = useQueryClient();
  const { data: profile } = useQuery<UserProfile>({
    queryKey: ['profile'],
    queryFn: () => api('/api/profile'),
    enabled: isOpen, // Only fetch when the modal is open
  });
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { location: '' },
  });
  useEffect(() => {
    if (profile) {
      form.reset({ location: profile.location });
    }
  }, [profile, form]);
  const mutation = useMutation({
    mutationFn: (data: ProfileFormData) => api('/api/profile', { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => {
      toast.success('Profile updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['advisor'] }); // Invalidate advisor to get new tips
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(`Failed to update profile: ${error.message}`);
    },
  });
  function onSubmit(data: ProfileFormData) {
    mutation.mutate(data);
  }
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Settings</DialogTitle>
          <DialogDescription>
            Update your location to get personalized gardening advice.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Austin, TX or USDA Zone 8a" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={mutation.isPending} className="bg-brand-green hover:bg-brand-green/90 text-brand-cream">
                {mutation.isPending ? 'Saving...' : 'Save Settings'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}