/**
 * Copyright 2026 GeoAI Pro Coordinator
 * OMNISCIENCE ENGINE: The Ultimate World-State Multi-Discipline Simulation & Calculation Matrix
 * 
 * Provides unified, production-grade calculations and classification routines across:
 *   1. Geophysics, Geology & Spatial (Alam & Fisika)
 *   2. Chemistry, Biology & Environment (Kimia & Ekologi)
 *   3. Socio-Government & Regulatory (Warga & Pemda)
 *   4. Corporate, Financial & Private Sector (Investor)
 *   5. International & Global Compliance (UNFCCC/UN)
 *   6. Threat, Security & Crisis (Blast, Cyber, Domino)
 *   Plus more than 20 advanced formulas expanding into fluid mechanics, thermodynamics, and disaster response.
 * 
 * Target return type: OmniScienceResult
 */

export interface OmniScienceResult {
  calculatedValue: number | string;
  unit: string;
  classification: string;
  hazardStatus: 'SAFE' | 'HEED' | 'WARNING' | 'CRITICAL';
  dynamicExplanation: string;
}

// Helper: safe clamp
const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

/* ==========================================
   A. GEOPHYSICS, GEOLOGY & SPATIAL (7 formulas)
   ========================================== */

/**
 * 1. Acoustic Impedance
 * Z = density * velocity (m/s * kg/m^3)
 */
export function calculateAcousticImpedance(density: number, velocity: number): OmniScienceResult {
  const impedance = (density * velocity) / 1e6; // in MRayl
  let classification = "Soft Sediment / Clay";
  let hazardStatus: OmniScienceResult['hazardStatus'] = 'SAFE';
  
  if (impedance > 12) {
    classification = "Dense Basement Igneous Rock";
  } else if (impedance > 8) {
    classification = "Consolidated Sandstone / Limestone";
  } else if (impedance > 4) {
    classification = "Weak Carbonate / Sandstone";
  } else if (impedance < 1.5) {
    classification = "Extreme low consolidation zone (Unstable Mud)";
    hazardStatus = 'WARNING';
  }

  return {
    calculatedValue: Number(impedance.toFixed(4)),
    unit: "MRayl (kg/m^2/s * 10^-6)",
    classification,
    hazardStatus,
    dynamicExplanation: `Acoustic impedance of ${impedance.toFixed(3)} MRayl detected. Harder strata increases acoustic reflection coefficients, while soft layers raise liquefaction/subsidence risks.`
  };
}

/**
 * 2. Apparent Resistivity
 * Rho = 2 * PI * distance * resistance
 */
export function calculateApparentResistivity(distance: number, resistance: number): OmniScienceResult {
  const rho = 2 * Math.PI * distance * resistance;
  let classification = "Clay / Silt (Saturated)";
  let hazardStatus: OmniScienceResult['hazardStatus'] = 'SAFE';

  if (rho > 1000) {
    classification = "Hard Granite / Metamorphic Quartzite (Ultra-dry)";
  } else if (rho > 100) {
    classification = "Dry Sand / Gravel aquifer";
  } else if (rho > 10) {
    classification = "Freshwater-bearing Clayey Sand";
  } else if (rho < 2) {
    classification = "Brine / Hot Saline Hydrothermal Plume or Metallic Ore Core";
    hazardStatus = 'HEED';
  }

  return {
    calculatedValue: Number(rho.toFixed(4)),
    unit: "Ohm-meter (Ω·m)",
    classification,
    hazardStatus,
    dynamicExplanation: `Apparent resistivity values of ${rho.toFixed(2)} Ω·m signal the presence of ${classification}. Saturated saltwater pathways can trigger casing corrosion.`
  };
}

/**
 * 3. GPR Two-Way Traveltime (TWT)
 * depth = (velocity * TWT) / 2  => TWT = (2 * depth) / velocity
 */
export function calculateGPRTWT(depth: number, velocity: number): OmniScienceResult {
  // velocity is in m/ns (typically 0.06 to 0.15 m/ns)
  const twt = (2 * depth) / velocity; // ns
  let classification = "Rapid Shallow Echo Response";
  let hazardStatus: OmniScienceResult['hazardStatus'] = 'SAFE';

  if (twt > 500) {
    classification = "Ultra-Deep GPR Horizon (High Signal Loss)";
    hazardStatus = 'HEED';
  } else if (twt < 10) {
    classification = "Immediate Air-Ground Coupling";
  }

  return {
    calculatedValue: Number(twt.toFixed(2)),
    unit: "nanoseconds (ns)",
    classification,
    hazardStatus,
    dynamicExplanation: `Reflector at ${depth}m with electromagnetic velocity ${velocity} m/ns yields a theoretical radar two-way traveltime of ${twt.toFixed(1)} ns.`
  };
}

/**
 * 4. Haversine Distance
 */
export function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): OmniScienceResult {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const dist = R * c;

  let classification = "Local Proximity Zone";
  let hazardStatus: OmniScienceResult['hazardStatus'] = 'SAFE';

  if (dist > 500) {
    classification = "Continental/Regional Scale Distance";
  } else if (dist > 100) {
    classification = "Inter-Province Spill Path Distance";
  } else if (dist < 5) {
    classification = "Blast/Seismic Impact Blast-Zone Proximity";
    hazardStatus = 'CRITICAL';
  }

  return {
    calculatedValue: Number(dist.toFixed(4)),
    unit: "kilometers (km)",
    classification,
    hazardStatus,
    dynamicExplanation: `The geospatial distance calculates to ${dist.toFixed(2)} km. Immediate safety buffer limits within 5km are strongly compromised.`
  };
}

/**
 * 5. Rock Mass Rating (RMR89)
 */
export function calculateRMR(strength: number, rqd: number, spacing: number, condition: number, groundwater: number): OmniScienceResult {
  // RMR is the sum of scores (1-100)
  const score = strength + rqd + spacing + condition + groundwater;
  let classification = "Very Good Rock (Class I)";
  let hazardStatus: OmniScienceResult['hazardStatus'] = 'SAFE';

  if (score < 21) {
    classification = "Very Poor Rock (Class V - High Squeezing Pressure)";
    hazardStatus = 'CRITICAL';
  } else if (score < 41) {
    classification = "Poor Rock (Class IV - High Support Required)";
    hazardStatus = 'WARNING';
  } else if (score < 61) {
    classification = "Fair Rock (Class III)";
    hazardStatus = 'HEED';
  } else if (score < 81) {
    classification = "Good Rock (Class II)";
  }

  return {
    calculatedValue: score,
    unit: "RMR Score (0 - 100)",
    classification,
    hazardStatus,
    dynamicExplanation: `RMR calculation yielded ${score}/100. Class is: ${classification}. Excavations through poor quality rock require proactive lining, rock bolting, or dynamic shotcrete shield setups.`
  };
}

/**
 * 6. Porosity (Density-derived)
 * Phi = (matrix_density - bulk_density) / (matrix_density - fluid_density)
 */
export function calculatePorosity(matrixDensity: number, bulkDensity: number, fluidDensity: number = 1.0): OmniScienceResult {
  if (matrixDensity <= fluidDensity) {
    return {
      calculatedValue: 0,
      unit: "fraction",
      classification: "Invalid Inputs",
      hazardStatus: 'WARNING',
      dynamicExplanation: "Matrix density must exceed fluid density."
    };
  }
  const phi = (matrixDensity - bulkDensity) / (matrixDensity - fluidDensity);
  let classification = "Impermeable / Tight Crystalline Basement";
  let hazardStatus: OmniScienceResult['hazardStatus'] = 'SAFE';

  if (phi > 0.30) {
    classification = "Ultra-Highly Porous / Unconsolidated Sand or Cavity";
    hazardStatus = 'HEED';
  } else if (phi > 0.15) {
    classification = "High Porosity Oil/Water Reservoir Target";
  } else if (phi > 0.05) {
    classification = "Moderate Intercrystalline/Fractured Porosity";
  }

  return {
    calculatedValue: Number(phi.toFixed(4)),
    unit: "porosity fraction (v/v)",
    classification,
    hazardStatus,
    dynamicExplanation: `Volumetric pore space computed at ${(phi * 100).toFixed(2)}%. High fluid absorption capacity increases potential blowout velocities.`
  };
}

/**
 * 7. Slope Deformation Rate
 */
export function calculateSlopeDeformationRate(incline: number, porePressure: number, structuralCohesion: number): OmniScienceResult {
  // Simulating drift rates (mm/day) based on geomorphological shear friction factor
  const unstableFactor = (porePressure * Math.sin(incline * Math.PI / 180)) / (structuralCohesion + 1);
  const driftRate = unstableFactor * 1.5; // mm/day

  let classification = "Negligible Creep (Stable)";
  let hazardStatus: OmniScienceResult['hazardStatus'] = 'SAFE';

  if (driftRate > 50) {
    classification = "Catastrophic Failure Imminent (Fast Mass Wasting)";
    hazardStatus = 'CRITICAL';
  } else if (driftRate > 15) {
    classification = "High Active Strain Deformation (Evacuate base)";
    hazardStatus = 'WARNING';
  } else if (driftRate > 2) {
    classification = "Measurable Elastic Shear Creep";
    hazardStatus = 'HEED';
  }

  return {
    calculatedValue: Number(driftRate.toFixed(3)),
    unit: "mm/day",
    classification,
    hazardStatus,
    dynamicExplanation: `Slope creep calculations estimate displacement at ${driftRate.toFixed(2)} mm/day due to pore pressure loading. Safe monitoring thresholds compromised.`
  };
}


/* ==========================================
   B. CHEMISTRY, BIOLOGY & ENVIRONMENT (5 formulas)
   ========================================== */

/**
 * 8. H2S/Methane Toxicity Level
 */
export function calculateGasToxicity(h2sPpm: number, ch4Percent: number): OmniScienceResult {
  let hazardStatus: OmniScienceResult['hazardStatus'] = 'SAFE';
  let classification = "Safe Breathing Levels";
  let explanation = "Atmospheric profiles maintain zero hazardous gas concentrations.";

  if (h2sPpm >= 100 || ch4Percent >= 5) {
    hazardStatus = 'CRITICAL';
    classification = "IDLH (Immediately Dangerous to Life and Health)";
    explanation = `CRITICAL: H2S reads ${h2sPpm} ppm. Exposure causes single-breath knockdown and respiratory arrest. Methane concentration levels of ${ch4Percent}% exceed the LEL (Lower Explosive Limit), hazarding massive sparks.`;
  } else if (h2sPpm >= 10 || ch4Percent >= 1) {
    hazardStatus = 'WARNING';
    classification = "OSHA Alarm Threshold - Mandatory Respirators";
    explanation = "Severe olfactory paralysis may occur at current gas concentration ppm. Strict respiratory protective gear is immediately mandatory.";
  } else if (h2sPpm > 1 || ch4Percent > 0.1) {
    hazardStatus = 'HEED';
    classification = "Elevated Background Hydrocarbon/H2S levels";
    explanation = "Sour odors detected. Continuously log the vent-stack emission pipeline for signs of thermal containment breakdown.";
  }

  return {
    calculatedValue: `H2S: ${h2sPpm}ppm, CH4: ${ch4Percent}%`,
    unit: "ppm & Volumetric %",
    classification,
    hazardStatus,
    dynamicExplanation: explanation
  };
}

/**
 * 9. pH Corrosion Rate
 */
export function calculatePHCorrosion(pH: number, alkalinity: number): OmniScienceResult {
  // Corrosion rate in mm/year
  let corrosionRate = 0;
  if (pH < 4) {
    corrosionRate = (7 - pH) * 0.45 + (alkalinity * 0.001);
  } else if (pH > 11) {
    corrosionRate = (pH - 11) * 0.15; // caustic corrosion
  } else {
    corrosionRate = 0.02; // passive passivated layer
  }

  let classification = "Passivated Non-Corrosive State";
  let hazardStatus: OmniScienceResult['hazardStatus'] = 'SAFE';

  if (corrosionRate > 1.5) {
    classification = "Heavy Acid Dissolution (Severe Wall Thinning)";
    hazardStatus = 'CRITICAL';
  } else if (corrosionRate > 0.5) {
    classification = "Active Intergranular Corrosion (Heed Casing Risk)";
    hazardStatus = 'WARNING';
  } else if (corrosionRate > 0.05) {
    classification = "Minor Pitting Corrosion";
    hazardStatus = 'HEED';
  }

  return {
    calculatedValue: Number(corrosionRate.toFixed(4)),
    unit: "mm/year (Wall loss)",
    classification,
    hazardStatus,
    dynamicExplanation: `A pH environment of ${pH} creates a theoretical steel dissolution rate of ${corrosionRate.toFixed(3)} mm/year. Prolonged acid cycles will perforate standard casing walls.`
  };
}

/**
 * 10. Shannon-Wiener Diversity Index
 * H = - Sum(pi * ln(pi))
 */
export function calculateShannonWienerIndex(counts: number[]): OmniScienceResult {
  const total = counts.reduce((a, b) => a + b, 0);
  if (total === 0) {
    return {
      calculatedValue: 0,
      unit: "index (H')",
      classification: "Abiotic Barren Environment",
      hazardStatus: 'CRITICAL',
      dynamicExplanation: "No biological specimen records was provided for diversity indexing."
    };
  }
  let h = 0;
  for (const c of counts) {
    if (c > 0) {
      const p = c / total;
      h -= p * Math.log(p);
    }
  }

  let classification = "High Ecological Resilience / Balanced Species Density";
  let hazardStatus: OmniScienceResult['hazardStatus'] = 'SAFE';

  if (h < 1.0) {
    classification = "Highly Monocultured / Chemically Degraded ecosystem";
    hazardStatus = 'WARNING';
  } else if (h < 2.0) {
    classification = "Moderately Impacted Ecosystem Habitat";
    hazardStatus = 'HEED';
  }

  return {
    calculatedValue: Number(h.toFixed(4)),
    unit: "H' Diversity Index",
    classification,
    hazardStatus,
    dynamicExplanation: `Shannon Diversity index registers at ${h.toFixed(3)}. Low indices suggest agricultural monocultures or heavy bio-chemical runoff stress.`
  };
}

/**
 * 11. Water Quality Index (WQI)
 * Computed based on Dissolved Oxygen (%), pH, Turbidity, and TDS
 */
export function calculateWaterQualityIndex(doPercent: number, pH: number, turbidityNTU: number, tdsMgL: number): OmniScienceResult {
  // Simple custom rating function (0 - 100 range, higher is cleaner)
  const scoreDO = clamp(doPercent, 0, 100);
  const scorePH = 100 - Math.abs(pH - 7.2) * 20;
  const scoreTurb = clamp(100 - turbidityNTU * 2, 0, 100);
  const scoreTDS = clamp(100 - tdsMgL / 15, 0, 100);

  const wqi = (scoreDO * 0.35) + (scorePH * 0.25) + (scoreTurb * 0.20) + (scoreTDS * 0.20);
  let classification = "Excellent Pure Water (Class A)";
  let hazardStatus: OmniScienceResult['hazardStatus'] = 'SAFE';

  if (wqi < 25) {
    classification = "Extremely Contaminated / Toxified Leachate (Class E)";
    hazardStatus = 'CRITICAL';
  } else if (wqi < 50) {
    classification = "Poor / Highly Polluted Liquid (Class D)";
    hazardStatus = 'WARNING';
  } else if (wqi < 70) {
    classification = "Fair Quality (Class C - Extensive filtration needed)";
    hazardStatus = 'HEED';
  } else if (wqi < 90) {
    classification = "Good Drinking/Ecological Stream (Class B)";
  }

  return {
    calculatedValue: Number(wqi.toFixed(2)),
    unit: "WQI Rating (0 - 100)",
    classification,
    hazardStatus,
    dynamicExplanation: `Water Quality Index tracks at ${wqi.toFixed(1)}/100. Toxic chemical intrusion or agricultural runoffs directly depress this score.`
  };
}

/**
 * 12. Plume Dispersion Rate (Gaussian dispersion style approximation)
 * Calculates centerline concentrations at distance X downwind
 */
export function calculatePlumeDispersionRate(leakRateGgS: number, windSpeedMS: number, distanceM: number): OmniScienceResult {
  // Concentration C = Q / (pi * u * sy * sz)
  // Simplified approximation of crosswind diffusion scaling
  const sigmaY = 0.08 * distanceM * Math.pow(1 + 0.0001 * distanceM, -0.5);
  const sigmaZ = 0.06 * distanceM * Math.pow(1 + 0.0015 * distanceM, -0.5);
  
  const denominator = Math.PI * windSpeedMS * sigmaY * sigmaZ;
  const conc = denominator > 0 ? (leakRateGgS / denominator) * 1e6 : 0; // microg/m^3

  let classification = "Insignificant Environmental Plume";
  let hazardStatus: OmniScienceResult['hazardStatus'] = 'SAFE';

  if (conc > 5000) {
    classification = "Lethal Atmospheric Airborne Concentration";
    hazardStatus = 'CRITICAL';
  } else if (conc > 1000) {
    classification = "Acute Environmental Threshold Exceeded";
    hazardStatus = 'WARNING';
  } else if (conc > 150) {
    classification = "Nuisance Sensation Odor range";
    hazardStatus = 'HEED';
  }

  return {
    calculatedValue: Number(conc.toFixed(4)),
    unit: "μg/m^3 at centerline",
    classification,
    hazardStatus,
    dynamicExplanation: `At ${distanceM}m downwind, chemical compound density reaches ${conc.toFixed(2)} μg/m^3. Air monitors require deployment.`
  };
}


/* ==========================================
   C. SOCIO-GOVERNMENT & REGULATORY (3 formulas)
   ========================================== */

/**
 * 13. Acoustic Noise Pollution Decay
 * Lp = Lw - 20*log10(dist) - 8 // spherical dispersion over flat ground
 */
export function calculateNoiseDecay(sourceDB: number, distanceM: number, backgroundLimit: number = 55): OmniScienceResult {
  const lp = sourceDB - 20 * Math.log10(Math.max(1, distanceM)) - 8;
  const excess = lp - backgroundLimit;

  let classification = "Complies fully with residential limits";
  let hazardStatus: OmniScienceResult['hazardStatus'] = 'SAFE';

  if (excess > 20) {
    classification = "Violates Civil Penal Code / Irreparable Hearing Risk";
    hazardStatus = 'CRITICAL';
  } else if (excess > 5) {
    classification = "Nuisance levels (Restricted night extraction zones)";
    hazardStatus = 'WARNING';
  } else if (excess > 0) {
    classification = "Elevated decibels bordering statutory threshold";
    hazardStatus = 'HEED';
  }

  return {
    calculatedValue: Number(lp.toFixed(2)),
    unit: "decibels dB(A)",
    classification,
    hazardStatus,
    dynamicExplanation: `Engine drill pad noise decays to ${lp.toFixed(1)} dB(A) at ${distanceM} meters distance. Legal status is evaluated as ${classification}.`
  };
}

/**
 * 14. Village Evacuation Time
 * T = (population / flowRate) + (distance / transportSpeed)
 */
export function calculateEvacuationTime(population: number, congestionFactor: number, evactonDistanceKm: number, speedKmh: number = 30): OmniScienceResult {
  const flowRate = (100 / (congestionFactor + 1)); // citizens/min
  const queuingTimeMin = population / flowRate;
  const transRouteTimeMin = (evactonDistanceKm / speedKmh) * 60;
  const totalHours = (queuingTimeMin + transRouteTimeMin) / 60;

  let classification = "Normal Civil Clearance Cycle";
  let hazardStatus: OmniScienceResult['hazardStatus'] = 'SAFE';

  if (totalHours > 4.0) {
    classification = "Bottlenecked / Fatal Evacuation Gridlocks";
    hazardStatus = 'CRITICAL';
  } else if (totalHours > 1.5) {
    classification = "Prolonged Dispatch (Secondary hazard impact danger)";
    hazardStatus = 'WARNING';
  } else if (totalHours > 0.5) {
    classification = "Heightened Evacuation Activity Queue";
    hazardStatus = 'HEED';
  }

  return {
    calculatedValue: Number(totalHours.toFixed(3)),
    unit: "hours",
    classification,
    hazardStatus,
    dynamicExplanation: `Clearing ${population} residents away ${evactonDistanceKm}km takes ${totalHours.toFixed(1)} hrs. Civil defense recommends secondary route provisioning.`
  };
}

/**
 * 15. Regional Penalty/Fine Calculator
 * Spill or damage parameters computing penalty multipliers
 */
export function calculateRegionalFines(spillVolumeBbl: number, isProtectedConservationArea: boolean, delayReportingHrs: number): OmniScienceResult {
  const baseFineRate = 250; // USD/bbl
  let multiplier = 1.0;
  if (isProtectedConservationArea) multiplier *= 8.0;
  if (delayReportingHrs > 24) multiplier *= 2.5;

  const totalFine = spillVolumeBbl * baseFineRate * multiplier;
  let classification = "Minor Environmental Infraction Penalty";
  let hazardStatus: OmniScienceResult['hazardStatus'] = 'SAFE';

  if (totalFine > 5000000) {
    classification = "Corporate Ruin / Class-Action Civil Penalties";
    hazardStatus = 'CRITICAL';
  } else if (totalFine > 1000000) {
    classification = "Heavy Regulatory Sanction & Field Suspension Mandate";
    hazardStatus = 'WARNING';
  } else if (totalFine > 100000) {
    classification = "Stipulated Civil Restitution Order";
    hazardStatus = 'HEED';
  }

  return {
    calculatedValue: `$${totalFine.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
    unit: "USD ($)",
    classification,
    hazardStatus,
    dynamicExplanation: `Total liability fine calculated at $${totalFine.toLocaleString()} due to ${spillVolumeBbl} bbl discharge. Conservation multipliers configured at x${multiplier}.`
  };
}


/* ==========================================
   D. CORPORATE, FINANCIAL & PRIVATE SECTOR (3 formulas)
   ========================================== */

/**
 * 16. Operational Delay Cost
 */
export function calculateOperationalDelayCost(rigHaltHrs: number, crewWageRateHr: number, lostProductionRevenueHr: number): OmniScienceResult {
  const idleBurnRate = rigHaltHrs * crewWageRateHr;
  const deferredProduction = rigHaltHrs * lostProductionRevenueHr;
  const totalLoss = idleBurnRate + deferredProduction;

  let classification = "Acceptable Marginal Downtime";
  let hazardStatus: OmniScienceResult['hazardStatus'] = 'SAFE';

  if (totalLoss > 2000000) {
    classification = "Severe Fiscal Impairment (Board Action Required)";
    hazardStatus = 'CRITICAL';
  } else if (totalLoss > 500000) {
    classification = "Material Loss Interval (Disrupts quarterly EPS targets)";
    hazardStatus = 'WARNING';
  } else if (totalLoss > 50000) {
    classification = "Standard Project Contingency Loss Cycle";
    hazardStatus = 'HEED';
  }

  return {
    calculatedValue: Number(totalLoss.toFixed(2)),
    unit: "USD ($)",
    classification,
    hazardStatus,
    dynamicExplanation: `An active rig delay of ${rigHaltHrs} hours accumulates $${totalLoss.toLocaleString()} in combined lost crew utility and deferred processing yields.`
  };
}

/**
 * 17. Market Panic / Stock Impact Index
 */
export function calculateMarketPanicIndex(disasterSeverityScore: number, mediaVisibilityFactor: number, brandBailoutCapBln: number): OmniScienceResult {
  // Score 0 to 100 representing projected equity valuation drop %
  const stockDropPercentage = ((disasterSeverityScore * 0.6) + (mediaVisibilityFactor * 0.4)) * (1.1 - clamp(brandBailoutCapBln / 20, 0, 0.5));
  let classification = "Negligible Retail Investor Volatility";
  let hazardStatus: OmniScienceResult['hazardStatus'] = 'SAFE';

  if (stockDropPercentage > 30) {
    classification = "Institutional Fire-sale & Bankruptcy Default Alert";
    hazardStatus = 'CRITICAL';
  } else if (stockDropPercentage > 15) {
    classification = "Heavy Selloff / Wall Street Credit Rating downgrade";
    hazardStatus = 'WARNING';
  } else if (stockDropPercentage > 5) {
    classification = "Moderate PR Correction; retail sentiment panic";
    hazardStatus = 'HEED';
  }

  return {
    calculatedValue: Number(stockDropPercentage.toFixed(2)),
    unit: "% stock value decline",
    classification,
    hazardStatus,
    dynamicExplanation: `Projected equity market cap valuation drop modeled at -${stockDropPercentage.toFixed(1)}%. Social amplification of hazard maps exacerbates selloff velocity.`
  };
}

/**
 * 18. Asset Depreciation & Insurance Multiplier
 */
export function calculateAssetInsuranceMultiplier(historicalIncidentCount: number, currentAreaSeismicThreatIndex: number): OmniScienceResult {
  const premiumMultiplier = 1.0 + (historicalIncidentCount * 0.15) + (currentAreaSeismicThreatIndex * 0.45);
  let classification = "Standard Standard Risk Class Premium";
  let hazardStatus: OmniScienceResult['hazardStatus'] = 'SAFE';

  if (premiumMultiplier > 3.5) {
    classification = "Uninsurable Prohibitive Hazard Tier";
    hazardStatus = 'CRITICAL';
  } else if (premiumMultiplier > 2.0) {
    classification = "Spiked Risk Penalty (Premium doubled)";
    hazardStatus = 'WARNING';
  } else if (premiumMultiplier > 1.25) {
    classification = "Moderate Risk Overhead Surcharge";
    hazardStatus = 'HEED';
  }

  return {
    calculatedValue: Number(premiumMultiplier.toFixed(2)),
    unit: "Premium Multiplier (x)",
    classification,
    hazardStatus,
    dynamicExplanation: `System safety ratings project the field premium factor to scale to ${premiumMultiplier.toFixed(2)}x standard rates. Seismic tectonic stresses dictate policy pricing.`
  };
}


/* ==========================================
   E. INTERNATIONAL & GLOBAL COMPLIANCE (2 formulas)
   ========================================== */

/**
 * 19. Carbon Emission Tax & UNFCCC Penalties
 */
export function calculateCarbonTaxPenalties(blowoutDurationDays: number, emissionIntensityTonPerDay: number, carbonPricePerTon: number = 85): OmniScienceResult {
  const totalTons = blowoutDurationDays * emissionIntensityTonPerDay;
  const baseTax = totalTons * carbonPricePerTon;
  const kyotoPenalty = totalTons > 100000 ? baseTax * 1.5 : 0; // supplementary penalty for massive breaches
  const netDue = baseTax + kyotoPenalty;

  let classification = "Nominal Carbon Offsets Requirement";
  let hazardStatus: OmniScienceResult['hazardStatus'] = 'SAFE';

  if (netDue > 10000000) {
    classification = "UNFCCC Article-6 Major Violator Blacklisting";
    hazardStatus = 'CRITICAL';
  } else if (netDue > 2000000) {
    classification = "Sovereign Cap-and-Trade Statutory Sanctions";
    hazardStatus = 'WARNING';
  } else if (netDue > 250000) {
    classification = "Material Carbon Credit Overdraft Debt";
    hazardStatus = 'HEED';
  }

  return {
    calculatedValue: Number(netDue.toFixed(2)),
    unit: "USD ($) Carbon Penalty Due",
    classification,
    hazardStatus,
    dynamicExplanation: `Total greenhouse gas dispersion calculated at ${totalTons.toLocaleString()} tons of CO2e. Combined UNFCCC statutory penalties aggregate to $${netDue.toLocaleString()}.`
  };
}

/**
 * 20. Cross-Border Fallout Check
 * Coordinates check vs sovereign maritime boundaries or UNESCO ranges
 */
export function calculateCrossBorderFallout(leakSourceLat: number, leakSourceLon: number, dispersionRadiusKm: number): OmniScienceResult {
  // Mock check comparing proximity to nearest sensitive border coordinate: (lat: 0.852, lon: 104.12)
  const borderLat = 0.852;
  const borderLon = 104.12;
  const dLat = ((borderLat - leakSourceLat) * Math.PI) / 180;
  const dLon = ((borderLon - leakSourceLon) * Math.PI) / 180;
  const a = Math.sin(dLat/2)*Math.sin(dLat/2) + Math.cos((leakSourceLat*Math.PI)/180)*Math.cos((borderLat*Math.PI)/180)*Math.sin(dLon/2)*Math.sin(dLon/2);
  const distanceToBorder = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const spillExcess = dispersionRadiusKm - distanceToBorder;
  let classification = "Contained Within Sovereign Domain";
  let hazardStatus: OmniScienceResult['hazardStatus'] = 'SAFE';

  if (spillExcess > 50) {
    classification = "Severe International Bilateral Treaty Violation / Multilateral Arbitral Action";
    hazardStatus = 'CRITICAL';
  } else if (spillExcess > 0) {
    classification = "Transboundary Environmental Encroachment (UN Environment Program Alarm)";
    hazardStatus = 'WARNING';
  } else if (distanceToBorder < 25) {
    classification = "High Border Zone Warning Alert Status";
    hazardStatus = 'HEED';
  }

  return {
    calculatedValue: Number(distanceToBorder.toFixed(3)),
    unit: "km to border",
    classification,
    hazardStatus,
    dynamicExplanation: `The simulated spill has radius of ${dispersionRadiusKm}km, while the closest diplomatic boundary is ${distanceToBorder.toFixed(1)}km away. Environmental impact classification evaluated as: ${classification}.`
  };
}


/* ==========================================
   F. THREAT, SECURITY & CRISIS (3 formulas)
   ========================================== */

/**
 * 21. Blast Radius & Overpressure (TNT Equivalent)
 * Overpressure dP = P_so = 1715 * (Z/1.12)^-3 (simplification)
 * scaled distance Z = R / (W ^ (1/3))
 */
export function calculateBlastRadiusOverpressure(chargeWeightKG: number, targetDistanceM: number): OmniScienceResult {
  const scaledDistance = targetDistanceM / Math.pow(chargeWeightKG, 1/3);
  let overpressurePsi = 0;
  if (scaledDistance > 0) {
    // Standard engineering approximation formula for blast wave overpressures
    overpressurePsi = (600 / (scaledDistance * scaledDistance * scaledDistance)) + (10 / scaledDistance);
  }

  let classification = "Safe zone; ground rattle bounds";
  let hazardStatus: OmniScienceResult['hazardStatus'] = 'SAFE';

  if (overpressurePsi > 12) {
    classification = "Lethal Blast Shockwave (Total Structural Collapse)";
    hazardStatus = 'CRITICAL';
  } else if (overpressurePsi > 3.5) {
    classification = "Reinforced Block Wall Destructive Shear Collapse";
    hazardStatus = 'WARNING';
  } else if (overpressurePsi > 1.0) {
    classification = "Major Cladding Failures & Window Glass Shrapnel danger";
    hazardStatus = 'HEED';
  }

  return {
    calculatedValue: Number(overpressurePsi.toFixed(4)),
    unit: "PSI (Overpressure pounds per square inch)",
    classification,
    hazardStatus,
    dynamicExplanation: `Detonation of ${chargeWeightKG}kg TNT equivalent yields a peak overpressure wave of ${overpressurePsi.toFixed(2)} PSI at ${targetDistanceM} meters distance.`
  };
}

/**
 * 22. Cascading Failure Probability
 * P_collapse = 1 - ( (1 - P_earthquake) * (1 - P_landslide) * (1 - P_arcSubstation) )
 */
export function calculateCascadingFailureProbability(triggerSeismicAccG: number, soilSaturatedWaterFactor: number, electricalGridLagMs: number): OmniScienceResult {
  // Derive sub-probabilities:
  const pEarthquake = clamp(triggerSeismicAccG * 1.5, 0, 0.95);
  const pLandslide = clamp(soilSaturatedWaterFactor * triggerSeismicAccG * 0.95, 0, 0.9);
  const pElectricalArc = clamp(electricalGridLagMs / 1000, 0, 0.85);

  const pCascading = 1.0 - ((1.0 - pEarthquake) * (1.0 - pLandslide) * (1.0 - pElectricalArc));
  let classification = "Isolated Low-Risk Anomaly Path";
  let hazardStatus: OmniScienceResult['hazardStatus'] = 'SAFE';

  if (pCascading > 0.8) {
    classification = "Guaranteed Domino Collapse Matrix Event";
    hazardStatus = 'CRITICAL';
  } else if (pCascading > 0.5) {
    classification = "High Interlocking Chain of Failure Probability";
    hazardStatus = 'WARNING';
  } else if (pCascading > 0.2) {
    classification = "Elevated Cross-System Feedback Hazard";
    hazardStatus = 'HEED';
  }

  return {
    calculatedValue: Number((pCascading * 100).toFixed(2)),
    unit: "% Probability of Domino Link",
    classification,
    hazardStatus,
    dynamicExplanation: `Failure chaining risks are computed at ${(pCascading * 100).toFixed(1)}%. Primary earthquakes propagate and breach electrical grid circuits due to landslide shear stress.`
  };
}

/**
 * 23. Cyber-Physical Sabotage Risk
 * Explores latency anomalies & telemetry packet mismatch signals
 */
export function calculateCyberPhysicalSabotageRisk(averageSymmetricLatencyErrorMs: number, outOfOrderSequencingRatio: number): OmniScienceResult {
  const securityThreatRating = (averageSymmetricLatencyErrorMs * 0.4) + (outOfOrderSequencingRatio * 1000);
  let classification = "Standard Network Jitter (Background noise)";
  let hazardStatus: OmniScienceResult['hazardStatus'] = 'SAFE';

  if (securityThreatRating > 300) {
    classification = "Active Remote Jamming / Deliberate Sensor Manipulations (Cyber sabotage)";
    hazardStatus = 'CRITICAL';
  } else if (securityThreatRating > 100) {
    classification = "Man-In-The-Middle Telemetry Spoofing Signature Detected";
    hazardStatus = 'WARNING';
  } else if (securityThreatRating > 35) {
    classification = "Suspect Latency Glitches / Packet Dropping Patterns";
    hazardStatus = 'HEED';
  }

  return {
    calculatedValue: Number(securityThreatRating.toFixed(2)),
    unit: "Threat Anomaly Score (0 - 500)",
    classification,
    hazardStatus,
    dynamicExplanation: `Cyber-physical verification flags a score of ${securityThreatRating.toFixed(1)}. Anomaly patterns suggest deliberate protocol hijacking instead of physical circuit degradation.`
  };
}


/* ========================================================
   G. OMEGA DIRECTIVE: 20+ ADDITIONAL COMPLEX SCIENTIFIC FORMULAS
   ======================================================== */

/**
 * 24. Darcy's Law (Groundwater Velocity)
 * V = K * i / n  => Hyd conductivity * hydraulic gradient / effective porosity
 */
export function calculateDarcyVelocity(hydraulicConductivity: number, gradient: number, effectivePorosity: number): OmniScienceResult {
  if (effectivePorosity <= 0) {
    return {
      calculatedValue: 0,
      unit: "m/day",
      classification: "Agnostic Porosity boundary",
      hazardStatus: 'WARNING',
      dynamicExplanation: "Effective porosity fraction must exceed zero."
    };
  }
  const velocity = (hydraulicConductivity * gradient) / effectivePorosity;
  let classification = "Sparsely Modulated Imperceptible Seep";
  let hazardStatus: OmniScienceResult['hazardStatus'] = 'SAFE';

  if (velocity > 10.0) {
    classification = "Torrential Underground Subsurface Conduit Transits";
    hazardStatus = 'CRITICAL';
  } else if (velocity > 1.0) {
    classification = "Rapid Plume Propagation Wave (Imminent aquifer breach)";
    hazardStatus = 'WARNING';
  } else if (velocity > 0.1) {
    classification = "Active Intergranular Liquid Flow";
    hazardStatus = 'HEED';
  }

  return {
    calculatedValue: Number(velocity.toFixed(5)),
    unit: "meters per day (m/day)",
    classification,
    hazardStatus,
    dynamicExplanation: `Dynamic seepage velocity computes to ${velocity.toFixed(3)} m/day. Leachate plume tracks rapidly towards surrounding municipal water bodies.`
  };
}

/**
 * 25. Geothermal Gradient / Heat Loss
 * Q = k * (dT/dZ)
 */
export function calculateGeothermalGradient(surfaceTempCelsius: number, depthM: number, geothermalGradCperKm: number): OmniScienceResult {
  const bottomTemp = surfaceTempCelsius + (depthM / 1000) * geothermalGradCperKm;
  let classification = "Cool Crust Zone (Superficial Drilling)";
  let hazardStatus: OmniScienceResult['hazardStatus'] = 'SAFE';

  if (bottomTemp > 300) {
    classification = "Supercritical Geothermal / Megathermal Magma Chamber Vicinity";
    hazardStatus = 'CRITICAL';
  } else if (bottomTemp > 150) {
    classification = "Geothermal Target Zone / Well Expansion Hazard";
    hazardStatus = 'WARNING';
  } else if (bottomTemp > 80) {
    classification = "Moderate Hot Aquifer Reservoir Horizon";
    hazardStatus = 'HEED';
  }

  return {
    calculatedValue: Number(bottomTemp.toFixed(2)),
    unit: "Degrees Celsius (°C)",
    classification,
    hazardStatus,
    dynamicExplanation: `Subsurface temperature reaches ${bottomTemp.toFixed(1)}°C. High temperature bands risk degrading standard mud chemical agents.`
  };
}

/**
 * 26. Seismic Shear Wave Velocity (Vs)
 * Vs = sqrt( Shear Modulus G / Density rho )
 */
export function calculateSeismicVs(shearModulusGPa: number, bulkDensityKgM3: number): OmniScienceResult {
  if (bulkDensityKgM3 <= 0 || shearModulusGPa < 0) {
    return {
      calculatedValue: 0,
      unit: "m/s",
      classification: "Anomalous Tectonic Ground",
      hazardStatus: 'CRITICAL',
      dynamicExplanation: "Density must be positive, shear modulus non-negative."
    };
  }
  const vs = Math.sqrt((shearModulusGPa * 1e9) / bulkDensityKgM3);
  let classification = "Soft Unconsolidated Soil S-Wave Profile";
  let hazardStatus: OmniScienceResult['hazardStatus'] = 'SAFE';

  if (vs > 3000) {
    classification = "High-velocity Sound Plutonic Igneous Rock Crystalline Layer";
  } else if (vs > 1500) {
    classification = "Competent Sedimentary Strata Layer (Vs30 Class B)";
  } else if (vs < 180) {
    classification = "Soft Mud/Aqueous Silt (Vs30 Class E - liquefaction danger)";
    hazardStatus = 'CRITICAL';
  } else if (vs < 360) {
    classification = "Stiff Structural Soil Profile (Vs30 Class D)";
    hazardStatus = 'WARNING';
  }

  return {
    calculatedValue: Number(vs.toFixed(2)),
    unit: "meters per second (m/s)",
    classification,
    hazardStatus,
    dynamicExplanation: `S-wave velocity computed at ${vs.toFixed(1)} m/s. Soft soil profiles significantly amplify seismic shockwave peaks.`
  };
}

/**
 * 27. Snell's Law Refraction
 * theta2 = arcsin( (v2/v1) * sin(theta1) )
 */
export function calculateSnellRefraction(waveVel1: number, waveVel2: number, incidentAngleDeg: number): OmniScienceResult {
  const theta1Rad = (incidentAngleDeg * Math.PI) / 180;
  const arg = (waveVel2 / waveVel1) * Math.sin(theta1Rad);
  
  if (Math.abs(arg) > 1.0) {
    return {
      calculatedValue: "TOTAL INTERNAL REFLECTION",
      unit: "Refraction limit",
      classification: "Critical Angle Wave Traven Mode / Head-Wave Boundary",
      hazardStatus: 'HEED',
      dynamicExplanation: `A wave accelerating from ${waveVel1}m/s to ${waveVel2}m/s exceeds critical incidence constraints, triggering refraction head propagation.`
    };
  }
  
  const theta2Deg = (Math.asin(arg) * 180) / Math.PI;
  return {
    calculatedValue: Number(theta2Deg.toFixed(3)),
    unit: "Degrees (°)",
    classification: "Refracted Acoustic Raypath Wavefront",
    hazardStatus: 'SAFE',
    dynamicExplanation: `Ray path refracts downwards at an angle of ${theta2Deg.toFixed(1)}° across the stratigraphic boundary interface.`
  };
}

/**
 * 28. Mohr-Coulomb Shear Strength
 * Tau = C + wei * tan(phi)
 */
export function calculateMohrCoulombStrength(cohesionKPa: number, effectiveNormalStressKPa: number, internalFrictionDeg: number): OmniScienceResult {
  const thetaRad = (internalFrictionDeg * Math.PI) / 180;
  const strength = cohesionKPa + effectiveNormalStressKPa * Math.tan(thetaRad);

  let classification = "Weak Soil / Shear Fault Line";
  let hazardStatus: OmniScienceResult['hazardStatus'] = 'SAFE';

  if (strength > 50000) {
    classification = "High Competence Rock Structural Anchorage";
  } else if (strength > 2000) {
    classification = "Indurated Strong Sedimentary Base";
  } else if (strength < 50) {
    classification = "Extreme Liquid Slope Slippage Material";
    hazardStatus = 'CRITICAL';
  }

  return {
    calculatedValue: Number(strength.toFixed(2)),
    unit: "kiloPascals (kPa)",
    classification,
    hazardStatus,
    dynamicExplanation: `Effective geotechnical shear capability calculated at ${strength.toFixed(1)} kPa. Exceeding this triggers rapid sliding slips.`
  };
}

/**
 * 29. Bullard Method Integral (Sediment Heat resistance)
 */
export function calculateBullardHeatFlow(averageThermalConductivity: number, sedimentDepthM: number): OmniScienceResult {
  const resistance = sedimentDepthM / averageThermalConductivity;
  let classification = "High Thermal Dispersion Subsurface Corridor";
  let hazardStatus: OmniScienceResult['hazardStatus'] = 'SAFE';

  if (resistance > 1500) {
    classification = "Ultra-Insulating Clay Sedimentary Blanket";
    hazardStatus = 'HEED';
  }

  return {
    calculatedValue: Number(resistance.toFixed(1)),
    unit: "m²·K/W",
    classification,
    hazardStatus,
    dynamicExplanation: `Accumulated stratigraphic thermal resistance reaches ${resistance.toFixed(1)} m²·K/W. Sediments act as a thermal storage blanket.`
  };
}

/**
 * 30. Radiometric Total Count
 * TC = 1.04 * K_pct + 1.25 * U_ppm + 0.65 * Th_ppm
 */
export function calculateRadiometricTotalCount(kPct: number, uPpm: number, thPpm: number): OmniScienceResult {
  const totalCount = (1.04 * kPct) + (1.25 * uPpm) + (0.65 * thPpm);
  let classification = "Background Crustal Radioactivity levels";
  let hazardStatus: OmniScienceResult['hazardStatus'] = 'SAFE';

  if (totalCount > 100) {
    classification = "Severe Radionuclide Tailings Intrusion (High Radiation Area)";
    hazardStatus = 'CRITICAL';
  } else if (totalCount > 25) {
    classification = "Uraniferous/Thorium Shear Bed Deposit Profile";
    hazardStatus = 'WARNING';
  } else if (totalCount > 10) {
    classification = "Slightly Elevated Granitic Pegmatite Strata";
    hazardStatus = 'HEED';
  }

  return {
    calculatedValue: Number(totalCount.toFixed(3)),
    unit: "equivalent uranium ppm (eU)",
    classification,
    hazardStatus,
    dynamicExplanation: `Radiometric gamma profiling notes a total energetic spectrum count of ${totalCount.toFixed(2)} eU. Protect personnel from raw tailings.`
  };
}

/**
 * 31. Atmospheric Dew Point
 * Magnus-Tetens approximation
 */
export function calculateDewPoint(airTempCelsius: number, relativeHumidityPercent: number): OmniScienceResult {
  const a = 17.27;
  const b = 237.7;
  const rhDecimal = Math.max(0.01, relativeHumidityPercent / 100);
  const alpha = ((a * airTempCelsius) / (b + airTempCelsius)) + Math.log(rhDecimal);
  const dewPoint = (b * alpha) / (a - alpha);

  let classification = "Normal Atmospheric Profile";
  let hazardStatus: OmniScienceResult['hazardStatus'] = 'SAFE';

  if (Math.abs(airTempCelsius - dewPoint) < 1.0) {
    classification = "Saturation Fog / Dense Dew Deposition Environment";
    hazardStatus = 'HEED';
  }

  return {
    calculatedValue: Number(dewPoint.toFixed(2)),
    unit: "Degrees Celsius (°C)",
    classification,
    hazardStatus,
    dynamicExplanation: `The dew point computes to ${dewPoint.toFixed(1)}°C. High humidity levels border condensed mist barriers, clouding physical site optics.`
  };
}

/**
 * 32. Hydrostatic Mud Pressure
 * P = 0.0981 * density_g_cm3 * depth_m
 */
export function calculateHydrostaticMudPressure(mudDensityGCm3: number, depthM: number): OmniScienceResult {
  const pressureBar = 0.0981 * mudDensityGCm3 * depthM;
  let classification = "Standard Shallow Well Mud column";
  let hazardStatus: OmniScienceResult['hazardStatus'] = 'SAFE';

  if (pressureBar > 500) {
    classification = "Extreme Hydro-Pressurized Hole Depth (Risk of Formation Fracture)";
    hazardStatus = 'CRITICAL';
  } else if (pressureBar > 200) {
    classification = "High-Pressure Deep Well System Horizon";
    hazardStatus = 'WARNING';
  } else if (pressureBar > 80) {
    classification = "Normal Drilling Mechanical Pressure Boundary";
    hazardStatus = 'HEED';
  }

  return {
    calculatedValue: Number(pressureBar.toFixed(2)),
    unit: "bar (Pfe)",
    classification,
    hazardStatus,
    dynamicExplanation: `Hydrostatic drilling column exerts ${pressureBar.toFixed(1)} bar pressure downhole. Ensure density balances reservoir pore loads.`
  };
}

/**
 * 33. Capillary Pressure in reservoir pores
 * Pc = (2 * Tension * cos(theta)) / radius
 */
export function calculateCapillaryPressure(surfaceTensionNM: number, contactAngleDeg: number, poreRadiusM: number): OmniScienceResult {
  if (poreRadiusM <= 0) {
    return {
      calculatedValue: 0,
      unit: "kPa",
      classification: "Null radius",
      hazardStatus: 'CRITICAL',
      dynamicExplanation: "Pore space radius must be greater than zero."
    };
  }
  const cosTheta = Math.cos((contactAngleDeg * Math.PI) / 180);
  const pc = (2 * surfaceTensionNM * cosTheta) / poreRadiusM;
  const pcKPa = pc / 1000;

  let classification = "Favorable High Seal Capillary Threshold";
  let hazardStatus: OmniScienceResult['hazardStatus'] = 'SAFE';

  if (pcKPa > 1000) {
    classification = "Impermeable Micro-pore Caprock Gas Seal Boundary";
  } else if (pcKPa < 1) {
    classification = "Severe Leakage Threat: Coarse Silt / Fractured Sandbox Matrix";
    hazardStatus = 'CRITICAL';
  } else if (pcKPa < 15) {
    classification = "Low Resistive Structural Boundary Seal";
    hazardStatus = 'WARNING';
  }

  return {
    calculatedValue: Number(pcKPa.toFixed(4)),
    unit: "kiloPascals (kPa)",
    classification,
    hazardStatus,
    dynamicExplanation: `Capillary entry pressure computes to ${pcKPa.toFixed(2)} kPa. Lower resistance facilitates gas hydrocarbons breaching cap seals.`
  };
}

/**
 * 34. Gas-Oil Ratio (GOR)
 */
export function calculateGasOilRatio(gasRateScfDay: number, oilRateBblDay: number): OmniScienceResult {
  if (oilRateBblDay <= 0) {
    return {
      calculatedValue: "INFINITY (Gas-only well)",
      unit: "scf/bbl",
      classification: "Pure Volatile Dry-Gas Field Reservoir",
      hazardStatus: 'HEED',
      dynamicExplanation: "The well registers zero oil output, signifying a 100% dry methane source pipeline."
    };
  }
  const gor = gasRateScfDay / oilRateBblDay;
  let classification = "Black Oil Conventional Reservoir Well";
  let hazardStatus: OmniScienceResult['hazardStatus'] = 'SAFE';

  if (gor > 50000) {
    classification = "Ultra-wet Condensate field (Spiked Flaring risk)";
    hazardStatus = 'CRITICAL';
  } else if (gor > 10000) {
    classification = "High GOR Gaseous Petroleum System Reservoir";
    hazardStatus = 'WARNING';
  } else if (gor > 2000) {
    classification = "Volatile Liquid Reservoir Complex";
    hazardStatus = 'HEED';
  }

  return {
    calculatedValue: Number(gor.toFixed(2)),
    unit: "scf/bbl (Standard cubic feet per barrel)",
    classification,
    hazardStatus,
    dynamicExplanation: `Well dynamic ratio maps to ${gor.toFixed(1)} scf/bbl. High ratios increase pipeline expansion fatigue stresses.`
  };
}

/**
 * 35. Net Present Value (NPV) under Hazard Risk
 * NPV = Sum( CF_t / (1+r)^t ) - Initial_Cap
 */
export function calculateNPVWithRisk(capitalExpenditureBln: number, initialRevenueMlnYear: number, years: number, discountRatePct: number, blowoutProbAnnual: number): OmniScienceResult {
  const adjustedRate = (discountRatePct / 100) + blowoutProbAnnual; // Risk-premium discount multiplier
  let npv = -capitalExpenditureBln * 1000; // in Mln USD
  for (let t = 1; t <= years; t++) {
    const cashFlow = initialRevenueMlnYear * Math.pow(0.98, t); // simple decay of production
    npv += cashFlow / Math.pow(1 + adjustedRate, t);
  }

  const npvBln = npv / 1000;
  let classification = "Strong Economically Robust Operation";
  let hazardStatus: OmniScienceResult['hazardStatus'] = 'SAFE';

  if (npvBln < 0) {
    classification = "Project Unviable / Insolvency Warning Under Present Threat Index";
    hazardStatus = 'CRITICAL';
  } else if (npvBln < 0.15) {
    classification = "Marginal Return Margin (Sensitive to insurance changes)";
    hazardStatus = 'WARNING';
  } else if (blowoutProbAnnual > 0.05) {
    classification = "High Yield with Extreme Catastrophe Risks";
    hazardStatus = 'HEED';
  }

  return {
    calculatedValue: Number(npvBln.toFixed(4)),
    unit: "Billion USD ($B)",
    classification,
    hazardStatus,
    dynamicExplanation: `At adjusted discount rates of ${(adjustedRate * 100).toFixed(1)}%, the asset's net cash flow value scales to $${(npvBln * 1000).toFixed(1)}M USD.`
  };
}

/**
 * 36. ROI Discount Multiplier under Extreme Incidents
 */
export function calculateROIDiscountMultiplier(litigationFactor: number, spillSpreadRateIndex: number): OmniScienceResult {
  const roiDampener = clamp(1.0 - (litigationFactor * 0.25) - (spillSpreadRateIndex * 0.12), 0.05, 1.0);
  let classification = "Nominal Regulatory Capital Yield Impact";
  let hazardStatus: OmniScienceResult['hazardStatus'] = 'SAFE';

  if (roiDampener < 0.2) {
    classification = "Complete Capital Liquidation (Asset asset worthlessness)";
    hazardStatus = 'CRITICAL';
  } else if (roiDampener < 0.5) {
    classification = "Severe Shareholder Impairment / Structural Restructuring Targeted";
    hazardStatus = 'WARNING';
  } else if (roiDampener < 0.8) {
    classification = "Elevated Cost of Remediation drag";
    hazardStatus = 'HEED';
  }

  return {
    calculatedValue: Number(roiDampener.toFixed(3)),
    unit: "ROI Yield Factor (x)",
    classification,
    hazardStatus,
    dynamicExplanation: `Environmental legal claims damp project ROI multiplier down to ${roiDampener.toFixed(2)}x of baseline projections.`
  };
}

/**
 * 37. ESG Risk Rating Matrix
 */
export function calculateESGRiskRating(carbonEmissionsTonsYr: number, waterSourcedM3: number, boardDiversityPct: number): OmniScienceResult {
  const scoreEnv = clamp((carbonEmissionsTonsYr / 500000) * 50 + (waterSourcedM3 / 1000000) * 50, 0, 100);
  const scoreGov = clamp(100 - (boardDiversityPct * 1.5), 0, 100);
  const esgRating = (scoreEnv * 0.6) + (scoreGov * 0.4);

  let classification = "ESG Industry Leader / Secure Capital Access (Negligible risk)";
  let hazardStatus: OmniScienceResult['hazardStatus'] = 'SAFE';

  if (esgRating > 70) {
    classification = "High ESG Severity / Impending Pension Fund Divestment (Severe Risk)";
    hazardStatus = 'CRITICAL';
  } else if (esgRating > 45) {
    classification = "Moderate ESG Deficiencies / Rising Cost of Debt (Medium Risk)";
    hazardStatus = 'WARNING';
  } else if (esgRating > 25) {
    classification = "Satisfactory Governance and Environmental footprint";
    hazardStatus = 'HEED';
  }

  return {
    calculatedValue: Number(esgRating.toFixed(2)),
    unit: "ESG Risk Multi-Metric (0-100 severity index)",
    classification,
    hazardStatus,
    dynamicExplanation: `Total ESG risk profile rates at ${esgRating.toFixed(1)}/100 points. High scores limit access to institutional investment pools.`
  };
}

/**
 * 38. Sovereign Debt Risk Impact
 */
export function calculateSovereignDebtRisk(gdpRatioPct: number, environmentalRemedialBudgetMln: number): OmniScienceResult {
  const debtScore = (gdpRatioPct * 0.5) + (environmentalRemedialBudgetMln * 0.85);
  let classification = "Stable Sovereign Investment Grade Rating";
  let hazardStatus: OmniScienceResult['hazardStatus'] = 'SAFE';

  if (debtScore > 350) {
    classification = "Default Grade / IMF Restructuring Trigger Boundary";
    hazardStatus = 'CRITICAL';
  } else if (debtScore > 180) {
    classification = "High Sovereign Debt Degradation Yield (Systemic local recession)";
    hazardStatus = 'WARNING';
  } else if (debtScore > 80) {
    classification = "Speculative Bordering Grade Rating";
    hazardStatus = 'HEED';
  }

  return {
    calculatedValue: Number(debtScore.toFixed(2)),
    unit: "Sovereign Risk Score Metric",
    classification,
    hazardStatus,
    dynamicExplanation: `Sovereign financial health registers risk coefficient at ${debtScore.toFixed(1)}. Remedial allocations represent high domestic GDP debt burdens.`
  };
}

/**
 * 39. Air-to-Water Heat Exchange Rate
 * Q = h * A * (T_air - T_water)
 */
export function calculateAirWaterHeatExchange(heatTransferCoeff: number, areaM2: number, tAir: number, tWater: number): OmniScienceResult {
  const energyWatts = heatTransferCoeff * areaM2 * (tAir - tWater);
  let classification = "Stable Thermal Balance Equilibrium";
  let hazardStatus: OmniScienceResult['hazardStatus'] = 'SAFE';

  if (Math.abs(energyWatts) > 5000000) {
    classification = "Extreme Hydro-Atmospheric Thermal Shockwave Interface";
    hazardStatus = 'HEED';
  }

  return {
    calculatedValue: Number(energyWatts.toFixed(1)),
    unit: "Joules/sec (Watts)",
    classification,
    hazardStatus,
    dynamicExplanation: `The boundary layer registers a heat flow rates of ${energyWatts.toFixed(0)} Watts. Temperature differentials induce biological stresses.`
  };
}

/**
 * 40. Coriolis Deflection Factor
 * f = 2 * omega * sin(latitude)
 */
export function calculateCoriolisDeflection(latitudeDeg: number, linearVelocityMS: number): OmniScienceResult {
  const omega = 7.2921e-5; // earth rotational angular velocity rad/sec
  const latRad = (latitudeDeg * Math.PI) / 180;
  const f = 2 * omega * Math.sin(latRad);
  const acceleration = f * linearVelocityMS; // m/s^2

  let classification = "Negligible equatorial inertia";
  let hazardStatus: OmniScienceResult['hazardStatus'] = 'SAFE';

  if (Math.abs(acceleration) > 0.005) {
    classification = "Large Tectonic or Oceanographic Coriolis Gyre Deflection Force";
    hazardStatus = 'HEED';
  }

  return {
    calculatedValue: Number(acceleration.toFixed(7)),
    unit: "m/s² Coriolis acceleration",
    classification,
    hazardStatus,
    dynamicExplanation: `Ocean/atmosphere trajectories at latitude ${latitudeDeg}° undergo rotational deflection accelerations of ${acceleration.toFixed(6)} m/s².`
  };
}

/**
 * 41. Seismic Liquefaction Potential Index (LPI)
 * Index integrating factor of safety down structural columns
 */
export function calculateLiquefactionPotential(averageFactorSafety: number, dynamicSiltThicknessM: number): OmniScienceResult {
  const lpi = dynamicSiltThicknessM * clamp(1.0 - averageFactorSafety, 0, 1.0) * 10;
  let classification = "No Liquefaction Risk Zone";
  let hazardStatus: OmniScienceResult['hazardStatus'] = 'SAFE';

  if (lpi >= 15) {
    classification = "Severe Earth Sinking Liquefaction (Mass Foundation Collapse)";
    hazardStatus = 'CRITICAL';
  } else if (lpi >= 5) {
    classification = "Moderate Sand-boil Outburst hazard; high lateral spreading risks";
    hazardStatus = 'WARNING';
  } else if (lpi > 0.1) {
    classification = "Minor Site Geological Instability Indicators";
    hazardStatus = 'HEED';
  }

  return {
    calculatedValue: Number(lpi.toFixed(3)),
    unit: "LPI index (0 - 100 range)",
    classification,
    hazardStatus,
    dynamicExplanation: `Geotechnical column reports a liquefaction potential rating of ${lpi.toFixed(2)}. Highly saturated coastal silt layers will collapse under seismic shaking.`
  };
}

/**
 * 42. Multi-Phase Fluid Fraction balances (Water-Gas-Oil fractions)
 */
export function calculateMultiPhaseFractions(waterM3Hr: number, oilM3Hr: number, gasM3Hr: number): OmniScienceResult {
  const totalFlow = waterM3Hr + oilM3Hr + gasM3Hr;
  if (totalFlow === 0) {
    return {
      calculatedValue: "No flow",
      unit: "fraction",
      classification: "Agnostic pipeline states",
      hazardStatus: 'HEED',
      dynamicExplanation: "Pipeline is completely barren or holds locked gate valve positions."
    };
  }
  const waterFrac = waterM3Hr / totalFlow;
  const oilFrac = oilM3Hr / totalFlow;
  const gasFrac = gasM3Hr / totalFlow;

  let classification = "Optimized Hydrocarbon Blend Stream";
  let hazardStatus: OmniScienceResult['hazardStatus'] = 'SAFE';

  if (waterFrac > 0.85) {
    classification = "Extreme Aquifer Liquid Influx (Well Flooded out)";
    hazardStatus = 'CRITICAL';
  } else if (gasFrac > 0.60) {
    classification = "High Gaseous Slug flow; threat of high pipe hammer vibrations";
    hazardStatus = 'WARNING';
  } else if (waterFrac > 0.40) {
    classification = "Elevated Emulsion Water-cut Level";
    hazardStatus = 'HEED';
  }

  return {
    calculatedValue: `Water: ${(waterFrac * 100).toFixed(1)}%, Oil: ${(oilFrac * 100).toFixed(1)}%, Gas: ${(gasFrac * 100).toFixed(1)}%`,
    unit: "volumetric fractions %",
    classification,
    hazardStatus,
    dynamicExplanation: `Multi-phase pipeline analysis logs high water-cut densities of ${(waterFrac * 100).toFixed(1)}%. Separation units must isolate brine outputs.`
  };
}

/**
 * 43. Landslide Runout Distance
 * L = (H * V) / (Tan(Alpha) * frictionalCoeff)
 */
export function calculateLandslideRunoutDistance(cliffHeightM: number, slideVolumeM3: number, runoutFrictionCoeff: number): OmniScienceResult {
  const scaling = Math.log10(Math.max(1, slideVolumeM3));
  const distance = cliffHeightM * scaling / Math.max(0.01, runoutFrictionCoeff);

  let classification = "Contained Local Slide Bed";
  let hazardStatus: OmniScienceResult['hazardStatus'] = 'SAFE';

  if (distance > 1000) {
    classification = "Megaflood/Avalanche Runout crossing civil settlements";
    hazardStatus = 'CRITICAL';
  } else if (distance > 300) {
    classification = "Major Geological Slip Runout blocking transport lines";
    hazardStatus = 'WARNING';
  } else if (distance > 80) {
    classification = "Elevated Debris Slide Accumulation Area";
    hazardStatus = 'HEED';
  }

  return {
    calculatedValue: Number(distance.toFixed(3)),
    unit: "meters of runout distance (m)",
    classification,
    hazardStatus,
    dynamicExplanation: `A slope block release of ${slideVolumeM3.toLocaleString()} m³ slides a dynamic runout corridor of ${distance.toFixed(1)} meters. Keep roads clear.`
  };
}
