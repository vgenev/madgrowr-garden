import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { Bed, Planting } from '@shared/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Sprout, CheckCircle, Calendar as CalendarIcon, BookHeart } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
export default function BedDetailPage() {
  const { bedId } = useParams<{ bedId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: bed, isLoading: bedLoading, error: bedError } = useQuery<Bed>({
    queryKey: ['bed', bedId],
    queryFn: () => api(`/api/beds/${bedId}`),
    enabled: !!bedId,
  });
  const { data: plantings, isLoading: plantingsLoading, error: plantingsError } = useQuery<Planting[]>({
    queryKey: ['plantings', bedId],
    queryFn: () => api(`/api/plantings?bedId=${bedId}`),
    enabled: !!bedId,
  });
  const harvestMutation = useMutation({
    mutationFn: (plantingId: string) => api(`/api/plantings/${plantingId}`, {
      method: 'PUT',
      body: JSON.stringify({ harvestDate: Date.now() }),
    }),
    onSuccess: () => {
      toast.success("Crop harvested!");
      queryClient.invalidateQueries({ queryKey: ['plantings', bedId] });
      queryClient.invalidateQueries({ queryKey: ['plantings'] }); // Invalidate general plantings query
    },
    onError: (error) => {
      toast.error(`Failed to harvest crop: ${error.message}`);
    },
  });
  const isLoading = bedLoading || plantingsLoading;
  const error = bedError || plantingsError;
  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-12 w-1/4" />
        <Skeleton className="h-8 w-1/2" />
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="text-center text-red-500">
        <h2 className="font-display text-2xl">Could not load bed history.</h2>
        <p>{error.message}</p>
        <Button asChild variant="link" className="mt-4">
          <Link to="/beds"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Beds</Link>
        </Button>
      </div>
    );
  }
  const sortedPlantings = plantings?.sort((a, b) => b.plantingDate - a.plantingDate) || [];
  const currentPlantings = sortedPlantings.filter(p => !p.harvestDate);
  const pastPlantings = sortedPlantings.filter(p => p.harvestDate);
  return (
    <div className="space-y-12">
      <header>
        <Button asChild variant="ghost" className="mb-4 -ml-4">
          <Link to="/beds">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to All Beds
          </Link>
        </Button>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-5xl md:text-6xl text-brand-green">{bed?.name}</h1>
            <p className="mt-2 text-lg text-brand-green/80">A timeline of all crops grown in this bed.</p>
          </div>
          <Button onClick={() => navigate(`/journal?bedId=${bedId}`)} className="bg-brand-ochre hover:bg-brand-ochre/90 text-brand-green font-bold shadow-lg transition-transform hover:scale-105">
            <BookHeart className="mr-2 h-4 w-4" />
            View Journal
          </Button>
        </div>
      </header>
      <section>
        <h2 className="font-display text-3xl text-brand-green mb-4">Currently Growing</h2>
        {currentPlantings.length > 0 ? (
          <div className="space-y-4">
            {currentPlantings.map(p => (
              <Card key={p.id} className="bg-brand-cream border-brand-green/20 shadow-md">
                <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-lg flex items-center gap-2">
                      <Sprout className="h-5 w-5 text-brand-ochre" />
                      {p.cropName}
                    </p>
                    <p className="text-sm text-brand-green/70">
                      Planted on: {format(new Date(p.plantingDate), 'PPP')}
                    </p>
                  </div>
                  <Button size="sm" onClick={() => harvestMutation.mutate(p.id)} disabled={harvestMutation.isPending} className="w-full sm:w-auto">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark as Harvested
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-brand-green/70 italic">Nothing is currently growing in this bed.</p>
        )}
      </section>
      <section>
        <h2 className="font-display text-3xl text-brand-green mb-4">Planting History</h2>
        {pastPlantings.length > 0 ? (
          <div className="space-y-4">
            {pastPlantings.map(p => (
              <Card key={p.id} className="bg-brand-green/5 border-brand-green/10">
                <CardContent className="p-4">
                  <p className="font-semibold text-brand-green/80">{p.cropName}</p>
                  <p className="text-sm text-brand-green/60 flex flex-col sm:flex-row sm:items-center sm:gap-4">
                    <span className="flex items-center gap-1.5"><CalendarIcon className="h-3 w-3" /> Planted: {format(new Date(p.plantingDate), 'PPP')}</span>
                    {p.harvestDate && <span className="flex items-center gap-1.5"><CheckCircle className="h-3 w-3" /> Harvested: {format(new Date(p.harvestDate), 'PPP')}</span>}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-brand-green/70 italic">No past plantings recorded for this bed.</p>
        )}
      </section>
    </div>
  );
}