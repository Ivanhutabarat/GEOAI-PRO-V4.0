import React, { useEffect, useRef } from 'react';
import { Terminal, Trash2 } from 'lucide-react';
import { useGlobalGeoContext } from '../../context/GlobalGeoContext';
import { cn } from '../../lib/utils';

export default function SystemDiagnostics() {
  const { systemLogs, clearLogs } = useGlobalGeoContext();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [systemLogs]);

  return (
    <div className="flex flex-col h-full bg-black border border-[#333333] rounded-lg overflow-hidden font-mono text-xs">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-[#333333] bg-[#111]">
        <div className="flex items-center gap-2 text-[#888]">
          <Terminal size={16} />
          <span className="uppercase tracking-widest font-bold">System Diagnostics</span>
        </div>
        <button
          onClick={clearLogs}
          className="flex items-center gap-1.5 px-3 py-1 bg-[#222] hover:bg-[#333] text-[#888] hover:text-white rounded transition-colors"
        >
          <Trash2 size={14} />
          <span>Clear Terminal</span>
        </button>
      </div>

      {/* Terminal View */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {systemLogs.length === 0 ? (
          <div className="text-[#555] italic">System standby. No diagnostic logs active.</div>
        ) : (
          systemLogs.map((log) => (
            <div key={log.id} className="flex flex-col gap-1 border-b border-[#222] pb-2 last:border-0 last:pb-0">
              <div className="flex items-start gap-4">
                <span className="text-[#555] whitespace-nowrap">[{log.timestamp}]</span>
                <span className={cn(
                  "font-bold uppercase tracking-wider w-16",
                  log.type === 'ERROR' && "text-red-500",
                  log.type === 'WARN' && "text-yellow-500",
                  log.type === 'INFO' && "text-cyan-500"
                )}>
                  {log.type}
                </span>
                <span className="text-white">[{log.source}]</span>
              </div>
              <div className="ml-24 text-gray-300 whitespace-pre-wrap">{log.message}</div>
              {log.rawData && (
                <div className="ml-24 mt-1 bg-[#111] p-2 rounded text-[#888] overflow-x-auto">
                  {typeof log.rawData === 'string' ? log.rawData : JSON.stringify(log.rawData, null, 2)}
                </div>
              )}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
