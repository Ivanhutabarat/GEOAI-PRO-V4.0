const fs = require('fs');
let code = fs.readFileSync('src/cores/live/components/Modules/ManualBookSuite.tsx', 'utf-8');

code = code.replace(/import React, \{ useState, useEffect \} from 'react';/, 
  "import React, { useState, useEffect } from 'react';\nimport { useAuth } from '../../../../context/AuthContext';");

// Inside ManualBookSuite
code = code.replace(/export default function ManualBookSuite\(\) \{/,
  "export default function ManualBookSuite() {\n  const { fullName } = useAuth();\n  const userName = fullName || 'Operator';");

// Replacements
code = code.replace(/a: "Halo Ivan! Untuk menguji ekspor PDF gabungan/g, 'a: `Halo ${userName}! Untuk menguji ekspor PDF gabungan');
// Ensure it closes correctly
code = code.replace(/tanpa visual tearing\.",/g, 'tanpa visual tearing.`,');

fs.writeFileSync('src/cores/live/components/Modules/ManualBookSuite.tsx', code);
console.log("Patched ManualBookSuite.tsx");
