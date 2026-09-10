import { processIncomingData } from '../Shared/SwarmRoom';
import { forceMapData, DebugDump } from '../../../../lib/forceRenderMapper';
import React, { useState, useRef, useEffect } from 'react';
import { Bot, Users, Sparkles, Shield, Cpu, Play, CheckCircle2, Globe2, Activity, MessageSquare, Send, Loader2, Volume2, VolumeX, Radio } from 'lucide-react';
import { useGlobalGeoContext } from '../../context/GlobalGeoContext';
import ReactMarkdown from 'react-markdown';
import { cn } from '../../lib/utils';

import { useApiQueue } from '../../hooks/useApiQueue';
import { getEffectiveApiKey } from '../../config/apiConfig';

export default function MasterGeoSynthesizer() {
  const [activeTab, setActiveTab] = useState<'roster' | 'parameters' | 'context' | 'chat'>('chat');
  const { globalData,  rawPayloads, addLog  } = useGlobalGeoContext();
  const { fetchQueued } = useApiQueue();
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai', content: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [frictionLevel, setFrictionLevel] = useState(50);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Walkie-Talkie Speech & Static Sound Synthesis Engine
  const [isRadioCommEnabled, setIsRadioCommEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const radioStaticNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    if (radioStaticNodeRef.current) {
      try {
        radioStaticNodeRef.current.stop();
        radioStaticNodeRef.current.disconnect();
      } catch (e) {}
      radioStaticNodeRef.current = null;
    }
  };

  const playKeyOffSfx = (ctx: AudioContext) => {
    try {
      const bufferSize = ctx.sampleRate * 0.25; // 250ms
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const burst = ctx.createBufferSource();
      burst.buffer = noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 800;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.015, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);

      burst.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      burst.start();

      // Double-click "Over" chirp
      const clickOsc = ctx.createOscillator();
      const clickGain = ctx.createGain();
      clickOsc.type = 'sine';
      clickOsc.frequency.setValueAtTime(500, ctx.currentTime + 0.23);
      clickOsc.frequency.setValueAtTime(400, ctx.currentTime + 0.28);
      
      clickGain.gain.setValueAtTime(0.01, ctx.currentTime + 0.23);
      clickGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.32);

      clickOsc.connect(clickGain);
      clickGain.connect(ctx.destination);
      clickOsc.start(ctx.currentTime + 0.23);
      clickOsc.stop(ctx.currentTime + 0.33);
    } catch (e) {
      console.warn("Key-off sfx error:", e);
    }
  };

  const speakWithWalkieTalkie = (rawText: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    stopSpeaking();

    // Clean up markdown syntax for voice read-out
    let cleanText = rawText
      .replace(/```[\s\S]*?```/g, '') // remove code blocks
      .replace(/`([^`]+)`/g, '$1') // remove inline code
      .replace(/[*#_\-\[\]()]/g, ' ') // remove special markdown chars
      .replace(/\s+/g, ' ')
      .trim();

    if (cleanText.length > 350) {
      cleanText = cleanText.substring(0, 347) + "... Laporan berlanjut secara teks. Over.";
    }

    setIsSpeaking(true);

    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // 1. Play KEY-ON SQUELCH / BEEP CHIRP
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.08);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(440, ctx.currentTime);

      gainNode.gain.setValueAtTime(0.02, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.1);
      osc2.stop(ctx.currentTime + 0.1);

      // 2. Continuous Walkie-Talkie Radio Static/Noise Generator
      const bufferSize = ctx.sampleRate * 2; 
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.value = 1200;
      bandpass.Q.value = 1.0;

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.002, ctx.currentTime);

      whiteNoise.connect(bandpass);
      bandpass.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      whiteNoise.start();
      radioStaticNodeRef.current = whiteNoise;

      // 3. Prepare Speech Utterance
      const utterance = new SpeechSynthesisUtterance(cleanText);
      currentUtteranceRef.current = utterance;

      const voices = window.speechSynthesis.getVoices();
      // Try finding Indonesian, otherwise English
      let selectedVoice = voices.find(v => v.lang.startsWith('id'));
      if (!selectedVoice) {
        selectedVoice = voices.find(v => v.lang.startsWith('en'));
      }
      if (!selectedVoice && voices.length > 0) {
        selectedVoice = voices[0];
      }
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      
      utterance.rate = 1.1; 
      utterance.pitch = 0.9; 

      utterance.onend = () => {
        stopSpeaking();
        playKeyOffSfx(ctx);
      };

      utterance.onerror = () => {
        stopSpeaking();
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error("Failed to play walkie talkie voice:", e);
      setIsSpeaking(false);
    }
  };

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

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

  const triggerScenario = async (title: string, scenarioText: string) => {
    setActiveTab('chat');
    setIsSynthesizing(true);
    const newChat: { role: 'user' | 'ai', content: string }[] = [...chatHistory, { role: 'user', content: scenarioText }];
    setChatHistory(newChat);
    setChatInput('');
    
    // Auto adjust friction based on scenario
    if (title.includes('Siklon')) setFrictionLevel(85);
    else if (title.includes('Sesar')) setFrictionLevel(95);
    else if (title.includes('Blokade')) setFrictionLevel(75);
    else setFrictionLevel(60);

    try {
      const res = await fetchQueued('/api/master-synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: scenarioText,
          globalData: rawPayloads,
          history: chatHistory.slice(-5)
        })
      });
      const data = await res.json();
      if (data.success) {
        setChatHistory([...newChat, { role: 'ai', content: data.reply }]);
        if (isRadioCommEnabled) {
          speakWithWalkieTalkie(data.reply);
        }
      } else {
        addLog({
          type: 'ERROR',
          source: 'Dungeon Master Trigger',
          message: data.error,
          rawData: data
        });
        setChatHistory([...newChat, { role: 'ai', content: "*Dungeon Master Signal Intercepted. Error logged.*" }]);
      }
    } catch (err: any) {
      addLog({
        type: 'ERROR',
        source: 'Dungeon Master Trigger',
        message: err.message || "Network Error",
        rawData: err
      });
      setChatHistory([...newChat, { role: 'ai', content: "*Dungeon Master Signal Intercepted. Error logged.*" }]);
    } finally {
      setIsSynthesizing(false);
    }
  };

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
        if (isRadioCommEnabled) {
          speakWithWalkieTalkie(data.reply);
        }
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
                <div className="flex justify-between items-center bg-[#111] px-4 py-2 border-b border-[#222] text-[10px] font-mono shrink-0 select-none">
                  <div className="flex items-center gap-2">
                    <Radio className={cn("text-[#FF5722]", isSpeaking && "animate-pulse")} size={12} />
                    <span className="text-gray-400">RADIO FREQUENCY: <span className="text-white font-bold">144.80 MHz</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const next = !isRadioCommEnabled;
                        setIsRadioCommEnabled(next);
                        if (!next) {
                          stopSpeaking();
                        } else {
                          addLog({ type: 'INFO', source: 'RADIO', message: 'Radio comm-link speech synthesizer initialized. Static noise effect activated.' });
                        }
                      }}
                      className={cn(
                        "px-2.5 py-1 rounded-sm border transition-all flex items-center gap-1.5 uppercase tracking-wide font-extrabold text-[9px]",
                        isRadioCommEnabled
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                          : "bg-black border-[#333] text-gray-500 hover:text-gray-300"
                      )}
                    >
                      {isRadioCommEnabled ? <Volume2 size={10} /> : <VolumeX size={10} />}
                      {isRadioCommEnabled ? "Radio TTS ON" : "Radio TTS OFF"}
                    </button>
                    {isSpeaking && (
                      <button
                        type="button"
                        onClick={stopSpeaking}
                        className="bg-red-500/10 border border-red-500/30 text-red-400 px-2 py-1 rounded-sm hover:bg-red-500/20 text-[9px] font-bold uppercase animate-pulse"
                      >
                        STOP
                      </button>
                    )}
                  </div>
                </div>

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
                      <div className={`max-w-[85%] rounded p-3 text-[11px] font-mono leading-relaxed relative group ${
                        msg.role === 'user' ? 'bg-[#FF5722] text-black' : 'bg-[#111] text-gray-300 border border-[#333] markdown-body'
                      }`}>
                        {msg.role === 'user' ? (
                          msg.content
                        ) : (
                          <div className="space-y-2">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                            <div className="flex justify-end pt-1.5 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => speakWithWalkieTalkie(msg.content)}
                                className="text-[9px] text-[#FF5722] bg-[#FF5722]/5 hover:bg-[#FF5722]/15 border border-[#FF5722]/20 rounded px-1.5 py-0.5 flex items-center gap-1 transition-all"
                                title="Replay via Radio Walkie-Talkie"
                              >
                                <Radio size={10} />
                                TRANSMIT VOICE
                              </button>
                            </div>
                          </div>
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

        {/* Cognitive coordination guidelines & Dungeon Master Panel */}
        <div className="col-span-4 space-y-4">
          {/* Dungeon Master AI Panel */}
          <div className="geo-card block border border-[#FF5722]/30 relative overflow-hidden bg-black/80">
            {/* Glowing neon orange header border */}
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF5722] to-transparent animate-pulse" />
            
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs uppercase font-mono font-black tracking-wider text-white flex items-center gap-1.5">
                <span className="animate-bounce">🎮</span>
                DUNGEON MASTER AI PANEL
              </h3>
              <span className="text-[8.5px] font-mono text-orange-400 bg-orange-950/40 px-2 py-0.5 rounded border border-orange-500/20 font-bold uppercase">
                Referee Core
              </span>
            </div>
            
            <p className="text-[10px] text-[#888] font-mono leading-relaxed mb-4">
              Trigger benturan kebijakan faksi eksternal (BMKG, SKK Migas, Allianz, Suku Adat) untuk menguji kecerdasan konsensus Swarm secara ekstrem.
            </p>

            {/* Friction Meter */}
            <div className="bg-black/50 border border-[#222] p-3 rounded-lg mb-4 space-y-2">
              <div className="flex justify-between items-center font-mono text-[10px]">
                <span className="text-gray-400">BOARDROOM FRICTION LEVEL:</span>
                <span className={cn(
                  "font-bold uppercase tracking-wider text-xs px-2 py-0.5 rounded",
                  frictionLevel < 35 ? "text-emerald-400 bg-emerald-950/20" :
                  frictionLevel < 70 ? "text-yellow-400 bg-yellow-950/20" :
                  "text-red-400 bg-red-950/20 animate-pulse"
                )}>
                  {frictionLevel}% {
                    frictionLevel < 35 ? "CONSENSUS" :
                    frictionLevel < 70 ? "TENSION" : "CRITICAL"
                  }
                </span>
              </div>
              
              <div className="h-2 bg-[#111] rounded overflow-hidden relative">
                <div 
                  className={cn(
                    "h-full transition-all duration-500 rounded",
                    frictionLevel < 35 ? "bg-emerald-500 shadow-[0_0_10px_#10b981]" :
                    frictionLevel < 70 ? "bg-yellow-500 shadow-[0_0_10px_#f59e0b]" :
                    "bg-red-500 shadow-[0_0_10px_#ef4444]"
                  )}
                  style={{ width: `${frictionLevel}%` }}
                />
              </div>

              <div className="text-[9px] text-gray-500 font-mono italic">
                {frictionLevel < 35 ? "✓ Suasana damai, argumen stabil." :
                 frictionLevel < 70 ? "⚠ Diskusi memanas, kompromi diuji." :
                 "⚡ TOTAL CHAOS - Perdebatan kritis antar faksi!"}
              </div>
            </div>

            {/* Scenario Buttons */}
            <div className="space-y-2">
              <span className="text-[9px] text-[#888] font-mono tracking-widest uppercase block mb-1">
                Trigger Collision Scenario:
              </span>

              <button
                onClick={() => triggerScenario(
                  "Siklon Tropis BMKG (Badai)",
                  "[SCENARIO TRIGGER] BMKG melaporkan Siklon Tropis mendekati koordinat utama dengan kecepatan angin 95 km/jam. Gelombang laut naik hingga 4.5 meter. Ir. Bambang (BMKG) menuntut evakuasi instan seluruh personil, sementara Allianz menolak klaim kerugian finansial (loss of revenue) jika pengeboran dihentikan tanpa adanya deklarasi Force Majeure resmi dari pemerintah. Bagaimana Swarm menyusun langkah mitigasi hukum dan teknis?"
                )}
                className="w-full text-left p-2 rounded bg-[#ff3d00]/10 hover:bg-[#ff3d00]/20 border border-[#ff3d00]/20 hover:border-[#ff3d00]/40 transition-all font-mono space-y-1 block"
                disabled={isSynthesizing}
              >
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-white flex items-center gap-1">
                    ⛈ SIKLON TROPIS BMKG
                  </span>
                  <span className="text-[8px] text-orange-400">EVAKUASI VS ALLIANZ</span>
                </div>
                <p className="text-[8.5px] text-gray-400 leading-tight">
                  Badai menghantam kilang, menuntut evakuasi instan vs penolakan jaminan asuransi.
                </p>
              </button>

              <button
                onClick={() => triggerScenario(
                  "Sesar Graben Aktif",
                  "[SCENARIO TRIGGER] Sensor seismik lokal mencatat getaran tremor terus menerus. Terjadi indikasi pergeseran sesar aktif geser mendatar di kedalaman Grid Y:30 dengan Magnitudo 5.2 SR. Geofisika memperingatkan bahaya geseran yang dapat menghancurkan pipa sumur (Wellbore Collapse), namun Auditor SKK Migas menuntut pengeboran dilanjutkan tanpa henti demi mengejar target pendapatan kuartal IV. Selesaikan friksi ini!"
                )}
                className="w-full text-left p-2 rounded bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 hover:border-amber-500/40 transition-all font-mono space-y-1 block"
                disabled={isSynthesizing}
              >
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-white flex items-center gap-1">
                    🌋 SESAR GRABEN AKTIF
                  </span>
                  <span className="text-[8px] text-amber-400">RUPTURE VS TARGET</span>
                </div>
                <p className="text-[8.5px] text-gray-400 leading-tight">
                  Ancaman gempa merusak casing sumur vs tekanan target devisa SKK Migas.
                </p>
              </button>

              <button
                onClick={() => triggerScenario(
                  "Blokade Adat Suku Alit",
                  "[SCENARIO TRIGGER] Suku Adat Alit melakukan aksi pemblokiran jalur logistik alat berat karena jalur instalasi pipa pembuangan gas dituding melintasi area situs spiritual leluhur. Dr. Raymond menyarankan revisi rute pipa dengan alokasi dana ganti rugi CSR darurat, namun Allianz Underwriter menolak menanggung pengeluaran non-teknis yang tidak tercantum dalam klausul polis. Bagaimana mediasi dilakukan?"
                )}
                className="w-full text-left p-2 rounded bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 transition-all font-mono space-y-1 block"
                disabled={isSynthesizing}
              >
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-white flex items-center gap-1">
                    🛕 BLOKADE SUKU ADAT
                  </span>
                  <span className="text-[8px] text-emerald-400">SITUS ADAT VS CSR</span>
                </div>
                <p className="text-[8.5px] text-gray-400 leading-tight">
                  Aksi blokade akses logistik vs sengketa klaim dana CSR darurat.
                </p>
              </button>

              <button
                onClick={() => triggerScenario(
                  "Blackrock Capital Freeze",
                  "[SCENARIO TRIGGER] Konsorsium pendanaan global BlackRock mengancam akan melakukan penangguhan (Capital Freeze) terhadap sisa kucuran dana CAPEX jika tingkat NPV proyek turun di bawah 14%. Mr. Kenji menuntut penghematan ekstrim dengan menonaktifkan sebagian sensor gas telemetry, sementara Safety Officer menolak beroperasi demi mencegah potensi blowout ilegal. Cari jalan keluar!"
                )}
                className="w-full text-left p-2 rounded bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 hover:border-cyan-500/40 transition-all font-mono space-y-1 block"
                disabled={isSynthesizing}
              >
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-white flex items-center gap-1">
                    💸 PENDANAAN BLACKROCK
                  </span>
                  <span className="text-[8px] text-cyan-400">FINANCIAL VS SAFETY</span>
                </div>
                <p className="text-[8.5px] text-gray-400 leading-tight">
                  Suku bunga tinggi memotong anggaran sensor keselamatan vs ancaman pembekuan modal.
                </p>
              </button>
            </div>
          </div>

          {/* Cognitive coordination guidelines */}
          <div className="geo-card block">
            <h3 className="text-xs uppercase font-mono font-bold tracking-widest text-[#888] mb-4">DYNAMIC COORDINATION</h3>
            <div className="space-y-3 text-xs leading-normal">
              <p className="text-[#888]">
                Master Geo-Synthesizer handles automated orchestration of global inquiries. It evaluates the combined data of all active modules via GlobalGeoContext.
              </p>
              <div className="p-3 bg-white/5 border border-[#33] rounded text-[10px] font-mono text-[#aaa]">
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
