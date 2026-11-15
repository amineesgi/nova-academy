# Nova Academy

**Deux aventures, mille découvertes.** Plateforme éducative gratuite pour réviser le programme français de **CE2** (« Le Jardin des Savoirs ») et de **CM2** (« L’Académie des Explorateurs »), année 2026-2027.

- 100 % statique : hébergée gratuitement sur **GitHub Pages**, accessible depuis n’importe quel ordinateur, même quand l’ordinateur de développement est éteint.
- **Hors ligne** après la première visite (PWA installable), audios embarqués.
- **Sans compte, sans publicité, sans traceur, sans IA externe** ; les données restent dans le navigateur.
- 123 compétences, 688 exercices rédigés + 1 387 variantes mathématiques/anglais générées et vérifiées.
- Leçons structurées avec « Explique-moi autrement », 13 types d’exercices, moteur adaptatif à révisions espacées, test de positionnement sans note, mission du jour, 8 mini-jeux, badges et avatar, espace parent avec statistiques, planning, séances personnalisées, export/import de sauvegardes.

## Démarrage rapide

```bash
npm install
```

```bash
npm run dev
```

Ouvrir http://localhost:5173/nova-academy/

| Commande | Rôle |
|---|---|
| `npm run build` | Build de production (`dist/`) |
| `npm run preview` | Sert le build sur http://localhost:4173/nova-academy/ |
| `npm test` | Tests unitaires + cohérence de la banque d’exercices |
| `npm run test:e2e` | Tests Playwright sur le build (faire `npm run build` avant) |
| `npm run inventory` | Inventaire réel des contenus |
| `npm run audio` | Regénère les MP3 (Windows + ffmpeg) |

## Documentation

- [Déploiement GitHub Pages, mises à jour, retour arrière](docs/DEPLOIEMENT.md)
- [Guide d’utilisation (enfants et parents)](docs/GUIDE_UTILISATEUR.md)
- [Programmes officiels de référence et calendrier](docs/PROGRAMMES.md)
- [Moteur adaptatif](docs/MOTEUR_ADAPTATIF.md)
- [Architecture et design system](docs/ARCHITECTURE.md)
- [Inventaire des contenus](docs/INVENTAIRE.md)
- [Suivi du projet et rapport de validation](docs/SUIVI.md)

## Licence et contenus

Code, textes pédagogiques, illustrations SVG et mascottes : créations originales du projet. Polices Nunito et Baloo 2 (SIL Open Font License) embarquées via @fontsource. Icônes Lucide (licence ISC).
