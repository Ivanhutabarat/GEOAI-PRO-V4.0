const fs = require('fs');
let file = fs.readFileSync('src/cores/live/components/Modules/ManualBookSuite.tsx', 'utf8');

file = file.replace(/h-full overflow-y-auto scrollbar-thin"/, 'flex-1 min-h-0 overflow-y-auto scrollbar-thin"');
fs.writeFileSync('src/cores/live/components/Modules/ManualBookSuite.tsx', file);
