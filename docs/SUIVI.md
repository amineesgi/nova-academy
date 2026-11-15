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
