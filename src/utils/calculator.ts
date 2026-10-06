import {
  DisasterType,
  RiskLevel,
  AssessmentResult,
  FactorContribution,
  FloodInputs,
  DroughtInputs,
  LandslideInputs,
  ForestFireInputs,
  CycloneInputs,
} from '../types/disaster';

export function getRiskLevel(score: number): RiskLevel {
  const rounded = Math.round(score);
  if (rounded <= 30) return 'LOW';
  if (rounded <= 60) return 'MODERATE';
  if (rounded <= 80) return 'HIGH';
  return 'VERY HIGH';
}

export function getStandardRecommendation(level: RiskLevel): string {
  switch (level) {
    case 'LOW':
      return 'Current risk is limited. Continue monitoring environmental conditions.';
    case 'MODERATE':
      return 'Conditions should be monitored regularly and basic preparedness measures should be maintained.';
    case 'HIGH':
      return 'Preparedness measures are important. Closely monitor environmental conditions.';
    case 'VERY HIGH':
      return 'Immediate attention and preparedness are recommended.';
  }
}

export function getDisasterPreparednessActions(type: DisasterType, level: RiskLevel): string[] {
  switch (type) {
    case 'flood':
      if (level === 'LOW') {
        return [
          'Maintain regular drainage inspection routines.',
          'Keep standard local flood emergency contacts updated.',
        ];
      } else if (level === 'MODERATE') {
        return [
          'Inspect stormwater drains and clear culverts of silt or debris.',
          'Monitor upstream river gauges and municipal water level updates.',
          'Advise low-lying residential sectors to keep emergency supplies ready.',
        ];
      } else if (level === 'HIGH') {
        return [
          'Prepare sandbags and water diversion barriers around vulnerable structures.',
          'Identify safe higher ground evacuation corridors and community shelters.',
          'Issue proactive advisories to agricultural and riverbank settlements.',
        ];
      } else {
        return [
          'Activate high-priority local emergency operations center (EOC).',
          'Deploy rescue personnel and watercraft to pre-identified low-lying flood zones.',
          'Enforce immediate evacuation of riverfront and subterranean structures.',
          'Safeguard electrical sub-stations and potable water distribution points.',
        ];
      }

    case 'drought':
      if (level === 'LOW') {
        return [
          'Continue routine monitoring of groundwater tables and canal storage.',
          'Promote seasonal rainwater harvesting and micro-irrigation practices.',
        ];
      } else if (level === 'MODERATE') {
        return [
          'Encourage regulated agricultural water draw and drip irrigation.',
          'Audit reservoir storage volumes and municipal pipe leakage.',
          'Prepare contingency fodder reserves for rural livestock.',
        ];
      } else if (level === 'HIGH') {
        return [
          'Enforce strict non-essential water usage quotas.',
          'Mobilize emergency tanker water distribution routes for affected villages.',
          'Provide subsidized drought-resistant crop advisories to local farmers.',
        ];
      } else {
        return [
          'Declare localized severe agricultural and hydrological drought protocols.',
          'Ration public water supply to prioritize human and livestock hydration.',
          'Activate disaster relief emergency water transports and cattle camps.',
        ];
      }

    case 'landslide':
      if (level === 'LOW') {
        return [
          'Maintain vegetative slope stabilization and drainage channels.',
          'Review geohazard zoning guidelines for steep terrain constructions.',
        ];
      } else if (level === 'MODERATE') {
        return [
          'Inspect hill slopes and retaining walls for fresh fissures or tension cracks.',
          'Clear roadside culverts and hillside drainage channels of loose rocks.',
          'Caution heavy freight vehicles traveling on steep ghat roads.',
        ];
      } else if (level === 'HIGH') {
        return [
          'Restrict tourist and non-essential transit along known landslide chutes.',
          'Issue safety alerts to settlements directly beneath unstable cut slopes.',
          'Pre-position earth-moving machinery at critical roadway choke points.',
        ];
      } else {
        return [
          'Enforce immediate relocation of vulnerable slope-toe settlements.',
          'Close hazardous mountain passes and highways to all vehicular traffic.',
          'Mobilize geotechnical response teams and search-and-rescue units.',
        ];
      }

    case 'forest_fire':
      if (level === 'LOW') {
        return [
          'Maintain routine forest perimeter patrols and fire break clearing.',
          'Remind visitors of basic campsite fire prevention guidelines.',
        ];
      } else if (level === 'MODERATE') {
        return [
          'Activate lookout towers and thermal satellite anomaly monitoring.',
          'Inspect community firebreaks and clear dry understory leaf litter.',
          'Ensure local fire tender water replenishment sources are full.',
        ];
      } else if (level === 'HIGH') {
        return [
          'Ban open burning, agricultural stubble burns, and forest campfires.',
          'Place wildland firefighting personnel and water tankers on high standby.',
          'Establish defensive buffer zones around villages bordering reserve forests.',
        ];
      } else {
        return [
          'Enforce total forest entry ban and deploy rapid-response firefighting crews.',
          'Establish water drops and mechanical fireline containment zones.',
          'Prepare edge-of-forest settlements for rapid evacuation if winds shift.',
        ];
      }

    case 'cyclone':
      if (level === 'LOW') {
        return [
          'Track standard regional meteorological department bulletins.',
          'Maintain regular communication radios and storm shelter readiness.',
        ];
      } else if (level === 'MODERATE') {
        return [
          'Issue preliminary squall warnings to coastal fishing vessels.',
          'Secure temporary roof sheets, signage boards, and loose yard fixtures.',
          'Stock up emergency battery lights, first-aid, and non-perishable foods.',
        ];
      } else if (level === 'HIGH') {
        return [
          'Advise all maritime fishermen and offshore craft to return to port.',
          'Identify pucca cyclone shelters and inspect backup generator fuel.',
          'Trim hazardous tree branches near overhead power lines.',
        ];
      } else {
        return [
          'Evacuate vulnerable coastal hamlets and kutchha dwellings within storm surge zones.',
          'Suspend coastal port, train, and flight operations until landfall subsides.',
          'Station national and state disaster response forces (NDRF/SDRF) with rescue kits.',
        ];
      }
  }
}

/**
 * Normalizes a number into 0 - 100 based on min and max
 */
function normalize(val: number, min: number, max: number): number {
  if (val <= min) return 0;
  if (val >= max) return 100;
  return ((val - min) / (max - min)) * 100;
}

function getImpact(val: number): 'Low' | 'Moderate' | 'High' | 'Severe' {
  if (val <= 30) return 'Low';
  if (val <= 60) return 'Moderate';
  if (val <= 80) return 'High';
  return 'Severe';
}

/**
 * 1. FLOOD ASSESSMENT
 * Inputs: Rainfall (mm), Water Level (m), Soil Moisture (%), Drainage Condition
 */
export function calculateFloodRisk(inputs: FloodInputs): {
  score: number;
  factors: FactorContribution[];
} {
  // Weights:
  // Rainfall: 35%
  // Water Level: 30%
  // Soil Moisture: 20%
  // Drainage Condition: 15%

  const rainfallScore = normalize(inputs.rainfall, 10, 200); // 0 at <=10mm, 100 at >=200mm
  const waterLevelScore = normalize(inputs.waterLevel, 1, 9); // 0 at <=1m, 100 at >=9m
  const moistureScore = normalize(inputs.soilMoisture, 25, 90); // 0 at <=25%, 100 at >=90%

  let drainageScore = 15;
  if (inputs.drainageCondition === 'Good') drainageScore = 5;
  else if (inputs.drainageCondition === 'Moderate') drainageScore = 35;
  else if (inputs.drainageCondition === 'Inadequate') drainageScore = 70;
  else if (inputs.drainageCondition === 'Poor / Blocked') drainageScore = 100;

  const rawScore =
    rainfallScore * 0.35 +
    waterLevelScore * 0.30 +
    moistureScore * 0.20 +
    drainageScore * 0.15;

  const finalScore = Math.min(100, Math.max(0, Math.round(rawScore)));

  const factors: FactorContribution[] = [
    {
      name: '24h Rainfall Intensity',
      value: `${inputs.rainfall}`,
      unit: 'mm',
      scoreContribution: Math.round(rainfallScore),
      impact: getImpact(rainfallScore),
      description:
        inputs.rainfall >= 120
          ? 'Heavy to extremely heavy precipitation saturating catchment basins.'
          : inputs.rainfall >= 60
          ? 'Moderate rainfall accumulating in low elevation areas.'
          : 'Low to baseline rainfall within natural absorption limits.',
    },
    {
      name: 'River / Canal Water Level',
      value: `${inputs.waterLevel}`,
      unit: 'meters',
      scoreContribution: Math.round(waterLevelScore),
      impact: getImpact(waterLevelScore),
      description:
        inputs.waterLevel >= 7
          ? 'Water levels approaching or exceeding structural embankment danger marks.'
          : inputs.waterLevel >= 4
          ? 'Elevated river gauge levels requiring active observation.'
          : 'Normal discharge capacity within river banks.',
    },
    {
      name: 'Soil Moisture Saturation',
      value: `${inputs.soilMoisture}`,
      unit: '%',
      scoreContribution: Math.round(moistureScore),
      impact: getImpact(moistureScore),
      description:
        inputs.soilMoisture >= 80
          ? 'Near total soil saturation preventing stormwater infiltration.'
          : inputs.soilMoisture >= 50
          ? 'Moderate ground absorption capacity remaining.'
          : 'Dry to well-aerated soil capable of rapid water percolation.',
    },
    {
      name: 'Drainage & Outflow Condition',
      value: inputs.drainageCondition,
      scoreContribution: Math.round(drainageScore),
      impact: getImpact(drainageScore),
      description:
        inputs.drainageCondition === 'Poor / Blocked'
          ? 'Severely obstructed culverts or choked channels creating immediate backflow.'
          : inputs.drainageCondition === 'Inadequate'
          ? 'Insufficient conduit capacity causing localized water stagnation.'
          : 'Adequate discharge channels maintaining unimpeded flow.',
    },
  ];

  return { score: finalScore, factors };
}

/**
 * 2. DROUGHT ASSESSMENT
 * Inputs: Rainfall (mm, low = higher risk), Temperature (°C, high = higher risk), Soil Moisture (%, low = higher risk)
 */
export function calculateDroughtRisk(inputs: DroughtInputs): {
  score: number;
  factors: FactorContribution[];
} {
  // Higher drought risk is associated with:
  // - Low rainfall (inverted: 0mm -> 100, >=120mm -> 0)
  // - High temperature (15°C -> 0, >=45°C -> 100)
  // - Low soil moisture (inverted: <=10% -> 100, >=70% -> 0)

  // Rainfall deficit score
  let rainScore = 0;
  if (inputs.rainfall <= 10) rainScore = 100;
  else if (inputs.rainfall >= 130) rainScore = 0;
  else rainScore = ((130 - inputs.rainfall) / 120) * 100;

  // Temperature score
  const tempScore = normalize(inputs.temperature, 22, 46);

  // Moisture deficit score
  let moistureDeficitScore = 0;
  if (inputs.soilMoisture <= 10) moistureDeficitScore = 100;
  else if (inputs.soilMoisture >= 65) moistureDeficitScore = 0;
  else moistureDeficitScore = ((65 - inputs.soilMoisture) / 55) * 100;

  // Weights:
  // Rainfall Deficit: 40%
  // High Temperature: 35%
  // Low Soil Moisture: 25%
  const rawScore =
    rainScore * 0.40 +
    tempScore * 0.35 +
    moistureDeficitScore * 0.25;

  const finalScore = Math.min(100, Math.max(0, Math.round(rawScore)));

  const factors: FactorContribution[] = [
    {
      name: 'Rainfall Deficit',
      value: `${inputs.rainfall}`,
      unit: 'mm',
      scoreContribution: Math.round(rainScore),
      impact: getImpact(rainScore),
      description:
        inputs.rainfall <= 25
          ? 'Prolonged acute precipitation deficit starving regional water tables.'
          : inputs.rainfall <= 65
          ? 'Below-average precipitation causing dry spell stress.'
          : 'Sufficient rainfall supporting hydrological replenishment.',
    },
    {
      name: 'Ambient Temperature Stress',
      value: `${inputs.temperature}`,
      unit: '°C',
      scoreContribution: Math.round(tempScore),
      impact: getImpact(tempScore),
      description:
        inputs.temperature >= 40
          ? 'Extreme heatwave conditions accelerating surface evaporation rates.'
          : inputs.temperature >= 32
          ? 'Elevated summer temperatures driving increased evapotranspiration.'
          : 'Moderate temperatures within sustainable climatic bands.',
    },
    {
      name: 'Soil Moisture Depletion',
      value: `${inputs.soilMoisture}`,
      unit: '%',
      scoreContribution: Math.round(moistureDeficitScore),
      impact: getImpact(moistureDeficitScore),
      description:
        inputs.soilMoisture <= 20
          ? 'Severe ground dryness crossing agricultural wilting thresholds.'
          : inputs.soilMoisture <= 40
          ? 'Sub-optimal root-zone moisture stressing seasonal vegetation.'
          : 'Adequate soil water retention sustaining crop canopy.',
    },
  ];

  return { score: finalScore, factors };
}

/**
 * 3. LANDSLIDE ASSESSMENT
 * Inputs: Rainfall (mm), Slope (degrees), Soil Condition
 */
export function calculateLandslideRisk(inputs: LandslideInputs): {
  score: number;
  factors: FactorContribution[];
} {
  // Higher risk associated with:
  // - High rainfall
  // - Steeper slope
  // - Unstable soil conditions

  const rainfallScore = normalize(inputs.rainfall, 20, 220); // 0 at <=20mm, 100 at >=220mm
  const slopeScore = normalize(inputs.slope, 5, 55); // 0 at <=5°, 100 at >=55°

  let soilScore = 10;
  if (inputs.soilCondition === 'Stable Rocky') soilScore = 10;
  else if (inputs.soilCondition === 'Moderately Stable') soilScore = 35;
  else if (inputs.soilCondition === 'Loose / Sandy') soilScore = 70;
  else if (inputs.soilCondition === 'Saturated & Unstable') soilScore = 100;

  // Weights:
  // Rainfall: 40%
  // Slope Angle: 35%
  // Soil Stability: 25%
  const rawScore =
    rainfallScore * 0.40 +
    slopeScore * 0.35 +
    soilScore * 0.25;

  const finalScore = Math.min(100, Math.max(0, Math.round(rawScore)));

  const factors: FactorContribution[] = [
    {
      name: 'Triggering Rainfall',
      value: `${inputs.rainfall}`,
      unit: 'mm',
      scoreContribution: Math.round(rainfallScore),
      impact: getImpact(rainfallScore),
      description:
        inputs.rainfall >= 130
          ? 'High-intensity deluge generating pore-water pressure along shear planes.'
          : inputs.rainfall >= 60
          ? 'Continuous moderate rain softening upper regolith.'
          : 'Low rainfall with minimal hydro-mechanical slope lubrication.',
    },
    {
      name: 'Terrain Slope Gradient',
      value: `${inputs.slope}`,
      unit: '°',
      scoreContribution: Math.round(slopeScore),
      impact: getImpact(slopeScore),
      description:
        inputs.slope >= 40
          ? 'Extremely steep incline exceeding critical natural angle of repose.'
          : inputs.slope >= 22
          ? 'Moderate hillside incline susceptible to debris sliding when lubricated.'
          : 'Gentle terrain with low gravitational sheer potential.',
    },
    {
      name: 'Subsurface Soil Stability',
      value: inputs.soilCondition,
      scoreContribution: Math.round(soilScore),
      impact: getImpact(soilScore),
      description:
        inputs.soilCondition === 'Saturated & Unstable'
          ? 'Heavily saturated uncompacted regolith with high liquefaction hazard.'
          : inputs.soilCondition === 'Loose / Sandy'
          ? 'Friable loose soil with weak root-binding cohesion.'
          : 'Consolidated geological strata offering strong mechanical resistance.',
    },
  ];

  return { score: finalScore, factors };
}

/**
 * 4. FOREST FIRE ASSESSMENT
 * Inputs: Temperature (°C), Dryness (%), Wind Speed (km/h), Vegetation Dryness
 */
export function calculateForestFireRisk(inputs: ForestFireInputs): {
  score: number;
  factors: FactorContribution[];
} {
  // Higher risk associated with:
  // - High temperature
  // - High dryness
  // - Strong wind
  // - Dry vegetation

  const tempScore = normalize(inputs.temperature, 20, 48);
  const drynessScore = normalize(inputs.dryness, 20, 90);
  const windScore = normalize(inputs.windSpeed, 5, 60);

  let vegScore = 10;
  if (inputs.vegetationDryness === 'Green / Moist') vegScore = 10;
  else if (inputs.vegetationDryness === 'Moderate Dry') vegScore = 40;
  else if (inputs.vegetationDryness === 'Dry Brush') vegScore = 75;
  else if (inputs.vegetationDryness === 'Extremely Dry & Dense') vegScore = 100;

  // Weights:
  // Temperature: 30%
  // Dryness Index: 25%
  // Wind Speed: 20%
  // Vegetation Curing: 25%
  const rawScore =
    tempScore * 0.30 +
    drynessScore * 0.25 +
    windScore * 0.20 +
    vegScore * 0.25;

  const finalScore = Math.min(100, Math.max(0, Math.round(rawScore)));

  const factors: FactorContribution[] = [
    {
      name: 'Ambient Temperature',
      value: `${inputs.temperature}`,
      unit: '°C',
      scoreContribution: Math.round(tempScore),
      impact: getImpact(tempScore),
      description:
        inputs.temperature >= 38
          ? 'Blistering ambient heat reducing thermal ignition resistance of forest fuel.'
          : inputs.temperature >= 30
          ? 'Warm weather facilitating rapid moisture loss from leaves and twigs.'
          : 'Temperate conditions keeping biomass below flash combustion.',
    },
    {
      name: 'Dryness / Low Humidity',
      value: `${inputs.dryness}`,
      unit: '%',
      scoreContribution: Math.round(drynessScore),
      impact: getImpact(drynessScore),
      description:
        inputs.dryness >= 75
          ? 'Critically parched atmosphere stripping moisture from forest floor fuels.'
          : inputs.dryness >= 50
          ? 'Moderate atmospheric dryness drying out fine dead woody debris.'
          : 'High ambient humidity insulating foliage against easy ignition.',
    },
    {
      name: 'Wind Velocity',
      value: `${inputs.windSpeed}`,
      unit: 'km/h',
      scoreContribution: Math.round(windScore),
      impact: getImpact(windScore),
      description:
        inputs.windSpeed >= 40
          ? 'Gale-force gusts capable of carrying embers and rapidly fanning spot fires.'
          : inputs.windSpeed >= 20
          ? 'Breezy conditions supplying oxygen and spreading flame fronts.'
          : 'Calm or light breeze with limited fire propagation velocity.',
    },
    {
      name: 'Vegetation Fuel State',
      value: inputs.vegetationDryness,
      scoreContribution: Math.round(vegScore),
      impact: getImpact(vegScore),
      description:
        inputs.vegetationDryness === 'Extremely Dry & Dense'
          ? 'Highly cured tinderbox fuels with high combustible fuel-loading density.'
          : inputs.vegetationDryness === 'Dry Brush'
          ? 'Dry brush and grass readily ignited by single sparks.'
          : 'Living sap-rich green vegetation resistant to spontaneous ignition.',
    },
  ];

  return { score: finalScore, factors };
}

/**
 * 5. CYCLONE ASSESSMENT
 * Inputs: Wind Speed (km/h), Atmospheric Pressure (hPa), Rainfall (mm), Weather Condition
 */
export function calculateCycloneRisk(inputs: CycloneInputs): {
  score: number;
  factors: FactorContribution[];
} {
  // Higher risk associated with:
  // - High wind speed
  // - Low atmospheric pressure (1015 = normal, 920 = super cyclone)
  // - High rainfall
  // - Severe weather condition

  const windScore = normalize(inputs.windSpeed, 20, 160); // 0 at <=20km/h, 100 at >=160km/h

  // Pressure: lower pressure is higher risk
  let pressureScore = 0;
  if (inputs.atmosphericPressure <= 930) pressureScore = 100;
  else if (inputs.atmosphericPressure >= 1012) pressureScore = 0;
  else pressureScore = ((1012 - inputs.atmosphericPressure) / 82) * 100;

  const rainScore = normalize(inputs.rainfall, 10, 200);

  let conditionScore = 10;
  if (inputs.weatherCondition === 'Calm / Overcast') conditionScore = 10;
  else if (inputs.weatherCondition === 'Moderate Squall') conditionScore = 40;
  else if (inputs.weatherCondition === 'Severe Gale') conditionScore = 75;
  else if (inputs.weatherCondition === 'Violent Storm / Cyclone') conditionScore = 100;

  // Weights:
  // Wind Speed: 40%
  // Low Atmospheric Pressure: 30%
  // Rainfall: 20%
  // Storm Weather Condition: 10%
  const rawScore =
    windScore * 0.40 +
    pressureScore * 0.30 +
    rainScore * 0.20 +
    conditionScore * 0.10;

  const finalScore = Math.min(100, Math.max(0, Math.round(rawScore)));

  const factors: FactorContribution[] = [
    {
      name: 'Sustained Wind Speed',
      value: `${inputs.windSpeed}`,
      unit: 'km/h',
      scoreContribution: Math.round(windScore),
      impact: getImpact(windScore),
      description:
        inputs.windSpeed >= 100
          ? 'Severe cyclonic storm-force winds posing catastrophic structural hazard.'
          : inputs.windSpeed >= 55
          ? 'Squally gale winds capable of uprooting branches and unfastened roofs.'
          : 'Moderate winds within typical tropical maritime ranges.',
    },
    {
      name: 'Atmospheric Central Pressure',
      value: `${inputs.atmosphericPressure}`,
      unit: 'hPa',
      scoreContribution: Math.round(pressureScore),
      impact: getImpact(pressureScore),
      description:
        inputs.atmosphericPressure <= 960
          ? 'Intense barometric depression indicating a deep, organized cyclone core.'
          : inputs.atmosphericPressure <= 995
          ? 'Significant barometric drop signaling active cyclonic circulation.'
          : 'Standard sea-level barometric pressure.',
    },
    {
      name: 'Precipitation Banding',
      value: `${inputs.rainfall}`,
      unit: 'mm',
      scoreContribution: Math.round(rainScore),
      impact: getImpact(rainScore),
      description:
        inputs.rainfall >= 120
          ? 'Torrential feeder-band downpours creating secondary inland inundation.'
          : inputs.rainfall >= 50
          ? 'Heavy coastal rain bands accompanying storm system.'
          : 'Scattered light precipitation.',
    },
    {
      name: 'Synoptic Weather Condition',
      value: inputs.weatherCondition,
      scoreContribution: Math.round(conditionScore),
      impact: getImpact(conditionScore),
      description:
        inputs.weatherCondition === 'Violent Storm / Cyclone'
          ? 'Turbulent eyewall/spiral vortex with zero visibility and surge threat.'
          : inputs.weatherCondition === 'Severe Gale'
          ? 'Continuous squalls with high oceanic swell and rough sea state.'
          : 'Mild overcast sky with intermittent sea breeze.',
    },
  ];

  return { score: finalScore, factors };
}

/**
 * Universal evaluator for any disaster type
 */
export function evaluateDisasterRisk(
  disasterType: DisasterType,
  state: string,
  district: string,
  inputs: Record<string, any>
): AssessmentResult {
  let score = 0;
  let factors: FactorContribution[] = [];

  switch (disasterType) {
    case 'flood': {
      const res = calculateFloodRisk({
        rainfall: Number(inputs.rainfall ?? 0),
        waterLevel: Number(inputs.waterLevel ?? 0),
        soilMoisture: Number(inputs.soilMoisture ?? 0),
        drainageCondition: inputs.drainageCondition || 'Moderate',
      });
      score = res.score;
      factors = res.factors;
      break;
    }
    case 'drought': {
      const res = calculateDroughtRisk({
        rainfall: Number(inputs.rainfall ?? 0),
        temperature: Number(inputs.temperature ?? 0),
        soilMoisture: Number(inputs.soilMoisture ?? 0),
      });
      score = res.score;
      factors = res.factors;
      break;
    }
    case 'landslide': {
      const res = calculateLandslideRisk({
        rainfall: Number(inputs.rainfall ?? 0),
        slope: Number(inputs.slope ?? 0),
        soilCondition: inputs.soilCondition || 'Moderately Stable',
      });
      score = res.score;
      factors = res.factors;
      break;
    }
    case 'forest_fire': {
      const res = calculateForestFireRisk({
        temperature: Number(inputs.temperature ?? 0),
        dryness: Number(inputs.dryness ?? 0),
        windSpeed: Number(inputs.windSpeed ?? 0),
        vegetationDryness: inputs.vegetationDryness || 'Moderate Dry',
      });
      score = res.score;
      factors = res.factors;
      break;
    }
    case 'cyclone': {
      const res = calculateCycloneRisk({
        windSpeed: Number(inputs.windSpeed ?? 0),
        atmosphericPressure: Number(inputs.atmosphericPressure ?? 1010),
        rainfall: Number(inputs.rainfall ?? 0),
        weatherCondition: inputs.weatherCondition || 'Moderate Squall',
      });
      score = res.score;
      factors = res.factors;
      break;
    }
  }

  const level = getRiskLevel(score);
  const recommendation = getStandardRecommendation(level);

  return {
    id: `DRA-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    state: state.trim() || 'Karnataka',
    district: district.trim() || 'Kalaburagi',
    disasterType,
    score,
    level,
    recommendation,
    contributingFactors: factors,
    inputs,
  };
}
