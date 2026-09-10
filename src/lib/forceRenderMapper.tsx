import React from 'react';

function normalizeItemKeys(item: any): any {
  if (!item || typeof item !== 'object') return item;
  const normalized = { ...item };
  
  const lowerKeys: { [key: string]: string } = {};
  Object.keys(item).forEach(k => {
    lowerKeys[k.toLowerCase()] = k;
  });

  const findAndMap = (candidates: string[], target: string) => {
    if (normalized[target] !== undefined) return;
    for (const c of candidates) {
      if (item[c] !== undefined) {
        normalized[target] = Number(item[c]);
        return;
      }
      const lowerCandidate = c.toLowerCase();
      const actualKey = lowerKeys[lowerCandidate];
      if (actualKey !== undefined) {
        normalized[target] = Number(item[actualKey]);
        return;
      }
    }
  };

  findAndMap(['depth_m', 'depth_ft', 'depth', 'md', 'dept(m)', 'depthindex'], 'depth');
  findAndMap(['gr_api', 'gr', 'gamma', 'gamma ray', 'gapi'], 'gr');
  findAndMap(['res_ohmm', 'res', 'resistivity', 'ohmm'], 'res');
  findAndMap(['rhob_gcm3', 'rhob', 'density', 'gcm3'], 'rhob');
  findAndMap(['nphi_v_v', 'nphi', 'neutron', 'v_v'], 'nphi');
  findAndMap(['dt_us_ft', 'dt', 'sonic', 'us_ft'], 'dt');
  findAndMap(['cal_in', 'cal', 'caliper', 'in'], 'cal');
  findAndMap(['g_obs', 'gravity', 'bougueranomaly', 'residualg', 'amplitude', 'anomaly'], 'anomaly');
  findAndMap(['g_obs', 'gravity', 'bougueranomaly', 'residualg'], 'bouguerAnomaly');
  findAndMap(['residualg'], 'residualG');
  findAndMap(['maganomaly'], 'magAnomaly');

  return normalized;
}

export function forceMapData(data: any): any[] {
  if (!data) return [];

  // 1. If it's not an array, but is an object (Object of Arrays)
  if (typeof data === 'object' && !Array.isArray(data)) {
    let targetData = data;
    if (data.data_preview) targetData = data.data_preview;

    const arrayKeys = Object.keys(targetData).filter(key => Array.isArray(targetData[key]));
    if (arrayKeys.length > 0) {
      const maxLength = Math.max(...arrayKeys.map(k => targetData[k].length));
      const normalized = [];
      for (let i = 0; i < maxLength; i++) {
        let row: any = { id: i };
        arrayKeys.forEach(key => {
          row[key] = targetData[key][i] !== undefined ? targetData[key][i] : null;
        });
        
        // Match standard aliases for maximum compatibility across visualizers
        if (row.vp_m_s !== undefined && row.vp === undefined) row.vp = row.vp_m_s;
        if (row.vs_m_s !== undefined && row.vs === undefined) row.vs = row.vs_m_s;
        if (row.twt_ms !== undefined && row.time === undefined) row.time = row.twt_ms;
        if (row.depth_ft !== undefined && row.depth === undefined) row.depth = row.depth_ft;
        
        normalized.push(normalizeItemKeys(row));
      }
      return normalized;
    }
    return [];
  }

  // 2. If it is an array
  if (Array.isArray(data)) {
    if (data.length === 0) return [];
    
    // If already array of objects, return with standard indexes
    if (typeof data[0] === 'object' && !Array.isArray(data[0]) && data[0] !== null) {
      return data.map((item, index) => {
        const norm = normalizeItemKeys(item);
        return {
          id: index,
          ...norm
        };
      });
    }
    
    // Parse Array of Arrays
    return data.map((row, index) => {
      const norm = normalizeItemKeys({
        val1: row[0], val2: row[1], val3: row[2], val4: row[3], val5: row[4],
        time: row[0], vp: row[1], vs: row[2], depth: row[0], vel: row[1], amplitude: row[1],
        station: row[0], residualG: row[1], magAnomaly: row[2],
        chargeability: row[1], resistivity: row[2],
        rate: row[1], trans: row[2],
        sampleId: row[0], cu: row[1], au: row[2],
        temp: row[1], pressure: row[2], humidity: row[3],
        ph: row[1], sulfur: row[2], concentration: row[1],
        gamma: row[1], res: row[2], depthIndex: row[0],
        u: row[1], th: row[2], k: row[3],
        h2s: row[1], ch4: row[2], co2: row[3],
        dx: row[1], dy: row[2], offset: row[1]
      });
      return {
        id: index,
        ...norm
      };
    });
  }

  return [];
}

export function DebugDump({ data, forceShow }: { data: any, forceShow?: boolean }) {
  if (!data) return null;
  
  let formattedData = data;
  if (Array.isArray(data)) {
      if (data.length === 0) return null;
      formattedData = data.slice(0, 10);
  } else if (typeof data === 'object') {
      formattedData = Object.keys(data).reduce((acc, key) => {
          if (Array.isArray(data[key])) {
              acc[key] = data[key].slice(0, 5); // limit length
          } else {
              acc[key] = data[key];
          }
          return acc;
      }, {} as any);
  }

  return (
    <div className="text-[10px] text-red-500 font-mono overflow-auto max-h-32 p-2 border border-red-500/30 whitespace-pre w-full mb-2 bg-black">
        <pre>DEBUG PAYLOAD (FORCE RENDER): {JSON.stringify(formattedData, null, 2)}</pre>
    </div>
  );
}
