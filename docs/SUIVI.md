# Suivi du projet et rapport de validation

## Phases

| Phase | État | Détail |
|---|---|---|
| 1. Architecture | ✅ | Stack, modèle de données, référentiel, design system (docs/ARCHITECTURE.md) |
| 2. Fondations | ✅ | React/TS strict, HashRouter, profils, IndexedDB (Dexie), registre de niveaux |
| 3. Expérience visuelle | ✅ | Accueil, 2 univers, cartes d’aventure SVG, 4 mascottes, avatars, 6 thèmes, animations (désactivables) |
| 4. Contenu pédagogique | ✅ (enrichissable) | 123 compétences, 123 leçons, 688 exercices rédigés, 1 387 variantes générées, 189 audios (docs/INVENTAIRE.md) |
| 5. Apprentissage adaptatif | ✅ | Diagnostic, états de maîtrise, Leitner, prérequis, mission du jour, planning |
| 6. Gamification | ✅ | XP, niveaux, étoiles, 16 badges, 13 objets, déblocage de régions, 8 mini-jeux |
| 7. Espace parent | ✅ | Code simple, statistiques, graphiques, historique et corrections, planning, séances personnalisées, export/import, réinitialisation |
| 8. Qualité | ✅ | Tests unitaires/contenus/E2E, accessibilité clavier, CSP, audit npm (0 vulnérabilité en production) |
| 9. Distribution | ✅ préparé / ⏳ publication | Workflow GitHub Actions prêt ; dépôt GitHub à créer par le propriétaire (identifiants requis) |
| 10. Validation finale | voir ci-dessous | |

## Rapport de validation (exécuté le 15/11/2026)

| Contrôle | Résultat |
|---|---|
| `tsc -b` (TypeScript strict) | ✅ aucune erreur |
| `npm test` (Vitest) | ✅ 50 tests : moteur adaptatif, planificateur, correcteur, nombres en lettres, stockage, séparation des profils, persistance après réouverture, export/import, fichiers invalides, compatibilité anciennes sauvegardes, cohérence de chaque exercice et variante |
| `npm run build` | ✅ build de production, 223 fichiers pré-cachés (≈ 2,9 Mo, audios compris) |
| `npm audit --omit=dev` | ✅ 0 vulnérabilité |
| Tests E2E Playwright (build de production, service worker actif) | ✅ 6/6 : mission CE2 complète puis mission CM2 complète sans mélange des données ; réouverture du navigateur ; espace parent avec vraies données ; test de positionnement sans note ; mini-jeux ; export puis import sur un navigateur vierge + refus d’un fichier invalide ; utilisation hors ligne (leçon, exercice, correction, audio, mini-jeu) ; compatibilité d’un profil d’ancienne version |
| Vérification visuelle (navigateur intégré) | ✅ accueil, création de profil, test de positionnement, carte CE2 |
| Déploiement GitHub Pages | ⏳ non publié : nécessite votre compte GitHub (voir docs/DEPLOIEMENT.md). Le site ne doit pas être considéré comme en ligne avant vérification de l’URL. |

## Problèmes connus / limites

- Pas de synchronisation entre ordinateurs (choix d’architecture : aucun serveur). Transfert par fichier de sauvegarde.
- Voix anglaises de synthèse (Windows) : correctes mais non natives ; pas d’évaluation de la prononciation.
- Productions écrites libres non corrigées automatiquement (à relire avec un adulte).
- Code parent = simple barrière.
- Pictogrammes du vocabulaire anglais : symboles Unicode du système.

## Prochaines étapes suggérées

1. Publier sur GitHub Pages et vérifier l’URL depuis l’ordinateur des enfants.
2. Enrichir EMC/arts et les dictées ; ajouter des textes de lecture longs.
3. Illustrations dédiées pour le vocabulaire anglais ; enregistrements audio humains si disponibles.
4. Préparer les programmes 2027-2028 (langues vivantes CE2/CM2, histoire-géographie et sciences CM2) le moment venu.

## Ajout du CM1 — 18/11/2026

Ajout du parcours **CM1 « Le Royaume des Inventeurs »**, sans modifier les contenus ni les univers CE2 et CM2.

| Élément | Détail |
|---|---|
| Contenu | 61 compétences, 61 leçons, 302 exercices rédigés + 700 variantes vérifiées (total 1 002), 86 nouveaux audios |
| Programmes | Nouveaux programmes 2026 au CM1 : histoire-géographie (BO n° 22), sciences (BO n° 24), langues vivantes (BO n° 12) ; français et maths (BO n° 16 de 2025) — voir PROGRAMMES.md |
| Univers | Carte « Royaume des Inventeurs », mascotte Cogi (colibri mécanique), thème « Atelier » (aussi proposés aux autres niveaux, sans changer leurs valeurs par défaut) |
| Code commun modifié (minimal) | type `LevelId`, registre, `levelDefaults.ts` (valeurs CE2/CM2 identiques à l’origine), accueil à 3 cartes, validation des sauvegardes (tout niveau du registre), jeux de calcul/fractions, décor de carte |
| Correctifs généraux découverts pendant les tests | 1) Page d’entraînement d’une compétence : la séance est désormais figée au démarrage et réinitialisée si l’on change de compétence (avant, un nouveau rendu pouvait relancer la séance). 2) Après une mise à jour publiée pendant l’utilisation, un écran qui ne se charge plus provoque un rechargement automatique (une fois) au lieu d’un écran blanc, puis un message clair. |

| Contrôle | Résultat |
|---|---|
| `tsc -b` | ✅ |
| Vitest | ✅ 60 tests (dont : séparation CE2/CM1/CM2, profils existants inchangés après création d’un CM1, anciennes sauvegardes CE2/CM2 acceptées, sauvegarde CM1, retour aux prérequis en CM1, cohérence des 1 002 exercices CM1) |
| Build de production | ✅ 309 fichiers pré-cachés (≈ 3,9 Mo), audios CM1 inclus |
| `npm audit --omit=dev` | ✅ 0 vulnérabilité |
| Playwright | ✅ 10/10 : 4 scénarios CM1 (accueil à 3 parcours et création de profil ; mission complète + progression + récompenses + statistiques parentales + export ; une leçon et un exercice corrigé dans chacune des 8 matières ; positionnement + défi des fractions) et les 6 scénarios CE2/CM2 d’origine inchangés |
| Publication | ⏳ non publiée (en attente de votre autorisation) |
