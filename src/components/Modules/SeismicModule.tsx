import React from 'react';

interface ModuleProps {
  data: any;
}

export const SeismicModule: React.FC<ModuleProps> = React.memo(({ data }) => {
  if (!data?.payload) return <div className="text-gray-500 text-xs">Awaiting data...</div>;
  const isBrightSpot = data.payload.amplitudo <= -0.90;
  
  return (
    <div className={`p-4 border rounded-xl transition-all ${isBrightSpot ? 'bg-red-950/40 border-red-500 animate-pulse' : 'bg-zinc-900 border-zinc-800'}`}>
      <h3 className="text-sm font-semibold text-zinc-200">🌊 SEISMIC AMPLITUDE MODULE</h3>
      <div className="mt-2 text-xs text-zinc-400">
        <p>CMP ID: <span className="text-zinc-100 font-mono">{data.payload.cmp_id}</span></p>
        <p>Amplitude: <span className={`font-mono font-bold ${isBrightSpot ? 'text-red-400' : 'text-emerald-400'}`}>{data.payload.amplitudo}</span></p>
      </div>
      {isBrightSpot && (
        <div className="mt-2 text-[10px] bg-red-600 text-white font-bold px-2 py-0.5 rounded text-center">
          🚨 CRITICAL ALERT: BRIGHT SPOT / GAS TRAP DETECTED
        </div>
      )}
    </div>
  );
});
