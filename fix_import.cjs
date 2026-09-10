const fs = require('fs');
const file = 'src/cores/live/components/Modules/ManualBookSuite.tsx';
let code = fs.readFileSync(file, 'utf-8');
code = code.replace(/import React, \{ useState, useMemo, useEffect, useRef \} from 'react';/, 
  "import React, { useState, useMemo, useEffect, useRef } from 'react';\nimport { useAuth } from '../../../../context/AuthContext';");
fs.writeFileSync(file, code);
console.log("Import fixed!");
