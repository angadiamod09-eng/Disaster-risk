import Papa from 'papaparse';
import { DisasterType } from '../types/disaster';

export interface EnvironmentalRecord {
  id: string;
  state: string;
  district: string;
  disaster_type: DisasterType;
  rainfall_mm: number;
  temperature_c: number;
  water_level_m?: number;
  soil_moisture_pct?: number;
  slope_deg?: number;
  wind_speed_kmh?: number;
  pressure_hpa?: number;
  dryness_pct?: number;
  drainage_condition?: string;
  soil_condition?: string;
  vegetation_dryness?: string;
  weather_condition?: string;
  recorded_date?: string;
}

export const SAMPLE_CSV_CONTENT = `state,district,disaster_type,rainfall_mm,temperature_c,water_level_m,soil_moisture_pct,slope_deg,wind_speed_kmh,pressure_hpa,dryness_pct,drainage_condition,soil_condition,vegetation_dryness,weather_condition,recorded_date
Karnataka,Kalaburagi,drought,8,42.5,,,14,,,,82,,,,2026-05-18
Karnataka,Kalaburagi,flood,145,28.0,7.2,85,,,,,,Poor / Blocked,,,2026-08-12
Karnataka,Kodagu,landslide,190,23.5,,,48,,,Saturated & Unstable,,,2026-07-24
Kerala,Wayanad,landslide,220,21.0,,,52,,,Saturated & Unstable,,,2026-08-04
Kerala,Alappuzha,flood,165,26.5,8.1,92,,,,,,Inadequate,,,2026-08-16
Odisha,Puri,cyclone,180,27.0,,,,145,945,,,,,Violent Storm / Cyclone,2026-05-22
Odisha,Balasore,cyclone,110,28.0,,,,95,982,,,,,Severe Gale,2026-09-14
Uttarakhand,Chamoli,landslide,175,19.0,,,45,,,Loose / Sandy,,,2026-07-30
Rajasthan,Barmer,drought,4,44.2,,,11,,,,88,,,,2026-06-02
Rajasthan,Jodhpur,forest_fire,,43.0,,,,28,,84,,,Extremely Dry & Dense,,2026-05-29
Maharashtra,Mumbai Suburban,flood,185,27.0,7.8,88,,,,,,Poor / Blocked,,,2026-07-15
Assam,Dhemaji,flood,160,25.0,7.5,90,,,,,,Inadequate,,,2026-06-28
Uttarakhand,Nainital,forest_fire,,36.5,,,,38,,76,,,Dry Brush,,2026-05-11
Gujarat,Kutch,cyclone,95,29.0,,,,105,978,,,,,Severe Gale,2026-06-16
Karnataka,Bengaluru Urban,flood,65,24.0,3.5,60,,,,,,Moderate,,,2026-09-05`;

export function parseCsvDataset(csvText: string): EnvironmentalRecord[] {
  const result = Papa.parse<Record<string, string>>(csvText.trim(), {
    header: true,
    skipEmptyLines: true,
  });

  return result.data
    .map((row, index) => {
      const disaster_type = (row.disaster_type?.trim().toLowerCase() || 'flood') as DisasterType;
      return {
        id: `REC-${index + 1}`,
        state: row.state?.trim() || 'Unknown State',
        district: row.district?.trim() || 'Unknown District',
        disaster_type: ['flood', 'drought', 'landslide', 'forest_fire', 'cyclone'].includes(disaster_type)
          ? disaster_type
          : 'flood',
        rainfall_mm: row.rainfall_mm ? parseFloat(row.rainfall_mm) : 0,
        temperature_c: row.temperature_c ? parseFloat(row.temperature_c) : 25,
        water_level_m: row.water_level_m ? parseFloat(row.water_level_m) : undefined,
        soil_moisture_pct: row.soil_moisture_pct ? parseFloat(row.soil_moisture_pct) : undefined,
        slope_deg: row.slope_deg ? parseFloat(row.slope_deg) : undefined,
        wind_speed_kmh: row.wind_speed_kmh ? parseFloat(row.wind_speed_kmh) : undefined,
        pressure_hpa: row.pressure_hpa ? parseFloat(row.pressure_hpa) : undefined,
        dryness_pct: row.dryness_pct ? parseFloat(row.dryness_pct) : undefined,
        drainage_condition: row.drainage_condition?.trim() || undefined,
        soil_condition: row.soil_condition?.trim() || undefined,
        vegetation_dryness: row.vegetation_dryness?.trim() || undefined,
        weather_condition: row.weather_condition?.trim() || undefined,
        recorded_date: row.recorded_date?.trim() || new Date().toISOString().split('T')[0],
      };
    })
    .filter((r) => r.state && r.district);
}

export const PRELOADED_DATASET: EnvironmentalRecord[] = parseCsvDataset(SAMPLE_CSV_CONTENT);
