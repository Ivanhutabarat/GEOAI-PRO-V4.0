const fs = require('fs');
let file = fs.readFileSync('src/cores/live/components/Modules/ManualBookSuite.tsx', 'utf8');

// Find the block from "{/* Chapter 10 Accordion */}" down to the "</div>" before ")} \n {/* TAB 2:"
// Since I know the exact structure, let's just use a regex to capture Chapter 10 and move it up one level.

const regex = /(\s*\{\/\* Chapter 10 Accordion \*\/[\s\S]*?)(?=\s*\)\}\s*\{\/\* TAB 2)/;
const match = file.match(regex);

if (match) {
  const ch10Text = match[1];
  
  // Remove it from its current position
  file = file.replace(ch10Text, '');
  
  // Now we need to insert it inside the `<div className="space-y-3">`. 
  // We know that `<div className="space-y-3">` ends right before `)} \n {/* TAB 2:`
  // Let's replace `</div>\n          )}\n\n          {/* TAB 2:` with `\n${ch10Text}\n            </div>\n          )}\n\n          {/* TAB 2:`
  
  // Let's refine the replacement to be very safe
  file = file.replace(/(\s*<\/div>\s*\)\}\s*\{\/\* TAB 2)/, (m) => {
    return ch10Text + m;
  });
  
  fs.writeFileSync('src/cores/live/components/Modules/ManualBookSuite.tsx', file);
  console.log("Fixed!");
} else {
  console.log("Not found!");
}
