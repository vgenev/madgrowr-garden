import type { UserProfile, Planting, Advice } from '@shared/types';
import { differenceInDays } from 'date-fns';
export function getGardeningAdvice(profile: UserProfile, plantings: Planting[]): Advice[] {
  const advice: Advice[] = [];
  const activePlantings = plantings.filter(p => !p.harvestDate);
  // Rule 1: Location not set
  if (!profile.location || profile.location.trim().length < 2) {
    advice.push({
      id: 'set-location',
      type: 'warning',
      title: 'Set Your Location',
      message: 'Add your location in Settings for personalized gardening advice and tips relevant to your climate.',
    });
  }
  // Rule 2: Check for very young seedlings
  const youngSeedlings = activePlantings.filter(p => differenceInDays(new Date(), new Date(p.plantingDate)) < 14);
  if (youngSeedlings.length > 0) {
    advice.push({
      id: 'young-seedlings',
      type: 'info',
      title: 'Tender Seedlings',
      message: `You have ${youngSeedlings.length} new planting(s). Remember to keep the soil consistently moist and protect them from strong winds or sun.`,
    });
  }
  // Rule 3: Suggest crop rotation if multiple of same family
  const cropFamilies: Record<string, string[]> = {
    nightshade: ['tomato', 'pepper', 'potato', 'eggplant'],
    brassica: ['cabbage', 'broccoli', 'cauliflower', 'kale', 'kohlrabi'],
  };
  for (const family in cropFamilies) {
    const familyCrops = activePlantings.filter(p => cropFamilies[family].some(crop => p.cropName.toLowerCase().includes(crop)));
    if (familyCrops.length > 1) {
      advice.push({
        id: `rotate-${family}`,
        type: 'suggestion',
        title: 'Crop Rotation Tip',
        message: `You're growing multiple plants from the ${family} family. To prevent soil depletion and pests, avoid planting them in the same bed next season.`,
      });
      break; // Only show one rotation tip at a time
    }
  }
  // Rule 4: Generic welcome/encouragement if no other advice
  if (advice.length === 0) {
    advice.push({
      id: 'general-tip',
      type: 'info',
      title: 'Happy Gardening!',
      message: 'Your garden is looking great! Keep observing your plants daily and log your findings in the journal.',
    });
  }
  return advice;
}