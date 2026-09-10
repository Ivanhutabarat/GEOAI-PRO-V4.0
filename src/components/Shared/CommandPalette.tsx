import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Terminal, Crosshair, Map as MapIcon, Globe, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GeoModule } from '../../cores/live/types';
import { useGlobalGeoContext } from '../../cores/live/context/GlobalGeoContext';

export const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { setDrillCoordinates } = useGlobalGeoContext();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const executeCommand = (cmdStr: string) => {
    const cmd = cmdStr.toLowerCase().trim();
    
    // Command Parser
    if (cmd.startsWith('goto ')) {
      // Simulate jumping to coordinates
      const coords = cmd.replace('goto ', '').split(',');
      if (coords.length >= 2) {
        setDrillCoordinates?.({
          x: parseFloat(coords[1].trim()), // LNG
          y: parseFloat(coords[0].trim()), // LAT
          z: 0
        });
      }
      navigate(`/${GeoModule.SPATIAL}`);
    } else if (cmd.includes('track ip') || cmd.includes('osint') || cmd.includes('exif')) {
       navigate(`/${GeoModule.OSINT}`);
    } else if (cmd.includes('seismic')) {
       navigate(`/${GeoModule.SEISMIC}`);
    } else if (cmd.includes('dashboard') || cmd.includes('home')) {
       navigate(`/${GeoModule.DASHBOARD}`);
    }
    
    setQuery('');
    setIsOpen(false);
  };

  const handleExecute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    executeCommand(query);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-start justify-center pt-[20vh]"
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.95, y: -20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: -20 }}
            className="w-full max-w-2xl bg-[#0f0f11] border border-[#333] shadow-2xl rounded-xl overflow-hidden flex flex-col font-mono"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleExecute} className="flex items-center px-4 py-4 border-b border-[#222] bg-[#1a1a1d]">
              <Terminal className="text-cyan-500 w-5 h-5 mr-3" />
              <input 
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter command (e.g., > goto -6.20, 106.81, > track ip 8.8.8.8)..."
                className="w-full bg-transparent border-none text-white text-sm focus:outline-none placeholder:text-neutral-600"
              />
              <div className="text-[10px] text-neutral-500 border border-neutral-700 px-2 py-0.5 rounded ml-2 whitespace-nowrap bg-black/50">ESC to close</div>
            </form>
            
            <div className="p-2 bg-[#0f0f11]">
               <div className="text-[10px] text-neutral-500 uppercase tracking-widest px-3 py-2 font-bold mb-1">Suggested Global Commands</div>
               
               <button type="button" onClick={() => executeCommand('goto -6.20, 106.81')} className="w-full text-left px-3 py-2.5 hover:bg-[#1a1a1d] hover:border-l-2 hover:border-cyan-500 rounded-r text-xs text-gray-300 flex items-center gap-3 transition-all">
                 <Crosshair size={14} className="text-cyan-500" /> 
                 <span><span className="text-cyan-400 font-bold">goto</span> -6.20, 106.81 (Focus Spatial Map to Jakarta)</span>
               </button>

               <button type="button" onClick={() => executeCommand('track ip 8.8.8.8')} className="w-full text-left px-3 py-2.5 hover:bg-[#1a1a1d] hover:border-l-2 hover:border-emerald-500 rounded-r text-xs text-gray-300 flex items-center gap-3 transition-all">
                 <Globe size={14} className="text-emerald-500" /> 
                 <span><span className="text-emerald-400 font-bold">track ip</span> 8.8.8.8 (Open OSINT Network Trace)</span>
               </button>

               <button type="button" onClick={() => executeCommand('osint')} className="w-full text-left px-3 py-2.5 hover:bg-[#1a1a1d] hover:border-l-2 hover:border-red-500 rounded-r text-xs text-gray-300 flex items-center gap-3 transition-all">
                 <ShieldAlert size={14} className="text-red-500" /> 
                 <span><span className="text-red-400 font-bold">open</span> Geo-OSINT Radar & EXIF Forensics</span>
               </button>

               <button type="button" onClick={() => executeCommand('dashboard')} className="w-full text-left px-3 py-2.5 hover:bg-[#1a1a1d] hover:border-l-2 hover:border-orange-500 rounded-r text-xs text-gray-300 flex items-center gap-3 transition-all">
                 <MapIcon size={14} className="text-orange-500" /> 
                 <span><span className="text-orange-400 font-bold">return</span> to Central Command Dashboard</span>
               </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
