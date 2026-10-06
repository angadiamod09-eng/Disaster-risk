import React, { useState } from 'react';
import { DisasterType, AssessmentResult } from '../types/disaster';
import { evaluateDisasterRisk } from '../utils/calculator';
import { parseCsvDataset, PRELOADED_DATASET, EnvironmentalRecord } from '../data/sampleDataset';
import { RiskMeter } from './RiskMeter';
import {
  Sliders,
  FileSpreadsheet,
  Upload,
  Download,
  Search,
  Check,
  RotateCcw,
  AlertCircle,
  ArrowRight,
  Database
} from 'lucide-react';

interface ManualAssessmentViewProps {
  onAssessmentCompleted: (result: AssessmentResult) => void;
  onNavigateToResults: () => void;
}

export const ManualAssessmentView: React.FC<ManualAssessmentViewProps> = ({
  onAssessmentCompleted,
  onNavigateToResults,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'manual-entry' | 'csv-dataset'>('manual-entry');

  // Manual Form States
  const [stateName, setStateName] = useState('Karnataka');
  const [districtName, setDistrictName] = useState('Kalaburagi');
  const [disasterType, setDisasterType] = useState<DisasterType>('drought');

  // Generic parameter pool for manual slider/input manipulation
  const [rainfall, setRainfall] = useState<number>(15);
  const [temperature, setTemperature] = useState<number>(42);
  const [waterLevel, setWaterLevel] = useState<number>(6.5);
  const [soilMoisture, setSoilMoisture] = useState<number>(20);
  const [slope, setSlope] = useState<number>(38);
  const [windSpeed, setWindSpeed] = useState<number>(85);
  const [atmosphericPressure, setAtmosphericPressure] = useState<number>(970);
  const [dryness, setDryness] = useState<number>(82);

  const [drainageCondition, setDrainageCondition] = useState('Inadequate');
  const [soilCondition, setSoilCondition] = useState('Loose / Sandy');
  const [vegetationDryness, setVegetationDryness] = useState('Dry Brush');
  const [weatherCondition, setWeatherCondition] = useState('Severe Gale');

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [lastCalculatedResult, setLastCalculatedResult] = useState<AssessmentResult | null>(null);

  // CSV Dataset State
  const [datasetRecords, setDatasetRecords] = useState<EnvironmentalRecord[]>(PRELOADED_DATASET);
  const [datasetFilterDisaster, setDatasetFilterDisaster] = useState<string>('all');
  const [datasetSearchQuery, setDatasetSearchQuery] = useState<string>('');
  const [csvUploadSuccess, setCsvUploadSuccess] = useState<string | null>(null);
  const [csvUploadError, setCsvUploadError] = useState<string | null>(null);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);

  const handleValidateAndCalculate = () => {
    const errs: string[] = [];

    if (!stateName.trim()) errs.push('State name is required.');
    if (!districtName.trim()) errs.push('District or Location name is required.');

    if (disasterType === 'flood') {
      if (rainfall < 0 || rainfall > 500) errs.push('Flood rainfall must be between 0 and 500 mm.');
      if (waterLevel < 0 || waterLevel > 20) errs.push('Water level must be between 0 and 20 m.');
      if (soilMoisture < 0 || soilMoisture > 100) errs.push('Soil moisture must be between 0% and 100%.');
    } else if (disasterType === 'drought') {
      if (rainfall < 0 || rainfall > 400) errs.push('Rainfall must be between 0 and 400 mm.');
      if (temperature < 10 || temperature > 55) errs.push('Temperature must be between 10°C and 55°C.');
      if (soilMoisture < 0 || soilMoisture > 100) errs.push('Soil moisture must be between 0% and 100%.');
    } else if (disasterType === 'landslide') {
      if (rainfall < 0 || rainfall > 500) errs.push('Rainfall must be between 0 and 500 mm.');
      if (slope < 0 || slope > 85) errs.push('Slope gradient must be between 0° and 85°.');
    } else if (disasterType === 'forest_fire') {
      if (temperature < 10 || temperature > 60) errs.push('Temperature must be between 10°C and 60°C.');
      if (dryness < 0 || dryness > 100) errs.push('Dryness must be between 0% and 100%.');
      if (windSpeed < 0 || windSpeed > 150) errs.push('Wind speed must be between 0 and 150 km/h.');
    } else if (disasterType === 'cyclone') {
      if (windSpeed < 0 || windSpeed > 300) errs.push('Wind speed must be between 0 and 300 km/h.');
      if (atmosphericPressure < 880 || atmosphericPressure > 1050)
        errs.push('Atmospheric pressure must be between 880 and 1050 hPa.');
      if (rainfall < 0 || rainfall > 500) errs.push('Rainfall must be between 0 and 500 mm.');
    }

    if (errs.length > 0) {
      setValidationErrors(errs);
      return;
    }

    setValidationErrors([]);

    let inputs: Record<string, any> = {};
    if (disasterType === 'flood') {
      inputs = { rainfall, waterLevel, soilMoisture, drainageCondition };
    } else if (disasterType === 'drought') {
      inputs = { rainfall, temperature, soilMoisture };
    } else if (disasterType === 'landslide') {
      inputs = { rainfall, slope, soilCondition };
    } else if (disasterType === 'forest_fire') {
      inputs = { temperature, dryness, windSpeed, vegetationDryness };
    } else if (disasterType === 'cyclone') {
      inputs = { windSpeed, atmosphericPressure, rainfall, weatherCondition };
    }

    const res = evaluateDisasterRisk(disasterType, stateName, districtName, inputs);
    setLastCalculatedResult(res);
    onAssessmentCompleted(res);
  };

  const handleResetManual = () => {
    setRainfall(0);
    setTemperature(25);
    setWaterLevel(1);
    setSoilMoisture(30);
    setSlope(10);
    setWindSpeed(15);
    setAtmosphericPressure(1013);
    setDryness(30);
    setValidationErrors([]);
    setLastCalculatedResult(null);
  };

  // CSV File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvUploadError(null);
    setCsvUploadSuccess(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseCsvDataset(text);
        if (parsed.length === 0) {
          setCsvUploadError('The uploaded CSV contained no valid records. Please check the columns.');
          return;
        }
        setDatasetRecords(parsed);
        setCsvUploadSuccess(`Successfully loaded ${parsed.length} environmental records from ${file.name}!`);
      } catch (err: any) {
        setCsvUploadError(`Failed to parse CSV: ${err.message || 'Invalid format'}`);
      }
    };
    reader.readAsText(file);
  };

  // Handle selecting a record from dataset
  const handleSelectRecord = (rec: EnvironmentalRecord) => {
    setSelectedRecordId(rec.id);
    setStateName(rec.state);
    setDistrictName(rec.district);
    setDisasterType(rec.disaster_type);

    if (rec.rainfall_mm !== undefined) setRainfall(rec.rainfall_mm);
    if (rec.temperature_c !== undefined) setTemperature(rec.temperature_c);
    if (rec.water_level_m !== undefined) setWaterLevel(rec.water_level_m);
    if (rec.soil_moisture_pct !== undefined) setSoilMoisture(rec.soil_moisture_pct);
    if (rec.slope_deg !== undefined) setSlope(rec.slope_deg);
    if (rec.wind_speed_kmh !== undefined) setWindSpeed(rec.wind_speed_kmh);
    if (rec.pressure_hpa !== undefined) setAtmosphericPressure(rec.pressure_hpa);
    if (rec.dryness_pct !== undefined) setDryness(rec.dryness_pct);
    if (rec.drainage_condition) setDrainageCondition(rec.drainage_condition);
    if (rec.soil_condition) setSoilCondition(rec.soil_condition);
    if (rec.vegetation_dryness) setVegetationDryness(rec.vegetation_dryness);
    if (rec.weather_condition) setWeatherCondition(rec.weather_condition);

    // Build inputs and assess immediately
    const inputs: Record<string, any> = {
      rainfall: rec.rainfall_mm ?? 0,
      temperature: rec.temperature_c ?? 25,
      waterLevel: rec.water_level_m ?? 3,
      soilMoisture: rec.soil_moisture_pct ?? 40,
      slope: rec.slope_deg ?? 15,
      windSpeed: rec.wind_speed_kmh ?? 20,
      atmosphericPressure: rec.pressure_hpa ?? 1010,
      dryness: rec.dryness_pct ?? 40,
      drainageCondition: rec.drainage_condition || 'Moderate',
      soilCondition: rec.soil_condition || 'Moderately Stable',
      vegetationDryness: rec.vegetation_dryness || 'Moderate Dry',
      weatherCondition: rec.weather_condition || 'Calm / Overcast',
    };

    const evaluated = evaluateDisasterRisk(rec.disaster_type, rec.state, rec.district, inputs);
    setLastCalculatedResult(evaluated);
    onAssessmentCompleted(evaluated);
    setActiveSubTab('manual-entry');
  };

  const downloadSampleCsv = () => {
    const csvHeader =
      'state,district,disaster_type,rainfall_mm,temperature_c,water_level_m,soil_moisture_pct,slope_deg,wind_speed_kmh,pressure_hpa,dryness_pct,drainage_condition,soil_condition,vegetation_dryness,weather_condition,recorded_date\n';
    const sampleRows = datasetRecords
      .map(
        (r) =>
          `"${r.state}","${r.district}","${r.disaster_type}",${r.rainfall_mm || ''},${r.temperature_c || ''},${
            r.water_level_m || ''
          },${r.soil_moisture_pct || ''},${r.slope_deg || ''},${r.wind_speed_kmh || ''},${r.pressure_hpa || ''},${
            r.dryness_pct || ''
          },"${r.drainage_condition || ''}","${r.soil_condition || ''}","${r.vegetation_dryness || ''}","${
            r.weather_condition || ''
          }","${r.recorded_date || ''}"`
      )
      .join('\n');

    const blob = new Blob([csvHeader + sampleRows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'disaster_environmental_records.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filtered dataset
  const filteredRecords = datasetRecords.filter((rec) => {
    const matchesDisaster =
      datasetFilterDisaster === 'all' || rec.disaster_type === datasetFilterDisaster;
    const matchesSearch =
      rec.district.toLowerCase().includes(datasetSearchQuery.toLowerCase()) ||
      rec.state.toLowerCase().includes(datasetSearchQuery.toLowerCase());
    return matchesDisaster && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Sub Tabs Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveSubTab('manual-entry')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
              activeSubTab === 'manual-entry'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Direct Manual Entry Bench</span>
          </button>

          <button
            onClick={() => setActiveSubTab('csv-dataset')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
              activeSubTab === 'csv-dataset'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>CSV Dataset Records ({datasetRecords.length})</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center text-xs text-slate-500 font-medium">
          <Database className="w-3.5 h-3.5 mr-1 text-slate-400" />
          <span>Independent from pre-loaded sets</span>
        </div>
      </div>

      {/* TAB 1: DIRECT MANUAL ENTRY */}
      {activeSubTab === 'manual-entry' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                Manual Assessment & Simulation
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Freely tweak values, test extreme boundary conditions, and verify the rule-based calculation.
              </p>
            </div>

            {/* Validation Alerts */}
            {validationErrors.length > 0 && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs">
                <div className="flex items-center font-bold mb-1">
                  <AlertCircle className="w-4 h-4 mr-1 text-red-600" />
                  Validation Notice:
                </div>
                <ul className="list-disc pl-5 space-y-0.5">
                  {validationErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Location & Disaster selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                <input
                  type="text"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  District / Location
                </label>
                <input
                  type="text"
                  value={districtName}
                  onChange={(e) => setDistrictName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Disaster Type
                </label>
                <select
                  value={disasterType}
                  onChange={(e) => setDisasterType(e.target.value as DisasterType)}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:ring-1 focus:ring-amber-500 font-medium"
                >
                  <option value="flood">Flood</option>
                  <option value="drought">Drought</option>
                  <option value="landslide">Landslide</option>
                  <option value="forest_fire">Forest Fire</option>
                  <option value="cyclone">Cyclone</option>
                </select>
              </div>
            </div>

            {/* Parameter Sliders / Numeric Controls */}
            <div className="space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2">
                Active Parameters for {disasterType.toUpperCase()}
              </div>

              {disasterType === 'flood' && (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
                      <span>24h Rainfall</span>
                      <span className="font-mono">{rainfall} mm</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="300"
                      value={rainfall}
                      onChange={(e) => setRainfall(Number(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
                      <span>River / Canal Water Level</span>
                      <span className="font-mono">{waterLevel} m</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="15"
                      step="0.1"
                      value={waterLevel}
                      onChange={(e) => setWaterLevel(Number(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
                      <span>Soil Moisture Saturation</span>
                      <span className="font-mono">{soilMoisture}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={soilMoisture}
                      onChange={(e) => setSoilMoisture(Number(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1">
                      Drainage Condition
                    </label>
                    <select
                      value={drainageCondition}
                      onChange={(e) => setDrainageCondition(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900"
                    >
                      <option value="Good">Good (Unimpeded outflow)</option>
                      <option value="Moderate">Moderate (Average drainage)</option>
                      <option value="Inadequate">Inadequate (Constricted channels)</option>
                      <option value="Poor / Blocked">Poor / Blocked (Severe siltation/waterlogging)</option>
                    </select>
                  </div>
                </div>
              )}

              {disasterType === 'drought' && (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
                      <span>Precipitation (Low = High Drought Risk)</span>
                      <span className="font-mono">{rainfall} mm</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={rainfall}
                      onChange={(e) => setRainfall(Number(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
                      <span>Daily Ambient Temperature</span>
                      <span className="font-mono">{temperature} °C</span>
                    </div>
                    <input
                      type="range"
                      min="15"
                      max="52"
                      step="0.5"
                      value={temperature}
                      onChange={(e) => setTemperature(Number(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
                      <span>Root Zone Soil Moisture (Low = Dryness)</span>
                      <span className="font-mono">{soilMoisture}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={soilMoisture}
                      onChange={(e) => setSoilMoisture(Number(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                  </div>
                </div>
              )}

              {disasterType === 'landslide' && (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
                      <span>Triggering Rainfall</span>
                      <span className="font-mono">{rainfall} mm</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="300"
                      value={rainfall}
                      onChange={(e) => setRainfall(Number(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
                      <span>Terrain Slope Gradient</span>
                      <span className="font-mono">{slope} °</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="70"
                      value={slope}
                      onChange={(e) => setSlope(Number(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1">
                      Soil Condition
                    </label>
                    <select
                      value={soilCondition}
                      onChange={(e) => setSoilCondition(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900"
                    >
                      <option value="Stable Rocky">Stable Rocky</option>
                      <option value="Moderately Stable">Moderately Stable</option>
                      <option value="Loose / Sandy">Loose / Sandy</option>
                      <option value="Saturated & Unstable">Saturated & Unstable</option>
                    </select>
                  </div>
                </div>
              )}

              {disasterType === 'forest_fire' && (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
                      <span>Ambient Temperature</span>
                      <span className="font-mono">{temperature} °C</span>
                    </div>
                    <input
                      type="range"
                      min="15"
                      max="55"
                      step="0.5"
                      value={temperature}
                      onChange={(e) => setTemperature(Number(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
                      <span>Atmospheric Dryness Index</span>
                      <span className="font-mono">{dryness}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={dryness}
                      onChange={(e) => setDryness(Number(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
                      <span>Wind Velocity</span>
                      <span className="font-mono">{windSpeed} km/h</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="120"
                      value={windSpeed}
                      onChange={(e) => setWindSpeed(Number(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1">
                      Vegetation / Fuel State
                    </label>
                    <select
                      value={vegetationDryness}
                      onChange={(e) => setVegetationDryness(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900"
                    >
                      <option value="Green / Moist">Green / Moist</option>
                      <option value="Moderate Dry">Moderate Dry</option>
                      <option value="Dry Brush">Dry Brush</option>
                      <option value="Extremely Dry & Dense">Extremely Dry & Dense</option>
                    </select>
                  </div>
                </div>
              )}

              {disasterType === 'cyclone' && (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
                      <span>Sustained Wind Speed</span>
                      <span className="font-mono">{windSpeed} km/h</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="250"
                      value={windSpeed}
                      onChange={(e) => setWindSpeed(Number(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
                      <span>Barometric Pressure (Lower = Severe)</span>
                      <span className="font-mono">{atmosphericPressure} hPa</span>
                    </div>
                    <input
                      type="range"
                      min="900"
                      max="1025"
                      value={atmosphericPressure}
                      onChange={(e) => setAtmosphericPressure(Number(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
                      <span>Rainfall Inundation Band</span>
                      <span className="font-mono">{rainfall} mm</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="350"
                      value={rainfall}
                      onChange={(e) => setRainfall(Number(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1">
                      Weather Condition
                    </label>
                    <select
                      value={weatherCondition}
                      onChange={(e) => setWeatherCondition(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900"
                    >
                      <option value="Calm / Overcast">Calm / Overcast</option>
                      <option value="Moderate Squall">Moderate Squall</option>
                      <option value="Severe Gale">Severe Gale</option>
                      <option value="Violent Storm / Cyclone">Violent Storm / Cyclone</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={handleResetManual}
                className="flex items-center space-x-1.5 px-3 py-2 rounded text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Baseline</span>
              </button>

              <button
                type="button"
                onClick={handleValidateAndCalculate}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider shadow transition"
              >
                <span>Calculate & Assess Risk</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
              </button>
            </div>
          </div>

          {/* Quick Result Preview on Side */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-center">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
                Live Calculation Output
              </h4>

              {lastCalculatedResult ? (
                <div className="space-y-4">
                  <RiskMeter
                    score={lastCalculatedResult.score}
                    level={lastCalculatedResult.level}
                    size="sm"
                  />

                  <div className="p-3 bg-slate-50 rounded-lg text-left text-xs border border-slate-200">
                    <div className="font-bold text-slate-900 mb-1">
                      {lastCalculatedResult.district}, {lastCalculatedResult.state}
                    </div>
                    <div className="text-slate-600 text-[11px] leading-tight">
                      {lastCalculatedResult.recommendation}
                    </div>
                  </div>

                  <button
                    onClick={onNavigateToResults}
                    className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-lg transition"
                  >
                    View in Full Dashboard
                  </button>
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs">
                  <Sliders className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p>Tweak sliders and click "Calculate & Assess Risk" to preview the 0–100 score.</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-100/70 rounded-xl border border-slate-200 text-xs text-slate-600">
              <div className="font-bold text-slate-900 mb-1">Scoring Methodology</div>
              <p className="text-[11px] leading-relaxed text-slate-500">
                Rule-based normalizer scales inputs to a 0–100 risk score and maps directly to Low (0–30),
                Moderate (31–60), High (61–80), and Very High (81–100).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CSV DATASET RECORDS */}
      {activeSubTab === 'csv-dataset' && (
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                Environmental Dataset Records
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Load records from CSV, inspect environmental parameters, and run assessment for any location.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <label className="cursor-pointer inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition">
                <Upload className="w-3.5 h-3.5 text-amber-400" />
                <span>Upload CSV</span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <button
                onClick={downloadSampleCsv}
                className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Upload Status message */}
          {csvUploadSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center">
              <Check className="w-4 h-4 mr-1.5 text-emerald-600 flex-shrink-0" />
              <span>{csvUploadSuccess}</span>
            </div>
          )}

          {csvUploadError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg flex items-center">
              <AlertCircle className="w-4 h-4 mr-1.5 text-red-600 flex-shrink-0" />
              <span>{csvUploadError}</span>
            </div>
          )}

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={datasetSearchQuery}
                onChange={(e) => setDatasetSearchQuery(e.target.value)}
                placeholder="Search state or district..."
                className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <span className="text-xs text-slate-500 font-medium">Filter Disaster:</span>
              <select
                value={datasetFilterDisaster}
                onChange={(e) => setDatasetFilterDisaster(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none"
              >
                <option value="all">All Disasters ({datasetRecords.length})</option>
                <option value="flood">Flood</option>
                <option value="drought">Drought</option>
                <option value="landslide">Landslide</option>
                <option value="forest_fire">Forest Fire</option>
                <option value="cyclone">Cyclone</option>
              </select>
            </div>
          </div>

          {/* Dataset Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-3 py-2.5 text-left">Location</th>
                  <th className="px-3 py-2.5 text-left">Disaster</th>
                  <th className="px-3 py-2.5 text-right">Rain (mm)</th>
                  <th className="px-3 py-2.5 text-right">Temp (°C)</th>
                  <th className="px-3 py-2.5 text-left">Key Observation</th>
                  <th className="px-3 py-2.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                      No records matched your search filter.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((rec) => {
                    const isSelected = selectedRecordId === rec.id;
                    return (
                      <tr
                        key={rec.id}
                        className={`hover:bg-slate-50/80 transition ${
                          isSelected ? 'bg-amber-50/60 font-medium' : ''
                        }`}
                      >
                        <td className="px-3 py-2.5">
                          <span className="font-semibold text-slate-900">{rec.district}</span>
                          <span className="text-slate-500 block text-[11px]">{rec.state}</span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="px-2 py-0.5 rounded uppercase font-bold text-[10px] bg-slate-100 text-slate-800">
                            {rec.disaster_type.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono">
                          {rec.rainfall_mm !== undefined ? `${rec.rainfall_mm} mm` : '—'}
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono">
                          {rec.temperature_c !== undefined ? `${rec.temperature_c} °C` : '—'}
                        </td>
                        <td className="px-3 py-2.5 text-slate-600 text-[11px]">
                          {rec.disaster_type === 'flood' &&
                            `Level: ${rec.water_level_m ?? '—'}m | Moisture: ${rec.soil_moisture_pct ?? '—'}%`}
                          {rec.disaster_type === 'drought' &&
                            `Moisture: ${rec.soil_moisture_pct ?? '—'}% | Deficit: ${rec.rainfall_mm ?? 0}mm`}
                          {rec.disaster_type === 'landslide' &&
                            `Slope: ${rec.slope_deg ?? '—'}° | Soil: ${rec.soil_condition ?? '—'}`}
                          {rec.disaster_type === 'forest_fire' &&
                            `Dryness: ${rec.dryness_pct ?? '—'}% | Wind: ${rec.wind_speed_kmh ?? '—'} km/h`}
                          {rec.disaster_type === 'cyclone' &&
                            `Wind: ${rec.wind_speed_kmh ?? '—'} km/h | Press: ${rec.pressure_hpa ?? '—'} hPa`}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleSelectRecord(rec)}
                            className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[11px] transition shadow-xs"
                          >
                            Use for Assessment
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
