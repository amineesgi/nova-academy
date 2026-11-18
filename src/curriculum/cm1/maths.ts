import { L, num, ordre, qcm, skillsOf, tri, vf, type GenSpec } from '../authoring';
import { digitAt, numberToWords, numericChoices, PLACE_NAMES, PRENOMS } from '../math-helpers';
import { REF } from '../refs';
import type { ShapeKind, Visual } from '../types';
import { fr } from '@/utils/rng';

const S = skillsOf({ level: 'cm1', subject: 'maths', programRef: REF.cm1Maths, region: 'atelier-nombres' });
const shape = (s: ShapeKind): Visual => ({ kind: 'shape', shape: s });
const r2 = (x: number) => Math.round(x * 100) / 100;

// ————— Nombres entiers jusqu'à 999 999 —————
const numGens: GenSpec[] = [
  {
    id: 'g-rang',
    difficulty: 1,
    build: (r) => {
      const n = r.int(10_000, 999_999);
      const p = r.int(0, 5);
      return qcm(`Dans ${fr(n)}, quel est le chiffre des ${PLACE_NAMES[p]} ?`, numericChoices(r, digitAt(n, p), [0, 1, 2, 3, 4, 5].map((k) => digitAt(n, k))), `On découpe en deux classes : mille | unités. Le chiffre des ${PLACE_NAMES[p]} est ${digitAt(n, p)}.`);
    },
  },
  {
    id: 'g-lettres',
    difficulty: 2,
    build: (r) => {
      const n = r.int(10_000, 999_999);
      return num(`Écris en chiffres : « ${numberToWords(n)} ».`, n, `« ${numberToWords(n)} » s'écrit ${fr(n)}.`, { hint: 'Le mot « mille » sépare la classe des mille de la classe des unités.' });
    },
  },
  {
    id: 'g-decomp',
    difficulty: 2,
    build: (r) => {
      const a = r.int(1, 9), b = r.int(0, 9), c = r.int(1, 9), d = r.int(0, 9);
      const n = a * 100_000 + b * 10_000 + c * 100 + d;
      return num(`Quel nombre vaut ${a} × 100 000 + ${b} × 10 000 + ${c} × 100 + ${d} ?`, n, `${fr(a * 100_000)} + ${fr(b * 10_000)} + ${c * 100} + ${d} = ${fr(n)}. Attention aux rangs vides (zéros) !`);
    },
  },
  {
    id: 'g-centaines',
    difficulty: 3,
    build: (r) => {
      const n = r.int(10_000, 999_999);
      return num(`Combien y a-t-il de centaines en tout dans ${fr(n)} ?`, Math.floor(n / 100), `On cache les deux derniers chiffres (dizaines et unités) : ${fr(Math.floor(n / 100))} centaines.`);
    },
  },
];

const cmpGens: GenSpec[] = [
  {
    id: 'g-compare',
    difficulty: 1,
    build: (r) => {
      const a = r.int(10_000, 999_999);
      let b = r.pick([a + r.int(1, 9) * 1000, a - r.int(1, 9) * 100, r.int(10_000, 999_999)]);
      if (b === a) b = a + 10;
      return qcm(`Compare : ${fr(a)} … ${fr(b)}`, [a < b ? '*<' : '<', a > b ? '*>' : '>', '='], `On compare le nombre de chiffres, puis les chiffres de gauche à droite : ${fr(a)} ${a < b ? '<' : '>'} ${fr(b)}.`);
    },
  },
  {
    id: 'g-ranger',
    difficulty: 2,
    build: (r) => {
      const base = r.int(10, 98) * 10_000;
      const set = new Set<number>();
      while (set.size < 4) set.add(base + r.int(0, 19_999));
      const s = [...set].sort((x, y) => x - y);
      return ordre('Range ces nombres du plus petit au plus grand.', s.map((x) => fr(x)), `Ordre croissant : ${s.map((x) => fr(x)).join(' < ')}.`, 'number');
    },
  },
  {
    id: 'g-arrondi',
    difficulty: 3,
    build: (r) => {
      const n = r.int(10_001, 999_999);
      const low = Math.floor(n / 1000) * 1000;
      const near = n - low < 500 ? low : low + 1000;
      return num(`Arrondis ${fr(n)} au millier le plus proche.`, near, `${fr(n)} est entre ${fr(low)} et ${fr(low + 1000)} ; il est plus proche de ${fr(near)}.`, { hint: 'Regarde le chiffre des centaines : 5 ou plus, on arrondit au millier supérieur.' });
    },
  },
];

const fracGens: GenSpec[] = [
  {
    id: 'g-de-quantite',
    difficulty: 1,
    build: (r) => {
      const den = r.pick([2, 3, 4, 5, 6, 8, 10]);
      const nu = r.int(1, den - 1);
      const q = den * r.int(2, 10);
      return num(`Combien font ${nu}/${den} de ${q} billes ?`, (q / den) * nu, `${q} ÷ ${den} = ${q / den}, puis × ${nu} = ${(q / den) * nu} billes.`, { hint: `Trouve d’abord 1/${den} de ${q}.` });
    },
  },
  {
    id: 'g-colorie',
    difficulty: 1,
    build: (r) => {
      const den = r.pick([3, 4, 5, 6, 8, 10, 12]);
      const nu = r.int(1, den - 1);
      return { type: 'fraction-build', num: nu, den, prompt: `Colorie ${nu}/${den} de la bande.`, explanation: `La bande a ${den} parts égales : on en colorie ${nu}.` };
    },
  },
  {
    id: 'g-encadrer',
    difficulty: 2,
    build: (r) => {
      const den = r.pick([2, 3, 4, 5, 10]);
      const e = r.int(1, 4), nu = e * den + r.int(1, den - 1);
      return num(`${nu}/${den} est compris entre deux nombres entiers qui se suivent. Quel est le plus petit des deux ?`, e, `${e * den}/${den} = ${e} et ${(e + 1) * den}/${den} = ${e + 1}, donc ${e} < ${nu}/${den} < ${e + 1}.`);
    },
  },
  {
    id: 'g-somme',
    difficulty: 2,
    build: (r) => {
      const den = r.int(3, 12), a = r.int(1, den), b = r.int(1, den);
      return num(`Calcule ${a}/${den} + ${b}/${den}. Écris le numérateur du résultat (sur ${den}).`, a + b, `Même dénominateur : on additionne les numérateurs. ${a} + ${b} = ${a + b}, donc ${a + b}/${den}.`);
    },
  },
  {
    id: 'g-diff',
    difficulty: 3,
    build: (r) => {
      const den = r.int(4, 15), a = r.int(3, 2 * den), b = r.int(1, a - 1);
      return num(`Calcule ${a}/${den} − ${b}/${den}. Écris le numérateur du résultat (sur ${den}).`, a - b, `${a} − ${b} = ${a - b}, donc ${a - b}/${den}.`);
    },
  },
  {
    id: 'g-comparer',
    difficulty: 2,
    build: (r) => {
      const den = r.int(3, 20);
      const a = r.int(1, 2 * den);
      let b = r.int(1, 2 * den);
      if (b === a) b = a + 1;
      return qcm(`Compare ${a}/${den} et ${b}/${den}.`, [a < b ? '*<' : '<', a > b ? '*>' : '>', '='], `Même dénominateur : la plus grande fraction est celle qui a le plus grand numérateur.`);
    },
  },
];

const decGens: GenSpec[] = [
  {
    id: 'g-ecriture',
    difficulty: 1,
    build: (r) => {
      const den = r.pick([10, 100]);
      const nu = r.int(3, den * 9);
      return num(`Écris ${nu}/${den} avec une virgule.`, r2(nu / den), `${nu}/${den} = ${fr(nu / den, 2)} (on divise par ${den}).`, { hint: den === 10 ? '1/10 = 0,1 : un dixième.' : '1/100 = 0,01 : un centième.' });
    },
  },
  {
    id: 'g-rang',
    difficulty: 1,
    build: (r) => {
      const n = r.int(101, 9999) / 100;
      const k = r.int(0, 2);
      const names = ['centièmes', 'dixièmes', 'unités'];
      const d = digitAt(Math.round(n * 100), k);
      return qcm(`Dans ${fr(n, 2)}, quel est le chiffre des ${names[k]} ?`, numericChoices(r, d, [0, 1, 2, 3].map((p) => digitAt(Math.round(n * 100), p))), `Après la virgule : dixièmes puis centièmes. Le chiffre des ${names[k]} est ${d}.`);
    },
  },
  {
    id: 'g-comparer',
    difficulty: 2,
    build: (r) => {
      const e = r.int(1, 20);
      const a = r2(e + r.int(1, 9) / 10);
      let b = r2(e + r.int(1, 99) / 100);
      if (b === a) b = r2(a + 0.01);
      return qcm(`Compare : ${fr(a, 2)} … ${fr(b, 2)}`, [a < b ? '*<' : '<', a > b ? '*>' : '>', '='], `On compare les parties entières, puis les dixièmes, puis les centièmes. ${fr(a, 2)} ${a < b ? '<' : '>'} ${fr(b, 2)}.`, { hint: 'Ajoute un zéro pour avoir deux chiffres après la virgule : 3,5 = 3,50.' });
    },
  },
  {
    id: 'g-arrondi',
    difficulty: 3,
    build: (r) => {
      const n = r2(r.int(100, 9999) / 100);
      return num(`Arrondis ${fr(n, 2)} à l’unité la plus proche.`, Math.round(n), `On regarde le chiffre des dixièmes : ${fr(n, 2)} est plus proche de ${Math.round(n)}.`);
    },
  },
  {
    id: 'g-add',
    difficulty: 2,
    build: (r) => {
      const a = r.int(105, 999) / 100, b = r.int(15, 599) / 100;
      return num(`Calcule : ${fr(a, 2)} + ${fr(b, 2)}`, r2(a + b), `On aligne les virgules : ${fr(a, 2)} + ${fr(b, 2)} = ${fr(r2(a + b), 2)}.`);
    },
  },
];

const mentalGens: GenSpec[] = [
  {
    id: 'g-x10',
    difficulty: 1,
    build: (r) => {
      const a = r.int(3, 999), k = r.pick([10, 100, 1000]);
      return num(`Calcule de tête : ${a} × ${fr(k)}`, a * k, `Multiplier par ${fr(k)}, c’est donner aux chiffres une valeur ${fr(k)} fois plus grande : ${fr(a * k)}.`);
    },
  },
  {
    id: 'g-x458',
    difficulty: 2,
    build: (r) => {
      const k = r.pick([4, 5, 8]), a = r.int(12, 60);
      const how = k === 4 ? 'double du double' : k === 8 ? 'double du double du double' : '× 10 puis moitié';
      return num(`Calcule de tête : ${a} × ${k}`, a * k, `Astuce : × ${k}, c’est le ${how}. ${a} × ${k} = ${a * k}.`);
    },
  },
  {
    id: 'g-multiples',
    difficulty: 2,
    build: (r) => {
      const k = r.pick([2, 5, 10]);
      const good = k * r.int(11, 199);
      const bad = [good + 1, good + (k === 10 ? 5 : 3), good - 1].filter((x) => x % k !== 0);
      const all = r.shuffle([good, ...bad.slice(0, 3)]);
      return qcm(`Quel nombre est un multiple de ${k} ?`, all.map((x) => (x === good ? `*${fr(x)}` : fr(x))), k === 2 ? 'Un multiple de 2 se termine par 0, 2, 4, 6 ou 8.' : k === 5 ? 'Un multiple de 5 se termine par 0 ou 5.' : 'Un multiple de 10 se termine par 0.');
    },
  },
  {
    id: 'g-distrib',
    difficulty: 3,
    build: (r) => {
      const a = r.int(3, 9), b = r.int(11, 19);
      return num(`Calcule de tête : ${a} × ${b}`, a * b, `On décompose : ${a} × ${b} = ${a} × 10 + ${a} × ${b - 10} = ${a * 10} + ${a * (b - 10)} = ${a * b}.`);
    },
  },
];

const poseGens: GenSpec[] = [
  { id: 'g-add', difficulty: 1, build: (r) => ({ type: 'column', op: '+', a: r.int(10_000, 69_999), b: r.int(1_000, 29_999), prompt: 'Pose et calcule l’addition.', explanation: 'On aligne les chiffres et on additionne de droite à gauche avec les retenues.' }) },
  { id: 'g-sous', difficulty: 2, build: (r) => { const a = r.int(20_000, 99_999); return { type: 'column', op: '-', a, b: r.int(1_000, a - 5_000), prompt: 'Pose et calcule la soustraction.', explanation: 'On soustrait colonne par colonne, des unités vers la gauche, en gérant les retenues.' }; } },
  {
    id: 'g-dec',
    difficulty: 3,
    build: (r) => {
      const a = r.int(1000, 9999) / 100, b = r.int(100, Math.floor(a * 100) - 50) / 100;
      return num(`Calcule (pose l’opération sur ton brouillon) : ${fr(a, 2)} − ${fr(b, 2)}`, r2(a - b), `On aligne les virgules : ${fr(a, 2)} − ${fr(b, 2)} = ${fr(r2(a - b), 2)}.`, { hint: 'Aligne les virgules les unes sous les autres.' });
    },
  },
];

const mulGens: GenSpec[] = [
  { id: 'g-mul1', difficulty: 1, build: (r) => ({ type: 'column', op: '×', a: r.int(102, 999), b: r.int(3, 9), prompt: 'Pose et calcule la multiplication.', explanation: 'On multiplie chaque chiffre par le multiplicateur, de droite à gauche, avec les retenues.' }) },
  { id: 'g-mul2', difficulty: 2, build: (r) => ({ type: 'column', op: '×', a: r.int(102, 999), b: r.int(12, 59), prompt: 'Pose et calcule la multiplication par un nombre à deux chiffres.', explanation: 'Une ligne pour les unités, une ligne pour les dizaines (décalée avec un 0), puis on additionne.' }) },
  {
    id: 'g-dec',
    difficulty: 3,
    build: (r) => {
      const a = r.int(12, 99) / 10, k = r.int(2, 9);
      return num(`Calcule : ${fr(a, 1)} × ${k}`, r2(a * k), `On calcule ${Math.round(a * 10)} × ${k} = ${Math.round(a * 10) * k}, puis on remet un chiffre après la virgule : ${fr(r2(a * k), 2)}.`);
    },
  },
];

const divGens: GenSpec[] = [
  {
    id: 'g-quotient',
    difficulty: 1,
    build: (r) => {
      const d = r.int(2, 9), q = r.int(12, 199), rest = r.int(0, d - 1);
      return num(`Pose la division de ${d * q + rest} par ${d}. Quel est le quotient ?`, q, `${d} × ${q} = ${d * q}, il reste ${rest} : ${d * q + rest} = ${d} × ${q} + ${rest}.`);
    },
  },
  {
    id: 'g-reste',
    difficulty: 2,
    build: (r) => {
      const d = r.int(3, 9), q = r.int(20, 120), rest = r.int(1, d - 1);
      return num(`Quel est le reste de la division de ${d * q + rest} par ${d} ?`, rest, `${d} × ${q} = ${d * q} ; ${d * q + rest} − ${d * q} = ${rest}. Le reste est toujours plus petit que ${d}.`);
    },
  },
  {
    id: 'g-probleme',
    difficulty: 3,
    build: (r) => {
      const d = r.pick([4, 6, 8]), q = r.int(8, 40), rest = r.int(1, d - 1);
      const n = d * q + rest;
      return num(`On range ${n} bouteilles dans des caisses de ${d}. Combien de caisses faut-il pour ranger toutes les bouteilles ?`, q + 1, `${n} = ${d} × ${q} + ${rest} : ${q} caisses pleines et une de plus pour les ${rest} bouteilles restantes, soit ${q + 1}.`, { hint: 'Les bouteilles qui restent ont aussi besoin d’une caisse !' });
    },
  },
];

const probGens: GenSpec[] = [
  {
    id: 'g-deux-etapes',
    difficulty: 2,
    build: (r) => {
      const who = r.pick(PRENOMS), n = r.int(3, 6), p = r.int(4, 15), paid = 100;
      return num(`${who} achète ${n} livres à ${p} € pièce et paie avec un billet de ${paid} €. Combien lui rend-on ?`, paid - n * p, `Prix : ${n} × ${p} = ${n * p} €. Monnaie : ${paid} − ${n * p} = ${paid - n * p} €.`, { unit: '€' });
    },
  },
  {
    id: 'g-comparaison',
    difficulty: 2,
    build: (r) => {
      const a = r.int(15, 60), k = r.int(3, 5);
      return num(`Un vélo coûte ${a * k} €. C’est ${k} fois plus cher qu’une trottinette. Combien coûte la trottinette ?`, a, `« ${k} fois plus cher » : on divise le prix du vélo par ${k}. ${a * k} ÷ ${k} = ${a} €.`, { unit: '€' });
    },
  },
  {
    id: 'g-trois-etapes',
    difficulty: 3,
    build: (r) => {
      const rows = r.int(8, 15), seats = r.int(10, 20), sold = r.int(30, rows * seats - 10), price = r.int(5, 9);
      return num(`Un théâtre a ${rows} rangées de ${seats} places. ${sold} places sont déjà vendues. Chaque place restante coûte ${price} €. Combien rapporterait la vente de toutes les places restantes ?`, (rows * seats - sold) * price, `Places : ${rows} × ${seats} = ${rows * seats}. Restantes : ${rows * seats} − ${sold} = ${rows * seats - sold}. Recette : ${rows * seats - sold} × ${price} = ${(rows * seats - sold) * price} €.`, { unit: '€', hint: 'Trois étapes : total des places, places restantes, prix.' });
    },
  },
  {
    id: 'g-proportion',
    difficulty: 2,
    build: (r) => {
      const n1 = r.pick([2, 3, 4]), unit = r.int(2, 9), k = r.int(2, 4);
      return num(`${n1} cahiers coûtent ${n1 * unit} €. Combien coûtent ${n1 * k} cahiers ?`, n1 * k * unit, `${n1 * k} cahiers, c’est ${k} fois plus : ${n1 * unit} × ${k} = ${n1 * k * unit} €.`, { unit: '€' });
    },
  },
];

const algGens: GenSpec[] = [
  {
    id: 'g-manquant',
    difficulty: 1,
    build: (r) => {
      const a = r.int(120, 900), b = r.int(50, 500);
      return num(`Trouve le nombre manquant : ${a} + … = ${a + b}`, b, `${a + b} − ${a} = ${b}. Pour trouver le nombre manquant d’une addition, on soustrait.`);
    },
  },
  {
    id: 'g-suite',
    difficulty: 2,
    build: (r) => {
      const s = r.int(5, 50), step = r.int(4, 25);
      const seq = [0, 1, 2, 3].map((i) => s + i * step);
      return num(`Quel nombre vient ensuite ? ${seq.join(' ; ')} ; …`, s + 4 * step, `On ajoute ${step} à chaque fois.`);
    },
  },
  {
    id: 'g-programme',
    difficulty: 3,
    build: (r) => {
      const x = r.int(2, 15), m = r.int(2, 6), a = r.int(1, 20);
      return num(`Programme de calcul : « Choisis un nombre, multiplie-le par ${m}, ajoute ${a}. » On obtient ${x * m + a}. Quel était le nombre choisi ?`, x, `On remonte : ${x * m + a} − ${a} = ${x * m}, puis ÷ ${m} = ${x}.`);
    },
  },
];

const mesureGens: GenSpec[] = [
  { id: 'g-m-cm', difficulty: 1, build: (r) => { const m = r.int(2, 40); return num(`Combien de centimètres font ${m} m ?`, m * 100, `1 m = 100 cm : ${m} × 100 = ${fr(m * 100)} cm.`, { unit: 'cm' }); } },
  { id: 'g-km-m', difficulty: 2, build: (r) => { const k = r.int(2, 30), m = r.int(10, 990); return num(`Convertis ${k} km ${m} m en mètres.`, k * 1000 + m, `${k} km = ${fr(k * 1000)} m ; + ${m} m = ${fr(k * 1000 + m)} m.`, { unit: 'm' }); } },
  { id: 'g-kg-g', difficulty: 2, build: (r) => { const k = r.int(2, 9), g = r.int(50, 950); return num(`Convertis ${k} kg ${g} g en grammes.`, k * 1000 + g, `1 kg = 1 000 g : ${fr(k * 1000)} + ${g} = ${fr(k * 1000 + g)} g.`, { unit: 'g' }); } },
  { id: 'g-l-cl', difficulty: 3, build: (r) => { const l = r.int(2, 9); const unit = r.pick(['cL', 'mL'] as const); const f = unit === 'cL' ? 100 : 1000; return num(`Combien de ${unit} font ${l} L ?`, l * f, `1 L = ${fr(f)} ${unit} : ${l} × ${fr(f)} = ${fr(l * f)} ${unit}.`, { unit }); } },
  { id: 'g-perimetre', difficulty: 2, build: (r) => { const L = r.int(6, 30), l = r.int(2, L - 1); return num(`Quel est le périmètre d’un rectangle de ${L} cm sur ${l} cm ?`, 2 * (L + l), `On fait le tour : ${L} + ${l} + ${L} + ${l} = ${2 * (L + l)} cm.`, { unit: 'cm', visual: { kind: 'rect', w: L, h: l, unit: 'cm' } }); } },
  { id: 'g-aire', difficulty: 2, build: (r) => { const w = r.int(2, 8), h = r.int(2, 6); return num('Quelle est l’aire de ce rectangle, en cm² (chaque carreau mesure 1 cm²) ?', w * h, `${h} lignes de ${w} carreaux : ${w * h} cm².`, { unit: 'cm²', visual: { kind: 'rect', w, h, unit: 'cm', squares: true } }); } },
];

const dureeGens: GenSpec[] = [
  {
    id: 'g-horloge',
    difficulty: 1,
    build: (r) => {
      const h = r.int(1, 12), m = r.pick([5, 10, 20, 25, 35, 40, 50, 55]);
      const lab = (hh: number, mm: number) => `${hh} h ${String(mm).padStart(2, '0')}`;
      const opts = [...new Set([lab(h, m), lab(h, 60 - m), lab((h % 12) + 1, m), lab(h, (m + 30) % 60)])];
      return qcm('Quelle heure indique l’horloge ?', opts.map((o, i) => (i === 0 ? `*${o}` : o)), `La petite aiguille indique ${h} h, la grande aiguille ${m} minutes.`, { visual: { kind: 'clock', h, m } });
    },
  },
  {
    id: 'g-duree',
    difficulty: 2,
    build: (r) => {
      const s = r.int(8, 16) * 60 + r.pick([10, 25, 40, 55]), d = r.int(35, 160), e = s + d;
      const f = (t: number) => `${Math.floor(t / 60)} h ${String(t % 60).padStart(2, '0')}`;
      return num(`Une sortie commence à ${f(s)} et se termine à ${f(e)}. Combien de minutes dure-t-elle ?`, d, `De ${f(s)} à ${f(e)}, il s’écoule ${Math.floor(d / 60)} h ${d % 60} min, soit ${d} minutes.`, { unit: 'min', hint: 'Avance d’abord jusqu’à l’heure pile.' });
    },
  },
  { id: 'g-conv', difficulty: 3, build: (r) => { const h = r.int(1, 5), m = r.int(5, 55); return num(`Convertis ${h} h ${m} min en minutes.`, h * 60 + m, `${h} × 60 = ${h * 60} min ; + ${m} = ${h * 60 + m} min.`, { unit: 'min' }); } },
];

export const cm1Maths = [
  S({
    id: 'cm1-ma-num',
    domain: 'Nombres et calculs — nombres entiers',
    title: 'Les nombres jusqu’à 999 999',
    diag: true,
    lesson: L(
      'Je vais apprendre à lire, écrire, décomposer et comparer les nombres jusqu’à 999 999.',
      'Dans l’Atelier des Nombres, les inventeurs comptent leurs engrenages par milliers !',
      ['On regroupe les chiffres par classes de 3 : la classe des mille et la classe des unités. On laisse un espace entre les classes : 245 380.', 'Dans chaque classe : centaines, dizaines, unités.', 'On lit la classe des mille puis on dit « mille », puis la classe des unités : deux-cent-quarante-cinq-mille-trois-cent-quatre-vingts.'],
      ['Que vaut le chiffre 7 dans 172 450 ?', '7 dizaines de mille, soit 70 000.'],
      ['Je découpe : 172 | 450.', 'Le 7 est dans la classe des mille, au rang des dizaines.', 'Il vaut 7 dizaines de mille = 70 000.'],
      ['Imagine une machine à deux tiroirs : le tiroir de gauche compte les « mille », celui de droite les unités. 172 450 = 172 mille et 450.'],
      'Classes de 3 chiffres : mille | unités. Chaque rang vaut 10 fois le rang à sa droite.',
    ),
    items: [
      num('Écris en chiffres : trois-cent-mille-quarante.', 300_040, '300 | 040 : n’oublie pas les zéros.'),
      qcm('Quel est le chiffre des dizaines de mille dans 584 213 ?', ['*8', '5', '4', '2'], '584 | 213 : 5 centaines de mille, 8 dizaines de mille, 4 unités de mille.'),
      vf('Dans 90 506, il y a 9 dizaines de mille.', true, '90 | 506 : 9 dizaines de mille et 0 unité de mille.'),
      num('Quel nombre vient juste après 99 999 ?', 100_000, '99 999 + 1 = 100 000 : cent-mille.'),
      num('Combien de milliers en tout dans 405 000 ?', 405, '405 000 = 405 milliers.', { d: 3 }),
    ],
    gens: numGens,
  }),
  S({
    id: 'cm1-ma-comparer',
    domain: 'Nombres et calculs — nombres entiers',
    title: 'Comparer, ranger, arrondir',
    prereq: ['cm1-ma-num'],
    lesson: L(
      'Je vais apprendre à comparer, ranger, encadrer et arrondir des grands nombres.',
      'Quel inventeur a fabriqué le plus de pièces cette année ?',
      ['Le nombre qui a le plus de chiffres est le plus grand.', 'Sinon, on compare les chiffres un par un en partant de la gauche.', 'Arrondir au millier : on garde le millier le plus proche ; si le chiffre des centaines est 5 ou plus, on prend le millier suivant.', 'On peut placer les nombres sur une demi-droite graduée.'],
      ['Arrondis 48 620 au millier.', '49 000 (6 centaines, c’est 5 ou plus).'],
      ['48 620 est entre 48 000 et 49 000.', 'Le chiffre des centaines est 6.', '6 ≥ 5 : on arrondit à 49 000.'],
      ['Sur une route graduée de 48 000 à 49 000, 48 620 est après le milieu (48 500) : il est plus près de 49 000.'],
      'Comparer de gauche à droite. Arrondir : regarder le chiffre juste à droite du rang choisi.',
    ),
    items: [
      qcm('Quel est le plus grand nombre ?', ['*120 001', '99 999', '102 100', '119 999'], '120 001 : 12 dizaines de mille, plus que les autres.'),
      vf('305 640 > 350 640', false, 'Dizaines de mille : 0 < 5, donc 305 640 < 350 640.'),
      num('Arrondis 72 380 au millier le plus proche.', 72_000, '3 centaines < 5 : on arrondit à 72 000.'),
      ordre('Range du plus petit au plus grand.', ['9 870', '70 980', '78 090', '700 890'], 'On compare le nombre de chiffres, puis les chiffres de gauche à droite.', 'number'),
    ],
    gens: cmpGens,
  }),
  S({
    id: 'cm1-ma-fractions',
    domain: 'Nombres et calculs — fractions',
    title: 'Les fractions',
    diag: true,
    lesson: L(
      'Je vais apprendre à lire, comparer, encadrer et additionner des fractions, et à calculer une fraction d’une quantité.',
      'Pour construire sa machine volante, l’inventeur découpe des planches en parts égales.',
      ['a/b : on partage l’unité en b parts égales et on en prend a.', 'Une fraction peut être plus grande que 1 : 7/4 = 4/4 + 3/4 = 1 + 3/4.', 'Avec le même dénominateur, la plus grande fraction a le plus grand numérateur. On additionne ou on soustrait les numérateurs : 2/5 + 4/5 = 6/5.', 'Fraction d’une quantité : 3/4 de 20 = (20 ÷ 4) × 3 = 15.'],
      ['Combien font 2/3 de 18 ?', '18 ÷ 3 = 6 ; 6 × 2 = 12.'],
      ['Je cherche 1/3 de 18 : 18 ÷ 3 = 6.', 'Je veux 2/3 : 6 × 2 = 12.'],
      ['Place les fractions sur une règle graduée en quarts : 1/4, 2/4, 3/4, 4/4 = 1, 5/4… On voit qu’elles continuent après 1 !'],
      'Dénominateur = parts égales ; numérateur = parts prises. Même dénominateur : on compare et on additionne les numérateurs.',
    ),
    items: [
      qcm('Comment lit-on 5/8 ?', ['*cinq huitièmes', 'huit cinquièmes', 'cinq sur huit tiers', 'cinq et huit'], '5/8 se lit « cinq huitièmes ».'),
      vf('9/4 est plus grand que 2.', true, '8/4 = 2 et 9/4 > 8/4.'),
      num('Combien font 3/5 de 40 ?', 24, '40 ÷ 5 = 8 ; 8 × 3 = 24.'),
      qcm('Quelle fraction est égale à 1 ?', ['*7/7', '1/7', '7/1', '0/7'], 'Si on prend toutes les parts, on a l’unité entière.'),
      ordre('Range du plus petit au plus grand.', ['1/6', '3/6', '5/6', '8/6'], 'Même dénominateur : on range les numérateurs.', 'number'),
    ],
    gens: fracGens,
  }),
  S({
    id: 'cm1-ma-decimaux',
    domain: 'Nombres et calculs — nombres décimaux',
    title: 'Les nombres décimaux (dixièmes et centièmes)',
    prereq: ['cm1-ma-fractions'],
    lesson: L(
      'Je vais apprendre à écrire des fractions décimales avec une virgule, à comparer et à arrondir des nombres décimaux.',
      'Le chronomètre de la course des inventeurs affiche 12,35 secondes : que signifie la virgule ?',
      ['Un dixième = 1/10 = 0,1 ; un centième = 1/100 = 0,01.', '12,35 = 12 + 3/10 + 5/100 = 12 + 35/100. 12 est la partie entière.', 'Pour comparer : partie entière, puis dixièmes, puis centièmes. On peut ajouter des zéros : 4,5 = 4,50.', 'Arrondir à l’unité : regarder le chiffre des dixièmes (5 ou plus → unité suivante).'],
      ['Écris 47/100 avec une virgule.', '0,47'],
      ['47 centièmes.', 'La partie entière est 0.', '0,47.'],
      ['Pense à l’argent : 3,45 € = 3 euros et 45 centimes. Un centime est un centième d’euro.'],
      'Dixièmes au 1er rang après la virgule, centièmes au 2e. 3,5 = 3,50 > 3,45.',
    ),
    items: [
      num('Écris 3 + 7/10 avec une virgule.', 3.7, '3 unités et 7 dixièmes : 3,7.'),
      qcm('Quel est le plus grand ?', ['*2,6', '2,58', '2,09', '2,5'], '6 dixièmes est le plus grand nombre de dixièmes.'),
      vf('0,5 et 0,50 sont égaux.', true, '5 dixièmes = 50 centièmes.'),
      num('Arrondis 8,72 à l’unité la plus proche.', 9, '7 dixièmes ≥ 5 : on arrondit à 9.'),
    ],
    gens: decGens,
  }),
  S({
    id: 'cm1-ma-mental',
    domain: 'Nombres et calculs — calcul mental',
    title: 'Calcul mental, multiples et diviseurs',
    diag: true,
    lesson: L(
      'Je vais apprendre des stratégies pour calculer vite : × 10, × 100, × 4, × 5, × 8, et reconnaître les multiples.',
      'Les inventeurs calculent de tête le nombre de vis dont ils ont besoin.',
      ['× 10, × 100, × 1 000 : chaque chiffre prend une valeur 10, 100, 1 000 fois plus grande.', '× 4 = double du double ; × 8 = double du double du double ; × 5 = × 10 puis moitié.', 'On peut décomposer : 6 × 14 = 6 × 10 + 6 × 4 = 60 + 24 = 84.', 'Les multiples de 2 finissent par 0, 2, 4, 6, 8 ; ceux de 5 par 0 ou 5 ; ceux de 10 par 0.'],
      ['Calcule 23 × 4.', '23 × 2 = 46 ; 46 × 2 = 92.'],
      ['× 4, c’est deux fois × 2.', '23 × 2 = 46.', '46 × 2 = 92.'],
      ['Une machine à doubler : passer 3 fois dans la machine, c’est multiplier par 8 !'],
      '× 4 = double du double ; × 5 = × 10 ÷ 2 ; décomposer pour simplifier.',
    ),
    items: [
      num('Calcule de tête : 37 × 100', 3700, 'Chaque chiffre prend une valeur 100 fois plus grande : 3 700.'),
      num('Calcule de tête : 16 × 5', 80, '16 × 10 = 160 ; moitié : 80.'),
      vf('45 est un multiple de 5.', true, 'Il se termine par 5 : 45 = 5 × 9.'),
      qcm('Quel nombre est un diviseur de 36 ?', ['*9', '5', '7', '8'], '36 = 9 × 4 ; 36 n’est pas dans les tables de 5, 7 ou 8.'),
    ],
    gens: mentalGens,
  }),
  S({
    id: 'cm1-ma-add-sous',
    domain: 'Nombres et calculs — calcul posé',
    title: 'Additions et soustractions posées',
    prereq: ['cm1-ma-num'],
    lesson: L(
      'Je vais poser des additions et des soustractions de grands nombres et de nombres décimaux.',
      'L’inventeur additionne les engrenages de ses deux ateliers.',
      ['J’aligne les chiffres de même rang : unités sous unités…', 'Avec des décimaux, j’aligne les virgules (j’ajoute des zéros si besoin).', 'Je calcule de droite à gauche en gérant les retenues.', 'Je vérifie avec un ordre de grandeur : 4 980 + 3 020 ≈ 5 000 + 3 000 = 8 000.'],
      ['Calcule 12,5 + 3,75.', '12,50 + 3,75 = 16,25'],
      ['J’ajoute un zéro : 12,50.', 'J’aligne les virgules.', 'Je calcule : 16,25.'],
      ['La virgule, c’est comme la colonne vertébrale de l’opération : elles doivent toutes être alignées !'],
      'Aligner les chiffres (et les virgules), calculer de droite à gauche, vérifier l’ordre de grandeur.',
    ),
    items: [
      num('Calcule : 45 300 + 12 700', 58_000, '300 + 700 = 1 000 ; 45 000 + 12 000 + 1 000 = 58 000.'),
      num('Calcule : 6,4 + 2,35', 8.75, '6,40 + 2,35 = 8,75.'),
      qcm('Quel est l’ordre de grandeur de 39 870 − 10 120 ?', ['*30 000', '3 000', '300 000', '50 000'], '40 000 − 10 000 = 30 000.'),
    ],
    gens: poseGens,
  }),
  S({
    id: 'cm1-ma-multiplication',
    domain: 'Nombres et calculs — calcul posé',
    title: 'La multiplication posée',
    prereq: ['cm1-ma-mental'],
    d: 2,
    lesson: L(
      'Je vais poser une multiplication par un nombre à un ou deux chiffres, et multiplier un décimal par un entier.',
      'Combien de rivets pour 24 machines de 135 rivets chacune ?',
      ['Par un nombre à 1 chiffre : je multiplie chaque chiffre, de droite à gauche, avec les retenues.', 'Par un nombre à 2 chiffres : une ligne pour les unités, une ligne pour les dizaines (avec un 0 à droite), puis j’additionne.', 'Décimal × entier : je calcule sans la virgule, puis je remets autant de chiffres après la virgule.'],
      ['Calcule 135 × 24.', '540 + 2 700 = 3 240'],
      ['135 × 4 = 540.', '135 × 20 = 2 700 (ligne avec un 0).', '540 + 2 700 = 3 240.'],
      ['24 machines, c’est 4 machines + 20 machines : on calcule les deux groupes puis on additionne.'],
      'Une ligne par chiffre du multiplicateur, décalée ; on additionne les lignes.',
    ),
    items: [
      num('Calcule : 212 × 3', 636, '2 × 3 = 6 ; 1 × 3 = 3 ; 2 × 3 = 6.'),
      num('Calcule : 2,5 × 4', 10, '25 × 4 = 100 ; un chiffre après la virgule : 10,0 = 10.'),
      qcm('Dans 145 × 32, que vaut la deuxième ligne ?', ['*4 350', '435', '290', '4 640'], '145 × 30 = 4 350 (on écrit un 0 puis 145 × 3).'),
    ],
    gens: mulGens,
  }),
  S({
    id: 'cm1-ma-division',
    domain: 'Nombres et calculs — division',
    title: 'La division euclidienne',
    prereq: ['cm1-ma-mental'],
    d: 2,
    lesson: L(
      'Je vais apprendre à poser une division par un nombre à un chiffre et à interpréter le reste.',
      'On répartit 157 boulons dans 6 boîtes identiques : combien par boîte ?',
      ['Diviser, c’est chercher combien de fois le diviseur « entre » dans le nombre.', 'Dividende = diviseur × quotient + reste, et le reste est plus petit que le diviseur.', 'On pose la division en commençant par la gauche, puis on abaisse les chiffres un à un.', 'Dans un problème, le reste compte parfois : il faut une boîte de plus pour les objets restants !'],
      ['Divise 157 par 6.', 'Quotient 26, reste 1 : 157 = 6 × 26 + 1.'],
      ['15 ÷ 6 → 2 (12), reste 3.', 'J’abaisse le 7 : 37 ÷ 6 → 6 (36), reste 1.', 'Vérification : 6 × 26 + 1 = 157.'],
      ['Distribue comme des cartes : 6 joueurs, 157 cartes. Chacun en reçoit 26 et il en reste 1.'],
      'Dividende = diviseur × quotient + reste ; reste < diviseur.',
    ),
    items: [
      num('Quel est le quotient de 96 ÷ 4 ?', 24, '4 × 24 = 96.'),
      vf('Dans une division par 5, le reste peut être 6.', false, 'Le reste est toujours plus petit que le diviseur.'),
      qcm('Quelle égalité correspond à « 53 divisé par 7 » ?', ['*53 = 7 × 7 + 4', '53 = 7 × 8 − 3', '53 = 7 × 6 + 11', '53 = 5 × 7 + 3'], '7 × 7 = 49 et 53 − 49 = 4 (4 < 7).'),
    ],
    gens: divGens,
  }),
  S({
    id: 'cm1-ma-problemes',
    domain: 'Nombres et calculs — résolution de problèmes',
    title: 'Résoudre des problèmes (1 à 3 étapes)',
    prereq: ['cm1-ma-add-sous'],
    diag: true,
    d: 2,
    lesson: L(
      'Je vais apprendre à résoudre des problèmes en plusieurs étapes, y compris de proportionnalité.',
      'Chaque invention commence par un problème bien posé !',
      ['Je lis l’énoncé et je repère la question finale.', 'Je cherche les questions intermédiaires et je les écris.', 'Je représente la situation : schéma en barres, tableau.', '« … fois plus » : on multiplie ; « … fois moins » : on divise. Si 2 objets coûtent 6 €, 4 objets coûtent 12 € (proportionnalité).', 'Je calcule, je vérifie l’ordre de grandeur et je réponds par une phrase.'],
      ['3 boîtes de 24 crayons ; on en distribue 50. Combien en reste-t-il ?', '3 × 24 = 72 ; 72 − 50 = 22.'],
      ['Question intermédiaire : combien de crayons en tout ? 3 × 24 = 72.', 'Question finale : 72 − 50 = 22.', 'Réponse : il reste 22 crayons.'],
      ['Comme un inventeur qui monte une machine pièce par pièce : chaque étape du calcul est une pièce.'],
      'Question finale → questions intermédiaires → calculs → vérification → phrase réponse.',
    ),
    items: [
      num('Un car transporte 48 élèves. Combien d’élèves transportent 6 cars pleins ?', 288, '6 × 48 = 288.'),
      qcm('« Léo a 4 fois plus de timbres que Noa, qui en a 35. » Combien Léo en a-t-il ?', ['*140', '39', '31', '9'], '« 4 fois plus » : 35 × 4 = 140.'),
      num('Une ficelle de 3 m est coupée en morceaux de 25 cm. Combien de morceaux obtient-on ?', 12, '3 m = 300 cm ; 300 ÷ 25 = 12.', { hint: 'Convertis d’abord dans la même unité.' }),
      vf('Pour savoir combien coûtent 6 croissants à 1 € 20, on peut calculer 6 × 1,20.', true, '6 × 1,20 = 7,20 €.'),
    ],
    gens: probGens,
  }),
  S({
    id: 'cm1-ma-algebre',
    domain: 'Nombres et calculs — initiation à l’algèbre',
    title: 'Nombres manquants, suites et programmes de calcul',
    prereq: ['cm1-ma-mental'],
    d: 2,
    lesson: L(
      'Je vais apprendre à trouver un nombre manquant, la règle d’une suite et le résultat d’un programme de calcul.',
      'La porte de l’atelier s’ouvre avec un code : trouve la règle !',
      ['Nombre manquant : dans 48 + … = 75, on calcule 75 − 48 = 27.', 'Une suite suit une règle (ajouter 6, multiplier par 2…).', 'Un programme de calcul enchaîne des opérations. Pour retrouver le nombre de départ, on fait les opérations inverses, dans l’ordre inverse.', 'Une lettre peut désigner un nombre inconnu : n + 5 = 12, donc n = 7.'],
      ['Trouve n : n × 6 = 42.', 'n = 7, car 7 × 6 = 42.'],
      ['Je cherche quel nombre multiplié par 6 donne 42.', 'Je connais 6 × 7 = 42.', 'n = 7.'],
      ['Le nombre manquant est caché sous un gobelet : utilise l’opération inverse pour soulever le gobelet !'],
      'Opération inverse : + ↔ −, × ↔ ÷.',
    ),
    items: [
      num('Trouve n : n + 125 = 400', 275, '400 − 125 = 275.'),
      num('Suite : 3 ; 6 ; 12 ; 24 ; … Quel est le nombre suivant ?', 48, 'On multiplie par 2 à chaque fois.'),
      qcm('Quelle est la règle de 90 ; 81 ; 72 ; 63 ?', ['*on enlève 9', 'on enlève 8', 'on divise par 2', 'on ajoute 9'], '90 − 9 = 81…'),
    ],
    gens: algGens,
  }),
  S({
    id: 'cm1-ma-mesures',
    domain: 'Grandeurs et mesures',
    title: 'Longueurs, masses, contenances, périmètres et aires',
    lesson: L(
      'Je vais apprendre à convertir des longueurs, des masses et des contenances, et à calculer un périmètre et une aire simple.',
      'Pour fabriquer une montgolfière, il faut mesurer le tissu, peser le panier et remplir les réservoirs.',
      ['Longueurs : 1 km = 1 000 m ; 1 m = 100 cm ; 1 cm = 10 mm.', 'Masses : 1 kg = 1 000 g ; 1 t = 1 000 kg ; 1 g = 1 000 mg.', 'Contenances : 1 L = 100 cL = 1 000 mL ; 1 hL = 100 L.', 'Le périmètre est la longueur du tour d’une figure. L’aire est la surface : on peut compter les carreaux d’1 cm² qui la recouvrent.'],
      ['Convertis 2 km 350 m en mètres.', '2 350 m'],
      ['2 km = 2 000 m.', 'J’ajoute 350 m.', '2 000 + 350 = 2 350 m.'],
      ['Périmètre = la clôture du jardin ; aire = la pelouse à l’intérieur.'],
      'km → m : × 1 000 ; m → cm : × 100 ; kg → g : × 1 000 ; L → cL : × 100.',
    ),
    items: [
      qcm('Quelle unité pour la masse d’une voiture ?', ['*la tonne ou le kilogramme', 'le milligramme', 'le centilitre', 'le mètre'], 'Une voiture pèse environ 1 tonne.'),
      num('Combien de mL dans une bouteille de 2 L ?', 2000, '1 L = 1 000 mL.', { unit: 'mL' }),
      vf('Deux figures de même aire ont toujours le même périmètre.', false, 'Un rectangle 1 × 4 et un carré 2 × 2 ont la même aire mais pas le même périmètre.', { d: 3 }),
      tri('Longueur, masse ou contenance ?', ['Longueur', 'Masse', 'Contenance'], [['3 km', 0], ['250 g', 1], ['75 cL', 2], ['12 mm', 0], ['2 t', 1], ['1 hL', 2]], 'L’unité indique la grandeur mesurée.'),
    ],
    gens: mesureGens,
  }),
  S({
    id: 'cm1-ma-durees',
    domain: 'Grandeurs et mesures — durées',
    title: 'Lire l’heure et calculer des durées',
    lesson: L(
      'Je vais lire l’heure à la minute près et calculer des durées.',
      'Le train à vapeur de l’inventeur part à l’heure pile… ou presque !',
      ['La petite aiguille indique les heures, la grande les minutes (chaque petit trait = 1 minute).', '1 h = 60 min ; 1 min = 60 s ; 1 jour = 24 h.', 'Pour calculer une durée, j’avance par bonds jusqu’à l’heure pile, puis jusqu’à l’heure d’arrivée.'],
      ['Durée entre 9 h 45 et 11 h 10 ?', '15 min + 1 h + 10 min = 1 h 25 min'],
      ['9 h 45 → 10 h : 15 min.', '10 h → 11 h : 1 h.', '11 h → 11 h 10 : 10 min. Total : 1 h 25 min.'],
      ['Dessine une ligne du temps et fais des sauts : c’est plus sûr que de soustraire directement.'],
      '1 h = 60 min ; calculer une durée = faire des bonds.',
    ),
    items: [
      num('Combien de minutes dans 3 heures ?', 180, '3 × 60 = 180 min.', { unit: 'min' }),
      qcm('Quelle heure indique l’horloge ?', ['*4 h 35', '7 h 20', '4 h 07', '5 h 35'], 'Petite aiguille entre 4 et 5, grande aiguille sur le 7 : 35 minutes.', { visual: { kind: 'clock', h: 4, m: 35 } }),
      vf('Une demi-journée dure 12 heures.', true, '24 ÷ 2 = 12.'),
    ],
    gens: dureeGens,
  }),
  S({
    id: 'cm1-ma-geometrie',
    domain: 'Espace et géométrie',
    title: 'Figures planes : cercle, triangles, quadrilatères',
    diag: true,
    lesson: L(
      'Je vais reconnaître et décrire le cercle, les triangles et les quadrilatères, et repérer des droites perpendiculaires et parallèles.',
      'Les plans des machines sont pleins de figures : il faut savoir les nommer précisément.',
      ['Deux droites perpendiculaires se coupent en formant un angle droit ; deux droites parallèles ne se coupent jamais.', 'Triangles particuliers : rectangle (1 angle droit), isocèle (2 côtés égaux), équilatéral (3 côtés égaux).', 'Quadrilatères : carré (4 côtés égaux, 4 angles droits), rectangle (4 angles droits), losange (4 côtés égaux).', 'Cercle : centre, rayon (du centre au cercle), diamètre (2 rayons), tracé au compas.'],
      ['Un quadrilatère a 4 angles droits mais pas 4 côtés égaux. Qu’est-ce ?', 'Un rectangle.'],
      ['4 angles droits : carré ou rectangle.', 'Les côtés ne sont pas tous égaux : pas un carré.', 'C’est un rectangle.'],
      ['Le carré est le « champion » : il est à la fois rectangle et losange.'],
      'Équerre pour les angles droits, règle pour les longueurs, compas pour les cercles.',
    ),
    items: [
      qcm('Comment s’appelle un triangle qui a 2 côtés de même longueur ?', ['*isocèle', 'équilatéral', 'rectangle', 'quelconque'], 'Isocèle : 2 côtés égaux.'),
      qcm('Quelle figure est représentée ?', ['*un losange', 'un carré', 'un rectangle', 'un hexagone'], '4 côtés égaux sans angle droit.', { visual: shape('losange') }),
      vf('Deux droites parallèles se coupent en formant un angle droit.', false, 'Ce sont les perpendiculaires qui forment un angle droit ; les parallèles ne se coupent jamais.'),
      num('Un cercle a un rayon de 6 cm. Quel est son diamètre ?', 12, 'Diamètre = 2 × rayon = 12 cm.', { unit: 'cm' }),
      qcm('Quelle figure est un triangle rectangle ?', ['*figure A', 'figure B', 'figure C', 'figure D'], 'Le triangle rectangle a un angle droit.', { choiceVisuals: [shape('triangle-rectangle'), shape('triangle'), shape('carre'), shape('pentagone')] }),
      tri('Ces propriétés sont-elles toujours vraies pour un rectangle ?', ['Toujours vrai', 'Pas toujours vrai'], [['4 angles droits', 0], ['4 côtés égaux', 1], ['côtés opposés de même longueur', 0], ['diagonales perpendiculaires', 1]], 'Un rectangle a 4 angles droits et des côtés opposés égaux ; seul le carré a en plus 4 côtés égaux.'),
    ],
  }),
  S({
    id: 'cm1-ma-symetrie-angles',
    domain: 'Espace et géométrie — symétrie et angles',
    title: 'Symétrie axiale et angles',
    prereq: ['cm1-ma-geometrie'],
    lesson: L(
      'Je vais reconnaître une figure symétrique, et comparer des angles (aigu, droit, obtus).',
      'Les ailes de la machine volante doivent être parfaitement symétriques pour voler droit !',
      ['Une figure a un axe de symétrie si, pliée le long de cet axe, ses deux moitiés se superposent.', 'Le symétrique d’un point est à la même distance de l’axe, de l’autre côté.', 'Un angle aigu est plus petit qu’un angle droit, un angle obtus plus grand. On vérifie avec l’équerre.'],
      ['Combien d’axes de symétrie a un rectangle (non carré) ?', '2'],
      ['Un axe vertical au milieu.', 'Un axe horizontal au milieu.', 'Les diagonales ne sont pas des axes : 2 axes.'],
      ['Pense au papillon : chaque aile est le reflet de l’autre dans un miroir posé sur son corps.'],
      'Symétrie = pliage parfait. Aigu < droit < obtus.',
    ),
    items: [
      num('Combien d’axes de symétrie a un carré ?', 4, '2 axes par les milieux des côtés et 2 par les diagonales.'),
      vf('La lettre H a deux axes de symétrie.', true, 'Un axe vertical et un axe horizontal.'),
      qcm('Quel est le type de cet angle ?', ['*obtus', 'aigu', 'droit'], 'Il est plus ouvert qu’un angle droit.', { visual: { kind: 'angle', deg: 130 } }),
      qcm('Quel est le type de cet angle ?', ['*aigu', 'obtus', 'droit'], 'Il est plus fermé qu’un angle droit.', { visual: { kind: 'angle', deg: 40 } }),
      vf('Le symétrique d’un point par rapport à un axe est à la même distance de l’axe.', true, 'C’est la propriété de la symétrie axiale.'),
    ],
  }),
  S({
    id: 'cm1-ma-solides',
    domain: 'Espace et géométrie — solides',
    title: 'Solides et patron du cube',
    prereq: ['cm1-ma-geometrie'],
    lesson: L(
      'Je vais reconnaître le cube, le pavé, la pyramide et le prisme droit, et comprendre le patron d’un cube.',
      'Avant de fabriquer une boîte, l’inventeur dessine son patron à plat.',
      ['Face = surface plate ; arête = bord ; sommet = coin.', 'Cube : 6 faces carrées, 12 arêtes, 8 sommets. Pavé droit : 6 faces rectangulaires.', 'Pyramide : une base et des faces triangulaires qui se rejoignent au sommet. Prisme droit : deux bases identiques reliées par des rectangles.', 'Un patron est le solide « déplié » : celui du cube a 6 carrés.'],
      ['Combien de sommets a un cube ?', '8'],
      ['4 coins en haut.', '4 coins en bas.', '4 + 4 = 8.'],
      ['Déplie une boîte de céréales : tu obtiens le patron d’un pavé droit !'],
      'Cube : 6 faces, 12 arêtes, 8 sommets ; patron = 6 carrés.',
    ),
    items: [
      qcm('Quel solide est représenté ?', ['*un pavé droit', 'un cube', 'une pyramide', 'un cylindre'], 'Ses faces sont des rectangles.', { visual: shape('pave') }),
      num('Combien d’arêtes a un cube ?', 12, '4 en haut, 4 en bas, 4 verticales.'),
      qcm('Combien de carrés faut-il pour le patron d’un cube ?', ['*6', '4', '8', '12'], 'Le cube a 6 faces carrées.'),
      vf('Une pyramide à base carrée a 4 faces triangulaires.', true, 'Plus sa base carrée : 5 faces en tout.'),
    ],
  }),
  S({
    id: 'cm1-ma-donnees',
    domain: 'Organisation et gestion de données — probabilités',
    title: 'Lire des données et découvrir le hasard',
    lesson: L(
      'Je vais lire des tableaux et des diagrammes, et décrire les issues d’une expérience de hasard.',
      'Les inventeurs notent leurs résultats d’expérience dans des tableaux.',
      ['Je lis d’abord le titre, les légendes et les unités.', 'Dans un tableau à double entrée, je croise une ligne et une colonne.', 'Une expérience aléatoire a des issues possibles : lancer un dé donne 1, 2, 3, 4, 5 ou 6. Si toutes ont la même chance, elles sont équiprobables.'],
      ['Quelles sont les issues du lancer d’une pièce ?', 'Pile ou face.'],
      ['On ne peut pas prévoir le résultat : c’est le hasard.', 'Il y a 2 issues : pile, face.', 'Elles ont la même chance : équiprobables.'],
      ['Imagine 100 lancers de pièce : environ la moitié tombera sur pile.'],
      'Titre, légendes, unités. Issues possibles ; équiprobable = même chance.',
    ),
    items: [
      num('Combien d’inventions ont été présentées en mars ?', 14, 'La barre « mars » s’arrête à 14.', { visual: { kind: 'bars', title: 'Inventions présentées', labels: ['Jan', 'Fév', 'Mars', 'Avr'], values: [8, 10, 14, 6] } }),
      num('Combien d’inventions en tout de janvier à avril ?', 38, '8 + 10 + 14 + 6 = 38.', { visual: { kind: 'bars', title: 'Inventions présentées', labels: ['Jan', 'Fév', 'Mars', 'Avr'], values: [8, 10, 14, 6] } }),
      num('Combien d’issues possibles quand on lance un dé à 6 faces ?', 6, '1, 2, 3, 4, 5 ou 6.'),
      vf('Avec un dé normal, obtenir 6 a autant de chances qu’obtenir 1.', true, 'Les 6 issues sont équiprobables.'),
      qcm('Dans un sac : 5 billes rouges et 1 bleue. Quelle couleur a le plus de chances de sortir ?', ['*rouge', 'bleue', 'autant de chances'], 'Il y a plus de billes rouges.'),
      num('Combien d’élèves de CM1 font du judo ?', 7, 'Ligne « judo », colonne « CM1 » : 7.', { visual: { kind: 'table', rows: [['Sport', 'CM1', 'CM2'], ['Football', '9', '11'], ['Judo', '7', '4'], ['Danse', '8', '6']] } }),
    ],
  }),
];
