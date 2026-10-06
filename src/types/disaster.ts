export type DisasterType = 'flood' | 'drought' | 'landslide' | 'forest_fire' | 'cyclone';

export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'VERY HIGH';

export interface FactorContribution {
  name: string;
  value: string | number;
  unit?: string;
  impact: 'Low' | 'Moderate' | 'High' | 'Severe';
  scoreContribution: number; // 0-100 normalized factor score
  description: string;
}

export interface AssessmentResult {
  id: string;
  timestamp: string;
  state: string;
  district: string;
  disasterType: DisasterType;
  score: number;
  level: RiskLevel;
  recommendation: string;
  contributingFactors: FactorContribution[];
  inputs: Record<string, string | number>;
}

export interface FloodInputs {
  rainfall: number; // mm in 24h (0 - 400)
  waterLevel: number; // meters (0 - 15)
  soilMoisture: number; // % (0 - 100)
  drainageCondition: 'Good' | 'Moderate' | 'Inadequate' | 'Poor / Blocked';
}

export interface DroughtInputs {
  rainfall: number; // mm cumulative (0 - 300) - low means high drought risk
  temperature: number; // °C (15 - 52)
  soilMoisture: number; // % (0 - 100) - low means high drought risk
}

export interface LandslideInputs {
  rainfall: number; // mm in 24h (0 - 400)
  slope: number; // degrees (0 - 75)
  soilCondition: 'Stable Rocky' | 'Moderately Stable' | 'Loose / Sandy' | 'Saturated & Unstable';
}

export interface ForestFireInputs {
  temperature: number; // °C (15 - 55)
  dryness: number; // % (0 - 100, dryness index or 100 - humidity)
  windSpeed: number; // km/h (0 - 120)
  vegetationDryness: 'Green / Moist' | 'Moderate Dry' | 'Dry Brush' | 'Extremely Dry & Dense';
}

export interface CycloneInputs {
  windSpeed: number; // km/h (0 - 250)
  atmosphericPressure: number; // hPa (900 - 1025) - lower means more severe
  rainfall: number; // mm in 24h (0 - 400)
  weatherCondition: 'Calm / Overcast' | 'Moderate Squall' | 'Severe Gale' | 'Violent Storm / Cyclone';
}

export interface StateDistrictMap {
  state: string;
  districts: string[];
}
