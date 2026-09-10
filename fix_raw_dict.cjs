const fs = require('fs');
const path = './src/cores/live/components/Modules/ManualBookSuite.tsx';
let content = fs.readFileSync(path, 'utf8');

const idCh11End = `        section3Content: "Komponen-komponen baru ini (\`GasSafetyModule.tsx\`, \`GeomechanicsModule.tsx\`, dan \`SeismicModule.tsx\`) ditanamkan secara rapi di dalam direktori \`src/components/modules/\`. Mereka kemudian di-impor secara langsung ke dalam komponen visual \`SwarmRoom.tsx\` di sisi Live Core. Desain arsitektur modular ini memungkinkan asisten Swarm AI untuk selalu melihat konteks fisik sumur bor tanpa membebani komponen utama dasbor."
      }
      }
  },`;

const idCh12Add = `        section3Content: "Komponen-komponen baru ini (\`GasSafetyModule.tsx\`, \`GeomechanicsModule.tsx\`, dan \`SeismicModule.tsx\`) ditanamkan secara rapi di dalam direktori \`src/components/modules/\`. Mereka kemudian di-impor secara langsung ke dalam komponen visual \`SwarmRoom.tsx\` di sisi Live Core. Desain arsitektur modular ini memungkinkan asisten Swarm AI untuk selalu melihat konteks fisik sumur bor tanpa membebani komponen utama dasbor."
      },
      twelve: {
        title: "BAB XII: Pembaruan Ketahanan Sistem & UI (UX Resilience v4.0)",
        section1Title: "1. Isolasi Modul (Component-Level Error Boundary) & Zod Validation",
        section1Content: "Setiap Route utama (seperti Central Command, Spatial Twin) kini dibungkus dalam \`ModuleErrorBoundary\`. Jika satu modul crash, ia akan terisolasi, menjaga sisa aplikasi (telemetri) tetap hidup tanpa White Screen of Death. Library \`zod\` juga diintegrasikan secara ketat (seperti pada DictionarySchema) untuk menangkap object key yang hilang dan memberikan nilai fallback proaktif.",
        section2Title: "2. Pemuatan Asinkron Terpisah (Code Splitting & Suspense Skeleton)",
        section2Content: "Rute komponen berbobot besar dipecah menggunakan \`React.lazy()\` dan \`<Suspense>\`. Saat pengguna memuat 3D Spatial Twin, UI seketika merender \`<ModuleSkeleton />\` sambil mengunduh chunk di latar belakang. Hal ini secara drastis memangkas ukuran initial bundle dan membuat aplikasi merespons interaksi tab pengguna secara instan.",
        section3Title: "3. Otomatisasi Unit Testing (Vitest & Pre-Commit)",
        section3Content: "Lingkungan pengujian Vitest (\`dictionary.test.ts\`) telah disiapkan untuk memverifikasi integritas 12 Bab dan modul pendukung. Skrip ini dirantai secara statis ke \`pre-commit-env-check.sh\`—memblokir commit secara otomatis bila terjadi kerusakan pada struktur Data Dictionary."
      }
    }
  },`;

if (content.includes(idCh11End)) {
  content = content.replace(idCh11End, idCh12Add);
  console.log("Fixed ID dict!");
} else {
  // Check variations
  console.log("Could not find exact ID string. Let's do regex.");
  const rx = /section3Content: "Komponen-komponen baru ini([^"]+)"\s*}\s*}\s*},/g;
  if (rx.test(content)) {
    content = content.replace(rx, "section3Content: \"Komponen-komponen baru ini$1\"\n      },\n      twelve: {\n        title: \"BAB XII: Pembaruan Ketahanan Sistem & UI (UX Resilience v4.0)\",\n        section1Title: \"1. Isolasi Modul (Component-Level Error Boundary) & Zod Validation\",\n        section1Content: \"Setiap Route utama (seperti Central Command, Spatial Twin) kini dibungkus dalam `ModuleErrorBoundary`. Jika satu modul crash, ia akan terisolasi, menjaga sisa aplikasi (telemetri) tetap hidup tanpa White Screen of Death. Library `zod` juga diintegrasikan secara ketat (seperti pada DictionarySchema) untuk menangkap object key yang hilang dan memberikan nilai fallback proaktif.\",\n        section2Title: \"2. Pemuatan Asinkron Terpisah (Code Splitting & Suspense Skeleton)\",\n        section2Content: \"Rute komponen berbobot besar dipecah menggunakan `React.lazy()` dan `<Suspense>`. Saat pengguna memuat 3D Spatial Twin, UI seketika merender `<ModuleSkeleton />` sambil mengunduh chunk di latar belakang. Hal ini secara drastis memangkas ukuran initial bundle dan membuat aplikasi merespons interaksi tab pengguna secara instan.\",\n        section3Title: \"3. Otomatisasi Unit Testing (Vitest & Pre-Commit)\",\n        section3Content: \"Lingkungan pengujian Vitest (`dictionary.test.ts`) telah disiapkan untuk memverifikasi integritas 12 Bab dan modul pendukung. Skrip ini dirantai secara statis ke `pre-commit-env-check.sh`—memblokir commit secara otomatis bila terjadi kerusakan pada struktur Data Dictionary.\"\n      }\n    }\n  },");
    console.log("Fixed ID via regex");
  } else {
    const rx2 = /section3Content: "Komponen-komponen baru ini([^"]+)"\s*}/g;
    content = content.replace(rx2, "section3Content: \"Komponen-komponen baru ini$1\"\n      },\n      twelve: {\n        title: \"BAB XII: Pembaruan Ketahanan Sistem & UI (UX Resilience v4.0)\",\n        section1Title: \"1. Isolasi Modul (Component-Level Error Boundary) & Zod Validation\",\n        section1Content: \"Setiap Route utama (seperti Central Command, Spatial Twin) kini dibungkus dalam `ModuleErrorBoundary`. Jika satu modul crash, ia akan terisolasi, menjaga sisa aplikasi (telemetri) tetap hidup tanpa White Screen of Death. Library `zod` juga diintegrasikan secara ketat (seperti pada DictionarySchema) untuk menangkap object key yang hilang dan memberikan nilai fallback proaktif.\",\n        section2Title: \"2. Pemuatan Asinkron Terpisah (Code Splitting & Suspense Skeleton)\",\n        section2Content: \"Rute komponen berbobot besar dipecah menggunakan `React.lazy()` dan `<Suspense>`. Saat pengguna memuat 3D Spatial Twin, UI seketika merender `<ModuleSkeleton />` sambil mengunduh chunk di latar belakang. Hal ini secara drastis memangkas ukuran initial bundle dan membuat aplikasi merespons interaksi tab pengguna secara instan.\",\n        section3Title: \"3. Otomatisasi Unit Testing (Vitest & Pre-Commit)\",\n        section3Content: \"Lingkungan pengujian Vitest (`dictionary.test.ts`) telah disiapkan untuk memverifikasi integritas 12 Bab dan modul pendukung. Skrip ini dirantai secara statis ke `pre-commit-env-check.sh`—memblokir commit secara otomatis bila terjadi kerusakan pada struktur Data Dictionary.\"\n      }");
    console.log("Fixed ID via simple regex");
  }
}

// EN Fix
const enRegex = /section3Content: "These new components([^"]+)"\s*}/g;
content = content.replace(enRegex, "section3Content: \"These new components$1\"\n      },\n      twelve: {\n        title: \"CHAPTER XII: System Resilience & UI Updates (UX Resilience v4.0)\",\n        section1Title: \"1. Module Isolation (Error Boundary) & Zod Validation\",\n        section1Content: \"Every main Route is now wrapped in a `ModuleErrorBoundary`. If a module crashes, it isolates the failure and keeps the rest of the application (like telemetry) alive without a White Screen of Death. The `zod` library also strictly validates objects to proactively catch missing keys and provide reliable fallbacks.\",\n        section2Title: \"2. Separate Asynchronous Loading (Code Splitting & Suspense Skeleton)\",\n        section2Content: \"Heavy component routes are split using `React.lazy()` and `<Suspense>`. When loading the 3D Spatial Twin, the UI instantly renders a `<ModuleSkeleton />` while downloading chunks in the background. This drastically trims the initial bundle size and provides instant tab interaction responses.\",\n        section3Title: \"3. Unit Testing Automation (Vitest & Pre-Commit)\",\n        section3Content: \"A Vitest testing environment (`dictionary.test.ts`) verifies the integrity of the 12 Chapters and supporting modules. This test script is statically hooked into `pre-commit-env-check.sh`—automatically blocking commits if the Data Dictionary structure is compromised.\"\n      }");
console.log("Fixed EN via regex");

fs.writeFileSync(path, content, 'utf8');
