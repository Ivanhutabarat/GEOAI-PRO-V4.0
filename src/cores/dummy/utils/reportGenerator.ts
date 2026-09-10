
export const generateReport = (data: any = {}) => {
  console.log("Generating offline dummy PDF Report...");
  const htmlContent = `
    <html>
      <head>
        <title>Offline Engineering Brief</title>
        <style>
          body { font-family: monospace; padding: 20px; background: #fafafa; color: #333; }
          h1 { border-bottom: 2px solid #333; padding-bottom: 10px; }
          .section { margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <h1>Offline Engineering Brief & Simulator Log</h1>
        <div class="section">
          <h3>Dummy Calculation Histories</h3>
          <p>Baseline 500+ mock agent logs processed. Deterministic 13-panel static renders generated.</p>
        </div>
        <div class="section">
          <h3>Fixed Sandbox States</h3>
          <pre>${JSON.stringify(data, null, 2)}</pre>
        </div>
      </body>
    </html>
  `;
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Offline_Engineering_Brief.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

