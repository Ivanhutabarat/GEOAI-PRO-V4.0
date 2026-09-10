const fs = require('fs');
let file = fs.readFileSync('src/cores/live/components/Modules/ManualBookSuite.tsx', 'utf8');

file = file.replace(/const ModuleDocSchema = z\.object\(\{[^}]+\}\);/, `const ModuleDocSchema = z.object({
  title: z.string().catch("Modul Geofisika"),
  desc: z.string().catch("Deskripsi tidak tersedia saat ini."),
  geologyInfo: z.string().catch("Informasi geologi tidak tersedia."),
  codeStructure: z.string().catch("Struktur kode belum tersedia."),
  formula: z.string().catch("N/A"),
  threshold: z.string().catch("N/A"),
  alert: z.string().catch("N/A"),
  soundDescription: z.string().catch("N/A"),
  dataSample: z.string().catch("N/A")
});`);

// Set type of DICT back to Dictionary so it keeps type safety
file = file.replace(/const DICT: Record<Lang, any> = \{/, 'const DICT: Record<Lang, Dictionary> = {');

fs.writeFileSync('src/cores/live/components/Modules/ManualBookSuite.tsx', file);
