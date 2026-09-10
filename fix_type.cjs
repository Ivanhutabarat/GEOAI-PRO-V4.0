const fs = require('fs');
const path = './src/cores/live/components/Modules/ManualBookSuite.tsx';
let content = fs.readFileSync(path, 'utf8');

const targetStr = `    eleven: {
      title: string;
      section1Title: string;
      section1Content: string;
      section2Title: string;
      section2Content: string;
      section3Title: string;
      section3Content: string;
    };`;

const replacement = `    eleven: {
      title: string;
      section1Title: string;
      section1Content: string;
      section2Title: string;
      section2Content: string;
      section3Title: string;
      section3Content: string;
    };
    twelve: {
      title: string;
      section1Title: string;
      section1Content: string;
      section2Title: string;
      section2Content: string;
      section3Title: string;
      section3Content: string;
    };`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacement);
  console.log("Fixed interface");
  fs.writeFileSync(path, content, 'utf8');
} else {
  console.log("Not found exact target string");
}
