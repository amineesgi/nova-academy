# Programmes scolaires de référence — année 2026-2027

Vérification effectuée le **15 novembre 2026** sur education.gouv.fr (Bulletin officiel) et eduscol.education.gouv.fr. L’application applique **les programmes en vigueur pour chaque classe en 2026-2027**, sans anticiper les programmes prévus pour 2027-2028.

## Calendrier retenu

| Discipline | CE2 (cycle 2) en 2026-2027 | CM2 (cycle 3) en 2026-2027 |
|---|---|---|
| Français | **Nouveau programme** — arrêté du 22-10-2024, BO n° 41 du 31-10-2024 (CE2 depuis la rentrée 2025) | **Nouveau programme** — arrêté du 10-04-2025, BO n° 16 du 17-04-2025 (CM2 à la rentrée 2026) |
| Mathématiques | **Nouveau programme** — BO n° 41 du 31-10-2024 (CE2 depuis la rentrée 2025) | **Nouveau programme** — BO n° 16 du 17-04-2025 (CM2 à la rentrée 2026) |
| Langues vivantes (anglais) | Programme de 2020 (BO n° 31 du 30-07-2020) maintenu ; le nouveau programme (BO n° 12 du 19-03-2026) s’applique au CE2 à la rentrée **2027** | Programme de 2020 maintenu ; le nouveau programme s’applique au CM2 à la rentrée **2027** |
| Questionner le monde | Programme de 2020 (BO n° 31 du 30-07-2020) maintenu en 2026-2027 | — |
| Histoire-géographie | — | Programme de 2020 (BO n° 31 du 30-07-2020) maintenu en 2026-2027 ; le nouveau programme (BO n° 22 du 28-05-2026) s’applique au CM2 à la rentrée **2027** |
| Sciences et technologie | — | Programme en vigueur depuis la rentrée 2023 (BO n° 25 du 22-06-2023) maintenu au CM2 en 2026-2027 ; nouveau programme (BO n° 24 du 11-06-2026) au CM2 à la rentrée **2027** |
| EMC | **Nouveau programme** — arrêté du 29-05-2024, BO n° 24 du 13-06-2024 (CE2 à la rentrée 2026) | **Nouveau programme** — BO n° 24 du 13-06-2024 (CM2 depuis la rentrée 2025) |
| Arts, éducation musicale | Programmes de 2020 | Programmes de 2020 (histoire des arts incluse) |
| EPS | Sensibilisation uniquement (l’application ne remplace pas la pratique) | Sensibilisation uniquement ; le nouveau programme d’EPS (BO n° 22 du 28-05-2026) concerne le CM2 à la rentrée 2027 |

Chaque compétence de l’application porte sa référence exacte (champ `programRef`, visible dans l’espace parent → Progression).

## Thèmes officiels utilisés

- **Histoire CM2 (programme 2020)** : Thème 1 « Le temps de la République » ; Thème 2 « L’âge industriel en France » ; Thème 3 « La France, des guerres mondiales à l’Union européenne » ; repères chronologiques.
- **Géographie CM2 (programme 2020)** : « Se déplacer » ; « Communiquer d’un bout à l’autre du monde grâce à l’Internet » ; « Mieux habiter » (nature en ville, recyclage, écoquartier) ; repères France et monde.
- **Sciences CM2** : matière, mouvement, énergie ; le vivant ; matériaux et objets techniques ; la Terre et les êtres vivants dans leur environnement ; démarche scientifique.
- **Questionner le monde CE2** : le vivant, la matière, les objets ; se situer dans l’espace et le temps ; explorer les organisations du monde.

## Référentiel de compétences

Le référentiel est **dans le code** (source unique, testée automatiquement) :

- CE2 : `src/curriculum/ce2/*.ts` — 57 compétences.
- CM2 : `src/curriculum/cm2/*.ts` — 66 compétences.

Chaque compétence comporte : identifiant unique, niveau, matière, domaine, intitulé, objectif, prérequis, difficulté, référence au programme, leçon structurée, exercices, générateurs et critère de maîtrise.

## Limites et points de vigilance

- Les intitulés des compétences reformulent les attendus pour des enfants ; ils ne recopient pas les textes officiels.
- Les **repères annuels de progression** détaillés (ex. nombres jusqu’à 10 000 au CE2, nombres jusqu’au milliard au CM2) suivent les programmes et documents d’accompagnement ; l’adulte reste juge de l’adaptation à la progression de la classe.
- Les **orthographes rectifiées de 1990** (traits d’union dans les nombres écrits en lettres) sont utilisées, conformément aux recommandations de l’Éducation nationale.

## Sources consultées

- Bulletin officiel n° 41 du 31 octobre 2024 (français et mathématiques, cycles 1 et 2).
- Bulletin officiel n° 16 du 17 avril 2025 (français et mathématiques, cycle 3) — https://education.gouv.fr/bo/2025/Hebdo16/MENE2504620A
- Bulletin officiel n° 24 du 13 juin 2024 (EMC).
- Bulletin officiel n° 12 du 19 mars 2026 (langues vivantes cycles 2 et 3) — https://www.education.gouv.fr/bo/2026/Hebdo12/MENE2602911A
- Bulletin officiel n° 22 du 28 mai 2026 (histoire-géographie cycle 3, EPS) et n° 24 du 11 juin 2026 (sciences) — https://www.education.gouv.fr/bo/2026/Hebdo24/MENE2611650A
- Bulletin officiel n° 31 du 30 juillet 2020 (programmes cycles 2 et 3 consolidés).
- Eduscol — « Enseigner au cycle 3 », ressources d’accompagnement histoire-géographie et sciences au cycle 3 ; calendrier de mise en œuvre des nouveaux programmes.
