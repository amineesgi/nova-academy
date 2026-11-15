/** Liste tous les textes à vocaliser (anglais + dictées) : écrit scripts/.audio-list.json */
import { writeFileSync } from 'node:fs';
import { audioKey } from '../src/audio/keys';
import { LEVELS } from '../src/curriculum/registry';

const items = new Map<string, { key: string; lang: 'en' | 'fr'; text: string }>();
const add = (lang: 'en' | 'fr', text: string) => items.set(audioKey(lang, text), { key: audioKey(lang, text), lang, text });
for (const lvl of Object.values(LEVELS)) {
  for (const s of lvl.skills) {
    for (const v of s.lesson.vocab ?? []) add('en', v.en);
    const all = [...s.exercises, ...s.generators.flatMap((g) => Array.from({ length: g.variants }, (_, i) => g.make(i + 1)))];
    for (const ex of all) {
      if (ex.type === 'listen') add(s.subject === 'anglais' ? 'en' : 'fr', ex.say);
      if (ex.type === 'dictation') add('fr', ex.say);
    }
  }
}
writeFileSync('scripts/.audio-list.json', JSON.stringify([...items.values()], null, 1));
console.log(`${items.size} textes à vocaliser`);
