const fs = require('fs');
let code = fs.readFileSync('src/components/Shared/AgentCompanion.tsx', 'utf-8');

code = code.replace(/export default function AgentCompanion\(\{ isLoading = false \}: AgentCompanionProps\) \{/,
  "export default function AgentCompanion({ isLoading = false }: AgentCompanionProps) {\n  const { fullName } = useAuth();\n  const userName = fullName || 'Operator';");

fs.writeFileSync('src/components/Shared/AgentCompanion.tsx', code);
console.log("Fixed AgentCompanion.tsx");
