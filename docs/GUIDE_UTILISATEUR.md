# Guide d’utilisation

## Premier lancement

1. Ouvrez l’adresse du site (voir `DEPLOIEMENT.md`).
2. Sur l’écran d’accueil, chaque enfant choisit son parcours : **Le Jardin des Savoirs (CE2)** ou **L’Académie des Explorateurs (CM2)**.
3. Il choisit un prénom ou un surnom (jamais de nom de famille), un avatar, une mascotte et ses couleurs. Les univers sont des propositions : chaque enfant peut choisir librement mascotte et thème.
4. Le **tour de découverte** (test de positionnement, sans note) prépare les premières missions. Il peut être reporté.

## Une séance type

- **Mission du jour** : 2 à 5 étapes selon la durée réglée par l’adulte (≈ 20 min en CE2, 25 min en CM2).
- Chaque nouvelle notion commence par une **leçon** : objectif, découverte, explication, exemple, pas à pas, (en anglais : écoute et répétition), à retenir. Le bouton **Explique-moi autrement** est toujours disponible.
- Exercices progressifs : la première question est facile ; deux essais par question ; des **indices** à la demande ; une **correction expliquée**.
- **Mini-bilan** après chaque étape (étoiles d’effort et date de la prochaine révision).
- Fin de mission : XP, étoiles, badges, objets débloqués.

## La carte et la liste

La carte d’aventure regroupe les compétences par région (matière). Une option « Liste » (et un réglage permanent) offre une navigation plus simple. Des régions s’ouvrent au fil des missions ; l’adulte peut tout ouvrir.

## Les défis (mini-jeux)

La course aux calculs, Le détective des mots, English Quest (memory sonore + écoute), La machine à phrases, L’explorateur du temps, Le laboratoire des sciences, Le défi des fractions, Le coffre des connaissances (5 bonnes réponses sur 8 ouvrent le coffre → objet pour l’avatar). Aucun chronomètre, aucun tirage au sort de récompense.

## Accessibilité

Réglages de l’enfant : taille du texte, animations réduites, sons, mode liste. Tout est utilisable au clavier (Tab, Entrée, chiffres 1-4 pour les choix). La consigne peut être relue à voix haute (bouton haut-parleur). Les réponses justes/fausses sont indiquées par du texte et des icônes, pas seulement par la couleur.

## Espace parent

Accès : bouton « Espace parent » sur l’accueil. Code à 4 chiffres créé au premier accès (barrière simple, **pas une sécurité forte**).

- **Tableau de bord** : temps de travail de la semaine, séances, taux de réussite, évolution hebdomadaire (8 semaines), résultats par matière, état des compétences, recommandations de révision.
- **Détails d’un profil** :
  - *Progression* : chaque compétence, son état, sa réussite récente, sa prochaine révision et sa référence au programme officiel ;
  - *Historique et corrections* : chaque question, la réponse donnée, la réponse attendue ;
  - *Planning* : durée des séances, jours (5 par défaut, modifiables), matières, priorités, exploration libre ;
  - *Séance personnalisée* : choisissez jusqu’à 5 compétences, la séance apparaît chez l’enfant ;
  - *Gestion* : changer le code, réinitialiser (confirmation par le prénom), supprimer.
- **Sauvegardes** : export JSON (tous les profils ou un seul), import avec vérification (fusion ou remplacement), état du stockage, inventaire des contenus.

## Ce que l’application ne fait pas (volontairement)

- Pas de compte, pas de cloud, pas de synchronisation automatique entre ordinateurs.
- Pas d’évaluation de la prononciation (l’enfant écoute et répète ; un adulte peut l’écouter).
- Pas de correction automatique de textes libres : les productions écrites longues sont à relire avec un adulte ; l’application entraîne l’organisation (ordre, connecteurs, résumé).
- Les exercices d’arts et de santé ne remplacent ni la pratique artistique ni l’activité physique réelles.

## Limites du stockage navigateur

Les données sont dans le navigateur (IndexedDB) de l’ordinateur utilisé. Elles peuvent disparaître si l’on efface les données de navigation, en navigation privée, ou si le navigateur manque d’espace (l’application demande un stockage « persistant » quand c’est possible). **Exportez une sauvegarde chaque semaine.**
