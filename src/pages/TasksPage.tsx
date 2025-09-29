import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import type { Task, Bed } from '@shared/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { PlusCircle, Edit, Trash2, CalendarIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
const taskSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  dueDate: z.date({ message: "A due date is required." }),
  bedId: z.string().optional(),
  notes: z.string().optional(),
});
type TaskFormData = z.infer<typeof taskSchema>;
function TaskForm({ task, onFinished }: { task?: Task; onFinished: () => void }) {
  const queryClient = useQueryClient();
  const { data: beds } = useQuery<Bed[]>({ queryKey: ['beds'], queryFn: () => api('/api/beds') });
  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: task ? { ...task, dueDate: new Date(task.dueDate) } : { title: "", dueDate: new Date() },
  });
  const mutation = useMutation({
    mutationFn: (data: TaskFormData) => {
      const payload = { ...data, dueDate: data.dueDate.getTime() };
      const apiCall = task
        ? api(`/api/tasks/${task.id}`, { method: 'PUT', body: JSON.stringify(payload) })
        : api('/api/tasks', { method: 'POST', body: JSON.stringify(payload) });
      return apiCall as Promise<Task>;
    },
    onSuccess: () => {
      toast.success(`Task ${task ? 'updated' : 'created'} successfully!`);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      onFinished();
    },
    onError: (error) => {
      toast.error(`Failed to ${task ? 'update' : 'create'} task: ${error.message}`);
    },
  });
  function onSubmit(data: TaskFormData) {
    mutation.mutate(data);
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="title" render={({ field }) => (
          <FormItem>
            <FormLabel>Task Title</FormLabel>
            <FormControl><Input placeholder="e.g., 'Water the tomatoes'" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="dueDate" render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Due Date</FormLabel>
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
        </div>
        <FormField control={form.control} name="notes" render={({ field }) => (
          <FormItem>
            <FormLabel>Notes</FormLabel>
            <FormControl><Textarea placeholder="Add any extra details..." {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <DialogFooter>
          <Button type="submit" disabled={mutation.isPending} className="bg-brand-green hover:bg-brand-green/90 text-brand-cream">
            {mutation.isPending ? 'Saving...' : 'Save Task'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
export default function TasksPage() {
  const [isFormOpen, setFormOpen] = useState(false);
  const [isAlertOpen, setAlertOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const queryClient = useQueryClient();
  const { data: tasks, isLoading, error } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: () => api('/api/tasks'),
  });
  const { data: beds } = useQuery<Bed[]>({ queryKey: ['beds'], queryFn: () => api('/api/beds') });
  const bedsById = new Map(beds?.map(b => [b.id, b.name]));
  const toggleCompleteMutation = useMutation({
    mutationFn: (task: Task) => api(`/api/tasks/${task.id}`, { method: 'PUT', body: JSON.stringify({ completed: !task.completed }) }),
    onSuccess: () => {
      toast.success('Task status updated!');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error) => toast.error(`Failed to update task: ${error.message}`),
  });
  const deleteMutation = useMutation({
    mutationFn: (taskId: string) => api(`/api/tasks/${taskId}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.success('Task deleted.');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error) => toast.error(`Failed to delete task: ${error.message}`),
  });
  const handleEdit = (task: Task) => {
    setSelectedTask(task);
    setFormOpen(true);
  };
  const handleDelete = (task: Task) => {
    setSelectedTask(task);
    setAlertOpen(true);
  };
  const confirmDelete = () => {
    if (selectedTask) deleteMutation.mutate(selectedTask.id);
    setAlertOpen(false);
  };
  if (error) return <div>Error loading tasks: {error.message}</div>;
  const sortedTasks = tasks?.sort((a, b) => a.dueDate - b.dueDate).sort((a, b) => Number(a.completed) - Number(b.completed));
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="font-display text-5xl md:text-6xl text-brand-green">Gardening Tasks</h1>
          <p className="text-lg text-brand-green/80">Stay on top of your to-do list and keep your garden thriving.</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setFormOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="bg-brand-ochre hover:bg-brand-ochre/90 text-brand-green font-bold shadow-lg transition-transform hover:scale-105" onClick={() => setSelectedTask(undefined)}>
              <PlusCircle className="mr-2 h-5 w-5" />
              New Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">{selectedTask ? 'Edit Task' : 'Create a New Task'}</DialogTitle>
              <DialogDescription>What needs to be done in the garden?</DialogDescription>
            </DialogHeader>
            <TaskForm task={selectedTask} onFinished={() => setFormOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-lg bg-brand-green/10" />)}
        </div>
      ) : (
        <div className="space-y-4">
          {sortedTasks?.map((task) => (
            <Card key={task.id} className={cn("transition-all", task.completed ? "bg-brand-green/5 text-brand-green/60" : "bg-brand-cream border-brand-green/20 shadow-md")}>
              <CardContent className="p-4 flex items-center gap-4">
                <Checkbox checked={task.completed} onCheckedChange={() => toggleCompleteMutation.mutate(task)} className="h-6 w-6" />
                <div className="flex-grow">
                  <p className={cn("font-semibold", task.completed && "line-through")}>{task.title}</p>
                  <p className="text-sm text-brand-green/70">
                    Due: {format(new Date(task.dueDate), "PPP")}
                    {task.bedId && bedsById.has(task.bedId) && ` • Bed: ${bedsById.get(task.bedId)}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(task)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(task)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <AlertDialog open={isAlertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete the task "{selectedTask?.title}". This action cannot be undone.</AlertDialogDescription>
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