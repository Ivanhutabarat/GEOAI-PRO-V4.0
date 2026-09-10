import React, { useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { normalizeRawData } from '../../../../lib/dynamicParser';
import { forceMapData } from '../../../../lib/forceRenderMapper';

const CURVE_COLORS = ['#f97316', '#22c55e', '#0ea5e9', '#eab308', '#a855f7', '#9ca3af', '#ef4444', '#3b82f6'];

export default function DynamicChart({ data, type = 'line', moduleType = 'general' }: { data: any[], type?: 'line' | 'area', moduleType?: string }) {
  const parsedData = forceMapData(data || []);
  
  const { xAxisKey, availableKeys } = useMemo(() => normalizeRawData(parsedData, moduleType), [parsedData, moduleType]);
  
  if (!parsedData || parsedData.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center border border-[#333] bg-black/20 rounded text-[#555] font-mono text-sm">
        [NO DATA TO RENDERING]
      </div>
    );
  }

  const activeCurves = availableKeys.slice(0, 8);

  return (
    <ResponsiveContainer width="100%" height="100%">
      {type === 'area' ? (
        <AreaChart data={parsedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#222" />
          <XAxis dataKey={xAxisKey} stroke="#555" fontSize={10} />
          <YAxis stroke="#555" fontSize={10} />
          <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#fff' }} />
          <Legend verticalAlign="top" height={24} />
          {activeCurves.map((key, i) => (
            <Area 
              key={key} 
              type="monotone" 
              dataKey={key} 
              stroke={CURVE_COLORS[i % CURVE_COLORS.length]} 
              fill={CURVE_COLORS[i % CURVE_COLORS.length]}
              fillOpacity={0.3}
              name={key} 
            />
          ))}
        </AreaChart>
      ) : (
        <LineChart data={parsedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#222" />
          <XAxis dataKey={xAxisKey} stroke="#555" fontSize={10} />
          <YAxis stroke="#555" fontSize={10} />
          <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#fff' }} />
          <Legend verticalAlign="top" height={24} />
          {activeCurves.map((key, i) => (
            <Line 
              key={key} 
              type="monotone" 
              dataKey={key} 
              stroke={CURVE_COLORS[i % CURVE_COLORS.length]} 
              strokeWidth={2} 
              dot={{ r: 2, fill: CURVE_COLORS[i % CURVE_COLORS.length] }} 
              name={key} 
            />
          ))}
        </LineChart>
      )}
    </ResponsiveContainer>
  );
}
