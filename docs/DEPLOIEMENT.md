# Déploiement gratuit sur GitHub Pages

Résultat : un site accessible depuis n’importe quel ordinateur à l’adresse
`https://VOTRE-UTILISATEUR.github.io/nova-academy/`, **même lorsque votre PC est éteint** (le site est hébergé par GitHub). Aucun serveur, aucun abonnement, aucune clé secrète.

> Remplacez `VOTRE-UTILISATEUR` par votre identifiant GitHub. Le projet ne contient aucun identifiant ni jeton.

## 1. Créer le dépôt (une seule fois)

1. Connectez-vous sur https://github.com (compte gratuit).
2. Cliquez sur **New repository**.
3. Nom : `nova-academy` (si vous choisissez un autre nom, l’adresse du site change en conséquence : le workflow s’adapte tout seul).
4. Visibilité : **Public** (GitHub Pages gratuit nécessite un dépôt public pour un compte gratuit). Le code ne contient aucune donnée personnelle : les progrès des enfants restent dans leur navigateur.
5. Ne cochez **aucune** option d’initialisation (pas de README, pas de .gitignore).

## 2. Pousser le projet

Dans un terminal ouvert dans le dossier du projet :

```bash
git remote add origin https://github.com/VOTRE-UTILISATEUR/nova-academy.git
```

```bash
git push -u origin main
```

Git vous demandera de vous connecter (fenêtre du navigateur ou « Git Credential Manager »). N’écrivez jamais de jeton dans le code.

## 3. Activer GitHub Pages

1. Sur la page du dépôt : **Settings → Pages**.
2. Dans **Build and deployment → Source**, choisissez **GitHub Actions**.
3. Ouvrez l’onglet **Actions** : le workflow « Déployer sur GitHub Pages » se lance (sinon, cliquez sur **Run workflow**).

Le workflow (`.github/workflows/deploy.yml`) :
1. installe les dépendances (`npm ci`) ;
2. vérifie les types TypeScript ;
3. exécute les tests unitaires et les tests de cohérence des contenus ;
4. construit la version de production avec le bon chemin (`/nom-du-depot/`) ;
5. vérifie la présence du service worker, du manifeste et des audios ;
6. publie le site ;
7. lance en parallèle les tests de bout en bout Playwright (rapport téléchargeable en cas d’échec).

Une étape en rouge = déploiement bloqué ; cliquez dessus pour lire l’erreur.

## 4. Obtenir l’adresse publique

À la fin du job **Mise en ligne**, l’adresse s’affiche (aussi visible dans **Settings → Pages**) :
`https://VOTRE-UTILISATEUR.github.io/nova-academy/`

## 5. Vérifier le déploiement

Sur l’ordinateur des enfants :

1. Ouvrez l’adresse dans Chrome, Edge ou Firefox récent.
2. Vérifiez l’écran « Bienvenue dans Nova Academy ».
3. Attendez le message « Nova Academy est prête à fonctionner sans Internet » (mise en cache complète, quelques secondes).
4. Facultatif : **Installer l’application** (icône d’installation dans la barre d’adresse de Chrome/Edge). Un raccourci est créé sur le bureau Windows : l’application s’ouvre ensuite comme un logiciel, même hors connexion.
5. Test hors ligne : coupez le Wi-Fi, rouvrez l’application : les leçons, exercices, jeux et sons fonctionnent.

## 6. Publier une mise à jour

```bash
git add -A
```

```bash
git commit -m "Description de la modification"
```

```bash
git push
```

Le workflow redéploie automatiquement. Sur les ordinateurs des enfants, un bandeau « Une nouvelle version est disponible » propose la mise à jour (jamais pendant une activité). **La progression est conservée** : elle est stockée dans le navigateur, indépendamment du code, et les changements de format sont migrés automatiquement.

## 7. Revenir à une version précédente

- **Le plus simple** : onglet **Actions**, ouvrez un déploiement réussi plus ancien, puis **Re-run all jobs** : l’ancienne version est republiée.
- **Proprement dans l’historique** :

```bash
git log --oneline
```

```bash
git revert IDENTIFIANT_DU_COMMIT
```

```bash
git push
```

Les données des enfants ne sont pas affectées par un retour en arrière (une sauvegarde plus récente que la version de l’application est refusée avec un message clair, sans rien effacer).

## 8. Utilisation sur plusieurs ordinateurs

Il n’y a **pas de synchronisation automatique** (aucun serveur). Pour passer d’un ordinateur à l’autre : espace parent → **Sauvegardes** → **Exporter** sur le premier ordinateur, puis **Importer** le fichier sur le second (clé USB, e-mail…).

## 9. Distribution locale Windows

La solution retenue est la **PWA installée** (point 5) : après une première ouverture en ligne, l’application installée fonctionne entièrement hors ligne sur Windows, sans rien installer d’autre. Pour un ordinateur jamais connecté à Internet, il est possible de servir le dossier `dist/` avec n’importe quel petit serveur web local, mais cela demande d’installer Node.js : ce cas n’est pas automatisé.

## 10. Développement local (sur votre PC)

```bash
npm install
```

```bash
npm run dev
```

Puis ouvrez http://localhost:5173/nova-academy/. Autres commandes : `npm test` (tests), `npm run test:e2e` (Playwright, après `npm run build`), `npm run inventory` (inventaire des contenus), `npm run audio` (regénérer les audios, Windows).
