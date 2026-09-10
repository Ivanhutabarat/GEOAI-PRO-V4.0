const fs = require('fs');
const paths = [
  'src/cores/live/components/Modules/AnalyticsDrawer.tsx',
  'src/cores/dummy/components/Modules/AnalyticsDrawer.tsx'
];

for (const file of paths) {
  let code = fs.readFileSync(file, 'utf-8');
  if (!code.includes("import { useAuth }")) {
    code = code.replace(/import React, \{ useState, useEffect \} from 'react';/, 
      "import React, { useState, useEffect } from 'react';\nimport { useAuth } from '../../../../context/AuthContext';");
  }
  fs.writeFileSync(file, code);
  console.log("Fixed " + file);
}
