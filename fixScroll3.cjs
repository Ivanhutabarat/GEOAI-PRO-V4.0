const fs = require('fs');
let file = fs.readFileSync('src/cores/live/components/Modules/ManualBookSuite.tsx', 'utf8');

// Revert root
file = file.replace(/className="bg-\[#111\] border border-zinc-850 rounded-xl p-6 shadow-2xl text-zinc-300 font-sans w-full max-w-7xl mx-auto space-y-6 flex-1 min-h-0 overflow-y-auto scrollbar-thin"/, 'className="bg-[#111] border border-zinc-850 rounded-xl p-6 shadow-2xl text-zinc-300 font-sans max-w-7xl mx-auto space-y-6"');

// Fix Tab 1
file = file.replace(/\{\/\* TAB 1: CHAPTERS VIEW \*\/\}\n\s*\{activeTab === 'chapters' && \(\n\s*<div className="space-y-3">/, "{/* TAB 1: CHAPTERS VIEW */}\n          {activeTab === 'chapters' && (\n            <div className=\"space-y-3 max-h-[640px] overflow-y-auto scrollbar-thin pr-1\">");

// Fix Tab 2 (since I removed it earlier)
file = file.replace(/\{\/\* TAB 2: GEOPHYSICAL ENCYCLOPEDIA \(13 MODULES\) \*\/\}\n\s*\{activeTab === 'modules' && \(\n\s*<div className="space-y-4">/, "{/* TAB 2: GEOPHYSICAL ENCYCLOPEDIA (13 MODULES) */}\n          {activeTab === 'modules' && (\n            <div className=\"space-y-4 max-h-[640px] overflow-y-auto scrollbar-thin pr-1\">");

// Fix Tab 3 (TitanCore)
file = file.replace(/\{activeTab === 'titancore' && \(\n\s*<div className="">\n\s*<TitanCoreWorkstation lang=\{lang\} \/>\n\s*<\/div>/, "{activeTab === 'titancore' && (\n            <div className=\"max-h-[640px] overflow-y-auto scrollbar-thin pr-1\">\n              <TitanCoreWorkstation lang={lang} />\n            </div>");

fs.writeFileSync('src/cores/live/components/Modules/ManualBookSuite.tsx', file);
