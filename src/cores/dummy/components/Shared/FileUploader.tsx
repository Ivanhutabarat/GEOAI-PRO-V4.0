import React, { useState, useCallback } from 'react';
import { 
  Upload, 
  File, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Cloud,
  Globe,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GeoFileType } from '../../types';
import { cn } from '../../lib/utils';
import GeoAILogo from './GeoAILogo';
import { BRANDING } from '../../constants/BrandingConstants';

interface FileUploaderProps {
  onUpload: (files: File[]) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function FileUploader({ onUpload, isOpen, onClose }: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFiles = Array.from(e.dataTransfer.files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const startUpload = () => {
    setUploading(true);
    setTimeout(() => {
      onUpload(selectedFiles);
      setUploading(false);
      onClose();
      setSelectedFiles([]);
    }, 2000); // Simulate upload latency
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-2xl bg-[#1A1A1A] border border-[#333333] rounded-lg shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b border-[#333333] flex justify-between items-center bg-[#222]">
          <div className="flex items-center gap-2">
            <GeoAILogo size={24} glow={true} />
            <div>
              <h2 className="text-xl font-bold text-white uppercase italic tracking-tighter/90">Raw Data Ingestion</h2>
              <p className="text-[10px] text-[#888888] font-mono tracking-widest uppercase mt-1">Multi-Format Pipeline // {BRANDING.APP_CREDIT}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 text-[#888888] hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {/* Cloud Source Selector */}
          <div className="grid grid-cols-3 gap-4">
            <CloudSourceButton icon={Cloud} label="AWS S3" />
            <CloudSourceButton icon={Globe} label="Google Cloud" active />
            <CloudSourceButton icon={Database} label="Azure SQL" />
          </div>

          <div 
            className={cn(
              "relative border-2 border-dashed rounded-lg p-12 transition-all duration-200 text-center",
              dragActive ? "border-[#FF5722] bg-[#FF5722]/5" : "border-[#333333] hover:border-[#444444] bg-black/20"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input 
              type="file" 
              multiple 
              onChange={handleChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-[#222] rounded-full flex items-center justify-center mb-4 border border-[#333]">
                <Upload size={24} className="text-[#FF5722]" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1 uppercase tracking-tight">Drag and drop raw files</h3>
              <p className="text-xs text-[#555555] max-w-xs leading-relaxed">
                Supports .segy, .las, .mseed, .shp, .kml, .tiff, .jp2, .nc, .csv, .dat and other geophysics formats.
              </p>
            </div>
          </div>

          {selectedFiles.length > 0 && (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {selectedFiles.map((file, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-black/40 border border-[#333] rounded">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#222] rounded">
                      <File size={14} className="text-[#888888]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-[#AAAAAA]">{file.name}</span>
                      <span className="text-[10px] text-[#555555] font-mono">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                  </div>
                  <button onClick={() => removeFile(i)} className="text-[#555] hover:text-red-500 transition-colors">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 bg-[#222] border-t border-[#333333] flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-2 text-xs font-bold text-[#888888] uppercase hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={startUpload}
            disabled={selectedFiles.length === 0 || uploading}
            className="bg-[#FF5722] text-black px-8 py-2 rounded text-xs font-bold uppercase tracking-tight hover:bg-[#ff7043] transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
            {uploading ? 'Processing Archives...' : 'Ingest to Cloud Store'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function CloudSourceButton({ icon: Icon, label, active = false }: any) {
  return (
    <button className={cn(
        "flex flex-col items-center gap-2 p-3 rounded border transition-all",
        active ? "bg-[#FF5722]/10 border-[#FF5722] text-white" : "bg-black/20 border-[#333333] text-[#555555] hover:border-[#444444]"
    )}>
        <Icon size={18} />
        <span className="text-[10px] font-bold uppercase">{label}</span>
    </button>
  );
}
