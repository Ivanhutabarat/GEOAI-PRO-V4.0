const fs = require('fs');
let file = fs.readFileSync('src/cores/live/MainDashboard.tsx', 'utf8');

// Add Suspense and lazy imports
if (!file.includes('import React, { useState, useEffect, Component, ReactNode, Suspense, lazy }')) {
  file = file.replace(/import React, \{ useState, useEffect, Component, ReactNode \} from 'react';/, "import React, { useState, useEffect, Component, ReactNode, Suspense, lazy } from 'react';");
}
if (!file.includes('ModuleSkeleton')) {
  file = file.replace(/import \{ ModuleErrorBoundary \} from '\.\.\/\.\.\/components\/ModuleErrorBoundary';/, "import { ModuleErrorBoundary } from '../../components/ModuleErrorBoundary';\nimport { ModuleSkeleton } from '../../components/ModuleSkeleton';");
}

// Update WithError to include Suspense
file = file.replace(/<Component \/>/, "<Suspense fallback={<ModuleSkeleton name={name} />}>\n      <Component />\n    </Suspense>");

// Replace static imports of modules with React.lazy
const moduleReplacements = [
  "CentralCommand", "SeismicModule", "WellLoggingModule", "SpatialTwin",
  "SimulationModule", "SystemDiagnostics", "MasterGeoSynthesizer", "ManualBookSuite",
  "GravityMagModule", "SecurityAndWhatsAppPanel", "ElectricalEMModule", "GPRModule",
  "GeochemModule", "MeteorologyModule", "GroundwaterModule", "SoilPHModule",
  "BoreholeRadiometricModule", "GeotechnicalTiltExtensoModule", "GasAirQualityModule", "MiroFishModule"
];

for (const mod of moduleReplacements) {
  const regex = new RegExp(`import ${mod} from '\\./components/Modules/${mod}';`);
  file = file.replace(regex, `const ${mod} = lazy(() => import('./components/Modules/${mod}'));`);
}
// MasterGeoSynthesizer is from AIConsultantModule
file = file.replace(/import MasterGeoSynthesizer from '\.\/components\/Modules\/AIConsultantModule';/, "const MasterGeoSynthesizer = lazy(() => import('./components/Modules/AIConsultantModule'));");

fs.writeFileSync('src/cores/live/MainDashboard.tsx', file);
