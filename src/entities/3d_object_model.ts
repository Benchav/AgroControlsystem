export type Models3dItem = {
  id:string,
  title: string;
  author: string;
  modelPath: string;
  nutritionalInfo: string;
  growthPeriod: string;
  waterRequirements: string;
  recommendedFertilizers?: string;
  commonDiseases?: string;
  parcels?: string[];
  estimatedProduction: string;
  currentPrice: number;
};
