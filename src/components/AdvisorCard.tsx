import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { Advice } from '@shared/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Lightbulb, AlertTriangle, Sparkles } from 'lucide-react';
const iconMap = {
  info: <Lightbulb className="h-5 w-5 text-blue-500" />,
  warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
  suggestion: <Sparkles className="h-5 w-5 text-purple-500" />,
};
export function AdvisorCard() {
  const { data: advice, isLoading, error } = useQuery<Advice[]>({
    queryKey: ['advisor'],
    queryFn: () => api('/api/advisor'),
  });
  if (isLoading) {
    return <Skeleton className="h-24 w-full rounded-lg bg-brand-green/10" />;
  }
  if (error || !advice || advice.length === 0) {
    return null; // Don't render the card if there's an error or no advice
  }
  const currentAdvice = advice[0]; // Display one piece of advice at a time for simplicity
  return (
    <Card className="bg-brand-ochre/10 border-brand-ochre/30 shadow-md animate-fade-in">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-3 text-xl font-display text-brand-green">
          {iconMap[currentAdvice.type]}
          {currentAdvice.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-brand-green/80">{currentAdvice.message}</p>
      </CardContent>
    </Card>
  );
}