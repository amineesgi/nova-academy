# Architecture technique

## Choix techniques

| Besoin | Choix | Raison |
|---|---|---|
| Interface | React 18 + TypeScript strict | Typage fort du contenu pédagogique et des moteurs |
| Build | Vite 6 | Rapide, sortie statique compatible GitHub Pages |
| Routage | React Router 7, **HashRouter** | Aucune réécriture serveur nécessaire sur GitHub Pages ; liens profonds fiables hors ligne |
| Stockage | IndexedDB via Dexie 4 | Transactions, index par profil, migrations de schéma |
| Hors ligne | vite-plugin-pwa (Workbox, pré-cache total) | Application, contenus, polices et audios disponibles sans réseau |
| Styles | CSS « design system » maison (variables) | Thèmes par profil sans dépendance, léger |
| Icônes | lucide-react | Icônes vectorielles, arbre-shaking |
| Illustrations | SVG originaux dans `src/art` | Mascottes, avatars, cartes d’aventure : aucun fichier externe, aucun copyright tiers |
| Graphiques | SVG maison (`src/parent-dashboard/charts.tsx`) | Pas de bibliothèque lourde |
| Polices | Nunito (variable) + Baloo 2 via @fontsource (locales, licence OFL) | Lisibilité, pas de CDN |
| Audio | MP3 locaux générés (voix Windows SAPI + ffmpeg), synthèse navigateur en secours | Ne dépend pas d’un service externe |
| Tests | Vitest (+ fake-indexeddb), Playwright | Unitaires, contenus, E2E sur le build de production |

Pas de backend, pas d’API, pas de traceur, pas de ressource CDN. Une politique CSP stricte (`default-src 'self'`) est injectée au build.

## Arborescence

```
src/
  app/                 Coquille, routes, contexte global, écrans enfant, séance (SessionRunner)
  art/                 Mascottes, avatars, cartes d’aventure (SVG originaux)
  audio/               Lecture audio locale + clés de fichiers
  adaptive-engine/     Modèle de maîtrise (mastery.ts) et planificateur (planner.ts)
  components/          Composants UI communs (modale, toasts, barres, badges matières…)
  curriculum/          Contenu pédagogique : types, outils d’écriture, références officielles
    ce2/  cm2/         Compétences, leçons, exercices, générateurs par matière
    registry.ts        Registre des niveaux (point d’extension pour CM1, CE1…)
  design-system/       Jetons et composants CSS, 6 thèmes
  exercises/           Moteur de correction (check.ts), lecteur d’exercice, zones de réponse, visuels, cartes géographiques
  games/               8 mini-jeux
  lessons/             Affichage d’une leçon structurée
  parent-dashboard/    Espace parent : statistiques, graphiques, planning, sauvegardes
  profiles/            Types de profil, éditeur d’avatar
  progression/         Statistiques, récompenses, déblocage des régions
  rewards/             XP, niveaux, badges, objets
  storage/             Base IndexedDB, accès aux données, sauvegarde/restauration
  utils/               Générateur pseudo-aléatoire, formatage
public/audio           MP3 embarqués + manifest.json
scripts/               Génération audio, icônes, inventaire
tests/unit             Tests unitaires et de cohérence des contenus
tests/e2e              Scénarios Playwright
docs/                  Documentation
```

## Modèle de données (IndexedDB « nova-academy », version 1)

| Table | Clé | Contenu |
|---|---|---|
| profiles | id | prénom, niveau, avatar, mascotte, thème, réglages, planning, récompenses, jours actifs, séances personnalisées |
| skillRecords | [profileId+skillId] | état de maîtrise d’une compétence (voir MOTEUR_ADAPTATIF.md) |
| attempts | ++id (index profileId, [profileId+day], skillId) | chaque réponse : question, réponse donnée/attendue, essais, indices, durée, contexte |
| sessions | ++id (index profileId, [profileId+day]) | séances : début, fin, minutes, type, résultats |
| meta | key | code parent (haché), date du dernier export |

Toutes les lignes portent `profileId` : les progressions CE2/CM2 ne peuvent pas se mélanger (testé).

**Évolutions** : ajouter `this.version(2).stores(...).upgrade(...)` dans `src/storage/db.ts` ; les profils sont aussi normalisés à la lecture (`normalizeProfile`) pour accepter les anciens enregistrements. Le format de sauvegarde est versionné (`formatVersion`) avec `migrateBackup`.

## Contenu pédagogique

- Une compétence = métadonnées + leçon + exercices rédigés + générateurs (`src/curriculum/types.ts`).
- 13 types d’exercices : QCM, vrai/faux, numérique, texte à trous, association, ordre (phrases, frises, suites), classement, écoute anglaise, dictée, calcul posé, fraction à colorier, carte interactive, mot fautif (détective).
- Les identifiants d’exercices dépendent de leur position : **on ajoute toujours en fin de liste**.
- `npm run inventory` affiche l’inventaire réel ; `tests/unit/content.test.ts` vérifie chaque exercice et chaque variante comptée (bonne réponse acceptée par le correcteur, choix sans doublon, prérequis existants, cibles de carte valides, diversité des générateurs…).

## Ajouter un niveau (ex. CM1)

1. Créer `src/curriculum/cm1/` sur le modèle de `cm2/` (compétences + `index.ts` avec régions).
2. Ajouter `'cm1'` à `LevelId` et l’enregistrer dans `registry.ts` et `DEFAULT_SUBJECTS`.
3. Ajouter une carte d’accueil (Welcome) et, si souhaité, un décor de carte dans `AdventureMap`.

## Design system

- Jetons : couleurs sémantiques (`--bg`, `--surface`, `--ink`, `--primary`, `--accent`, `--success`, `--danger`…), typographie (`--font-display` Baloo 2, `--font-body` Nunito, échelle `--fs-*` multipliée par `--text-scale`), espacements `--space-1..8`, rayons, ombres.
- Thèmes : Jardin, Aurore, Océan (clairs) ; Académie, Cosmos, Volcan (sombres) ; thème « Nova » pour l’accueil.
- Composants : boutons (primaire, accent, succès, danger, fantôme ; tailles), cartes, pastilles, barres de progression, modales accessibles (piège du focus, Échap), notifications, retours de correction, choix, jetons glissables, zones de dépôt.
- Mouvement : micro-animations courtes ; tout est neutralisé par `prefers-reduced-motion` ou le réglage « Réduire les animations ».

## Performances

Écrans secondaires chargés à la demande (lazy). Le paquet principal (~670 ko, ~220 ko compressé) contient tout le contenu pédagogique pour un fonctionnement hors ligne immédiat. Aucune requête réseau pendant l’utilisation hormis le chargement initial et les mises à jour.
