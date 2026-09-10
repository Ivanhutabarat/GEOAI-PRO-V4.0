import React, { useState } from 'react';
import { 
  X, 
  Sliders, 
  ShieldAlert, 
  FileDown, 
  Check, 
  TrendingUp, 
  Layers,
  Sparkles,
  Activity,
  Cpu,
  Database,
  Award,
  Zap
} from 'lucide-react';
import { useOptimizerStore } from '../../store/OptimizerStore';
import { useApiMonitorStore } from '../../store/ApiMonitorStore';
import { cn } from '../../lib/utils';
import { useGlobalGeoContext } from '../../context/GlobalGeoContext';
import { usePerformanceStore } from '../../store/PerformanceStore';
import { validateIdentity } from '../../lib/identityValidator';

interface AnalyticsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AnalyticsDrawer({ isOpen, onClose }: AnalyticsDrawerProps) {
  const { activeFileName, dataDimensions, systemLogs, addLog } = useGlobalGeoContext();
  const apiMode = useApiMonitorStore(state => state.apiMode);
  const { metricsList, clearMetrics } = usePerformanceStore();
  
  const { 
    anomalyDetectionActive, 
    toggleAnomalyDetection,
    scenarioA,
    scenarioB,
    activeScenario,
    setScenarioA,
    setScenarioB,
    setActiveScenario,
    optimizedParams
  } = useOptimizerStore();

  const [activeTab, setActiveTab] = useState<'compare' | 'performance' | 'settings'>('compare');
  const [fallbackReportHtml, setFallbackReportHtml] = useState<string | null>(null);

  // Triple-layer Purge Security State
  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);
  const [purgeStep, setPurgeStep] = useState<1 | 2 | 3>(1);
  const [purgeMathChallenge, setPurgeMathChallenge] = useState({ q: '', ans: 0 });
  const [purgeMathInput, setPurgeMathInput] = useState('');
  const [purgeEnglishInput, setPurgeEnglishInput] = useState('');
  const [purgeIdentityInput, setPurgeIdentityInput] = useState('');
  const [purgeError, setPurgeError] = useState('');
  const [purgeSuccess, setPurgeSuccess] = useState(false);

  const startPurgeWorkflow = () => {
    const num1 = Math.floor(Math.random() * 8) + 3;
    const num2 = Math.floor(Math.random() * 8) + 3;
    setPurgeMathChallenge({
      q: `What is ${num1} x ${num2}?`,
      ans: num1 * num2
    });
    setPurgeStep(1);
    setPurgeMathInput('');
    setPurgeEnglishInput('');
    setPurgeIdentityInput('');
    setPurgeError('');
    setPurgeSuccess(false);
    setIsPurgeModalOpen(true);
  };

  const handleVerifyStep = async () => {
    setPurgeError('');
    if (purgeStep === 1) {
      if (parseInt(purgeMathInput) !== purgeMathChallenge.ans) {
        setPurgeError('Incorrect calculation. Challenge verification failed.');
        return;
      }
      setPurgeStep(2);
    } else if (purgeStep === 2) {
      if (purgeEnglishInput.trim().toUpperCase() !== 'DELETE FOREVER') {
        setPurgeError('Input does not match target. You must type "DELETE FOREVER" exactly.');
        return;
      }
      setPurgeStep(3);
    } else if (purgeStep === 3) {
      if (purgeIdentityInput.trim() !== 'Ivan Krisopras Hutabarat') {
        setPurgeError('Unauthorized identity. You must type "Ivan Krisopras Hutabarat" exactly.');
        return;
      }
      try {
        const response = await fetch('/api/purge-knowledge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        if (data.success) {
          setPurgeSuccess(true);
          addLog({
            type: 'WARN',
            source: 'SECURITY',
            message: 'CRITICAL EVENT: AI learned global knowledge base file knowledge_base.json was physically purged from server memory by coordinator Ivan Krisopras Hutabarat.'
          });
        } else {
          setPurgeError(data.error || 'Server rejected request. Failed physically purging file.');
        }
      } catch (err: any) {
        setPurgeError(err.message || 'Network exception. Backend database unreachable.');
      }
    }
  };

  const exportToPDF = () => {
    validateIdentity();
    const activeParams = optimizedParams || (activeScenario === 'A' ? scenarioA : scenarioB);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>GEOAI PRO v4.0 - SURVEY BRIEF REPORT</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=JetBrains+Mono:wght@405;600&display=swap');
            
            * {
              box-sizing: border-box;
            }
            body {
              font-family: "Space Grotesk", sans-serif;
              background-color: #f3f4f6;
              color: #111827;
              margin: 0;
              padding: 0;
            }
            
            /* Page Break and A4 Printing Design Rules */
            .page {
              background-color: #ffffff;
              width: 210mm;
              height: 297mm;
              padding: 22mm 20mm;
              margin: 20px auto;
              position: relative;
              overflow: hidden;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
              display: flex;
              flex-col: column;
              justify-content: space-between;
            }
            
            @media print {
              body {
                background: #fff;
                margin: 0;
                padding: 0;
              }
              .page {
                margin: 0;
                box-shadow: none;
                page-break-after: always;
                break-after: page;
                height: 297mm;
                width: 210mm;
              }
            }
            
            /* Watermark Placement */
            .watermark {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg);
              font-size: 26px;
              color: #D3D3D3;
              font-weight: 800;
              opacity: 0.25;
              pointer-events: none;
              text-transform: uppercase;
              white-space: nowrap;
              letter-spacing: 1.5px;
              font-family: "Space Grotesk", sans-serif;
              z-index: 1;
            }
            
            /* Page Content Structure */
            .page-container {
              position: relative;
              z-index: 10;
              height: 100%;
              display: flex;
              flex-direction: column;
            }
            
            .header-info {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 2px solid #000;
              padding-bottom: 12px;
              margin-bottom: 25px;
            }
            
            .logo-title {
              font-size: 16px;
              font-weight: 700;
              letter-spacing: -0.5px;
              text-transform: uppercase;
              font-family: "Space Grotesk", sans-serif;
            }
            
            .sys-tag {
              font-family: "JetBrains Mono", monospace;
              font-size: 10px;
              font-weight: bold;
              background-color: #000;
              color: #00E5FF;
              padding: 2px 6px;
              border-radius: 3px;
            }
            
            .meta-bar {
              background-color: #f9fafb;
              border: 1px solid #e5e7eb;
              padding: 12px 16px;
              border-radius: 6px;
              font-family: "JetBrains Mono", monospace;
              font-size: 9px;
              display: grid;
              grid-template-cols: repeat(2, 1fr);
              gap: 8px;
              margin-bottom: 20px;
            }
            
            .meta-item {
              display: flex;
              justify-content: space-between;
            }
            .meta-item span:first-child {
              color: #6b7280;
              font-weight: bold;
            }
            .meta-item span:last-child {
              color: #111827;
              font-weight: bold;
            }
            
            .page-num {
              text-align: right;
              font-family: "JetBrains Mono", monospace;
              font-size: 9px;
              color: #9cb1c5;
              border-top: 1px dotted #ccc;
              padding-top: 8px;
            }
            
            h1.cover-title {
              font-size: 32px;
              font-weight: 700;
              text-transform: uppercase;
              line-height: 1.15;
              letter-spacing: -1px;
              margin-top: 50px;
              margin-bottom: 15px;
            }
            
            .line-decoration {
              height: 4px;
              background: linear-gradient(90deg, #FF5722 0%, #00E5FF 100%);
              border-radius: 2px;
              margin-bottom: 30px;
            }
            
            .desc-card {
              border: 1px solid #e5e7eb;
              border-left: 4px solid #FF5722;
              padding: 18px;
              background-color: #fafbfc;
              border-radius: 6px;
              margin-bottom: 20px;
              font-size: 11px;
              line-height: 1.6;
            }
            
            .title-section {
              font-family: "Space Grotesk", sans-serif;
              font-size: 14px;
              font-weight: 700;
              text-transform: uppercase;
              border-bottom: 1px solid #111827;
              padding-bottom: 4px;
              margin-top: 20px;
              margin-bottom: 12px;
              display: flex;
              justify-content: space-between;
            }
            
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
              font-family: "JetBrains Mono", monospace;
              font-size: 9px;
            }
            th, td {
              border: 1px solid #e5e7eb;
              padding: 8px 10px;
              text-align: left;
            }
            th {
              background-color: #f3f4f6;
              font-weight: 700;
              color: #374151;
            }
            
            .grid-params {
              display: grid;
              grid-template-cols: repeat(3, 1fr);
              gap: 15px;
              margin-bottom: 25px;
            }
            
            .param-card {
              border: 1px solid #e5e7eb;
              padding: 14px;
              background-color: #fafafa;
              border-radius: 6px;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
            }
            .param-card .lbl {
              font-size: 8px;
              color: #6b7280;
              font-weight: bold;
              text-transform: uppercase;
              margin-bottom: 4px;
            }
            .param-card .val {
              font-size: 14px;
              font-weight: 700;
              font-family: "JetBrains Mono", monospace;
              color: #FF5722;
            }
            
            .badge {
              display: inline-block;
              font-size: 8px;
              font-family: "JetBrains Mono", monospace;
              text-transform: uppercase;
              font-weight: bold;
              background-color: #fef3c7;
              color: #92400e;
              padding: 2px 6px;
              border-radius: 3px;
              border: 1px solid #fde68a;
            }
            
            .badge-active {
              background-color: #d1fae5;
              color: #065f46;
              border: 1px solid #a7f3d0;
            }
          </style>
        </head>
        <body>

          <!-- PAGE 1: COVER BOARDROOM DOCS -->
          <div class="page">
            <div class="watermark">Hasil ini dibuat oleh GEOAI by Ivan Hutabarat</div>
            <div class="page-container">
              <div class="header-info">
                <span class="logo-title">GeoAI Pro v4.0</span>
                <span class="sys-tag">Sistem Geofisika Berbasis AI</span>
              </div>
              
              <div style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
                <span style="font-family: 'JetBrains Mono', monospace; font-size: 9px; font-weight: bold; text-transform: uppercase; color: #FF5722; letter-spacing: 2px; display: block;">TECHNICAL SPECIFICATION INSIGHTS</span>
                <h1 class="cover-title">SURVEY & ANALYSIS DRILLING RECOMMENDATION</h1>
                <div class="line-decoration"></div>
                
                <div class="desc-card">
                  <strong>PROYEK SUMMARY STATEMENT:</strong><br>
                  Pristine geophysics simulation data compiled using advanced localized gradient-descent algorithms. Contains acoustic parameters validation, geological reservoir margins identification, and multi-agent boardroom consensus summaries. Checked and authenticated under enterprise criteria.
                </div>
                
                <div class="meta-bar">
                  <div class="meta-item"><span>PROYEK BRAND:</span> <span>GEOAI PRO INSTITUSIONAL v4.0</span></div>
                  <div class="meta-item"><span>KORDINATOR UTAMA:</span> <span>Ivan Krisopras Hutabarat</span></div>
                  <div class="meta-item"><span>BASIS ANALISIS:</span> <span>${activeFileName}</span></div>
                  <div class="meta-item"><span>SISTEM MODEL:</span> <span>Consensus Swarm Orchestration</span></div>
                  <div class="meta-item"><span>TANGGAL LOGGING:</span> <span>${new Date().toLocaleDateString()}</span></div>
                  <div class="meta-item"><span>TELEMETRY STANCE:</span> <span>${apiMode} PROTOCOL</span></div>
                </div>
              </div>
              
              <div class="page-num">LEMBAR SURVEY HALAMAN 1 DARI 4</div>
            </div>
          </div>

          <!-- PAGE 2: WAVEFORMS AND CHARTS VISUALIZATION LAYER -->
          <div class="page">
            <div class="watermark">Hasil ini dibuat oleh GEOAI by Ivan Hutabarat</div>
            <div class="page-container">
              <div class="header-info">
                <span class="logo-title">GeoAI Pro - Visual Analytics Panel</span>
                <span class="sys-tag">Spectrograms Twin Chart</span>
              </div>
              
              <div style="flex: 1;">
                <div class="title-section">II. SPECTRAL WAVELET & ANOMALY REGION</div>
                <p style="font-size: 10px; line-height: 1.5; color: #4b5563; margin-bottom: 20px;">
                  High-fidelity representation of core wave log variables. The green waveform trace denotes the Gamma Ray shale cutoff levels, and the blue trace illustrates Resistivity changes. Anomaly ranges highlight prospective deep fluid sand reservoirs.
                </p>

                <!-- SVG Graphics Render representation -->
                <div style="background-color: #0d0d11; border-radius: 8px; border: 1px solid #1e1e24; box-shadow: inset 0 2px 10px rgba(0,0,0,0.5); padding: 15px; display: flex; justify-content: center; align-items: center; height: 350px;">
                  <svg width="100%" height="100%" viewBox="0 0 500 300" style="background:#0F0F13;">
                    <!-- Grid Lines -->
                    <line x1="50" y1="30" x2="450" y2="30" stroke="#222" stroke-width="1" />
                    <line x1="50" y1="90" x2="450" y2="90" stroke="#222" stroke-width="1" />
                    <line x1="50" y1="150" x2="450" y2="150" stroke="#222" stroke-dasharray="3,3" stroke-width="1" />
                    <line x1="50" y1="210" x2="450" y2="210" stroke="#222" stroke-width="1" />
                    <line x1="50" y1="270" x2="450" y2="270" stroke="#222" stroke-width="1" />

                    <!-- Rule Axis -->
                    <line x1="50" y1="30" x2="50" y2="270" stroke="#444" stroke-width="1.5" />
                    <line x1="450" y1="30" x2="450" y2="270" stroke="#444" stroke-width="1.5" />

                    <!-- Legend -->
                    <text x="60" y="25" fill="#39FF14" font-family="monospace" font-size="8">✦ GAMMA RAY (GAPI)</text>
                    <text x="210" y="25" fill="#00E5FF" font-family="monospace" font-size="8">✦ RESISTIVITY (OHM-M)</text>
                    <text x="360" y="25" fill="#ef4444" font-family="monospace" font-size="8">✦ ANOMALY PAY CROSSOVER</text>

                    <!-- Reservoir Anomaly Zone Highlight -->
                    <rect x="180" y="30" width="140" height="240" fill="rgba(239, 68, 68, 0.15)" stroke="rgba(239, 68, 68, 0.3)" stroke-width="1" />
                    <text x="250" y="145" fill="#ef4444" font-family="monospace" font-size="8" text-anchor="middle" font-weight="bold">HIGH PAY RESERVOIR</text>
                    <text x="250" y="160" fill="#9cb1c5" font-family="monospace" font-size="7" text-anchor="middle">Z-Score cutoff > 2.0</text>

                    <!-- Waveform 1: Gamma Ray -->
                    <path d="M 50,150 Q 80,40 110,210 T 170,120 T 230,240 T 290,90 T 350,180 T 410,130 L 450,150" fill="none" stroke="#39FF14" stroke-width="1.8" />

                    <!-- Waveform 2: Resistivity -->
                    <path d="M 50,110 T 110,70 T 170,180 T 230,50 T 290,60 T 350,220 T 410,90 L 450,140" fill="none" stroke="#00E5FF" stroke-width="1.6" />

                    <!-- Cursor reference -->
                    <line x1="250" y1="30" x2="250" y2="270" stroke="#fff" stroke-dasharray="2,2" opacity="0.3" />
                  </svg>
                </div>
                
                <div class="grid-params" style="margin-top: 25px;">
                  <div class="param-card">
                    <span class="lbl">ACOUSTIC LIMIT VALUE</span>
                    <span class="val">${activeParams.acousticImpedance} GPa*s/m</span>
                  </div>
                  <div class="param-card">
                    <span class="lbl font-bold">RESISTIVITY THRESHOLD</span>
                    <span class="val">${activeParams.resistivityThreshold} Ohm-m</span>
                  </div>
                  <div class="param-card">
                    <span class="lbl text-[#374151]">VOLUMETRIC SHALE CUTOFF</span>
                    <span class="val">${activeParams.shaleCutoff}%</span>
                  </div>
                </div>
              </div>
              
              <div class="page-num">LEMBAR SURVEY HALAMAN 2 DARI 4</div>
            </div>
          </div>

          <!-- PAGE 3: DATA TABLES AND PERFORMANCE METRICS -->
          <div class="page">
            <div class="watermark">Hasil ini dibuat oleh GEOAI by Ivan Hutabarat</div>
            <div class="page-container">
              <div class="header-info">
                <span class="logo-title">GeoAI Pro - Operational Telemetry Log</span>
                <span class="sys-tag">Performance Ledger</span>
              </div>
              
              <div style="flex: 1;">
                <div class="title-section">III. SYSTEM PERFORMANCE METRICS LEADERS</div>
                <p style="font-size: 10px; line-height: 1.5; color: #4b5563; margin-bottom: 15px;">
                  Comprehensive compute record of active multi-core geophysics processes and local simulator instances. Confined constraints demonstrate ideal iteration speeds.
                </p>

                <!-- Settings values comparative layout -->
                <table style="margin-bottom: 25px;">
                  <thead>
                    <tr>
                      <th>Configuration Dimension Parameters</th>
                      <th>Scenario A Baseline</th>
                      <th>Scenario B Baseline</th>
                      <th>Active Calibrated Matrix</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Acoustic Shear Cutoff Model</td>
                      <td>${scenarioA.acousticImpedance} GPa*s/m</td>
                      <td>${scenarioB.acousticImpedance} GPa*s/m</td>
                      <td><strong>${activeParams.acousticImpedance} GPa*s/m</strong></td>
                    </tr>
                    <tr>
                      <td>Induction Resistivity Peak Cutoff</td>
                      <td>${scenarioA.resistivityThreshold} Ohm-m</td>
                      <td>${scenarioB.resistivityThreshold} Ohm-m</td>
                      <td><strong>${activeParams.resistivityThreshold} Ohm-m</strong></td>
                    </tr>
                    <tr>
                      <td>Shale Gamma Ray Cut-off</td>
                      <td>${scenarioA.shaleCutoff}%</td>
                      <td>${scenarioB.shaleCutoff}%</td>
                      <td><strong>${activeParams.shaleCutoff}%</strong></td>
                    </tr>
                  </tbody>
                </table>

                <div class="title-section">IV. RUNTIME COMPUTATIONAL TIME SERIES LOGS</div>
                <div style="max-height: 250px; overflow: hidden; border: 1px solid #e5e7eb; border-radius: 6px;">
                  <table style="margin-bottom: 0;">
                    <thead>
                      <tr>
                        <th style="width: 25%">System Timestamp</th>
                        <th style="width: 25%">Telemetry Node</th>
                        <th>Activity Log Entry</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${systemLogs.slice(-6).map((log, i) => `
                        <tr style="${i % 2 === 1 ? 'background-color:#f9fafb' : ''}">
                          <td>${log.timestamp}</td>
                          <td><span class="badge ${log.type === 'WARN' ? '' : 'badge-active'}">${log.source}</span></td>
                          <td>${log.message}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div class="page-num">LEMBAR SURVEY HALAMAN 3 DARI 4</div>
            </div>
          </div>

          <!-- PAGE 4: BOARDROOM DEBATES AND EXECUTIVE STATEMENTS SIGN-OFF -->
          <div class="page">
            <div class="watermark">Hasil ini dibuat oleh GEOAI by Ivan Hutabarat</div>
            <div class="page-container">
              <div class="header-info">
                <span class="logo-title">GeoAI Pro - Swarm Debate Recommendation</span>
                <span class="sys-tag">Formal Consensus</span>
              </div>
              
              <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                  <div class="title-section">V. SWARM EXPERT COMMITTEE BOARDROOM CONCLUSION</div>
                  
                  <div class="desc-card" style="border-left-color: #00E5FF; margin-bottom: 25px;">
                    <strong>SWARM SUMMARIZED REASONING:</strong><br>
                    <p style="margin: 6px 0 0 0; font-size: 10px;">
                      ${optimizedParams?.justification || "The collaborative multi-agent simulation core recommends locking boundaries at optimized saddles. The correlation between acoustic impedance drops and resistivity crossovers validates sandstone formations while preventing hydrostatic hazard leaks."}
                    </p>
                  </div>
                  
                  <div style="display: grid; grid-template-cols: 1fr 1fr; gap: 20px;">
                    <div style="border: 1px dashed #ccc; padding: 12px; border-radius: 6px;">
                      <strong style="font-size: 10px; display: block; border-bottom: 1px solid #eee; padding-bottom: 4px; margin-bottom: 6px; text-transform: uppercase;">Dr. Marcus Vance (Structural)</strong>
                      <p style="font-size: 9px; margin: 0; line-height: 1.4; color: #555;">
                        "The fault displacement calculations are structurally validated. Seismic bright spots align with our acoustic impedance model. Recommended coordinate ROI is clear for localized exploratory drilling."
                      </p>
                    </div>
                    <div style="border: 1px dashed #ccc; padding: 12px; border-radius: 6px;">
                      <strong style="font-size: 10px; display: block; border-bottom: 1px solid #eee; padding-bottom: 4px; margin-bottom: 6px; text-transform: uppercase;">Dr. Elena Rostova (Reservoir)</strong>
                      <p style="font-size: 9px; margin: 0; line-height: 1.4; color: #555;">
                        "High resistivity readings overlaying the sandstone matrix strongly signal a hydrocarbon-water interface. Core logging suggests excellent rock porosity coefficients."
                      </p>
                    </div>
                  </div>
                </div>

                <div style="margin-top: 40px; border-top: 1px solid #000; padding-top: 30px;">
                  <div style="display: flex; justify-content: space-between; align-items: top; font-size: 10px;">
                    <div>
                      <span style="display: block; color: #6b7280; text-transform: uppercase; font-family: monospace; font-size: 8px;">SURVEY COMMISSIONER</span>
                      <strong style="font-size: 12px; display: block; margin-top: 5px;">Ivan K. Hutabarat</strong>
                      <span style="font-size: 9px; font-style: italic; color: #555;">GeoAI Lead Geophysicist</span>
                    </div>
                    
                    <div style="text-align: right;">
                      <span style="display: block; color: #6b7280; text-transform: uppercase; font-family: monospace; font-size: 8px;">INTEGRITY SEAL</span>
                      <div style="border: 1px solid #000; padding: 4px 10px; margin-top: 5px; font-weight: bold; background-color: #fafafa; font-family: monospace; display: inline-block;">
                        GEOAI- v4.0 SECURE PASS
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="page-num">LEMBAR SURVEY HALAMAN 4 DARI 4</div>
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 800);
            }
          </script>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      setFallbackReportHtml(htmlContent);
      return;
    }

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Fallback Report modal if popup blocker triggered */}
      {fallbackReportHtml && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
          <div className="bg-[#121214] border border-[#2e2e30] rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden font-mono text-[10px] text-gray-300">
            <div className="p-4 border-b border-[#2e2e30] bg-[#161617] flex justify-between items-center shrink-0">
              <span className="text-orange-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                ⚠ POP-UP BLOCKER TRIGGERED: BRIEF RETRIEVED
              </span>
              <button 
                onClick={() => setFallbackReportHtml(null)}
                className="p-1 hover:bg-neutral-800 text-gray-400 hover:text-white rounded"
              >
                <X size={14} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto space-y-4 flex-1">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[9px] rounded leading-relaxed">
                Your browser restricted pop-ups inside this iframe preview. The complete surveyed geophysics summary has been safely compiled below.
              </div>
              <div 
                className="bg-white text-black p-4 rounded border border-neutral-300 overflow-x-auto select-all max-h-96"
                style={{ fontFamily: "monospace" }}
              >
                <pre className="whitespace-pre-wrap text-[9px] select-text">
                  {fallbackReportHtml.replace(/<[^>]*>/g, '')}
                </pre>
              </div>
            </div>
            <div className="p-4 border-t border-[#2e2e30] bg-[#161617] flex gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(fallbackReportHtml.replace(/<[^>]*>/g, ''));
                }}
                className="flex-1 bg-[#FF5722] hover:bg-orange-500 text-black py-2 font-bold uppercase rounded text-[10px] transition-all cursor-pointer"
              >
                Copy Raw Text Report
              </button>
              <button
                type="button"
                onClick={() => setFallbackReportHtml(null)}
                className="px-4 py-2 border border-neutral-700 text-gray-400 hover:text-white hover:bg-neutral-800 rounded text-[10px] transition-all cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[999] transition-opacity duration-300 pointer-events-auto"
        onClick={onClose}
      />

      <div className="fixed top-0 left-0 bottom-0 w-80 bg-[#121214] border-r border-[#2e2e30] flex flex-col z-[1000] shadow-2xl overflow-hidden font-sans">
        
        {/* Drawer Header */}
        <div className="p-4 border-b border-[#2e2e30] bg-[#161617] flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-[#00E5FF] rounded flex items-center justify-center">
              <TrendingUp size={11} className="text-black font-bold" />
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">📊 Analytic Master Suite</h2>
              <p className="text-[8px] font-mono text-gray-500">{activeFileName}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-neutral-800 text-gray-400 hover:text-white rounded transition-colors cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-3 text-center border-b border-[#2e2e30] text-[9px] font-mono tracking-tight font-bold shrink-0">
          <button 
            onClick={() => setActiveTab('compare')}
            className={cn(
              "p-2.5 border-b-2 uppercase transition-colors cursor-pointer",
              activeTab === 'compare' ? "border-[#00E5FF] text-[#00E5FF] bg-black/10" : "border-transparent text-gray-500 hover:text-white"
            )}
          >
            A/B Tool
          </button>
          <button 
            onClick={() => setActiveTab('performance')}
            className={cn(
              "p-2.5 border-b-2 uppercase transition-colors cursor-pointer",
              activeTab === 'performance' ? "border-[#00E5FF] text-[#00E5FF] bg-black/10" : "border-transparent text-gray-500 hover:text-white"
            )}
          >
            Perf Log
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={cn(
              "p-2.5 border-b-2 uppercase transition-colors cursor-pointer",
              activeTab === 'settings' ? "border-[#00E5FF] text-[#00E5FF] bg-black/10" : "border-transparent text-gray-500 hover:text-white"
            )}
          >
            Tuning
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin">
          
          {/* Section 1: Anomaly Detection Toggle */}
          <div className="bg-black/20 border border-[#2e2e30] p-4 rounded-lg space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-gray-400 font-mono flex items-center gap-1.5">
                <ShieldAlert size={12} className={cn(anomalyDetectionActive ? "text-red-500" : "text-gray-500")} />
                Anomaly Signal Mask
              </span>
              
              <button
                onClick={toggleAnomalyDetection}
                className={cn(
                  "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                  anomalyDetectionActive ? "bg-red-950 border-red-500/30" : "bg-neutral-800 border-neutral-700"
                )}
                title="Toggle Active Well anomalies"
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white ring-0 transition duration-200 ease-in-out mt-[2px]",
                    anomalyDetectionActive ? "translate-x-4 bg-red-400 shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "translate-x-0.5 bg-neutral-400"
                  )}
                />
              </button>
            </div>
            <p className="text-[9px] text-[#888] leading-normal font-sans">
              Isomorphic filtering monitors. Highlights depth sections where resistivity spikes over your threshold in sandstone gaps (GR low crossover) on charts in red alarms.
            </p>
          </div>

          {activeTab === 'compare' ? (
            /* TAB 1: COMPARE */
            <div className="space-y-6">
              
              {/* Scenario selector */}
              <div className="space-y-2">
                <span className="text-[9px] font-bold uppercase tracking-wider text-gray-500 font-mono">Active Comparative Model</span>
                <div className="grid grid-cols-2 gap-2 bg-black/45 p-1 rounded-lg border border-[#2e2e30]">
                  <button
                    onClick={() => setActiveScenario('A')}
                    className={cn(
                      "py-1.5 text-[10px] rounded font-mono font-bold uppercase transition-colors cursor-pointer",
                      activeScenario === 'A' 
                        ? "bg-[#00E5FF] text-black" 
                        : "text-gray-400 hover:text-white hover:bg-neutral-800/40"
                    )}
                  >
                    Scenario A (Mitigation)
                  </button>
                  <button
                    onClick={() => setActiveScenario('B')}
                    className={cn(
                      "py-1.5 text-[10px] rounded font-mono font-bold uppercase transition-colors cursor-pointer",
                      activeScenario === 'B' 
                        ? "bg-[#00E5FF] text-black" 
                        : "text-gray-400 hover:text-white hover:bg-neutral-800/40"
                    )}
                  >
                    Scenario B (Exploration)
                  </button>
                </div>
              </div>

              {/* Scenario A Inputs */}
              <div className="bg-black/10 border border-[#2e2e30]/50 p-3 rounded-lg space-y-3">
                <div className="flex items-center gap-1.5 border-b border-[#2e2e30] pb-2">
                  <Layers size={12} className="text-gray-500" />
                  <span className="text-[10px] font-bold text-gray-300 font-mono uppercase">Scenario A boundaries</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="text-[8px] font-mono text-gray-500 block uppercase mb-1">Acoustic impedance ({scenarioA.acousticImpedance} GPa*s/m)</label>
                    <input 
                      type="range" 
                      min="2.0" 
                      max="10.0" 
                      step="0.1"
                      value={scenarioA.acousticImpedance} 
                      onChange={(e) => setScenarioA({ acousticImpedance: parseFloat(e.target.value) })}
                      className="w-full accent-[#00E5FF] h-1" 
                    />
                  </div>
                  <div>
                    <label className="text-[8px] font-mono text-gray-500 block uppercase mb-1">Resistivity Threshold ({scenarioA.resistivityThreshold} Ωm)</label>
                    <input 
                      type="range" 
                      min="5" 
                      max="200" 
                      step="1.0"
                      value={scenarioA.resistivityThreshold} 
                      onChange={(e) => setScenarioA({ resistivityThreshold: parseFloat(e.target.value) })}
                      className="w-full accent-[#4CAF50] h-1" 
                    />
                  </div>
                  <div>
                    <label className="text-[8px] font-mono text-gray-500 block uppercase mb-1">Shale Cut-off ({scenarioA.shaleCutoff}%)</label>
                    <input 
                      type="range" 
                      min="10" 
                      max="90" 
                      step="1"
                      value={scenarioA.shaleCutoff} 
                      onChange={(e) => setScenarioA({ shaleCutoff: parseInt(e.target.value) })}
                      className="w-full accent-[#FF5722] h-1" 
                    />
                  </div>
                </div>
              </div>

              {/* Scenario B Inputs */}
              <div className="bg-black/10 border border-[#2e2e30]/50 p-3 rounded-lg space-y-3">
                <div className="flex items-center gap-1.5 border-b border-[#2e2e30] pb-2">
                  <Layers size={12} className="text-gray-500" />
                  <span className="text-[10px] font-bold text-gray-300 font-mono uppercase">Scenario B boundaries</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="text-[8px] font-mono text-gray-500 block uppercase mb-1">Acoustic impedance ({scenarioB.acousticImpedance} GPa*s/m)</label>
                    <input 
                      type="range" 
                      min="2.0" 
                      max="10.0" 
                      step="0.1"
                      value={scenarioB.acousticImpedance} 
                      onChange={(e) => setScenarioB({ acousticImpedance: parseFloat(e.target.value) })}
                      className="w-full accent-[#00E5FF] h-1" 
                    />
                  </div>
                  <div>
                    <label className="text-[8px] font-mono text-gray-500 block uppercase mb-1">Resistivity Threshold ({scenarioB.resistivityThreshold} Ωm)</label>
                    <input 
                      type="range" 
                      min="5" 
                      max="200" 
                      step="1.0"
                      value={scenarioB.resistivityThreshold} 
                      onChange={(e) => setScenarioB({ resistivityThreshold: parseFloat(e.target.value) })}
                      className="w-full accent-[#4CAF50] h-1" 
                    />
                  </div>
                  <div>
                    <label className="text-[8px] font-mono text-gray-500 block uppercase mb-1">Shale Cut-off ({scenarioB.shaleCutoff}%)</label>
                    <input 
                      type="range" 
                      min="10" 
                      max="90" 
                      step="1"
                      value={scenarioB.shaleCutoff} 
                      onChange={(e) => setScenarioB({ shaleCutoff: parseInt(e.target.value) })}
                      className="w-full accent-[#FF5722] h-1" 
                    />
                  </div>
                </div>
              </div>

              {/* Comparison table view */}
              <div className="bg-neutral-900 border border-[#2e2e30] rounded-lg p-3 font-sans !mt-6 space-y-2 shrink-0">
                <span className="text-[9px] font-mono text-gray-500 font-bold block uppercase border-b border-[#2e2e30] pb-1">Comparison Matrix Summary</span>
                <div className="text-[9px] space-y-1.5">
                  <div className="flex justify-between border-b border-neutral-900 pb-1">
                    <span className="text-gray-400 font-mono">Bound</span>
                    <span className="text-center font-bold text-gray-400">Model A</span>
                    <span className="text-center font-bold text-gray-400">Model B</span>
                    <span className="text-right font-bold text-[#FF9800]">Optimized</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-800">
                    <span className="text-gray-300 font-mono">ACOUSTIC</span>
                    <span>{scenarioA.acousticImpedance}</span>
                    <span>{scenarioB.acousticImpedance}</span>
                    <span className="text-[#FF9800] break-keep">{optimizedParams ? optimizedParams.acousticImpedance : "N/A"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-800">
                    <span className="text-gray-300 font-mono">RESISTIVITY</span>
                    <span>{scenarioA.resistivityThreshold}</span>
                    <span>{scenarioB.resistivityThreshold}</span>
                    <span className="text-[#FF9800] break-keep">{optimizedParams ? optimizedParams.resistivityThreshold : "N/A"}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-300 font-mono">SHALE_CUT</span>
                    <span>{scenarioA.shaleCutoff}%</span>
                    <span>{scenarioB.shaleCutoff}%</span>
                    <span className="text-[#FF9800] break-keep">{optimizedParams ? `${optimizedParams.shaleCutoff}%` : "N/A"}</span>
                  </div>
                </div>
              </div>

            </div>
          ) : activeTab === 'performance' ? (
            /* TAB 2: PERFORMANCE MONITOR PANEL */
            <div className="space-y-4 font-mono">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block font-mono">⚡ Performance Analytics Log</span>
              
              {metricsList.length === 0 ? (
                <div className="bg-black/25 rounded-lg border border-[#2e2e30] p-6 text-center text-[9px] text-[#666]">
                  Awaiting borehole simulator iterations. Trigger a swarm debate or auto-optimize run to log telemetry.
                </div>
              ) : (
                <>
                  {/* Summary Metric Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-neutral-900 border border-[#2e2e30] p-2 rounded text-center">
                      <span className="text-[7px] text-gray-500 uppercase block">Last Execution</span>
                      <span className="text-xs font-bold text-[#00E5FF]">{metricsList[metricsList.length - 1].executionTimeMs.toLocaleString()} ms</span>
                    </div>
                    <div className="bg-neutral-900 border border-[#2e2e30] p-2 rounded text-center">
                      <span className="text-[7px] text-gray-500 uppercase block">Browser Heap</span>
                      <span className="text-xs font-bold text-gray-300">{metricsList[metricsList.length - 1].memoryUsageMb}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-neutral-900 border border-[#2e2e30] p-2 rounded text-center">
                      <span className="text-[7px] text-gray-500 uppercase block">Accuracy delta</span>
                      <span className="text-xs font-bold text-green-400">{metricsList[metricsList.length - 1].accuracyScore}%</span>
                    </div>
                    <div className="bg-neutral-900 border border-[#2e2e30] p-2 rounded text-center">
                      <span className="text-[7px] text-gray-500 uppercase block">Council Conviction</span>
                      <span className="text-xs font-bold text-orange-400">{metricsList[metricsList.length - 1].confidenceLevel}%</span>
                    </div>
                  </div>

                  {/* Historical log list */}
                  <div className="border border-[#2e2e30] rounded-lg p-2 bg-neutral-950/40 space-y-1.5">
                    <div className="flex justify-between text-[7px] text-[#555] font-bold border-b border-[#2e2e30] pb-1 uppercase">
                      <span>Module</span>
                      <span>Telemetry/Size</span>
                      <span>Result</span>
                    </div>
                    <div className="space-y-1 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                      {metricsList.slice(-10).reverse().map((m, idx) => (
                        <div key={idx} className="flex justify-between text-[8px] py-1 border-b border-[#222] last:border-b-0 text-[#888]">
                          <span className="text-gray-300 uppercase shrink-0 truncate max-w-24">{m.activeModule}</span>
                          <span>
                            {m.executionTimeMs}ms | {m.memoryUsageMb.replace(' MB','')}M
                          </span>
                          <span className={cn(
                            "text-[7px] font-bold px-1 rounded-sm",
                            m.recalled 
                              ? "bg-cyan-950/40 text-cyan-400 border border-cyan-800/30" 
                              : "bg-neutral-800 text-gray-400"
                          )}>
                            {m.recalled ? "RECALLED" : "COMPUTE"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Clean stats metrics logs button */}
                  <button
                    onClick={clearMetrics}
                    className="w-full py-1 text-center bg-transparent border border-neutral-800 text-gray-500 hover:text-red-500 hover:border-red-500/30 text-[8px] uppercase font-bold tracking-wider rounded transition-all cursor-pointer"
                  >
                    Clear Performance History
                  </button>
                </>
              )}
            </div>
          ) : (
            /* TAB 3: SETTINGS (Grad Descent Settings) */
            <div className="space-y-5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 font-mono block">Optimizer Tuning Controls</span>
              
              <div className="bg-black/35 rounded-lg border border-[#2e2e30] p-3 space-y-4 font-mono text-[9px] text-gray-400 leading-normal">
                <div className="space-y-1">
                  <p className="font-bold text-white uppercase text-[8px]">gradient learn weight (rate)</p>
                  <p>Multiplier defining displacement velocity of variables along saddle surface slopes.</p>
                  <input type="range" defaultValue={15} className="w-full accent-cyan-400 h-1 mt-1" />
                </div>

                <div className="space-y-1">
                  <p className="font-bold text-white uppercase text-[8px]">tolerance limit (e-7)</p>
                  <p>Absolute numerical difference bound under which convergence solution stops loop iterations automatically.</p>
                  <input type="range" defaultValue={60} className="w-full accent-cyan-400 h-1 mt-1" />
                </div>
              </div>

              {optimizedParams && (
                <div className="bg-green-500/5 border border-green-500/15 p-3 rounded-lg flex gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500/15 text-green-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={10} />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-green-300 uppercase block font-mono">Saddle Minima Locked</span>
                    <p className="text-[9px] text-[#888] font-sans leading-relaxed">
                      Auto-Optimize solver successfully converged at tolerance limit. Visual parameters overlaying Gamma Ray and Resistivity traces.
                    </p>
                  </div>
                </div>
              )}

              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 font-mono block">AI Learned Swarm Knowledge</span>
              <div className="bg-black/35 rounded-lg border border-red-500/20 p-3 space-y-3 font-mono text-[9px] text-[#888] leading-normal">
                <p>
                  As you compute optimizations and coordinate debates, the sequential orchestrator saves parameters and debate consensus into a physical learned knowledge file <code className="text-gray-300">knowledge_base.json</code> on the server's file system for Intelligent Recall matching.
                </p>
                <button
                  type="button"
                  onClick={startPurgeWorkflow}
                  className="w-full py-2 bg-red-950 hover:bg-red-900 border border-red-500/30 text-red-400 hover:text-white rounded text-[9px] uppercase font-bold tracking-wider transition-all cursor-pointer font-mono"
                >
                  ⚠ PURGE AI KNOWLEDGE
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Export Brief Button */}
        <div className="p-4 border-t border-[#2e2e30] bg-[#161617] shrink-0">
          <button
            onClick={exportToPDF}
            className="w-full flex items-center justify-center gap-2 bg-[#FF5722] hover:bg-[#ff7043] text-black font-bold uppercase py-2.5 rounded-lg text-[10px] font-mono tracking-wider transition-all select-none shadow-lg cursor-pointer"
          >
            <FileDown size={14} />
            Export Analytical PDF
          </button>
        </div>

      </div>

      {/* TRIPLE-LAYER SECURITY PURGE MODAL */}
      {isPurgeModalOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[3000] flex items-center justify-center p-4 text-left">
          <div className="bg-[#121214] border border-red-500/30 rounded-xl max-w-md w-full flex flex-col shadow-2xl overflow-hidden font-mono text-[10px] text-gray-300">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-red-500/20 bg-red-950/20 flex justify-between items-center shrink-0">
              <span className="text-red-400 font-bold uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                ⚠ TRIPLE-LAYER DESTRUCTION CONTROL
              </span>
              {!purgeSuccess && (
                <button 
                  onClick={() => setIsPurgeModalOpen(false)}
                  className="p-1 hover:bg-neutral-800 text-gray-400 hover:text-white rounded"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 font-mono">
              {purgeSuccess ? (
                <div className="text-center py-6 space-y-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center font-bold text-lg border border-emerald-500/20">
                    ✓
                  </div>
                  <h3 className="text-white text-xs font-bold uppercase tracking-wider">
                    AI Knowledge Purged Successfully
                  </h3>
                  <p className="text-[9px] text-[#888] leading-relaxed max-w-sm mx-auto font-sans">
                    The file <code className="text-gray-300">knowledge_base.json</code> was physically deleted. Memory systems have been entirely returned to primitive defaults.
                  </p>
                  <button
                    onClick={() => {
                      setIsPurgeModalOpen(false);
                      onClose(); // Close parent drawer too
                    }}
                    className="mt-4 px-6 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded font-mono text-xs uppercase tracking-wider cursor-pointer"
                  >
                    Close Session Securely
                  </button>
                </div>
              ) : (
                <>
                  <div className="p-3 bg-red-500/5 border border-red-500/10 text-red-400 text-[9px] rounded leading-relaxed font-sans text-left">
                    <strong>CRITICAL DANGER:</strong> This operation deletes all AI learned swarm models parameters and boardroom debate caches permanently from the filesystem container. This operation cannot be undone.
                  </div>

                  {/* Progress Indicator */}
                  <div className="flex justify-between items-center bg-black/40 px-3 py-2 rounded border border-[#2e2e30]">
                    <span className="text-[#888]">Verification Stage:</span>
                    <div className="flex gap-2">
                      <span className={`px-1.5 py-0.5 rounded-sm font-bold ${purgeStep >= 1 ? 'bg-red-500/20 text-red-400 border border-red-500/20' : 'bg-neutral-800 text-[#555]'}`}>1. MATH</span>
                      <span className={`px-1.5 py-0.5 rounded-sm font-bold ${purgeStep >= 2 ? 'bg-red-500/20 text-red-400 border border-red-500/20' : 'bg-neutral-800 text-[#555]'}`}>2. TEXT</span>
                      <span className={`px-1.5 py-0.5 rounded-sm font-bold ${purgeStep >= 3 ? 'bg-red-500/20 text-red-400 border border-red-500/20' : 'bg-neutral-800 text-[#555]'}`}>3. IDENTITY</span>
                    </div>
                  </div>

                  {/* STEP 1: MATH CHALLENGE */}
                  {purgeStep === 1 && (
                    <div className="space-y-2 text-left">
                      <label className="text-white uppercase font-bold text-[8px] block">
                        STAGE 1: ALGORITHMIC COMPUTATION CHALLENGE
                      </label>
                      <p className="text-gray-400 text-[9px] leading-relaxed font-sans">
                        Solve the formula below to confirm human operator status prior to file deletions:
                      </p>
                      <div className="p-3 bg-neutral-900 border border-neutral-800 rounded text-center text-xs font-bold text-cyan-400 font-mono tracking-widest">
                        {purgeMathChallenge.q}
                      </div>
                      <input
                        type="number"
                        placeholder="Compute and enter product..."
                        value={purgeMathInput}
                        onChange={(e) => setPurgeMathInput(e.target.value)}
                        className="w-full bg-black/40 border border-[#2e2e30] rounded p-2.5 hover:border-[#444] focus:border-red-500 focus:outline-none font-mono text-[10px]"
                      />
                    </div>
                  )}

                  {/* STEP Stage 2: ENGLISH CONFIRMATION WORD */}
                  {purgeStep === 2 && (
                    <div className="space-y-2 text-left">
                      <label className="text-white uppercase font-bold text-[8px] block">
                        STAGE 2: INTENT DECLARATION CODE
                      </label>
                      <p className="text-gray-400 text-[9px] leading-relaxed font-sans">
                        Authorize final disposal parameters by entering the English confirmation key:
                      </p>
                      <div className="p-3 bg-neutral-900 border border-neutral-800 rounded text-center text-xs font-bold text-red-500 font-mono tracking-widest select-all">
                        DELETE FOREVER
                      </div>
                      <input
                        type="text"
                        placeholder="Type 'DELETE FOREVER' exactly as shown..."
                        value={purgeEnglishInput}
                        onChange={(e) => setPurgeEnglishInput(e.target.value)}
                        className="w-full bg-black/40 border border-[#2e2e30] rounded p-2.5 hover:border-[#444] focus:border-red-500 focus:outline-none font-mono text-[10px] uppercase placeholder:normal-case"
                      />
                    </div>
                  )}

                  {/* STEP Stage 3: THE CHIEF IDENTITY */}
                  {purgeStep === 3 && (
                    <div className="space-y-2 text-left">
                      <label className="text-white uppercase font-bold text-[8px] block">
                        STAGE 3: CHIEF COORDINATOR AUTHENTICATION
                      </label>
                      <p className="text-gray-400 text-[9px] leading-relaxed font-sans">
                        Verify your physical coordinator identity to append authorization flags to system logging profiles:
                      </p>
                      <div className="p-3 bg-neutral-900 border border-neutral-800 rounded text-center text-xs font-bold text-orange-400 font-mono tracking-widest select-all">
                        Ivan Krisopras Hutabarat
                      </div>
                      <input
                        type="text"
                        placeholder="Enter chief's full legal name..."
                        value={purgeIdentityInput}
                        onChange={(e) => setPurgeIdentityInput(e.target.value)}
                        className="w-full bg-black/40 border border-[#2e2e30] rounded p-2.5 hover:border-[#444] focus:border-red-500 focus:outline-none font-mono text-[10px]"
                      />
                    </div>
                  )}

                  {purgeError && (
                    <div className="p-2.5 rounded bg-red-950/40 border border-red-500/20 text-red-400 font-mono text-[9px] leading-relaxed text-left">
                      Error: {purgeError}
                    </div>
                  )}

                  {/* Actions buttons */}
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsPurgeModalOpen(false)}
                      className="flex-1 py-2 rounded bg-neutral-800 text-gray-400 border border-neutral-700 hover:text-white hover:bg-neutral-700 font-mono text-[9px] uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      ABORT DESTRUCTION
                    </button>
                    <button
                      type="button"
                      onClick={handleVerifyStep}
                      className="flex-1 py-2 rounded bg-red-900 hover:bg-red-800 text-white font-mono text-[9px] uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      {purgeStep === 3 ? "EXECUTE PURGE" : "VERIFY CODE"}
                    </button>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}
