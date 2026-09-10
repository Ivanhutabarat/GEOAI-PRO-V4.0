import React from 'react';
import { Loader2 } from 'lucide-react';

export const ModuleSkeleton = ({ name }: { name?: string }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 h-full min-h-[400px] bg-[#111] border border-zinc-900 rounded-xl">
      <Loader2 className="w-8 h-8 text-[#FF5722] animate-spin mb-4" />
      <h3 className="text-zinc-300 font-mono text-sm tracking-widest uppercase animate-pulse">
        Initializing {name || 'Module'}...
      </h3>
      <div className="mt-8 w-full max-w-md space-y-4">
        <div className="h-4 bg-zinc-900 rounded animate-pulse w-3/4 mx-auto"></div>
        <div className="h-4 bg-zinc-900 rounded animate-pulse w-1/2 mx-auto"></div>
        <div className="h-32 bg-zinc-900 rounded animate-pulse w-full mt-6"></div>
      </div>
    </div>
  );
};
