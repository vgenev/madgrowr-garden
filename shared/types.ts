// Generic API response wrapper
export type ApiResponse<T = unknown> = { success: true; data: T } | { success: false; error: string };
// Verdant Application Types
export type Bed = {
  id: string;
  name: string;
  width: number;
  height: number;
  createdAt: number;
};
export type Planting = {
  id: string;
  bedId: string;
  cropName: string;
  plantingDate: number; // UTC timestamp
  harvestDate?: number; // UTC timestamp
  notes?: string;
  createdAt: number;
  companionPlants?: {
    good: string[];
    bad: string[];
  };
};
export type Task = {
  id: string;
  bedId?: string; // Optional link to a bed
  plantingId?: string; // Optional link to a planting
  title: string;
  notes?: string;
  dueDate: number; // UTC timestamp
  completed: boolean;
  createdAt: number;
};
export type JournalEntry = {
  id: string;
  date: number; // UTC timestamp
  notes: string;
  bedId?: string;
  plantingId?: string;
  tags?: string[];
  createdAt: number;
};
export type UserProfile = {
  id: string; // Use a fixed ID for singleton
  location: string; // e.g., "USDA Zone 7b" or "Austin, TX"
};
export type Advice = {
  id: string;
  type: 'info' | 'warning' | 'suggestion';
  title: string;
  message: string;
};