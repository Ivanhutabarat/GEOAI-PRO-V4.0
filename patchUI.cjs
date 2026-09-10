const fs = require('fs');
let file = fs.readFileSync('src/cores/live/components/Modules/ManualBookSuite.tsx', 'utf8');
let lines = file.split('\n');

const ch10UI = `
              {/* Chapter 10 Accordion */}
              <div className="border border-zinc-900 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpandedChapter(expandedChapter === 'ten' ? null : 'ten')}
                  className="w-full bg-[#161617] p-4 text-left font-mono text-xs font-bold text-white flex justify-between items-center hover:bg-zinc-800/80 transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Shield size={14} className="text-[#FF5722]" />
                    {dict.chapters.ten.title}
                  </span>
                  <span className="text-[#FF5722]">{expandedChapter === 'ten' ? '▼' : '►'}</span>
                </button>
                {expandedChapter === 'ten' && (
                  <div className="p-4 bg-black/40 border-t border-zinc-900 space-y-4 text-xs leading-relaxed">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleSpeakText('ch10', \`\${dict.chapters.ten.section1Content} \${dict.chapters.ten.section2Content} \${dict.chapters.ten.section3Content}\`)}
                        className={cn(
                          "px-3 py-1.5 rounded text-xs font-mono font-semibold flex items-center gap-2 transition-all cursor-pointer",
                          narratingId === 'ch10' ? "bg-amber-600 text-white" : "bg-zinc-900 hover:bg-zinc-800 text-zinc-300"
                        )}
                      >
                        <Play size={12} />
                        {narratingId === 'ch10' ? "Mute Bab X Voice" : "Dengarkan Suara Bab X"}
                      </button>
                    </div>

                    <div className="space-y-1 bg-zinc-950/40 p-3 rounded border border-zinc-900">
                      <h3 className="font-bold text-[#00E5FF]">{dict.chapters.ten.section1Title}</h3>
                      <p className="text-zinc-400 whitespace-pre-line">{dict.chapters.ten.section1Content}</p>
                    </div>
                    <div className="space-y-1 bg-zinc-950/40 p-3 rounded border border-zinc-900">
                      <h3 className="font-bold text-[#00E5FF]">{dict.chapters.ten.section2Title}</h3>
                      <p className="text-zinc-400 whitespace-pre-line">{dict.chapters.ten.section2Content}</p>
                    </div>
                    <div className="space-y-1 bg-zinc-950/40 p-3 rounded border border-zinc-900">
                      <h3 className="font-bold text-[#00E5FF]">{dict.chapters.ten.section3Title}</h3>
                      <p className="text-zinc-400 whitespace-pre-line">{dict.chapters.ten.section3Content}</p>
                    </div>
                  </div>
                )}
              </div>
`;

// we know line 1954 is the closing div for the chapters accordion list. Let's find it.
const searchIndex = lines.findIndex(line => line.includes('TAB 2: GEOPHYSICAL ENCYCLOPEDIA (13 MODULES)'));
if (searchIndex !== -1) {
  // It's a few lines above. Let's find `</div>` `)}` `</div>` 
  // We'll just splice it before the `</div>` at searchIndex - 3
  lines.splice(searchIndex - 2, 0, ch10UI);
  fs.writeFileSync('src/cores/live/components/Modules/ManualBookSuite.tsx', lines.join('\n'));
} else {
  console.log("Not found");
}

