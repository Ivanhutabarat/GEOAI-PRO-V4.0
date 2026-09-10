const fs = require('fs');
const path = './src/cores/live/components/Modules/ManualBookSuite.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add twelve to schema
content = content.replace(
  'eleven: StandardChapterSchema',
  'eleven: StandardChapterSchema,\n    twelve: StandardChapterSchema'
);

// 2. Add to Dictionary type if it's there
if (content.includes('eleven: {')) {
  content = content.replace(
    'eleven: {\n      title: string;\n      section1Title: string;\n      section1Content: string;\n      section2Title: string;\n      section2Content: string;\n      section3Title: string;\n      section3Content: string;\n    };',
    'eleven: {\n      title: string;\n      section1Title: string;\n      section1Content: string;\n      section2Title: string;\n      section2Content: string;\n      section3Title: string;\n      section3Content: string;\n    };\n    twelve: {\n      title: string;\n      section1Title: string;\n      section1Content: string;\n      section2Title: string;\n      section2Content: string;\n      section3Title: string;\n      section3Content: string;\n    };'
  );
}

// 3. Add to ID dict
const idCh11End = `
        section3Title: "3. Penempatan Modul pada Arsitektur Kode",
        section3Content: "Komponen-komponen baru ini (\`GasSafetyModule.tsx\`, \`GeomechanicsModule.tsx\`, dan \`SeismicModule.tsx\`) ditanamkan secara rapi di dalam direktori \`src/components/modules/\`. Mereka kemudian di-impor secara langsung ke dalam komponen visual \`SwarmRoom.tsx\` di sisi Live Core. Desain arsitektur modular ini memungkinkan asisten Swarm AI untuk selalu melihat konteks fisik sumur bor tanpa membebani komponen utama dasbor."
      }
    }
  },`;
const idCh12Add = `
        section3Title: "3. Penempatan Modul pada Arsitektur Kode",
        section3Content: "Komponen-komponen baru ini (\`GasSafetyModule.tsx\`, \`GeomechanicsModule.tsx\`, dan \`SeismicModule.tsx\`) ditanamkan secara rapi di dalam direktori \`src/components/modules/\`. Mereka kemudian di-impor secara langsung ke dalam komponen visual \`SwarmRoom.tsx\` di sisi Live Core. Desain arsitektur modular ini memungkinkan asisten Swarm AI untuk selalu melihat konteks fisik sumur bor tanpa membebani komponen utama dasbor."
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

content = content.replace(idCh11End, idCh12Add);

// 4. Add to EN dict
const enCh11End = `
        section3Title: "3. Module Placement in Code Architecture",
        section3Content: "These new components (\`GasSafetyModule.tsx\`, \`GeomechanicsModule.tsx\`, and \`SeismicModule.tsx\`) are neatly organized inside the \`src/components/modules/\` directory. They are directly imported and embedded into the visual \`SwarmRoom.tsx\` component in the Live Core. This modular architecture empowers the Swarm AI assistant to continuously perceive the physical context of the wellbore without bloating the primary dashboard UI."
      }
    }
  }
};`;
const enCh12Add = `
        section3Title: "3. Module Placement in Code Architecture",
        section3Content: "These new components (\`GasSafetyModule.tsx\`, \`GeomechanicsModule.tsx\`, and \`SeismicModule.tsx\`) are neatly organized inside the \`src/components/modules/\` directory. They are directly imported and embedded into the visual \`SwarmRoom.tsx\` component in the Live Core. This modular architecture empowers the Swarm AI assistant to continuously perceive the physical context of the wellbore without bloating the primary dashboard UI."
      },
      twelve: {
        title: "CHAPTER XII: System Resilience & UI Updates (UX Resilience v4.0)",
        section1Title: "1. Module Isolation (Error Boundary) & Zod Validation",
        section1Content: "Every main Route is now wrapped in a \`ModuleErrorBoundary\`. If a module crashes, it isolates the failure and keeps the rest of the application (like telemetry) alive without a White Screen of Death. The \`zod\` library also strictly validates objects to proactively catch missing keys and provide reliable fallbacks.",
        section2Title: "2. Separate Asynchronous Loading (Code Splitting & Suspense Skeleton)",
        section2Content: "Heavy component routes are split using \`React.lazy()\` and \`<Suspense>\`. When loading the 3D Spatial Twin, the UI instantly renders a \`<ModuleSkeleton />\` while downloading chunks in the background. This drastically trims the initial bundle size and provides instant tab interaction responses.",
        section3Title: "3. Unit Testing Automation (Vitest & Pre-Commit)",
        section3Content: "A Vitest testing environment (\`dictionary.test.ts\`) verifies the integrity of the 12 Chapters and supporting modules. This test script is statically hooked into \`pre-commit-env-check.sh\`—automatically blocking commits if the Data Dictionary structure is compromised."
      }
    }
  }
};`;

content = content.replace(enCh11End, enCh12Add);

// 5. Add to UI Accordions
const uiCh11 = `
              {/* Chapter 11 Accordion */}
              <div className="border border-zinc-900 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpandedChapter(expandedChapter === 'eleven' ? null : 'eleven')}
                  className="w-full bg-[#161617] p-4 text-left font-mono text-xs font-bold text-white flex justify-between items-center hover:bg-zinc-800/80 transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <ShieldAlert size={14} className="text-[#FF5722]" />
                    {dict.chapters.eleven.title}
                  </span>
                  <span className="text-[#FF5722]">{expandedChapter === 'eleven' ? '▼' : '►'}</span>
                </button>
                {expandedChapter === 'eleven' && (
                  <div className="p-4 bg-black/40 border-t border-zinc-900 space-y-4 text-xs leading-relaxed">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleSpeakText('ch11', \`\${dict.chapters.eleven.section1Content} \${dict.chapters.eleven.section2Content} \${dict.chapters.eleven.section3Content}\`)}
                        className={cn(
                          "px-3 py-1.5 rounded text-xs font-mono font-semibold flex items-center gap-2 transition-all cursor-pointer",
                          narratingId === 'ch11' ? "bg-amber-600 text-white" : "bg-zinc-900 hover:bg-zinc-800 text-zinc-300"
                        )}
                      >
                        <Play size={12} />
                        {narratingId === 'ch11' ? "Mute Voice" : "Dengarkan Suara"}
                      </button>
                    </div>
                    <div className="space-y-1 bg-zinc-950/40 p-3 rounded border border-zinc-900">
                      <h3 className="font-bold text-[#00E5FF]">{dict.chapters.eleven.section1Title}</h3>
                      <p className="text-zinc-400 whitespace-pre-line">{dict.chapters.eleven.section1Content}</p>
                    </div>
                    <div className="space-y-1 bg-zinc-950/40 p-3 rounded border border-zinc-900">
                      <h3 className="font-bold text-[#00E5FF]">{dict.chapters.eleven.section2Title}</h3>
                      <p className="text-zinc-400 whitespace-pre-line">{dict.chapters.eleven.section2Content}</p>
                    </div>
                    <div className="space-y-1 bg-zinc-950/40 p-3 rounded border border-zinc-900">
                      <h3 className="font-bold text-[#00E5FF]">{dict.chapters.eleven.section3Title}</h3>
                      <p className="text-zinc-400 whitespace-pre-line">{dict.chapters.eleven.section3Content}</p>
                    </div>
                  </div>
                )}
              </div>
`;

const uiCh12 = `
              {/* Chapter 12 Accordion */}
              <div className="border border-zinc-900 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpandedChapter(expandedChapter === 'twelve' ? null : 'twelve')}
                  className="w-full bg-[#161617] p-4 text-left font-mono text-xs font-bold text-white flex justify-between items-center hover:bg-zinc-800/80 transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <ShieldAlert size={14} className="text-[#FF5722]" />
                    {dict.chapters.twelve.title}
                  </span>
                  <span className="text-[#FF5722]">{expandedChapter === 'twelve' ? '▼' : '►'}</span>
                </button>
                {expandedChapter === 'twelve' && (
                  <div className="p-4 bg-black/40 border-t border-zinc-900 space-y-4 text-xs leading-relaxed">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleSpeakText('ch12', \`\${dict.chapters.twelve.section1Content} \${dict.chapters.twelve.section2Content} \${dict.chapters.twelve.section3Content}\`)}
                        className={cn(
                          "px-3 py-1.5 rounded text-xs font-mono font-semibold flex items-center gap-2 transition-all cursor-pointer",
                          narratingId === 'ch12' ? "bg-amber-600 text-white" : "bg-zinc-900 hover:bg-zinc-800 text-zinc-300"
                        )}
                      >
                        <Play size={12} />
                        {narratingId === 'ch12' ? "Mute Voice" : "Dengarkan Suara"}
                      </button>
                    </div>
                    <div className="space-y-1 bg-zinc-950/40 p-3 rounded border border-zinc-900">
                      <h3 className="font-bold text-[#00E5FF]">{dict.chapters.twelve.section1Title}</h3>
                      <p className="text-zinc-400 whitespace-pre-line">{dict.chapters.twelve.section1Content}</p>
                    </div>
                    <div className="space-y-1 bg-zinc-950/40 p-3 rounded border border-zinc-900">
                      <h3 className="font-bold text-[#00E5FF]">{dict.chapters.twelve.section2Title}</h3>
                      <p className="text-zinc-400 whitespace-pre-line">{dict.chapters.twelve.section2Content}</p>
                    </div>
                    <div className="space-y-1 bg-zinc-950/40 p-3 rounded border border-zinc-900">
                      <h3 className="font-bold text-[#00E5FF]">{dict.chapters.twelve.section3Title}</h3>
                      <p className="text-zinc-400 whitespace-pre-line">{dict.chapters.twelve.section3Content}</p>
                    </div>
                  </div>
                )}
              </div>
`;

content = content.replace(uiCh11, uiCh11 + uiCh12);

fs.writeFileSync(path, content, 'utf8');
console.log('Patched Chapter 12!');
