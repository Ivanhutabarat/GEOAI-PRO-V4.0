const fs = require('fs');
const path = './src/cores/live/components/Modules/ManualBookSuite.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('twelve: StandardChapterSchema')) {
  content = content.replace(
    'eleven: StandardChapterSchema',
    'eleven: StandardChapterSchema,\n    twelve: StandardChapterSchema'
  );
  console.log("Added to schema");
}

if (!content.includes('twelve: {') && content.includes('eleven: {')) {
  // It might be formatted differently, let's just do a simpler replacement
  content = content.replace(
    '    eleven: {\n      title: string;\n      section1Title: string;\n      section1Content: string;\n      section2Title: string;\n      section2Content: string;\n      section3Title: string;\n      section3Content: string;\n    };\n  };',
    '    eleven: {\n      title: string;\n      section1Title: string;\n      section1Content: string;\n      section2Title: string;\n      section2Content: string;\n      section3Title: string;\n      section3Content: string;\n    };\n    twelve: {\n      title: string;\n      section1Title: string;\n      section1Content: string;\n      section2Title: string;\n      section2Content: string;\n      section3Title: string;\n      section3Content: string;\n    };\n  };'
  );
  console.log("Added to Dictionary interface");
}

if (!content.includes('CHAPTER XII')) {
  const enRegex = /section3Content: "These new components([^"]+)"\s*}\s*}\s*}\s*};\s*(const DICT)/;
  if (enRegex.test(content)) {
    const enRep = "section3Content: \"These new components$1\"\n      },\n      twelve: {\n        title: \"CHAPTER XII: System Resilience & UI Updates (UX Resilience v4.0)\",\n        section1Title: \"1. Module Isolation (Error Boundary) & Zod Validation\",\n        section1Content: \"Every main Route is now wrapped in a `ModuleErrorBoundary`. If a module crashes, it isolates the failure and keeps the rest of the application (like telemetry) alive without a White Screen of Death. The `zod` library also strictly validates objects to proactively catch missing keys and provide reliable fallbacks.\",\n        section2Title: \"2. Separate Asynchronous Loading (Code Splitting & Suspense Skeleton)\",\n        section2Content: \"Heavy component routes are split using `React.lazy()` and `<Suspense>`. When loading the 3D Spatial Twin, the UI instantly renders a `<ModuleSkeleton />` while downloading chunks in the background. This drastically trims the initial bundle size and provides instant tab interaction responses.\",\n        section3Title: \"3. Unit Testing Automation (Vitest & Pre-Commit)\",\n        section3Content: \"A Vitest testing environment (`dictionary.test.ts`) verifies the integrity of the 12 Chapters and supporting modules. This test script is statically hooked into `pre-commit-env-check.sh`—automatically blocking commits if the Data Dictionary structure is compromised.\"\n      }\n    }\n  }\n};\n$2";
    content = content.replace(enRegex, enRep);
    console.log("Added EN chapter");
  } else {
    // try to find where EN ends
    const altRegex = /section3Content: "These new components([^"]+)"\s*}\s*}\s*};\s*const DICT/g;
    console.log("Alternate match:", altRegex.test(content));
    const finalRegex = /section3Content: "These new components([\s\S]*?)};\s*const DICT/g;
    content = content.replace(finalRegex, "section3Content: \"These new components$1},\n      twelve: {\n        title: \"CHAPTER XII: System Resilience & UI Updates (UX Resilience v4.0)\",\n        section1Title: \"1. Module Isolation (Error Boundary) & Zod Validation\",\n        section1Content: \"Every main Route is now wrapped in a `ModuleErrorBoundary`. If a module crashes, it isolates the failure and keeps the rest of the application (like telemetry) alive without a White Screen of Death. The `zod` library also strictly validates objects to proactively catch missing keys and provide reliable fallbacks.\",\n        section2Title: \"2. Separate Asynchronous Loading (Code Splitting & Suspense Skeleton)\",\n        section2Content: \"Heavy component routes are split using `React.lazy()` and `<Suspense>`. When loading the 3D Spatial Twin, the UI instantly renders a `<ModuleSkeleton />` while downloading chunks in the background. This drastically trims the initial bundle size and provides instant tab interaction responses.\",\n        section3Title: \"3. Unit Testing Automation (Vitest & Pre-Commit)\",\n        section3Content: \"A Vitest testing environment (`dictionary.test.ts`) verifies the integrity of the 12 Chapters and supporting modules. This test script is statically hooked into `pre-commit-env-check.sh`—automatically blocking commits if the Data Dictionary structure is compromised.\"\n      }\n    }\n  }\n};\nconst DICT");
    console.log("Added EN chapter (fallback)");
  }
}

fs.writeFileSync(path, content, 'utf8');
console.log("Done");
