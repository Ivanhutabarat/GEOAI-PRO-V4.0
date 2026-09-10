/**
 * GEOAI PRO V4.0 - Mathematical Engine Core
 * Dynamic Arrays of Floating-Points (5-10 distinct values)
 */

export interface SimulationRow {
  [key: string]: any;
}

const noiseVal = (seed: number, index: number) => {
  return Math.sin(seed * 0.15 + index * 0.45) * Math.cos(index * 0.75);
};

export const dummyEngine = {
  generateSeismicData: (frequency: number = 25, damp: number = 0.5): SimulationRow[] => {
    return Array.from({ length: 15 }, (_, i) => ({
      time: Number((i * 0.5).toFixed(2)),
      vp: Number((1500 + 420 * i + Math.sin(i) * 220 + noiseVal(frequency, i) * 60).toFixed(1)),
      vs: Number((800 + 210 * i + Math.sin(i) * 130 + noiseVal(frequency, i) * 45).toFixed(1)),
      vibration: Number((Math.sin(i * (frequency * 0.1) - damp) * Math.exp(-i * 0.08) * 8).toFixed(3)),
      label: `${i * 0.5}s`
    }));
  },
  
  // Explicitly inverted vertical plot (depth) with jagged Ray, Resistivity, and Density
  generateWellLoggingData: (shaleCutoff: number = 40, resThreshold: number = 10): SimulationRow[] => {
    const data: SimulationRow[] = [];
    const baseDepth = 1200;
    for (let i = 0; i < 20; i++) {
      const depth = baseDepth + i * 15;
      const gr = shaleCutoff * 1.5 + Math.sin(i * 0.6) * 25 + noiseVal(shaleCutoff, i) * 12;
      const rhob = 2.0 + (i * 0.03) + (gr > shaleCutoff ? 0.35 : 0.05) + Math.cos(i) * 0.1;
      const res = resThreshold * 1.2 + Math.pow(Math.abs(Math.sin(i * 0.6)), 1.8) * 12 + (gr < shaleCutoff ? 45 : 2);
      data.push({
        depth: Number(depth.toFixed(1)), // Y axis
        gr: Number(Math.max(10, Math.min(150, gr)).toFixed(1)), // X axis 1
        rhob: Number(Math.max(1.8, Math.min(2.9, rhob)).toFixed(3)), // X axis 2
        res: Number(Math.max(0.2, Math.min(2000, res)).toFixed(2)), // X axis 3
        label: `${depth}m`
      });
    }
    return data;
  },
  
  generateGeotechData: (anchorOffset: number = 0.5, slopeAngle: number = 32): SimulationRow[] => {
    const data: SimulationRow[] = [];
    const shearFactor = Math.tan(slopeAngle * Math.PI / 180) * 0.25;
    for (let i = 0; i < 12; i++) {
      const dx = anchorOffset + (i * 0.15) * shearFactor + (Math.sin(i * 1.2) * 0.05);
      const dy = (anchorOffset * 0.8) + (i * 0.2) * shearFactor + (Math.cos(i * 1.2) * 0.06);
      const dz = (anchorOffset * 0.4) + (i * 0.08) * shearFactor + (Math.sin(i * 0.8) * 0.03);
      const magnitude = Math.sqrt(dx * dx + dy * dy + dz * dz);
      data.push({
        time: i * 2,
        dx: Number(dx.toFixed(4)),
        dy: Number(dy.toFixed(4)),
        dz: Number(dz.toFixed(4)),
        magnitude: Number(magnitude.toFixed(4)),
        label: `Day ${i * 2}`
      });
    }
    return data;
  },

  generateTiltExtensoTrack: (baseDx: number, baseDy: number): SimulationRow[] => {
    return Array.from({ length: 10 }, (_, i) => {
      const f = i + 1;
      const driftAmplifier = Math.exp(f * 0.25); 
      const dx = baseDx * driftAmplifier + noiseVal(baseDx, i) * 0.15 + (Math.random() - 0.5) * 2;
      const dy = baseDy * driftAmplifier + noiseVal(baseDy, i) * 0.15 + (Math.random() - 0.5) * 2;
      const magnitude = Math.sqrt(dx * dx + dy * dy);
      return {
        floor: f, dx: Number(dx.toFixed(3)), dy: Number(dy.toFixed(3)), magnitude: Number((magnitude * 60).toFixed(0)), name: `Floor ${f}`, label: `Fl ${f}`
      };
    });
  },

  generateResistivityTrack: (distance: number, resistance: number): SimulationRow[] => {
    const spacings = [1.5, 3, 5, 8, 12, 20, 35, 60, 100, 150];
    return spacings.map((a, i) => {
      const r = resistance * (1 - i * 0.06) * (1 + noiseVal(distance, i) * 0.2);
      const rho = 2 * Math.PI * a * r + noiseVal(resistance, i) * 15;
      return { spacing: a, depth: a, resistance: Number(r.toFixed(3)), rho: Number(rho.toFixed(2)), label: `${a}m` };
    });
  },

  generateResistivityMatrix: (): number[][] => {
    return Array.from({ length: 8 }, (_, r) => 
      Array.from({ length: 12 }, (_, c) => Number(Math.max(10, 130 + Math.sin(r * 0.6 + c * 0.3) * 60 + noiseVal(r, c) * 35).toFixed(1)))
    );
  },

  generateGprTrack: (depth: number, velocity: number): SimulationRow[] => {
    return Array.from({ length: 15 }, (_, i) => {
      const d = (depth / 15) * (i + 1);
      return { depth: Number(d.toFixed(2)), twt: Number(((2 * d) / velocity + noiseVal(depth, i) * 0.7).toFixed(2)), label: `${d.toFixed(1)}m` };
    });
  },

  generateGravityTrack: (elevation: number, lat: number): SimulationRow[] => {
    return Array.from({ length: 12 }, (_, i) => {
      const elOffset = elevation + i * 18 + noiseVal(elevation, i) * 5;
      const gNormal = 9.780327 * (1 + 0.0053024 * Math.pow(Math.sin((lat + i * 0.15) * Math.PI / 180), 2));
      const anomaly = (gNormal - 0.0003086 * elOffset) * 1e5 + noiseVal(elevation, i) * 12 + Math.sin(i) * 5;
      return { station: i + 1, elevation: elOffset, anomaly: Number(anomaly.toFixed(2)), label: `ST-${i+1}` };
    });
  },

  generateGeochemTrack: (concentrate: number): SimulationRow[] => {
    return Array.from({ length: 15 }, (_, i) => {
      const d = 10 + i * 6;
      const s = 220 + concentrate * 18 * Math.sin(i * 0.8) + noiseVal(concentrate, i) * 60;
      const c = 160 + concentrate * 12 * Math.cos(i * 0.7) + noiseVal(concentrate, i + 1) * 40;
      return { depth: d, ph: Number(Math.max(1, 7.5 - (s + c) * 0.006 + noiseVal(d, i) * 0.3).toFixed(2)), sulfate: Number(s.toFixed(1)), chloride: Number(c.toFixed(1)), label: `${d}m` };
    });
  },

  generateMeteorologyTrack: (temp: number, pressure: number): SimulationRow[] => {
    return Array.from({ length: 12 }, (_, i) => {
      const hr = i * 2;
      const rProb = Math.max(0, (1015 - pressure) * 2.5 + noiseVal(pressure, i) * 12);
      return {
        hour: hr, time: `${hr}:00`,
        temperature: Number((temp + Math.sin((hr/24)*2*Math.PI - Math.PI/2) * 6 + noiseVal(temp, i) * 0.8).toFixed(1)),
        pressure: Number((pressure + Math.cos((hr/24)*2*Math.PI) * 4 + noiseVal(pressure, i) * 1.5).toFixed(1)),
        windSpeed: Number((12 + rProb * 0.35 + Math.sin(i)*3).toFixed(1)),
        rainfall: Number(Math.max(0, rProb > 8 ? rProb * 0.6 : 0).toFixed(1)),
        label: `${hr}:00`
      };
    });
  },

  generateGroundwaterTrack: (rate: number, trans: number): SimulationRow[] => {
    return [1, 5, 20, 50, 100, 250, 500, 1000].map((r, i) => {
      const u = (r * r) / (4 * Math.max(1, trans) * 12);
      const drawdown = (rate / (4 * Math.PI * Math.max(1, trans))) * (-0.5772 - Math.log(u + 0.001) + (u + 0.001)) + noiseVal(r, i)*0.5;
      return { distance: r, time: `Day ${i + 1}`, drawdown: Number(Math.max(0, drawdown).toFixed(3)), label: `${r}m` };
    });
  },

  generateSoilPlumeDiffusion: (conc: number): SimulationRow[] => {
    return [0, 20, 80, 150, 250, 400, 700, 1200].map((d, i) => ({
      distance: d, concentration: Number(Math.max(0, conc * Math.exp(-((d * d) / 180000)) + noiseVal(conc, i) * 0.8 + 2.5).toFixed(2)), residentialLimit: 10, label: `${d}m`
    }));
  },

  generateSoilPhTrack: (ph: number, sulfur: number): SimulationRow[] => {
    return Array.from({ length: 12 }, (_, i) => ({
      depth: parseFloat((i * 0.4).toFixed(1)), ph: Number(Math.max(1, Math.min(14, ph - (sulfur * 0.025) * Math.exp(-(i * 0.4)) + noiseVal(ph, i) * 0.25)).toFixed(2)), label: `${parseFloat((i * 0.4).toFixed(1))}m`
    }));
  },

  generateRadiometricTrack: (u: number, th: number): SimulationRow[] => {
    return Array.from({ length: 15 }, (_, i) => {
      const d = 50 + i * 15;
      return { depth: d, cps: Number(Math.max(0, u * 1.6 + th * 0.9 + Math.sin(i * 1.2) * 55 + noiseVal(u, i) * 20).toFixed(1)), label: `${d}m` };
    });
  },

  generateGasTrack: (h2s: number, ch4: number): SimulationRow[] => {
    return Array.from({ length: 15 }, (_, i) => {
      return { time: i * 8, hour: i, h2s: Number(Math.max(0, h2s * 0.75 + ch4 * 0.08 * Math.sin(i * 1.5) + noiseVal(h2s, i) * 1.8).toFixed(2)), ch4: Number(Math.max(0, ch4 + Math.cos(i * 1.2) * 0.3 + noiseVal(ch4, i) * 1.5).toFixed(2)), label: `${i*8}s` };
    });
  },

  generateSpatialTrack: (eastOffset: number, northOffset: number): SimulationRow[] => {
    return Array.from({ length: 12 }, (_, i) => ({
      step: i + 1,
      east: Number((eastOffset + Math.sin(i * 0.6) * 0.25 + noiseVal(eastOffset, i) * 0.08).toFixed(4)),
      north: Number((northOffset + Math.cos(i * 0.6) * 0.22 + noiseVal(northOffset, i) * 0.07).toFixed(4)),
      label: `PT-${i+1}`
    }));
  },

  generateElectricalData: (spacing: number = 10, current: number = 1.0): SimulationRow[] => {
    return Array.from({ length: 12 }, (_, i) => {
      const a = spacing + i * 5; // Wenner spacing
      const kFactor = 2 * Math.PI * a; // Geometric factor
      const voltage = 10 / (i + 1); // Mock voltage decay
      const apparentResistivity = kFactor * (voltage / current); // Apparent Resistivity
      
      const phi = 0.25; // Porosity fraction
      const m = 2; // Cementation
      const n = 2; // Saturation exp
      const Rw = 0.5; // Water resistivity
      const SwUncapped = Math.pow((1 * Rw) / (apparentResistivity * Math.pow(phi, m)), 1/n);
      const Sw = Math.max(0, Math.min(1, SwUncapped)); // Dynamic Saturation

      return {
        spacing: a,
        apparentResistivity: Number(apparentResistivity.toFixed(2)),
        waterSaturation: Number(Sw.toFixed(2)),
        label: `${a}m`
      };
    });
  },

  generateGPRData: (frequency: number = 400, dielectricConstant: number = 9): SimulationRow[] => {
    return Array.from({ length: 25 }, (_, i) => {
      const time_ns = i * 2;
      const c = 0.3; // speed of light in vacuum m/ns
      const velocity = c / Math.sqrt(dielectricConstant);
      const depth = (velocity * time_ns) / 2; // Dielectric depth conversion
      const phaseAngle = Math.atan2(time_ns * 0.1, frequency); // Phase angles
      const amplitude = Math.exp(-time_ns*0.02) * Math.sin(time_ns * frequency * 0.001);

      return {
        time: time_ns,
        depth: Number(depth.toFixed(3)),
        velocity: Number(velocity.toFixed(3)),
        phaseAngle: Number(phaseAngle.toFixed(3)),
        amplitude: Number(amplitude.toFixed(3)),
        label: `${depth.toFixed(1)}m`
      };
    });
  },

  generateGravityData: (latitude: number = 45, density: number = 2.67): SimulationRow[] => {
    return Array.from({ length: 30 }, (_, i) => {
      const station = i * 50;
      const elevation = 100 + i * 2; // topography
      const latRad = latitude * (Math.PI / 180);
      const g_obs = 978031.8 + Math.random() * 10; // mGal mock observation
      
      // International Gravity Formula
      const g_lat = 978032.68 * (1 + 0.0053024 * Math.pow(Math.sin(latRad), 2) - 0.0000058 * Math.pow(Math.sin(2 * latRad), 2));
      const freeAirCorrection = 0.3086 * elevation;
      const bouguerCorrection = 0.0419 * density * elevation;
      
      const freeAirAnomaly = g_obs - g_lat + freeAirCorrection;
      const bouguerAnomaly = freeAirAnomaly - bouguerCorrection; // Computing Bouguer anomalies
      // Diurnal drift corr: simple linear drift
      const diurnalCorr = i * 0.01;
      
      return {
        station,
        elevation,
        g_obs: Number(g_obs.toFixed(2)),
        freeAirAnomaly: Number(freeAirAnomaly.toFixed(2)),
        bouguerAnomaly: Number((bouguerAnomaly - diurnalCorr).toFixed(2)),
        label: `ST_${station}`
      };
    });
  }
};
