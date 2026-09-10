const fs = require('fs');
let file = fs.readFileSync('src/cores/live/components/Modules/ManualBookSuite.tsx', 'utf8');

const zodImport = `import { z } from 'zod';\n`;
if (!file.includes('import { z }')) {
  file = file.replace(/import React/, zodImport + 'import React');
}

const zodSchema = `
const ModuleDocSchema = z.object({
  title: z.string().catch("Modul Geofisika"),
  desc: z.string().catch("Deskripsi tidak tersedia saat ini."),
  freq: z.string().catch("N/A")
});

const StandardChapterSchema = z.object({
  title: z.string().catch("Bab Belum Tersedia"),
  section1Title: z.string().catch("Bagian 1"),
  section1Content: z.string().catch("Konten sedang dalam perbaikan."),
  section2Title: z.string().catch("Bagian 2").optional(),
  section2Content: z.string().catch("Konten sedang dalam perbaikan.").optional(),
  section3Title: z.string().catch("Bagian 3").optional(),
  section3Content: z.string().catch("Konten sedang dalam perbaikan.").optional()
});

const ChapterThreeSchema = z.object({
  title: z.string().catch("Bab III: Ensklopedia Modul"),
  intro: z.string().catch("Daftar modul geofisika."),
  modules: z.record(z.string().or(z.number()), ModuleDocSchema).catch({})
});

const DictionarySchema = z.object({
  title: z.string().catch("ENTERPRISE GEOPHYSICS ENCYCLOPEDIA"),
  subtitle: z.string().catch("Textbook Documentation V5.0"),
  searchPlaceholder: z.string().catch("Search..."),
  searchButton: z.string().catch("Search"),
  askAiTitle: z.string().catch("Voice AI Companion"),
  askAiPlaceholder: z.string().catch("Ask..."),
  waButton: z.string().catch("Contact Chief Engineer"),
  langToggle: z.string().catch("Toggle Language"),
  suggestedQueries: z.array(z.string()).catch([]),
  chapters: z.object({
    one: StandardChapterSchema,
    two: StandardChapterSchema,
    three: ChapterThreeSchema,
    four: StandardChapterSchema,
    five: StandardChapterSchema,
    six: StandardChapterSchema,
    seven: StandardChapterSchema,
    eight: StandardChapterSchema,
    nine: StandardChapterSchema,
    ten: StandardChapterSchema
  })
});
`;

if (!file.includes('const DictionarySchema')) {
  file = file.replace(/const DICT: Record<Lang, Dictionary> = \{/, zodSchema + '\nconst RAW_DICT: Record<Lang, Dictionary> = {');
}

// Rename DICT to RAW_DICT for the actual assignment, then parse it
file = file.replace(/\};\n\nexport default function ManualBookSuite\(\) \{/, `};\n\nconst DICT: Record<Lang, any> = {\n  id: DictionarySchema.parse(RAW_DICT.id),\n  en: DictionarySchema.parse(RAW_DICT.en)\n};\n\nexport default function ManualBookSuite() {`);

fs.writeFileSync('src/cores/live/components/Modules/ManualBookSuite.tsx', file);
