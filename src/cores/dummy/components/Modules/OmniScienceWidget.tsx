import { processIncomingData } from '../Shared/SwarmRoom';
import { forceMapData, DebugDump } from '../../../../lib/forceRenderMapper';
import { Fallback3D } from '../Shared/Fallback3D';
import React, { useState } from 'react';
import { 
  Atom, 
  Droplet, 
  MapPin, 
  ShieldAlert, 
  Coins, 
  Globe2, 
  Info,
  Play,
  CheckCircle,
  AlertTriangle,
  XCircle,
  TrendingDown
} from 'lucide-react';
import { motion } from 'motion/react';
import * as OmniEngine from '../../utils/omniScienceEngine';

interface FormulaInput {
  key: string;
  label: string;
  min: number;
  max: number;
  defaultValue: number;
  step: number;
  unit: string;
  description: string;
}

interface FormulaDef {
  id: string;
  name: string;
  category: string;
  description: string;
  inputs: FormulaInput[];
  calculate: (params: Record<string, any>) => OmniEngine.OmniScienceResult;
}

export default function OmniScienceWidget() {
  const baseFormulas: FormulaDef[] = [
    // 1. GEOPHYSICS, GEOLOGY & SPATIAL
    {
      id: 'acoustic_impedance',
      name: 'Acoustic Impedance (Z)',
      category: 'Geophysics & Rock Physics',
      description: 'Calculates structural acoustic impedance based on rock density and acoustic compressional velocity.',
      inputs: [
        { key: 'density', label: 'Rock Density', min: 1000, max: 4000, defaultValue: 2500, step: 50, unit: 'kg/m³', description: 'Average density of the geological strata layer.' },
        { key: 'velocity', label: 'Acoustic Velocity', min: 500, max: 8000, defaultValue: 3200, step: 100, unit: 'm/s', description: 'P-wave travel velocity through formation.' }
      ],
      calculate: (p) => OmniEngine.calculateAcousticImpedance(p.density, p.velocity)
    },
    {
      id: 'apparent_resistivity',
      name: 'Wenner Apparent Resistivity',
      category: 'Geophysics & Rock Physics',
      description: ' Wenner array configuration electrical apparent resistivity for groundwater and mineral prospecting.',
      inputs: [
        { key: 'distance', label: 'Electrode Distance', min: 1, max: 1000, defaultValue: 50, step: 5, unit: 'meters', description: 'Spacing interval between measurement spikes.' },
        { key: 'resistance', label: 'Measured Resistance', min: 0.01, max: 1000, defaultValue: 2.5, step: 0.1, unit: 'Ohms (Ω)', description: 'Direct field resistance logging.' }
      ],
      calculate: (p) => OmniEngine.calculateApparentResistivity(p.distance, p.resistance)
    },
    {
      id: 'gpr_twt',
      name: 'GPR Radar Traveltime (TWT)',
      category: 'Geophysics & Rock Physics',
      description: 'Provides ground-penetrating radar two-way traveltime based on depth and strata dielectric velocity.',
      inputs: [
        { key: 'depth', label: 'Reflector Depth', min: 0.5, max: 50, defaultValue: 4.5, step: 0.5, unit: 'meters', description: 'Subsurface objective target depth.' },
        { key: 'velocity', label: 'EM Velocity', min: 0.05, max: 0.2, defaultValue: 0.11, step: 0.01, unit: 'm/ns', description: 'Dielectric wave velocity through geological formation.' }
      ],
      calculate: (p) => OmniEngine.calculateGPRTWT(p.depth, p.velocity)
    },
    {
      id: 'haversine_distance',
      name: 'Haversine Geospatial Distance',
      category: 'Geophysics & Rock Physics',
      description: 'Evaluates distance between spherical coordinates on planet earth.',
      inputs: [
        { key: 'lat1', label: 'Origin Latitude', min: -90, max: 90, defaultValue: 0.824, step: 0.001, unit: 'deg', description: 'Latitude coordinate of spill or incident core.' },
        { key: 'lon1', label: 'Origin Longitude', min: -180, max: 180, defaultValue: 104.115, step: 0.001, unit: 'deg', description: 'Longitude coordinate of spill or incident core.' },
        { key: 'lat2', label: 'Target Latitude', min: -90, max: 90, defaultValue: 0.852, step: 0.001, unit: 'deg', description: 'Latitude of target civilian residential buffer core.' },
        { key: 'lon2', label: 'Target Longitude', min: -180, max: 180, defaultValue: 104.120, step: 0.001, unit: 'deg', description: 'Longitude of target civilian residential buffer core.' }
      ],
      calculate: (p) => OmniEngine.calculateHaversineDistance(p.lat1, p.lon1, p.lat2, p.lon2)
    },
    {
      id: 'rmr_rating',
      name: 'Rock Mass Rating (RMR89)',
      category: 'Geophysics & Rock Physics',
      description: 'Calculates the geotechnical soundness class for underground tunnels, shafts, and drilling stability.',
      inputs: [
        { key: 'strength', label: 'UCS Strength Score', min: 0, max: 15, defaultValue: 12, step: 1, unit: 'pts', description: 'Uniaxial compressive strength rating.' },
        { key: 'rqd', label: 'RQD Quality Score', min: 3, max: 20, defaultValue: 17, step: 1, unit: 'pts', description: 'Rock Quality Designation score parameter.' },
        { key: 'spacing', label: 'Joint Spacing Score', min: 5, max: 20, defaultValue: 15, step: 1, unit: 'pts', description: 'Average joint plane distance rating.' },
        { key: 'condition', label: 'Joint Condition Score', min: 0, max: 30, defaultValue: 22, step: 1, unit: 'pts', description: 'Joint roughness/filling quality score.' },
        { key: 'groundwater', label: 'Groundwater Score', min: 0, max: 15, defaultValue: 10, step: 1, unit: 'pts', description: 'Hydrologic pressure infiltration status.' }
      ],
      calculate: (p) => OmniEngine.calculateRMR(p.strength, p.rqd, p.spacing, p.condition, p.groundwater)
    },
    {
      id: 'porosity',
      name: 'Density-Derived Porosity',
      category: 'Geophysics & Rock Physics',
      description: 'Calculates the volumetric void space inside the rock formation matrix.',
      inputs: [
        { key: 'matrixDensity', label: 'Matrix Density', min: 1.5, max: 3.5, defaultValue: 2.65, step: 0.05, unit: 'g/cm³', description: 'Pure mineral matrix sandstone/basement density.' },
        { key: 'bulkDensity', label: 'Bulk log Density', min: 1.1, max: 3.2, defaultValue: 2.22, step: 0.05, unit: 'g/cm³', description: 'Saturated formation logs total bulk density.' },
        { key: 'fluidDensity', label: 'Fluid density', min: 0.8, max: 1.5, defaultValue: 1.0, step: 0.05, unit: 'g/cm³', description: 'Invaporated mud fluid average density.' }
      ],
      calculate: (p) => OmniEngine.calculatePorosity(p.matrixDensity, p.bulkDensity, p.fluidDensity)
    },
    {
      id: 'slope_deformation',
      name: 'Slope Deformation Rate',
      category: 'Geophysics & Rock Physics',
      description: 'Calculates displacement strain creeps on high wall pits from pore pressure stresses.',
      inputs: [
        { key: 'incline', label: 'Slope Incline Angle', min: 5, max: 90, defaultValue: 48, step: 1, unit: 'deg', description: 'Overall incline slope failure orientation angle.' },
        { key: 'porePressure', label: 'Pore Flow Pressure', min: 0, max: 500, defaultValue: 120, step: 10, unit: 'kPa', description: 'Pore-liquid hydraulic driving pressure.' },
        { key: 'structuralCohesion', label: 'Rock Ground Cohesion', min: 10, max: 2000, defaultValue: 450, step: 10, unit: 'kPa', description: 'Shear cohesion resistance of fault wall.' }
      ],
      calculate: (p) => OmniEngine.calculateSlopeDeformationRate(p.incline, p.porePressure, p.structuralCohesion)
    },
    
    // 2. CHEMISTRY, BIOLOGY & ENVIRONMENT
    {
      id: 'gas_toxicity',
      name: 'H2S & Methane Toxicity Matrix',
      category: 'Biochemical & Ecological',
      description: 'Assess toxic gas inhalation hazard index and lower explosion boundaries.',
      inputs: [
        { key: 'h2sPpm', label: 'Hydrogen Sulfide (H2S)', min: 0, max: 500, defaultValue: 15, step: 1, unit: 'ppm', description: 'Sour H2S gas density in atmosphere.' },
        { key: 'ch4Percent', label: 'Methane (CH4)', min: 0, max: 10, defaultValue: 1.2, step: 0.1, unit: '% vol', description: 'Hydrocarbon level as percentage of ambient gas.' }
      ],
      calculate: (p) => OmniEngine.calculateGasToxicity(p.h2sPpm, p.ch4Percent)
    },
    {
      id: 'ph_corrosion',
      name: 'pH Corrosion Dissolution Index',
      category: 'Biochemical & Ecological',
      description: 'Assess metallic casing dissolution wall thinning under highly acidic drainage conditions.',
      inputs: [
        { key: 'pH', label: 'Aquatic pH level', min: 0, max: 14, defaultValue: 3.1, step: 0.1, unit: 'pH', description: 'Liquid acidity or base level index.' },
        { key: 'alkalinity', label: 'Liquid Alkalinity', min: 0, max: 500, defaultValue: 45, step: 5, unit: 'mg/L CaCO3', description: 'Chemical buffering capacity indicator.' }
      ],
      calculate: (p) => OmniEngine.calculatePHCorrosion(p.pH, p.alkalinity)
    },
    {
      id: 'shannon_diversity',
      name: 'Shannon-Wiener Biological Diversity',
      category: 'Biochemical & Ecological',
      description: 'Evaluates ecological biosphere damage states from chemical contamination events.',
      inputs: [
        { key: 'speciesA', label: 'Target Bio Indicator Specimen A', min: 0, max: 1000, defaultValue: 420, step: 10, unit: 'count', description: 'Species population logs.' },
        { key: 'speciesB', label: 'Bio Indicator Specimen B', min: 0, max: 1000, defaultValue: 65, step: 5, unit: 'count', description: 'Species population logs.' },
        { key: 'speciesC', label: 'Bio Indicator Specimen C', min: 0, max: 1000, defaultValue: 12, step: 2, unit: 'count', description: 'Species population logs.' }
      ],
      calculate: (p) => OmniEngine.calculateShannonWienerIndex([p.speciesA, p.speciesB, p.speciesC])
    },
    {
      id: 'wqi_quality',
      name: 'Water Quality Index (WQI)',
      category: 'Biochemical & Ecological',
      description: 'Multivariable pure water health index for drinking aquifers.',
      inputs: [
        { key: 'doPercent', label: 'Dissolved Oxygen (DO)', min: 0, max: 120, defaultValue: 82, step: 1, unit: '%', description: 'Oxygen dissolution percentage indicator.' },
        { key: 'pH', label: 'Active pH', min: 0, max: 14, defaultValue: 7.4, step: 0.1, unit: 'pH', description: 'Overall water pH register.' },
        { key: 'turbidity', label: 'Turbidity Rating', min: 0, max: 200, defaultValue: 8.5, step: 0.5, unit: 'NTU', description: 'Clarification blockage level index.' },
        { key: 'tds', label: 'Total Dissolved Solids', min: 10, max: 2000, defaultValue: 430, step: 10, unit: 'mg/L', description: 'TDS mineralization records.' }
      ],
      calculate: (p) => OmniEngine.calculateWaterQualityIndex(p.doPercent, p.pH, p.turbidity, p.tds)
    },
    {
      id: 'plume_dispersion',
      name: 'Gaussian Airborne Plume Dispersion',
      category: 'Biochemical & Ecological',
      description: 'Estimates downwind airborne gas concentration densities at distance paths.',
      inputs: [
        { key: 'leakRate', label: 'Leak Release Intensity', min: 0.1, max: 50, defaultValue: 5.5, step: 0.1, unit: 'g/sec', description: 'Mass outflow source factor.' },
        { key: 'windSpeed', label: 'Ambient Wind Speed', min: 0.5, max: 25, defaultValue: 4.2, step: 0.5, unit: 'm/s', description: 'Atmospheric transport speed vector.' },
        { key: 'distance', label: 'Downwind Query Distance', min: 10, max: 5000, defaultValue: 850, step: 50, unit: 'meters', description: 'Travel path coordinate query point.' }
      ],
      calculate: (p) => OmniEngine.calculatePlumeDispersionRate(p.leakRate, p.windSpeed, p.distance)
    },

    // 3. SOCIO-GOVERNMENT & REGULATORY
    {
      id: 'noise_pollution',
      name: 'Acoustic Residential Decay',
      category: 'Socio-Governmental',
      description: 'Spherical decay projections of machinery noise pollution toward neighborhood boundaries.',
      inputs: [
        { key: 'sourceDB', label: 'Rig Source Noise', min: 60, max: 140, defaultValue: 108, step: 1, unit: 'dB(A)', description: 'Peak noise output from major turbines/pumps.' },
        { key: 'distance', label: 'Distance to Homes', min: 5, max: 2000, defaultValue: 250, step: 25, unit: 'meters', description: 'Clearing separation from residential buffer.' },
        { key: 'limit', label: 'Statutory Noise Limit', min: 40, max: 80, defaultValue: 55, step: 1, unit: 'dB(A)', description: 'Permitted residential noise buffer standard.' }
      ],
      calculate: (p) => OmniEngine.calculateNoiseDecay(p.sourceDB, p.distance, p.limit)
    },
    {
      id: 'village_evacuation',
      name: 'Emergency Evacuation Routing',
      category: 'Socio-Governmental',
      description: 'Clearing times calculations under residential route road congestion environments.',
      inputs: [
        { key: 'population', label: 'At-Risk Civil Population', min: 50, max: 10000, defaultValue: 1250, step: 50, unit: 'people', description: 'Residents within hazard impact zone.' },
        { key: 'congestion', label: 'Route Congestion Factor', min: 0, max: 9, defaultValue: 3, step: 1, unit: 'scale', description: 'Traffic bottleneck complexity level.' },
        { key: 'distance', label: 'Evacuation Buffer Distance', min: 1, max: 100, defaultValue: 12, step: 1, unit: 'km', description: 'Dislocation path scale away from scene.' },
        { key: 'speed', label: 'Safe Transport Speed', min: 5, max: 100, defaultValue: 25, step: 5, unit: 'km/hour', description: 'Average logistical dispatch speed.' }
      ],
      calculate: (p) => OmniEngine.calculateEvacuationTime(p.population, p.congestion, p.distance, p.speed)
    },
    {
      id: 'regional_fines',
      name: 'Multi-Hazard Penalty Matrix',
      category: 'Socio-Governmental',
      description: 'Calculates structural civil restitution penalties and multiplying damage fines.',
      inputs: [
        { key: 'spillVolume', label: 'Discharged Fluid Volume', min: 1, max: 100000, defaultValue: 4500, step: 100, unit: 'barrels', description: 'Volume of spill pollutant logged.' },
        { key: 'isProtected', label: 'UNESCO/Protected Reserve', min: 0, max: 1, defaultValue: 1, step: 1, unit: 'binary', description: 'Whether the area falls into conserved boundaries.' },
        { key: 'delayReporting', label: 'Disclosure Transmission Delay', min: 0.5, max: 168, defaultValue: 36, step: 0.5, unit: 'hours', description: 'Delay between breach event and statutory alarm alerts.' }
      ],
      calculate: (p) => OmniEngine.calculateRegionalFines(p.spillVolume, p.isProtected === 1, p.delayReporting)
    },

    // 4. CORPORATE, FINANCIAL & PRIVATE SECTOR
    {
      id: 'operational_delay',
      name: 'Rig Idle Loss Rate (CAPEX Burn)',
      category: 'Finance & Venture Metrics',
      description: 'Cumulative monetary losses generated when drill string assets are halted by secondary hazards.',
      inputs: [
        { key: 'delay', label: 'Halt Duration', min: 1, max: 720, defaultValue: 48, step: 1, unit: 'hours', description: 'Accumulated operational freeze periods.' },
        { key: 'crewWage', label: 'Contractor Crew/Logistics Rate', min: 100, max: 10000, defaultValue: 1500, step: 100, unit: '$/hour', description: 'Base standby contractor retainment costs.' },
        { key: 'lostRev', label: 'Production Deficit Yield', min: 500, max: 50000, defaultValue: 8200, step: 200, unit: '$/hour', description: 'Deferred oil/gas processing margins.' }
      ],
      calculate: (p) => OmniEngine.calculateOperationalDelayCost(p.delay, p.crewWage, p.lostRev)
    },
    {
      id: 'stock_panic',
      name: 'Market Panic Stock Index',
      category: 'Finance & Venture Metrics',
      description: 'Simulates equity valuation drop multipliers tracking media visibility streams.',
      inputs: [
        { key: 'severity', label: 'Geotechnical Severity', min: 0, max: 100, defaultValue: 72, step: 5, unit: 'scale', description: 'Calculated field disaster index.' },
        { key: 'mediaVisibility', label: 'Media Virality Factor', min: 0, max: 100, defaultValue: 85, step: 5, unit: 'scale', description: 'Socio-amplification rating core.' },
        { key: 'capBln', label: 'Direct Parent Liquidity Tier', min: 0.1, max: 200, defaultValue: 15.5, step: 0.5, unit: '$ Billions', description: 'Total equity assets backing.' }
      ],
      calculate: (p) => OmniEngine.calculateMarketPanicIndex(p.severity, p.mediaVisibility, p.capBln)
    },
    {
      id: 'insurance_multiplier',
      name: 'Premium Asset Surcharge',
      category: 'Finance & Venture Metrics',
      description: 'Estimates insurance premium multiplier adjustments based on recorded hazard tracks.',
      inputs: [
        { key: 'incidents', label: 'Historical Incident Count', min: 0, max: 20, defaultValue: 3, step: 1, unit: 'incidents', description: 'Prior environmental violations.' },
        { key: 'seismicThreat', label: 'Ground Seismic Tension Score', min: 0.1, max: 5, defaultValue: 2.1, step: 0.1, unit: 'index', description: 'Geodynamic threat rating boundary.' }
      ],
      calculate: (p) => OmniEngine.calculateAssetInsuranceMultiplier(p.incidents, p.seismicThreat)
    },

    // 5. INTERNATIONAL & GLOBAL COMPLIANCE
    {
      id: 'carbon_penalties',
      name: 'Greenhouse Gas UNFCCC Taxes',
      category: 'International Boundaries',
      description: 'Projections on carbon penalty rates over uncontrolled wellblowouts.',
      inputs: [
        { key: 'duration', label: 'Blowout Days', min: 1, max: 90, defaultValue: 14, step: 1, unit: 'days', description: 'Duration of open atmospheric discharge.' },
        { key: 'intensity', label: 'Release Rate Intensity', min: 50, max: 20000, defaultValue: 3400, step: 100, unit: 'tons/day', description: 'Methane and CO2 equivalent discharge.' },
        { key: 'carbonPrice', label: 'International CO2 Value', min: 10, max: 300, defaultValue: 95, step: 5, unit: '$/ton', description: 'Underlying cap/trade emission carbon price.' }
      ],
      calculate: (p) => OmniEngine.calculateCarbonTaxPenalties(p.duration, p.intensity, p.carbonPrice)
    },
    {
      id: 'cross_border',
      name: 'Maritime Boundary Fallout Check',
      category: 'International Boundaries',
      description: 'Calculates geopolitical spill crossover risks vs surrounding sovereign states.',
      inputs: [
        { key: 'lat', label: 'Discharge Latitude', min: -5, max: 5, defaultValue: 0.835, step: 0.001, unit: 'deg', description: 'Incident baseline latitude.' },
        { key: 'lon', label: 'Discharge Longitude', min: 100, max: 110, defaultValue: 104.105, step: 0.001, unit: 'deg', description: 'Incident baseline longitude.' },
        { key: 'radius', label: 'Spill Hydro Dispersion', min: 1, max: 200, defaultValue: 45, step: 1, unit: 'km', description: 'Radial drift projection scale.' }
      ],
      calculate: (p) => OmniEngine.calculateCrossBorderFallout(p.lat, p.lon, p.radius)
    },

    // 6. THREAT, SECURITY & CRISIS
    {
      id: 'blast_radius',
      name: 'Dynamic Blast Wave (TNT Equiv.)',
      category: 'Threats & Physical Disasters',
      description: 'Calculates blast overpressures and devastating spatial ranges of explosive gases.',
      inputs: [
        { key: 'weight', label: 'Gas Fuel Mass (TNT eq.)', min: 10, max: 50000, defaultValue: 4200, step: 50, unit: 'kg', description: 'Accumulated fuel-air mixture mass equivalent.' },
        { key: 'distance', label: 'Query Target Distance', min: 2, max: 2000, defaultValue: 180, step: 10, unit: 'meters', description: 'Target proximity boundary index.' }
      ],
      calculate: (p) => OmniEngine.calculateBlastRadiusOverpressure(p.weight, p.distance)
    },
    {
      id: 'cascading_failure',
      name: 'Dominos Chain Collapse Index',
      category: 'Threats & Physical Disasters',
      description: 'Assess complex cascading risk of geological faults triggering network short arcs.',
      inputs: [
        { key: 'acc', label: 'PGA Earth Acceleration', min: 0.01, max: 2.0, defaultValue: 0.45, step: 0.01, unit: 'g-force', description: 'Seismic peak ground acceleration forces.' },
        { key: 'waterFactor', label: 'Soil Water Saturation', min: 0, max: 1.0, defaultValue: 0.75, step: 0.05, unit: 'fraction', description: 'Interstitial mud moisture loading factor.' },
        { key: 'gridLag', label: 'Electrical Switch Trip Lag', min: 10, max: 2000, defaultValue: 480, step: 10, unit: 'ms', description: 'Logistics trip breaker isolation latency.' }
      ],
      calculate: (p) => OmniEngine.calculateCascadingFailureProbability(p.acc, p.waterFactor, p.gridLag)
    },
    {
      id: 'cyber_sabotage',
      name: 'Telemetry Hack Signature Anomaly',
      category: 'Threats & Physical Disasters',
      description: 'Analyzes packet latency variances indicating active jamming intrusions.',
      inputs: [
        { key: 'latencyErr', label: 'Symmetric Network Outage', min: 0, max: 1000, defaultValue: 145, step: 5, unit: 'ms', description: 'Average transmission delay variance errors.' },
        { key: 'outOfOrder', label: 'Out-Of-Order Telemetry Rate', min: 0, max: 1, defaultValue: 0.18, step: 0.01, unit: 'ratio', description: 'Re-sequenced out of order packets fraction.' }
      ],
      calculate: (p) => OmniEngine.calculateCyberPhysicalSabotageRisk(p.latencyErr, p.outOfOrder)
    },

    // 20+ ADDITIONAL FORMULAS (THE OMEGA DIRECTIVE)
    {
      id: 'darcy_velocity',
      name: "Darcy Groundwater Aquifer Seepage",
      category: 'Omega Expansion - Fluids',
      description: "Calculates flow velocities of toxified leachates crossing geological strata.",
      inputs: [
        { key: 'k', label: 'Conductivity (K)', min: 0.01, max: 500, defaultValue: 4.8, step: 0.1, unit: 'm/day', description: 'Permeability flow index.' },
        { key: 'i', label: 'Hydraulic Gradient (i)', min: 0.001, max: 0.5, defaultValue: 0.045, step: 0.001, unit: 'slope', description: 'Water table slope gradient.' },
        { key: 'n', label: 'Porosity (n)', min: 0.01, max: 0.5, defaultValue: 0.22, step: 0.01, unit: 'v/v', description: 'Effective pore volume fraction of soil.' }
      ],
      calculate: (p) => OmniEngine.calculateDarcyVelocity(p.k, p.i, p.n)
    },
    {
      id: 'geothermal_grad',
      name: "Geothermal Drillsite Heat Profile",
      category: 'Omega Expansion - Thermo',
      description: "Calculates bottom-hole temperature spikes based on local crustal gradients.",
      inputs: [
        { key: 'surf', label: 'Surface Temperature', min: 5, max: 50, defaultValue: 28, step: 1, unit: '°C', description: 'Ambient surface air degree average.' },
        { key: 'depth', label: 'Well Drill Depth', min: 100, max: 10000, defaultValue: 4500, step: 100, unit: 'meters', description: 'Vertical depth of extraction string.' },
        { key: 'grad', label: 'Thermal Gradient Rate', min: 10, max: 80, defaultValue: 35, step: 1, unit: '°C/km', description: 'Crustal scale heating rate multiplier.' }
      ],
      calculate: (p) => OmniEngine.calculateGeothermalGradient(p.surf, p.depth, p.grad)
    },
    {
      id: 'seismic_vs',
      name: "S-Wave Ground Shear Wave Velocity (Vs)",
      category: 'Omega Expansion - Seismic',
      description: "Estimates Vs soundwaves to classify liquefaction vulnerability.",
      inputs: [
        { key: 'g', label: 'Shear Modulus (G)', min: 0.05, max: 100, defaultValue: 1.8, step: 0.1, unit: 'GPa', description: 'Rock elasticity boundaries.' },
        { key: 'rho', label: 'Bulk Strata Density', min: 1000, max: 4000, defaultValue: 2150, step: 50, unit: 'kg/m³', description: 'Saturated sediment layer density.' }
      ],
      calculate: (p) => OmniEngine.calculateSeismicVs(p.g, p.rho)
    },
    {
      id: 'snell_refraction',
      name: "Snell Stratigraphic Refraction Angle",
      category: 'Omega Expansion - Seismic',
      description: "Calculates bending paths of seismic sound rayfronts across hard boundaries.",
      inputs: [
        { key: 'v1', label: 'Overburden Layer Velocity (V1)', min: 300, max: 5000, defaultValue: 1200, step: 50, unit: 'm/s', description: 'Sound speed in shallow layer.' },
        { key: 'v2', label: 'Sub-Layer Velocity (V2)', min: 300, max: 8000, defaultValue: 2800, step: 100, unit: 'm/s', description: 'Sound speed in dense basement.' },
        { key: 'angle', label: 'Incident Angle (θ1)', min: 0, max: 90, defaultValue: 21, step: 1, unit: 'degrees', description: 'Wave incident entry strike angle.' }
      ],
      calculate: (p) => OmniEngine.calculateSnellRefraction(p.v1, p.v2, p.angle)
    },
    {
      id: 'mohr_coulomb',
      name: "Mohr-Coulomb Failure Envelope",
      category: 'Omega Expansion - Geotech',
      description: "Estimates critical collapse shear stresses of hillside sediments.",
      inputs: [
        { key: 'cohesion', label: 'Internal Cohesion (C)', min: 0, max: 120, defaultValue: 22, step: 1, unit: 'kPa', description: 'Structural cohesive stickiness score.' },
        { key: 'stress', label: 'Normal Confining Stress (σ)', min: 5, max: 1000, defaultValue: 140, step: 5, unit: 'kPa', description: 'Downward lithostatic pressure stress load.' },
        { key: 'friction', label: 'Angle of Friction (φ)', min: 5, max: 60, defaultValue: 28, step: 1, unit: 'degrees', description: 'Granular interface friction.' }
      ],
      calculate: (p) => OmniEngine.calculateMohrCoulombStrength(p.cohesion, p.stress, p.friction)
    },
    {
      id: 'bullard_heat',
      name: "Bullard Stratum Thermal Resistance",
      category: 'Omega Expansion - Thermo',
      description: "Measures sediment thickness heat insulation resistance.",
      inputs: [
        { key: 'conduct', label: 'Thermal Conductivity', min: 0.5, max: 6.0, defaultValue: 2.1, step: 0.1, unit: 'W/m·K', description: 'Intrinsic rock heat conductivity.' },
        { key: 'depth', label: 'Sedimentary Depth Scale', min: 10, max: 5000, defaultValue: 1500, step: 50, unit: 'meters', description: 'Insulating column thickness.' }
      ],
      calculate: (p) => OmniEngine.calculateBullardHeatFlow(p.conduct, p.depth)
    },
    {
      id: 'radiometric_tc',
      name: "Total Count Radiometric Radioactive Index",
      category: 'Omega Expansion - Geophysics',
      description: "Aggregates isotopes emissions spectra to detect radioactive drilling tail leaks.",
      inputs: [
        { key: 'k', label: 'Potassium (K)', min: 0.1, max: 8.0, defaultValue: 2.1, step: 0.1, unit: '% vol', description: 'Spectral K channel.' },
        { key: 'u', label: 'Uranium (U)', min: 0.1, max: 50, defaultValue: 4.5, step: 0.1, unit: 'ppm', description: 'Spectral U channel logs.' },
        { key: 'th', label: 'Thorium (Th)', min: 0.1, max: 100, defaultValue: 12.8, step: 0.5, unit: 'ppm', description: 'Spectral Th channel bounds.' }
      ],
      calculate: (p) => OmniEngine.calculateRadiometricTotalCount(p.k, p.u, p.th)
    },
    {
      id: 'dew_point',
      name: "Dew Point Dynamic Atmospheric Interface",
      category: 'Omega Expansion - Climate',
      description: "Calculates fog precipitation saturation conditions at drill rig zones.",
      inputs: [
        { key: 'temp', label: 'Air Temperature', min: -10, max: 50, defaultValue: 32, step: 1, unit: '°C', description: 'Ambient structural thermometer read.' },
        { key: 'rh', label: 'Relative Humidity', min: 1, max: 100, defaultValue: 82, step: 1, unit: '%', description: 'Ambient vapor concentration percent.' }
      ],
      calculate: (p) => OmniEngine.calculateDewPoint(p.temp, p.rh)
    },
    {
      id: 'mud_pressure',
      name: "Hydrostatic Column Mud Drilling Feed",
      category: 'Omega Expansion - Fluids',
      description: "Calculates well weight column hydraulic pressure downhole.",
      inputs: [
        { key: 'density', label: 'Mud Fluid Density', min: 0.8, max: 2.8, defaultValue: 1.25, step: 0.05, unit: 'g/cm³', description: 'Density factor weighting of drilling clay mud.' },
        { key: 'depth', label: 'Well String Depth Query', min: 100, max: 8000, defaultValue: 2800, step: 50, unit: 'meters', description: 'Total vertical height of casing column.' }
      ],
      calculate: (p) => OmniEngine.calculateHydrostaticMudPressure(p.density, p.depth)
    },
    {
      id: 'capillary_seal',
      name: "Capillary Entry Pressure Barrier (Caprock)",
      category: 'Omega Expansion - Geotech',
      description: "Evaluates standard gas hold threshold of deep shale capping seals.",
      inputs: [
        { key: 'tension', label: 'Interfacial Tension', min: 0.005, max: 0.08, defaultValue: 0.03, step: 0.005, unit: 'N/m', description: 'Gas-Liquid interfacial surface tension value.' },
        { key: 'angle', label: 'Fluid Wetting Angle', min: 0, max: 90, defaultValue: 15, step: 1, unit: 'deg', description: 'Wetting contact interface alignment.' },
        { key: 'radius', label: 'Average Pore Throat Radius', min: 1e-9, max: 1e-5, defaultValue: 1.5e-7, step: 1e-8, unit: 'meters', description: 'Microscopic pore neck dimensions.' }
      ],
      calculate: (p) => OmniEngine.calculateCapillaryPressure(p.tension, p.angle, p.radius)
    },
    {
      id: 'gas_oil_ratio',
      name: "Gas-Oil Outflow Rate Ratio (GOR)",
      category: 'Omega Expansion - Fluids',
      description: "Estimates volatility of carbon output in pipeline structures.",
      inputs: [
        { key: 'gas', label: 'Volatile Methane Outflow', min: 1000, max: 5000000, defaultValue: 850000, step: 5000, unit: 'scf/day', description: 'Volumetric daily gaseous extraction.' },
        { key: 'oil', label: 'Crude Oil Extract Rate', min: 5, max: 10000, defaultValue: 120, step: 5, unit: 'bbl/day', description: 'Daily volumetric crude liquid extract.' }
      ],
      calculate: (p) => OmniEngine.calculateGasOilRatio(p.gas, p.oil)
    },
    {
      id: 'npv_risk',
      name: "NPV Financial Capital Valuation (Risk)",
      category: 'Omega Expansion - Economics',
      description: "Projects discounted cashflow value adjusting for annual disaster risks.",
      inputs: [
        { key: 'capex', label: 'Initial Field CAPEX ($B)', min: 0.01, max: 5, defaultValue: 0.85, step: 0.05, unit: '$ Billions', description: 'Capital infrastructure initial costs.' },
        { key: 'rev', label: 'Stable Operating Cashflow ($M)', min: 1, max: 1000, defaultValue: 180, step: 10, unit: '$ Millions', description: 'Yearly projected gross pipeline output.' },
        { key: 'years', label: 'Project Span Time', min: 2, max: 50, defaultValue: 15, step: 1, unit: 'years', description: 'Extraction operation duration span.' },
        { key: 'rate', label: 'Baseline Discount Rate', min: 2, max: 25, defaultValue: 9.5, step: 0.5, unit: '%', description: 'Underlying commercial discount rate.' },
        { key: 'blow', label: 'Annual Blowout Probability', min: 0, max: 0.25, defaultValue: 0.02, step: 0.005, unit: 'probability', description: 'Probability factor of catastrophic fails.' }
      ],
      calculate: (p) => OmniEngine.calculateNPVWithRisk(p.capex, p.rev, p.years, p.rate, p.blow)
    },
    {
      id: 'roi_discount',
      name: "ROI Yield Discount (Litigations drag)",
      category: 'Omega Expansion - Economics',
      description: "Dampens gross capital returns tracking cumulative legal environmental complaints.",
      inputs: [
        { key: 'litig', label: 'Claims Litigation Multiplier', min: 0, max: 3, defaultValue: 0.85, step: 0.05, unit: 'index', description: 'Socio-civil lawsuit severity scale.' },
        { key: 'spread', label: 'Spill Damage Rate Velocity', min: 0.1, max: 5, defaultValue: 1.4, step: 0.1, unit: 'index', description: 'Spill spread spatial tracking factor.' }
      ],
      calculate: (p) => OmniEngine.calculateROIDiscountMultiplier(p.litig, p.spread)
    },
    {
      id: 'esg_rating',
      name: "ESG Enterprise Governance Risk Rating",
      category: 'Omega Expansion - Economics',
      description: "Maintains environmental cap-and-trade scoring arrays for green compliance.",
      inputs: [
        { key: 'co2', label: 'Footprint Carbon Output', min: 100, max: 2000000, defaultValue: 145000, step: 5000, unit: 'tons/year', description: 'Greenhouse gas emissions total.' },
        { key: 'water', label: 'Aquatic Inflow Consumption', min: 100, max: 5000000, defaultValue: 1250000, step: 10000, unit: 'm³/year', description: 'Municipal water withdrawals used.' },
        { key: 'divers', label: 'Executive Board Diversity', min: 5, max: 65, defaultValue: 45, step: 1, unit: '% ratio', description: 'Corporate governance social checklist factor.' }
      ],
      calculate: (p) => OmniEngine.calculateESGRiskRating(p.co2, p.water, p.divers)
    },
    {
      id: 'sovereign_debt',
      name: "Sovereign Debt Systemic Risk Matrix",
      category: 'Omega Expansion - Economics',
      description: "Evaluates sovereign fiscal default stress when funding disaster cleanups.",
      inputs: [
        { key: 'gdp', label: 'National Debt-to-GDP', min: 10, max: 300, defaultValue: 78, step: 1, unit: '% Ratio', description: 'Country underlying debt leverage.' },
        { key: 'budget', label: 'Disaster Relief Allocations', min: 1, max: 2000, defaultValue: 150, step: 10, unit: '$ Millions', description: 'Allocated cleanup funds budget drain.' }
      ],
      calculate: (p) => OmniEngine.calculateSovereignDebtRisk(p.gdp, p.budget)
    },
    {
      id: 'heat_exchange',
      name: "Air-to-Water Boundary Heat Exchange (Q)",
      category: 'Omega Expansion - Thermo',
      description: "Calculates thermodynamic heat energy transfer vectors at spill surfaces.",
      inputs: [
        { key: 'h', label: 'Heat Convect coefficient (h)', min: 1, max: 200, defaultValue: 12.5, step: 0.5, unit: 'W/m²·K', description: 'Convective border heat transfer.' },
        { key: 'area', label: 'Contact Surface Area (A)', min: 10, max: 100000, defaultValue: 1450, step: 50, unit: 'm²', description: 'Bilateral liquid-air interface boundary area.' },
        { key: 't_air', label: 'Air Temperature', min: -5, max: 45, defaultValue: 33, step: 1, unit: '°C', description: 'Atmosphere ambient temp.' },
        { key: 't_water', label: 'Reservoir Water Temperature', min: 2, max: 35, defaultValue: 18, step: 1, unit: '°C', description: 'Subsurface liquid surface temp.' }
      ],
      calculate: (p) => OmniEngine.calculateAirWaterHeatExchange(p.h, p.area, p.t_air, p.t_water)
    },
    {
      id: 'coriolis_deflow',
      name: "Coriolis Dynamic Currents Deflection",
      category: 'Omega Expansion - Climate',
      description: "Calculates Coriolis ocean current drift deflection directions at latitudes.",
      inputs: [
        { key: 'lat', label: 'Geosphere Latitude', min: -90, max: 90, defaultValue: 1.25, step: 0.05, unit: 'degrees', description: 'Latitude coordinate of spill drift.' },
        { key: 'vel', label: 'Linear Flow Velocity', min: 0.1, max: 15, defaultValue: 1.8, step: 0.1, unit: 'm/s', description: 'Flow speed of surface marine slick.' }
      ],
      calculate: (p) => OmniEngine.calculateCoriolisDeflection(p.lat, p.vel)
    },
    {
      id: 'liquefaction_lpi',
      name: "Geotechnical Ground Liquefaction Potential (LPI)",
      category: 'Omega Expansion - Geotech',
      description: "Evaluates catastrophic foundation collapse indexes of coastal sands.",
      inputs: [
        { key: 'fs', label: 'Fs Average Safety Factor', min: 0.2, max: 2.0, defaultValue: 0.72, step: 0.02, unit: 'Fs scale', description: 'Dynamic soil resistance divide by seismic shear load.' },
        { key: 'thickness', label: 'Saturated Silt Sand Bed Thickness', min: 1, max: 30, defaultValue: 8, step: 0.5, unit: 'meters', description: 'Depth profile thickness of loose saturated sand columns.' }
      ],
      calculate: (p) => OmniEngine.calculateLiquefactionPotential(p.fs, p.thickness)
    },
    {
      id: 'multiphase_flow',
      name: "Multi-Phase Pipe Volumetric Fractions",
      category: 'Omega Expansion - Fluids',
      description: "Estimates liquid fractions inside wellhead collection pipelines.",
      inputs: [
        { key: 'water', label: 'Brine Water Discharge Flow', min: 0, max: 1000, defaultValue: 120, step: 10, unit: 'm³/hour', description: 'Saltwater influx flow rate.' },
        { key: 'oil', label: 'Base Crude Extraction Flow', min: 0, max: 1000, defaultValue: 340, step: 10, unit: 'm³/hour', description: 'Crude oil outflow pipeline delivery.' },
        { key: 'gas', label: 'Fuel Gaseous Vapor Flow', min: 0, max: 1000, defaultValue: 82, step: 10, unit: 'm³/hour', description: 'Hydrocarbon gas fractions venting pressure.' }
      ],
      calculate: (p) => OmniEngine.calculateMultiPhaseFractions(p.water, p.oil, p.gas)
    },
    {
      id: 'landslide_runout',
      name: "Landslide Mass Runout Kinetic Distance",
      category: 'Omega Expansion - Geotech',
      description: "Measures destruction distance boundaries of slope block releases.",
      inputs: [
        { key: 'height', label: 'Scarp Slope Height (H)', min: 10, max: 1000, defaultValue: 85, step: 5, unit: 'meters', description: 'Vertical drop scarp height.' },
        { key: 'volume', label: 'Unstable Block Volume (V)', min: 10, max: 10000000, defaultValue: 25000, step: 500, unit: 'm³', description: 'Volumetric mass of loose landslides.' },
        { key: 'friction', label: 'Effective Friction Coefficient', min: 0.05, max: 1.0, defaultValue: 0.32, step: 0.01, unit: 'frictional', description: 'Basal glide structural friction parameter.' }
      ],
      calculate: (p) => OmniEngine.calculateLandslideRunoutDistance(p.height, p.volume, p.friction)
    }
  ];

  const [formulas, setFormulas] = useState<FormulaDef[]>(baseFormulas);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedFormulaId, setSelectedFormulaId] = useState<string>('acoustic_impedance');
  const [inputVals, setInputVals] = useState<Record<string, number>>(() => {
    return baseFormulas.reduce((acc, f) => {
      f.inputs.forEach(i => {
        acc[`${f.id}_${i.key}`] = i.defaultValue;
      });
      return acc;
    }, {} as Record<string, number>);
  });
  const [calcResult, setCalcResult] = useState<OmniEngine.OmniScienceResult | null>(() => {
    return baseFormulas[0].calculate(
      baseFormulas[0].inputs.reduce((acc, i) => ({ ...acc, [i.key]: i.defaultValue }), {})
    );
  });

  // React.useEffect for custom formulas removed to prevent autofetch


  const categories = ['All', ...Array.from(new Set(formulas.map(f => f.category)))];
  const filteredFormulas = selectedCategory === 'All' 
    ? formulas 
    : formulas.filter(f => f.category === selectedCategory);

  const activeFormula = formulas.find(f => f.id === selectedFormulaId) || formulas[0];

  const handleSliderChange = (formulaId: string, key: string, value: number) => {
    const combinedKey = `${formulaId}_${key}`;
    setInputVals(prev => ({ ...prev, [combinedKey]: value }));
  };

  const triggerCalculation = () => {
    const params: Record<string, any> = {};
    activeFormula.inputs.forEach(i => {
      params[i.key] = inputVals[`${activeFormula.id}_${i.key}`] !== undefined 
        ? inputVals[`${activeFormula.id}_${i.key}`] 
        : i.defaultValue;
    });
    
    try {
      const res = activeFormula.calculate(params);
      setCalcResult(res);
    } catch (err) {
      console.error(err);
    }
  };

  // Quick initial calc on mount or formula switch
  React.useEffect(() => {
    triggerCalculation();
  }, [selectedFormulaId]);

  const hazardIcon = (status: string) => {
    switch (status) {
      case 'SAFE':
        return <CheckCircle className="text-emerald-500 shrink-0" size={16} />;
      case 'HEED':
        return <Info className="text-cyan-400 shrink-0 animate-pulse" size={16} />;
      case 'WARNING':
        return <AlertTriangle className="text-amber-500 shrink-0" size={16} />;
      case 'CRITICAL':
        return <XCircle className="text-rose-500 shrink-0 animate-ping" style={{ animationDuration: '3s' }} size={16} />;
      default:
        return <Info className="text-gray-400 shrink-0" size={16} />;
    }
  };

  const hazardBgClass = (status: string) => {
    switch (status) {
      case 'SAFE': return 'bg-emerald-950/20 border-emerald-900/40 text-emerald-400';
      case 'HEED': return 'bg-cyan-950/20 border-cyan-900/40 text-cyan-400';
      case 'WARNING': return 'bg-amber-950/20 border-amber-900/40 text-amber-400';
      case 'CRITICAL': return 'bg-rose-950/30 border-rose-900/60 text-rose-400';
      default: return 'bg-neutral-900 border-neutral-800 text-neutral-400';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0b] p-3 text-white overflow-hidden text-xs">
      <div className="border-b border-[#222] pb-3 mb-3 shrink-0">
        <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-[#00e5ff] flex items-center gap-2">
          <Atom className="animate-spin" style={{ animationDuration: '8s' }} size={16} />
          Omniscience Tactical Engine
        </h3>
        <p className="text-[10px] text-[#888888] font-mono uppercase mt-0.5">
          System-Level Calculation and Disaster Matrix (43 Multi-Agent Swarm Models)
        </p>
      </div>

      {/* Categories Horizontal Scroller */}
      <div className="flex gap-1 overflow-x-auto pb-1.5 shrink-0 scrollbar-none mb-2 border-b border-[#222]/30">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => {
              setSelectedCategory(cat);
              // Switch active formula if current doesn't belong to selected category
              if (cat !== 'All') {
                const matched = formulas.find(f => f.category === cat);
                if (matched) setSelectedFormulaId(matched.id);
              }
            }}
            className={`px-2.5 py-1 text-[9px] font-mono tracking-wide rounded border uppercase shrink-0 transition-all font-bold cursor-pointer ${
              (cat === selectedCategory || (cat === 'All' && selectedCategory === 'All'))
                ? 'bg-[#00e5ff]/10 text-[#00e5ff] border-[#00e5ff]/30'
                : 'bg-[#111] text-gray-400 border-[#222] hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-3 flex-1 min-h-0 overflow-hidden">
        {/* Formulas List Section */}
        <div className="col-span-12 md:col-span-5 flex flex-col border border-[#222] rounded bg-black/40 overflow-hidden h-full">
          <div className="p-2 bg-[#141416] border-b border-[#222] font-mono font-bold text-[9px] text-gray-500 uppercase flex justify-between tracking-wide shrink-0">
            <span>MODEL SELECTOR ({filteredFormulas.length})</span>
            <span>43 TOTAL</span>
          </div>
          <div className="flex-1 overflow-y-auto p-1.5 space-y-1 scrollbar-thin">
            {filteredFormulas.map(f => {
              const isActive = f.id === selectedFormulaId;
              return (
                <button
                  key={f.id}
                  onClick={() => setSelectedFormulaId(f.id)}
                  className={`w-full text-left p-2 rounded transition-all flex items-start gap-2 border cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-[#00e5ff]/10 to-[#111] border-[#00e5ff]/30 text-[#00e5ff] font-bold shadow-md'
                      : 'bg-[#111]/30 border-transparent hover:bg-[#111]/80 hover:border-[#333] text-gray-300'
                  }`}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] mt-1.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="font-mono text-[10px] uppercase tracking-wide truncate">{f.name}</div>
                    <div className="text-[8px] text-[#666] uppercase font-semibold leading-relaxed truncate">{f.category}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Parameters & Live Result Section */}
        <div className="col-span-12 md:col-span-7 flex flex-col space-y-3 min-h-0 overflow-y-auto pr-1">
          {/* Active Formula Intro Card */}
          <div className="p-3 bg-gradient-to-r from-[#141416]/50 to-black/30 border border-[#222] rounded shrink-0">
            <h4 className="font-mono text-white text-[11px] font-bold uppercase tracking-wide flex items-center gap-1.5">
              <Info size={12} className="text-[#00e5ff]" />
              {activeFormula.name}
            </h4>
            <p className="text-[10px] text-gray-400 mt-1 leading-normal italic">{activeFormula.description}</p>
          </div>

          {/* Dynamic Inputs List */}
          <div className="p-3 border border-[#222] rounded bg-[#0f0f10]/60 space-y-3 flex-1 overflow-y-auto scrollbar-thin">
            <div className="border-b border-[#222] pb-1.5 mb-2 font-mono text-[9px] text-[#00e5ff] font-bold uppercase tracking-wide">
              Adjust Input Variables
            </div>
            {activeFormula.inputs.map(input => {
              const valueKey = `${activeFormula.id}_${input.key}`;
              const curVal = inputVals[valueKey] !== undefined ? inputVals[valueKey] : input.defaultValue;
              
              return (
                <div key={input.key} className="space-y-1 bg-black/10 p-2 border border-[#222]/20 rounded">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-gray-300 uppercase font-mono tracking-tight">{input.label}</span>
                    <span className="text-[#00e5ff] font-bold font-mono bg-[#00e5ff]/5 px-1.5 py-0.5 border border-[#00e5ff]/20 rounded-sm">
                      {input.step < 1e-4 ? curVal.toExponential(2) : curVal} <span className="text-gray-500 font-normal text-[8px]">{input.unit}</span>
                    </span>
                  </div>
                  <p className="text-[8px] text-gray-500 leading-relaxed">{input.description}</p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[8px] text-gray-600 font-mono">{input.min}</span>
                    <input
                      type="range"
                      min={input.min}
                      max={input.max}
                      step={input.step}
                      value={curVal}
                      onChange={(e) => handleSliderChange(activeFormula.id, input.key, parseFloat(e.target.value))}
                      className="flex-1 accent-[#00e5ff] h-1 bg-[#222] rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-[8px] text-gray-600 font-mono">{input.max}</span>
                  </div>
                </div>
              );
            })}

            <button
              onClick={triggerCalculation}
              className="w-full bg-[#00e5ff] hover:bg-[#00cbef] text-black font-mono font-bold py-2 rounded uppercase text-[10px] flex items-center justify-center gap-1.5 mt-2 transition-all cursor-pointer shadow"
            >
              <Play size={10} fill="black" />
              RUN CALCULATION MODEL
            </button>
          </div>

          {/* Unified Output Matrix Board */}
          {calcResult && (
            <div className={`p-3 rounded border ${hazardBgClass(calcResult.hazardStatus)} shrink-0 shadow-lg transition-all`}>
              <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-2">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                  {hazardIcon(calcResult.hazardStatus)}
                  REALWORLD SIMULATION OUTCOME
                </span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-widest border border-white/10 bg-black/40">
                  {calcResult.hazardStatus}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-2">
                <div>
                  <div className="text-[8px] opacity-60 uppercase font-mono font-bold">Calculated Value</div>
                  <div className="text-sm font-extrabold font-mono tracking-tight mt-0.5">{calcResult.calculatedValue} <span className="text-[9px] font-normal opacity-70">{calcResult.unit}</span></div>
                </div>
                <div>
                  <div className="text-[8px] opacity-60 uppercase font-mono font-bold">System Classification</div>
                  <div className="text-[10px] font-bold uppercase truncate tracking-wide mt-1 text-white">{calcResult.classification}</div>
                </div>
              </div>

              <div className="p-2 bg-black/40 border border-white/5 rounded">
                <div className="text-[8px] opacity-60 uppercase font-mono font-semibold mb-1">Dynamic Decision Explanation</div>
                <p className="text-[10px] leading-relaxed text-[#eee]">{calcResult.dynamicExplanation}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
