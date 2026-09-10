const fs = require('fs');
let code = fs.readFileSync('src/cores/live/components/Modules/ManualBookSuite.tsx', 'utf-8');

// Inside ManualBookSuite.tsx, replace Kepala Teknis and other mentions inside the component
code = code.replace(/Kepala Teknis Ivan Krisopras Hutabarat/g, '${userName}');
code = code.replace(/Ivan Krisopras Hutabarat/g, '${userName}');
code = code.replace(/Ivan's/g, "${userName}'s");

// But wait, some of these are inside RAW_DICT which is outside the component so we can't use `${userName}` literally as a JS variable.
// I will just replace "Ivan Krisopras Hutabarat" with "Operator" or "Administrator" in RAW_DICT.
