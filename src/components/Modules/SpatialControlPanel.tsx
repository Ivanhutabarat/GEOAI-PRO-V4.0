// src/components/Modules/SpatialControlPanel.tsx
import React, { useState } from 'react';
import { useGeoDataStore } from '../../store/GeoDataStore';
import { Upload, Database, X, MapPin } from 'lucide-react';

export default function SpatialControlPanel({ onClose }: { onClose?: () => void }) {
  const [inputText, setInputText] = useState('0, 0, 0, #d4c919\n2, 2, 2, #c93c1e\n-2, -2, -2, #821ec9');
  const setPoints = useGeoDataStore(state => state.setPoints);

  const handleSync = () => {
    try {
      const lines = inputText.split('\n');
      const newPoints = lines.map((line, index) => {
        const parts = line.split(',').map(p => p.trim());
        if (parts.length >= 3) {
          const x = parseFloat(parts[0]);
          const y = parseFloat(parts[1]);
          const z = parseFloat(parts[2]);
          const color = parts[3] || '#333333';
          const type = parts.length > 4 ? parts[4] : 'custom';
          
          if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
             return { id: `manual-${index}`, position: [x, y, z] as [number, number, number], color, type };
          }
        }
        return null;
      }).filter(Boolean) as any;
      
      if (newPoints.length > 0) {
        setPoints(newPoints);
      }
    } catch (e) {
      console.error("Failed to parse data", e);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
     if (e.target.files && e.target.files.length > 0) {
        alert(`File ${e.target.files[0].name} imported. (Parsing logic required)`);
     }
  };

  return (
    <div className="absolute top-4 right-4 w-80 bg-white/95 backdrop-blur-md border border-gray-200 rounded-lg shadow-xl z-20 flex flex-col font-sans text-sm text-gray-800">
      <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50/50 rounded-t-lg">
        <div className="flex items-center gap-2 font-bold text-gray-800 tracking-wide">
          <Database size={16} className="text-blue-600" />
          <span>Spatial Data Manager</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
            <X size={16} />
          </button>
        )}
      </div>

      <div className="p-4 space-y-5">
        <div>
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
            <MapPin size={12} />
            Coordinates Input
          </label>
          <textarea
            className="w-full h-32 bg-gray-50 border border-gray-200 text-gray-700 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none text-xs font-mono mb-3 shadow-inner"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="x, y, z, #color"
          />
          <button 
            onClick={handleSync}
            className="w-full py-2.5 bg-blue-600 text-white hover:bg-blue-700 shadow-sm rounded-md transition-colors font-semibold tracking-wide text-xs"
          >
            SYNC TO DIGITAL TWIN
          </button>
        </div>

        <div className="border-t border-gray-100 pt-4">
           <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Batch Import</label>
           <button className="relative w-full py-2.5 bg-white text-gray-700 border border-gray-300 hover:border-blue-500 hover:text-blue-600 shadow-sm rounded-md transition-colors flex items-center justify-center gap-2 text-xs font-semibold group">
             <Upload size={14} className="group-hover:text-blue-600 text-gray-500" />
             <span>Upload .SHP / .CSV</span>
             <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept=".csv,.shp" onChange={handleFileUpload} />
           </button>
        </div>
      </div>
    </div>
  );
}
