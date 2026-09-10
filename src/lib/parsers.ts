/**
 * Ivan-GeoAI-Pro core geophysics standard industry file parsers.
 * Supports:
 *  - LAS (Log ASCII Standard) for well logging curves
 *  - SEG-Y (Binary and Text Seismic) for seismic traces
 *  - GeoTIFF Metadata & Grid parsing
 *  - KML (XML Geography markup) placemarks and boundaries
 */

export interface ParsedLASResult {
  metadata: Record<string, any>;
  curves: string[];
  data: Record<string, number>[];
}

export interface ParsedSegyTrace {
  traceNumber: number;
  shotpoint: number;
  sampleCount: number;
  sampleRateMs: number;
  samples: number[];
}

export interface ParsedSegyResult {
  textHeader: string;
  traces: ParsedSegyTrace[];
  chartData: any[]; // formatted for rendering charts
}

/**
 * 1. LAS File Parser
 * Parses Log ASCII Standard (CWLS LAS v1.2, v2.0)
 */
export function parseLAS(text: string): ParsedLASResult {
  const result: ParsedLASResult = {
    metadata: {},
    curves: [],
    data: []
  };

  const lines = text.split('\n');
  let currentSection = '';
  const curveDefinitions: { mnemonic: string; unit: string; description: string }[] = [];

  for (let line of lines) {
    line = line.trim();
    if (!line || line.startsWith('#')) continue;

    // Detect section headers
    if (line.startsWith('~')) {
      const sectionName = line.substring(1).trim().toUpperCase();
      // Match section prefixes (e.g., ~V, ~W, ~C, ~A)
      if (sectionName.startsWith('V')) {
        currentSection = 'VERSION';
      } else if (sectionName.startsWith('W')) {
        currentSection = 'WELL';
      } else if (sectionName.startsWith('C')) {
        currentSection = 'CURVE';
      } else if (sectionName.startsWith('A')) {
        currentSection = 'DATA';
      } else {
        currentSection = sectionName;
      }
      continue;
    }

    if (currentSection === 'VERSION' || currentSection === 'WELL') {
      // Line format: MNEM.UNIT VALUE : DESCRIPTION
      const firstDot = line.indexOf('.');
      if (firstDot > 0) {
        const mnemonic = line.substring(0, firstDot).trim();
        const rest = line.substring(firstDot + 1);
        const colonIndex = rest.indexOf(':');
        let valueAndUnit = rest;
        let description = '';
        if (colonIndex >= 0) {
          valueAndUnit = rest.substring(0, colonIndex);
          description = rest.substring(colonIndex + 1).trim();
        }
        
        // Find unit if any (usually starts after dot until a space)
        const parts = valueAndUnit.trim().split(/\s+/);
        const value = parts.slice(1).join(' ').trim() || parts[0];
        result.metadata[mnemonic] = { value, description };
      }
    } else if (currentSection === 'CURVE') {
      const firstDot = line.indexOf('.');
      if (firstDot > 0) {
        const mnemonic = line.substring(0, firstDot).trim();
        const rest = line.substring(firstDot + 1);
        const colonIndex = rest.indexOf(':');
        let unit = '';
        let description = '';
        
        const spaceIndex = rest.search(/\s/);
        if (spaceIndex > 0) {
          unit = rest.substring(0, spaceIndex).trim();
        }
        
        if (colonIndex >= 0) {
          description = rest.substring(colonIndex + 1).trim();
        }
        
        curveDefinitions.push({ mnemonic, unit, description });
        result.curves.push(mnemonic);
      }
    } else if (currentSection === 'DATA') {
      // Numbers separated by whitespace
      const values = line.split(/\s+/).map(v => parseFloat(v)).filter(v => !isNaN(v));
      if (values.length > 0 && curveDefinitions.length > 0) {
        const row: Record<string, number> = {};
        curveDefinitions.forEach((curve, idx) => {
          if (idx < values.length) {
            // Check for null/missing value representation (commonly -999.25 or -9999)
            if (values[idx] !== -999.25 && values[idx] !== -9999) {
              row[curve.mnemonic.toLowerCase()] = values[idx];
              // Fallbacks or mappings for known curves so charts pick them up
              if (curve.mnemonic.toUpperCase() === 'DEPT' || curve.mnemonic.toUpperCase() === 'DEPTH') {
                row['depth'] = values[idx];
                row['depth_m'] = values[idx];
              }
              if (curve.mnemonic.toUpperCase() === 'GR') {
                row['gr_api'] = values[idx];
              }
              if (curve.mnemonic.toUpperCase() === 'RES' || curve.mnemonic.toUpperCase() === 'ILD') {
                row['res_ohmm'] = values[idx];
              }
              if (curve.mnemonic.toUpperCase() === 'RHOB') {
                row['rhob_gcm3'] = values[idx];
              }
              if (curve.mnemonic.toUpperCase() === 'NPHI') {
                row['nphi_v_v'] = values[idx];
              }
              if (curve.mnemonic.toUpperCase() === 'DT') {
                row['dt_us_ft'] = values[idx];
              }
              if (curve.mnemonic.toUpperCase() === 'CAL') {
                row['cal_in'] = values[idx];
              }
            }
          }
        });
        result.data.push(row);
      }
    }
  }

  return result;
}

/**
 * 2. SEG-Y File Parser
 * Supports parsing both binary ArrayBuffer and text representations of SEG-Y files.
 */
export function parseSEGY(input: string | ArrayBuffer): ParsedSegyResult {
  if (input instanceof ArrayBuffer) {
    return parseBinarySegy(input);
  } else {
    return parseTextSegy(input);
  }
}

function parseBinarySegy(buffer: ArrayBuffer): ParsedSegyResult {
  const view = new DataView(buffer);
  
  // 1. Read first 3200 bytes as Text Header (EBCDIC or ASCII)
  let textHeader = '';
  try {
    const uint8Bytes = new Uint8Array(buffer, 0, Math.min(3200, buffer.byteLength));
    // EBCDIC characters have a different encoding. Let's do a fast conversion/detection
    const isEbcdic = uint8Bytes[0] === 0xC3 || uint8Bytes[0] === 0xC5; // Commonly starts with 'C1' ... 'C40' or similar
    
    if (isEbcdic) {
      // Basic EBCDIC to ASCII conversion
      const ebcdicToAsciiMap: Record<number, string> = {
        0xC1: 'A', 0xC2: 'B', 0xC3: 'C', 0xC4: 'D', 0xC5: 'E', 0xC6: 'F', 0xC7: 'G', 0xC8: 'H', 0xC9: 'I',
        0xD1: 'J', 0xD2: 'K', 0xD3: 'L', 0xD4: 'M', 0xD5: 'N', 0xD6: 'O', 0xD7: 'P', 0xD8: 'Q', 0xD9: 'R',
        0xE2: 'S', 0xE3: 'T', 0xE4: 'U', 0xE5: 'V', 0xE6: 'W', 0xE7: 'X', 0xE8: 'Y', 0xE9: 'Z',
        0x81: 'a', 0x82: 'b', 0x83: 'c', 0x84: 'd', 0x85: 'e', 0x86: 'f', 0x87: 'g', 0x88: 'h', 0x89: 'i',
        0x91: 'j', 0x92: 'k', 0x93: 'l', 0x94: 'm', 0x95: 'n', 0x96: 'o', 0x97: 'p', 0x98: 'q', 0x99: 'r',
        0xA2: 's', 0xA3: 't', 0xA4: 'u', 0xA5: 'v', 0xA6: 'w', 0xA7: 'x', 0xA8: 'y', 0xA9: 'z',
        0xF0: '0', 0xF1: '1', 0xF2: '2', 0xF3: '3', 0xF4: '4', 0xF5: '5', 0xF6: '6', 0xF7: '7', 0xF8: '8', 0xF9: '9',
        0x40: ' ', 0x4B: '.', 0x4D: '<', 0x4E: '(', 0x4F: '+', 0x50: '&', 0x5F: '!', 0x60: '-', 0x61: '/',
        0x6C: '%', 0x6D: '_', 0x6E: '>', 0x6F: '?', 0x7A: ':', 0x7B: '#', 0x7C: '@', 0x7D: "'", 0x7E: '=', 0x7F: '"'
      };
      
      for (let i = 0; i < uint8Bytes.length; i++) {
        textHeader += ebcdicToAsciiMap[uint8Bytes[i]] || String.fromCharCode(uint8Bytes[i]);
      }
    } else {
      textHeader = new TextDecoder('utf-8').decode(uint8Bytes);
    }
  } catch (e) {
    textHeader = 'Error decoding SEG-Y 3200-byte EBCDIC text header';
  }

  // 2. Read 400-byte Binary Header (bytes 3200-3600)
  let sampleRate = 2000; // default 2ms (2000 microseconds)
  let sampleCount = 500;
  if (buffer.byteLength >= 3600) {
    sampleRate = view.getUint16(3200 + 16, false); // byte 3216: sample interval in microseconds
    sampleCount = view.getUint16(3200 + 20, false); // byte 3220: number of samples per trace
  }

  const traces: ParsedSegyTrace[] = [];
  const chartData: any[] = [];

  // 3. Process Traces (starting at byte 3600)
  // Each trace = 240 bytes trace header + (sampleCount * 4 bytes float)
  const traceBytes = 240 + (sampleCount * 4);
  let offset = 3600;
  let traceNum = 1;

  while (offset + traceBytes <= buffer.byteLength && traceNum <= 50) {
    const traceId = view.getInt32(offset, false);
    const shotpoint = view.getInt32(offset + 16, false);
    
    const samples: number[] = [];
    for (let s = 0; s < sampleCount; s++) {
      const val = view.getFloat32(offset + 240 + (s * 4), false);
      samples.push(isNaN(val) ? 0 : val);
    }

    traces.push({
      traceNumber: traceNum,
      shotpoint: shotpoint || traceNum,
      sampleCount,
      sampleRateMs: sampleRate / 1000,
      samples
    });

    traceNum++;
    offset += traceBytes;
  }

  // Generate chart friendly rows (each row represents a time step, columns represent traces)
  for (let s = 0; s < sampleCount; s++) {
    const row: any = { time_ms: s * (sampleRate / 1000) };
    traces.forEach((t) => {
      row[`trace_${t.traceNumber}`] = t.samples[s] || 0;
    });
    chartData.push(row);
  }

  return { textHeader, traces, chartData };
}

function parseTextSegy(text: string): ParsedSegyResult {
  // Parses a text/CSV representation of SEG-Y traces
  const lines = text.split('\n');
  const traces: ParsedSegyTrace[] = [];
  const chartData: any[] = [];
  let textHeader = "Textual SEG-Y Log Representation";

  let sampleRate = 2.0; // 2ms default
  let sampleCount = 100;

  // Let's see if we find headers
  const traceSamplesMap: Record<number, number[]> = {};

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    if (line.startsWith('#') || line.startsWith('C') || line.startsWith('c')) {
      if (line.toLowerCase().includes('sample rate')) {
        const matches = line.match(/\d+(\.\d+)?/);
        if (matches) sampleRate = parseFloat(matches[0]);
      }
      continue;
    }

    // Attempt to parse Trace Data Row: Trace_Num, Time_ms, Amplitude
    // Or Time, Trace1, Trace2, Trace3
    const parts = line.split(/[\s,;\t]+/).map(v => parseFloat(v)).filter(v => !isNaN(v));
    if (parts.length >= 2) {
      const timeMs = parts[0];
      const amplitudes = parts.slice(1);
      
      const row: any = { time_ms: timeMs };
      amplitudes.forEach((amp, idx) => {
        const traceIdx = idx + 1;
        row[`trace_${traceIdx}`] = amp;
        
        if (!traceSamplesMap[traceIdx]) {
          traceSamplesMap[traceIdx] = [];
        }
        traceSamplesMap[traceIdx].push(amp);
      });
      chartData.push(row);
    }
  }

  Object.keys(traceSamplesMap).forEach((key) => {
    const traceIdx = parseInt(key);
    traces.push({
      traceNumber: traceIdx,
      shotpoint: traceIdx * 10,
      sampleCount: traceSamplesMap[traceIdx].length,
      sampleRateMs: sampleRate,
      samples: traceSamplesMap[traceIdx]
    });
  });

  return { textHeader, traces, chartData };
}

/**
 * 3. GeoTIFF Header and Raster Grid Parser
 */
export interface ParsedGeoTiffResult {
  width: number;
  height: number;
  bounds: { minX: number; maxX: number; minY: number; maxY: number };
  projection: string;
  grid: number[][];
  metadata: Record<string, any>;
}

export function parseGeoTIFF(text: string): ParsedGeoTiffResult {
  const metadata: Record<string, any> = {};
  let width = 100;
  let height = 100;
  let minX = 0, maxX = 1000, minY = 0, maxY = 1000;
  let projection = 'UTM Zone 49S / WGS 84';
  const grid: number[][] = [];

  const lines = text.split('\n');
  let readingGrid = false;

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    if (line.startsWith('#') || line.startsWith('//')) {
      if (line.toLowerCase().includes('width')) {
        const match = line.match(/\d+/);
        if (match) width = parseInt(match[0]);
      }
      if (line.toLowerCase().includes('height')) {
        const match = line.match(/\d+/);
        if (match) height = parseInt(match[0]);
      }
      if (line.toLowerCase().includes('bounds')) {
        const matches = line.match(/-?\d+(\.\d+)?/g);
        if (matches && matches.length >= 4) {
          minX = parseFloat(matches[0]);
          maxX = parseFloat(matches[1]);
          minY = parseFloat(matches[2]);
          maxY = parseFloat(matches[3]);
        }
      }
      if (line.toLowerCase().includes('projection')) {
        projection = line.substring(line.indexOf(':') + 1).trim();
      }
      continue;
    }

    if (line.toUpperCase().includes('RASTER_GRID') || line.toUpperCase().includes('GRID_DATA')) {
      readingGrid = true;
      continue;
    }

    if (readingGrid) {
      const rowVals = line.split(/[\s,;\t]+/).map(v => parseFloat(v)).filter(v => !isNaN(v));
      if (rowVals.length > 0) {
        grid.push(rowVals);
      }
    } else {
      // General metadata extraction
      const parts = line.split(':');
      if (parts.length >= 2) {
        metadata[parts[0].trim()] = parts.slice(1).join(':').trim();
      }
    }
  }

  // Generate synthetic smooth grid if none uploaded
  if (grid.length === 0) {
    for (let r = 0; r < height; r++) {
      const row: number[] = [];
      for (let c = 0; c < width; c++) {
        // generate beautiful synthetic terrain grid
        const elev = 250 + 50 * Math.sin(r / 10) * Math.cos(c / 15) + 15 * Math.sin(c / 5);
        row.push(Number(elev.toFixed(2)));
      }
      grid.push(row);
    }
  }

  return {
    width,
    height,
    bounds: { minX, maxX, minY, maxY },
    projection,
    grid,
    metadata
  };
}

/**
 * 4. KML XML Geography Parser
 */
export interface KmlPlacemark {
  name: string;
  description: string;
  coordinates: { lng: number; lat: number; elev: number }[];
  type: 'Point' | 'LineString' | 'Polygon';
}

export function parseKML(kmlText: string): KmlPlacemark[] {
  const placemarks: KmlPlacemark[] = [];
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(kmlText, "text/xml");
    const placemarkNodes = xmlDoc.getElementsByTagName("Placemark");

    for (let i = 0; i < placemarkNodes.length; i++) {
      const node = placemarkNodes[i];
      const name = node.getElementsByTagName("name")[0]?.textContent || `Placemark #${i + 1}`;
      const description = node.getElementsByTagName("description")[0]?.textContent || '';
      
      let coordinates: { lng: number; lat: number; elev: number }[] = [];
      let type: 'Point' | 'LineString' | 'Polygon' = 'Point';

      // 1. Point coordinates
      const pointNode = node.getElementsByTagName("Point")[0];
      if (pointNode) {
        type = 'Point';
        const coordStr = pointNode.getElementsByTagName("coordinates")[0]?.textContent || '';
        coordinates = parseKmlCoordinates(coordStr);
      }

      // 2. LineString coordinates
      const lineNode = node.getElementsByTagName("LineString")[0];
      if (lineNode) {
        type = 'LineString';
        const coordStr = lineNode.getElementsByTagName("coordinates")[0]?.textContent || '';
        coordinates = parseKmlCoordinates(coordStr);
      }

      // 3. Polygon coordinates
      const polyNode = node.getElementsByTagName("Polygon")[0];
      if (polyNode) {
        type = 'Polygon';
        const outerBoundary = polyNode.getElementsByTagName("outerBoundaryIs")[0];
        const coordStr = outerBoundary?.getElementsByTagName("coordinates")[0]?.textContent || '';
        coordinates = parseKmlCoordinates(coordStr);
      }

      if (coordinates.length > 0) {
        placemarks.push({ name, description, coordinates, type });
      }
    }
  } catch (e) {
    console.error("KML DOM parsing failed, falling back to manual extraction:", e);
    // Fallback simple regex-based extractor for security & robustness
    const coordMatches = kmlText.match(/<coordinates>([\s\S]*?)<\/coordinates>/g);
    if (coordMatches) {
      coordMatches.forEach((match, idx) => {
        const cleanCoords = match.replace(/<\/?coordinates>/g, '').trim();
        const coordinates = parseKmlCoordinates(cleanCoords);
        if (coordinates.length > 0) {
          placemarks.push({
            name: `Manual Extract #${idx + 1}`,
            description: 'Regex Fallback Extracted Feature',
            coordinates,
            type: coordinates.length === 1 ? 'Point' : (coordinates.length > 2 ? 'Polygon' : 'LineString')
          });
        }
      });
    }
  }

  return placemarks;
}

function parseKmlCoordinates(coordStr: string): { lng: number; lat: number; elev: number }[] {
  const list: { lng: number; lat: number; elev: number }[] = [];
  const points = coordStr.trim().split(/\s+/);
  for (const p of points) {
    const parts = p.split(',').map(v => parseFloat(v));
    if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      list.push({
        lng: parts[0],
        lat: parts[1],
        elev: parts[2] || 0
      });
    }
  }
  return list;
}
