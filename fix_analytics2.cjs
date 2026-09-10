const fs = require('fs');
const paths = [
  'src/cores/live/components/Modules/AnalyticsDrawer.tsx',
  'src/cores/dummy/components/Modules/AnalyticsDrawer.tsx'
];

for (const file of paths) {
  let code = fs.readFileSync(file, 'utf-8');
  code = code.replace(/export default function AnalyticsDrawer\(\{ isOpen, onClose \}: AnalyticsDrawerProps\) \{/,
    "export default function AnalyticsDrawer({ isOpen, onClose }: AnalyticsDrawerProps) {\n  const { fullName, userEmail } = useAuth();\n  const userName = fullName || 'Operator';\n  const displayEmail = userEmail || 'operator@geoai.pro';");
  fs.writeFileSync(file, code);
  console.log("Fixed " + file);
}
