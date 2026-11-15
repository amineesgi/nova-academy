import { L, num, qcm, skillsOf, txt, vf, ordre, tri, type GenSpec } from '../authoring';
import { digitAt, numberToWords, numericChoices, PRENOMS, PLACE_NAMES } from '../math-helpers';
import { REF } from '../refs';
import type { ShapeKind, Visual } from '../types';
import { fr } from '@/utils/rng';

const S = skillsOf({ level: 'ce2', subject: 'maths', programRef: REF.ce2Maths, region: 'foret-nombres' });
const shape = (s: ShapeKind): Visual => ({ kind: 'shape', shape: s });

// ————— Numération —————
const numGens: GenSpec[] = [
  {
    id: 'g-chiffre',
    difficulty: 1,
    build: (r) => {
      const n = r.int(1000, 9999);
      const p = r.int(0, 3);
      const others = [0, 1, 2, 3].filter((k) => k !== p).map((k) => digitAt(n, k));
      return qcm(`Dans le nombre ${fr(n)}, quel est le chiffre des ${PLACE_NAMES[p]} ?`, numericChoices(r, digitAt(n, p), [...others, (digitAt(n, p) + 1) % 10, (digitAt(n, p) + 9) % 10]), `On lit les rangs de droite à gauche : unités, dizaines, centaines, milliers. Dans ${fr(n)}, le chiffre des ${PLACE_NAMES[p]} est ${digitAt(n, p)}.`);
    },
  },
  {
    id: 'g-decomp',
    difficulty: 2,
    build: (r) => {
      const m = r.int(1, 9), c = r.int(0, 9), d = r.int(0, 9), u = r.int(0, 9);
      const n = m * 1000 + c * 100 + d * 10 + u;
      return num(`Écris le nombre : ${m} milliers + ${c} centaines + ${d} dizaines + ${u} unités.`, n, `${m} × 1 000 + ${c} × 100 + ${d} × 10 + ${u} = ${fr(n)}.`);
    },
  },
  {
    id: 'g-lettres',
    difficulty: 2,
    build: (r) => {
      const n = r.pick([r.int(100, 999), r.int(1000, 9999), r.int(1000, 9999)]);
      return num(`Écris en chiffres : « ${numberToWords(n)} ».`, n, `« ${numberToWords(n)} » s'écrit ${fr(n)}.`);
    },
  },
  {
    id: 'g-dizaines',
    difficulty: 3,
    build: (r) => {
      const n = r.int(1000, 9999);
      const ans = Math.floor(n / 10);
      return num(`Combien y a-t-il de dizaines en tout dans ${fr(n)} ?`, ans, `Dans ${fr(n)}, on compte toutes les dizaines : on cache le chiffre des unités → ${fr(ans)} dizaines.`, { hint: 'Cache le chiffre des unités : le nombre qui reste est le nombre de dizaines.' });
    },
  },
];

const cmpGens: GenSpec[] = [
  {
    id: 'g-compare',
    difficulty: 1,
    build: (r) => {
      const a = r.int(1000, 9999);
      let b = r.pick([a + r.int(1, 9) * 10, a - r.int(1, 9) * 100, r.int(1000, 9999)]);
      if (b === a) b = a + 1;
      return qcm(`Quel signe faut-il mettre ? ${fr(a)} … ${fr(b)}`, [a < b ? '*<' : '<', a > b ? '*>' : '>', '='], `On compare d'abord les milliers, puis les centaines, les dizaines et les unités. ${fr(a)} ${a < b ? '<' : '>'} ${fr(b)}.`);
    },
  },
  {
    id: 'g-ranger',
    difficulty: 2,
    build: (r) => {
      const base = r.int(1, 8) * 1000;
      const set = new Set<number>();
      while (set.size < 4) set.add(base + r.int(0, 1999));
      const sorted = [...set].sort((x, y) => x - y);
      return ordre('Range ces nombres du plus petit au plus grand.', sorted.map((x) => fr(x)), `Ordre croissant : ${sorted.map((x) => fr(x)).join(' < ')}.`, 'number');
    },
  },
  {
    id: 'g-encadrer',
    difficulty: 3,
    build: (r) => {
      const n = r.int(1001, 9899);
      const low = Math.floor(n / 100) * 100;
      return num(`Complète l'encadrement à la centaine : ${fr(low)} < ${fr(n)} < …`, low + 100, `La centaine juste après ${fr(n)} est ${fr(low + 100)}.`);
    },
  },
];

const mentalGens: GenSpec[] = [
  {
    id: 'g-add-dizaines',
    difficulty: 1,
    build: (r) => {
      const a = r.int(12, 89), b = r.int(1, 9) * 10;
      return num(`Calcule de tête : ${a} + ${b}`, a + b, `On ajoute ${b / 10} dizaines : ${a} + ${b} = ${a + b}.`, { hint: 'Ajoute d’abord les dizaines, les unités ne changent pas.' });
    },
  },
  {
    id: 'g-complement',
    difficulty: 2,
    build: (r) => {
      const a = r.int(11, 89);
      return num(`Combien faut-il ajouter à ${a} pour arriver à 100 ?`, 100 - a, `${a} + ${100 - a} = 100. Astuce : on va d'abord à la dizaine suivante, puis à 100.`);
    },
  },
  {
    id: 'g-double-moitie',
    difficulty: 2,
    build: (r) => {
      const doubleIt = r.next() < 0.5;
      const a = doubleIt ? r.int(11, 49) : r.int(6, 50) * 2;
      return doubleIt
        ? num(`Quel est le double de ${a} ?`, a * 2, `Le double, c'est ${a} + ${a} = ${a * 2}.`)
        : num(`Quelle est la moitié de ${a} ?`, a / 2, `La moitié de ${a}, c'est ${a / 2}, car ${a / 2} + ${a / 2} = ${a}.`);
    },
  },
  {
    id: 'g-sous',
    difficulty: 3,
    build: (r) => {
      const a = r.int(40, 199), b = r.int(11, 39);
      return num(`Calcule de tête : ${a} − ${b}`, a - b, `On peut enlever d'abord les dizaines puis les unités : ${a} − ${Math.floor(b / 10) * 10} = ${a - Math.floor(b / 10) * 10}, puis − ${b % 10} = ${a - b}.`);
    },
  },
];

const tablesGens: GenSpec[] = [
  {
    id: 'g-produit',
    difficulty: 1,
    variants: 20,
    build: (r) => {
      const a = r.int(2, 9), b = r.int(2, 10);
      return num(`Combien font ${a} × ${b} ?`, a * b, `${a} × ${b} = ${a * b} (table de ${a}).`, { hint: `Compte de ${a} en ${a}, ${b} fois.` });
    },
  },
  {
    id: 'g-facteur',
    difficulty: 2,
    build: (r) => {
      const a = r.int(2, 9), b = r.int(2, 9);
      return num(`Complète : ${a} × … = ${a * b}`, b, `${a} × ${b} = ${a * b}.`);
    },
  },
  {
    id: 'g-x10',
    difficulty: 3,
    build: (r) => {
      const a = r.int(2, 9), b = r.pick([10, 20, 30, 40, 50]);
      return num(`Calcule : ${a} × ${b}`, a * b, `${a} × ${b} = ${a} × ${b / 10} × 10 = ${a * b / 10} × 10 = ${a * b}.`);
    },
  },
];

const poseGens: GenSpec[] = [
  { id: 'g-add', difficulty: 1, build: (r) => ({ type: 'column', op: '+', a: r.int(120, 899), b: r.int(105, 899), prompt: 'Pose et calcule l’addition. Écris les retenues si tu en as besoin.', explanation: 'On additionne colonne par colonne en commençant par les unités, sans oublier les retenues.' }) },
  { id: 'g-add4', difficulty: 2, build: (r) => ({ type: 'column', op: '+', a: r.int(1200, 5999), b: r.int(1050, 3999), prompt: 'Pose et calcule l’addition.', explanation: 'Unités, dizaines, centaines puis milliers : chaque retenue passe dans la colonne de gauche.' }) },
  {
    id: 'g-sous',
    difficulty: 2,
    build: (r) => {
      const a = r.int(400, 999), b = r.int(105, a - 50);
      return { type: 'column', op: '-', a, b, prompt: 'Pose et calcule la soustraction.', explanation: 'Quand le chiffre du haut est trop petit, on échange une dizaine contre 10 unités (ou on ajoute 10 en haut et 1 en bas).' };
    },
  },
  {
    id: 'g-sous4',
    difficulty: 3,
    build: (r) => {
      const a = r.int(2000, 9999), b = r.int(1000, a - 100);
      return { type: 'column', op: '-', a, b, prompt: 'Pose et calcule la soustraction.', explanation: 'On soustrait colonne par colonne, des unités vers les milliers, en gérant les retenues.' };
    },
  },
];

const mulGens: GenSpec[] = [
  { id: 'g-mul1', difficulty: 1, build: (r) => ({ type: 'column', op: '×', a: r.int(12, 99), b: r.int(2, 9), prompt: 'Pose et calcule la multiplication.', explanation: 'On multiplie les unités puis les dizaines par le chiffre du bas, en ajoutant les retenues.' }) },
  { id: 'g-mul2', difficulty: 2, build: (r) => ({ type: 'column', op: '×', a: r.int(102, 999), b: r.int(2, 9), prompt: 'Pose et calcule la multiplication.', explanation: 'On multiplie chaque chiffre du nombre du haut par le multiplicateur, de droite à gauche, avec les retenues.' }) },
  { id: 'g-mul3', difficulty: 3, build: (r) => ({ type: 'column', op: '×', a: r.int(21, 99), b: r.int(11, 39), prompt: 'Pose et calcule la multiplication par un nombre à deux chiffres.', explanation: 'On calcule une ligne pour les unités, une ligne pour les dizaines (en décalant d’un rang, avec un 0), puis on additionne.' }) },
];

const divGens: GenSpec[] = [
  {
    id: 'g-partage',
    difficulty: 1,
    build: (r) => {
      const k = r.int(2, 6), q = r.int(3, 9);
      const who = r.pick(PRENOMS);
      return num(`${who} partage ${k * q} billes entre ${k} amis, chacun le même nombre. Combien de billes reçoit chaque ami ?`, q, `${k * q} ÷ ${k} = ${q}, car ${k} × ${q} = ${k * q}.`, { hint: `Cherche dans la table de ${k} : ${k} × ? = ${k * q}.` });
    },
  },
  {
    id: 'g-reste',
    difficulty: 2,
    build: (r) => {
      const k = r.int(3, 9), q = r.int(3, 9), rest = r.int(1, k - 1);
      const n = k * q + rest;
      return num(`On range ${n} œufs dans des boîtes de ${k}. Combien de boîtes peut-on remplir complètement ?`, q, `${k} × ${q} = ${k * q}, il reste ${rest} œuf${rest > 1 ? 's' : ''}. On remplit donc ${q} boîtes.`, { hint: `Cherche le plus grand multiple de ${k} qui ne dépasse pas ${n}.` });
    },
  },
  {
    id: 'g-reste2',
    difficulty: 3,
    build: (r) => {
      const k = r.int(3, 9), q = r.int(4, 12), rest = r.int(1, k - 1);
      const n = k * q + rest;
      return num(`${n} élèves forment des équipes de ${k}. Combien d'élèves restent sans équipe complète ?`, rest, `${k} × ${q} = ${k * q} et ${n} − ${k * q} = ${rest}. Il reste ${rest} élève${rest > 1 ? 's' : ''}.`);
    },
  },
];

const fracGens: GenSpec[] = [
  {
    id: 'g-colorie',
    difficulty: 1,
    build: (r) => {
      const den = r.pick([2, 3, 4, 5, 6, 8]);
      const n = r.int(1, den - 1);
      return { type: 'fraction-build', num: n, den, prompt: `Colorie ${n}/${den} de la bande.`, explanation: `La bande est partagée en ${den} parts égales ; on en colorie ${n}.` };
    },
  },
  {
    id: 'g-lire',
    difficulty: 2,
    build: (r) => {
      const den = r.pick([2, 3, 4, 5, 6, 8, 10]);
      const n = r.int(1, den - 1);
      const opts = new Set([`${n}/${den}`, `${den}/${n}`, `${den - n}/${den}`, `${n}/${den + 1}`]);
      return qcm('Quelle fraction de la figure est coloriée ?', [...opts].map((o) => (o === `${n}/${den}` ? `*${o}` : o)), `La figure a ${den} parts égales et ${n} sont coloriées : ${n}/${den}.`, { visual: { kind: 'fraction', num: n, den, style: r.next() < 0.5 ? 'bar' : 'disc' } });
    },
  },
  {
    id: 'g-unite',
    difficulty: 3,
    variants: 5,
    build: (r) => {
      const den = r.pick([2, 3, 4, 5, 10]);
      return num(`Combien faut-il de fractions 1/${den} pour faire une unité entière ?`, den, `${den} fois 1/${den}, c'est ${den}/${den} = 1.`);
    },
  },
];

const probGens: GenSpec[] = [
  {
    id: 'g-plus',
    difficulty: 1,
    build: (r) => {
      const who = r.pick(PRENOMS), a = r.int(120, 480), b = r.int(35, 260);
      return num(`${who} a ${a} cartes. On lui en donne ${b}. Combien de cartes a-t-il maintenant ?`, a + b, `On ajoute : ${a} + ${b} = ${a + b}.`, { hint: 'Il en reçoit : le nombre de cartes augmente.' });
    },
  },
  {
    id: 'g-ecart',
    difficulty: 2,
    build: (r) => {
      const who = r.pick(PRENOMS), a = r.int(300, 900), b = r.int(100, a - 30);
      return num(`La bibliothèque de l'école a ${a} livres. ${who} en a déjà rangé ${b}. Combien en reste-t-il à ranger ?`, a - b, `On cherche l'écart : ${a} − ${b} = ${a - b}.`);
    },
  },
  {
    id: 'g-fois',
    difficulty: 2,
    build: (r) => {
      const k = r.int(3, 9), p = r.int(4, 12);
      return num(`Un paquet contient ${p} gâteaux. Combien y a-t-il de gâteaux dans ${k} paquets ?`, k * p, `${k} paquets de ${p} : ${k} × ${p} = ${k * p}.`);
    },
  },
  {
    id: 'g-deux-etapes',
    difficulty: 3,
    build: (r) => {
      const k = r.int(2, 5), p = r.int(3, 8), m = r.int(2, 4) * 10;
      const total = k * p;
      return num(`Jade achète ${k} cahiers à ${p} € chacun. Elle paie avec un billet de ${m} €. Combien lui rend-on ?`, m - total, `D'abord le prix : ${k} × ${p} = ${total} €. Puis la monnaie : ${m} − ${total} = ${m - total} €.`, { unit: '€', hint: 'Calcule d’abord le prix total des cahiers.' });
    },
  },
];

const longGens: GenSpec[] = [
  { id: 'g-m-cm', difficulty: 1, variants: 8, build: (r) => { const m = r.int(2, 15); return num(`Combien de centimètres font ${m} m ?`, m * 100, `1 m = 100 cm, donc ${m} m = ${m * 100} cm.`, { unit: 'cm' }); } },
  { id: 'g-km-m', difficulty: 2, variants: 6, build: (r) => { const k = r.int(2, 9); return num(`Combien de mètres font ${k} km ?`, k * 1000, `1 km = 1 000 m, donc ${k} km = ${fr(k * 1000)} m.`, { unit: 'm' }); } },
  { id: 'g-mixte', difficulty: 3, build: (r) => { const m = r.int(1, 5), c = r.int(5, 95); return num(`Convertis en centimètres : ${m} m ${c} cm`, m * 100 + c, `${m} m = ${m * 100} cm, plus ${c} cm : ${m * 100 + c} cm.`, { unit: 'cm' }); } },
  { id: 'g-cm-mm', difficulty: 2, variants: 7, build: (r) => { const c = r.int(2, 15); return num(`Combien de millimètres font ${c} cm ?`, c * 10, `1 cm = 10 mm, donc ${c} cm = ${c * 10} mm.`, { unit: 'mm' }); } },
];

const masseGens: GenSpec[] = [
  { id: 'g-kg-g', difficulty: 1, variants: 6, build: (r) => { const k = r.int(2, 9); return num(`Combien de grammes font ${k} kg ?`, k * 1000, `1 kg = 1 000 g, donc ${k} kg = ${fr(k * 1000)} g.`, { unit: 'g' }); } },
  { id: 'g-somme-masse', difficulty: 2, build: (r) => { const a = r.int(2, 9) * 100, b = r.int(1, 9) * 50; return num(`Un sac de farine pèse ${a} g et un sachet de sucre ${b} g. Quelle est la masse totale ?`, a + b, `${a} + ${b} = ${a + b} g.`, { unit: 'g' }); } },
  { id: 'g-litres', difficulty: 3, variants: 4, build: (r) => { const n = r.int(3, 8); return num(`Une bouteille contient 2 L. Combien de litres dans ${n} bouteilles ?`, 2 * n, `${n} × 2 L = ${2 * n} L.`, { unit: 'L' }); } },
];

const dureeGens: GenSpec[] = [
  {
    id: 'g-horloge',
    difficulty: 1,
    build: (r) => {
      const h = r.int(1, 12), m = r.pick([0, 15, 30, 45]);
      const label = (hh: number, mm: number) => `${hh} h ${String(mm).padStart(2, '0')}`;
      const wrong = [label(h, (m + 30) % 60), label((h % 12) + 1, m), label(h, m === 0 ? 15 : 0)].filter((x) => x !== label(h, m));
      return qcm('Quelle heure indique l’horloge ?', [`*${label(h, m)}`, ...[...new Set(wrong)].slice(0, 3)], `La petite aiguille montre les heures, la grande les minutes : il est ${label(h, m)}.`, { visual: { kind: 'clock', h, m } });
    },
  },
  { id: 'g-h-min', difficulty: 2, build: (r) => { const h = r.int(1, 4), m = r.pick([0, 10, 15, 20, 30, 45]); return num(`Combien de minutes font ${h} h${m ? ` ${m} min` : ''} ?`,h * 60 + m, `1 h = 60 min, donc ${h} h = ${h * 60} min${m ? ` ; + ${m} min = ${h * 60 + m} min` : ''}.`, { unit: 'min' }); } },
  {
    id: 'g-duree',
    difficulty: 3,
    build: (r) => {
      const start = r.int(8, 15), sm = r.pick([0, 15, 30]), d = r.pick([15, 30, 45, 60, 75, 90]);
      const end = start * 60 + sm + d;
      const eh = Math.floor(end / 60), em = end % 60;
      return num(`Le film commence à ${start} h ${String(sm).padStart(2, '0')} et finit à ${eh} h ${String(em).padStart(2, '0')}. Combien de minutes dure-t-il ?`, d, `De ${start} h ${String(sm).padStart(2, '0')} à ${eh} h ${String(em).padStart(2, '0')}, il s'écoule ${d} minutes.`, { unit: 'min', hint: 'Avance d’abord jusqu’à l’heure pile, puis compte les minutes qui restent.' });
    },
  },
];

const monnaieGens: GenSpec[] = [
  { id: 'g-total', difficulty: 1, build: (r) => { const a = r.int(2, 9), b = r.int(1, 9); return num(`Un livre coûte ${a} € et un stylo ${b} €. Combien faut-il payer en tout ?`, a + b, `${a} + ${b} = ${a + b} €.`, { unit: '€' }); } },
  { id: 'g-cents', difficulty: 2, build: (r) => { const e = r.int(1, 9), c = r.pick([10, 20, 50, 70, 80]); return num(`Combien de centimes font ${e} € ${c} c ?`, e * 100 + c, `1 € = 100 c, donc ${e} € = ${e * 100} c, plus ${c} c : ${e * 100 + c} c.`, { unit: 'c' }); } },
  { id: 'g-pieces', difficulty: 2, build: (r) => { const cents = r.shuffle([200, 100, 50, 20, 10, 5]).slice(0, r.int(3, 5)); const tot = cents.reduce((a, b) => a + b, 0); return num('Combien d’argent y a-t-il ? Réponds en centimes.', tot, `On additionne : ${cents.map((c) => (c >= 100 ? `${c / 100} €` : `${c} c`)).join(' + ')} = ${tot} c.`, { unit: 'c', visual: { kind: 'coins', cents } }); } },
  { id: 'g-rendu', difficulty: 3, variants: 6, build: (r) => { const p = r.int(11, 18); return num(`Un jeu coûte ${p} €. Tu paies avec un billet de 20 €. Combien te rend-on ?`, 20 - p, `20 − ${p} = ${20 - p} €.`, { unit: '€' }); } },
];

export const ce2Maths = [
  S({
    id: 'ce2-ma-num',
    domain: 'Nombres et calculs — numération',
    title: 'Les nombres jusqu’à 10 000',
    diag: true,
    lesson: L(
      'Je vais apprendre à lire, écrire et décomposer les nombres jusqu’à 10 000.',
      'Dans la Forêt des Nombres, chaque arbre porte un nombre. Pour le lire, il faut connaître la place de chaque chiffre.',
      ['Un nombre est fait de chiffres. Chaque chiffre a une valeur qui dépend de sa place.', 'De droite à gauche : les unités, les dizaines, les centaines, puis les unités de mille (milliers).', '10 unités = 1 dizaine ; 10 dizaines = 1 centaine ; 10 centaines = 1 millier.'],
      ['Que vaut le chiffre 4 dans 4 352 ?', '4 milliers, soit 4 000.'],
      ['Je place 4 352 dans un tableau : milliers | centaines | dizaines | unités.', 'J’écris 4 | 3 | 5 | 2.', 'Je décompose : 4 352 = 4 000 + 300 + 50 + 2.'],
      ['Imagine des paquets : 1 cube = 1 unité, une barre de 10 cubes = 1 dizaine, une plaque de 10 barres = 1 centaine, un gros cube de 10 plaques = 1 millier.', '4 352, c’est 4 gros cubes, 3 plaques, 5 barres et 2 petits cubes.'],
      'Milliers | centaines | dizaines | unités : la place du chiffre donne sa valeur.',
    ),
    items: [
      qcm('Dans 2 708, quel chiffre est celui des centaines ?', ['2', '*7', '0', '8'], 'Les centaines sont au 3e rang en partant de la droite : 7.'),
      num('Écris en chiffres : deux-mille-cinq-cents.', 2500, 'deux-mille-cinq-cents = 2 500.'),
      vf('Dans 6 045, il y a 0 dizaine.', false, 'Dans 6 045 : 6 milliers, 0 centaine, 4 dizaines, 5 unités. Il y a 4 dizaines.'),
      qcm('Quelle est la bonne décomposition de 3 060 ?', ['*3 000 + 60', '3 000 + 600', '300 + 60', '3 000 + 6'], '3 060 = 3 milliers + 0 centaine + 6 dizaines + 0 unité = 3 000 + 60.'),
      num('Quel nombre vient juste après 4 999 ?', 5000, '4 999 + 1 = 5 000 : on passe au millier suivant.'),
      num('Combien de centaines faut-il pour faire 1 000 ?', 10, '10 centaines = 1 millier.'),
    ],
    gens: numGens,
  }),
  S({
    id: 'ce2-ma-comparer',
    domain: 'Nombres et calculs — numération',
    title: 'Comparer, ranger, encadrer',
    prereq: ['ce2-ma-num'],
    lesson: L(
      'Je vais apprendre à comparer et ranger des nombres.',
      'Deux écureuils comparent leurs réserves de noisettes : qui en a le plus ?',
      ['Le nombre qui a le plus de chiffres est le plus grand.', 'S’ils ont autant de chiffres, on compare chiffre par chiffre en partant de la gauche.', 'Le signe < veut dire « plus petit que », le signe > « plus grand que ». La pointe montre le plus petit.'],
      ['Compare 3 482 et 3 428.', '3 482 > 3 428 car 8 dizaines > 2 dizaines.'],
      ['Les milliers : 3 et 3, égalité.', 'Les centaines : 4 et 4, égalité.', 'Les dizaines : 8 et 2 → 8 est plus grand, donc 3 482 > 3 428.'],
      ['Le signe est comme la bouche d’un crocodile : il s’ouvre toujours vers le plus grand nombre !'],
      'On compare d’abord le nombre de chiffres, puis les chiffres de gauche à droite.',
    ),
    items: [
      qcm('Quel est le plus grand nombre ?', ['999', '*1 002', '1 000', '989'], '1 002 a 4 chiffres et dépasse 1 000.'),
      vf('5 230 < 5 203', false, 'Les dizaines : 3 > 0, donc 5 230 > 5 203.'),
      ordre('Range du plus petit au plus grand.', ['1 099', '1 909', '1 990', '9 011'], 'On compare les milliers puis les centaines…', 'number'),
      num('Quel est le nombre entier juste avant 7 000 ?', 6999, '7 000 − 1 = 6 999.'),
      qcm('Entre quels milliers se trouve 6 482 ?', ['*6 000 et 7 000', '5 000 et 6 000', '6 400 et 6 500', '7 000 et 8 000'], '6 000 < 6 482 < 7 000.'),
    ],
    gens: cmpGens,
  }),
  S({
    id: 'ce2-ma-mental',
    domain: 'Nombres et calculs — calcul mental',
    title: 'Calcul mental : additions et soustractions',
    diag: true,
    lesson: L(
      'Je vais apprendre des astuces pour calculer vite et sans poser.',
      'Pour traverser la rivière, il faut sauter de pierre en pierre : chaque pierre est une petite étape de calcul.',
      ['Pour ajouter un nombre de dizaines, on ajoute aux dizaines : 47 + 30 = 77.', 'Pour aller à 100, on passe par la dizaine suivante : 63 → 70 (+7) → 100 (+30), donc 37.', 'Le double d’un nombre, c’est ce nombre ajouté à lui-même.'],
      ['Calcule 58 + 25.', '58 + 20 = 78, puis 78 + 5 = 83.'],
      ['Je découpe 25 en 20 + 5.', 'J’ajoute 20 : 58 + 20 = 78.', 'J’ajoute 5 : 78 + 5 = 83.'],
      ['Pense à une droite graduée : tu fais un grand saut de 20, puis un petit saut de 5.'],
      'Je découpe les nombres en dizaines et unités pour faire des petits sauts.',
    ),
    items: [
      num('Calcule : 36 + 40', 76, '36 + 40 = 76.'),
      num('Combien faut-il ajouter à 75 pour arriver à 100 ?', 25, '75 + 25 = 100.'),
      num('Le double de 35 ?', 70, '35 + 35 = 70.'),
      num('Calcule : 100 − 45', 55, '100 − 45 = 55, car 45 + 55 = 100.'),
      num('Calcule : 250 + 250', 500, '2 centaines et demie + 2 centaines et demie = 5 centaines.'),
    ],
    gens: mentalGens,
  }),
  S({
    id: 'ce2-ma-tables',
    domain: 'Nombres et calculs — calcul mental',
    title: 'Les tables de multiplication',
    diag: true,
    lesson: L(
      'Je vais apprendre et utiliser les tables de multiplication de 2 à 9.',
      'Le hibou Pip range les graines par paquets égaux : multiplier, c’est compter plus vite des paquets égaux.',
      ['3 × 4, c’est 3 paquets de 4 (ou 4 paquets de 3) : 4 + 4 + 4 = 12.', 'On peut changer l’ordre : 3 × 4 = 4 × 3.', 'Multiplier par 10 : on ajoute un zéro aux unités (7 × 10 = 70).'],
      ['Combien font 6 × 7 ?', '42'],
      ['Je connais 6 × 6 = 36.', '6 × 7, c’est un paquet de 6 de plus : 36 + 6 = 42.'],
      ['Utilise une table que tu connais bien : 9 × 7 = 10 × 7 − 7 = 70 − 7 = 63.'],
      'a × b = b × a ; je m’appuie sur un résultat connu pour trouver les autres.',
    ),
    items: [
      num('Combien font 7 × 8 ?', 56, '7 × 8 = 56.'),
      num('Combien font 9 × 6 ?', 54, '9 × 6 = 60 − 6 = 54.'),
      vf('4 × 5 = 5 × 4', true, 'On peut changer l’ordre des facteurs : les deux font 20.'),
      qcm('Quel calcul correspond à 5 + 5 + 5 + 5 ?', ['*4 × 5', '5 × 5', '4 + 5', '20 × 4'], '4 fois le nombre 5 : 4 × 5 = 20.'),
      num('Combien font 8 × 8 ?', 64, '8 × 8 = 64.'),
    ],
    gens: tablesGens,
  }),
  S({
    id: 'ce2-ma-pose-add-sous',
    domain: 'Nombres et calculs — calcul posé',
    title: 'Additions et soustractions posées',
    prereq: ['ce2-ma-num', 'ce2-ma-mental'],
    lesson: L(
      'Je vais apprendre à poser une addition et une soustraction avec retenue.',
      'Pour les grands nombres, on pose le calcul en colonnes, comme des étagères bien rangées.',
      ['On aligne les unités sous les unités, les dizaines sous les dizaines…', 'On calcule en commençant par la colonne des unités, à droite.', 'Addition : si une colonne fait 10 ou plus, on écrit les unités et on garde la retenue pour la colonne de gauche.', 'Soustraction : si le chiffre du haut est trop petit, on ajoute 10 en haut et 1 au chiffre du bas dans la colonne suivante.'],
      ['Pose 478 + 356.', '834'],
      ['Unités : 8 + 6 = 14 → j’écris 4, je retiens 1.', 'Dizaines : 1 + 7 + 5 = 13 → j’écris 3, je retiens 1.', 'Centaines : 1 + 4 + 3 = 8 → résultat 834.'],
      ['Imagine des pièces : 10 pièces de 1 € s’échangent contre un billet de 10 €. La retenue, c’est cet échange !'],
      'J’aligne bien les chiffres et je commence toujours par les unités.',
    ),
    items: [
      num('Calcule 345 + 132', 477, 'Pas de retenue : 5 + 2 = 7, 4 + 3 = 7, 3 + 1 = 4.'),
      qcm('Pour poser 1 245 + 36, où places-tu le 6 ?', ['*Sous le 5', 'Sous le 1', 'Sous le 2', 'Sous le 4'], 'Les unités se placent sous les unités : 6 sous 5.'),
      num('Calcule 503 − 128', 375, '13 − 8 = 5 ; 10 − 3 = 7 (après retenue) ; 5 − 2 = 3 (après retenue). Résultat : 375.'),
      vf('Dans une addition posée, on commence par la colonne de gauche.', false, 'On commence toujours par les unités, à droite.'),
    ],
    gens: poseGens,
  }),
  S({
    id: 'ce2-ma-multiplication',
    domain: 'Nombres et calculs — calcul posé',
    title: 'La multiplication posée',
    prereq: ['ce2-ma-tables', 'ce2-ma-pose-add-sous'],
    d: 2,
    lesson: L(
      'Je vais apprendre à poser une multiplication.',
      'Le jardinier plante 7 rangées de 124 fleurs. Combien de fleurs ? On pose la multiplication !',
      ['On écrit le grand nombre en haut, le multiplicateur en bas à droite.', 'On multiplie chaque chiffre du haut par le chiffre du bas, en partant des unités.', 'On ajoute la retenue au produit suivant.'],
      ['Pose 124 × 7.', '868'],
      ['7 × 4 = 28 : j’écris 8, je retiens 2.', '7 × 2 = 14, + 2 = 16 : j’écris 6, je retiens 1.', '7 × 1 = 7, + 1 = 8 : résultat 868.'],
      ['Tu peux décomposer : 124 × 7 = 100 × 7 + 20 × 7 + 4 × 7 = 700 + 140 + 28 = 868.'],
      'Je multiplie chaque chiffre, des unités vers la gauche, sans oublier les retenues.',
    ),
    items: [
      num('Calcule 23 × 3', 69, '3 × 3 = 9 ; 3 × 2 = 6 → 69.'),
      num('Calcule 45 × 2', 90, '2 × 5 = 10, j’écris 0, je retiens 1 ; 2 × 4 = 8 + 1 = 9 → 90.'),
      qcm('Quelle décomposition aide à calculer 32 × 4 ?', ['*30 × 4 + 2 × 4', '32 + 4', '3 × 4 + 2', '30 × 2 + 4'], '32 × 4 = 30 × 4 + 2 × 4 = 120 + 8 = 128.'),
      num('Un jardinier plante 6 rangées de 15 tulipes. Combien de tulipes ?', 90, '6 × 15 = 90.'),
    ],
    gens: mulGens,
  }),
  S({
    id: 'ce2-ma-division',
    domain: 'Nombres et calculs — sens des opérations',
    title: 'Partager et grouper : la division',
    prereq: ['ce2-ma-tables'],
    d: 2,
    lesson: L(
      'Je vais apprendre à partager en parts égales et à trouver combien de groupes on peut faire.',
      'Pip doit répartir des glands dans des paniers sans en favoriser aucun.',
      ['Partager équitablement, c’est donner la même quantité à chacun.', 'Pour trouver combien chacun reçoit, je cherche dans les tables : 4 × ? = 24 → 6.', 'Parfois il reste quelque chose : c’est le reste. Il est toujours plus petit que le nombre de parts.'],
      ['On partage 27 bonbons entre 5 enfants.', 'Chacun en a 5 (car 5 × 5 = 25) et il en reste 2.'],
      ['Je cherche le plus grand résultat de la table de 5 qui ne dépasse pas 27 : 25.', '25 = 5 × 5 : chaque enfant reçoit 5 bonbons.', '27 − 25 = 2 : il reste 2 bonbons.'],
      ['Distribue les objets un par un, comme des cartes, jusqu’à ce que tu ne puisses plus faire un tour complet.'],
      'Partager, c’est chercher combien de fois le diviseur « rentre » dans le nombre ; ce qui ne rentre pas, c’est le reste.',
    ),
    items: [
      num('On partage 18 images entre 3 enfants. Combien chacun en reçoit-il ?', 6, '3 × 6 = 18.'),
      num('Combien de groupes de 4 peut-on faire avec 20 élèves ?', 5, '4 × 5 = 20.'),
      vf('Quand on partage 17 billes entre 5 enfants, il reste 2 billes.', true, '5 × 3 = 15 et 17 − 15 = 2.'),
      qcm('Pour partager 35 € entre 7 amis, quel résultat de table utilises-tu ?', ['*7 × 5 = 35', '7 × 4 = 28', '5 × 6 = 30', '3 × 5 = 15'], '7 × 5 = 35 : chacun reçoit 5 €.'),
    ],
    gens: divGens,
  }),
  S({
    id: 'ce2-ma-fractions',
    domain: 'Nombres et calculs — fractions',
    title: 'Découvrir les fractions',
    prereq: ['ce2-ma-division'],
    d: 2,
    lesson: L(
      'Je vais apprendre ce que veut dire une fraction comme 3/4.',
      'On partage une tarte aux pommes en parts égales pour le goûter.',
      ['Une fraction représente des parts égales d’une unité.', 'Le nombre du bas (dénominateur) dit en combien de parts égales on partage.', 'Le nombre du haut (numérateur) dit combien de parts on prend.'],
      ['Que signifie 3/4 d’une tarte ?', 'On coupe la tarte en 4 parts égales et on en prend 3.'],
      ['Je partage la bande en 4 parts égales.', 'Je colorie 3 parts.', 'J’ai colorié 3/4 (trois quarts) de la bande.'],
      ['1/2 se dit « un demi », 1/3 « un tiers », 1/4 « un quart ». Plus le nombre du bas est grand, plus chaque part est petite !'],
      'Dénominateur = nombre de parts égales ; numérateur = nombre de parts prises.',
    ),
    items: [
      qcm('Comment lit-on 1/4 ?', ['*un quart', 'un tiers', 'quatre', 'un demi'], '1/4 se lit « un quart ».'),
      vf('Dans 2/5, on a partagé l’unité en 5 parts égales.', true, 'Le dénominateur 5 indique 5 parts égales.'),
      qcm('Quelle part est la plus grande ?', ['*1/2', '1/3', '1/4', '1/8'], 'Plus on partage en beaucoup de parts, plus chaque part est petite : 1/2 est la plus grande.'),
      num('Combien de quarts faut-il pour faire une unité ?', 4, '4/4 = 1.'),
    ],
    gens: fracGens,
  }),
  S({
    id: 'ce2-ma-problemes',
    domain: 'Nombres et calculs — résolution de problèmes',
    title: 'Résoudre des problèmes',
    prereq: ['ce2-ma-mental', 'ce2-ma-tables'],
    diag: true,
    d: 2,
    lesson: L(
      'Je vais apprendre une méthode pour résoudre un problème.',
      'Les problèmes sont des énigmes de la vie de tous les jours. Un bon détective suit toujours la même méthode.',
      ['1. Je lis l’énoncé deux fois et je repère la question.', '2. Je cherche les informations utiles (les nombres et ce qu’ils représentent).', '3. Je choisis l’opération : ajouter, enlever, multiplier, partager. Je peux faire un schéma.', '4. Je calcule, puis je vérifie que ma réponse a du sens et je fais une phrase.'],
      ['Tom a 12 billes. Il en gagne 9. Combien en a-t-il ?', 'Il en gagne, donc j’ajoute : 12 + 9 = 21. Tom a 21 billes.'],
      ['La question : combien de billes à la fin ?', 'Information : il avait 12 billes, il en gagne 9.', 'Gagner = ajouter : 12 + 9 = 21.', 'Phrase réponse : Tom a 21 billes.'],
      ['Dessine le problème avec une barre : une partie de 12, une partie de 9 ; le tout est ce que l’on cherche.'],
      'Lire, chercher les informations, choisir l’opération, calculer, vérifier, répondre par une phrase.',
    ),
    items: [
      qcm('Lina avait 45 €. Elle dépense 12 €. Quelle opération permet de trouver ce qui lui reste ?', ['*45 − 12', '45 + 12', '45 × 12', '12 − 45'], 'Elle dépense : la somme diminue, on soustrait.'),
      num('Dans un bus, il y a 28 passagers. 9 descendent et 14 montent. Combien de passagers maintenant ?', 33, '28 − 9 = 19 ; 19 + 14 = 33.', { hint: 'Fais le calcul en deux étapes : d’abord ceux qui descendent.' }),
      num('Une boîte contient 6 rangées de 8 chocolats. Combien de chocolats ?', 48, '6 × 8 = 48.'),
      num('Nour a 9 ans. Sa grand-mère a 58 ans de plus qu’elle. Quel âge a sa grand-mère ?', 67, '« De plus » : on ajoute. 9 + 58 = 67 ans.', { d: 2 }),
      num('Hugo lit 12 pages par jour. Combien de pages lit-il en une semaine ?', 84, 'Une semaine = 7 jours : 7 × 12 = 84.', { hint: 'Combien de jours y a-t-il dans une semaine ?' }),
      vf('Pour savoir combien de roues ont 5 vélos, on calcule 5 × 2.', true, 'Chaque vélo a 2 roues : 5 × 2 = 10.'),
    ],
    gens: probGens,
  }),
  S({
    id: 'ce2-ma-longueurs',
    domain: 'Grandeurs et mesures',
    title: 'Mesurer des longueurs',
    prereq: ['ce2-ma-num'],
    lesson: L(
      'Je vais apprendre à utiliser les unités de longueur : km, m, cm, mm.',
      'Pour aller d’une région à l’autre de la carte, il faut savoir mesurer les distances.',
      ['Le mètre (m) est l’unité principale.', '1 m = 100 cm ; 1 cm = 10 mm ; 1 km = 1 000 m.', 'On choisit l’unité adaptée : km pour un trajet, m pour une salle, cm pour un cahier, mm pour une fourmi.'],
      ['Combien de cm font 3 m ?', '300 cm'],
      ['1 m = 100 cm.', '3 m, c’est 3 fois 100 cm.', '3 × 100 = 300 cm.'],
      ['Ta règle de 30 cm : il en faut un peu plus de 3 pour faire 1 m (100 cm).'],
      '1 km = 1 000 m ; 1 m = 100 cm ; 1 cm = 10 mm.',
    ),
    items: [
      qcm('Quelle unité choisir pour mesurer la longueur d’un crayon ?', ['*le centimètre', 'le kilomètre', 'le mètre', 'le litre'], 'Un crayon mesure une quinzaine de centimètres.'),
      qcm('Quelle unité pour la distance Paris–Lyon ?', ['*le kilomètre', 'le centimètre', 'le millimètre', 'le gramme'], 'Les grandes distances se mesurent en kilomètres.'),
      vf('1 m = 10 cm', false, '1 m = 100 cm.'),
      num('Combien de mm font 4 cm ?', 40, '1 cm = 10 mm, donc 4 cm = 40 mm.', { unit: 'mm' }),
    ],
    gens: longGens,
  }),
  S({
    id: 'ce2-ma-masses',
    domain: 'Grandeurs et mesures',
    title: 'Masses et contenances',
    prereq: ['ce2-ma-num'],
    lesson: L(
      'Je vais apprendre à utiliser les grammes, kilogrammes et litres.',
      'Au marché du village, on pèse les fruits et on mesure le jus.',
      ['La masse se mesure en grammes (g) et en kilogrammes (kg) : 1 kg = 1 000 g.', 'La contenance (ce qu’un récipient peut contenir) se mesure en litres (L).', 'Une balance compare ou mesure des masses.'],
      ['Combien de grammes font 2 kg ?', '2 000 g'],
      ['1 kg = 1 000 g.', '2 kg = 2 × 1 000 g = 2 000 g.'],
      ['Un paquet de sucre pèse 1 kg. Une pomme pèse environ 150 g. Une grande bouteille d’eau contient 1,5 L.'],
      '1 kg = 1 000 g ; le litre mesure ce qu’un récipient contient.',
    ),
    items: [
      qcm('Quelle est la masse d’un éléphant ?', ['*environ 5 000 kg', 'environ 5 kg', 'environ 50 g', 'environ 5 L'], 'Un éléphant est très lourd : plusieurs tonnes, donc des milliers de kg.'),
      qcm('Dans quelle unité mesure-t-on l’eau d’un aquarium ?', ['*le litre', 'le kilomètre', 'le centimètre', 'le gramme'], 'On mesure une contenance en litres.'),
      vf('500 g, c’est la moitié d’un kilogramme.', true, '1 kg = 1 000 g et la moitié de 1 000 est 500.'),
      tri('Classe chaque objet selon l’unité la plus adaptée pour sa masse.', ['grammes', 'kilogrammes'], [['une plume', 0], ['un vélo', 1], ['une gomme', 0], ['un sac de pommes de terre', 1]], 'Les objets légers se pèsent en grammes, les lourds en kilogrammes.'),
    ],
    gens: masseGens,
  }),
  S({
    id: 'ce2-ma-durees',
    domain: 'Grandeurs et mesures',
    title: 'Lire l’heure et calculer des durées',
    lesson: L(
      'Je vais apprendre à lire l’heure et à calculer une durée.',
      'Le soleil se lève sur le Jardin des Savoirs : à quelle heure commence l’aventure ?',
      ['La petite aiguille indique les heures, la grande aiguille les minutes.', '1 h = 60 min ; 1 min = 60 s ; 1 jour = 24 h.', 'Pour calculer une durée, on avance de l’heure de début jusqu’à l’heure de fin, par petits bonds.'],
      ['Combien de temps entre 9 h 40 et 10 h 15 ?', '20 min pour aller à 10 h, puis 15 min : 35 min.'],
      ['De 9 h 40 à 10 h : 20 minutes.', 'De 10 h à 10 h 15 : 15 minutes.', '20 + 15 = 35 minutes.'],
      ['Sur l’horloge, la grande aiguille fait un tour complet en 1 heure : quand elle est sur le 3, c’est le quart (15 min), sur le 6 la demie (30 min), sur le 9 trois quarts (45 min).'],
      '1 h = 60 min. Pour une durée, je fais des bonds jusqu’à l’heure pile.',
    ),
    items: [
      num('Combien de minutes dans une demi-heure ?', 30, 'La moitié de 60 min = 30 min.', { unit: 'min' }),
      num('Combien d’heures dans une journée ?', 24, '1 jour = 24 h.', { unit: 'h' }),
      qcm('Quelle heure indique l’horloge ?', ['*3 h 00', '12 h 15', '3 h 30', '6 h 00'], 'Petite aiguille sur 3, grande sur 12 : 3 h.', { visual: { kind: 'clock', h: 3, m: 0 } }),
      vf('Un quart d’heure dure 15 minutes.', true, '60 ÷ 4 = 15.'),
    ],
    gens: dureeGens,
  }),
  S({
    id: 'ce2-ma-monnaie',
    domain: 'Grandeurs et mesures',
    title: 'Utiliser la monnaie',
    prereq: ['ce2-ma-mental'],
    lesson: L(
      'Je vais apprendre à compter de l’argent et à rendre la monnaie.',
      'À la boutique du village, il faut payer le bon prix.',
      ['L’euro (€) se partage en 100 centimes (c) : 1 € = 100 c.', 'Il existe des pièces (1 c à 2 €) et des billets (5 €, 10 €, 20 €, 50 €…).', 'Pour rendre la monnaie, on calcule ce qui manque du prix jusqu’à la somme donnée.'],
      ['Un cahier coûte 3 €. Je donne 5 €. Combien me rend-on ?', '5 − 3 = 2 €.'],
      ['Je pars du prix : 3 €.', 'J’avance jusqu’à 5 € : +2 €.', 'On me rend 2 €.'],
      ['Le vendeur « complète » : il part du prix et ajoute des pièces jusqu’à atteindre ce que tu as donné.'],
      '1 € = 100 c ; la monnaie rendue = somme donnée − prix.',
    ),
    items: [
      num('Combien de pièces de 50 c faut-il pour faire 2 € ?', 4, '2 € = 200 c et 4 × 50 c = 200 c.'),
      vf('Un billet de 10 € vaut autant que cinq pièces de 2 €.', true, '5 × 2 € = 10 €.'),
      num('Une glace coûte 2 € 50 c. Combien coûtent 2 glaces ? (en centimes)', 500, '2 € 50 c = 250 c ; 2 × 250 = 500 c, soit 5 €.', { unit: 'c' }),
    ],
    gens: monnaieGens,
  }),
  S({
    id: 'ce2-ma-figures',
    domain: 'Espace et géométrie',
    title: 'Reconnaître les figures planes',
    diag: true,
    lesson: L(
      'Je vais apprendre à reconnaître et décrire le carré, le rectangle, le triangle et le cercle.',
      'Les maisons du village ont des fenêtres de toutes les formes.',
      ['Le carré a 4 côtés de même longueur et 4 angles droits.', 'Le rectangle a 4 angles droits et ses côtés opposés ont la même longueur.', 'Le triangle a 3 côtés. Un triangle rectangle a un angle droit.', 'Le cercle est une ligne courbe : tous ses points sont à la même distance du centre.'],
      ['Une figure a 4 angles droits et 4 côtés égaux. Laquelle ?', 'Le carré.'],
      ['Je compte les côtés : 4.', 'Je vérifie les angles avec l’équerre : 4 angles droits.', 'Je mesure les côtés : ils sont égaux → c’est un carré.'],
      ['Le carré est un rectangle « parfait » : il a toutes les qualités du rectangle, et en plus ses 4 côtés sont égaux.'],
      'Pour reconnaître une figure : je compte les côtés, je vérifie les angles droits avec l’équerre, je mesure les côtés.',
    ),
    items: [
      qcm('Comment s’appelle cette figure ?', ['*un triangle', 'un carré', 'un cercle', 'un rectangle'], 'Elle a 3 côtés : c’est un triangle.', { visual: shape('triangle') }),
      qcm('Quelle figure est un rectangle ?', ['*figure A', 'figure B', 'figure C', 'figure D'],'Le rectangle a 4 angles droits et des côtés opposés égaux.', { choiceVisuals: [shape('rectangle'), shape('losange'), shape('triangle'), shape('cercle')] }),
      vf('Un carré a 4 angles droits.', true, 'Le carré a 4 angles droits et 4 côtés égaux.'),
      qcm('Combien de côtés a un hexagone ?', ['*6', '5', '8', '4'], 'Hexa veut dire six.', { visual: shape('hexagone') }),
      qcm('Comment s’appelle cette figure ?', ['*un triangle rectangle', 'un carré', 'un losange', 'un rectangle'], 'C’est un triangle qui a un angle droit.', { visual: shape('triangle-rectangle') }),
      vf('Dans un cercle, tous les points sont à la même distance du centre.', true, 'C’est la définition du cercle : cette distance est le rayon.'),
      qcm('Quel instrument permet de vérifier un angle droit ?', ['*l’équerre', 'le compas', 'la balance', 'le thermomètre'], 'L’équerre sert à vérifier et tracer des angles droits.'),
      tri('Range les figures.', ['Elles ont 4 côtés', 'Elles n’ont pas 4 côtés'], [['le carré', 0], ['le triangle', 1], ['le rectangle', 0], ['le cercle', 1], ['le losange', 0], ['l’hexagone', 1]], 'Carré, rectangle et losange sont des quadrilatères (4 côtés).'),
    ],
  }),
  S({
    id: 'ce2-ma-solides',
    domain: 'Espace et géométrie',
    title: 'Reconnaître les solides',
    prereq: ['ce2-ma-figures'],
    lesson: L(
      'Je vais apprendre à reconnaître le cube, le pavé, la pyramide, le cylindre, le cône et la boule.',
      'Dans la cabane à jouets, on trouve des dés, des boîtes, des balles et des tubes.',
      ['Un solide n’est pas plat : on peut le prendre dans la main.', 'Le cube a 6 faces carrées identiques. Le pavé a 6 faces rectangulaires.', 'La boule roule partout ; le cylindre roule dans un seul sens ; la pyramide a une pointe (sommet).', 'Une face est une surface plate, une arête est un bord, un sommet est un coin.'],
      ['Combien de faces a un dé ?', '6 faces (c’est un cube).'],
      ['Je regarde un dé.', 'Je compte ses faces : dessus, dessous, et 4 autour.', '6 faces carrées : c’est un cube.'],
      ['Pense à des objets : un dé = cube, une boîte à chaussures = pavé, une balle = boule, une boîte de conserve = cylindre, un cornet de glace = cône.'],
      'Face = surface plate ; arête = bord ; sommet = coin.',
    ),
    items: [
      qcm('Quel solide est représenté ?', ['*un cube', 'un cylindre', 'une boule', 'un cône'], 'Toutes ses faces sont des carrés identiques : c’est un cube.', { visual: shape('cube') }),
      qcm('Quel solide ressemble à une boîte de conserve ?', ['*le cylindre', 'le cube', 'la pyramide', 'le pavé'], 'Une boîte de conserve est un cylindre.'),
      num('Combien de faces a un pavé droit ?', 6, 'Comme le cube, le pavé a 6 faces, mais elles sont rectangulaires.'),
      vf('Une boule a des arêtes.', false, 'La boule n’a ni face plate, ni arête, ni sommet.'),
      qcm('Quel solide est représenté ?', ['*une pyramide', 'un cube', 'un cylindre', 'une boule'], 'Elle a une base et des faces triangulaires qui se rejoignent au sommet.', { visual: shape('pyramide') }),
      assocFallback(),
    ],
  }),
  S({
    id: 'ce2-ma-reperage',
    domain: 'Espace et géométrie',
    title: 'Se repérer sur un quadrillage et la symétrie',
    lesson: L(
      'Je vais apprendre à repérer une case ou un point sur un quadrillage, et à reconnaître une symétrie.',
      'Sur la carte au trésor, le coffre est caché en case C3 !',
      ['Une case se repère avec une lettre (colonne) et un nombre (ligne), comme B4.', 'On lit d’abord la colonne, puis la ligne.', 'Une figure est symétrique si, pliée le long d’un axe, ses deux moitiés se superposent exactement.'],
      ['Où est le trésor si on avance jusqu’à la colonne C puis la ligne 3 ?', 'Dans la case C3.'],
      ['Je suis la colonne C vers le haut.', 'Je m’arrête à la ligne 3.', 'Le trésor est dans la case C3.'],
      ['Pour la symétrie, pense à un papillon : ses deux ailes sont pareilles de chaque côté de son corps.'],
      'Une case = une lettre (colonne) + un nombre (ligne). Symétrie = pliage parfait.',
    ),
    items: [
      qcm('Sur un quadrillage, quelle case est dans la colonne B et la ligne 2 ?', ['*B2', '2B', 'C2', 'B3'], 'On écrit d’abord la lettre de la colonne, puis le numéro de la ligne.'),
      vf('La lettre A majuscule a un axe de symétrie.', true, 'Un trait vertical au milieu partage le A en deux moitiés identiques.'),
      vf('La lettre F a un axe de symétrie.', false, 'Aucun pliage ne superpose les deux moitiés du F.'),
      qcm('Quel point est en (3 ; 2) : 3 cases vers la droite, 2 cases vers le haut ?', ['*le point A', 'le point B', 'le point C'], 'On avance de 3 vers la droite, puis de 2 vers le haut.', { visual: { kind: 'grid', size: 5, points: [{ x: 3, y: 2, label: 'A' }, { x: 2, y: 3, label: 'B' }, { x: 1, y: 4, label: 'C' }], axis: true } }),
      num('Combien d’axes de symétrie a un carré ?', 4, 'Deux axes passent par le milieu des côtés, deux par les diagonales : 4 axes.', { d: 3 }),
    ],
  }),
  S({
    id: 'ce2-ma-donnees',
    domain: 'Organisation et gestion de données',
    title: 'Lire des tableaux et des graphiques',
    prereq: ['ce2-ma-comparer'],
    lesson: L(
      'Je vais apprendre à lire et utiliser un tableau et un diagramme en barres.',
      'Les animaux de la forêt ont été comptés : comment présenter ces résultats clairement ?',
      ['Un tableau range des informations en lignes et en colonnes.', 'Un diagramme en barres montre des quantités : plus la barre est haute, plus la quantité est grande.', 'Je lis toujours le titre et les légendes avant de répondre.'],
      ['Dans un diagramme, la barre « lapins » monte jusqu’à 8. Combien de lapins ?', '8 lapins.'],
      ['Je trouve la barre « lapins ».', 'Je suis le haut de la barre vers l’axe des nombres.', 'Je lis 8.'],
      ['Imagine que chaque barre est une pile de cubes : tu comptes combien de cubes il y a dans la pile.'],
      'Lire le titre, la légende, puis l’information demandée.',
    ),
    items: [
      num('Combien d’écureuils ont été comptés ?', 6, 'La barre « écureuils » s’arrête à 6.', { visual: { kind: 'bars', title: 'Animaux comptés dans la forêt', labels: ['Lapins', 'Écureuils', 'Hiboux', 'Renards'], values: [8, 6, 3, 2] } }),
      qcm('Quel animal a été vu le plus souvent ?', ['*Lapins', 'Écureuils', 'Hiboux', 'Renards'], 'La barre la plus haute est celle des lapins (8).', { visual: { kind: 'bars', title: 'Animaux comptés dans la forêt', labels: ['Lapins', 'Écureuils', 'Hiboux', 'Renards'], values: [8, 6, 3, 2] } }),
      num('Combien d’animaux ont été comptés en tout ?', 19, '8 + 6 + 3 + 2 = 19.', { visual: { kind: 'bars', title: 'Animaux comptés dans la forêt', labels: ['Lapins', 'Écureuils', 'Hiboux', 'Renards'], values: [8, 6, 3, 2] } }),
      num('Combien d’élèves de CE2 vont à la cantine le jeudi ?', 21, 'On croise la ligne « jeudi » et la colonne « CE2 » : 21.', { visual: { kind: 'table', rows: [['', 'CE1', 'CE2'], ['Lundi', '18', '20'], ['Mardi', '17', '22'], ['Jeudi', '19', '21']] } }),
      num('Le mardi, combien d’élèves de CE1 et CE2 mangent à la cantine ?', 39, '17 + 22 = 39.', { visual: { kind: 'table', rows: [['', 'CE1', 'CE2'], ['Lundi', '18', '20'], ['Mardi', '17', '22'], ['Jeudi', '19', '21']] } }),
    ],
  }),
];

function assocFallback() {
  return qcm('Quel objet a la forme d’une boule ?', ['*un ballon de foot', 'un dé', 'une brique', 'un cornet de glace'], 'Un ballon est une boule : il roule dans tous les sens.');
}

void txt;
