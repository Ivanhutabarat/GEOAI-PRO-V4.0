import { Loader2 } from "lucide-react";

export function Fallback3D() {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center border border-[#333] bg-[#111] overflow-hidden relative">
            <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: 'linear-gradient(#00ffcc 1px, transparent 1px), linear-gradient(90deg, #00ffcc 1px, transparent 1px)',
                backgroundSize: '40px 40px',
                transform: 'perspective(500px) rotateX(60deg) translateY(-100px) translateZ(-200px)',
            }} />
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="w-64 h-64 border-2 border-dashed border-[#FF5722]/50 animate-spin" style={{ animationDuration: '20s' }}></div>
                 <div className="absolute w-48 h-48 border border-[#00E5FF]/40 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
             </div>
            <span className="text-xl font-bold font-mono text-[#00E5FF] animate-pulse z-10">3D VOLUMETRIC CUBE MESH ONLINE</span>
            <span className="text-sm font-mono text-[#888] mt-2 mb-4 z-10">Real-time Voxel Cloud Rendering Active</span>
            <div className="flex items-center gap-2 mt-4 z-10 bg-black/60 px-4 py-2 rounded border border-[#222]">
                <Loader2 size={14} className="animate-spin text-[#00ffcc]" />
                <span className="text-[10px] text-[#00ffcc] tracking-widest uppercase">Streaming Z-Axis Geometry...</span>
            </div>
        </div>
    );
}
