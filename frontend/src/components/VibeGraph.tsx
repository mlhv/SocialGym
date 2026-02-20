import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';

interface VibeGraphProps {
    data: { score: number; index: number }[];
}

export const VibeGraph: React.FC<VibeGraphProps> = ({ data }) => {
  return (
    <div className="w-full h-64 bg-white p-4 rounded-lg shadow-md border border-gray-200">
      <h3 className="text-gray-500 text-xs font-bold uppercase mb-2">Real-time Vibe Check</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="index" hide />
          <YAxis domain={[0, 100]} hide />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            formatter={(value: number | undefined) => [`${value}%`, 'Vibe Score']}
            labelFormatter={() => ''}
          />
          <ReferenceLine y={50} stroke="red" strokeDasharray="3 3" label="Danger Zone" />
          <Line 
            type="monotone" 
            dataKey="score" 
            stroke="#2563eb" 
            strokeWidth={3}
            dot={{ r: 4, fill: '#2563eb' }}
            activeDot={{ r: 6 }}
            isAnimationActive={false} // Disable animation for instant real-time updates
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};