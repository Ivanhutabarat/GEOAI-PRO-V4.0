const fs = require('fs');

const paths = [
  'src/cores/live/components/Modules/AnalyticsDrawer.tsx',
  'src/cores/dummy/components/Modules/AnalyticsDrawer.tsx'
];

for (const p of paths) {
  let code = fs.readFileSync(p, 'utf-8');

  if (!code.includes("import { useAuth }")) {
    code = code.replace(/import React, \{ useState, useEffect, useRef \} from 'react';/, 
      "import React, { useState, useEffect, useRef } from 'react';\nimport { useAuth } from '../../../../context/AuthContext';");
  }

  code = code.replace(/export default function AnalyticsDrawer\(\{ isLocked, setIsLocked \}: AnalyticsDrawerProps\) \{/,
    "export default function AnalyticsDrawer({ isLocked, setIsLocked }: AnalyticsDrawerProps) {\n  const { fullName, userEmail } = useAuth();\n  const userName = fullName || 'Operator';\n  const displayEmail = userEmail || 'operator@geoai.pro';");

  code = code.replace(/disetujui oleh Ivan Hutabarat/g, 'disetujui oleh ${userName}');
  code = code.replace(/smoothly by Ivan Hutabarat/g, 'smoothly by ${userName}');
  code = code.replace(/email terdaftar Ivan/g, 'email terdaftar ${userName}');
  code = code.replace(/Persetujuan Ivan diterima/g, 'Persetujuan ${userName} diterima');
  code = code.replace(/Halo <strong className="text-emerald-300">Ivan Hutabarat<\/strong>/g, 'Halo <strong className="text-emerald-300">{userName}</strong>');
  
  // Need to fix template literals for some of these strings since they are JSX or backticks.
  // 101:
  code = code.replace(/`GEOAI PRO SHIELD: Otorisasi tindakan "\$\{purgeTarget === 'identity_lock' \? 'Destruct Security Lock' : 'Purge AI Knowledge'\}" disetujui oleh \$\{userName\}\. OTP aman dilepaskan.`/g, 
    "`GEOAI PRO SHIELD: Otorisasi tindakan \\\"${purgeTarget === 'identity_lock' ? 'Destruct Security Lock' : 'Purge AI Knowledge'}\\\" disetujui oleh ${userName}. OTP aman dilepaskan.`");

  // 213, 214:
  code = code.replace(/`CRITICAL EVENT: Vessel Security Lock was securely authorized and re-seeded smoothly by \$\{userName\}.`/g, 
    "`CRITICAL EVENT: Vessel Security Lock was securely authorized and re-seeded smoothly by ${userName}.`");
  code = code.replace(/`CRITICAL EVENT: AI Knowledge Base was securely authorized and re-seeded smoothly by \$\{userName\}.`/g, 
    "`CRITICAL EVENT: AI Knowledge Base was securely authorized and re-seeded smoothly by ${userName}.`");

  // 854 JSX:
  code = code.replace(/Permintaan otorisasi aman telah dikirimkan ke email terdaftar \$\{userName\} \(<strong className="text-gray-200">i\*\*\*94@gmail\.com<\/strong>\)\./g,
    'Permintaan otorisasi aman telah dikirimkan ke email terdaftar {userName} (<strong className="text-gray-200">{displayEmail}</strong>).');

  // 904 JSX:
  code = code.replace(/Persetujuan \$\{userName\} diterima! Kode OTP aman dilepaskan pada pop-up layar\. Silakan masukkan di bawah ini:/g,
    'Persetujuan {userName} diterima! Kode OTP aman dilepaskan pada pop-up layar. Silakan masukkan di bawah ini:');

  fs.writeFileSync(p, code);
  console.log("Patched " + p);
}
