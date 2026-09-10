const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');
code = code.replace(/app\.get\('\/api\/whatsapp\/qr', authenticateToken,/g, "app.get('/api/whatsapp/qr',");
fs.writeFileSync('server.ts', code);
