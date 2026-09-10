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
  content = content.replace(
    /eleven: {([\s\S]*?)};\s+}/,
    'eleven: {$1};\n    twelve: {\n      title: string;\n      section1Title: string;\n      section1Content: string;\n      section2Title: string;\n      section2Content: string;\n      section3Title: string;\n      section3Content: string;\n    };\n  }'
  );
  console.log("Added to Dictionary interface");
}

// Indonesian
if (!content.includes('BAB XII')) {
  const idRegex = /section3Content: "Komponen-komponen baru ini([^"]+)"\s*}\s*}\s*},/;
  const idRep = "section3Content: \"Komponen-komponen baru ini$1\"\n      },\n      twelve: {\n        title: \"BAB XII: Pembaruan Ketahanan Sistem & UI (UX Resilience v4.0)\",\n        section1Title: \"1. Isolasi Modul (Component-Level Error Boundary) & Zod Validation\",\n        section1Content: \"Setiap Route utama (seperti Central Command, Spatial Twin) kini dibungkus dalam `ModuleErrorBoundary`. Jika satu modul crash, ia akan terisolasi, menjaga sisa aplikasi (telemetri) tetap hidup tanpa White Screen of Death. Library `zod` juga diintegrasikan secara ketat (seperti pada DictionarySchema) untuk menangkap object key yang hilang dan memberikan nilai fallback proaktif.\",\n        section2Title: \"2. Pemuatan Asinkron Terpisah (Code Splitting & Suspense Skeleton)\",\n        section2Content: \"Rute komponen berbobot besar dipecah menggunakan `React.lazy()` dan `<Suspense>`. Saat pengguna memuat 3D Spatial Twin, UI seketika merender `<ModuleSkeleton />` sambil mengunduh chunk di latar belakang. Hal ini secara drastis memangkas ukuran initial bundle dan membuat aplikasi merespons interaksi tab pengguna secara instan.\",\n        section3Title: \"3. Otomatisasi Unit Testing (Vitest & Pre-Commit)\",\n        section3Content: \"Lingkungan pengujian Vitest (`dictionary.test.ts`) telah disiapkan untuk memverifikasi integritas 12 Bab dan modul pendukung. Skrip ini dirantai secara statis ke `pre-commit-env-check.sh`—memblokir commit secara otomatis bila terjadi kerusakan pada struktur Data Dictionary.\"\n      }\n    }\n  },";
  content = content.replace(idRegex, idRep);
  console.log("Added ID chapter");
}

// English
if (!content.includes('CHAPTER XII')) {
  const enRegex = /section3Content: "These new components([^"]+)"\s*}\s*}\s*}\s*};\s*(const DICT)/;
  const enRep = "section3Content: \"These new components$1\"\n      },\n      twelve: {\n        title: \"CHAPTER XII: System Resilience & UI Updates (UX Resilience v4.0)\",\n        section1Title: \"1. Module Isolation (Error Boundary) & Zod Validation\",\n        section1Content: \"Every main Route is now wrapped in a `ModuleErrorBoundary`. If a module crashes, it isolates the failure and keeps the rest of the application (like telemetry) alive without a White Screen of Death. The `zod` library also strictly validates objects to proactively catch missing keys and provide reliable fallbacks.\",\n        section2Title: \"2. Separate Asynchronous Loading (Code Splitting & Suspense Skeleton)\",\n        section2Content: \"Heavy component routes are split using `React.lazy()` and `<Suspense>`. When loading the 3D Spatial Twin, the UI instantly renders a `<ModuleSkeleton />` while downloading chunks in the background. This drastically trims the initial bundle size and provides instant tab interaction responses.\",\n        section3Title: \"3. Unit Testing Automation (Vitest & Pre-Commit)\",\n        section3Content: \"A Vitest testing environment (`dictionary.test.ts`) verifies the integrity of the 12 Chapters and supporting modules. This test script is statically hooked into `pre-commit-env-check.sh`—automatically blocking commits if the Data Dictionary structure is compromised.\"\n      }\n    }\n  }\n};\n$2";
  content = content.replace(enRegex, enRep);
  console.log("Added EN chapter");
}

// UI component
if (!content.includes('{/* Chapter 12 Accordion */}')) {
  const uiRegex = /{expandedChapter === 'eleven' && \([\s\S]*?<\/div>\s*<\/div>\s*\)\s*}\s*<\/div>/;
  const match = uiRegex.exec(content);
  if (match) {
    const replacement = match[0] + "\n              {/* Chapter 12 Accordion */}\n              <div className=\"border border-zinc-900 rounded-lg overflow-hidden\">\n                <button\n                  type=\"button\"\n                  onClick={() => setExpandedChapter(expandedChapter === 'twelve' ? null : 'twelve')}\n                  className=\"w-full bg-[#161617] p-4 text-left font-mono text-xs font-bold text-white flex justify-between items-center hover:bg-zinc-800/80 transition-all cursor-pointer\"\n                >\n                  <span className=\"flex items-center gap-2\">\n                    <ShieldAlert size={14} className=\"text-[#FF5722]\" />\n                    {dict.chapters.twelve.title}\n                  </span>\n                  <span className=\"text-[#FF5722]\">{expandedChapter === 'twelve' ? '▼' : '►'}</span>\n                </button>\n                {expandedChapter === 'twelve' && (\n                  <div className=\"p-4 bg-black/40 border-t border-zinc-900 space-y-4 text-xs leading-relaxed\">\n                    <div className=\"flex justify-end\">\n                      <button\n                        type=\"button\"\n                        onClick={() => handleSpeakText('ch12', `${dict.chapters.twelve.section1Content} ${dict.chapters.twelve.section2Content} ${dict.chapters.twelve.section3Content}`)}\n                        className={cn(\n                          \"px-3 py-1.5 rounded text-xs font-mono font-semibold flex items-center gap-2 transition-all cursor-pointer\",\n                          narratingId === 'ch12' ? \"bg-amber-600 text-white\" : \"bg-zinc-900 hover:bg-zinc-800 text-zinc-300\"\n                        )}\n                      >\n                        <Play size={12} />\n                        {narratingId === 'ch12' ? \"Mute Voice\" : \"Dengarkan Suara\"}\n                      </button>\n                    </div>\n                    <div className=\"space-y-1 bg-zinc-950/40 p-3 rounded border border-zinc-900\">\n                      <h3 className=\"font-bold text-[#00E5FF]\">{dict.chapters.twelve.section1Title}</h3>\n                      <p className=\"text-zinc-400 whitespace-pre-line\">{dict.chapters.twelve.section1Content}</p>\n                    </div>\n                    <div className=\"space-y-1 bg-zinc-950/40 p-3 rounded border border-zinc-900\">\n                      <h3 className=\"font-bold text-[#00E5FF]\">{dict.chapters.twelve.section2Title}</h3>\n                      <p className=\"text-zinc-400 whitespace-pre-line\">{dict.chapters.twelve.section2Content}</p>\n                    </div>\n                    <div className=\"space-y-1 bg-zinc-950/40 p-3 rounded border border-zinc-900\">\n                      <h3 className=\"font-bold text-[#00E5FF]\">{dict.chapters.twelve.section3Title}</h3>\n                      <p className=\"text-zinc-400 whitespace-pre-line\">{dict.chapters.twelve.section3Content}</p>\n                    </div>\n                  </div>\n                )}\n              </div>";
    content = content.replace(uiRegex, replacement);
    console.log("Added to UI");
  } else {
    console.log("UI regex did not match!");
  }
}

fs.writeFileSync(path, content, 'utf8');
console.log("Done");
