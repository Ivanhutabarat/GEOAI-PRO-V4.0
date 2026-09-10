import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, ShieldAlert, Waves, Activity } from 'lucide-react';
import { useGlobalGeoContext } from '../../context/GlobalGeoContext';

export default function RadarWidget() {
  const { seismicMode } = useGlobalGeoContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [lastEvent, setLastEvent] = useState({
    title: "NORMAL STATUS",
    desc: "No anomalies detected",
    time: "NOW",
    level: "normal"
  });
  
  const [alerts, setAlerts] = useState<any[]>([
    { r: 20, th: 1.2, text: "TEM-04", level: "normal" },
  ]);

  useEffect(() => {
    // Reset standard alerts based on mode switch
    if (seismicMode === 'exploration') {
      setLastEvent({ title: "GEOLOGIC SCAN", desc: "Mapping static structures", time: "NOW", level: "normal" });
      setAlerts([
        { r: 25, th: 1.5, text: "SALT DOME", level: "normal" },
        { r: 40, th: 3.2, text: "FAULT LINE", level: "normal" },
      ]);
    } else {
      setLastEvent({ title: "PASSIVE LISTENING", desc: "Awaiting tremor activity", time: "NOW", level: "normal" });
      setAlerts([
        { r: 15, th: 0.5, text: "STATION A", level: "normal" },
        { r: 45, th: 2.1, text: "STATION B", level: "normal" },
      ]);
    }
  }, [seismicMode]);

  useEffect(() => {
    const handleAnomaly = (e: any) => {
      const { depth, peak } = e.detail;
      setLastEvent({
        title: "BRIGHT-SPOT DETECTED",
        desc: `Depth ${depth}m / Amp ${peak}`,
        time: new Date().toLocaleTimeString(),
        level: "warning"
      });
      setAlerts(prev => [
        ...prev,
        { r: Math.random() * 30 + 10, th: Math.random() * Math.PI * 2, text: "RESERVOIR", level: "warning" }
      ]);
    };

    const handleTremor = (e: any) => {
      const { magnitude, maxAmp } = e.detail;
      setLastEvent({
        title: `TREMOR DETECTED: [Mag ${magnitude}]`,
        desc: `High amplitude S-waves parsed (Amp ${maxAmp.toFixed(1)})`,
        time: new Date().toLocaleTimeString(),
        level: "critical"
      });
      setAlerts(prev => [
        ...prev,
        { r: Math.random() * 20 + 20, th: Math.random() * Math.PI * 2, text: "EPICENTER", level: "critical" }
      ]);
    };

    window.addEventListener('geoai:seismic-anomaly', handleAnomaly);
    window.addEventListener('geoai:tremor-event', handleTremor);
    return () => {
      window.removeEventListener('geoai:seismic-anomaly', handleAnomaly);
      window.removeEventListener('geoai:tremor-event', handleTremor);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 5;
    let angle = 0;

    let timer: any;
    const drawRadar = () => {
      // Semi-transparent overlay for trailing sweep effect
      ctx.fillStyle = seismicMode === 'mitigation' ? 'rgba(10, 0, 0, 0.15)' : 'rgba(0, 10, 0, 0.15)';
      ctx.fillRect(0, 0, size, size);

      // Radar circles
      ctx.strokeStyle = seismicMode === 'mitigation' ? 'rgba(255, 0, 0, 0.15)' : 'rgba(0, 255, 0, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(center, center, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(center, center, radius * 0.66, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(center, center, radius * 0.33, 0, Math.PI * 2);
      ctx.stroke();

      // Crosshairs
      ctx.beginPath();
      ctx.moveTo(5, center); ctx.lineTo(size - 5, center);
      ctx.moveTo(center, 5); ctx.lineTo(center, size - 5);
      ctx.stroke();

      // Draw alerts on radar target grid
      alerts.forEach((aln) => {
        const ax = center + aln.r * Math.cos(aln.th);
        const ay = center + Math.abs(aln.r) * Math.sin(aln.th); // ensure safe bounds

        ctx.fillStyle = aln.level === 'critical' ? '#EF4444' : (aln.level === 'warning' ? '#ffcc00' : (seismicMode === 'mitigation' ? '#EF4444' : '#4ADE80'));
        ctx.beginPath();
        ctx.arc(ax, ay, 3, 0, Math.PI * 2);
        ctx.fill();

        // Pulsating coordinate ring around critical alert nodes
        if (aln.level === 'critical') {
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
          ctx.beginPath();
          ctx.arc(ax, ay, 6 + Math.sin(Date.now() / 100) * 3, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      // Sweep line
      const sweepX = center + radius * Math.cos(angle);
      const sweepY = center + radius * Math.sin(angle);
      
      const grad = ctx.createLinearGradient(center, center, sweepX, sweepY);
      grad.addColorStop(0, seismicMode === 'mitigation' ? 'rgba(255, 0, 0, 0.05)' : 'rgba(0, 255, 0, 0.05)');
      grad.addColorStop(1, seismicMode === 'mitigation' ? 'rgba(255, 0, 0, 0.6)' : 'rgba(0, 255, 0, 0.6)');

      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(sweepX, sweepY);
      ctx.stroke();

      angle += seismicMode === 'mitigation' ? 0.05 : 0.02;
      timer = requestAnimationFrame(drawRadar);
    };

    drawRadar();

    return () => {
      cancelAnimationFrame(timer);
    };
  }, [alerts, seismicMode]);

  const isWarning = lastEvent.level === 'critical' || lastEvent.level === 'warning';
  const themeColor = seismicMode === 'mitigation' ? 'red' : 'green';
  const titleText = seismicMode === 'mitigation' ? 'E.W.S. ACTIVE' : 'SEISMIC RADAR';

  return (
    <div className={`bg-black/80 border border-[#333] p-3 rounded-lg shadow-xl w-44 flex flex-col items-center transition-colors`}>
      <div className={`flex justify-between items-center w-full mb-1 border-b border-[#222] pb-1 text-[9px] font-mono text-[#888] ${isWarning ? 'text-red-500' : (seismicMode === 'mitigation' ? 'text-red-500' : 'text-green-500')}`}>
        <span className="flex items-center gap-1">
          <span className={`w-1.5 h-1.5 rounded-full ${isWarning ? 'bg-red-500' : (seismicMode === 'mitigation' ? 'bg-red-500/50' : 'bg-green-500/50')} animate-ping`}></span>
          {titleText}
        </span>
        <Activity size={10} className={seismicMode === 'mitigation' ? 'text-red-500' : 'text-green-500'} />
      </div>

      <canvas 
        ref={canvasRef} 
        width={100} 
        height={100} 
        className="bg-[#0a0f0a] border border-[#222] rounded-full my-2 box-border"
      />

      <div className={`w-full p-1.5 rounded text-[8px] font-mono leading-tight transition-colors ${isWarning ? 'bg-red-500/20 border border-red-500 text-red-400 font-bold' : (seismicMode === 'mitigation' ? 'bg-red-500/10 border border-red-500/30 text-red-400' : 'bg-green-500/10 border border-green-500/30 text-green-400')}`}>
        <div className="flex items-center gap-1 mb-0.5">
          {isWarning ? <ShieldAlert size={10} className="animate-pulse text-red-500" /> : <AlertCircle size={10} />}
          <span>{lastEvent.title}</span>
        </div>
        <p className={`text-[7px] ${isWarning ? 'text-red-200' : 'text-white/70'} whitespace-nowrap overflow-hidden text-ellipsis`}>{lastEvent.desc}</p>
      </div>
    </div>
  );
}
