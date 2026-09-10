import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Share2, Copy, Check, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useGlobalGeoContext } from '../../context/GlobalGeoContext';
import { cn } from '../../lib/utils';

export default function ShareWorkspaceModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { globalData, seismicMode } = useGlobalGeoContext();
  const [copied, setCopied] = useState(false);
  
  // Generate compressed state URL
  const shareUrl = React.useMemo(() => {
    if (!isOpen) return '';
    try {
      // Create a snapshot of critical parameters
      const snapshot = {
        sm: seismicMode,
        // Only sharing essential metadata to keep URL length reasonable for QR code
        ts: Date.now(),
        vd: globalData.lastUpdate,
      };
      
      const jsonString = JSON.stringify(snapshot);
      // Convert to base64
      const base64 = btoa(jsonString);
      
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('state', base64);
      return currentUrl.toString();
    } catch (e) {
      console.error("Failed to generate share link", e);
      return window.location.href;
    }
  }, [isOpen, globalData, seismicMode]);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#111] border border-[#333] rounded-xl w-full max-w-md overflow-hidden shadow-2xl"
        >
          <div className="flex items-center justify-between p-4 border-b border-[#222] bg-[#161616]">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-widest font-mono">
              <Share2 size={16} className="text-[#00E5FF]" />
              Share Workspace State
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>
          
          <div className="p-6 flex flex-col items-center gap-6">
            <p className="text-xs text-gray-400 text-center font-mono">
              Scan QR code or share link to replicate current analysis state.
            </p>
            
            <div className="bg-white p-4 rounded-xl border-4 border-[#222]">
              <QRCodeSVG 
                value={shareUrl} 
                size={200}
                level="L"
                includeMargin={false}
              />
            </div>
            
            <div className="w-full space-y-2">
              <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Encrypted Link</label>
              <div className="flex bg-black border border-[#333] rounded overflow-hidden">
                <input 
                  type="text" 
                  readOnly 
                  value={shareUrl}
                  className="flex-1 bg-transparent px-3 py-2 text-xs text-gray-300 font-mono focus:outline-none"
                />
                <button 
                  onClick={handleCopy}
                  className={cn(
                    "px-4 flex items-center justify-center transition-colors border-l border-[#333]",
                    copied ? "bg-green-900/50 text-green-400" : "bg-[#222] text-gray-400 hover:text-white hover:bg-[#333]"
                  )}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}