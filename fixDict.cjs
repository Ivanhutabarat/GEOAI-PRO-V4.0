const fs = require('fs');
let file = fs.readFileSync('src/cores/live/components/Modules/ManualBookSuite.tsx', 'utf8');

// For ID
file = file.replace(/(\n\s*\}\n\s*)\},\n\s*ten: \{/, '$1,\n      ten: {');
// But wait, the end of `ten` is:
//     }
//   },
//   en: {
file = file.replace(/(\n\s*\}\n\s*)\},\n\s*en: \{/, '$1    }\n  },\n  en: {');

// For EN
file = file.replace(/(\n\s*\}\n\s*)\},\n\s*ten: \{/, '$1,\n      ten: {'); // since there are two matches
// And the end of `ten` for EN:
//     }
// };
file = file.replace(/(\n\s*\}\n)\};/, '$1    }\n  }\n};');

fs.writeFileSync('src/cores/live/components/Modules/ManualBookSuite.tsx', file);
