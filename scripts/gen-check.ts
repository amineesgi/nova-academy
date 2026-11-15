import { LEVELS } from '../src/curriculum/registry';
for (const lvl of Object.values(LEVELS)) for (const s of lvl.skills) for (const g of s.generators) {
  const set = new Set<string>();
  for (let i = 1; i <= g.variants; i++) { const e = g.make(i); set.add(JSON.stringify([e.prompt, (e as any).a, (e as any).b, (e as any).num, (e as any).den, (e as any).choices, (e as any).items, e.visual ?? null])); }
  if (set.size < Math.ceil(g.variants * 0.6)) console.log(g.id, set.size, '/', g.variants);
}
