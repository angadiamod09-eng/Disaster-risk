import React, { useState } from 'react';
import {
  DisasterType,
  AssessmentResult,
} from '../types/disaster';
import { LOCATION_PRESETS } from '../data/locations';
import { evaluateDisasterRisk, getDisasterPreparednessActions } from '../utils/calculator';
import { RiskMeter } from './RiskMeter';
import {
  CloudRain,
  Sun,
  Mountain,
  Flame,
  Wind,
  CheckCircle2,
  RotateCcw,
  AlertTriangle,
  ArrowRight,
  MapPin,
  Sparkles,
  Info
} from 'lucide-react';

interface RiskAssessmentViewProps {
  onAssessmentCompleted: (result: AssessmentResult) => void;
  selectedDisaster: DisasterType;
  onDisasterChange: (disaster: DisasterType) => void;
  currentResult: AssessmentResult | null;
  onNavigateToResults: () => void;
}

export const RiskAssessmentView: React.FC<RiskAssessmentViewProps> = ({
  onAssessmentCompleted,
  selectedDisaster,
  onDisasterChange,
  currentResult,
  onNavigateToResults,
}) => {
  // Location states
  const [selectedState, setSelectedState] = useState<string>('Karnataka');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Kalaburagi');
  const [customDistrict, setCustomDistrict] = useState<string>('');
  const [isCustomLocation, setIsCustomLocation] = useState<boolean>(false);

  // Environmental inputs per disaster
  const [floodData, setFloodData] = useState({
    rainfall: '140',
    waterLevel: '6.8',
    soilMoisture: '78',
    drainageCondition: 'Inadequate',
  });

  const [droughtData, setDroughtData] = useState({
    rainfall: '12',
    temperature: '41.5',
    soilMoisture: '18',
  });

  const [landslideData, setLandslideData] = useState({
    rainfall: '165',
    slope: '42',
    soilCondition: 'Loose / Sandy',
  });

  const [forestFireData, setForestFireData] = useState({
    temperature: '40.0',
    dryness: '78',
    windSpeed: '36',
    vegetationDryness: 'Dry Brush',
  });

  const [cycloneData, setCycloneData] = useState({
    windSpeed: '125',
    atmosphericPressure: '955',
    rainfall: '145',
    weatherCondition: 'Severe Gale',
  });

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [localResult, setLocalResult] = useState<AssessmentResult | null>(currentResult);

  // Available districts for the selected state
  const availableDistricts =
    LOCATION_PRESETS.find((p) => p.state === selectedState)?.districts || [];

  const handleStateChange = (newState: string) => {
    setSelectedState(newState);
    const stateObj = LOCATION_PRESETS.find((p) => p.state === newState);
    if (stateObj && stateObj.districts.length > 0) {
      setSelectedDistrict(stateObj.districts[0]);
      setIsCustomLocation(false);
    } else {
      setIsCustomLocation(true);
    }
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === '__custom__') {
      setIsCustomLocation(true);
      setCustomDistrict('');
    } else {
      setIsCustomLocation(false);
      setSelectedDistrict(val);
    }
  };

  const validateInputs = (): boolean => {
    const newErrors: Record<string, string> = {};

    const effectiveDistrict = isCustomLocation ? customDistrict.trim() : selectedDistrict.trim();
    if (!effectiveDistrict) {
      newErrors.district = 'Please enter or select a valid district/location.';
    }

    if (selectedDisaster === 'flood') {
      const rain = parseFloat(floodData.rainfall);
      if (isNaN(rain) || rain < 0 || rain > 600) {
        newErrors.rainfall = 'Rainfall must be between 0 and 600 mm.';
      }
      const water = parseFloat(floodData.waterLevel);
      if (isNaN(water) || water < 0 || water > 25) {
        newErrors.waterLevel = 'Water level must be between 0 and 25 meters.';
      }
      const moisture = parseFloat(floodData.soilMoisture);
      if (isNaN(moisture) || moisture < 0 || moisture > 100) {
        newErrors.soilMoisture = 'Soil moisture must be between 0% and 100%.';
      }
    } else if (selectedDisaster === 'drought') {
      const rain = parseFloat(droughtData.rainfall);
      if (isNaN(rain) || rain < 0 || rain > 400) {
        newErrors.rainfall = 'Rainfall must be between 0 and 400 mm.';
      }
      const temp = parseFloat(droughtData.temperature);
      if (isNaN(temp) || temp < 10 || temp > 58) {
        newErrors.temperature = 'Temperature must be between 10°C and 58°C.';
      }
      const moisture = parseFloat(droughtData.soilMoisture);
      if (isNaN(moisture) || moisture < 0 || moisture > 100) {
        newErrors.soilMoisture = 'Soil moisture must be between 0% and 100%.';
      }
    } else if (selectedDisaster === 'landslide') {
      const rain = parseFloat(landslideData.rainfall);
      if (isNaN(rain) || rain < 0 || rain > 600) {
        newErrors.rainfall = 'Rainfall must be between 0 and 600 mm.';
      }
      const slope = parseFloat(landslideData.slope);
      if (isNaN(slope) || slope < 0 || slope > 85) {
        newErrors.slope = 'Slope must be between 0° and 85°.';
      }
    } else if (selectedDisaster === 'forest_fire') {
      const temp = parseFloat(forestFireData.temperature);
      if (isNaN(temp) || temp < 10 || temp > 60) {
        newErrors.temperature = 'Temperature must be between 10°C and 60°C.';
      }
      const dryness = parseFloat(forestFireData.dryness);
      if (isNaN(dryness) || dryness < 0 || dryness > 100) {
        newErrors.dryness = 'Dryness index must be between 0% and 100%.';
      }
      const wind = parseFloat(forestFireData.windSpeed);
      if (isNaN(wind) || wind < 0 || wind > 180) {
        newErrors.windSpeed = 'Wind speed must be between 0 and 180 km/h.';
      }
    } else if (selectedDisaster === 'cyclone') {
      const wind = parseFloat(cycloneData.windSpeed);
      if (isNaN(wind) || wind < 0 || wind > 350) {
        newErrors.windSpeed = 'Wind speed must be between 0 and 350 km/h.';
      }
      const pressure = parseFloat(cycloneData.atmosphericPressure);
      if (isNaN(pressure) || pressure < 870 || pressure > 1060) {
        newErrors.atmosphericPressure = 'Pressure must be between 870 and 1060 hPa.';
      }
      const rain = parseFloat(cycloneData.rainfall);
      if (isNaN(rain) || rain < 0 || rain > 600) {
        newErrors.rainfall = 'Rainfall must be between 0 and 600 mm.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAssessRisk = () => {
    if (!validateInputs()) {
      return;
    }

    const effectiveDistrict = isCustomLocation ? customDistrict.trim() : selectedDistrict.trim();

    let inputs: Record<string, any> = {};
    if (selectedDisaster === 'flood') {
      inputs = {
        rainfall: parseFloat(floodData.rainfall),
        waterLevel: parseFloat(floodData.waterLevel),
        soilMoisture: parseFloat(floodData.soilMoisture),
        drainageCondition: floodData.drainageCondition,
      };
    } else if (selectedDisaster === 'drought') {
      inputs = {
        rainfall: parseFloat(droughtData.rainfall),
        temperature: parseFloat(droughtData.temperature),
        soilMoisture: parseFloat(droughtData.soilMoisture),
      };
    } else if (selectedDisaster === 'landslide') {
      inputs = {
        rainfall: parseFloat(landslideData.rainfall),
        slope: parseFloat(landslideData.slope),
        soilCondition: landslideData.soilCondition,
      };
    } else if (selectedDisaster === 'forest_fire') {
      inputs = {
        temperature: parseFloat(forestFireData.temperature),
        dryness: parseFloat(forestFireData.dryness),
        windSpeed: parseFloat(forestFireData.windSpeed),
        vegetationDryness: forestFireData.vegetationDryness,
      };
    } else if (selectedDisaster === 'cyclone') {
      inputs = {
        windSpeed: parseFloat(cycloneData.windSpeed),
        atmosphericPressure: parseFloat(cycloneData.atmosphericPressure),
        rainfall: parseFloat(cycloneData.rainfall),
        weatherCondition: cycloneData.weatherCondition,
      };
    }

    const result = evaluateDisasterRisk(
      selectedDisaster,
      selectedState,
      effectiveDistrict,
      inputs
    );

    setLocalResult(result);
    onAssessmentCompleted(result);
  };

  const handleReset = () => {
    setErrors({});
    if (selectedDisaster === 'flood') {
      setFloodData({ rainfall: '', waterLevel: '', soilMoisture: '', drainageCondition: 'Good' });
    } else if (selectedDisaster === 'drought') {
      setDroughtData({ rainfall: '', temperature: '', soilMoisture: '' });
    } else if (selectedDisaster === 'landslide') {
      setLandslideData({ rainfall: '', slope: '', soilCondition: 'Stable Rocky' });
    } else if (selectedDisaster === 'forest_fire') {
      setForestFireData({ temperature: '', dryness: '', windSpeed: '', vegetationDryness: 'Green / Moist' });
    } else if (selectedDisaster === 'cyclone') {
      setCycloneData({ windSpeed: '', atmosphericPressure: '', rainfall: '', weatherCondition: 'Calm / Overcast' });
    }
    setLocalResult(null);
  };

  const loadScenario = (type: DisasterType, state: string, district: string, values: Record<string, string>) => {
    setSelectedState(state);
    setSelectedDistrict(district);
    setIsCustomLocation(false);
    onDisasterChange(type);
    setErrors({});

    if (type === 'flood') setFloodData(values as any);
    else if (type === 'drought') setDroughtData(values as any);
    else if (type === 'landslide') setLandslideData(values as any);
    else if (type === 'forest_fire') setForestFireData(values as any);
    else if (type === 'cyclone') setCycloneData(values as any);
  };

  const disasterOptions: { id: DisasterType; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'flood', label: 'Flood', icon: <CloudRain className="w-5 h-5 text-blue-600" />, desc: 'Riverine & urban runoff' },
    { id: 'drought', label: 'Drought', icon: <Sun className="w-5 h-5 text-amber-600" />, desc: 'Precipitation & heat deficit' },
    { id: 'landslide', label: 'Landslide', icon: <Mountain className="w-5 h-5 text-stone-600" />, desc: 'Slope failure & saturation' },
    { id: 'forest_fire', label: 'Forest Fire', icon: <Flame className="w-5 h-5 text-red-600" />, desc: 'Biomass & dry heat combustion' },
    { id: 'cyclone', label: 'Cyclone', icon: <Wind className="w-5 h-5 text-cyan-600" />, desc: 'Gale winds & low pressure' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Breadcrumb */}
      <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Natural Disaster Risk Assessment
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select target location, specify disaster model, and provide environmental observations.
            </p>
          </div>

          {/* Quick preset scenario helper */}
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400 font-medium flex items-center">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 mr-1" />
              Quick Presets:
            </span>
            <button
              onClick={() =>
                loadScenario('drought', 'Karnataka', 'Kalaburagi', {
                  rainfall: '10',
                  temperature: '43.0',
                  soilMoisture: '15',
                })
              }
              className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded border border-amber-200 font-medium transition"
              title="Karnataka - Kalaburagi Drought sample"
            >
              Kalaburagi Drought
            </button>
            <button
              onClick={() =>
                loadScenario('flood', 'Karnataka', 'Belagavi', {
                  rainfall: '165',
                  waterLevel: '7.8',
                  soilMoisture: '88',
                  drainageCondition: 'Poor / Blocked',
                })
              }
              className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded border border-blue-200 font-medium transition"
              title="Karnataka - Belagavi Flood sample"
            >
              Belagavi Flood
            </button>
            <button
              onClick={() =>
                loadScenario('landslide', 'Kerala', 'Wayanad', {
                  rainfall: '210',
                  slope: '50',
                  soilCondition: 'Saturated & Unstable',
                })
              }
              className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded border border-stone-300 font-medium transition"
              title="Kerala - Wayanad Landslide sample"
            >
              Wayanad Landslide
            </button>
          </div>
        </div>

        {/* SECTION A: Location Selection */}
        <div className="mt-5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center">
            <MapPin className="w-3.5 h-3.5 text-slate-500 mr-1.5" />
            A. Location Selection
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/70 p-4 rounded-lg border border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                State
              </label>
              <select
                value={selectedState}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                {LOCATION_PRESETS.map((p) => (
                  <option key={p.state} value={p.state}>
                    {p.state}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                District / Location
              </label>
              {!isCustomLocation ? (
                <select
                  value={selectedDistrict}
                  onChange={handleDistrictChange}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  {availableDistricts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                  <option value="__custom__">+ Enter Custom Location...</option>
                </select>
              ) : (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={customDistrict}
                    onChange={(e) => setCustomDistrict(e.target.value)}
                    placeholder="Enter district or town name..."
                    className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setIsCustomLocation(false)}
                    className="px-2.5 py-2 text-xs text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-lg font-medium transition"
                  >
                    Preset List
                  </button>
                </div>
              )}
              {errors.district && (
                <p className="text-xs text-red-600 mt-1 font-medium">{errors.district}</p>
              )}
            </div>
          </div>
        </div>

        {/* SECTION B: Disaster Selection */}
        <div className="mt-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            B. Disaster Selection
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {disasterOptions.map((opt) => {
              const isSelected = selectedDisaster === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    onDisasterChange(opt.id);
                    setErrors({});
                  }}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-400 shadow-sm'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    {opt.icon}
                    <span className="font-bold text-sm text-slate-900">{opt.label}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{opt.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION C: Environmental Input */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              C. Environmental Parameters ({selectedDisaster.replace('_', ' ').toUpperCase()})
            </label>
            <span className="text-[11px] text-slate-500">
              Enter numeric station readings or select conditions
            </span>
          </div>

          <div className="bg-slate-50 p-4 sm:p-5 rounded-lg border border-slate-200">
            {/* 1. FLOOD INPUTS */}
            {selectedDisaster === 'flood' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    24h Rainfall (mm)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="600"
                    step="1"
                    value={floodData.rainfall}
                    onChange={(e) => setFloodData({ ...floodData, rainfall: e.target.value })}
                    placeholder="e.g. 140"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-[11px] text-slate-500 block mt-0.5">Range: 0 – 300+ mm</span>
                  {errors.rainfall && (
                    <p className="text-xs text-red-600 mt-1">{errors.rainfall}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    River / Basin Water Level (m)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    step="0.1"
                    value={floodData.waterLevel}
                    onChange={(e) => setFloodData({ ...floodData, waterLevel: e.target.value })}
                    placeholder="e.g. 6.8"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-[11px] text-slate-500 block mt-0.5">Normal: &lt;3m, Danger: &gt;7m</span>
                  {errors.waterLevel && (
                    <p className="text-xs text-red-600 mt-1">{errors.waterLevel}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Soil Moisture (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={floodData.soilMoisture}
                    onChange={(e) => setFloodData({ ...floodData, soilMoisture: e.target.value })}
                    placeholder="e.g. 80"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-[11px] text-slate-500 block mt-0.5">Saturation percentage (0–100)</span>
                  {errors.soilMoisture && (
                    <p className="text-xs text-red-600 mt-1">{errors.soilMoisture}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Drainage / Water Condition
                  </label>
                  <select
                    value={floodData.drainageCondition}
                    onChange={(e) =>
                      setFloodData({ ...floodData, drainageCondition: e.target.value as any })
                    }
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Good">Good (Unimpeded outflow)</option>
                    <option value="Moderate">Moderate (Minor siltation)</option>
                    <option value="Inadequate">Inadequate (Constricted channels)</option>
                    <option value="Poor / Blocked">Poor / Blocked (Severe obstruction)</option>
                  </select>
                  <span className="text-[11px] text-slate-500 block mt-0.5">Runoff drainage capacity</span>
                </div>
              </div>
            )}

            {/* 2. DROUGHT INPUTS */}
            {selectedDisaster === 'drought' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Precipitation / Rainfall (mm)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="300"
                    step="1"
                    value={droughtData.rainfall}
                    onChange={(e) => setDroughtData({ ...droughtData, rainfall: e.target.value })}
                    placeholder="e.g. 12"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Lower rainfall increases drought risk
                  </span>
                  {errors.rainfall && (
                    <p className="text-xs text-red-600 mt-1">{errors.rainfall}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Average Daily Temperature (°C)
                  </label>
                  <input
                    type="number"
                    min="15"
                    max="55"
                    step="0.5"
                    value={droughtData.temperature}
                    onChange={(e) => setDroughtData({ ...droughtData, temperature: e.target.value })}
                    placeholder="e.g. 42"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Higher temperatures accelerate evaporation
                  </span>
                  {errors.temperature && (
                    <p className="text-xs text-red-600 mt-1">{errors.temperature}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Soil Moisture (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={droughtData.soilMoisture}
                    onChange={(e) => setDroughtData({ ...droughtData, soilMoisture: e.target.value })}
                    placeholder="e.g. 16"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Lower soil moisture signals wilting
                  </span>
                  {errors.soilMoisture && (
                    <p className="text-xs text-red-600 mt-1">{errors.soilMoisture}</p>
                  )}
                </div>
              </div>
            )}

            {/* 3. LANDSLIDE INPUTS */}
            {selectedDisaster === 'landslide' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Rainfall (mm)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="500"
                    step="1"
                    value={landslideData.rainfall}
                    onChange={(e) => setLandslideData({ ...landslideData, rainfall: e.target.value })}
                    placeholder="e.g. 180"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Continuous heavy rain saturates hillslopes
                  </span>
                  {errors.rainfall && (
                    <p className="text-xs text-red-600 mt-1">{errors.rainfall}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Slope Incline (Degrees °)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="75"
                    step="1"
                    value={landslideData.slope}
                    onChange={(e) => setLandslideData({ ...landslideData, slope: e.target.value })}
                    placeholder="e.g. 45"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Steeper slopes (&gt;30°) have higher gravitational slip
                  </span>
                  {errors.slope && (
                    <p className="text-xs text-red-600 mt-1">{errors.slope}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Soil Condition
                  </label>
                  <select
                    value={landslideData.soilCondition}
                    onChange={(e) =>
                      setLandslideData({ ...landslideData, soilCondition: e.target.value as any })
                    }
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Stable Rocky">Stable Rocky (Hard bedrock)</option>
                    <option value="Moderately Stable">Moderately Stable (Compacted regolith)</option>
                    <option value="Loose / Sandy">Loose / Sandy (Friable soil)</option>
                    <option value="Saturated & Unstable">Saturated & Unstable (High liquefaction)</option>
                  </select>
                  <span className="text-[11px] text-slate-500 block mt-0.5">Geological cohesiveness</span>
                </div>
              </div>
            )}

            {/* 4. FOREST FIRE INPUTS */}
            {selectedDisaster === 'forest_fire' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Temperature (°C)
                  </label>
                  <input
                    type="number"
                    min="15"
                    max="55"
                    step="0.5"
                    value={forestFireData.temperature}
                    onChange={(e) =>
                      setForestFireData({ ...forestFireData, temperature: e.target.value })
                    }
                    placeholder="e.g. 41"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-[11px] text-slate-500 block mt-0.5">High heat fuels thermal ignition</span>
                  {errors.temperature && (
                    <p className="text-xs text-red-600 mt-1">{errors.temperature}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Atmospheric Dryness (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={forestFireData.dryness}
                    onChange={(e) =>
                      setForestFireData({ ...forestFireData, dryness: e.target.value })
                    }
                    placeholder="e.g. 80"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-[11px] text-slate-500 block mt-0.5">Relative dryness index (0–100%)</span>
                  {errors.dryness && (
                    <p className="text-xs text-red-600 mt-1">{errors.dryness}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Wind Speed (km/h)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="120"
                    step="1"
                    value={forestFireData.windSpeed}
                    onChange={(e) =>
                      setForestFireData({ ...forestFireData, windSpeed: e.target.value })
                    }
                    placeholder="e.g. 35"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-[11px] text-slate-500 block mt-0.5">Fans flame propagation & spotting</span>
                  {errors.windSpeed && (
                    <p className="text-xs text-red-600 mt-1">{errors.windSpeed}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Vegetation / Fuel State
                  </label>
                  <select
                    value={forestFireData.vegetationDryness}
                    onChange={(e) =>
                      setForestFireData({
                        ...forestFireData,
                        vegetationDryness: e.target.value as any,
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Green / Moist">Green / Moist (High moisture)</option>
                    <option value="Moderate Dry">Moderate Dry (Partial curing)</option>
                    <option value="Dry Brush">Dry Brush (Readily ignitable)</option>
                    <option value="Extremely Dry & Dense">Extremely Dry & Dense (Tinderbox)</option>
                  </select>
                  <span className="text-[11px] text-slate-500 block mt-0.5">Combustible biomass fuel</span>
                </div>
              </div>
            )}

            {/* 5. CYCLONE INPUTS */}
            {selectedDisaster === 'cyclone' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Wind Speed (km/h)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="300"
                    step="1"
                    value={cycloneData.windSpeed}
                    onChange={(e) => setCycloneData({ ...cycloneData, windSpeed: e.target.value })}
                    placeholder="e.g. 130"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-[11px] text-slate-500 block mt-0.5">&gt;65 km/h squall, &gt;115 km/h cyclone</span>
                  {errors.windSpeed && (
                    <p className="text-xs text-red-600 mt-1">{errors.windSpeed}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Atmospheric Pressure (hPa)
                  </label>
                  <input
                    type="number"
                    min="880"
                    max="1040"
                    step="1"
                    value={cycloneData.atmosphericPressure}
                    onChange={(e) =>
                      setCycloneData({ ...cycloneData, atmosphericPressure: e.target.value })
                    }
                    placeholder="e.g. 960"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-[11px] text-slate-500 block mt-0.5">Lower pressure indicates deeper storm</span>
                  {errors.atmosphericPressure && (
                    <p className="text-xs text-red-600 mt-1">{errors.atmosphericPressure}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Rainfall (mm)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="500"
                    step="1"
                    value={cycloneData.rainfall}
                    onChange={(e) => setCycloneData({ ...cycloneData, rainfall: e.target.value })}
                    placeholder="e.g. 150"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-[11px] text-slate-500 block mt-0.5">Heavy precipitation banding</span>
                  {errors.rainfall && (
                    <p className="text-xs text-red-600 mt-1">{errors.rainfall}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Weather Condition
                  </label>
                  <select
                    value={cycloneData.weatherCondition}
                    onChange={(e) =>
                      setCycloneData({ ...cycloneData, weatherCondition: e.target.value as any })
                    }
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Calm / Overcast">Calm / Overcast</option>
                    <option value="Moderate Squall">Moderate Squall</option>
                    <option value="Severe Gale">Severe Gale</option>
                    <option value="Violent Storm / Cyclone">Violent Storm / Cyclone</option>
                  </select>
                  <span className="text-[11px] text-slate-500 block mt-0.5">Synoptic storm categorization</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons: Assess Risk & Reset */}
        <div className="mt-6 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-100 text-sm font-semibold transition"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" />
            <span>Reset Fields</span>
          </button>

          <button
            type="button"
            onClick={handleAssessRisk}
            className="flex items-center space-x-2 px-6 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm tracking-wide shadow transition transform active:scale-95"
          >
            <span>ASSESS RISK</span>
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </div>

      {/* SECTION 13: DASHBOARD RESULT CARD */}
      {localResult && (
        <div className="bg-white rounded-xl border-2 border-slate-300 shadow-md p-5 sm:p-7 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
            <div>
              <div className="flex items-center space-x-2 text-xs text-slate-500 uppercase tracking-wider font-semibold">
                <span>Assessment Result</span>
                <span>•</span>
                <span className="font-mono">{new Date(localResult.timestamp).toLocaleTimeString()}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                {localResult.district}, {localResult.state}
              </h3>
            </div>

            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded bg-slate-100 text-slate-800 text-xs font-bold uppercase tracking-wider">
                {localResult.disasterType.replace('_', ' ')}
              </span>
              <button
                onClick={onNavigateToResults}
                className="text-xs font-semibold text-amber-700 hover:text-amber-800 underline underline-offset-2 flex items-center"
              >
                View in Full Results
              </button>
            </div>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6 items-center">
            {/* Left: Gauge & Score */}
            <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-200">
              <RiskMeter score={localResult.score} level={localResult.level} />

              <div className="mt-4 text-center">
                <div className="text-xs text-slate-500 font-medium">Evaluation Verdict</div>
                <div className="text-sm font-bold text-slate-800">
                  Risk Category: <span className="font-black underline">{localResult.level}</span>
                </div>
              </div>
            </div>

            {/* Right: Recommendation & Factors */}
            <div className="md:col-span-7 space-y-4">
              {/* Short Recommendation */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start space-x-2.5">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                      Recommendation
                    </h4>
                    <p className="text-sm font-semibold text-slate-800 mt-1 leading-snug">
                      "{localResult.recommendation}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Main Contributing Factors */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5 flex items-center">
                  <span>Main Contributing Factors</span>
                  <span className="text-[11px] text-slate-400 font-normal ml-2">
                    (Relative impact breakdown)
                  </span>
                </h4>
                <div className="space-y-2">
                  {localResult.contributingFactors.map((factor, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50/60 transition"
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-800">
                          {factor.name}:{' '}
                          <strong className="text-slate-900">
                            {factor.value} {factor.unit || ''}
                          </strong>
                        </span>
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                            factor.impact === 'Severe'
                              ? 'bg-rose-100 text-rose-800'
                              : factor.impact === 'High'
                              ? 'bg-orange-100 text-orange-800'
                              : factor.impact === 'Moderate'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {factor.impact} Impact ({factor.scoreContribution}/100)
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-tight">
                        {factor.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action Checklist */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Recommended Preparedness Measures
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
              {getDisasterPreparednessActions(localResult.disasterType, localResult.level).map(
                (act, idx) => (
                  <div
                    key={idx}
                    className="flex items-start space-x-2 bg-slate-50 p-2.5 rounded border border-slate-200"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>{act}</span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
