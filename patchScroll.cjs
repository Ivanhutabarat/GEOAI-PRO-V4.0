const fs = require('fs');
let file = fs.readFileSync('src/cores/live/components/Modules/ManualBookSuite.tsx', 'utf8');

file = file.replace(/className="space-y-3 max-h-\[600px\] overflow-y-auto scrollbar-thin pr-1"/g, 'className="space-y-3"');
file = file.replace(/className="space-y-4 max-h-\[600px\] overflow-y-auto scrollbar-thin pr-1"/g, 'className="space-y-4"');
file = file.replace(/className="max-h-\[600px\] overflow-y-auto scrollbar-thin pr-1"/g, 'className=""');

fs.writeFileSync('src/cores/live/components/Modules/ManualBookSuite.tsx', file);
