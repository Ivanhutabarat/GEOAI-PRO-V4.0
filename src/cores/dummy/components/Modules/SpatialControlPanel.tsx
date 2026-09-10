import React, { useState, useMemo } from 'react';
import { useGeoDataStore, GeoDataPoint, LithologyLayer } from '../../store/GeoDataStore';
import { 
  Database, X, MapPin, Trash2, Plus, RefreshCw, 
  Layers, Sliders, Sparkles, HelpCircle, FileText, Upload
} from 'lucide-react';

export default function SpatialControlPanel({ onClose }: { onClose?: () => void }) {
  const points = useGeoDataStore(state => state.points);
  const layers = useGeoDataStore(state => state.layers);
  const setPoints = useGeoDataStore(state => state.setPoints);
  const addPoint = useGeoDataStore(state => state.addPoint);
  const clearPoints = useGeoDataStore(state => state.clearPoints);
  const setLayers = useGeoDataStore(state => state.setLayers);
  const setFaultActive = useGeoDataStore(state => state.setFaultActive);
  const setFaultPositionX = useGeoDataStore(state => state.setFaultPositionX);

  const [activeTab, setActiveTab] = useState<'points' | 'layers' | 'presets' | 'import'>('points');

  // Point Creator Form State
  const [newPtX, setNewPtX] = useState<number>(0);
  const [newPtY, setNewPtY] = useState<number>(0);
  const [newPtZ, setNewPtZ] = useState<number>(0);
  const [newPtColor, setNewPtColor] = useState<string>('#00E5FF');
  const [newPtType, setNewPtType] = useState<string>('custom');

  // Raw text import state
  const [inputText, setInputText] = useState('0, 0, 0, #00FFCC\n2, 2, 2, #FFFF33\n-2, -2, -2, #FF4411');

  // Colors preset palette for spatial points
  const pointColors = ['#00E5FF', '#00FF66', '#FFFF33', '#FF5722', '#F43F5E', '#A21CAF', '#3B82F6', '#E2E8F0'];

  // Handle adding custom manual point
  const handleAddManualPoint = () => {
    const id = `manual-${Date.now()}`;
    const point: GeoDataPoint = {
      id,
      position: [newPtX, newPtY, newPtZ],
      color: newPtColor,
      type: newPtType,
    };
    addPoint(point);
  };

  // Delete a point
  const handleDeletePoint = (id: string) => {
    setPoints(points.filter(p => p.id !== id));
  };

  // Edit a point (load it into the form)
  const handleLoadPointToForm = (pt: GeoDataPoint) => {
    setNewPtX(pt.position[0]);
    setNewPtY(pt.position[1]);
    setNewPtZ(pt.position[2]);
    setNewPtColor(pt.color);
    setNewPtType(pt.type);
  };

  // Generate random point cloud data
  const handleGenerateRandomPoints = () => {
    const types = ['seismic', 'well', 'geochem', 'gravity', 'em'];
    const randomPoints: GeoDataPoint[] = Array.from({ length: 15 }, (_, i) => {
      const x = parseFloat((Math.random() * 14 - 7).toFixed(2));
      const y = parseFloat((Math.random() * 7 - 3.5).toFixed(2));
      const z = parseFloat((Math.random() * 14 - 7).toFixed(2));
      const color = pointColors[Math.floor(Math.random() * pointColors.length)];
      const type = types[Math.floor(Math.random() * types.length)];
      return {
        id: `random-${Date.now()}-${i}`,
        position: [x, y, z],
        color,
        type
      };
    });
    setPoints([...points, ...randomPoints]);
  };

  // Synchronize text-area data
  const handleSyncTextarea = () => {
    try {
      const lines = inputText.split('\n');
      const parsedPoints = lines.map((line, index) => {
        const parts = line.split(',').map(p => p.trim());
        if (parts.length >= 3) {
          const x = parseFloat(parts[0]);
          const y = parseFloat(parts[1]);
          const z = parseFloat(parts[2]);
          const color = parts[3] || '#00E5FF';
          const type = parts.length > 4 ? parts[4] : 'custom';
          
          if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
            return {
              id: `manual-text-${index}-${Date.now()}`,
              position: [x, y, z] as [number, number, number],
              color,
              type
            };
          }
        }
        return null;
      }).filter(Boolean) as GeoDataPoint[];

      if (parsedPoints.length > 0) {
        setPoints(parsedPoints);
      }
    } catch (e) {
      console.error("Failed to parse coordinates text input", e);
    }
  };

  // Batch import CSV file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target?.result as string;
        if (text) {
          setInputText(text);
          setActiveTab('import');
        }
      };
      reader.readAsText(file);
    }
  };

  // Manage contiguous layer thickness updates
  const handleUpdateLayerThickness = (index: number, newThickness: number) => {
    // We adjust the current layer's thickness, then rebuild the depthStart and depthEnd
    // sequentially starting from depth 0 to maintain perfect contiguity!
    const updatedLayers = [...layers];
    
    // Calculate current thicknesses of all layers
    const thicknesses = layers.map(l => Math.abs(l.depthStart - l.depthEnd));
    thicknesses[index] = Math.max(2, newThickness); // enforce minimum thickness of 2 meters
    
    // Rebuild boundaries
    let currentDepth = 0;
    const recontigLayers = updatedLayers.map((layer, idx) => {
      const start = currentDepth;
      const end = currentDepth - thicknesses[idx];
      currentDepth = end;
      return {
        ...layer,
        depthStart: start,
        depthEnd: end
      };
    });

    setLayers(recontigLayers);
  };

  // Edit layer name
  const handleRenameLayer = (index: number, newName: string) => {
    const updated = [...layers];
    updated[index] = { ...updated[index], name: newName };
    setLayers(updated);
  };

  // Edit layer color
  const handleColorLayer = (index: number, color: string) => {
    const updated = [...layers];
    updated[index] = { ...updated[index], color };
    setLayers(updated);
  };

  // Presets and templates
  const applyPreset = (type: 'volcanic' | 'ocean' | 'fault' | 'standard') => {
    if (type === 'volcanic') {
      const newLayers: LithologyLayer[] = [
        { name: 'Volcanic Silt Deposits', color: '#4b5563', depthStart: 0, depthEnd: -8, displacement: 0 },
        { name: 'Obsidian Flow Crust', color: '#1f2937', depthStart: -8, depthEnd: -20, displacement: 0 },
        { name: 'Ash Sand Strata', color: '#9ca3af', depthStart: -20, depthEnd: -30, displacement: 0 },
        { name: 'Pyrite Magma Intrusion', color: '#eab308', depthStart: -30, depthEnd: -45, displacement: 0 },
        { name: 'Active Basalt Hotbed', color: '#ef4444', depthStart: -45, depthEnd: -65, displacement: 0 }
      ];
      const newPts: GeoDataPoint[] = [
        { id: 'v1', position: [-4, -3, -2], color: '#ef4444', type: 'seismic' },
        { id: 'v2', position: [3, 2, 4], color: '#eab308', type: 'geochem' },
        { id: 'v3', position: [0, 1.5, -1], color: '#00E5FF', type: 'well' },
        { id: 'v4', position: [5, -2, -3], color: '#ef4444', type: 'seismic' }
      ];
      setLayers(newLayers);
      setPoints(newPts);
      setFaultActive(true);
      setFaultPositionX(-3);
    } else if (type === 'ocean') {
      const newLayers: LithologyLayer[] = [
        { name: 'Water & Ocean Muds', color: '#0284c7', depthStart: 0, depthEnd: -15, displacement: 0 },
        { name: 'Carbonate Gas Shale', color: '#14b8a6', depthStart: -15, depthEnd: -30, displacement: 0 },
        { name: 'Porous Reservoir Sandstone', color: '#ca8a04', depthStart: -30, depthEnd: -50, displacement: 0 },
        { name: 'Deep Crystalline Basement', color: '#475569', depthStart: -50, depthEnd: -70, displacement: 0 }
      ];
      const newPts: GeoDataPoint[] = [
        { id: 'o1', position: [1, -1.5, 2], color: '#14b8a6', type: 'em' },
        { id: 'o2', position: [-3, -2.8, -3], color: '#ca8a04', type: 'well' },
        { id: 'o3', position: [0, 3.5, 0], color: '#ef4444', type: 'seismic' },
        { id: 'o4', position: [4, 0, -2], color: '#0284c7', type: 'gravity' }
      ];
      setLayers(newLayers);
      setPoints(newPts);
      setFaultActive(false);
    } else if (type === 'fault') {
      const newLayers: LithologyLayer[] = [
        { name: 'Quaternary Sediment', color: '#a1a1aa', depthStart: 0, depthEnd: -12, displacement: 0 },
        { name: 'Fractured Limestone', color: '#78716c', depthStart: -12, depthEnd: -37, displacement: 0 },
        { name: 'Displaced Granite Basement', color: '#a21caf', depthStart: -37, depthEnd: -72, displacement: 0 }
      ];
      const newPts: GeoDataPoint[] = [
        { id: 'f1', position: [0, -1, 0], color: '#ef4444', type: 'seismic' },
        { id: 'f2', position: [-5, 2, -5], color: '#00E5FF', type: 'well' },
        { id: 'f3', position: [5, -3, 5], color: '#00E5FF', type: 'well' }
      ];
      setLayers(newLayers);
      setPoints(newPts);
      setFaultActive(true);
      setFaultPositionX(1.5);
    } else {
      // Standard Stratigraphy
      const newLayers: LithologyLayer[] = [
        { name: 'Clay & Ocean Deposits', color: '#3b82f6', depthStart: 0, depthEnd: -10, displacement: 0 },
        { name: 'Green Shale Stratum', color: '#10b981', depthStart: -10, depthEnd: -20, displacement: 0 },
        { name: 'Yellow Sandstone', color: '#f59e0b', depthStart: -20, depthEnd: -30, displacement: 0 },
        { name: 'Orange Limestone Silts', color: '#f97316', depthStart: -30, depthEnd: -40, displacement: 0 },
        { name: 'Crimson Basalt Fold', color: '#dc2626', depthStart: -40, depthEnd: -50, displacement: 0 },
        { name: 'Purple Metamorphic Basement', color: '#7c3aed', depthStart: -50, depthEnd: -60, displacement: 0 },
      ];
      const newPts: GeoDataPoint[] = [
        { id: 'p1', position: [-2, 1, -2], color: '#ff4444', type: 'seismic' },
        { id: 'p2', position: [2, 0.5, 1], color: '#44ff44', type: 'well' },
        { id: 'p3', position: [0, -1, 3], color: '#4444ff', type: 'geochem' },
        { id: 'p4', position: [-3, 2, 4], color: '#ffff44', type: 'gravity' },
        { id: 'p5', position: [4, -2, -3], color: '#ff44ff', type: 'em' },
      ];
      setLayers(newLayers);
      setPoints(newPts);
      setFaultActive(true);
      setFaultPositionX(0);
    }
  };

  return (
    <div className="absolute top-4 right-4 w-[360px] h-[calc(100%-2rem)] max-h-[640px] bg-[#0d0d10]/95 backdrop-blur-md border border-[#333] rounded-xl shadow-2xl z-20 flex flex-col font-sans text-sm text-gray-200 select-none overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-[#222] bg-[#121216]">
        <div className="flex items-center gap-2">
          <Database size={16} className="text-[#FF5722]" />
          <div className="flex flex-col">
            <span className="font-bold text-white tracking-widest text-xs uppercase font-mono">GeoData Console</span>
            <span className="text-[9px] text-[#00E5FF] font-mono tracking-widest uppercase">FEM Core Controller v4</span>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white hover:bg-[#222] rounded transition-colors focus:outline-none">
            <X size={15} />
          </button>
        )}
      </div>

      {/* Sci-Fi System Navigation Tabs */}
      <div className="grid grid-cols-4 bg-[#0a0a0c] border-b border-[#222] text-[9px] font-mono font-bold tracking-widest text-center">
        <button 
          onClick={() => setActiveTab('points')}
          className={`py-2.5 transition-all focus:outline-none border-r border-[#222] ${activeTab === 'points' ? 'text-[#FF5722] bg-[#121216] border-b border-[#FF5722]' : 'text-gray-400 hover:text-white'}`}
        >
          POINTS
        </button>
        <button 
          onClick={() => setActiveTab('layers')}
          className={`py-2.5 transition-all focus:outline-none border-r border-[#222] ${activeTab === 'layers' ? 'text-[#FF5722] bg-[#121216] border-b border-[#FF5722]' : 'text-gray-400 hover:text-white'}`}
        >
          STRATA
        </button>
        <button 
          onClick={() => setActiveTab('presets')}
          className={`py-2.5 transition-all focus:outline-none border-r border-[#222] ${activeTab === 'presets' ? 'text-[#FF5722] bg-[#121216] border-b border-[#FF5722]' : 'text-gray-400 hover:text-white'}`}
        >
          PRESETS
        </button>
        <button 
          onClick={() => setActiveTab('import')}
          className={`py-2.5 transition-all focus:outline-none ${activeTab === 'import' ? 'text-[#FF5722] bg-[#121216] border-b border-[#FF5722]' : 'text-gray-400 hover:text-white'}`}
        >
          IMPORT
        </button>
      </div>

      {/* Tab Contents Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">

        {/* Tab 1: SPATIAL POINTS MANAGER */}
        {activeTab === 'points' && (
          <div className="space-y-4">
            <div className="bg-[#121215] border border-[#222] rounded-lg p-3">
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#00E5FF] font-mono uppercase tracking-widest mb-3">
                <MapPin size={12} />
                Plot New Data Point
              </span>

              {/* Sliders for Coordinates */}
              <div className="space-y-2.5 font-mono text-[10px] text-gray-400">
                <div>
                  <div className="flex justify-between mb-1">
                    <span>X Offset (E-W):</span>
                    <span className="text-white font-bold">{newPtX.toFixed(1)}m</span>
                  </div>
                  <input 
                    type="range" min="-8" max="8" step="0.1" 
                    value={newPtX} onChange={(e) => setNewPtX(parseFloat(e.target.value))}
                    className="w-full accent-[#00E5FF] bg-[#222] h-1 rounded-full appearance-none outline-none"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span>Y Height (Elev):</span>
                    <span className="text-white font-bold">{newPtY.toFixed(1)}m</span>
                  </div>
                  <input 
                    type="range" min="-4" max="4" step="0.1" 
                    value={newPtY} onChange={(e) => setNewPtY(parseFloat(e.target.value))}
                    className="w-full accent-[#00FF66] bg-[#222] h-1 rounded-full appearance-none outline-none"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span>Z Depth (N-S):</span>
                    <span className="text-white font-bold">{newPtZ.toFixed(1)}m</span>
                  </div>
                  <input 
                    type="range" min="-8" max="8" step="0.1" 
                    value={newPtZ} onChange={(e) => setNewPtZ(parseFloat(e.target.value))}
                    className="w-full accent-[#FFFF33] bg-[#222] h-1 rounded-full appearance-none outline-none"
                  />
                </div>
              </div>

              {/* Point Type selection */}
              <div className="mt-3 grid grid-cols-5 gap-1.5 text-[8px] font-mono font-bold tracking-tight text-center">
                {['seismic', 'well', 'geochem', 'gravity', 'em'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setNewPtType(type)}
                    className={`py-1 rounded border uppercase transition-all focus:outline-none ${newPtType === type ? 'bg-[#FF5722]/20 text-white border-[#FF5722]' : 'bg-[#18181c] text-gray-400 border-[#222] hover:text-white'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Point Color selection */}
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[9px] font-mono uppercase text-gray-400">Plot Color:</span>
                <div className="flex gap-1.5">
                  {pointColors.slice(0, 6).map((c) => (
                    <button
                      key={c}
                      onClick={() => setNewPtColor(c)}
                      className={`w-4 h-4 rounded-full border transition-all ${newPtColor === c ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Add Button */}
              <button
                onClick={handleAddManualPoint}
                className="w-full mt-4 py-2 bg-gradient-to-r from-[#FF5722] to-[#ff3300] text-white hover:brightness-110 font-bold tracking-widest text-[10px] font-mono rounded shadow-lg transition-all flex items-center justify-center gap-1.5 focus:outline-none"
              >
                <Plus size={12} />
                PLOT INSTANTLY
              </button>
            </div>

            {/* Active Points List */}
            <div>
              <div className="flex justify-between items-center text-[10px] font-bold font-mono uppercase tracking-widest mb-2 text-[#aaa]">
                <span>Active Points ({points.length})</span>
                <div className="flex gap-2">
                  <button 
                    onClick={handleGenerateRandomPoints} 
                    className="text-[#00FF66] hover:underline"
                    title="Generate 15 random spatial dataset coordinates"
                  >
                    + RANDOM
                  </button>
                  <button 
                    onClick={clearPoints} 
                    className="text-red-400 hover:underline"
                  >
                    CLEAR
                  </button>
                </div>
              </div>

              {points.length === 0 ? (
                <div className="text-center py-6 text-gray-500 font-mono text-[10px] border border-dashed border-[#222] rounded-lg">
                  No active spatial points mapped.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-[180px] overflow-y-auto custom-scrollbar pr-1">
                  {points.map((pt) => (
                    <div 
                      key={pt.id} 
                      className="flex items-center justify-between p-2 bg-[#121215] border border-[#222] rounded hover:border-[#333] transition-all group"
                    >
                      <button 
                        onClick={() => handleLoadPointToForm(pt)}
                        className="flex items-center gap-2 text-left flex-1"
                        title="Click to load coordinate into form inputs"
                      >
                        <div className="w-2 h-2 rounded-full shadow-inner" style={{ backgroundColor: pt.color }}></div>
                        <div className="flex flex-col font-mono text-[9px]">
                          <span className="text-white font-bold uppercase tracking-tight">{pt.type} [{pt.id.substring(0,6)}]</span>
                          <span className="text-gray-500 text-[8px]">X:{pt.position[0].toFixed(1)} Y:{pt.position[1].toFixed(1)} Z:{pt.position[2].toFixed(1)}</span>
                        </div>
                      </button>
                      <button 
                        onClick={() => handleDeletePoint(pt.id)}
                        className="text-gray-500 hover:text-red-400 p-1 rounded hover:bg-[#222] transition-colors focus:outline-none opacity-40 group-hover:opacity-100"
                        title="Delete telemetry coordinate point"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: LITHOLOGY STRATA CUSTOMIZER */}
        {activeTab === 'layers' && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-[10px] text-gray-400 leading-relaxed bg-[#111114] p-3 rounded-lg border border-[#222]">
              <div className="flex items-center gap-1.5 font-bold text-white uppercase font-mono tracking-widest mb-1">
                <Sliders size={12} className="text-[#FF5722]" />
                Dynamic Geological Stratigraphy
              </div>
              Modify layers to instantly re-tesselate the 3D block model! Changing thickness recalculates contiguous boundaries automatically.
            </div>

            <div className="space-y-3">
              {layers.map((layer, index) => {
                const thickness = Math.abs(layer.depthStart - layer.depthEnd);

                return (
                  <div key={layer.name} className="p-3 bg-[#121215] border border-[#222] rounded-lg space-y-2.5">
                    {/* Title & Color Input */}
                    <div className="flex items-center justify-between gap-2">
                      <input 
                        type="text" 
                        value={layer.name} 
                        onChange={(e) => handleRenameLayer(index, e.target.value)}
                        className="bg-[#18181c] border border-[#222] px-2 py-1 text-[10px] text-white font-mono font-bold rounded focus:outline-none focus:border-[#FF5722] flex-1"
                      />
                      <input 
                        type="color" 
                        value={layer.color} 
                        onChange={(e) => handleColorLayer(index, e.target.value)}
                        className="w-6 h-6 rounded cursor-pointer border border-[#222] bg-transparent"
                      />
                    </div>

                    {/* Thickness Slider */}
                    <div className="font-mono text-[9px] text-gray-400 space-y-1">
                      <div className="flex justify-between">
                        <span>Strata Thickness:</span>
                        <span className="text-[#00E5FF] font-bold">{thickness}m</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input 
                          type="range" min="3" max="30" step="1" 
                          value={thickness} 
                          onChange={(e) => handleUpdateLayerThickness(index, parseInt(e.target.value))}
                          className="w-full accent-[#FF5722] bg-[#222] h-1 rounded-full appearance-none outline-none"
                        />
                        <span className="text-[8px] text-[#555]">[{layer.depthStart}m to {layer.depthEnd}m]</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: SCIENTIFIC STRUCTURAL PRESETS */}
        {activeTab === 'presets' && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-[10px] text-gray-400 bg-[#111114] p-3 rounded-lg border border-[#222] flex gap-2">
              <Sparkles size={16} className="text-yellow-400 shrink-0" />
              <div>
                <span className="font-bold text-white block uppercase font-mono tracking-widest mb-0.5">Preset Architectures</span>
                Instantly morph the entire 3D block model structure, rock colors, fault parameters, and telemetry datasets.
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              <button
                onClick={() => applyPreset('standard')}
                className="p-3 bg-[#121215] border border-[#222] hover:border-[#FF5722]/50 rounded-lg text-left transition-all hover:bg-[#15151b] group focus:outline-none"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-white uppercase font-mono group-hover:text-[#FF5722]">Standard Basin Stratigraphy</span>
                  <span className="text-[8px] font-mono bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded uppercase font-black">Stable</span>
                </div>
                <p className="text-[10px] text-gray-500 font-mono">Standard sedimentary layers (Sandstone, Limestone, Basalt) with neutral stresses and well datasets.</p>
              </button>

              <button
                onClick={() => applyPreset('volcanic')}
                className="p-3 bg-[#121215] border border-[#222] hover:border-[#FF5722]/50 rounded-lg text-left transition-all hover:bg-[#15151b] group focus:outline-none"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-white uppercase font-mono group-hover:text-[#FF5722]">Active Volcanic Dome</span>
                  <span className="text-[8px] font-mono bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded uppercase font-black">High Stress</span>
                </div>
                <p className="text-[10px] text-gray-500 font-mono">Obsidian flow crusts, pyrite magma intrusions, and an active basalt heat bed with hydrothermal telemetry probe data points.</p>
              </button>

              <button
                onClick={() => applyPreset('ocean')}
                className="p-3 bg-[#121215] border border-[#222] hover:border-[#FF5722]/50 rounded-lg text-left transition-all hover:bg-[#15151b] group focus:outline-none"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-white uppercase font-mono group-hover:text-[#FF5722]">Subsea Hydrocarbon Reservoir</span>
                  <span className="text-[8px] font-mono bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded uppercase font-black">Marine</span>
                </div>
                <p className="text-[10px] text-gray-500 font-mono">Ocean muds, carbonate gas shales, and porous oil reservoir sandstones with electromagnetic sensor grids.</p>
              </button>

              <button
                onClick={() => applyPreset('fault')}
                className="p-3 bg-[#121215] border border-[#222] hover:border-[#FF5722]/50 rounded-lg text-left transition-all hover:bg-[#15151b] group focus:outline-none"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-white uppercase font-mono group-hover:text-[#FF5722]">Tectonic Thrust Fault</span>
                  <span className="text-[8px] font-mono bg-fuchsia-500/10 text-fuchsia-400 px-1.5 py-0.5 rounded uppercase font-black">Tectonic</span>
                </div>
                <p className="text-[10px] text-gray-500 font-mono">Fractured limestone and heavy shear-displacement granite basement with active fault slip monitors.</p>
              </button>
            </div>
          </div>
        )}

        {/* Tab 4: FILE TEXT RAW IMPORT */}
        {activeTab === 'import' && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label className="flex items-center gap-1.5 text-[10px] font-bold text-[#aaa] font-mono uppercase tracking-widest mb-2">
                <FileText size={12} className="text-[#FF5722]" />
                CSV / Raw Matrix Input
              </label>
              <textarea
                className="w-full h-44 bg-[#0a0a0c] border border-[#222] text-[#00FF66] p-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FF5722] focus:border-[#FF5722] transition-all resize-none text-[10px] font-mono mb-3 shadow-inner custom-scrollbar"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="X_coordinate, Y_coordinate, Z_coordinate, #HEX_Color, label_type"
              />
              <button 
                onClick={handleSyncTextarea}
                className="w-full py-2.5 bg-[#FF5722] hover:bg-[#ff4400] text-white shadow-md rounded font-bold font-mono tracking-widest text-[10px] transition-all focus:outline-none"
              >
                PARSE & PLOT TELEMETRY
              </button>
            </div>

            <div className="border-t border-[#222] pt-4">
              <label className="block text-[10px] font-bold text-[#aaa] font-mono uppercase tracking-widest mb-2">Standard Disk Import</label>
              <button className="relative w-full py-2.5 bg-[#121215] hover:bg-[#16161c] text-white border border-[#222] hover:border-[#FF5722] rounded transition-all flex items-center justify-center gap-2 text-[10px] font-bold font-mono tracking-widest">
                <Upload size={12} className="text-[#FF5722]" />
                <span>UPLOAD CSV / .LAS</span>
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept=".csv,.las" onChange={handleFileUpload} />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Footer system diagnostics */}
      <div className="p-3 bg-[#0a0a0c] border-t border-[#222] flex items-center justify-between text-[8px] font-mono text-gray-500 uppercase tracking-wider">
        <span className="flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-[#00FF66] animate-pulse"></span>
          SYS ACTIVE
        </span>
        <span>MAPPED POINTS: {points.length}</span>
        <span>STRATA: {layers.length}</span>
      </div>
    </div>
  );
}
