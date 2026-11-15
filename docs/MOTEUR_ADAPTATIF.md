# Moteur d’apprentissage adaptatif

Fichiers : `src/adaptive-engine/mastery.ts` (modèle de maîtrise) et `src/adaptive-engine/planner.ts` (mission du jour, choix des exercices). Tout fonctionne hors ligne, sans IA, avec des règles lisibles. Tests : `tests/unit/adaptive.test.ts`.

> Ce moteur n’est **pas** une mesure scientifique du niveau de l’enfant. C’est un outil transparent pour décider quoi réviser et quand.

## 1. Ce qui est enregistré pour chaque réponse

Réponse juste ou fausse, numéro de l’essai (1 ou 2), nombre d’indices utilisés, durée, compétence, exercice, réponse donnée et réponse attendue (consultables dans l’espace parent).

## 2. Qualité d’une réponse

| Situation | Qualité |
|---|---|
| Juste du premier coup, sans indice | 1 |
| Juste avec un indice ou au 2e essai | 0,5 |
| Fausse après 2 essais | 0 |

On garde les **8 dernières qualités** de chaque compétence (fenêtre glissante) : la « réussite récente » est leur moyenne.

## 3. États d’une compétence

| État | Règle |
|---|---|
| Non commencée | aucune réponse (et leçon non vue) |
| En découverte | moins de 4 réponses |
| En apprentissage | réussite récente < 60 % |
| À consolider | réussite récente ≥ 60 % |
| Maîtrisée provisoirement | réussite récente ≥ 85 %, au moins 6 réponses, sur **2 jours différents**, **et** au moins une révision espacée réussie |

« Provisoirement » : si une révision ultérieure échoue, la compétence redescend.

## 4. Difficulté répétée

`needsSupport` passe à vrai si **3 erreurs consécutives** ou si un bloc d’exercices a moins de 50 % de réussite. Alors la mission suivante :

1. vérifie les **prérequis** : si l’un est encore en découverte ou en apprentissage, un bloc « Retour aux bases » est ajouté **avant** ;
2. ouvre la leçon avec l’**explication alternative** (« Explique-moi autrement ») ;
3. propose des **exercices guidés** (difficulté 1 puis 2) ;
4. programme une **révision** rapprochée (boîte 1 : le lendemain) ;
5. **vérifie la maîtrise** lors des révisions suivantes, espacées.

Exemple : un élève de CM2 bloque sur les nombres décimaux (`cm2-ma-decimaux`), dont le prérequis est `cm2-ma-fractions`. Si les fractions sont encore fragiles, la mission suivante commence par un bloc « Retour aux bases » sur les fractions, puis reprend les décimaux avec l’explication alternative et des exercices guidés ; une révision est programmée le lendemain, puis à 3, 7, 14 et 30 jours si tout va bien.

## 5. Révisions espacées (boîtes de Leitner)

À la fin de chaque bloc (5 ou 6 exercices sur une compétence) :

| Score du bloc | Effet | Prochaine révision |
|---|---|---|
| ≥ 80 % | boîte + 1 (max 5) | 1, 3, 7, 14 ou 30 jours selon la boîte |
| 50 à 79 % | boîte inchangée (au moins 1) | selon la boîte |
| < 50 % | retour en boîte 1 + accompagnement | le lendemain |

## 6. Mission du jour

Nombre d’étapes ≈ durée choisie par le parent ÷ 6 min (CE2) ou 7 min (CM2), entre 2 et 5. Priorités, dans l’ordre :

1. compétences en difficulté (avec prérequis fragiles d’abord) ;
2. révisions arrivées à échéance (les plus anciennes d’abord) ;
3. compétences en cours dans les matières du jour ;
4. nouvelles compétences accessibles, dans l’ordre du programme ;
5. complément si nécessaire.

Contraintes : maximum 2 étapes par matière (sauf matières prioritaires), seulement les matières cochées par le parent, seulement les régions ouvertes. Les **matières du jour** tournent : français et mathématiques chaque jour, anglais un jour sur deux, une autre matière en rotation, plus les priorités du parent.

## 7. Choix des exercices d’une étape

- La **première question est toujours la plus facile** disponible.
- Difficulté cible selon le type d’étape (découverte : 1-1-2-2-3 ; accompagnement : 1-1-1-2-2 ; révision : 1-2-2-3-3) et la réussite récente.
- On évite les 20 derniers exercices vus. Les mathématiques utilisent des générateurs : chaque tirage produit une nouvelle variante vérifiée.

## 8. Test de positionnement

1 question facile par compétence-clé en CE2 (12 questions), 2 en CM2 (jusqu’à 24), bouton « Je ne sais pas encore », aucune note affichée. Les compétences non réussies sont programmées en révision immédiate ; rien n’est verrouillé ni figé.

## 9. Déblocages

- Une compétence est accessible si elle est la première de sa région, si elle a déjà été travaillée, ou si ses prérequis sont au moins « en apprentissage ».
- Régions : français, mathématiques et anglais ouverts dès le départ ; les autres s’ouvrent une par une après chaque mission accomplie. Le parent peut tout ouvrir (« exploration libre »).
