import { create } from 'zustand';

export interface ApiMonitorLog {
  id: string;
  type: 'success' | 'retry' | 'fallback' | 'exhaust' | 'error';
  label: string;
  timestamp: string;
}

export interface ApiMonitorState {
  activeEngine: 'Gemini Primary' | 'OpenAI Fallback';
  apiMode: 'LIVE' | 'DUMMY';
  glowingDot: 'green' | 'orange' | 'red';
  successCount: number;
  retryCount: number;
  isExhaustionSimulated: boolean;
  activeOpenAiKeyIndex: number; // 0, 1, 2
  logChannel: ApiMonitorLog[];
  latencyHistory: number[];
  
  toggleApiMode: () => void;
  incrementSuccess: () => void;
  incrementRetry: () => void;
  toggleExhaustion: () => void;
  setEngine: (engine: 'Gemini Primary' | 'OpenAI Fallback') => void;
  setGlowingDot: (color: 'green' | 'orange' | 'red') => void;
  rotateOpenAiKey: () => void;
  addLog: (type: 'success' | 'retry' | 'fallback' | 'exhaust' | 'error', label: string) => void;
  clearLogChannel: () => void;
  recordLatency: (latency: number) => void;
}

export const useApiMonitorStore = create<ApiMonitorState>((set) => ({
  activeEngine: 'Gemini Primary',
  apiMode: (sessionStorage.getItem('api_mode') as 'LIVE' | 'DUMMY') || 'LIVE',
  glowingDot: (sessionStorage.getItem('api_mode') === 'DUMMY') ? 'orange' : 'green',
  successCount: 0,
  retryCount: 0,
  isExhaustionSimulated: false,
  activeOpenAiKeyIndex: 0,
  logChannel: [
    { id: 'init', type: 'success', label: 'Monitor linked with Primary Google Gemini 3.5 Engine.', timestamp: new Date().toLocaleTimeString() }
  ],
  latencyHistory: [140, 180, 130, 155, 205, 125, 165, 195, 135, 160],

  toggleApiMode: () => set(state => {
    const nextMode = state.apiMode === 'LIVE' ? 'DUMMY' : 'LIVE';
    sessionStorage.setItem('api_mode', nextMode);
    
    const logItem: ApiMonitorLog = {
      id: Math.random().toString(),
      type: nextMode === 'LIVE' ? 'success' : 'exhaust',
      label: `API MODE CHANGED: Switched to ${nextMode} execution state.`,
      timestamp: new Date().toLocaleTimeString()
    };
    
    return {
      apiMode: nextMode,
      logChannel: [...state.logChannel, logItem],
      glowingDot: nextMode === 'DUMMY' ? 'orange' : (state.activeEngine === 'Gemini Primary' ? 'green' : 'orange')
    };
  }),
  incrementSuccess: () => set(state => ({ successCount: state.successCount + 1 })),
  incrementRetry: () => set(state => ({ retryCount: state.retryCount + 1 })),
  toggleExhaustion: () => set(state => {
    const nextVal = !state.isExhaustionSimulated;
    const newLogs = [
      ...state.logChannel,
      {
        id: Math.random().toString(),
        type: 'exhaust' as const,
        label: nextVal ? "FORCED EXHAUSTION: Forcing Gemini models to throw 429 quota exceptions" : "FORCED EXHAUSTION: Recovered primary Gemini links",
        timestamp: new Date().toLocaleTimeString()
      }
    ];
    return { 
      isExhaustionSimulated: nextVal,
      logChannel: newLogs,
      glowingDot: nextVal ? 'orange' : (state.activeEngine === 'Gemini Primary' ? 'green' : 'orange')
    };
  }),
  setEngine: (engine) => set(state => ({ 
    activeEngine: engine,
    glowingDot: engine === 'Gemini Primary' ? (state.isExhaustionSimulated ? 'orange' : 'green') : 'orange'
  })),
  setGlowingDot: (color) => set({ glowingDot: color }),
  rotateOpenAiKey: () => set(state => {
    const nextIndex = (state.activeOpenAiKeyIndex + 1) % 3;
    return {
      activeOpenAiKeyIndex: nextIndex,
      logChannel: [
        ...state.logChannel,
        {
          id: Math.random().toString(),
          type: 'retry' as const,
          label: `Rotating OpenAI Backup Key to Channel #${nextIndex + 1}...`,
          timestamp: new Date().toLocaleTimeString()
        }
      ]
    };
  }),
  addLog: (type, label) => set(state => ({
    logChannel: [
      ...state.logChannel.slice(-30), // retain latest 30 logs only
      { id: Math.random().toString(), type, label, timestamp: new Date().toLocaleTimeString() }
    ]
  })),
  clearLogChannel: () => set({ logChannel: [] }),
  recordLatency: (latency) => set(state => {
    const newHistory = [...state.latencyHistory.slice(1), Math.round(latency)];
    return { latencyHistory: newHistory };
  })
}));
