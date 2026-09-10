import { processIncomingData } from '../Shared/SwarmRoom';
import { forceMapData, DebugDump } from '../../../../lib/forceRenderMapper';
import React, { useState, useRef, useEffect } from 'react';
import { Bot, Users, Sparkles, Shield, Cpu, Play, CheckCircle2, Globe2, Activity, MessageSquare, Send, Loader2 } from 'lucide-react';
import { useGlobalGeoContext } from '../../context/GlobalGeoContext';
import ReactMarkdown from 'react-markdown';

import { useApiQueue } from '../../hooks/useApiQueue';
import { getEffectiveApiKey } from '../../config/apiConfig';

export default function MasterGeoSynthesizer() {
  const [activeTab, setActiveTab] = useState<'roster' | 'parameters' | 'context' | 'chat'>('chat');
  const { globalData,  rawPayloads, addLog  } = useGlobalGeoContext();
  const { fetchQueued } = useApiQueue();
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai', content: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("geoai_consultant_chat");
      if (saved) {
        setChatHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.warn("Could not load persistent consultant chat:", e);
    }
  }, []);

  useEffect(() => {
    try {
      if (chatHistory.length > 0) {
        localStorage.setItem("geoai_consultant_chat", JSON.stringify(chatHistory));
      }
    } catch (e) {
      console.warn("Could not save persistent consultant chat:", e);
    }
  }, [chatHistory]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isSynthesizing]);

  const handleChatSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatInput.trim()) return;

    const newChat: { role: 'user' | 'ai', content: string }[] = [...chatHistory, { role: 'user', content: chatInput }];
    setChatHistory(newChat);
    setChatInput('');
    setIsSynthesizing(true);

    try {
      const res = await fetchQueued('/api/master-synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: chatInput,
          globalData: rawPayloads,
          history: chatHistory.slice(-5)
        })
      });
      const data = await res.json();
      if (data.success) {
        setChatHistory([...newChat, { role: 'ai', content: data.reply }]);
      } else {
        addLog({
          type: 'ERROR',
          source: 'Synthesizer API',
          message: data.error,
          rawData: data
        });
        setChatHistory([...newChat, { role: 'ai', content: "*System calibration error. Diagnostics logged.*" }]);
      }
    } catch (err: any) {
      addLog({
        type: 'ERROR',
        source: 'Synthesizer API',
        message: err.message || "Network Error",
        rawData: err
      });
      setChatHistory([...newChat, { role: 'ai', content: "*System calibration error. Diagnostics logged.*" }]);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const specialists = [
    { name: "Dr. Marcus Vance", avatar: "GV", role: "Senior Geophysicist", model: "Inversion Engine // gemini-3.5-flash", personality: "Precise, mathematical.", focus: "Structural Anomalies" },
    { name: "Dr. Elena Rostova", avatar: "GR", role: "Structural Geologist", model: "Stratigraphy Core", personality: "Mineral-focused, qualitative.", focus: "Lithology" },
    { name: "Mr. Kenji Takahashi", avatar: "KT", role: "Resource Economist", model: "Financial Model", personality: "Statistical, risk-avoiding.", focus: "Drilling ROI" },
    { name: "Dr. Sarah Lin", avatar: "PT", role: "Petrophysicist", model: "Log Analyzer", personality: "Analytical, log-centric.", focus: "Porosity & Permeability" },
    { name: "Dr. David Chen", avatar: "SM", role: "Seismologist", model: "Acoustic Engine", personality: "Waveform obsessed.", focus: "Wiggle Traces & Tremors" },
    { name: "Dr. Aisha Rahman", avatar: "GC", role: "Geochemist", model: "Spectroscopy Node", personality: "Chemical, precise.", focus: "Mineral Alteration" },
    { name: "Eng. Carlos Mendez", avatar: "DE", role: "Drilling Engineer", model: "Mechanical Model", personality: "Operational, mechanical.", focus: "Wellbore Stability" },
    { name: "Capt. Robert Hayes", avatar: "HSE", role: "Safety Officer", model: "Risk Analyzer", personality: "Protective, compliance-driven.", focus: "Operational Safety" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold uppercase italic font-mono text-white flex items-center gap-3">
            <Globe2 className="text-[#FF5722]" />
            Master Geo-Synthesizer Core
          </h1>
          <p className="text-xs text-[#888888] font-mono mt-1 uppercase">Global Context Manager & Swarm Persona Cognitive Routing Parameters</p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-black/40 border border-[#33] px-3 py-1.5 rounded text-[#888] font-mono">
          <Cpu className="text-green-500 animate-pulse" size={14} />
          <span>SWARM_LINK: ACTIVE (3 NODES)</span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8 space-y-4">
          <div className="geo-card">
            <div className="flex justify-between items-center mb-6 border-b border-[#222] pb-3">
              <span className="text-xs font-mono font-extrabold uppercase tracking-widest text-[#888] flex items-center gap-1.5">
                <Users size={14} className="text-[#FF5722]" />
                ACTIVE SPECIALIST DEBATERS ROSTER
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setActiveTab('roster')}
                  className={`px-3 py-1 text-[10px] font-mono rounded ${activeTab === 'roster' ? 'bg-[#FF5722] text-black font-bold' : 'bg-white/5 text-[#888]'}`}
                >
                  Roster Profiles
                </button>
                <button 
                  onClick={() => setActiveTab('parameters')}
                  className={`px-3 py-1 text-[10px] font-mono rounded ${activeTab === 'parameters' ? 'bg-[#FF5722] text-black font-bold' : 'bg-white/5 text-[#888]'}`}
                >
                  System Instructions
                </button>
                <button 
                  onClick={() => setActiveTab('context')}
                  className={`px-3 py-1 text-[10px] font-mono rounded border border-[#FF5722]/30 flex items-center gap-1 ${activeTab === 'context' ? 'bg-[#FF5722] text-black font-bold' : 'bg-black text-[#FF5722]'}`}
                >
                  <Activity size={10} />
                  Global Context
                </button>
                <button 
                  onClick={() => setActiveTab('chat')}
                  className={`px-3 py-1 text-[10px] font-mono rounded border border-[#FF5722] flex items-center gap-1 ${activeTab === 'chat' ? 'bg-[#FF5722] text-black font-bold' : 'bg-[#FF5722]/10 text-[#FF5722]'}`}
                >
                  <MessageSquare size={10} />
                  Core Chat
                </button>
              </div>
            </div>

            {activeTab === 'chat' && (
              <div className="flex flex-col h-[400px] border border-[#222] rounded-lg bg-black/60 overflow-hidden">
                <div 
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/5"
                >
                  {chatHistory.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-[#555] font-mono text-xs space-y-2">
                      <Globe2 size={24} className="text-[#333]" />
                      <p>Master Core Intelligence initialized.</p>
                      <p>[STANDBY - IDLE STATE]</p>
                    </div>
                  )}
                  {chatHistory.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded p-3 text-[11px] font-mono leading-relaxed ${
                        msg.role === 'user' ? 'bg-[#FF5722] text-black' : 'bg-[#111] text-gray-300 border border-[#333] markdown-body'
                      }`}>
                        {msg.role === 'user' ? (
                          msg.content
                        ) : (
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        )}
                      </div>
                    </div>
                  ))}
                  {isSynthesizing && (
                    <div className="flex justify-start">
                      <div className="max-w-[85%] rounded p-3 text-[11px] font-mono leading-relaxed bg-[#111] text-green-400 border border-[#222] flex items-center gap-2">
                        <Loader2 size={12} className="animate-spin" />
                        SYNTHESIZING CROSS-METHOD DATA...
                      </div>
                    </div>
                  )}
                </div>
                <form onSubmit={handleChatSubmit} className="p-3 border-t border-[#222] bg-black/80 flex gap-2">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask Supreme Core to cross-reference dataset..."
                    className="flex-1 bg-white/5 border border-[#333] rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#FF5722]/50 placeholder-gray-600"
                    disabled={isSynthesizing}
                  />
                  <button 
                    type="submit"
                    disabled={!chatInput.trim() || isSynthesizing}
                    className="bg-[#FF5722] disabled:opacity-50 text-black px-4 py-2 rounded flex items-center justify-center hover:bg-[#ff7043] transition-colors"
                  >
                    <Send size={14} />
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'roster' && (
              <div className="space-y-4">
                {specialists.map((sp) => (
                  <div key={sp.name} className="p-4 bg-black/40 border border-[#222] rounded-lg relative overflow-hidden flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#111] border border-[#FF5722]/30 flex items-center justify-center text-[#FF5722] font-mono font-black text-sm shrink-0">
                      {sp.avatar}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-white">{sp.name}</span>
                        <span className="bg-[#FF5722]/10 border border-[#FF5722]/25 px-2 py-0.5 rounded text-[8.5px] font-mono text-[#FF5722] uppercase font-bold">{sp.role}</span>
                      </div>
                      <p className="text-xs text-[#888888] font-mono">{sp.personality}</p>
                      <div className="text-[10px] text-[#555] font-mono flex items-center gap-1.5 pt-1">
                        <Sparkles size={11} className="text-orange-400" />
                        Focus Area: {sp.focus}
                      </div>
                    </div>
                    <div className="absolute right-3 top-3 text-[8.5px] font-mono text-[#444]">{sp.model}</div>
                  </div>
                ))}
              </div>
            )}
            
            {activeTab === 'parameters' && (
              <div className="space-y-4 font-mono text-[11px] leading-relaxed text-[#888] p-2">
                <div className="p-4 bg-black/40 border border-[#222] rounded-lg">
                  <span className="font-bold text-white block mb-2 uppercase text-xs">Dr. Marcus Vance (Geophysics Engine)</span>
                  <pre className="whitespace-pre-wrap text-[10px] bg-black/80 p-3 rounded text-[#aaa] border border-[#111]">
                    {`System instruction: You are acting as Dr. Marcus Vance, a rigorous Senior Geophysicist. 
Analyze all inputs specifically for acoustic wiggles, RMS residual noise levels, dipoles inversions, 
and hyperbola reflectors. Keep replies brief, fully technical, and highly precise.`}
                  </pre>
                </div>

                <div className="p-4 bg-black/40 border border-[#222] rounded-lg">
                  <span className="font-bold text-white block mb-2 uppercase text-xs">Dr. Elena Rostova (Stratigraphy Core)</span>
                  <pre className="whitespace-pre-wrap text-[10px] bg-black/80 p-3 rounded text-[#aaa] border border-[#111]">
                    {`System instruction: You are Dr. Elena Rostova, an elite Structural Geologist.
Correlate geophysics anomalies directly back with stratigraphic rock horizons, syncline formations, 
and sand/sandy-clay core parameters. Focus on mineral classifications.`}
                  </pre>
                </div>
              </div>
            )}

            {activeTab === 'context' && (
              <div className="space-y-4 font-mono text-[11px] leading-relaxed text-[#888] p-2">
                <p className="text-xs">
                  The Master Consultant reads data across all modules simultaneously to generate synthesized insights (e.g., cross-referencing gravity high anomalies with electrical low-resistivity anomalies to flag sulphide deposits).
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(rawPayloads).map(([key, value]) => {
                    if (!value) return null;
                    return (
                      <div key={key} className="p-3 bg-black/40 border border-[#FF5722]/30 rounded-lg">
                        <span className="font-bold text-[#FF5722] block mb-2 uppercase text-[10px]">{key} <span className="text-[#888]">({value.length} chars)</span></span>
                        <div className="h-20 overflow-y-auto text-[9px] text-[#777] bg-black p-2 border border-[#222] rounded">
                          {value}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {Object.values(rawPayloads).every(v => !v) && (
                  <div className="p-4 border border-dashed border-[#444] rounded text-center text-gray-500">
                    No global module data ingested yet. Paste raw data into any module to populate the Swarm Context.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Cognitive coordination guidelines */}
        <div className="col-span-4 space-y-4">
          <div className="geo-card block">
            <h3 className="text-xs uppercase font-mono font-bold tracking-widest text-[#888] mb-4">DYNAMIC COORDINATION</h3>
            <div className="space-y-3 text-xs leading-normal">
              <p className="text-[#888]">
                Master Geo-Synthesizer handles automated orchestration of global inquiries. It evaluates the combined data of all active modules via GlobalGeoContext.
              </p>
              <div className="p-3 bg-white/5 border border-[#333] rounded text-[10px] font-mono text-[#aaa]">
                <span className="font-bold text-[#FF5722] block mb-1">GLOBAL SYNTHESIS INJECTION:</span>
                Raw arrays from Electrical, Gravity, and Spatial modules are injected into Swarm memory automatically.
              </div>
              <div className="flex items-center gap-2 text-xs text-green-500 font-mono">
                <CheckCircle2 size={13} />
                <span>Context Inverted: Global Multi-discipline</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
