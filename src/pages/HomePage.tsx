import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { Bed, Planting } from '@shared/types';
import { GardenLayout } from '@/components/GardenLayout';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Sprout, PlusCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { AdvisorCard } from '@/components/AdvisorCard';
export default function DashboardPage() {
  const { data: beds, isLoading: bedsLoading, error: bedsError } = useQuery<Bed[]>({
    queryKey: ['beds'],
    queryFn: () => api('/api/beds'),
  });
  const { data: plantings, isLoading: plantingsLoading, error: plantingsError } = useQuery<Planting[]>({
    queryKey: ['plantings'],
    queryFn: () => api('/api/plantings'),
  });
  const isLoading = bedsLoading || plantingsLoading;
  const error = bedsError || plantingsError;
  if (error) {
    return (
      <div className="text-center text-red-500">
        <h2 className="font-display text-2xl">Oops! Something went wrong.</h2>
        <p>{error.message}</p>
      </div>
    );
  }
  return (
    <div className="space-y-12">
      <header className="text-center">
        <h1 className="font-display text-6xl md:text-7xl text-brand-green">
          Verdant Dashboard
        </h1>
        <p className="mt-4 text-lg text-brand-green/80 max-w-2xl mx-auto">
          A bird's-eye view of your regenerative garden. See what's growing and what needs tending.
        </p>
      </header>
      <AdvisorCard />
      {isLoading ? (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-64 rounded-lg bg-brand-green/10" />
          <Skeleton className="h-64 rounded-lg bg-brand-green/10" />
          <Skeleton className="h-64 rounded-lg bg-brand-green/10" />
        </div>
      ) : beds && beds.length > 0 ? (
        <GardenLayout beds={beds} plantings={plantings?.filter(p => !p.harvestDate) || []} />
      ) : (
        <div className="text-center border-2 border-dashed border-brand-green/30 rounded-lg p-12 space-y-6 animate-fade-in">
          <div className="flex justify-center">
            <Sprout className="w-24 h-24 text-brand-green/50" />
          </div>
          <h2 className="font-display text-4xl text-brand-green">
            Your Garden Awaits
          </h2>
          <p className="text-brand-green/80 max-w-md mx-auto">
            It looks a bit empty here. Let's get our hands dirty and create your first garden bed!
          </p>
          <div>
            <Button asChild size="lg" className="bg-brand-ochre hover:bg-brand-ochre/90 text-brand-green font-bold shadow-lg transition-transform hover:scale-105">
              <Link to="/beds">
                <PlusCircle className="mr-2 h-5 w-5" />
                Create First Bed
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}