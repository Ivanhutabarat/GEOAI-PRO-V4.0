import { jsPDF } from 'jspdf';

export const generateDashboardSnapshot = async (
  elementId: string = 'dashboard-capture-zone', 
  fileName: string = 'GEOAI_Survey_Report.pdf', 
  returnFormat?: 'base64' | 'blob' | 'save',
  contextData?: { logs: any[], data: any }
): Promise<string | Blob | void> => {
  // State Buffering/Pausing Pattern
  (window as any).isExportingPDF = true;
  
  await new Promise(resolve => setTimeout(resolve, 50));

  try {
    const pdf = new jsPDF('p', 'mm', 'a4'); 
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Formatting configuration
    const margin = 20;
    let cursorY = margin;
    const lineHeight = 6;
    
    // Add Watermark function (Prinstine, subtle design)
    const addWatermark = () => {
      // Subtle background watermark text
      pdf.setTextColor(246, 246, 248); // Very light grey
      pdf.setFontSize(32);
      pdf.setFont("helvetica", "bold");
      pdf.text("GEOAI PRO OFFICIAL", pdfWidth / 2, pdfHeight / 2 - 20, { angle: 30, align: "center" });
      pdf.setFontSize(20);
      pdf.text("by Administrator", pdfWidth / 2 + 5, pdfHeight / 2 + 10, { angle: 30, align: "center" });

      // Top and Bottom borders & labels for a professional telemetry look
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(140, 140, 145);
      
      // Header line
      pdf.setDrawColor(220, 220, 225);
      pdf.setLineWidth(0.2);
      pdf.line(margin, margin - 10, pdfWidth - margin, margin - 10);
      pdf.text("GEOAI PRO SCIENTIFIC RESEARCH & DEBATE LOGS", margin, margin - 12);
      pdf.text("COGNITIVE SWARM SYSTEM", pdfWidth - margin, margin - 12, { align: "right" });

      // Footer line
      pdf.line(margin, pdfHeight - margin + 10, pdfWidth - margin, pdfHeight - margin + 10);
      pdf.text("SECURED UNDER INTELLECTUAL CRITERIA // BY IVAN HUTABARAT", margin, pdfHeight - margin + 14);
      pdf.text("Page " + pdf.getNumberOfPages(), pdfWidth - margin, pdfHeight - margin + 14, { align: "right" });
    };

    // Helper to inject professional metadata and visual branding
    const injectProfessionalMetadata = () => {
      pdf.setProperties({
        title: "GEOAI PRO SCIENTIFIC REPORT",
        subject: "Laporan Analisis Data Geofisika, Percakapan Swarm, dan Konsultasi Sandbox",
        author: "Administrator",
        keywords: "GEOAI, Geofisika, AI, Report, Sensor, Swarm, Sandbox",
        creator: "GEOAI Pro V4 System"
      });
      addWatermark();
    };

    // Initialize document with metadata and first page watermark
    injectProfessionalMetadata();
    
    // Paper Title
    pdf.setTextColor(0, 0, 0); 
    pdf.setFontSize(22);
    pdf.setFont("helvetica", "bold");
    pdf.text("GEOAI PRO SCIENTIFIC REPORT", pdfWidth / 2, 32, { align: "center" });
    
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(80, 80, 80);
    pdf.text("Laporan Analisis Data Geofisika, Percakapan Swarm, dan Konsultasi Sandbox", pdfWidth / 2, 40, { align: "center" });

    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(255, 87, 34); // Accent orange
    pdf.text("by Administrator", pdfWidth / 2, 47, { align: "center" });
    
    pdf.setDrawColor(255, 87, 34);
    pdf.setLineWidth(0.6);
    pdf.line(margin, 52, pdfWidth - margin, 52);

    cursorY = 62;
    
    // Improved, super clean printer helper with seamless automatic pagination
    const addText = (text: string, size: number = 10, isBold: boolean = false, color: number[] = [0,0,0]) => {
      pdf.setFontSize(size);
      pdf.setFont("helvetica", isBold ? "bold" : "normal");
      pdf.setTextColor(color[0], color[1], color[2]);
      
      const lines = text.split('\n');
      lines.forEach(rawLine => {
        const splitText = pdf.splitTextToSize(rawLine, pdfWidth - margin * 2);
        splitText.forEach((line: string) => {
          if (cursorY + lineHeight > pdfHeight - margin - 5) {
            pdf.addPage();
            addWatermark();
            cursorY = margin + 15;
          }
          pdf.text(line, margin, cursorY);
          cursorY += lineHeight;
        });
      });
      cursorY += 1.5; // subtle paragraph spacing
    };

    // SECTION 1
    addText("1. EXECUTIVE SUMMARY", 13, true, [0, 90, 180]);
    addText("Laporan ini menyajikan rangkuman analisis geofisika multi-tab secara terpadu. Dokumen ini menggabungkan data inversi geofisika yang terstruktur, riwayat diskusi kolaboratif dari Swarm Room (Para Ahli Agen), serta transkrip konsultasi interaktif dari Sandbox (Master Geo-Synthesizer) demi pengambilan keputusan pengeboran yang aman dan optimal.", 10, false, [60, 60, 60]);
    cursorY += 4;
    
    // SECTION 2
    addText("2. DATA GEOFISIKA & HASIL SENSOR (FORMATED PREVIEW)", 13, true, [0, 90, 180]);
    
    if (contextData?.data) {
      const data = contextData.data;
      
      // Render Gravity Data if active
      if (data.gravityData && data.gravityData.length > 0) {
        addText("✦ Gravity & Magnetic Anomaly Logs:", 11, true, [255, 87, 34]);
        data.gravityData.slice(0, 5).forEach((row: any, i: number) => {
          if (Array.isArray(row)) {
            addText(`  - Titik ${i+1}: Elevasi: ${row[0]}m | Lintang: ${row[1]}° | Obs Gravity: ${row[2]} mGal | Free-Air Anomaly: ${row[3] || 'N/A'} mGal`, 9, false, [50, 50, 50]);
          } else if (row && typeof row === 'object') {
            addText(`  - Titik ${i+1}: Elevasi: ${row.elevation || 'N/A'}m | Lintang: ${row.latitude || 'N/A'}° | Obs: ${row.observedGravity || 'N/A'} | Anomali: ${row.freeAirAnomaly || 'N/A'}`, 9, false, [50, 50, 50]);
          }
        });
        if (data.gravityData.length > 5) {
          addText(`  ... [Sisa ${data.gravityData.length - 5} baris data disembunyikan untuk kerapian laporan]`, 8.5, false, [120, 120, 120]);
        }
        cursorY += 2;
      }

      // Render Electrical Data if active
      if (data.electricalData && data.electricalData.length > 0) {
        addText("✦ Electrical Resistivity Profile Data:", 11, true, [255, 87, 34]);
        data.electricalData.slice(0, 5).forEach((row: any, i: number) => {
          if (Array.isArray(row)) {
            addText(`  - Lintasan ${i+1}: Spacing: ${row[0]}m | Arus (I): ${row[1]}A | Hambatan Semu: ${row[2]} Ohm-m`, 9, false, [50, 50, 50]);
          } else if (row && typeof row === 'object') {
            addText(`  - Lintasan ${i+1}: Spacing: ${row.spacing || 'N/A'}m | Arus: ${row.current || 'N/A'} | Hambatan: ${row.resistivity || 'N/A'}`, 9, false, [50, 50, 50]);
          }
        });
        if (data.electricalData.length > 5) {
          addText(`  ... [Sisa ${data.electricalData.length - 5} baris data disembunyikan untuk kerapian laporan]`, 8.5, false, [120, 120, 120]);
        }
        cursorY += 2;
      }

      // Render Seismic Data if active
      if (data.seismicData && data.seismicData.length > 0) {
        addText("✦ Seismic Waveform Reflection Parameters:", 11, true, [255, 87, 34]);
        data.seismicData.slice(0, 5).forEach((row: any, i: number) => {
          if (Array.isArray(row)) {
            addText(`  - Pantulan ${i+1}: Waktu Tempuh: ${row[0]}ms | Amplitudo Sinyal: ${row[1]} | Sudut Fasa: ${row[2]}°`, 9, false, [50, 50, 50]);
          } else if (row && typeof row === 'object') {
            addText(`  - Pantulan ${i+1}: Waktu: ${row.time || 'N/A'} | Amplitudo: ${row.amplitude || 'N/A'} | Fasa: ${row.phase || 'N/A'}`, 9, false, [50, 50, 50]);
          }
        });
        if (data.seismicData.length > 5) {
          addText(`  ... [Sisa ${data.seismicData.length - 5} baris data disembunyikan untuk kerapian laporan]`, 8.5, false, [120, 120, 120]);
        }
        cursorY += 2;
      }

      // Fallback if no specific array data is shown
      const hasNoCoreArrays = (!data.gravityData || data.gravityData.length === 0) &&
                             (!data.electricalData || data.electricalData.length === 0) &&
                             (!data.seismicData || data.seismicData.length === 0);
      if (hasNoCoreArrays) {
        addText("Tidak ada data sensor mentah yang diunggah saat ini. Menampilkan status koordinat aktif:", 10, false, [80, 80, 80]);
        addText(`- Nama File Aktif: ${data.activeFileName || 'UNNAMED_DATATRACK'}`, 9.5, false, [50, 50, 50]);
        addText(`- Dimensi Simulasi: ${data.dataDimensions || '2D'}`, 9.5, false, [50, 50, 50]);
      }
    } else {
      addText("Tidak ada data sensor geofisika yang terekam dalam snapshot ini.", 10, false, [100, 100, 100]);
    }
    
    cursorY += 4;

    // SECTION 3: SWARM ROOM PANEL DEBATES
    addText("3. COGNITIVE SWARM ROOM - DISKUSI PANEL AGEN CERDAS", 13, true, [0, 90, 180]);
    try {
      const swarmSaved = localStorage.getItem("geoai_swarm_chat_v1");
      if (swarmSaved) {
        const swarmMessages = JSON.parse(swarmSaved);
        if (Array.isArray(swarmMessages) && swarmMessages.length > 0) {
          swarmMessages.forEach((m: any) => {
            const timeStr = m.timestamp || "";
            const agentStr = m.agent || m.role || "Ahli Geofisika";
            const roleStr = m.role ? ` (${m.role})` : "";
            const msgContent = m.content || "";
            
            addText(`[${timeStr}] ${agentStr}${roleStr}:`, 9.5, true, [230, 80, 0]);
            addText(`  ${msgContent}`, 9.5, false, [40, 40, 40]);
            cursorY += 1.5;
          });
        } else {
          addText("Belum ada riwayat percakapan diskusi panel di Swarm Room untuk sesi ini.", 10, false, [100, 100, 100]);
        }
      } else {
        addText("Belum ada riwayat percakapan diskusi panel di Swarm Room untuk sesi ini.", 10, false, [100, 100, 100]);
      }
    } catch (err) {
      console.warn("Failed to parse swarm chat for PDF:", err);
      addText("Belum ada riwayat percakapan diskusi panel di Swarm Room untuk sesi ini.", 10, false, [100, 100, 100]);
    }

    cursorY += 4;

    // SECTION 4: SANDBOX - CONSULTANT CHAT
    addText("4. MASTER GEO-SYNTHESIZER CORE - KONSULTASI SANDBOX", 13, true, [0, 90, 180]);
    try {
      const consultantSaved = localStorage.getItem("geoai_consultant_chat");
      if (consultantSaved) {
        const consultantHistory = JSON.parse(consultantSaved);
        if (Array.isArray(consultantHistory) && consultantHistory.length > 0) {
          consultantHistory.forEach((msg: any) => {
            const sender = msg.role === 'user' ? 'User (Geophysicist)' : 'Master Geo-Synthesizer (AI Core)';
            const senderColor = msg.role === 'user' ? [0, 120, 200] : [0, 150, 80];
            addText(`${sender}:`, 9.5, true, senderColor);
            addText(`  ${msg.content}`, 9.5, false, [40, 40, 40]);
            cursorY += 1.5;
          });
        } else {
          addText("Belum ada sesi konsultasi interaktif yang dilakukan di Sandbox untuk sesi ini.", 10, false, [100, 100, 100]);
        }
      } else {
        addText("Belum ada sesi konsultasi interaktif yang dilakukan di Sandbox untuk sesi ini.", 10, false, [100, 100, 100]);
      }
    } catch (err) {
      console.warn("Failed to parse consultant chat for PDF:", err);
      addText("Belum ada sesi konsultasi interaktif yang dilakukan di Sandbox untuk sesi ini.", 10, false, [100, 100, 100]);
    }

    cursorY += 4;

    // SECTION 5: SYSTEM DIAGNOSTIC LOGS
    addText("5. RUNTIME HARDWARE TELEMETRY & SYSTEM DIAGNOSTIC LOGS", 13, true, [0, 90, 180]);
    if (contextData?.logs && contextData.logs.length > 0) {
      contextData.logs.slice(-15).forEach((log) => {
        const time = log.timestamp || "Time";
        addText(`[${time}] ${log.source} (${log.type}):`, 9, true, [120, 120, 130]);
        addText(`  ${log.message}`, 9, false, [60, 60, 60]);
        cursorY += 1;
      });
    } else {
      addText("Tidak ada log sistem eksternal tambahan yang terekam.", 10, false, [100, 100, 100]);
    }

    if (returnFormat === 'base64') {
      return pdf.output('datauristring');
    } else if (returnFormat === 'blob') {
      return pdf.output('blob');
    } else {
      pdf.save(fileName);
    }
  } catch (error) {
    console.error("Failed to generate PDF report:", error);
    if (returnFormat) throw error; 
  } finally {
    (window as any).isExportingPDF = false;
  }
};
