import { describe, it, expect } from 'vitest';
import { RAW_DICT } from '../cores/live/components/Modules/ManualBookSuite';

describe('Data Dictionary Completeness Check', () => {
  it('should have basic top level properties for ID and EN', () => {
    ['id', 'en'].forEach((lang) => {
      const dict: any = RAW_DICT[lang as 'id' | 'en'];
      expect(dict).toBeDefined();
      expect(dict.title).toBeDefined();
      expect(dict.subtitle).toBeDefined();
      expect(dict.searchPlaceholder).toBeDefined();
      expect(dict.chapters).toBeDefined();
    });
  });

  it('should contain all required sections for standard chapters (1-10)', () => {
    const chaptersToCheck = ['one', 'two', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
    
    ['id', 'en'].forEach((lang) => {
      const dict: any = RAW_DICT[lang as 'id' | 'en'];
      
      chaptersToCheck.forEach(ch => {
        const chapter = dict.chapters[ch];
        expect(chapter.title, `${lang} - chapter ${ch} missing title`).toBeDefined();
        expect(chapter.section1Title, `${lang} - chapter ${ch} missing section1Title`).toBeDefined();
        expect(chapter.section1Content, `${lang} - chapter ${ch} missing section1Content`).toBeDefined();
      });
    });
  });

  it('should contain complete module definitions in chapter 3', () => {
    ['id', 'en'].forEach((lang) => {
      const dict: any = RAW_DICT[lang as 'id' | 'en'];
      const modules = dict.chapters.three.modules;
      
      expect(Object.keys(modules).length).toBeGreaterThan(0);
      
      Object.entries(modules).forEach(([id, mod]: [string, any]) => {
        expect(mod.title, `${lang} - module ${id} missing title`).toBeDefined();
        expect(mod.desc, `${lang} - module ${id} missing desc`).toBeDefined();
        expect(mod.geologyInfo, `${lang} - module ${id} missing geologyInfo`).toBeDefined();
        expect(mod.codeStructure, `${lang} - module ${id} missing codeStructure`).toBeDefined();
        expect(mod.formula, `${lang} - module ${id} missing formula`).toBeDefined();
      });
    });
  });
});
