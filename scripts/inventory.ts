/** Affiche l'inventaire réel des contenus : npm run inventory */
import { LEVELS, inventory } from '../src/curriculum/registry';
import { SUBJECT_LABELS, type SubjectId } from '../src/curriculum/types';
for (const lvl of Object.values(LEVELS)) {
  const inv = inventory(lvl);
  console.log(`\n${lvl.label} — ${inv.skills} compétences, ${inv.authored} exercices rédigés, ${inv.generators} générateurs (${inv.variants} variantes vérifiées) — total ${inv.total}`);
  for (const [subj, v] of inv.bySubject) console.log(`  ${SUBJECT_LABELS[subj as SubjectId].padEnd(26)} ${String(v.skills).padStart(3)} comp. | ${String(v.authored).padStart(4)} rédigés | ${String(v.variants).padStart(4)} variantes`);
}
