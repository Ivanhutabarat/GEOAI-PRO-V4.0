import { useEffect } from 'react';

export const recordActivity = async (action: string, payload: any, isSandbox: boolean = false) => {
  try {
    await fetch('/api/record-activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        module: payload?.module || 'GLOBAL',
        action,
        payload,
        isSandbox
      })
    });
  } catch (e) {
    console.warn("Failed to record activity", e);
  }
};

export const forceRestoreState = async (timestamp: string) => {
  console.log(`[FRONTEND] Pulling state for ${timestamp}...`);
  try {
    const response = await fetch(`/api/record-activity/history?timestamp=${timestamp}`);
    const json = await response.json();
    if (json.success) {
      console.log("[FRONTEND] Data acquired:", json.data);
      return {
        ...json,
        payload: json.data?.payload
      };
    }
  } catch (error) {
    console.error("[FRONTEND] History Fetch Failed!", error);
    return null;
  }
};

export const fetchHistoricalState = async (
  setGlobalData?: (data: any) => void,
  setRawPayloads?: (raw: any) => void
) => {
  const targetTime = "2026-05-30T18:21:00"; // Target restoration timestamp
  console.log(`[TIME-TRAVEL] Requesting state sync for timestamp: ${targetTime}`);
  
  try {
    const response = await fetch(`/api/record-activity/history?timestamp=${targetTime}`);
    const historicalData = await response.json();
    
    if (historicalData) {
      console.log("[TIME-TRAVEL] Historical payload acquired. Overwriting global state.");
      // Inject logic here to overwrite globalDataState and rawPayloads
      if (setGlobalData && historicalData.globalData) {
        setGlobalData(historicalData.globalData);
      }
      if (setRawPayloads && historicalData.rawPayloads) {
        setRawPayloads(historicalData.rawPayloads);
      }
      return historicalData;
    }
  } catch (error) {
    console.error("Failed to retrieve historical state.", error);
  }
};

export const useGeoSync = (isApiActive: boolean) => {
  useEffect(() => {
    if (!isApiActive) return;
    
    let evtSource: EventSource | null = null;
    try {
      evtSource = new EventSource('/api/geosync');
      evtSource.onmessage = (event) => {
        // Handle sync
        // console.log("[GeoSync]", event.data);
      };
      evtSource.onerror = () => {
        // Suppress noisy console error when connection is closed/reconnected
      };
    } catch (e) {
      console.warn("[GeoSync] Initialization skipped:", e);
    }
    
    return () => {
      if (evtSource) {
        evtSource.close();
      }
    };
  }, [isApiActive]);
};
