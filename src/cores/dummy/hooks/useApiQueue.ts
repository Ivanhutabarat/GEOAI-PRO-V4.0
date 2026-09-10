import { useState, useEffect, useCallback } from 'react';
import { getEffectiveApiKey } from '../config/apiConfig';
import { useApiMonitorStore } from '../store/ApiMonitorStore';
import { decryptKey } from '../../../lib/cryptoShield';

type QueueTask = {
  id: string;
  url: string;
  options: RequestInit;
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
  retries: number;
};

class ApiQueueManager {
  private queue: QueueTask[] = [];
  private isProcessing = false;
  private currentStatus = '';
  private totalTasks = 0;
  private completedTasks = 0;
  
  private consecutive429s = 0;
  private isPausedFor429 = false;
  private resumeTime = 0;
  
  private listeners: Set<(state: QueueState) => void> = new Set();

  public subscribe(listener: (state: QueueState) => void) {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach(l => l(state));
  }

  private getState(): QueueState {
    return {
      isProcessing: this.isProcessing,
      statusMessage: this.currentStatus,
      queueLength: this.queue.length,
      totalTasks: this.totalTasks,
      completedTasks: this.completedTasks
    };
  }

  public enqueue(url: string, options: RequestInit): Promise<Response> {
    return new Promise((resolve, reject) => {
      this.queue.push({
        id: Math.random().toString(),
        url,
        options,
        resolve,
        reject,
        retries: 0
      });
      if (this.totalTasks === 0 && !this.isProcessing) {
         this.totalTasks = 1;
      } else {
         this.totalTasks++;
      }
      
      if (!this.isProcessing) {
        this.processQueue();
      } else {
        this.currentStatus = `[QUEUED - WAITING FOR TURN...] [${this.completedTasks}/${this.totalTasks}]`;
        this.notify();
      }
    });
  }

  private async processQueue() {
    this.isProcessing = true;
    
    while (this.queue.length > 0) {
      if (this.isPausedFor429) {
        const remainingSec = Math.max(0, Math.ceil((this.resumeTime - Date.now()) / 1000));
        if (remainingSec > 0) {
          this.currentStatus = `EMERGENCY COOLDOWN: 429 rate limit hit. Paused for ${remainingSec}s...`;
          this.notify();
          await new Promise(res => setTimeout(res, 1000));
          continue;
        } else {
          this.isPausedFor429 = false;
          this.consecutive429s = 0;
          useApiMonitorStore.getState().addLog('success', `60-second Cooldown completed. Resuming orchestration queue.`);
        }
      }

      const task = this.queue[0];
      this.currentStatus = `[PROCESSING PAYLOAD INVERSION...] [Module ${this.completedTasks + 1} of ${this.totalTasks}]`;
      this.notify();
      
      const startTime = Date.now();
      try {
        let isCurrentTask429 = false;
        let responseRaw: Response | null = null;
        let fetchError: any = null;
        
        let attempts = 0;
        const maxAttempts = 4; // Try all keys

        while (attempts < maxAttempts) {
            const currentOptions = { ...task.options };

            // Auto inject API key and provider from localStorage if present
            try {
              const encodedKey = localStorage.getItem("_vanbotz_encrypted_gemini_key");
              const provider = localStorage.getItem("_vanbotz_provider_label") || "Google";
              if (encodedKey) {
                let decodedKey = decryptKey(encodedKey);
                if (decodedKey) {
                  decodedKey = decodedKey.trim().replace(/^["']|["']$/g, "").trim();
                }
                if (decodedKey) {
                  if (!currentOptions.headers) {
                    currentOptions.headers = {};
                  }
                  if (currentOptions.headers instanceof Headers) {
                    currentOptions.headers.set('x-api-key', decodedKey);
                    currentOptions.headers.set('x-provider-label', provider);
                  } else if (Array.isArray(currentOptions.headers)) {
                    currentOptions.headers.push(['x-api-key', decodedKey]);
                    currentOptions.headers.push(['x-provider-label', provider]);
                  } else {
                    (currentOptions.headers as any)['x-api-key'] = decodedKey;
                    (currentOptions.headers as any)['x-provider-label'] = provider;
                  }
                }
              }
            } catch (e) {
              console.error("[useApiQueue] Failed to auto-inject credentials override:", e);
            }

            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
              controller.abort();
            }, 30000);

            try {
                const finalOptions = { ...currentOptions, signal: controller.signal };
                responseRaw = await fetch(task.url, finalOptions);
                fetchError = null;
            } catch(err: any) {
                if (err.name === 'AbortError') {
                  fetchError = new Error("GATEWAY_TIMEOUT: Request cancelled automatically after 30 seconds of high latency to prevent server overload.");
                } else {
                  fetchError = err;
                }
            } finally {
                clearTimeout(timeoutId);
            }

            if (useApiMonitorStore.getState().isExhaustionSimulated) {
                isCurrentTask429 = true;
                responseRaw = { status: 429, ok: false } as Response;
            } else if (responseRaw && (responseRaw.status === 429 || responseRaw.status === 403 || responseRaw.status === 503)) {
                isCurrentTask429 = true;
            } else {
                isCurrentTask429 = false;
            }

            if (isCurrentTask429) {
                attempts++;
                useApiMonitorStore.getState().addLog('error', `Rate Limit or Auth detected (${responseRaw?.status}). Rotating credential (Attempt ${attempts})...`);
                continue;
            }
            break;
        }

        if (fetchError || !responseRaw || isCurrentTask429 || responseRaw?.status === 500) {
           let errorMsg = fetchError ? fetchError.message : `HTTP ${responseRaw?.status}`;
           useApiMonitorStore.getState().addLog('error', `Primary query failed (${errorMsg}) after ${attempts || 1} attempts. Engaging local coprocessing core.`);
           
           try {
             useApiMonitorStore.setState({ apiMode: 'DUMMY' });
             sessionStorage.setItem('api_mode', 'DUMMY');
           } catch (e) {}

           if (responseRaw) {
             task.resolve(responseRaw);
           } else {
             task.reject(fetchError || new Error("Fetch failed"));
           }
        } else {
           if (task.url.includes('/api/swarm/debate') || task.url.includes('/api/master-synthesize')) {
             useApiMonitorStore.getState().setEngine('Gemini Primary');
             useApiMonitorStore.getState().incrementSuccess();
             useApiMonitorStore.getState().addLog('success', `Primary query completed successfully.`);
           }
           task.resolve(responseRaw);
        }

        const duration = Date.now() - startTime;
        if (task.url.includes('/api/swarm/debate') || task.url.includes('/api/master-synthesize')) {
          useApiMonitorStore.getState().recordLatency(duration);
        }
        
        this.queue.shift();
        this.completedTasks++;

      } catch (err: any) {
        try {
          useApiMonitorStore.setState({ apiMode: 'DUMMY' });
          sessionStorage.setItem('api_mode', 'DUMMY');
        } catch (e) {}

        this.queue.shift();
        this.completedTasks++;
        task.reject(err);
      }

      if (this.queue.length > 0) {
        this.currentStatus = `[QUEUED - WAITING FOR TURN...] Next in 2.5s...`;
        this.notify();
        const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
        await delay(2500);
      }
    }
    
    this.isProcessing = false;
    this.currentStatus = '';
    this.totalTasks = 0;
    this.completedTasks = 0;
    this.notify();
  }
}

export const apiQueueManager = new ApiQueueManager();

export interface QueueState {
  isProcessing: boolean;
  statusMessage: string;
  queueLength: number;
  totalTasks: number;
  completedTasks: number;
}

export function useApiQueue() {
  const [queueState, setQueueState] = useState<QueueState>({
    isProcessing: false,
    statusMessage: '',
    queueLength: 0,
    totalTasks: 0,
    completedTasks: 0
  });

  useEffect(() => {
    const unsubscribe = apiQueueManager.subscribe(setQueueState);
    return () => { unsubscribe(); };
  }, []);

  const fetchQueued = useCallback((url: string, options: RequestInit) => {
    return apiQueueManager.enqueue(url, options);
  }, []);

  return { ...queueState, fetchQueued };
}
