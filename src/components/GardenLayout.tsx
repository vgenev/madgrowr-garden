import type { Bed, Planting } from "@shared/types";
import { BedCard } from "./BedCard";
interface GardenLayoutProps {
  beds: Bed[];
  plantings: Planting[];
}
export function GardenLayout({ beds, plantings }: GardenLayoutProps) {
  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {beds.map((bed) => {
        const bedPlantings = plantings.filter((p) => p.bedId === bed.id);
        return <BedCard key={bed.id} bed={bed} plantings={bedPlantings} />;
      })}
    </div>
  );
}