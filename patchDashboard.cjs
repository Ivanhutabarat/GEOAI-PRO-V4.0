const fs = require('fs');
let file = fs.readFileSync('src/cores/live/MainDashboard.tsx', 'utf8');

// Add import for ModuleErrorBoundary
if (!file.includes('ModuleErrorBoundary')) {
  file = file.replace(/import { cn } from '\.\/lib\/utils';/, "import { cn } from './lib/utils';\nimport { ModuleErrorBoundary } from './components/ModuleErrorBoundary';");
}

// Create a wrapper component
if (!file.includes('const WithError')) {
  file = file.replace(/export default function MainDashboard\(\) \{/, "const WithError = ({ Component, name }: { Component: React.ComponentType, name: string }) => (\n  <ModuleErrorBoundary moduleName={name}>\n    <Component />\n  </ModuleErrorBoundary>\n);\n\nexport default function MainDashboard() {");
}

// Replace each Route element with WithError
file = file.replace(/element=\{<CentralCommand \/>\}/, "element={<WithError Component={CentralCommand} name=\"Central Command\" />}");
file = file.replace(/element=\{<SeismicModule \/>\}/, "element={<WithError Component={SeismicModule} name=\"Seismic Module\" />}");
file = file.replace(/element=\{<WellLoggingModule \/>\}/, "element={<WithError Component={WellLoggingModule} name=\"Well Logging\" />}");
file = file.replace(/element=\{<SpatialTwin \/>\}/, "element={<WithError Component={SpatialTwin} name=\"Spatial Twin 3D\" />}");
file = file.replace(/element=\{<MiroFishModule \/>\}/, "element={<WithError Component={MiroFishModule} name=\"MiroFish Analytics\" />}");
file = file.replace(/element=\{<GravityMagModule \/>\}/, "element={<WithError Component={GravityMagModule} name=\"Gravity & Magnetic\" />}");
file = file.replace(/element=\{<ElectricalEMModule \/>\}/, "element={<WithError Component={ElectricalEMModule} name=\"Electrical & EM\" />}");
file = file.replace(/element=\{<GPRModule \/>\}/, "element={<WithError Component={GPRModule} name=\"GPR Radar\" />}");
file = file.replace(/element=\{<GeochemModule \/>\}/, "element={<WithError Component={GeochemModule} name=\"Geochemistry\" />}");
file = file.replace(/element=\{<MeteorologyModule \/>\}/, "element={<WithError Component={MeteorologyModule} name=\"Meteorology\" />}");
file = file.replace(/element=\{<GroundwaterModule \/>\}/, "element={<WithError Component={GroundwaterModule} name=\"Groundwater\" />}");
file = file.replace(/element=\{<SoilPHModule \/>\}/, "element={<WithError Component={SoilPHModule} name=\"Soil & pH\" />}");
file = file.replace(/element=\{<BoreholeRadiometricModule \/>\}/, "element={<WithError Component={BoreholeRadiometricModule} name=\"Borehole Radiometric\" />}");
file = file.replace(/element=\{<GeotechnicalTiltExtensoModule \/>\}/, "element={<WithError Component={GeotechnicalTiltExtensoModule} name=\"Geotechnical Tilt & Extenso\" />}");
file = file.replace(/element=\{<GasAirQualityModule \/>\}/, "element={<WithError Component={GasAirQualityModule} name=\"Gas & Air Quality\" />}");
file = file.replace(/element=\{<MasterGeoSynthesizer \/>\}/, "element={<WithError Component={MasterGeoSynthesizer} name=\"Master Geo-Synthesizer\" />}");
file = file.replace(/element=\{<SimulationModule \/>\}/, "element={<WithError Component={SimulationModule} name=\"Simulation Engine\" />}");
file = file.replace(/element=\{<SystemDiagnostics \/>\}/, "element={<WithError Component={SystemDiagnostics} name=\"System Diagnostics\" />}");
file = file.replace(/element=\{<SecurityAndWhatsAppPanel \/>\}/, "element={<WithError Component={SecurityAndWhatsAppPanel} name=\"Security & WhatsApp Panel\" />}");
file = file.replace(/element=\{<ManualBookSuite \/>\}/, "element={<WithError Component={ManualBookSuite} name=\"Manual Book Suite\" />}");

fs.writeFileSync('src/cores/live/MainDashboard.tsx', file);
