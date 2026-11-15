import { L, num, ordre, qcm, skillsOf, tri, vf, type GenSpec } from '../authoring';
import { digitAt, gcd, numberToWords, numericChoices, PLACE_NAMES, PRENOMS } from '../math-helpers';
import { REF } from '../refs';
import type { ShapeKind, Visual } from '../types';
import { fr } from '@/utils/rng';

const S = skillsOf({ level: 'cm2', subject: 'maths', programRef: REF.cm2Maths, region: 'labo-maths' });
const shape = (s: ShapeKind): Visual => ({ kind: 'shape', shape: s });
const r3 = (x: number) => Math.round(x * 1000) / 1000;

const grandsGens: GenSpec[] = [
  {
    id: 'g-rang',
    difficulty: 1,
    build: (r) => {
      const n = r.int(1_000_000, 999_999_999);
      const p = r.int(3, 8);
      return qcm(`Dans ${fr(n)}, quel est le chiffre des ${PLACE_NAMES[p]} ?`, numericChoices(r, digitAt(n, p), [0, 1, 2, 3, 4, 5, 6, 7, 8].map((k) => digitAt(n, k))), `On découpe en classes de 3 chiffres (millions | milliers | unités). Le chiffre des ${PLACE_NAMES[p]} est ${digitAt(n, p)}.`);
    },
  },
  {
    id: 'g-lettres',
    difficulty: 2,
    build: (r) => {
      const n = r.pick([r.int(10_000, 999_999), r.int(1_000_000, 99_999_999)]);
      return num(`Écris en chiffres : « ${numberToWords(n)} ».`, n, `« ${numberToWords(n)} » = ${fr(n)}.`, { hint: 'Repère les mots « million » et « mille » : ils séparent les classes.' });
    },
  },
  {
    id: 'g-milliers',
    difficulty: 3,
    build: (r) => {
      const n = r.int(1_000_000, 99_999_999);
      return num(`Combien y a-t-il de milliers en tout dans ${fr(n)} ?`, Math.floor(n / 1000), `On cache les 3 derniers chiffres : ${fr(Math.floor(n / 1000))} milliers.`);
    },
  },
  {
    id: 'g-comparer',
    difficulty: 2,
    build: (r) => {
      const a = r.int(1_000_000, 9_999_999);
      const b = r.pick([a + r.int(1, 9) * 1000, a - r.int(1, 9) * 10_000, a + r.int(1, 99)]);
      return qcm(`Compare : ${fr(a)} … ${fr(b)}`, [a < b ? '*<' : '<', a > b ? '*>' : '>', '='], `On compare classe par classe en partant de la gauche : ${fr(a)} ${a < b ? '<' : '>'} ${fr(b)}.`);
    },
  },
];

const decGens: GenSpec[] = [
  {
    id: 'g-rang-dec',
    difficulty: 1,
    build: (r) => {
      const n = r.int(10_000, 99_999) / 1000; // ex. 45,678
      const names = ['millièmes', 'centièmes', 'dixièmes', 'unités'];
      const k = r.int(0, 3);
      const digit = digitAt(Math.round(n * 1000), k);
      return qcm(`Dans ${fr(n)}, quel est le chiffre des ${names[k]} ?`, numericChoices(r, digit, [0, 1, 2, 3, 4].map((p) => digitAt(Math.round(n * 1000), p))), `Après la virgule : dixièmes, centièmes, millièmes. Le chiffre des ${names[k]} est ${digit}.`);
    },
  },
  {
    id: 'g-fraction-dec',
    difficulty: 2,
    build: (r) => {
      const den = r.pick([10, 100, 1000]);
      const nu = r.int(3, den * 3 - 1);
      return num(`Écris ${nu}/${den} sous forme de nombre décimal.`, r3(nu / den), `${nu}/${den} = ${fr(nu / den)} (on divise par ${den}).`, { hint: `Divise par ${den} : la virgule se déplace de ${String(den).length - 1} rang(s) vers la gauche.` });
    },
  },
  {
    id: 'g-ranger-dec',
    difficulty: 3,
    build: (r) => {
      const base = r.int(1, 9);
      const vals = new Set<number>();
      while (vals.size < 4) vals.add(r3(base + r.pick([r.int(1, 9) / 10, r.int(1, 99) / 100, r.int(1, 999) / 1000])));
      const sorted = [...vals].sort((a, b) => a - b);
      return ordre('Range ces nombres décimaux du plus petit au plus grand.', sorted.map((x) => fr(x)), `On compare la partie entière, puis les dixièmes, centièmes, millièmes : ${sorted.map((x) => fr(x)).join(' < ')}.`, 'number', { hint: 'Ajoute des zéros pour avoir le même nombre de chiffres après la virgule.' });
    },
  },
  {
    id: 'g-add-dec',
    difficulty: 2,
    build: (r) => {
      const a = r.int(105, 999) / 100, b = r.int(15, 899) / 100;
      return num(`Calcule : ${fr(a)} + ${fr(b)}`, r3(a + b), `On aligne les virgules : ${fr(a)} + ${fr(b)} = ${fr(r3(a + b))}.`);
    },
  },
];

const fracGens: GenSpec[] = [
  {
    id: 'g-de-quantite',
    difficulty: 1,
    build: (r) => {
      const den = r.pick([2, 3, 4, 5, 10]);
      const nu = r.int(1, den - 1);
      const q = den * r.int(2, 12);
      return num(`Combien font ${nu}/${den} de ${q} ?`, (q / den) * nu, `${q} ÷ ${den} = ${q / den}, puis × ${nu} = ${(q / den) * nu}.`, { hint: `Cherche d’abord 1/${den} de ${q}.` });
    },
  },
  {
    id: 'g-comparer-un',
    difficulty: 1,
    build: (r) => {
      const den = r.int(3, 9);
      const nu = r.int(1, 2 * den);
      const rel = nu < den ? '<' : nu > den ? '>' : '=';
      return qcm(`Compare ${nu}/${den} et 1.`, ['<', '>', '='].map((s) => (s === rel ? `*${s}` : s)), `${den}/${den} = 1. Ici le numérateur ${nu} est ${rel === '<' ? 'plus petit' : rel === '>' ? 'plus grand' : 'égal'} que le dénominateur ${den}.`);
    },
  },
  {
    id: 'g-equiv',
    difficulty: 2,
    build: (r) => {
      const den = r.int(2, 6), nu = r.int(1, den - 1), k = r.int(2, 5);
      return num(`Complète l’égalité : ${nu}/${den} = …/${den * k}`, nu * k, `On multiplie le numérateur et le dénominateur par ${k} : ${nu * k}/${den * k}.`);
    },
  },
  {
    id: 'g-somme',
    difficulty: 3,
    build: (r) => {
      const den = r.int(4, 12), a = r.int(1, den - 1), b = r.int(1, den);
      const g = gcd(a + b, den);
      void g;
      return num(`Calcule ${a}/${den} + ${b}/${den}. Donne le numérateur du résultat (sur ${den}).`, a + b, `Même dénominateur : on additionne les numérateurs. ${a}/${den} + ${b}/${den} = ${a + b}/${den}.`);
    },
  },
  {
    id: 'g-entier-plus',
    difficulty: 3,
    build: (r) => {
      const den = r.pick([2, 3, 4, 5]);
      const e = r.int(1, 4), nu = r.int(1, den - 1);
      return num(`Écris ${e * den + nu}/${den} sous la forme « entier + fraction ». Quel est l’entier ?`, e, `${e * den + nu}/${den} = ${e * den}/${den} + ${nu}/${den} = ${e} + ${nu}/${den}.`);
    },
  },
  {
    id: 'g-colorie',
    difficulty: 1,
    build: (r) => {
      const den = r.pick([5, 6, 8, 10, 12]);
      const nu = r.int(1, den - 1);
      return { type: 'fraction-build', num: nu, den, prompt: `Colorie ${nu}/${den} de la bande.`, explanation: `${den} parts égales, on en colorie ${nu}.` };
    },
  },
];

const mentalGens: GenSpec[] = [
  {
    id: 'g-x10',
    difficulty: 1,
    build: (r) => {
      const a = r3(r.int(12, 999) / r.pick([1, 10, 100]));
      const k = r.pick([10, 100, 1000]);
      const mult = r.next() < 0.5;
      return mult
        ? num(`Calcule : ${fr(a)} × ${fr(k)}`, r3(a * k), `Multiplier par ${k}, c’est décaler les chiffres de ${String(k).length - 1} rang(s) vers la gauche : ${fr(r3(a * k))}.`)
        : num(`Calcule : ${fr(a)} ÷ ${fr(k)}`, r3(a / k), `Diviser par ${k}, c’est décaler les chiffres de ${String(k).length - 1} rang(s) vers la droite : ${fr(r3(a / k))}.`);
    },
  },
  {
    id: 'g-x5',
    difficulty: 2,
    build: (r) => {
      const a = r.int(12, 98) * 2;
      return num(`Calcule de tête : ${a} × 5`, a * 5, `× 5, c’est × 10 puis ÷ 2 : ${a} × 10 = ${a * 10}, ÷ 2 = ${a * 5}.`);
    },
  },
  {
    id: 'g-x25',
    difficulty: 3,
    build: (r) => {
      const a = r.int(2, 40) * 4;
      return num(`Calcule de tête : ${a} × 25`, a * 25, `× 25, c’est × 100 puis ÷ 4 : ${a * 100} ÷ 4 = ${a * 25}.`);
    },
  },
  {
    id: 'g-complement-dec',
    difficulty: 2,
    build: (r) => {
      const a = r.int(1, 99) / 100;
      return num(`Combien faut-il ajouter à ${fr(a)} pour obtenir 1 ?`, r3(1 - a), `${fr(a)} + ${fr(r3(1 - a))} = 1 (on pense en centièmes : ${Math.round(a * 100)} + ${100 - Math.round(a * 100)} = 100).`);
    },
  },
];

const poseGens: GenSpec[] = [
  { id: 'g-mul', difficulty: 1, build: (r) => ({ type: 'column', op: '×', a: r.int(102, 999), b: r.int(12, 89), prompt: 'Pose et calcule la multiplication.', explanation: 'Une ligne par chiffre du multiplicateur (en décalant d’un rang), puis on additionne les lignes.' }) },
  { id: 'g-sous', difficulty: 1, build: (r) => { const a = r.int(10_000, 99_999); return { type: 'column', op: '-', a, b: r.int(1000, a - 1000), prompt: 'Pose et calcule la soustraction.', explanation: 'On soustrait colonne par colonne en gérant les retenues.' }; } },
  { id: 'g-mul3', difficulty: 3, build: (r) => ({ type: 'column', op: '×', a: r.int(1002, 4999), b: r.int(102, 409), prompt: 'Pose et calcule la multiplication par un nombre à trois chiffres.', explanation: 'Trois lignes (unités, dizaines avec un 0, centaines avec deux 0), puis on additionne.' }) },
  {
    id: 'g-mul-dec',
    difficulty: 2,
    build: (r) => {
      const a = r.int(12, 999) / 10, b = r.int(2, 9);
      return num(`Calcule : ${fr(a)} × ${b}`, r3(a * b), `On calcule ${Math.round(a * 10)} × ${b} = ${Math.round(a * 10) * b}, puis on place la virgule (1 chiffre après) : ${fr(r3(a * b))}.`, { hint: 'Calcule sans la virgule, puis replace-la : autant de chiffres après la virgule que dans le facteur décimal.' });
    },
  },
];

const divGens: GenSpec[] = [
  {
    id: 'g-quotient',
    difficulty: 1,
    build: (r) => {
      const d = r.int(3, 9), q = r.int(12, 199), rest = r.int(0, d - 1);
      return num(`Dans la division de ${d * q + rest} par ${d}, quel est le quotient ?`, q, `${d} × ${q} = ${d * q} et il reste ${rest} : ${d * q + rest} = ${d} × ${q} + ${rest}.`, { hint: 'Pose la division : combien de fois le diviseur dans le nombre ?' });
    },
  },
  {
    id: 'g-reste',
    difficulty: 2,
    build: (r) => {
      const d = r.int(11, 25), q = r.int(5, 40), rest = r.int(1, d - 1);
      return num(`Quel est le reste de la division de ${d * q + rest} par ${d} ?`, rest, `${d} × ${q} = ${d * q} ; ${d * q + rest} − ${d * q} = ${rest}. Le reste est plus petit que ${d}.`);
    },
  },
  {
    id: 'g-div-dec',
    difficulty: 3,
    build: (r) => {
      const d = r.pick([2, 4, 5, 8]), q = r.int(11, 99) * (d === 8 ? 125 : d === 4 ? 25 : d === 5 ? 20 : 50) / 100;
      const n = r3(q * d);
      return num(`Calcule le quotient décimal exact : ${fr(n)} ÷ ${d}`, r3(q), `${fr(n)} ÷ ${d} = ${fr(r3(q))} (vérification : ${fr(r3(q))} × ${d} = ${fr(n)}).`);
    },
  },
  {
    id: 'g-probleme-div',
    difficulty: 2,
    build: (r) => {
      const per = r.pick([24, 25, 28, 30, 32]), groups = r.int(4, 12), rest = r.int(1, per - 1);
      const n = per * groups + rest;
      return num(`${n} élèves partent en sortie dans des cars de ${per} places. Combien de cars faut-il au minimum ?`, groups + 1, `${n} = ${per} × ${groups} + ${rest} : ${groups} cars pleins et ${rest} élève(s) en plus, donc ${groups + 1} cars.`, { hint: 'Attention : les élèves qui restent ont aussi besoin d’un car !' });
    },
  },
];

const propGens: GenSpec[] = [
  {
    id: 'g-recette',
    difficulty: 1,
    build: (r) => {
      const p1 = r.pick([2, 4, 5]), g1 = r.pick([100, 150, 200, 250]), k = r.pick([2, 3, 4]);
      return num(`Pour ${p1} personnes, il faut ${g1} g de farine. Combien en faut-il pour ${p1 * k} personnes ?`, g1 * k, `${p1 * k} personnes, c’est ${k} fois plus : ${g1} × ${k} = ${g1 * k} g.`, { unit: 'g' });
    },
  },
  {
    id: 'g-unite',
    difficulty: 2,
    build: (r) => {
      const unit = r.pick([2, 3, 4, 5, 6]) * 10, n1 = r.int(3, 6), n2 = r.int(7, 12);
      return num(`${n1} cahiers coûtent ${(unit * n1) / 10} €. Combien coûtent ${n2} cahiers ?`, r3((unit * n2) / 10), `Prix d’un cahier : ${fr((unit * n1) / 10)} ÷ ${n1} = ${fr(unit / 10)} €. Puis × ${n2} = ${fr(r3((unit * n2) / 10))} €.`, { unit: '€', hint: 'Passe par le prix d’un seul cahier (retour à l’unité).' });
    },
  },
  {
    id: 'g-pourcent',
    difficulty: 3,
    build: (r) => {
      const p = r.pick([10, 25, 50, 20]), base = r.pick([40, 60, 80, 120, 200, 240]);
      return num(`Calcule ${p} % de ${base}.`, (base * p) / 100, `${p} % = ${p}/100. ${base} × ${p} ÷ 100 = ${(base * p) / 100}.${p === 50 ? ' (50 %, c’est la moitié.)' : p === 25 ? ' (25 %, c’est le quart.)' : p === 10 ? ' (10 %, c’est le dixième.)' : ''}`);
    },
  },
  {
    id: 'g-tableau',
    difficulty: 2,
    build: (r) => {
      const k = r.int(3, 9), a = r.int(2, 5), b = a * r.int(2, 4);
      return num(`Ce tableau est un tableau de proportionnalité. Quelle valeur manque ?`, b * k, `On passe de la 1re à la 2e ligne en multipliant par ${k} : ${b} × ${k} = ${b * k}.`, { visual: { kind: 'table', rows: [['Nombre d’objets', String(a), String(b)], ['Prix (€)', String(a * k), '?']] } });
    },
  },
];

const probGens: GenSpec[] = [
  {
    id: 'g-etapes',
    difficulty: 2,
    build: (r) => {
      const who = r.pick(PRENOMS), price = r.int(12, 45), n = r.int(2, 4), paid = Math.ceil((price * n + 5) / 50) * 50;
      return num(`${who} achète ${n} jeux à ${price} € l’un et paie avec ${paid} €. Combien lui rend-on ?`, paid - price * n, `Prix : ${n} × ${price} = ${price * n} €. Monnaie : ${paid} − ${price * n} = ${paid - price * n} €.`, { unit: '€' });
    },
  },
  {
    id: 'g-comparaison',
    difficulty: 3,
    build: (r) => {
      const a = r.int(120, 480), k = r.int(2, 4);
      return num(`Le club de foot compte ${a} adhérents. Le club de natation en compte ${k} fois plus. Combien d’adhérents ont les deux clubs ensemble ?`, a + a * k, `Natation : ${a} × ${k} = ${a * k}. Total : ${a} + ${a * k} = ${a + a * k}.`);
    },
  },
  {
    id: 'g-moyenne-part',
    difficulty: 2,
    build: (r) => {
      const n = r.int(3, 8), each = r.int(15, 60), extra = r.int(10, 90);
      return num(`Un voyage coûte ${n * each + extra} € pour ${n} amis. On ajoute ${extra} € offerts par le club ; le reste est partagé équitablement. Combien paie chaque ami ?`, each, `${n * each + extra} − ${extra} = ${n * each} € ; ${n * each} ÷ ${n} = ${each} €.`, { unit: '€' });
    },
  },
];

const mesureGens: GenSpec[] = [
  { id: 'g-km-m', difficulty: 1, build: (r) => { const k = r3(r.int(12, 95) / 10); return num(`Convertis ${fr(k)} km en mètres.`, r3(k * 1000), `1 km = 1 000 m : ${fr(k)} × 1 000 = ${fr(r3(k * 1000))} m.`, { unit: 'm' }); } },
  { id: 'g-g-kg', difficulty: 2, build: (r) => { const g = r.int(150, 9500); return num(`Convertis ${fr(g)} g en kilogrammes.`, r3(g / 1000), `1 kg = 1 000 g : ${fr(g)} ÷ 1 000 = ${fr(r3(g / 1000))} kg.`, { unit: 'kg' }); } },
  { id: 'g-cl-l', difficulty: 2, build: (r) => { const c = r.int(25, 450); return num(`Convertis ${c} cL en litres.`, r3(c / 100), `1 L = 100 cL : ${c} ÷ 100 = ${fr(r3(c / 100))} L.`, { unit: 'L' }); } },
  { id: 'g-m-cm', difficulty: 3, build: (r) => { const m = r3(r.int(105, 999) / 100); return num(`Convertis ${fr(m)} m en millimètres.`, Math.round(m * 1000), `1 m = 1 000 mm : ${fr(m)} × 1 000 = ${fr(Math.round(m * 1000))} mm.`, { unit: 'mm' }); } },
];

const periGens: GenSpec[] = [
  { id: 'g-rect', difficulty: 1, build: (r) => { const L = r.int(5, 30), l = r.int(2, L - 1); return num(`Quel est le périmètre d’un rectangle de ${L} cm sur ${l} cm ?`, 2 * (L + l), `P = 2 × (L + l) = 2 × (${L} + ${l}) = ${2 * (L + l)} cm.`, { unit: 'cm', visual: { kind: 'rect', w: L, h: l, unit: 'cm' } }); } },
  { id: 'g-carre', difficulty: 1, variants: 7, build: (r) => { const c = r.int(3, 25); return num(`Quel est le périmètre d’un carré de ${c} m de côté ?`, 4 * c, `P = 4 × c = 4 × ${c} = ${4 * c} m.`, { unit: 'm' }); } },
  { id: 'g-cote', difficulty: 2, build: (r) => { const c = r.int(3, 30); return num(`Un carré a un périmètre de ${4 * c} cm. Combien mesure son côté ?`, c, `${4 * c} ÷ 4 = ${c} cm.`, { unit: 'cm' }); } },
  { id: 'g-cercle', difficulty: 3, variants: 7, build: (r) => { const ray = r.int(2, 15); return num(`Un cercle a un rayon de ${ray} cm. Quel est son diamètre ?`, 2 * ray, `Le diamètre vaut 2 fois le rayon : 2 × ${ray} = ${2 * ray} cm.`, { unit: 'cm' }); } },
];

const aireGens: GenSpec[] = [
  { id: 'g-quadrillage', difficulty: 1, build: (r) => { const w = r.int(2, 7), h = r.int(2, 5); return num('Quelle est l’aire de ce rectangle, en carreaux ?', w * h, `${h} lignes de ${w} carreaux : ${w} × ${h} = ${w * h} carreaux.`, { visual: { kind: 'rect', w, h, unit: 'carreaux', squares: true } }); } },
  { id: 'g-rect', difficulty: 2, build: (r) => { const L = r.int(4, 20), l = r.int(2, L); return num(`Calcule l’aire d’un rectangle de ${L} cm sur ${l} cm.`, L * l, `A = L × l = ${L} × ${l} = ${L * l} cm².`, { unit: 'cm²', visual: { kind: 'rect', w: L, h: l, unit: 'cm' } }); } },
  { id: 'g-carre', difficulty: 2, variants: 7, build: (r) => { const c = r.int(3, 12); return num(`Calcule l’aire d’un carré de ${c} m de côté.`, c * c, `A = c × c = ${c} × ${c} = ${c * c} m².`, { unit: 'm²' }); } },
  { id: 'g-compose', difficulty: 3, build: (r) => { const a = r.int(3, 8), b = r.int(2, 6), c = r.int(2, 6), d = r.int(2, 5); return num(`Une figure est formée de deux rectangles collés : l’un de ${a} cm × ${b} cm, l’autre de ${c} cm × ${d} cm. Quelle est son aire totale ?`, a * b + c * d, `${a} × ${b} = ${a * b} cm² et ${c} × ${d} = ${c * d} cm² ; total ${a * b + c * d} cm².`, { unit: 'cm²', hint: 'Calcule l’aire de chaque rectangle, puis additionne.' }); } },
];

const angleGens: GenSpec[] = [
  {
    id: 'g-type',
    difficulty: 1, variants: 6,
    build: (r) => {
      const deg = r.pick([30, 45, 60, 90, 90, 110, 135, 150]);
      const t = deg < 90 ? 'aigu' : deg === 90 ? 'droit' : 'obtus';
      return qcm('Quel est le type de cet angle ?', ['aigu', 'droit', 'obtus'].map((x) => (x === t ? `*${x}` : x)), `Un angle aigu est plus petit qu’un angle droit, un angle obtus plus grand. Celui-ci mesure ${deg}° : il est ${t}.`, { visual: { kind: 'angle', deg } });
    },
  },
  {
    id: 'g-triangle',
    difficulty: 3,
    build: (r) => {
      const a = r.int(30, 80), b = r.int(30, 150 - a);
      return num(`Dans un triangle, deux angles mesurent ${a}° et ${b}°. Combien mesure le troisième ?`, 180 - a - b, `La somme des angles d’un triangle vaut 180° : 180 − ${a} − ${b} = ${180 - a - b}°.`, { unit: '°' });
    },
  },
  {
    id: 'g-fraction-tour',
    difficulty: 2, variants: 4,
    build: (r) => {
      const [label, val] = r.pick([['un quart de tour', 90], ['un demi-tour', 180], ['trois quarts de tour', 270], ['un tour complet', 360]] as const);
      return num(`Combien de degrés mesure ${label} ?`, val, `Un tour complet fait 360° : ${label} = ${val}°.`, { unit: '°' });
    },
  },
];

const dureeGens: GenSpec[] = [
  { id: 'g-h-min', difficulty: 1, build: (r) => { const m = r.int(75, 400); return num(`Combien d’heures entières y a-t-il dans ${m} minutes ?`, Math.floor(m / 60), `${m} min = ${Math.floor(m / 60)} h ${m % 60} min (60 min = 1 h).`); } },
  { id: 'g-duree', difficulty: 2, build: (r) => { const s = r.int(7, 15) * 60 + r.pick([5, 20, 35, 50]); const d = r.int(40, 200); const e = s + d; const f = (t: number) => `${Math.floor(t / 60)} h ${String(t % 60).padStart(2, '0')}`; return num(`Un train part à ${f(s)} et arrive à ${f(e)}. Combien de minutes dure le trajet ?`, d, `De ${f(s)} à ${f(e)} : ${Math.floor(d / 60)} h ${d % 60} min, soit ${d} min.`, { unit: 'min' }); } },
  { id: 'g-siecle', difficulty: 3, build: (r) => { const y = r.int(1001, 2026); const c = Math.ceil(y / 100); return num(`En quel siècle se situe l’année ${y} ? (écris le numéro en chiffres)`, c, `Le siècle de ${y} : ${y} est entre ${(c - 1) * 100 + 1} et ${c * 100}, c’est le ${c}e siècle.`, { hint: 'Le 1er siècle va de l’an 1 à l’an 100 ; le XXIe siècle de 2001 à 2100.' }); } },
];

const algGens: GenSpec[] = [
  {
    id: 'g-suite',
    difficulty: 1,
    build: (r) => {
      const start = r.int(2, 30), step = r.int(3, 12);
      const seq = [0, 1, 2, 3].map((i) => start + i * step);
      return num(`Trouve le nombre suivant : ${seq.join(' ; ')} ; …`, start + 4 * step, `On ajoute ${step} à chaque fois : ${seq[3]} + ${step} = ${start + 4 * step}.`);
    },
  },
  {
    id: 'g-programme',
    difficulty: 2,
    build: (r) => {
      const x = r.int(2, 12), m = r.int(2, 5), a = r.int(1, 9);
      return num(`Programme de calcul : « Choisis un nombre, multiplie-le par ${m}, puis ajoute ${a}. » Quel résultat obtiens-tu avec ${x} ?`, x * m + a, `${x} × ${m} = ${x * m}, puis + ${a} = ${x * m + a}.`);
    },
  },
  {
    id: 'g-inconnu',
    difficulty: 3,
    build: (r) => {
      const x = r.int(3, 20), m = r.int(2, 6), a = r.int(1, 15);
      return num(`J’ai choisi un nombre, je l’ai multiplié par ${m} puis j’ai ajouté ${a}. J’obtiens ${x * m + a}. Quel nombre avais-je choisi ?`, x, `On remonte le programme : ${x * m + a} − ${a} = ${x * m}, puis ${x * m} ÷ ${m} = ${x}.`, { hint: 'Fais les opérations à l’envers : d’abord enlève, puis divise.' });
    },
  },
  {
    id: 'g-motif',
    difficulty: 2,
    build: (r) => {
      const k = r.int(3, 6), n = r.int(5, 12);
      return num(`Avec des allumettes, on construit des figures : la figure 1 a ${k} allumettes, et chaque nouvelle figure en a ${k} de plus. Combien d’allumettes pour la figure ${n} ?`, k * n, `Figure n = ${k} × n, donc figure ${n} : ${k} × ${n} = ${k * n}.`);
    },
  },
];

export const cm2Maths = [
  S({
    id: 'cm2-ma-grands-nombres',
    domain: 'Nombres et calculs — nombres entiers',
    title: 'Les grands nombres (jusqu’au milliard)',
    diag: true,
    lesson: L(
      'Je vais apprendre à lire, écrire et comparer les nombres jusqu’au milliard.',
      'Au Laboratoire des Maths, on calcule la distance Terre–Soleil : 149 600 000 km ! Comment lire un si grand nombre ?',
      ['On regroupe les chiffres par classes de trois, en partant de la droite : classe des unités, classe des mille, classe des millions, puis des milliards.', 'Chaque classe se lit comme un nombre de 1 à 999, suivi du nom de la classe : 149 600 000 = « cent-quarante-neuf-millions-six-cent-mille ».', '« mille » est invariable ; « million » et « milliard » prennent un s au pluriel.'],
      ['Lis 3 205 017.', 'trois-millions-deux-cent-cinq-mille-dix-sept.'],
      ['Je découpe en classes : 3 | 205 | 017.', 'Je lis : 3 millions, 205 mille, 17.', '« trois-millions-deux-cent-cinq-mille-dix-sept ».'],
      ['Les espaces entre classes sont comme des virgules dans une phrase : elles t’aident à respirer en lisant !'],
      'Classes de trois chiffres : milliards | millions | mille | unités.',
    ),
    items: [
      num('Écris en chiffres : deux-millions-cinquante-mille.', 2_050_000, '2 | 050 | 000.'),
      qcm('Quel est le chiffre des centaines de mille dans 47 382 615 ?', ['*3', '4', '7', '8'], '47 | 382 | 615 : dans la classe des mille, 3 est le chiffre des centaines.'),
      vf('Dans « quatre-millions », million prend un s.', true, 'Million est un nom : il s’accorde au pluriel.'),
      num('Combien de millions y a-t-il dans un milliard ?', 1000, '1 milliard = 1 000 millions.', { d: 3 }),
    ],
    gens: grandsGens,
  }),
  S({
    id: 'cm2-ma-decimaux',
    domain: 'Nombres et calculs — nombres décimaux',
    title: 'Les nombres décimaux',
    diag: true,
    prereq: ['cm2-ma-fractions'],
    lesson: L(
      'Je vais apprendre à lire, comparer et ranger les nombres décimaux.',
      'Un chronomètre affiche 12,45 s. Que signifient les chiffres après la virgule ?',
      ['Un nombre décimal a une partie entière et une partie décimale, séparées par la virgule.', 'Après la virgule : dixièmes (1/10), centièmes (1/100), millièmes (1/1000).', '12,45 = 12 + 4/10 + 5/100 = 12 + 45/100.', 'Pour comparer, on compare d’abord les parties entières, puis les dixièmes, puis les centièmes… On peut ajouter des zéros à la fin : 3,5 = 3,50.'],
      ['Compare 3,5 et 3,47.', '3,5 > 3,47 car 5 dixièmes > 4 dixièmes.'],
      ['Parties entières : 3 et 3, égalité.', 'Dixièmes : 5 et 4 → 5 est plus grand.', '3,5 > 3,47 (attention : 3,47 a plus de chiffres mais il est plus petit !).'],
      ['Pense à de l’argent : 3,5 € = 3,50 € = 3 € et 50 c, alors que 3,47 € = 3 € et 47 c.'],
      'Dixièmes, centièmes, millièmes. Le nombre de chiffres après la virgule ne dit pas qui est le plus grand.',
    ),
    items: [
      qcm('Quel est le plus grand ?', ['*2,8', '2,75', '2,099', '2,08'], '8 dixièmes est le plus grand nombre de dixièmes.'),
      num('Écris 7 + 3/10 + 5/100 sous forme décimale.', 7.35, '7 unités, 3 dixièmes, 5 centièmes : 7,35.'),
      vf('4,50 et 4,5 sont égaux.', true, 'Un zéro à la fin de la partie décimale ne change pas la valeur.'),
      qcm('Entre quels entiers se trouve 15,08 ?', ['*15 et 16', '14 et 15', '15,0 et 15,1 seulement', '8 et 9'], '15 < 15,08 < 16.'),
    ],
    gens: decGens,
  }),
  S({
    id: 'cm2-ma-fractions',
    domain: 'Nombres et calculs — fractions',
    title: 'Les fractions',
    diag: true,
    lesson: L(
      'Je vais apprendre à utiliser les fractions : partager, comparer, calculer une fraction d’une quantité.',
      'Dans le laboratoire, un liquide occupe les 3/4 d’une éprouvette. Que cela signifie-t-il ?',
      ['Une fraction a/b : on partage l’unité en b parts égales et on en prend a.', 'Si le numérateur est plus petit que le dénominateur, la fraction est plus petite que 1 ; s’il est égal, elle vaut 1 ; s’il est plus grand, elle est plus grande que 1.', 'Des fractions égales : on multiplie (ou divise) le numérateur et le dénominateur par le même nombre : 1/2 = 2/4 = 5/10.', 'Fraction d’une quantité : 3/4 de 20 = (20 ÷ 4) × 3 = 15.', 'Les fractions décimales ont un dénominateur 10, 100, 1000 : 37/100 = 0,37.'],
      ['Calcule 2/5 de 30.', '30 ÷ 5 = 6, puis 6 × 2 = 12.'],
      ['1/5 de 30 : 30 ÷ 5 = 6.', '2/5, c’est 2 fois plus : 6 × 2 = 12.'],
      ['Imagine une pizza de 30 morceaux partagée entre 5 amis : chacun a 6 morceaux ; 2 amis ensemble en ont 12.'],
      'a/b : b parts égales, on en prend a. Fraction d’une quantité : ÷ dénominateur puis × numérateur.',
    ),
    items: [
      qcm('Quelle fraction est égale à 1/2 ?', ['*4/8', '2/3', '1/4', '3/5'], '1/2 = 4/8 (on multiplie haut et bas par 4).'),
      vf('7/4 est plus grand que 1.', true, '4/4 = 1 et 7/4 > 4/4.'),
      num('Combien font 3/4 de 40 ?', 30, '40 ÷ 4 = 10 ; 10 × 3 = 30.'),
      qcm('Quelle fraction décimale vaut 0,07 ?', ['*7/100', '7/10', '7/1000', '70/10'], '0,07 = 7 centièmes = 7/100.'),
      ordre('Range du plus petit au plus grand.', ['1/8', '1/4', '1/2', '3/2'], 'Plus le dénominateur est grand (numérateur 1), plus la part est petite ; 3/2 > 1.', 'number'),
    ],
    gens: fracGens,
  }),
  S({
    id: 'cm2-ma-mental',
    domain: 'Nombres et calculs — calcul mental',
    title: 'Calcul mental et stratégies',
    diag: true,
    lesson: L(
      'Je vais apprendre des stratégies pour calculer vite et juste de tête.',
      'Les grands explorateurs calculent de tête leurs réserves, leurs distances et leurs vitesses.',
      ['× 10, × 100, × 1 000 : chaque chiffre prend une valeur 10, 100 ou 1 000 fois plus grande (il se décale vers la gauche).', '÷ 10, ÷ 100 : chaque chiffre se décale vers la droite.', '× 5 = × 10 puis ÷ 2 ; × 25 = × 100 puis ÷ 4 ; × 9 = × 10 − une fois le nombre.', 'Décomposer : 23 × 12 = 23 × 10 + 23 × 2 = 230 + 46 = 276.'],
      ['Calcule 46 × 5.', '46 × 10 = 460 ; 460 ÷ 2 = 230.'],
      ['× 5, c’est la moitié de × 10.', '46 × 10 = 460.', '460 ÷ 2 = 230.'],
      ['Pense en euros : 5 € c’est la moitié d’un billet de 10 €. Donc 46 fois 5 €, c’est la moitié de 46 billets de 10 €.'],
      '× 10 décale vers la gauche ; × 5 = × 10 ÷ 2 ; × 25 = × 100 ÷ 4.',
    ),
    items: [
      num('Calcule : 3,7 × 100', 370, 'Le chiffre 3 devient 3 centaines, 7 devient 7 dizaines : 370.'),
      num('Calcule : 45 ÷ 10', 4.5, 'Chaque chiffre se décale d’un rang vers la droite : 4,5.'),
      num('Calcule de tête : 15 × 9', 135, '15 × 10 − 15 = 150 − 15 = 135.'),
      num('Calcule de tête : 99 + 47', 146, '100 + 47 − 1 = 146.'),
    ],
    gens: mentalGens,
  }),
  S({
    id: 'cm2-ma-operations',
    domain: 'Nombres et calculs — calcul posé',
    title: 'Opérations posées (entiers et décimaux)',
    prereq: ['cm2-ma-mental'],
    lesson: L(
      'Je vais poser des additions, soustractions et multiplications, y compris avec des décimaux.',
      'Pour construire la fusée de l’Académie, il faut des calculs précis !',
      ['Addition et soustraction de décimaux : on aligne les virgules (on peut ajouter des zéros).', 'Multiplication par un nombre à plusieurs chiffres : une ligne par chiffre, en décalant d’un rang à chaque ligne, puis on additionne.', 'Multiplication d’un décimal par un entier : on calcule sans la virgule, puis on la replace avec le même nombre de chiffres après la virgule.', 'Je vérifie avec un ordre de grandeur : 398 × 21 ≈ 400 × 20 = 8 000.'],
      ['Calcule 2,4 × 3.', '24 × 3 = 72, donc 2,4 × 3 = 7,2.'],
      ['Je calcule sans virgule : 24 × 3 = 72.', 'Le facteur 2,4 a 1 chiffre après la virgule.', 'Le résultat aussi : 7,2.'],
      ['Estime toujours avant de calculer : si tu trouves 72 pour 2,4 × 3, tu sais que c’est trop (environ 2 × 3 = 6).'],
      'Aligner les virgules pour + et − ; pour ×, calculer sans virgule puis la replacer.',
    ),
    items: [
      num('Calcule : 12,5 + 3,75', 16.25, 'On aligne les virgules : 12,50 + 3,75 = 16,25.'),
      num('Calcule : 20 − 4,6', 15.4, '20,0 − 4,6 = 15,4.'),
      qcm('Quel est l’ordre de grandeur de 498 × 31 ?', ['*15 000', '1 500', '150 000', '1 500 000'], '500 × 30 = 15 000.'),
      num('Calcule : 1,25 × 4', 5, '125 × 4 = 500, deux chiffres après la virgule : 5,00 = 5.'),
    ],
    gens: poseGens,
  }),
  S({
    id: 'cm2-ma-division',
    domain: 'Nombres et calculs — division',
    title: 'La division',
    prereq: ['cm2-ma-operations'],
    d: 2,
    lesson: L(
      'Je vais apprendre à poser une division et à interpréter le quotient et le reste.',
      'L’Académie répartit ses explorateurs en équipes égales pour une expédition.',
      ['Diviser, c’est chercher combien de fois le diviseur est contenu dans le dividende.', 'Division euclidienne : dividende = diviseur × quotient + reste, avec reste < diviseur.', 'On pose la division en prenant le premier « morceau » du dividende qui contient le diviseur, puis on abaisse les chiffres un à un.', 'Si le reste n’est pas nul, on peut continuer après la virgule pour obtenir un quotient décimal.'],
      ['Divise 157 par 6.', '157 = 6 × 26 + 1 : quotient 26, reste 1.'],
      ['15 dizaines ÷ 6 → 2 dizaines (6 × 2 = 12), reste 3 dizaines.', 'J’abaisse le 7 : 37 ÷ 6 → 6 (6 × 6 = 36), reste 1.', 'Quotient 26, reste 1. Vérification : 6 × 26 + 1 = 157.'],
      ['Diviser, c’est répondre à : « Combien de paquets de 6 puis-je faire avec 157 ? » Puis on regarde ce qui reste.'],
      'Dividende = diviseur × quotient + reste, et reste < diviseur.',
    ),
    items: [
      num('Quel est le quotient de 84 ÷ 4 ?', 21, '4 × 21 = 84.'),
      vf('Dans une division par 7, le reste peut être 8.', false, 'Le reste est toujours plus petit que le diviseur.'),
      num('On partage 3 € entre 4 enfants. Combien reçoit chacun, en euros ?', 0.75, '3 ÷ 4 = 0,75 €, soit 75 centimes.', { unit: '€' }),
      qcm('Quelle égalité correspond à « 47 divisé par 5 » ?', ['*47 = 5 × 9 + 2', '47 = 5 × 8 + 7', '47 = 9 × 5 + 3', '47 = 5 × 10 − 2'], 'Le reste (2) doit être plus petit que 5.'),
    ],
    gens: divGens,
  }),
  S({
    id: 'cm2-ma-proportionnalite',
    domain: 'Nombres et calculs — proportionnalité',
    title: 'La proportionnalité',
    prereq: ['cm2-ma-mental'],
    d: 2,
    lesson: L(
      'Je vais apprendre à reconnaître et résoudre une situation de proportionnalité.',
      'Pour préparer le repas de l’expédition, il faut adapter la recette au nombre d’explorateurs.',
      ['Deux grandeurs sont proportionnelles si, quand l’une est multipliée (ou divisée) par un nombre, l’autre l’est aussi par le même nombre.', 'Méthodes : passer par l’unité (prix d’un seul objet), utiliser un coefficient (× k), additionner des colonnes.', 'Pourcentages : 50 % = la moitié, 25 % = le quart, 10 % = le dixième.'],
      ['3 croissants coûtent 3,60 €. Combien coûtent 5 croissants ?', '1 croissant : 1,20 €, donc 5 croissants : 6 €.'],
      ['Prix d’un croissant : 3,60 ÷ 3 = 1,20 €.', 'Prix de 5 croissants : 5 × 1,20 = 6 €.'],
      ['Si 2 kg de pommes coûtent 4 €, 4 kg coûtent le double : 8 €. Si l’âge et la taille ne sont pas proportionnels, c’est parce qu’on ne grandit pas toujours de la même façon !'],
      'Proportionnel : × k sur une grandeur → × k sur l’autre. Penser au retour à l’unité.',
    ),
    items: [
      vf('L’âge et la taille d’une personne sont proportionnels.', false, 'À 20 ans, on ne mesure pas deux fois sa taille de 10 ans !'),
      vf('Le prix payé et le nombre de baguettes identiques achetées sont proportionnels.', true, '2 fois plus de baguettes coûtent 2 fois plus cher.'),
      num('Une voiture roule à vitesse constante : 180 km en 2 h. Combien de km en 5 h ?', 450, '1 h : 90 km ; 5 h : 450 km.', { unit: 'km' }),
      num('Un pull coûte 40 €. Il est soldé à −25 %. De combien d’euros baisse son prix ?', 10, '25 % = un quart : 40 ÷ 4 = 10 €.', { unit: '€' }),
    ],
    gens: propGens,
  }),
  S({
    id: 'cm2-ma-problemes',
    domain: 'Nombres et calculs — résolution de problèmes',
    title: 'Résoudre des problèmes à étapes',
    prereq: ['cm2-ma-operations', 'cm2-ma-division'],
    diag: true,
    d: 2,
    lesson: L(
      'Je vais apprendre à résoudre des problèmes qui demandent plusieurs étapes.',
      'Les missions de l’Académie sont des énigmes à plusieurs étapes : il faut un plan !',
      ['Je lis l’énoncé et je reformule la question avec mes mots.', 'Je cherche les questions intermédiaires : que dois-je calculer d’abord ?', 'Je représente la situation (schéma en barres, tableau).', 'Je calcule chaque étape, je vérifie l’ordre de grandeur, puis je rédige une phrase réponse.'],
      ['Un cinéma a 12 rangées de 18 places. 150 places sont occupées. Combien sont libres ?', '12 × 18 = 216 places ; 216 − 150 = 66 places libres.'],
      ['Question intermédiaire : combien de places en tout ? 12 × 18 = 216.', 'Question finale : 216 − 150 = 66.', 'Réponse : il reste 66 places libres.'],
      ['Écris les questions intermédiaires sur ton brouillon, comme les étapes d’une carte au trésor.'],
      'Questions intermédiaires → calculs → vérification → phrase réponse.',
    ),
    items: [
      num('Une bibliothèque achète 8 cartons de 24 livres, puis en donne 45. Combien de livres lui reste-t-il de cet achat ?', 147, '8 × 24 = 192 ; 192 − 45 = 147.'),
      num('Un rouleau de ruban mesure 5 m. On coupe des morceaux de 35 cm. Combien de morceaux complets obtient-on ?', 14, '5 m = 500 cm ; 500 = 35 × 14 + 10 : 14 morceaux.', { hint: 'Convertis d’abord dans la même unité.' }),
      qcm('« Sacha a 3 fois plus de billes que Lina, qui en a 45. Combien en ont-ils ensemble ? » Quelle est la question intermédiaire ?', ['*Combien Sacha a-t-il de billes ?', 'Combien Lina a-t-elle de billes ?', 'Combien de billes ont-ils perdues ?', 'Combien coûte une bille ?'], 'Il faut d’abord trouver le nombre de billes de Sacha (45 × 3).'),
      num('Résous : Sacha a 3 fois plus de billes que Lina, qui en a 45. Combien en ont-ils ensemble ?', 180, '45 × 3 = 135 ; 135 + 45 = 180.'),
    ],
    gens: probGens,
  }),
  S({
    id: 'cm2-ma-mesures',
    domain: 'Grandeurs et mesures — conversions',
    title: 'Longueurs, masses, contenances : convertir',
    prereq: ['cm2-ma-decimaux'],
    lesson: L(
      'Je vais apprendre à convertir des longueurs, des masses et des contenances.',
      'Pour préparer l’expédition, il faut peser les sacs, mesurer les cordes et remplir les gourdes.',
      ['Longueurs : km, hm, dam, m, dm, cm, mm. Chaque unité vaut 10 fois l’unité suivante.', 'Masses : kg, hg, dag, g, dg, cg, mg ; 1 t (tonne) = 1 000 kg.', 'Contenances : L, dL, cL, mL ; 1 L = 100 cL = 1 000 mL.', 'Un tableau de conversion aide : on place le chiffre des unités dans la colonne de l’unité de départ.'],
      ['Convertis 2,35 m en cm.', '235 cm'],
      ['1 m = 100 cm.', '2,35 × 100 = 235.', '2,35 m = 235 cm.'],
      ['Retiens « Kilo Hecto Déca UNITÉ déci centi milli » comme une échelle : chaque marche vers la droite multiplie par 10.'],
      'km hm dam m dm cm mm : × 10 à chaque rang vers la droite.',
    ),
    items: [
      num('Convertis 3 t en kg.', 3000, '1 t = 1 000 kg.', { unit: 'kg' }),
      num('Convertis 750 mL en litres.', 0.75, '1 L = 1 000 mL : 750 ÷ 1 000 = 0,75 L.', { unit: 'L' }),
      qcm('Quelle longueur est la plus grande ?', ['*1,2 km', '950 m', '9 000 cm', '11 hm'], 'On convertit tout en mètres : 1,2 km = 1 200 m ; 950 m ; 9 000 cm = 90 m ; 11 hm = 1 100 m.', { d: 3 }),
      tri('Quelle unité pour mesurer… ?', ['Longueur', 'Masse', 'Contenance'], [['la hauteur d’un arbre', 0], ['un sac de riz', 1], ['une baignoire', 2], ['un marathon', 0], ['une lettre', 1], ['une cuillère de sirop', 2]], 'On choisit le type d’unité selon la grandeur mesurée.'),
    ],
    gens: mesureGens,
  }),
  S({
    id: 'cm2-ma-perimetres',
    domain: 'Grandeurs et mesures — périmètres',
    title: 'Périmètres',
    prereq: ['cm2-ma-mesures'],
    lesson: L(
      'Je vais apprendre à calculer le périmètre d’un polygone et à connaître le diamètre d’un cercle.',
      'Pour clôturer le jardin de l’Académie, combien de mètres de grillage faut-il ?',
      ['Le périmètre est la longueur du contour d’une figure.', 'Pour un polygone : on additionne les longueurs de tous les côtés.', 'Rectangle : P = 2 × (L + l). Carré : P = 4 × c.', 'Cercle : le diamètre = 2 × le rayon.'],
      ['Périmètre d’un rectangle de 7 m sur 3 m ?', '2 × (7 + 3) = 20 m.'],
      ['J’ajoute la longueur et la largeur : 7 + 3 = 10.', 'Le rectangle a deux longueurs et deux largeurs : 2 × 10 = 20 m.'],
      ['Imagine une fourmi qui fait le tour de la figure : le périmètre, c’est la distance qu’elle parcourt.'],
      'Périmètre = tour de la figure. Rectangle 2 × (L + l), carré 4 × c.',
    ),
    items: [
      num('Un triangle a des côtés de 5 cm, 7 cm et 9 cm. Quel est son périmètre ?', 21, '5 + 7 + 9 = 21 cm.', { unit: 'cm' }),
      num('Un hexagone régulier a des côtés de 4 cm. Quel est son périmètre ?', 24, '6 côtés × 4 cm = 24 cm.', { unit: 'cm', visual: shape('hexagone') }),
      vf('Deux figures qui ont la même aire ont forcément le même périmètre.', false, 'Un rectangle 1 × 4 et un carré 2 × 2 ont la même aire (4) mais des périmètres différents (10 et 8).', { d: 3 }),
    ],
    gens: periGens,
  }),
  S({
    id: 'cm2-ma-aires',
    domain: 'Grandeurs et mesures — aires',
    title: 'Aires',
    prereq: ['cm2-ma-perimetres'],
    d: 2,
    lesson: L(
      'Je vais apprendre à calculer l’aire d’un carré et d’un rectangle.',
      'Pour peindre le sol du hangar de l’Académie, il faut connaître sa surface.',
      ['L’aire est la mesure de la surface d’une figure (l’intérieur).', 'On peut compter des carreaux unités, ou utiliser des formules.', 'Rectangle : A = L × l. Carré : A = c × c.', 'Unités : cm², m², km². 1 cm² = l’aire d’un carré de 1 cm de côté.'],
      ['Aire d’un rectangle de 6 cm sur 4 cm ?', '6 × 4 = 24 cm².'],
      ['Je peux paver le rectangle avec des carrés de 1 cm.', 'Il y a 4 lignes de 6 carrés.', '4 × 6 = 24 cm².'],
      ['Périmètre = la clôture ; aire = la pelouse à l’intérieur.'],
      'Aire du rectangle = L × l ; du carré = c × c ; en cm², m²…',
    ),
    items: [
      qcm('Que mesure l’aire ?', ['*la surface intérieure', 'le contour', 'la hauteur', 'le volume'], 'L’aire mesure la surface.'),
      num('Un carré a une aire de 49 m². Combien mesure son côté ?', 7, '7 × 7 = 49.', { unit: 'm' }),
      qcm('Quelle unité d’aire convient pour la surface d’un pays ?', ['*le km²', 'le cm²', 'le km', 'le kg'], 'Les très grandes surfaces s’expriment en km².'),
    ],
    gens: aireGens,
  }),
  S({
    id: 'cm2-ma-angles',
    domain: 'Grandeurs et mesures — angles',
    title: 'Les angles',
    prereq: ['cm2-ma-geometrie'],
    d: 2,
    lesson: L(
      'Je vais apprendre à reconnaître et comparer les angles.',
      'Le télescope de l’Observatoire pivote : de quel angle faut-il le tourner ?',
      ['Un angle est formé par deux demi-droites de même origine (le sommet).', 'Un angle droit mesure 90° (on le vérifie avec l’équerre). Un angle aigu est plus petit qu’un angle droit, un angle obtus est plus grand.', 'Un tour complet = 360° ; un demi-tour = 180° ; un quart de tour = 90°.', 'On mesure un angle avec un rapporteur. La somme des angles d’un triangle vaut 180°.'],
      ['Un angle de 120° est-il aigu, droit ou obtus ?', 'Obtus, car il est plus grand que 90°.'],
      ['L’angle droit mesure 90°.', '120° > 90°.', 'L’angle est obtus.'],
      ['Ouvre ton bras comme une aiguille : bras serré = angle aigu ; bras en équerre = droit ; bras grand ouvert = obtus.'],
      'Aigu < 90° = droit < obtus < 180°.',
    ),
    items: [
      qcm('Avec quel instrument mesure-t-on un angle en degrés ?', ['*le rapporteur', 'le compas', 'la règle', 'le thermomètre'], 'Le rapporteur est gradué en degrés.'),
      vf('La taille des côtés dessinés change la mesure d’un angle.', false, 'Un angle ne dépend que de l’ouverture, pas de la longueur des côtés tracés.'),
      num('Combien d’angles droits possède un rectangle ?', 4, 'Un rectangle a 4 angles droits.'),
    ],
    gens: angleGens,
  }),
  S({
    id: 'cm2-ma-geometrie',
    domain: 'Espace et géométrie',
    title: 'Figures planes : triangles, quadrilatères, cercle',
    diag: true,
    lesson: L(
      'Je vais apprendre à reconnaître et décrire les triangles, les quadrilatères et le cercle.',
      'Sur les plans de l’Académie, chaque figure a un nom précis et des propriétés.',
      ['Triangles particuliers : isocèle (2 côtés égaux), équilatéral (3 côtés égaux), rectangle (1 angle droit).', 'Quadrilatères : carré (4 côtés égaux, 4 angles droits), rectangle (4 angles droits), losange (4 côtés égaux).', 'Deux droites perpendiculaires se coupent en formant un angle droit ; deux droites parallèles ne se coupent jamais.', 'Cercle : centre, rayon (du centre au cercle), diamètre (= 2 rayons, passe par le centre).'],
      ['Un quadrilatère a 4 côtés égaux mais pas d’angle droit. Qu’est-ce ?', 'Un losange.'],
      ['4 côtés égaux : carré ou losange.', 'Pas d’angle droit : ce n’est pas un carré.', 'C’est un losange.'],
      ['Le carré est à la fois un rectangle et un losange : il a toutes leurs propriétés !'],
      'Isocèle 2 côtés égaux, équilatéral 3, rectangle 1 angle droit. Carré = rectangle + losange.',
    ),
    items: [
      qcm('Comment s’appelle un triangle qui a 3 côtés égaux ?', ['*équilatéral', 'isocèle', 'rectangle', 'quelconque'], 'Équi = égal, latéral = côté.'),
      qcm('Quelle figure est représentée ?', ['*un losange', 'un carré', 'un rectangle', 'un trapèze'], '4 côtés égaux, pas d’angle droit : un losange.', { visual: shape('losange') }),
      vf('Deux droites parallèles se coupent en un point.', false, 'Les parallèles ne se coupent jamais.'),
      vf('Un carré est aussi un rectangle.', true, 'Il a 4 angles droits : c’est un rectangle particulier.'),
      tri('Classe ces propriétés.', ['Toujours vrai pour un rectangle', 'Pas toujours vrai pour un rectangle'], [['4 angles droits', 0], ['4 côtés égaux', 1], ['côtés opposés égaux', 0], ['côtés opposés parallèles', 0], ['diagonales perpendiculaires', 1]], 'Le rectangle a 4 angles droits et des côtés opposés égaux et parallèles.'),
      qcm('Comment appelle-t-on le segment qui joint deux points du cercle en passant par le centre ?', ['*le diamètre', 'le rayon', 'l’arc', 'la corde courte'], 'Le diamètre passe par le centre : il vaut deux rayons.'),
      qcm('Quelle figure est un pentagone ?', ['*figure B', 'figure A', 'figure C', 'figure D'], 'Un pentagone a 5 côtés.', { choiceVisuals: [shape('hexagone'), shape('pentagone'), shape('carre'), shape('triangle')] }),
    ],
  }),
  S({
    id: 'cm2-ma-solides',
    domain: 'Espace et géométrie — solides',
    title: 'Les solides et leurs patrons',
    prereq: ['cm2-ma-geometrie'],
    lesson: L(
      'Je vais apprendre à décrire les solides (faces, arêtes, sommets) et à reconnaître un patron.',
      'Dans l’atelier de l’Académie, on fabrique des boîtes à partir de patrons découpés.',
      ['Un polyèdre est un solide dont toutes les faces sont planes (polygones) : cube, pavé droit, prisme, pyramide.', 'Le cube a 6 faces carrées, 12 arêtes, 8 sommets. Le pavé droit a 6 faces rectangulaires, 12 arêtes, 8 sommets.', 'Le cylindre, le cône et la boule ont des surfaces courbes : ce ne sont pas des polyèdres.', 'Un patron est une figure plane qui, une fois pliée, forme le solide.'],
      ['Combien d’arêtes a un cube ?', '12'],
      ['4 arêtes sur la face du dessus.', '4 sur la face du dessous.', '4 verticales : 4 + 4 + 4 = 12.'],
      ['Prends un dé ou une boîte : compte les faces avec une gommette sur chacune, puis suis les arêtes avec ton doigt.'],
      'Cube et pavé : 6 faces, 12 arêtes, 8 sommets. Patron = solide déplié.',
    ),
    items: [
      num('Combien de sommets a un pavé droit ?', 8, '4 en haut + 4 en bas = 8.'),
      qcm('Quel solide a une base carrée et 4 faces triangulaires ?', ['*une pyramide à base carrée', 'un cube', 'un prisme', 'un cône'], 'Les faces triangulaires se rejoignent au sommet.', { visual: shape('pyramide') }),
      vf('Le cylindre est un polyèdre.', false, 'Le cylindre a une surface courbe : ce n’est pas un polyèdre.'),
      qcm('Combien de carrés faut-il dans le patron d’un cube ?', ['*6', '4', '8', '12'], 'Un cube a 6 faces carrées.'),
      tri('Polyèdre ou non ?', ['Polyèdre', 'Pas un polyèdre'], [['cube', 0], ['boule', 1], ['pyramide', 0], ['cône', 1], ['pavé droit', 0], ['cylindre', 1]], 'Un polyèdre n’a que des faces planes.'),
      qcm('Quel solide est représenté ?', ['*un cylindre', 'un cône', 'un pavé', 'une pyramide'], 'Deux disques reliés par une surface courbe.', { visual: shape('cylindre') }),
    ],
  }),
  S({
    id: 'cm2-ma-donnees',
    domain: 'Organisation et gestion de données',
    title: 'Tableaux et graphiques',
    lesson: L(
      'Je vais apprendre à lire, interpréter et comparer des données dans des tableaux et des graphiques.',
      'Les stations météo de l’Académie envoient chaque jour leurs mesures : comment les analyser ?',
      ['Un tableau à double entrée se lit en croisant une ligne et une colonne.', 'Un diagramme en barres compare des quantités ; un graphique en courbe montre une évolution dans le temps.', 'Je lis toujours le titre, les axes, les unités et l’échelle avant de répondre.'],
      ['Sur un diagramme, la barre « lundi » atteint 12 mm de pluie. Que signifie-t-il ?', 'Il est tombé 12 mm de pluie le lundi.'],
      ['Je lis le titre : la pluie de la semaine.', 'Je lis l’unité : mm.', 'Je lis la hauteur de la barre : 12 mm.'],
      ['Pose-toi trois questions : De quoi parle le graphique ? Quelle unité ? Quelle information me demande-t-on ?'],
      'Titre, axes, unités, échelle — puis lecture précise.',
    ),
    items: [
      num('Combien de visiteurs le musée a-t-il reçus en mars ?', 450, 'La barre « mars » s’arrête à 450.', { visual: { kind: 'bars', title: 'Visiteurs du musée (centaines)', labels: ['Jan', 'Fév', 'Mars', 'Avr'], values: [300, 350, 450, 400] } }),
      qcm('Quel mois a eu le moins de visiteurs ?', ['*janvier', 'février', 'mars', 'avril'], 'La barre la plus basse est celle de janvier (300).', { visual: { kind: 'bars', title: 'Visiteurs du musée', labels: ['Jan', 'Fév', 'Mars', 'Avr'], values: [300, 350, 450, 400] } }),
      num('Quelle est la différence de visiteurs entre mars et janvier ?', 150, '450 − 300 = 150.', { visual: { kind: 'bars', title: 'Visiteurs du musée', labels: ['Jan', 'Fév', 'Mars', 'Avr'], values: [300, 350, 450, 400] } }),
      num('Quelle température faisait-il à Lille en juillet (°C) ?', 19, 'Ligne Lille, colonne juillet : 19 °C.', { visual: { kind: 'table', rows: [['Ville', 'Janvier', 'Juillet'], ['Lille', '4', '19'], ['Marseille', '8', '25'], ['Strasbourg', '1', '20']] } }),
      qcm('Quelle ville a la plus grande différence de température entre janvier et juillet ?', ['*Strasbourg', 'Lille', 'Marseille'], 'Strasbourg : 20 − 1 = 19 ; Marseille : 17 ; Lille : 15.', { visual: { kind: 'table', rows: [['Ville', 'Janvier', 'Juillet'], ['Lille', '4', '19'], ['Marseille', '8', '25'], ['Strasbourg', '1', '20']] } }),
      num('Calcule la moyenne de ces trois notes de jeu : 12, 15 et 18.', 15, '(12 + 15 + 18) ÷ 3 = 45 ÷ 3 = 15.', { d: 3 }),
    ],
  }),
  S({
    id: 'cm2-ma-durees',
    domain: 'Grandeurs et mesures — durées',
    title: 'Durées et repères temporels',
    lesson: L(
      'Je vais apprendre à calculer des durées et à convertir des unités de temps.',
      'Le départ de la navette est prévu à 14 h 35 : combien de temps reste-t-il ?',
      ['1 h = 60 min ; 1 min = 60 s ; 1 jour = 24 h ; 1 siècle = 100 ans ; 1 millénaire = 1 000 ans.', 'Pour calculer une durée, on avance par bonds jusqu’à l’heure pile, puis jusqu’à l’heure d’arrivée.', 'Le XXIe siècle va de 2001 à 2100.'],
      ['Durée entre 9 h 45 et 11 h 20 ?', '15 min (→ 10 h) + 1 h (→ 11 h) + 20 min = 1 h 35 min.'],
      ['De 9 h 45 à 10 h : 15 min.', 'De 10 h à 11 h : 1 h.', 'De 11 h à 11 h 20 : 20 min. Total : 1 h 35 min.'],
      ['Dessine une ligne du temps et fais des sauts : c’est plus sûr que de soustraire directement les heures et les minutes.'],
      '1 h = 60 min. Calculer une durée = faire des bonds jusqu’aux heures pleines.',
    ),
    items: [
      num('Combien de secondes dans 3 minutes ?', 180, '3 × 60 = 180 s.', { unit: 's' }),
      num('Combien de minutes dans 2 h 15 min ?', 135, '2 × 60 + 15 = 135 min.', { unit: 'min' }),
      qcm('En quel siècle a eu lieu la Révolution française (1789) ?', ['*le XVIIIe siècle', 'le XVIIe siècle', 'le XIXe siècle', 'le XXe siècle'], '1789 est entre 1701 et 1800 : XVIIIe siècle.'),
    ],
    gens: dureeGens,
  }),
  S({
    id: 'cm2-ma-algebre',
    domain: 'Nombres et calculs — initiation à l’algèbre',
    title: 'Suites et programmes de calcul',
    prereq: ['cm2-ma-mental'],
    d: 2,
    lesson: L(
      'Je vais apprendre à trouver la règle d’une suite et à utiliser un programme de calcul.',
      'Le code secret de la porte de l’Académie suit une règle mystérieuse…',
      ['Une suite de nombres suit une règle : par exemple « on ajoute 4 à chaque fois » (3, 7, 11, 15…).', 'Un programme de calcul est une suite d’instructions : « Choisis un nombre, multiplie-le par 3, ajoute 2. »', 'Pour retrouver le nombre de départ, on remonte le programme en faisant les opérations inverses, dans l’ordre inverse.'],
      ['Programme « × 3 puis + 2 ». J’obtiens 17. Quel était le nombre de départ ?', '17 − 2 = 15 ; 15 ÷ 3 = 5.'],
      ['La dernière opération était « + 2 » : je fais − 2 → 15.', 'Avant, c’était « × 3 » : je fais ÷ 3 → 5.', 'Vérification : 5 × 3 + 2 = 17.'],
      ['C’est comme rembobiner un film : on repasse les étapes à l’envers.'],
      'Trouver la règle ; pour remonter un programme : opérations inverses, ordre inverse.',
    ),
    items: [
      num('Suite : 5 ; 10 ; 20 ; 40 ; … Quel est le nombre suivant ?', 80, 'On multiplie par 2 à chaque fois.'),
      qcm('Quelle est la règle de la suite 100 ; 93 ; 86 ; 79 ?', ['*on enlève 7', 'on enlève 6', 'on divise par 2', 'on ajoute 7'], '100 − 7 = 93, 93 − 7 = 86…'),
      num('Programme : « ajoute 5, puis multiplie par 2 ». Résultat avec 4 ?', 18, '(4 + 5) × 2 = 9 × 2 = 18.'),
    ],
    gens: algGens,
  }),
];

void fr;
