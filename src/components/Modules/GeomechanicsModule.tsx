import React from 'react';

interface ModuleProps {
  data: any;
}

export const GeomechanicsModule: React.FC<ModuleProps> = React.memo(({ data }) => {
  if (!data?.payload) return <div className="text-gray-500 text-xs">Awaiting geomechanics data...</div>;
  
  const porePressure = data.payload.pore_pressure ?? 0;
  const fractureGradient = data.payload.fracture_gradient ?? 0;
  const isFractureRisk = porePressure > fractureGradient;
  
  return (
    <div className={`p-4 border rounded-xl transition-all ${isFractureRisk ? 'bg-amber-950/40 border-amber-500' : 'bg-zinc-900 border-zinc-800'}`}>
      <h3 className="text-sm font-semibold text-zinc-200">⚙️ GEOMECHANICS MODULE</h3>
      <div className="mt-2 text-xs text-zinc-400">
        <p>Pore Pressure: <span className="text-zinc-100 font-mono">{porePressure}</span></p>
        <p>Fracture Gradient: <span className="text-zinc-100 font-mono">{fractureGradient}</span></p>
      </div>
      {isFractureRisk && (
        <div className="mt-2 text-[10px] bg-amber-600 text-black font-bold px-2 py-0.5 rounded text-center">
          ⚡ RISK: HIGH PORE PRESSURE - FRACTURE IMMINENT
        </div>
      )}
    </div>
  );
});
