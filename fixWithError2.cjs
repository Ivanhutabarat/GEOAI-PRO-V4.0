const fs = require('fs');
let file = fs.readFileSync('src/cores/live/MainDashboard.tsx', 'utf8');

file = file.replace(/function MainDashboard\(\) \{/, "const WithError = ({ Component, name }: { Component: React.ComponentType<any>, name: string }) => (\n  <ModuleErrorBoundary moduleName={name}>\n    <Component />\n  </ModuleErrorBoundary>\n);\n\nfunction MainDashboard() {");

fs.writeFileSync('src/cores/live/MainDashboard.tsx', file);
