import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { normalizeRawData } from '../../lib/dynamicParser';

interface DynamicChartProps {
  data: any[];
}

const COLORS = ["#FF5722", "#2196F3", "#00E676", "#FFD600", "#E040FB", "#00E5FF", "#FF3D00"];

export default function DynamicChart({ data }: DynamicChartProps) {
  const { xAxisKey, availableKeys } = normalizeRawData(data, 'auto');

  if (!data || data.length === 0) {
    return <div className="text-gray-500 font-mono text-center p-4">No data available to render.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
        <XAxis 
          dataKey={xAxisKey} 
          stroke="#888" 
          fontSize={10} 
          label={{ value: xAxisKey.toUpperCase(), position: 'insideBottom', fill: '#888', fontSize: 10 }} 
        />
        <YAxis 
          stroke="#888" 
          fontSize={10} 
        />
        <Tooltip 
          contentStyle={{ backgroundColor: '#111', borderColor: '#333', fontSize: '12px', fontFamily: 'monospace' }} 
        />
        <Legend wrapperStyle={{ fontSize: '10px' }} />
        {availableKeys.map((key, index) => (
          <Line 
            key={key} 
            type="monotone" 
            dataKey={key} 
            name={key.replace(/_/g, ' ').toUpperCase()} 
            stroke={COLORS[index % COLORS.length]} 
            strokeWidth={2} 
            dot={false} 
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
