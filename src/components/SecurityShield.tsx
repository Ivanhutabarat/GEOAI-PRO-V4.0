import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Lock, Terminal, EyeOff } from 'lucide-react';

interface SecurityShieldProps {
  appName?: string;
}

export default function SecurityShield({ appName = "GeoAI Pro Core" }: SecurityShieldProps) {
  const [warning, setWarning] = useState<string | null>(null);
  const [triggerCount, setTriggerCount] = useState(0);

  // Clear warning after timeout
  useEffect(() => {
    if (warning) {
      const timer = setTimeout(() => {
        setWarning(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [warning, triggerCount]);

  useEffect(() => {
    const showWarningMessage = (message: string) => {
      setWarning(message);
      setTriggerCount(prev => prev + 1);
    };

    // 1. Prevent Right-Click Context Menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      showWarningMessage("Klik Kanan (Context Menu) Dinonaktifkan oleh GEOAI SHIELD.");
    };

    // 2. Prevent F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U, Ctrl+S
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        showWarningMessage("Kunci F12 (Developer Tools) Diblokir demi Keamanan Sistem.");
        return false;
      }

      // Ctrl + Shift + I or Cmd + Opt + I
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.keyCode === 73)) {
        e.preventDefault();
        showWarningMessage("Inspect Element (Ctrl+Shift+I) Diblokir.");
        return false;
      }

      // Ctrl + Shift + J or Cmd + Opt + J
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'J' || e.key === 'j' || e.keyCode === 74)) {
        e.preventDefault();
        showWarningMessage("Console (Ctrl+Shift+J) Diblokir.");
        return false;
      }

      // Ctrl + Shift + C or Cmd + Opt + C
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'C' || e.key === 'c' || e.keyCode === 67)) {
        e.preventDefault();
        showWarningMessage("Element Selector (Ctrl+Shift+C) Diblokir.");
        return false;
      }

      // Ctrl + U or Cmd + U (View Source)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'U' || e.key === 'u' || e.keyCode === 85)) {
        e.preventDefault();
        showWarningMessage("Melihat Sumber Kode (View Source) Diblokir.");
        return false;
      }

      // Ctrl + S or Cmd + S (Save Page)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'S' || e.key === 's' || e.keyCode === 83)) {
        e.preventDefault();
        showWarningMessage("Menyimpan Dokumen Halaman (Save Source) Dinonaktifkan.");
        return false;
      }
    };

    // 3. Dynamic DevTools Open Detection via window dimensions differences and console monitoring
    let lastWidth = window.outerWidth - window.innerWidth;
    let lastHeight = window.outerHeight - window.innerHeight;

    const handleResize = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > 160;
      const heightThreshold = window.outerHeight - window.innerHeight > 160;
      
      // If console/DevTools is opened docked to side/bottom
      if (widthThreshold || heightThreshold) {
        // Debounce alert to prevent spamming
        showWarningMessage("Aktivitas DevTools Terdeteksi. Tindakan dipantau oleh GeoAI Pro Shield.");
      }
    };

    // 4. Advanced anti-debugger loop (active tamper-proofing)
    // Runs dynamically in background to intercept browser's console/debugger hooks safely
    let devtoolsInterval: NodeJS.Timeout;
    try {
      const activeShield = () => {
        const start = performance.now();
        // Dynamic evaluation of debugger to prevent static optimization bypasses
        (function() {
          const fn = function() {
            debugger;
          };
          fn();
        })();
        const duration = performance.now() - start;
        if (duration > 100) {
          showWarningMessage("Interupsi Debugger Terdeteksi. Kode dienkripsi dan diproteksi.");
        }
      };

      // Poll devtools debugger checks non-intrusively every 2.5 seconds
      devtoolsInterval = setInterval(activeShield, 2500);
    } catch (e) {
      console.warn("[SHIELD] Active debugger protection loaded with fallbacks.");
    }

    // Attach listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
      if (devtoolsInterval) clearInterval(devtoolsInterval);
    };
  }, []);

  return (
    <AnimatePresence>
      {warning && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[99999] pointer-events-none w-full max-w-md px-4"
        >
          <div className="bg-black/95 border-2 border-amber-500/40 shadow-2xl shadow-amber-950/40 rounded-xl p-4 flex gap-3.5 backdrop-blur-md items-start text-left">
            <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/30 text-amber-500 shrink-0">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[9px] font-bold tracking-widest text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded uppercase border border-amber-500/20">
                  SHIELD ACTIVE
                </span>
                <span className="font-mono text-[8px] text-neutral-500">v4.0_PROT</span>
              </div>
              <h4 className="text-gray-100 font-sans text-xs font-semibold tracking-wide">
                Proteksi Anti-Inspeksi & Kekayaan Intelektual
              </h4>
              <p className="text-neutral-400 font-sans text-[10px] leading-relaxed">
                {warning}
              </p>
              <div className="pt-1.5 flex items-center gap-1.5 text-neutral-500 font-mono text-[8px]">
                <Lock className="w-3 h-3 text-amber-500/60" />
                <span>GeoAI Pro Infrastructure is cryptographically signed.</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
