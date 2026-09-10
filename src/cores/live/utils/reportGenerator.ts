
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generateReport = async (data: any = {}) => {
  console.log("Generating Live Deployment Chronicle PDF...");
  
  try {
    // Attempt to capture the app body or main canvas
    const captureElement = document.querySelector('.main-app-container') || document.body;
    const canvas = await html2canvas(captureElement as HTMLElement, {
      scale: 1.5,
      useCORS: true,
      backgroundColor: '#0a0a0c',
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.8);
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    // Add Executive Header
    pdf.setFillColor(20, 20, 20);
    pdf.rect(0, 0, pdfWidth, 20, 'F');
    pdf.setTextColor(255, 87, 34); // Brand Orange
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.text("GEOAI PRO V4.0 - AUTOMATED EXECUTIVE REPORT", 10, 14);

    pdf.addImage(imgData, 'JPEG', 0, 25, pdfWidth, pdfHeight);
    pdf.save('GeoAI_Pro_Executive_Report.pdf');
    console.log("PDF Export Complete");
  } catch (err) {
    console.error("PDF Generation Failed", err);
    // Fallback to HTML if canvas capture fails
    exportToHTML(data);
  }
};

const exportToHTML = (data: any) => {
  const htmlContent = `
    <html>
      <head>
        <title>Live Deployment Chronicle</title>
        <style>
          body { font-family: monospace; padding: 20px; background: #0a0a0c; color: #00E5FF; }
          h1 { border-bottom: 2px solid #00E5FF; padding-bottom: 10px; text-transform: uppercase; }
          .section { margin-bottom: 20px; border: 1px solid #222; padding: 15px; }
          pre { color: #aaa; white-space: pre-wrap; word-wrap: break-word; }
        </style>
      </head>
      <body>
        <h1>High-Fidelity Live Deployment Chronicle</h1>
        <div class="section">
          <h3>Swarm Debate Transcripts & 3D Inversion Mesh Deltas</h3>
          <p>Status: ACTIVE REAL-TIME POLLING</p>
          <p>Log Matrices & Geophysical Anomalies secured.</p>
        </div>
        <div class="section">
          <h3>Geo-Sync Log Matrices</h3>
          <pre>${JSON.stringify(data, null, 2)}</pre>
        </div>
      </body>
    </html>
  `;
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Live_Deployment_Chronicle.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
