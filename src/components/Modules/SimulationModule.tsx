import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  MessageSquare, 
  Zap, 
  Bot, 
  ArrowRight,
  ShieldAlert,
  Sparkles,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Agent, SimulationEvent } from '../../types';
import { cn } from '../../lib/utils';
import { useGlobalGeoContext } from '../../context/GlobalGeoContext';
import { useApiQueue } from '../../hooks/useApiQueue';
import { globalSwarmEngine } from '../../lib/SwarmEngine';
import { useApiMonitorStore } from '../../store/ApiMonitorStore';
import SwarmRoom from '../Shared/SwarmRoom';

export default function SimulationModule() {
  const { globalData, activeFileName, dataDimensions } = useGlobalGeoContext();
  const { fetchQueued, isProcessing, statusMessage } = useApiQueue();
  const { isExhaustionSimulated, toggleExhaustion } = useApiMonitorStore();
  const [agents, setAgents] = useState<Agent[]>([]);

  // Update state initialization so the Swarm Sandbox mounts correctly
  useEffect(() => {
    // Phase 2 risk metrics simulated as 0.75 for initialization
    globalSwarmEngine.calculateInitialStance(0.75);
    setAgents(globalSwarmEngine.getAgents());
  }, []);
  const [events, setEvents] = useState<SimulationEvent[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [predictionGoal, setPredictionGoal] = useState('Predict soil stability impact after 6 months of continuous borehole extraction.');
  const [simulationReport, setSimulationReport] = useState<string | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [activeDrawer, setActiveDrawer] = useState<'feed' | 'swarm'>('feed');
  
  // Stable references for state that updates inside the sequential API loop
  const eventsRef = useRef(events);
  useEffect(() => {
    eventsRef.current = events;
  }, [events]);

  const agentsRef = useRef(agents);
  useEffect(() => {
    agentsRef.current = agents;
  }, [agents]);

  const [expandedFactions, setExpandedFactions] = useState<Record<string, boolean>>({
    '🏛️ GOVERNMENT & REGULATORS': true,
    '💼 CORPORATE & CAPITAL': true,
    '⚙️ OPERATIONS & SUPPLY CHAIN': true,
    '🌍 SOCIAL & WATCHDOGS': true
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [events]);

  const addEvent = (content: string, senderId: string) => {
    const newEvent: SimulationEvent = {
        id: Math.random().toString(),
        timestamp: new Date(),
        senderId,
        targetId: 'world',
        content: content
    };
    setEvents(prev => [...prev, newEvent]);
  };

  const toggleFaction = (faction: string) => {
    setExpandedFactions(prev => ({ ...prev, [faction]: !prev[faction] }));
  };

  const simulationTaskRef = useRef<boolean>(false);

  const startMassiveHearing = async () => {
    if (simulationTaskRef.current) {
      // Trigger user stop (Freeze consensus)
      simulationTaskRef.current = false;
      setIsRunning(false);
      return;
    }

    setIsRunning(true);
    simulationTaskRef.current = true;

    // Loop sequentially through each agent chronologically
    for (const agent of agentsRef.current) {
      if (!simulationTaskRef.current) break;

      try {
        // Set active status visually to interacting
        setAgents(prev => prev.map(a => 
          a.id === agent.id ? { ...a, status: 'interacting' } : { ...a, status: 'idle' }
        ));

        // Create optimized dataset pointer reference of geological records
        const totalRecords = Object.values(globalData || {}).reduce((acc: number, val: any) => acc + (val?.length || 0), 0);
        const datasetReference = {
          fileName: activeFileName || "active_survey_logs.csv",
          dimensions: dataDimensions || "1-D",
          totalRecords: totalRecords || 150
        };

        // Create compressed structural debate summary state representing current progression
        const debateStateSummary = eventsRef.current.length > 0
          ? `Dialogue progression trace: ${eventsRef.current.map(e => {
              const a = agentsRef.current.find(ag => ag.id === e.senderId);
              return `[${a?.name || 'Agent'}]: "${e.content.substring(0, 90)}..."`;
            }).join(' -> ')} (Active stances: ${agentsRef.current.map(a => `${a.name}: ${a.stance || 'PENDING'}`).join(', ')})`
          : "Dialogue initialized. No preceding positions or opinions registered yet.";

        const response = await fetchQueued('/api/swarm/debate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: predictionGoal,
            activeModule: "simulation",
            history: eventsRef.current.slice(-4).map(e => {
               const a = agentsRef.current.find(ag => ag.id === e.senderId);
               return { role: a?.role || 'Unknown', agent: a?.name || 'Unknown', content: e.content };
            }),
            datasetReference,
            debateState: debateStateSummary,
            targetAgent: agent.name
          })
        });

        const data = await response.json();
        if (data.success && data.debate && simulationTaskRef.current) {
           const newDebate = data.debate[0];
           if (newDebate) {
              setAgents(prev => {
                return prev.map(a => 
                  a.id === agent.id ? { 
                    ...a, 
                    stance: newDebate.stance || a.stance || 'PENDING',
                    status: 'idle'
                  } : a
                );
              });
              addEvent(newDebate.content, agent.id);
           }
        }
      } catch (err) {
        console.error(`Simulation agent error [${agent.name}]`, err);
      }

      // Apply strict 2000ms sequential throttle delay between agent responses to stay well under API rate limits
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Only finalize state if we fully processed without manual freeze interrupt
    if (simulationTaskRef.current) {
      globalSwarmEngine.iterateConsensus();
      if (globalSwarmEngine.getPhase() === 3) {
        setAgents([...globalSwarmEngine.getAgents()]);
      }
      setIsRunning(false);
      simulationTaskRef.current = false;
    }
  };

  const handleReset = () => {
    simulationTaskRef.current = false;
    setIsRunning(false);
    setEvents([]);
    setSimulationReport(null);
  };


  const generateFinalReport = () => {
    setIsCompiling(true);
    setTimeout(() => {
      setSimulationReport(`### STAKEHOLDER SWARM prediction REPORT\n**Goal:** ${predictionGoal}\n**Analyzed Consensus Cycles:** ${events.length} iterations\n\n#### 1. SEISMIC SURFACE SOUNDNESS\nHardware arrays logged micro-vibrations at 24Hz, bounded by normal safety levels. However, continuous drawdown may trigger 0.05mm structural slip anomalies if casing pressures lack constant regulatory feedback.\n\n#### 2. HYDROGELOGICAL INTEGRITY\nNo direct aquifer communication faults were identified. Sandstone lithologies provide optimal filtering capacity against solvent leaching.\n\n#### 3. RECOMMENDATIONS & ROI BOUNDARIES\n- Install dynamic mud casings down to sand contacts at 450m.\n- Retain continuous 24Hz acoustic dampening shields on boreholes STN-12.`);
      setIsCompiling(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] space-y-6 bg-[#161617] p-5 border border-[#333] rounded-lg">
      <div className="flex justify-between items-start border-b border-[#222] pb-3">
        <div>
          <h1 className="text-xl font-bold uppercase italic font-mono text-white flex items-center gap-3">
            <Users className="text-[#FF5722]" />
            Swarm Stakeholder Sandbox
          </h1>
          <p className="text-xs text-[#888888] font-mono mt-0.5 uppercase">Simulation Environment for Macro-Economy & Civil Consents</p>
        </div>
        <div className="flex gap-3">
          {/* Key Exhaustion Simulator */}
          <button
            type="button"
            onClick={toggleExhaustion}
            className={cn(
              "px-3 py-2 border text-[10px] font-mono rounded font-bold uppercase tracking-wide transition-all flex items-center gap-1.5 cursor-pointer",
              isExhaustionSimulated
                ? "bg-amber-950/40 border-amber-500 text-amber-500 hover:bg-amber-900/10"
                : "border-[#333] text-gray-400 hover:bg-[#222] hover:text-white"
            )}
            title="Simulate primary Gemini key exhaustion to demonstrate backup OpenAI routing"
          >
            <ShieldAlert size={12} className={isExhaustionSimulated ? "text-amber-500 animate-pulse" : "text-gray-500"} />
            {isExhaustionSimulated ? 'Exhaustion: Active' : 'Simulate Key Exhaustion'}
          </button>

          <button 
            onClick={startMassiveHearing}
            className={cn(
              "px-6 py-2 rounded text-xs font-bold uppercase transition-colors flex items-center gap-2 cursor-pointer text-black",
              isRunning ? "bg-red-500/15 border border-red-500 text-red-500 hover:bg-red-500/20" : "bg-[#FF5722] hover:bg-[#ff7043]"
            )}
          >
            {isRunning ? <Pause size={14} /> : <Play size={14} />}
            {isRunning ? 'Freeze consensus' : 'Conduct Debate'}
          </button>
          <button 
            onClick={handleReset}
            className="px-4 py-2 border border-[#333] text-[#888] rounded hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* LIVE STANCE MATRIX */}
      <div className="grid grid-cols-3 gap-6 shrink-0 bg-[#0f0f0f] border border-[#222] p-3 rounded-lg overflow-hidden relative">
        <div className="absolute top-0 bottom-0 left-1/3 w-px bg-[#222]" />
        <div className="absolute top-0 bottom-0 right-1/3 w-px bg-[#222]" />

        <div className="flex flex-col z-10">
          <h3 className="text-[10px] font-mono text-green-500 mb-2 font-bold uppercase flex items-center justify-between pb-1 ">
            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> PRO ALLIANCE</span>
            <span>{agents.filter(a => a.stance === 'PRO').length}</span>
          </h3>
          <div className="flex-1 space-y-1.5 min-h-[40px] border-t border-[#222] pt-2">
            <AnimatePresence>
              {agents.filter(a => a.stance === 'PRO').map(a => (
                 <motion.div layout initial={{opacity: 0, scale: 0.9}} animate={{opacity: 1, scale: 1}} exit={{opacity: 0}} key={a.id} className="text-[9px] font-mono bg-green-900/10 text-green-400 border border-green-900/30 px-2 py-1.5 rounded flex justify-between items-center font-bold">
                    <span className="truncate flex items-center gap-2">
                      <span className="w-4 h-4 rounded bg-green-900/50 flex items-center justify-center text-[7px] text-green-300">{a.faction?.split(' ')[0]}</span>
                      {a.name}
                    </span>
                 </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex flex-col z-10">
          <h3 className="text-[10px] font-mono text-[#888] mb-2 font-bold uppercase flex items-center justify-between pb-1 ">
             <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#555]" /> NEUTRAL / PENDING</span>
             <span>{agents.filter(a => a.stance === 'NEUTRAL' || a.stance === 'PENDING').length}</span>
          </h3>
          <div className="flex-1 space-y-1.5 min-h-[40px] border-t border-[#222] pt-2">
             <AnimatePresence>
              {agents.filter(a => a.stance === 'NEUTRAL' || a.stance === 'PENDING').map(a => (
                 <motion.div layout initial={{opacity: 0, scale: 0.9}} animate={{opacity: 1, scale: 1}} exit={{opacity: 0}} key={a.id} className="text-[9px] font-mono bg-[#222]/30 text-[#AAA] border border-[#333] px-2 py-1.5 rounded flex justify-between items-center font-bold">
                    <span className="truncate flex items-center gap-2">
                      <span className="w-4 h-4 rounded bg-[#333] flex items-center justify-center text-[7px] text-gray-400">{a.faction?.split(' ')[0]}</span>
                      {a.name}
                    </span>
                 </motion.div>
              ))}
             </AnimatePresence>
          </div>
        </div>

        <div className="flex flex-col z-10">
          <h3 className="text-[10px] font-mono text-red-500 mb-2 font-bold uppercase flex items-center justify-between pb-1 ">
             <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> KONTRA ALLIANCE</span>
             <span>{agents.filter(a => a.stance === 'KONTRA').length}</span>
          </h3>
          <div className="flex-1 space-y-1.5 min-h-[40px] border-t border-[#222] pt-2">
             <AnimatePresence>
              {agents.filter(a => a.stance === 'KONTRA').map(a => (
                 <motion.div layout initial={{opacity: 0, scale: 0.9}} animate={{opacity: 1, scale: 1}} exit={{opacity: 0}} key={a.id} className="text-[9px] font-mono bg-red-900/10 text-red-400 border border-red-900/30 px-2 py-1.5 rounded flex justify-between items-center font-bold">
                    <span className="truncate flex items-center gap-2">
                      <span className="w-4 h-4 rounded bg-red-900/50 flex items-center justify-center text-[7px] text-red-300">{a.faction?.split(' ')[0]}</span>
                      {a.name}
                    </span>
                 </motion.div>
              ))}
             </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 flex-1 min-h-0 overflow-hidden">
        {/* Column 1: Stakeholder memory cards */}
        <div className="col-span-12 md:col-span-3 flex flex-col space-y-4 overflow-hidden">
          <div className="geo-card h-full flex flex-col overflow-y-auto pr-1">
            <div className="flex justify-between items-center mb-4 border-b border-[#222] pb-2 text-[10px] font-mono text-[#555] font-bold shrink-0">
              <span>SPECIALIST BOARD</span>
              <span>{agents.length} ACTIVE</span>
            </div>
            <div className="space-y-4 flex-1 overflow-y-auto pr-1 scrollbar-thin">
              {Array.from(new Set(agents.map(a => a.faction || '🌍 SOCIAL & WATCHDOGS'))).map(faction => {
                const factionAgents = agents.filter(a => (a.faction || '🌍 SOCIAL & WATCHDOGS') === faction);
                if (factionAgents.length === 0) return null;
                
                const isExpanded = expandedFactions[faction] !== false; // default to true if undefined

                return (
                  <div key={faction} className="space-y-1">
                    <button 
                      onClick={() => toggleFaction(faction)}
                      className="w-full flex items-center justify-between p-1.5 bg-[#111] hover:bg-[#222] border border-[#222] rounded text-[9px] font-mono font-bold text-[#888] transition-colors"
                    >
                      <span className="truncate pr-2">{faction}</span>
                      {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    </button>
                    
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden space-y-2 mt-2"
                        >
                          {factionAgents.map(agent => (
                            <div key={agent.id} className={cn(
                              "p-3 rounded border text-xs bg-black/20 transition-all",
                              agent.status === 'interacting' ? "border-[#FF5722] bg-[#FF5722]/5" : "border-[#222]"
                            )}>
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-white truncate max-w-[80%]">{agent.name}</span>
                                <span className={cn(
                                  "w-1.5 h-1.5 rounded-full shrink-0",
                                  agent.status === 'interacting' ? "bg-[#FF5722] animate-pulse" : "bg-[#333]"
                                )}></span>
                              </div>
                              <span className="text-[9px] text-[#FF5722] font-mono uppercase font-semibold block truncate">{agent.role}</span>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Column 2: Synthesized consent reports */}
        <div className="col-span-12 md:col-span-4 flex flex-col overflow-hidden">
          <div className="geo-card flex-1 flex flex-col bg-[#111]/40 border border-[#222] rounded-lg overflow-y-auto">
             {simulationReport ? (
               <div className="space-y-3 font-mono text-[11px] p-2 leading-relaxed h-full flex flex-col">
                  <div className="flex justify-between items-center border-b border-[#222] pb-2 mb-2 shrink-0">
                    <span className="font-bold text-white flex items-center gap-1.5 uppercase tracking-tight text-xs">
                      <Bot size={13} className="text-[#FF5722]" />
                      Synthesized Prediction Report
                    </span>
                  </div>
                  <pre className="flex-1 overflow-y-auto whitespace-pre-wrap font-sans text-xs text-[#AAA] bg-black/40 p-3 rounded leading-normal border border-[#222]">
                    {simulationReport}
                  </pre>
               </div>
             ) : (
               <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-black/10">
                 <div className="w-12 h-12 bg-[#222]/50 border border-[#333] rounded-full flex items-center justify-center mb-4">
                    <Zap size={18} className={cn(isRunning ? "text-[#FF5722] animate-bounce" : "text-[#535354]")} />
                 </div>
                 <h3 className="text-xs font-bold mb-1 uppercase tracking-wider font-mono text-white">Consensus compiler</h3>
                 <p className="text-[10px] text-[#888] mb-6 italic max-w-xs leading-normal">
                   {events.length < 3 ? "Run at least 3 rounds of debates before synthesizing environmental predictions." : "Dialogue complete. Ready for compilation."}
                 </p>
                 <button 
                  disabled={events.length < 3 || isCompiling}
                  onClick={generateFinalReport}
                  className="w-full bg-[#FF5722] text-black py-2 rounded text-xs font-bold uppercase hover:bg-[#ff7043] disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer font-bold"
                 >
                    <Sparkles size={12} /> 
                    {isCompiling ? "Compiling..." : "Compile Consensus"}
                 </button>
               </div>
             )}
          </div>
        </div>

        {/* Column 3: Sleek Tabbed Right Panel Drawer (Live Feed vs. Swarm Cognitive Room) */}
        <div className="col-span-12 md:col-span-5 flex flex-col overflow-hidden bg-black/40 border border-[#222] rounded-lg relative h-full">
          {/* Slider Tab Header Selection Bar */}
          <div className="flex border-b border-[#222] bg-[#111]/90 shrink-0 font-mono text-[10px] items-center text-center">
            <button
              id="tab-feed-btn"
              onClick={() => setActiveDrawer('feed')}
              className={cn(
                "flex-1 py-3 text-center transition-all font-bold tracking-wider relative cursor-pointer flex items-center justify-center gap-2",
                activeDrawer === 'feed' 
                  ? "bg-[#18181c] text-[#FF5722] border-b-2 border-[#FF5722]" 
                  : "text-[#888] hover:text-[#bbb] hover:bg-[#131315]"
              )}
            >
              <MessageSquare size={12} />
              LIVE FEED
              {events.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-orange-950 text-[#FF5722] border border-orange-900 text-[8px] font-bold">
                  {events.length}
                </span>
              )}
            </button>
            <button
              id="tab-swarm-btn"
              onClick={() => setActiveDrawer('swarm')}
              className={cn(
                "flex-1 py-3 text-center transition-all font-bold tracking-wider relative cursor-pointer flex items-center justify-center gap-2",
                activeDrawer === 'swarm' 
                  ? "bg-[#18181c] text-[#FF5722] border-b-2 border-[#FF5722]" 
                  : "text-[#888] hover:text-[#bbb] hover:bg-[#131315]"
              )}
            >
              <Bot size={12} />
              SWARM COGNITIVE ROOM
            </button>
          </div>

          {/* Sliding Tab Body */}
          <div className="flex-1 min-h-0 overflow-hidden relative bg-black/10">
            <AnimatePresence mode="wait">
              {activeDrawer === 'feed' ? (
                <motion.div
                  key="feed"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="h-full flex flex-col"
                >
                  <div className="p-3 bg-[#111]/60 border-b border-[#222] flex justify-between items-center text-[10px] font-mono text-[#555] font-bold shrink-0">
                    <span>LIVE INTERACTIVE FEED</span>
                    <span>{events.length} EVENTS RECORDED</span>
                  </div>
                  
                  <div 
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin"
                  >
                    <AnimatePresence initial={false}>
                      {events.map((event, i) => {
                        const sender = agents.find(a => a.id === event.senderId);
                        return (
                          <motion.div
                            key={event.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex gap-2 text-xs"
                          >
                            <div className="w-6 h-6 rounded bg-[#222] border border-[#333] flex items-center justify-center shrink-0 text-[10px] text-[#FF5722] font-mono font-bold">
                              {sender?.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="font-bold text-[#FF5722] font-mono text-[10px]">{sender?.name}</span>
                                <span className="text-[8px] text-[#444] font-mono">{event.timestamp.toLocaleTimeString()}</span>
                              </div>
                              <p className="text-[#AAA] leading-relaxed text-[11px] break-words">{event.content}</p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                    {isRunning && !isProcessing && (
                      <div className="flex items-center gap-1.5 text-[#FF5722] font-mono text-[9px] leading-none animate-pulse">
                        <Zap size={10} />
                        DEBATERS LOGGING FEEDBACK CONTINUOUSLY...
                      </div>
                    )}
                    {isProcessing && (
                      <div className="flex items-center gap-2 text-orange-500 font-mono text-[10px] leading-none p-2 bg-orange-900/10 border border-orange-900/30 rounded mt-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></div>
                        {statusMessage.toLowerCase().includes("rate limit") || statusMessage.toLowerCase().includes("cool") 
                          ? `Agent analyzing... (Waiting for satellite link / ${statusMessage})` 
                          : `Agent analyzing... (${statusMessage})`}
                      </div>
                    )}
                  </div>
                  
                  <div className="p-3 bg-[#111] border-t border-[#222] shrink-0">
                     <div className="flex gap-2">
                       <input 
                          value={predictionGoal}
                          onChange={(e) => setPredictionGoal(e.target.value)}
                          placeholder="Simulation baseline constraints..." 
                          className="flex-1 bg-black border border-[#222] rounded px-3 py-1.5 text-xs focus:outline-none focus:border-[#FF5722] text-white" 
                       />
                     </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="swarm"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="h-full w-full"
                >
                  <SwarmRoom 
                    activeModule="simulation" 
                    drillCoordinates={null} 
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
