const companionData: Record<string, { good: string[]; bad: string[] }> = {
  tomato: {
    good: ["Basil", "Carrots", "Marigolds", "Onions", "Lettuce"],
    bad: ["Cabbage", "Corn", "Fennel", "Potatoes"],
  },
  carrot: {
    good: ["Lettuce", "Onions", "Rosemary", "Sage", "Tomatoes"],
    bad: ["Dill", "Fennel", "Parsnips"],
  },
  lettuce: {
    good: ["Carrots", "Cucumbers", "Radishes", "Strawberries", "Marigolds"],
    bad: ["Cabbage", "Parsley"],
  },
  cucumber: {
    good: ["Beans", "Corn", "Lettuce", "Peas", "Radishes"],
    bad: ["Potatoes", "Sage", "Aromatic herbs"],
  },
  pepper: {
    good: ["Basil", "Carrots", "Onions", "Tomatoes"],
    bad: ["Fennel", "Kohlrabi"],
  },
  bean: {
    good: ["Carrots", "Corn", "Cucumbers", "Potatoes", "Strawberries"],
    bad: ["Garlic", "Onions", "Peppers"],
  },
  basil: {
    good: ["Tomatoes", "Peppers", "Asparagus"],
    bad: ["Rue"],
  },
  corn: {
    good: ["Beans", "Cucumbers", "Peas", "Squash"],
    bad: ["Tomatoes"],
  },
  squash: {
    good: ["Corn", "Beans", "Marigolds", "Nasturtiums"],
    bad: ["Potatoes"],
  },
  potato: {
    good: ["Beans", "Cabbage", "Corn", "Marigolds"],
    bad: ["Cucumber", "Squash", "Sunflowers", "Tomatoes"],
  },
  onion: {
    good: ["Carrots", "Lettuce", "Tomatoes", "Chamomile"],
    bad: ["Beans", "Peas", "Sage"],
  },
  garlic: {
    good: ["Roses", "Fruit trees", "Tomatoes", "Cabbage"],
    bad: ["Beans", "Peas", "Asparagus"],
  },
  cabbage: {
    good: ["Beans", "Celery", "Onions", "Thyme"],
    bad: ["Grapes", "Strawberries", "Tomatoes"],
  },
  strawberry: {
    good: ["Beans", "Lettuce", "Onions", "Spinach"],
    bad: ["Cabbage", "Fennel"],
  },
};
const defaultCompanions = {
  good: ["Marigolds (pest control)", "Borage (attracts pollinators)"],
  bad: ["Fennel (inhibits growth)"],
};
export function getCompanionPlants(cropName: string): { good: string[]; bad: string[] } {
  const lowerCropName = cropName.toLowerCase();
  for (const key in companionData) {
    if (lowerCropName.includes(key)) {
      return companionData[key];
    }
  }
  return defaultCompanions;
}