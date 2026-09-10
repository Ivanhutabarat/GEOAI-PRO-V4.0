const fs = require('fs');
let file = fs.readFileSync('src/cores/live/components/Modules/ManualBookSuite.tsx', 'utf8');

file = file.replace(/const DICT: Record<Lang, Dictionary> = \{\n  id: DictionarySchema\.parse\(RAW_DICT\.id\),\n  en: DictionarySchema\.parse\(RAW_DICT\.en\)\n\};/, `const DICT: Record<Lang, Dictionary> = {
  id: DictionarySchema.parse(RAW_DICT.id) as unknown as Dictionary,
  en: DictionarySchema.parse(RAW_DICT.en) as unknown as Dictionary
};`);

fs.writeFileSync('src/cores/live/components/Modules/ManualBookSuite.tsx', file);
