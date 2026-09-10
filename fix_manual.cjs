const fs = require('fs');
let code = fs.readFileSync('src/cores/live/components/Modules/ManualBookSuite.tsx', 'utf-8');
if (!code.includes('import { useAuth }')) {
  code = code.replace(/import React, \{ useState, useMemo, useEffect, useRef \} from 'react';/, 
    "import React, { useState, useMemo, useEffect, useRef } from 'react';\nimport { useAuth } from '../../../../context/AuthContext';");
  fs.writeFileSync('src/cores/live/components/Modules/ManualBookSuite.tsx', code);
  console.log("Fixed ManualBookSuite.tsx");
}
