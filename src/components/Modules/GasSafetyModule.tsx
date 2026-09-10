import React from 'react';

interface ModuleProps {
  data: any;
}

export const GasSafetyModule: React.FC<ModuleProps> = React.memo(({ data }) => {
  if (!data?.payload) return <div className="text-gray-500 text-xs">Awaiting gas data...</div>;
  const isEmergency = data.payload.h2s_level > 50; // Mock emergency logic
  
  return (
    <div className={`p-4 border rounded-xl transition-all ${isEmergency ? 'bg-orange-950/40 border-orange-500 animate-pulse' : 'bg-zinc-900 border-zinc-800'}`}>
      <h3 className="text-sm font-semibold text-zinc-200">⚠️ GAS SAFETY MODULE</h3>
      <div className="mt-2 text-xs text-zinc-400">
        <p>H2S Level: <span className={`font-mono font-bold ${isEmergency ? 'text-orange-400' : 'text-emerald-400'}`}>{data.payload.h2s_level ?? 0} ppm</span></p>
      </div>
      {isEmergency && (
        <div className="mt-2 text-[10px] bg-orange-600 text-white font-bold px-2 py-0.5 rounded text-center">
          ☢️ EVACUATION WARNING: TOXIC H2S GAS DETECTED
        </div>
      )}
    </div>
  );
});
