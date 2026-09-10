// src/components/Modules/CentralCommand.tsx
import React, { useState, useEffect } from "react";
import { Activity, Cpu, Server, Database, CheckCircle2, ShieldAlert, Key, RotateCcw, FileText, X, AlertCircle, Sliders, Settings } from "lucide-react";
import { useGlobalGeoContext } from "../../context/GlobalGeoContext";
import { motion } from "motion/react";
import { resetApiKeys } from "../../config/apiConfig";
import { useOptimizerStore } from "../../store/OptimizerStore";
import { useApiMonitorStore } from "../../store/ApiMonitorStore";
import { apiQueueManager } from "../../hooks/useApiQueue";
import { validateIdentity } from "../../lib/identityValidator";

export default function CentralCommand() {
  const { systemLogs, globalData, clearLogs, addLog, activeFileName, dataDimensions } = useGlobalGeoContext();
  const apiMode = useApiMonitorStore(state => state.apiMode);
  const { 
    isOptimizing, 
    optimizedParams, 
    optimizationLogs, 
    runLocalGradientDescent, 
    resetOptimizer,
    scenarioA,
    scenarioB,
    activeScenario,
    anomalyDetectionActive
  } = useOptimizerStore();

  const [fallbackReportHtml, setFallbackReportHtml] = useState<string | null>(null);

  const handleResetSimulasi = () => {
    resetOptimizer();
    clearLogs();
    addLog({
      type: "INFO",
      source: "REBOOT",
      message: "SYSTEM RESET: Interactive sessions, charts and runtime telemetry metrics safely recycled."
    });
  };

  const [showRoiChart, setShowRoiChart] = useState(false);
  const [isAnimatingLogs, setIsAnimatingLogs] = useState(false);
  const [exportConfirmationEnabled, setExportConfirmationEnabled] = useState(false);
  const [highlightDrift, setHighlightDrift] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [simulatedAnimateLogs, setSimulatedAnimateLogs] = useState<string[]>([]);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isAnimatingLogs) {
      addLog({
        type: "INFO",
        source: "ANIMATE",
        message: "ANOMALOUS DRIFT ANIMATION CORE UNLEASHED // CONVERGING LOGS..."
      });
      timer = setInterval(() => {
        const timestamp = new Date().toLocaleTimeString();
        const randDepth = Math.floor(1000 + Math.random() * 2500);
        const lossVal = (0.001 + Math.random() * 0.05).toFixed(5);
        const log = `[${timestamp}] [OPT-LOOP] SCAN DEPTH: ${randDepth}m // SOLVER LOSS: ${lossVal} // ACCURACY CONVERGED`;
        setSimulatedAnimateLogs(prev => [...prev.slice(-8), log]);
      }, 1200);
    } else {
      setSimulatedAnimateLogs([]);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isAnimatingLogs]);

  const exportToPDF = () => {
    if (exportConfirmationEnabled) {
      setShowExportModal(true);
    } else {
      executePdfExport();
    }
  };

  const executePdfExport = () => {
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
              flex-direction: column;
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
              opacity: 0.15;
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
                <span class="logo-title">GeoAI Pro v4.0</span>
                <span class="sys-tag">Sistem Geofisika Berbasis AI</span>
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
                    <span class="lbl font-bold">ACOUSTIC LIMIT VALUE</span>
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
                <span class="logo-title">GeoAI Pro v4.0</span>
                <span class="sys-tag">Sistem Geofisika Berbasis AI</span>
              </div>
              
              <div style="flex: 1;">
                <div class="title-section">III. LIVE HARDWARE TELEMETRY & SYSTEM STATE</div>
                <table style="margin-bottom: 20px;">
                  <thead>
                    <tr>
                      <th>Computational Node</th>
                      <th>State Code</th>
                      <th>Measured Metric Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Central CPU Allocation</td>
                      <td><span class="badge badge-active">NOMINAL</span></td>
                      <td><strong>${telemetry.cpuUsage.toFixed(1)}%</strong></td>
                    </tr>
                    <tr>
                      <td>GPGPU Mainframe Core Temp</td>
                      <td><span class="badge badge-active">NOMINAL</span></td>
                      <td><strong>${telemetry.gpuTemp.toFixed(1)}°C</strong></td>
                    </tr>
                    <tr>
                      <td>Swarm Vector Memory Ingest</td>
                      <td><span class="badge badge-active">SECURED</span></td>
                      <td><strong>${telemetry.memoryInfo.toFixed(1)} GB</strong></td>
                    </tr>
                    <tr>
                      <td>Intra-Cluster Network Ping Latency</td>
                      <td><span class="badge badge-active">FAST</span></td>
                      <td><strong>${telemetry.networkLatency} ms</strong></td>
                    </tr>
                    <tr>
                      <td>Drift Highlight Active Stance</td>
                      <td><span>${highlightDrift ? 'WARNING' : 'NONE'}</span></td>
                      <td><strong>${highlightDrift ? 'DRIFT 7.4% DETECTED' : 'STABLE (VAR < 2.3%)'}</strong></td>
                    </tr>
                  </tbody>
                </table>

                <div class="title-section">IV. RUNTIME COMPUTATIONAL TIME SERIES LOGS</div>
                <div style="max-height: 200px; overflow: hidden; border: 1px solid #e5e7eb; border-radius: 6px;">
                  <table style="margin-bottom: 0;">
                    <thead>
                      <tr>
                        <th style="width: 25%">System Timestamp</th>
                        <th style="width: 25%">Telemetry Node</th>
                        <th>Activity Log Entry</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${systemLogs.slice(-4).map((log, i) => `
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
                <span class="logo-title">GeoAI Pro v4.0</span>
                <span class="sys-tag">Sistem Geofisika Berbasis AI</span>
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

  const [telemetry, setTelemetry] = useState({
    cpuUsage: Math.random() * 20 + 30,
    memoryInfo: 14.2,
    diskSpace: 75.4,
    networkLatency: 45,
    gpuTemp: 41.5,
  });

  const handleRunOptimize = async () => {
    const dataset = globalData.wellLoggingData || [];
    
    const callAiExpert = async (params: any) => {
      const prompt = `Conduct expert geophysics appraisal. Justify these gradient-descent optimized boundaries:
- Acoustic impedance threshold: ${params.acousticImpedance} GPa*s/m
- Resistivity threshold: ${params.resistivityThreshold} Ohm-m
- Shale cutoff: ${params.shaleCutoff}%

Output a highly concise 3-sentence expert explanation.`;

      const payload = {
        message: prompt,
        globalData: globalData,
        history: [],
        apiKey: ""
      };
      
      const response = await apiQueueManager.enqueue("/api/master-synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const resData = await response.json();
      if (resData.success) {
        return resData.reply;
      }
      throw new Error(resData.error || "Synthesis failed");
    };

    await runLocalGradientDescent(dataset, apiMode === 'DUMMY', callAiExpert);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetry((prev) => ({
        ...prev,
        cpuUsage: Math.min(100, Math.max(10, prev.cpuUsage + (Math.random() * 10 - 5))),
        networkLatency: Math.floor(Math.random() * 20 + 35),
        gpuTemp: Math.min(85, Math.max(35, prev.gpuTemp + (Math.random() * 2 - 1))),
      }));
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col h-full text-white bg-[#0A0A0B] p-6 space-y-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-2 border-b border-[#222] pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight uppercase italic text-white flex items-center gap-3">
            <Activity className="text-[#00E5FF]" /> Central Command & Telemetry
          </h1>
          <p className="text-sm font-mono text-[#888] mt-1">GeoAI Pro v4.0 - Master Overview</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => {
              resetApiKeys();
              alert("EMERGENCY OVERRIDE: API Key forcefully rotated to next failover slot.");
            }}
            className="flex items-center gap-2 px-4 py-2 border border-red-500/50 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-bold uppercase rounded-lg transition-colors font-mono tracking-tight cursor-pointer"
            title="Force switch external API key if blocked"
          >
            <Key size={14} /> Force Key Sync
          </button>

          <button 
            onClick={handleResetSimulasi}
            className="flex items-center gap-2 px-4 py-2 border border-orange-500/40 bg-orange-500/10 hover:bg-orange-500/25 text-orange-400 text-xs font-bold uppercase rounded-lg transition-all font-mono tracking-tight cursor-pointer"
            title="RESET SIMULASI: Resets active session logs and chart thresholds without deleting persistent AI global knowledge database"
          >
            <RotateCcw size={14} /> Reset Simulasi
          </button>

          <button 
            onClick={exportToPDF}
            className="flex items-center gap-2 px-4 py-2 border border-blue-500/40 bg-blue-500/10 hover:bg-blue-500/25 text-blue-400 text-xs font-bold uppercase rounded-lg transition-all font-mono tracking-tight cursor-pointer"
            title="DOWNLOAD REPORT (PDF): Generates a geophysics-grade comprehensive analytical cover sheet and results bundle"
          >
            <FileText size={14} /> Download Report (PDF)
          </button>
          
          <div className="flex items-center gap-4 bg-[#111] px-4 py-2 rounded-lg border border-[#222]">
            <div className="font-mono text-xs text-[#00E5FF] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse" />
              SYSTEM ONLINE
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <TelemetryCard label="CPU Allocation" value={`${telemetry.cpuUsage.toFixed(1)}%`} icon={Cpu} color="#39FF14" />
        <TelemetryCard label="GPU Temp" value={`${telemetry.gpuTemp.toFixed(1)}°C`} icon={Server} color="#FF5722" />
        <TelemetryCard label="Vector Memory" value={`${telemetry.memoryInfo.toFixed(1)} GB`} icon={Database} color="#00E5FF" />
        <TelemetryCard label="Network Latency" value={`${telemetry.networkLatency} ms`} icon={Activity} color="#B554FF" />
      </div>

      {/* GEOPHYSICAL WORKSTATION VISUALIZER */}
      <div className="grid grid-cols-1 gap-6" id="final-boss-controls">
        {/* Expanded complete visualization/output panel */}
        <div className="bg-[#111] border border-zinc-850 rounded-xl p-6 shadow-xl flex flex-col justify-between min-h-[220px]">
          {showRoiChart ? (
            <div className="flex-1 flex flex-col justify-between h-full" id="drill-roi-chart">
              <div className="flex justify-between items-center mb-3 border-b border-[#222] pb-2">
                <span className="text-[10px] font-mono text-[#00E5FF] font-bold">DRILLING REGION OF INTEREST (ROI) FIELD INTENSITY</span>
                <span className="text-[9px] font-mono text-gray-500">Z-COORDINATE RATEME: 2.4X // DRILL MULTI-RAY SURVEY</span>
              </div>
              <div className="flex-1 bg-black/40 border border-[#222] rounded-lg p-4 flex items-center justify-center relative overflow-hidden h-[130px]">
                {/* SVG Area ROI graph with animate tags */}
                <svg width="100%" height="100%" viewBox="0 0 450 100" className="opacity-95" id="roi-svg-element">
                  <defs>
                    <linearGradient id="roiGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#00E5FF" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* Grid contour segments */}
                  <line x1="0" y1="20" x2="450" y2="20" stroke="#1c1c1f" strokeWidth="1" />
                  <line x1="0" y1="50" x2="450" y2="50" stroke="#1c1c1f" strokeWidth="1" />
                  <line x1="0" y1="80" x2="450" y2="80" stroke="#1c1c1f" strokeWidth="1" />
                  
                  {/* Prospectivity filled density trace */}
                  <path d="M 0,90 Q 50,42 100,75 T 200,32 T 300,85 T 400,28 Q 425,50 450,90 Z" fill="url(#roiGradient)" stroke="#00E5FF" strokeWidth="1.5" />
                  
                  {/* Interactive depth target cursor */}
                  <line x1="200" y1="10" x2="200" y2="90" stroke="#FF5722" strokeDasharray="3,3" strokeWidth="1.2">
                    <animate attributeName="opacity" values="0.3;1.0;0.3" dur="2s" repeatCount="indefinite" />
                  </line>
                  <circle cx="200" cy="32" r="4" fill="#FF5722">
                    <animate attributeName="r" values="3;6;3" dur="2s" repeatCount="indefinite" />
                  </circle>
                  
                  {/* Text labels */}
                  <text x="210" y="25" fill="#FF5722" fontSize="7" fontFamily="monospace" fontWeight="bold">TARGET EXPLORATORY DEPTH (2,100 M)</text>
                  <text x="210" y="35" fill="#888" fontSize="6" fontFamily="monospace">PROSPECT RATIO: 94.25% (HIGH PAY RES)</text>
                  <text x="10" y="85" fill="#444" fontSize="6" fontFamily="monospace">Borehole baseline limit matrix</text>
                </svg>
              </div>
              <div className="text-[10px] text-neutral-400 font-mono mt-3 leading-relaxed">
                ✦ Optimized drilling zone mapped at coordinate vector index: <strong>X:240 // Y:1,280</strong>. High fluid sand reservoir confidence.
              </div>
            </div>
          ) : isAnimatingLogs && simulatedAnimateLogs.length > 0 ? (
            <div className="flex-1 flex flex-col justify-between h-full" id="animate-optimizing-logs-pane">
              <div className="flex justify-between items-center mb-3 border-b border-[#222] pb-2">
                <span className="text-[10px] font-mono text-[#FF5722] font-bold animate-pulse">ANIMATED GRADIENT CONVERGENCE STREAM</span>
                <span className="text-[9px] font-mono text-gray-500">SOCKETS: CONNECTED // LOOP CONVERGENCE RATE: 1,200ms</span>
              </div>
              <div className="flex-1 bg-black/85 border border-[#FF5722] shadow-[0_0_8px_rgba(255,87,34,0.2)] rounded-lg p-4 font-mono text-[9px] text-[#FF5722]/95 overflow-y-auto space-y-1 h-[130px] scrollbar-thin transition-all duration-300">
                {simulatedAnimateLogs.map((log, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="text-[#FF5722] font-bold animate-pulse">&gt;&gt;</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-500">
              <Activity size={36} className="text-neutral-800 mb-3 animate-pulse" />
              <p className="text-xs font-semibold uppercase text-neutral-400 tracking-wider">Operations Feed Standby</p>
              <p className="text-[10px] font-mono text-neutral-600 mt-2 max-w-md mx-auto">
                Engage control switches inside the <span className="text-[#FF5722] font-bold">Settings Desk Command Tray</span> hover menu (located next to DYNAMIC SPECTRAL CALIBRATOR below) to visualize active borehole scans.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Auto-Optimize Engine Controller */}
      <div className="bg-[#111116] border border-[#222] p-6 rounded-xl flex flex-col md:flex-row gap-6 shadow-xl relative overflow-visible animate-fade-in" id="dynamic-auto-optimize-section">
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-ping" />
              <span className="text-xs font-mono font-bold tracking-widest text-[#00E5FF] uppercase">DYNAMIC SPECTRAL CALIBRATOR</span>
            </div>

            {/* Contextual hover-based Command Tray */}
            <div className="relative group/tray">
              <button 
                type="button"
                className="p-1.5 px-3 border border-zinc-850 bg-neutral-900/60 text-zinc-400 hover:text-[#FF5722] hover:border-[#FF5722]/50 rounded-lg transition-all duration-300 flex items-center gap-1.5 cursor-pointer font-mono text-[9px] uppercase tracking-wider shadow-inner"
                title="COMPILER SHUNTS & WORKSTATION SETTINGS"
              >
                <Settings size={12} className="animate-spin duration-1000" style={{ animationDuration: '6s' }} />
                <span>Settings Desk</span>
              </button>
              
              {/* Glassmorphic Command Tray */}
              <div 
                className="absolute right-0 top-full mt-2 w-[480px] bg-black/90 backdrop-blur-md border border-neutral-800 p-4 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.9),0_0_12px_rgba(255,87,34,0.06)] scale-95 opacity-0 pointer-events-none group-hover/tray:scale-100 group-hover/tray:opacity-100 group-hover/tray:pointer-events-auto transition-all duration-300 z-[999] flex flex-col gap-3"
                style={{ border: '1px solid rgba(255, 255, 255, 0.08)' }}
              >
                <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5 mb-1">
                  <span className="text-[10px] font-mono font-bold text-[#FF5722] uppercase tracking-widest flex items-center gap-1.5">
                    <Sliders size={11} className="text-[#FF5722]" />
                    Interactive Telemetry Shunts
                  </span>
                  <span className="text-[8px] font-mono text-zinc-500 font-bold uppercase tracking-wider">COMMAND TRAY</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2.5">
                  {/* Button 1: Add Drill ROI Chart */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowRoiChart(!showRoiChart);
                      addLog({ type: "INFO", source: "ROI", message: `Drill ROI Chart set to ${!showRoiChart ? 'CONNECTED' : 'DISCONNECTED'}` });
                    }}
                    className={`flex items-center justify-between px-3.5 py-2 rounded-lg text-[10px] font-mono font-bold uppercase transition-all duration-200 border cursor-pointer ${
                      showRoiChart 
                        ? "bg-[#FF5722]/15 border-[#FF5722] text-[#FF5722] shadow-[0_0_8px_rgba(255,87,34,0.1)]" 
                        : "bg-black/30 border-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-800"
                    }`}
                    id="btn-drill-roi"
                  >
                    <span>✦ Add Drill ROI Chart</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${showRoiChart ? "bg-[#FF5722] shadow-[0_0_6px_rgba(255,87,34,0.8)]" : "bg-neutral-800"}`} />
                  </button>

                  {/* Button 2: Animate Optimizing Logs */}
                  <button
                    type="button"
                    onClick={() => setIsAnimatingLogs(!isAnimatingLogs)}
                    className={`flex items-center justify-between px-3.5 py-2 rounded-lg text-[10px] font-mono font-bold uppercase transition-all duration-200 border cursor-pointer ${
                      isAnimatingLogs 
                        ? "bg-[#FF5722]/15 border-[#FF5722] text-[#FF5722] shadow-[0_0_8px_rgba(255,87,34,0.1)]" 
                        : "bg-black/30 border-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-800"
                    }`}
                    id="btn-animate-logs"
                  >
                    <span>✦ Animate Optimizing Logs</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${isAnimatingLogs ? "bg-[#FF5722] shadow-[0_0_6px_rgba(255,87,34,0.8)]" : "bg-neutral-800"}`} />
                  </button>

                  {/* Button 3: Add Export Confirmation */}
                  <button
                    type="button"
                    onClick={() => setExportConfirmationEnabled(!exportConfirmationEnabled)}
                    className={`flex items-center justify-between px-3.5 py-2 rounded-lg text-[10px] font-mono font-bold uppercase transition-all duration-200 border cursor-pointer ${
                      exportConfirmationEnabled 
                        ? "bg-[#FF5722]/15 border-[#FF5722] text-[#FF5722] shadow-[0_0_8px_rgba(255,87,34,0.1)]" 
                        : "bg-black/30 border-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-800"
                    }`}
                    id="btn-export-confirm"
                  >
                    <span>✦ Add Export Confirmation</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${exportConfirmationEnabled ? "bg-[#FF5722] shadow-[0_0_6px_rgba(255,87,34,0.8)]" : "bg-neutral-800"}`} />
                  </button>

                  {/* Button 4: Highlight Parameter Drift */}
                  <button
                    type="button"
                    onClick={() => {
                      setHighlightDrift(!highlightDrift);
                      addLog({ type: "WARN", source: "DRIFT", message: `Parameter drift highlights set to ${!highlightDrift ? 'ARMED' : 'STANDBY'}` });
                    }}
                    className={`flex items-center justify-between px-3.5 py-2 rounded-lg text-[10px] font-mono font-bold uppercase transition-all duration-200 border cursor-pointer ${
                      highlightDrift 
                        ? "bg-[#FF5722]/15 border-[#FF5722] text-[#FF5722] shadow-[0_0_8px_rgba(255,87,34,0.1)]" 
                        : "bg-black/30 border-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-800"
                    }`}
                    id="btn-param-drift"
                  >
                    <span>✦ Highlight Parameter Drift</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${highlightDrift ? "bg-[#FF5722] shadow-[0_0_6px_rgba(255,87,34,0.8)]" : "bg-neutral-800"}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <h2 className="text-xl font-bold font-sans text-white">Interactive Acoustic Impedance & Resistivity Optimizer</h2>
          <p className="text-xs text-[#888] leading-relaxed max-w-2xl">
            This module runs a localized, multi-phase gradient-descent solver on your active depth-logging traces. It minimizes separation errors to delineate true sandstone reservoirs while avoiding unsuited drilling sills. The final step triggers the Swarm Boardroom to deliver an instant geomechanical justification.
          </p>
          
          <div className="flex gap-4 pt-2">
            <button
              onClick={handleRunOptimize}
              disabled={isOptimizing}
              className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase font-mono tracking-wider transition-all flex items-center gap-2 ${
                isOptimizing 
                  ? "bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700/50" 
                  : "bg-[#00E5FF] text-black hover:bg-cyan-400 font-bold border border-[#00E5FF]/40 shadow-lg shadow-cyan-500/10"
              }`}
            >
              <Activity size={14} className={isOptimizing ? "animate-spin" : ""} />
              {isOptimizing ? "Calibrating..." : "Run Auto-Optimize"}
            </button>
            {optimizedParams && (
              <button
                onClick={resetOptimizer}
                className="px-4 py-2 border border-neutral-800 bg-neutral-900/50 hover:bg-neutral-900 text-[#888] hover:text-white text-xs font-bold uppercase rounded-lg transition-colors font-mono"
              >
                Clear Solution
              </button>
            )}
          </div>
        </div>

        {/* Solver output logs console */}
        <div className={`w-full md:w-[380px] bg-black/60 rounded-lg p-4 flex flex-col h-[180px] font-mono text-[10px] transition-all duration-300 border ${
          isOptimizing 
            ? "border-[#FF5722] shadow-[0_0_6px_rgba(255,87,34,0.25)] animate-pulse" 
            : "border-[#222]"
        }`}>
          <span className="text-[10px] text-gray-500 font-bold border-b border-[#222] pb-1.5 uppercase mb-2 flex justify-between">
            <span>Solver Monitor Logs</span>
            <span className={`${isOptimizing ? "text-[#FF5722]" : "text-[#00E5FF]"} text-[9px] font-bold`}>API MODE: {apiMode}</span>
          </span>
          <div className="flex-1 overflow-y-auto space-y-1 scrollbar-thin pr-1 text-gray-400">
            {optimizationLogs.length === 0 && (
              <p className="text-gray-600 italic mt-4 text-center">Awaiting optimizer kickoff signal...</p>
            )}
            {optimizationLogs.map((log, index) => (
              <div key={index} className="flex gap-1.5 py-0.5 border-b border-[#111] last:border-0">
                <span className="text-cyan-500 shrink-0">❖</span>
                <span className="break-all">{log}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommended Parameter Set Panel */}
      {optimizedParams && (
        <div className="bg-neutral-900/40 border border-[#FF9800]/20 rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex justify-between items-center border-b border-[#222] pb-3">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#FF9800]">Recommended Parameter Set</h3>
              <p className="text-[10px] font-mono text-gray-500">CONVERGED LOCAL SADDLE SOLUTION (CONFIDENCE: {optimizedParams.confidence}%)</p>
            </div>
            <span className="bg-green-500/10 hover:bg-green-500/20 text-green-400 text-[10px] font-bold font-mono px-2 py-1 rounded border border-green-500/20 uppercase animate-pulse">
              ✓ Implemented Globally
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`p-4 rounded-lg flex flex-col gap-1 transition-all duration-300 ${
              highlightDrift 
                ? "bg-amber-950/20 border-2 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.25)] animate-pulse" 
                : "bg-black/30 border border-[#222]"
            }`}>
              <span className="text-[10px] font-mono text-[#888] uppercase flex justify-between">
                <span>Impedance Cutoff Limit</span>
                {highlightDrift && <span className="text-amber-500 font-bold shrink-0 animate-bounce">✦ DRIFT RANGE (7.4%)</span>}
              </span>
              <span className="text-xl font-mono font-bold text-white">{optimizedParams.acousticImpedance} GPa*s/m</span>
              <span className="text-[9px] text-[#555] font-serif">Critical shear propagation acoustic threshold</span>
            </div>
            <div className={`p-4 rounded-lg flex flex-col gap-1 transition-all duration-300 ${
              highlightDrift 
                ? "bg-amber-950/20 border-2 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.25)] animate-pulse" 
                : "bg-black/30 border border-[#222]"
            }`}>
              <span className="text-[10px] font-mono text-[#888] uppercase flex justify-between">
                <span>Resistivity Threshold</span>
                {highlightDrift && <span className="text-amber-500 font-bold shrink-0 animate-bounce">✦ DRIFT RANGE (7.4%)</span>}
              </span>
              <span className="text-xl font-mono font-bold text-white">{optimizedParams.resistivityThreshold} Ohm-m</span>
              <span className="text-[9px] text-[#555] font-serif">Delineator for dynamic pay identification</span>
            </div>
            <div className={`p-4 rounded-lg flex flex-col gap-1 transition-all duration-300 ${
              highlightDrift 
                ? "bg-amber-950/20 border-2 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.25)] animate-pulse" 
                : "bg-black/30 border border-[#222]"
            }`}>
              <span className="text-[10px] font-mono text-[#888] uppercase flex justify-between">
                <span>Shale / Clay Cut-off</span>
                {highlightDrift && <span className="text-amber-500 font-bold shrink-0 animate-bounce">✦ DRIFT RANGE (7.4%)</span>}
              </span>
              <span className="text-xl font-mono font-bold text-white">{optimizedParams.shaleCutoff}%</span>
              <span className="text-[9px] text-[#555] font-serif">Gamma Ray volume-fraction sandstone guard</span>
            </div>
          </div>

          {optimizedParams.justification && (
            <div className="bg-[#151515] border-l-2 border-[#FF9800] p-4 rounded text-xs leading-relaxed text-gray-300 font-mono">
              <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">SWARM BOARDROOM JUSTIFICATION SUMMARY</p>
              <p>{optimizedParams.justification}</p>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1" id="system-dashboard-logs">
        <div className="bg-[#111] border border-zinc-800/80 rounded-xl flex flex-col p-6 shadow-lg overflow-hidden hover:border-[#FF5722]/30 hover:shadow-[0_0_8px_rgba(255,87,34,0.1)] transition-all duration-300">
          <h2 className="text-xs font-bold text-[#888] font-mono mb-4 uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5722] animate-pulse"></span>
            System Operations Log
          </h2>
          <div className="flex-1 overflow-y-auto space-y-2 pr-2 font-mono scrollbar-thin max-h-[220px]">
            {systemLogs.length === 0 ? (
              <p className="text-[#555] text-xs">No logs recorded yet...</p>
            ) : (
              [...systemLogs].reverse().map((log, i) => (
                <div key={i} className="text-[10px] break-words bg-[#161616] border-l-2 border-[#FF5722] p-2.5 transition-colors hover:bg-neutral-900/60 rounded-r">
                  <span className="text-[#888]">{isNaN(new Date(log.timestamp).getTime()) ? log.timestamp : new Date(log.timestamp).toLocaleTimeString()}</span>
                  <span className="text-[#FF5722] ml-2">[{log.source}]</span>
                  <span className="text-white ml-2">{log.message || (log as any).content || JSON.stringify(log)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-[#111] border border-zinc-800/80 rounded-xl flex flex-col p-6 shadow-lg overflow-hidden hover:border-[#FF5722]/30 hover:shadow-[0_0_8px_rgba(255,87,34,0.1)] transition-all duration-300">
          <h2 className="text-xs font-bold text-[#888] font-mono mb-4 uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Active Modules Status
          </h2>
          <div className="space-y-4">
            <StatusRow module="Seismic Data Engine" status="ACTIVE" load="42%" />
            <StatusRow module="Well Logging Array" status="STANDBY" load="0%" />
            <StatusRow module="Swarm Cognitive Core" status="ACTIVE" load="78%" />
            <StatusRow module="Spatial 3D Twin" status="READY" load="12%" />
            <StatusRow module="Electromagnetics" status="OFFLINE" load="0%" />
          </div>
        </div>
      </div>

      {fallbackReportHtml && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
          <div className="bg-[#121214] border border-[#2e2e30] rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden font-mono text-[10px] text-gray-300">
            <div className="p-4 border-b border-[#2e2e30] bg-[#161617] flex justify-between items-center shrink-0">
              <span className="text-orange-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle size={14} className="text-orange-400" />
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
            <div className="p-4 border-t border-[#2e2e30] bg-[#161617] flex gap-2 shrink-0 justify-end">
              <button
                type="button"
                onClick={() => setFallbackReportHtml(null)}
                className="px-4 py-2 bg-neutral-800 text-white rounded text-xs font-bold font-mono tracking-tight cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showExportModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[3000] flex items-center justify-center p-4 shadow-2xl" id="export-confirm-modal">
          <div className="bg-[#0B0B0C] border border-[#B554FF]/40 rounded-xl max-w-md w-full p-6 relative overflow-hidden font-mono text-xs text-gray-300">
            <div className="absolute -right-8 -top-8 w-24 h-24 bg-[#B554FF]/5 rounded-full blur-xl" />
            <div className="flex items-center gap-2 mb-4 border-b border-[#222] pb-3 text-white">
              <FileText className="text-[#B554FF]" size={18} />
              <span className="text-sm font-bold uppercase tracking-wider">GEOAI SECURED EXPORT DESK</span>
            </div>
            
            <div className="space-y-4">
              <p className="text-[11px] leading-relaxed">
                You have requested a secure geophysics survey report. Please confirm the following critical metadata fields and branding properties before dispatching the print mainframe:
              </p>
              
              <div className="bg-black/50 border border-[#222] p-3 rounded-lg space-y-2 text-[10px]">
                <div className="flex justify-between"><span className="text-[#666]">System Header:</span> <span className="text-white font-bold">GeoAI Pro v4.0</span></div>
                <div className="flex justify-between"><span className="text-[#666]">Security Stamp:</span> <span className="text-[#00E5FF] font-bold">Hasil ini dibuat oleh GEOAI by Ivan Hutabarat</span></div>
                <div className="flex justify-between"><span className="text-[#666]">Survey Base:</span> <span className="text-white">{activeFileName}</span></div>
                <div className="flex justify-between"><span className="text-[#666]">Drift Stance:</span> <span className={highlightDrift ? "text-amber-500 font-bold animate-pulse" : "text-emerald-500 font-bold"}>{highlightDrift ? "UNSTABLE DRIFT WARNING" : "STABLE NOMINAL"}</span></div>
              </div>

              <div className="p-3 bg-neutral-900/40 border border-neutral-800 rounded text-[10px] text-gray-500 leading-normal">
                Approved credentials authorize watermarking signature: // <strong>Ivan Krisopras Hutabarat</strong>.
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-3 border-t border-[#222] justify-end">
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 border border-neutral-800 bg-neutral-900/50 hover:bg-neutral-900 text-[#888] hover:text-white text-xs font-bold uppercase rounded-lg transition-colors cursor-pointer"
              >
                Cancel Draft
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowExportModal(false);
                  executePdfExport();
                }}
                className="px-4 py-2 bg-[#B554FF] hover:bg-[#a640ff] text-black text-xs font-bold uppercase rounded-lg transition-colors cursor-pointer"
              >
                Confirm & Generate Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TelemetryCard({ label, value, icon: Icon, color }: any) {
  return (
    <div className="bg-[#111] border border-[#222] p-6 rounded-xl flex flex-col gap-2 relative overflow-hidden group hover:border-[#333] transition-colors">
      <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Icon size={80} style={{ color }} />
      </div>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} style={{ color }} />
        <span className="text-xs font-mono font-bold uppercase text-[#888]">{label}</span>
      </div>
      <div className="text-3xl font-light font-mono" style={{ color: "white" }}>
        {value}
      </div>
    </div>
  );
}

function StatusRow({ module, status, load }: any) {
  const isActive = status === "ACTIVE";
  const isReady = status === "READY" || status === "STANDBY";
  return (
    <div className="flex items-center justify-between bg-[#161616] p-3 rounded-lg border border-[#333]">
      <div className="flex items-center gap-3">
        {isActive ? (
          <Activity size={14} className="text-[#00E5FF] animate-pulse" />
        ) : isReady ? (
          <CheckCircle2 size={14} className="text-[#39FF14]" />
        ) : (
          <ShieldAlert size={14} className="text-red-500" />
        )}
        <span className="text-sm font-semibold text-white">{module}</span>
      </div>
      <div className="flex items-center gap-4 text-xs font-mono">
        <span className="text-[#888]">Load: {load}</span>
        <span className={isActive ? "text-[#00E5FF]" : isReady ? "text-[#39FF14]" : "text-red-500"}>[{status}]</span>
      </div>
    </div>
  );
}
