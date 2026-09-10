const fs = require('fs');
let code = fs.readFileSync('src/components/Shared/AgentCompanion.tsx', 'utf-8');

code = code.replace(/import React, \{ useState, useEffect, useRef \} from 'react';/, 
  "import React, { useState, useEffect, useRef } from 'react';\nimport { useAuth } from '../../context/AuthContext';");

// Inside AgentCompanion
code = code.replace(/export default function AgentCompanion\(\{ isLoading \}: AgentCompanionProps\) \{/,
  "export default function AgentCompanion({ isLoading }: AgentCompanionProps) {\n  const { fullName } = useAuth();\n  const userName = fullName || 'Operator';");

// Replacements
code = code.replace(/"Ready for your commands, Ivan!"/g, '`Ready for your commands, ${userName}!`');
code = code.replace(/"Welcome back, Ivan!"/g, '`Welcome back, ${userName}!`');
code = code.replace(/"Outstanding dataset, Ivan! That report is flawless."/g, '`Outstanding dataset, ${userName}! That report is flawless.`');
code = code.replace(/"This UI design is absolutely beautiful, Ivan!"/g, '`This UI design is absolutely beautiful, ${userName}!`');

// We have to be careful with GESTURE_LIST since it's outside. Let's make GESTURE_LIST a function that takes userName
code = code.replace(/const GESTURE_LIST: Record<AgentGesture, GestureDefinition> = \{/g, 'const getGestureList = (userName: string): Record<AgentGesture, GestureDefinition> => ({');
code = code.replace(/  ROUTE_CLICK: \{ name: "Module Hop", category: "Auto-Trigger", emoji: "🚀", description: "Points virtual laser to active selection", comment: "Module shifted! Initializing specific sub-surface datasets." \}\n\};/g, '  ROUTE_CLICK: { name: "Module Hop", category: "Auto-Trigger", emoji: "🚀", description: "Points virtual laser to active selection", comment: "Module shifted! Initializing specific sub-surface datasets." }\n});');

// Now replace usages of GESTURE_LIST with GESTURE_LIST(userName)
code = code.replace(/GESTURE_LIST\[gesture\]/g, 'getGestureList(userName)[gesture]');
code = code.replace(/Object\.entries\(GESTURE_LIST\)/g, 'Object.entries(getGestureList(userName))');

// State initialization
code = code.replace(/const \[dialogText, setDialogText\] = useState\("Hello Ivan! Ready to conquer geological anomalies today\? Tap any emote to play with my movements!"\);/,
  'const [dialogText, setDialogText] = useState(`Hello ${userName}! Ready to conquer geological anomalies today? Tap any emote to play with my movements!`);');

code = code.replace(/setDialogText\(getGestureList\(userName\)\[gesture\]\?\.comment \|\| "Ready, Ivan!"\);/g, 'setDialogText(getGestureList(userName)[gesture]?.comment || `Ready, ${userName}!`);');

code = code.replace(/setDialogText\("Hold on! Re-routing our primary satellites and calling Ivan's remote line..."\);/g, "setDialogText(`Hold on! Re-routing our primary satellites and calling ${userName}'s remote line...`);");
code = code.replace(/const reply = data\.reply \|\| "I encountered a sub-space error, Ivan\. Try again\.";/g, 'const reply = data.reply || `I encountered a sub-space error, ${userName}. Try again.`;');
code = code.replace(/setDialogText\("Safely repositioned at new coordinates, Ivan!"\);/g, 'setDialogText(`Safely repositioned at new coordinates, ${userName}!`);');

fs.writeFileSync('src/components/Shared/AgentCompanion.tsx', code);
console.log("Patched AgentCompanion.tsx");
