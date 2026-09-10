const fs = require('fs');
let file = fs.readFileSync('src/cores/live/MainDashboard.tsx', 'utf8');

// fix import
file = file.replace(/import \{ ModuleErrorBoundary \} from '\.\/components\/ModuleErrorBoundary';/, "import { ModuleErrorBoundary } from '../../components/ModuleErrorBoundary';");

// Insert WithError above MainDashboard
file = file.replace(/export default function MainDashboard\(\) \{/, "const WithError = ({ Component, name }: { Component: React.ComponentType<any>, name: string }) => (\n  <ModuleErrorBoundary moduleName={name}>\n    <Component />\n  </ModuleErrorBoundary>\n);\n\nexport default function MainDashboard() {");

fs.writeFileSync('src/cores/live/MainDashboard.tsx', file);
