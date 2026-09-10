// src/components/Shared/SeismicRadar.tsx
import React, { useEffect, useRef } from 'react';
import { Network } from 'lucide-react';

export default function SeismicRadar() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const radarAngle = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Generate initial static targets
    const dots = Array.from({ length: 8 }).map((_, i) => ({
      x: (Math.random() - 0.5) * 0.8, // Normalized -0.4 to 0.4
      y: (Math.random() - 0.5) * 0.8,
      id: i,
      opacity: 0
    }));

    let animationFrameId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const maxRadius = Math.min(width, height) / 2 - 2;

      // Clear with slight fade for trail effect
      ctx.fillStyle = 'rgba(10, 10, 11, 0.15)';
      ctx.fillRect(0, 0, width, height);

      // Draw grid
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, maxRadius, 0, Math.PI * 2);
      ctx.arc(centerX, centerY, maxRadius * 0.66, 0, Math.PI * 2);
      ctx.arc(centerX, centerY, maxRadius * 0.33, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(centerX, centerY - maxRadius);
      ctx.lineTo(centerX, centerY + maxRadius);
      ctx.moveTo(centerX - maxRadius, centerY);
      ctx.lineTo(centerX + maxRadius, centerY);
      ctx.stroke();

      // Update and draw radar sweep
      radarAngle.current = (radarAngle.current + 0.05) % (Math.PI * 2);
      
      const sweepX = centerX + Math.cos(radarAngle.current) * maxRadius;
      const sweepY = centerY + Math.sin(radarAngle.current) * maxRadius;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(sweepX, sweepY);
      ctx.strokeStyle = '#00E5FF';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Radar gradient fan
      const gradient = ctx.createLinearGradient(centerX, centerY, sweepX, sweepY);
      gradient.addColorStop(0, 'rgba(0, 229, 255, 0.5)');
      gradient.addColorStop(1, 'rgba(0, 229, 255, 0)');
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, maxRadius, radarAngle.current - 0.4, radarAngle.current, false);
      ctx.lineTo(centerX, centerY);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Update dots opacity based on sweep collision and draw directly
      dots.forEach(dot => {
        const trueX = dot.x * maxRadius * 2;
        const trueY = dot.y * maxRadius * 2;
        const dotAngle = Math.atan2(trueY, trueX);
        const normalizedDotAngle = (dotAngle + Math.PI * 2) % (Math.PI * 2);
        
        let op = dot.opacity;
        // Simple angle distance check
        let diff = Math.abs(normalizedDotAngle - radarAngle.current);
        if (diff > Math.PI) diff = Math.PI * 2 - diff;

        if (diff < 0.2) {
          op = 1; // Hit
        } else {
          op = Math.max(0, op - 0.015); // Fade
        }
        dot.opacity = op;

        if (op > 0) {
          const dx = centerX + dot.x * maxRadius * 2;
          const dy = centerY + dot.y * maxRadius * 2;
          
          ctx.beginPath();
          ctx.arc(dx, dy, 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(57, 255, 20, ${op})`;
          ctx.fill();
          
          ctx.beginPath();
          ctx.arc(dx, dy, 12, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(57, 255, 20, ${op * 0.5})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-[#111] border border-[#222] rounded-xl shadow-lg relative overflow-hidden">
      <div className="absolute top-4 left-4 flex items-center gap-2">
        <Network size={14} className="text-[#00E5FF] animate-pulse" />
        <span className="text-xs font-mono font-bold text-[#888] uppercase tracking-widest">Active Scan</span>
      </div>
      <div className="mt-6 mb-2">
        <canvas 
          ref={canvasRef} 
          width={240} 
          height={240} 
          className="rounded-full bg-black border-2 border-[#1A1A1A] shadow-[0_0_20px_rgba(0,229,255,0.1)]"
        />
      </div>
      <div className="w-full text-center mt-2">
        <span className="text-[10px] font-mono text-[#555] uppercase tracking-[0.2em]">Seismic Array Active</span>
      </div>
    </div>
  );
}
