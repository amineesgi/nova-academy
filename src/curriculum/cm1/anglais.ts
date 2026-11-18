import { L, assoc, ecoute, ordre, qcm, skillsOf, tri, txt, vf } from '../authoring';
import { listenGens, pic, v } from '../english-kit';
import { REF } from '../refs';

const S = skillsOf({ level: 'cm1', subject: 'anglais', programRef: REF.cm1Anglais, region: 'port-langues' });

const FEELINGS = [v('happy', 'content', '😊'), v('sad', 'triste', '😢'), v('tired', 'fatigué', '😴'), v('angry', 'en colère', '😠'), v('scared', 'effrayé', '😨'), v('hungry', 'affamé', '🍽️'), v('thirsty', 'assoiffé', '🥤'), v('ill', 'malade', '🤒')];
const NUMBERS = [v('thirteen', 'treize (13)', '🎈'), v('twenty', 'vingt (20)', '🎯'), v('thirty', 'trente (30)', '📅'), v('forty', 'quarante (40)', '🧮'), v('fifty', 'cinquante (50)', '🪙'), v('sixty', 'soixante (60)', '⏱️'), v('seventy', 'soixante-dix (70)', '🎳'), v('eighty', 'quatre-vingts (80)', '🎲'), v('ninety', 'quatre-vingt-dix (90)', '🏁'), v('one hundred', 'cent (100)', '💯')];
const MONTHS = [v('January', 'janvier', '❄️'), v('March', 'mars', '🌱'), v('May', 'mai', '🌷'), v('July', 'juillet', '🏖️'), v('September', 'septembre', '🎒'), v('October', 'octobre', '🎃'), v('December', 'décembre', '🎄')];
const PETS = [v('dog', 'chien', '🐶'), v('cat', 'chat', '🐱'), v('hamster', 'hamster', '🐹'), v('rabbit', 'lapin', '🐰'), v('parrot', 'perroquet', '🦜'), v('goldfish', 'poisson rouge', '🐠'), v('turtle', 'tortue', '🐢'), v('horse', 'cheval', '🐴'), v('snake', 'serpent', '🐍'), v('spider', 'araignée', '🕷️')];
const FAMILY = [v('mum', 'maman', '👩'), v('dad', 'papa', '👨'), v('sister', 'sœur', '👧'), v('brother', 'frère', '👦'), v('grandma', 'mamie', '👵'), v('grandpa', 'papi', '👴'), v('aunt', 'tante', '👩‍🦰'), v('uncle', 'oncle', '🧔'), v('cousin', 'cousin(e)', '🧒')];
const SCHOOL = [v('maths', 'mathématiques', '➗'), v('English', 'anglais', '🇬🇧'), v('art', 'arts plastiques', '🎨'), v('music', 'musique', '🎵'), v('sport', 'sport', '⚽'), v('science', 'sciences', '🔬'), v('history', 'histoire', '🏰'), v('geography', 'géographie', '🗺️')];
const HOBBIES = [v('swimming', 'la natation', '🏊'), v('cycling', 'le vélo', '🚴'), v('dancing', 'la danse', '💃'), v('reading', 'la lecture', '📚'), v('drawing', 'le dessin', '✏️'), v('skating', 'le patin', '⛸️'), v('fishing', 'la pêche', '🎣'), v('playing chess', 'les échecs', '♟️')];
const FOOD = [v('pancakes', 'crêpes', '🥞'), v('sandwich', 'sandwich', '🥪'), v('salad', 'salade', '🥗'), v('chips', 'frites', '🍟'), v('cookie', 'biscuit', '🍪'), v('grapes', 'raisin', '🍇'), v('pear', 'poire', '🍐'), v('yoghurt', 'yaourt', '🥣'), v('tea', 'thé', '🍵'), v('pizza', 'pizza', '🍕')];
const WEATHER = [v('sunny', 'ensoleillé', '☀️'), v('rainy', 'pluvieux', '🌧️'), v('snowy', 'neigeux', '❄️'), v('windy', 'venteux', '🌬️'), v('foggy', 'brumeux', '🌫️'), v('stormy', 'orageux', '⛈️'), v('spring', 'printemps', '🌸'), v('summer', 'été', '🌞'), v('autumn', 'automne', '🍂'), v('winter', 'hiver', '⛄')];

export const cm1Anglais = [
  S({
    id: 'cm1-en-hello',
    domain: 'Parler en continu — se présenter',
    title: 'Hello! Me présenter et dire comment je vais',
    diag: true,
    lesson: {
      ...L(
        'Je vais apprendre à me présenter et à dire comment je me sens.',
        'Bienvenue au Port des Langues ! Les bateaux viennent du monde entier : présentons-nous.',
        ['« Hello! My name is Noa. I’m nine. I live in Lyon. »', '« How are you? » — « I’m fine, thank you. » / « I’m tired. » / « I’m happy! »', 'Questions : What’s your name? How old are you? Where do you live?', 'Les adjectifs ne prennent jamais de « s » en anglais : We are happy.'],
        ['Comment dire « Je suis fatigué » ?', 'I’m tired.'],
        ['« Je suis » = I am / I’m.', '« fatigué » = tired.', 'I’m tired.'],
        ['Fais une grimace pour chaque émotion en la disant en anglais : happy, sad, angry, scared !'],
        'My name is… I’m (âge). I live in… How are you? I’m fine / happy / tired.',
      ),
      vocab: FEELINGS,
    },
    items: [
      ecoute('How are you?', ['*Comment vas-tu ?', 'Quel âge as-tu ?', 'Où habites-tu ?', 'Comment t’appelles-tu ?'], '« How are you? » = Comment vas-tu ?'),
      ecoute('I’m scared.', ['*J’ai peur.', 'Je suis content.', 'J’ai faim.', 'Je suis malade.'], 'scared = effrayé.', { choiceVisuals: [pic(FEELINGS[4]!), pic(FEELINGS[0]!), pic(FEELINGS[5]!), pic(FEELINGS[7]!)] }),
      qcm('Comment dire « J’habite à Nantes » ?', ['*I live in Nantes.', 'I am Nantes.', 'My name is Nantes.', 'I live Nantes in.'], 'live in + ville.'),
      ordre('Remets la présentation dans l’ordre.', ['Hello!', 'My name is Lou.', 'I’m nine.', 'I live in Paris.'], 'On salue, puis nom, âge, ville.', 'sequence'),
      vf('En anglais, on dit « I’m ten » pour « J’ai dix ans ».', true, 'On utilise le verbe être : I am ten.'),
    ],
    gens: listenGens(FEELINGS, 'feel'),
  }),
  S({
    id: 'cm1-en-numbers-dates',
    domain: 'Lexique — nombres, mois et dates',
    title: 'Numbers to 100, months and birthdays',
    lesson: {
      ...L(
        'Je vais apprendre à compter jusqu’à 100 et à dire la date de mon anniversaire.',
        'Au port, on compte les caisses et on note les dates d’arrivée des bateaux.',
        ['Les dizaines : twenty, thirty, forty, fifty, sixty, seventy, eighty, ninety, one hundred.', 'On les combine avec un tiret : twenty-five (25), sixty-three (63).', 'Les mois prennent une majuscule : January, February, March…', '« When is your birthday? » — « My birthday is in May. »'],
        ['Comment dit-on 47 ?', 'forty-seven'],
        ['40 = forty (sans « u » !).', '7 = seven.', 'forty-seven.'],
        ['Attention aux pièges : thirteen (13) / thirty (30). Le « teen » est long, le « ty » est court.'],
        'Dizaine-unité avec un tiret : forty-seven. Mois avec majuscule.',
      ),
      vocab: [...NUMBERS, ...MONTHS],
    },
    items: [
      ecoute('thirty', ['*30', '13', '3', '33'], 'thirty = 30 ; thirteen = 13.'),
      ecoute('fifty-five', ['*55', '15', '50', '45'], 'fifty-five = 55.'),
      qcm('Comment écrit-on 40 en anglais ?', ['*forty', 'fourty', 'fourteen', 'fortty'], 'Piège : forty s’écrit sans « u ».'),
      ecoute('My birthday is in October.', ['*Mon anniversaire est en octobre.', 'Mon anniversaire est en août.', 'J’ai huit ans.', 'C’est l’automne.'], 'October = octobre.'),
      ordre('Range ces mois dans l’ordre de l’année.', ['January', 'March', 'July', 'December'], 'Janvier, mars, juillet, décembre.', 'sequence'),
      txt('Écris en chiffres : « eighty-two »', '82', 'eighty = 80, two = 2.'),
    ],
    gens: listenGens(NUMBERS, 'num'),
  }),
  S({
    id: 'cm1-en-family-pets',
    domain: 'Lexique — la famille et les animaux',
    title: 'Family and pets',
    lesson: {
      ...L(
        'Je vais apprendre à présenter ma famille et mes animaux.',
        'Un marin te montre la photo de sa famille et de son perroquet !',
        ['mum, dad, sister, brother, grandma, grandpa, aunt (tante), uncle (oncle), cousin.', '« I have got a brother. » (J’ai un frère.) / « I haven’t got a sister. » (Je n’ai pas de sœur.)', '« Have you got a pet? » — « Yes, I have. I’ve got a hamster. » / « No, I haven’t. »', 'Le possessif : my sister’s cat = le chat de ma sœur.'],
        ['Comment dire « Je n’ai pas d’animal » ?', 'I haven’t got a pet.'],
        ['« J’ai » = I have got.', 'Négatif : I haven’t got.', 'I haven’t got a pet.'],
        ['Dessine ton arbre de famille et écris le mot anglais sous chaque personne.'],
        'I have got… / I haven’t got… — Have you got…? Yes, I have. / No, I haven’t.',
      ),
      vocab: [...FAMILY, ...PETS],
    },
    items: [
      ecoute('I have got a parrot.', ['*J’ai un perroquet.', 'J’aime les perroquets.', 'Je n’ai pas de perroquet.', 'Le perroquet est vert.'], '« I have got » = j’ai.'),
      ecoute('uncle', ['*oncle', 'tante', 'cousin', 'papi'], 'uncle = oncle ; aunt = tante.'),
      qcm('« Have you got a dog? » — Non. Que réponds-tu ?', ['*No, I haven’t.', 'No, I don’t.', 'No, I am not.', 'No, I can’t.'], 'On reprend « have » : No, I haven’t.'),
      assoc('Associe.', [['grandma', 'mamie'], ['aunt', 'tante'], ['brother', 'frère'], ['cousin', 'cousin(e)']], 'Les membres de la famille.'),
      qcm('Que veut dire « my brother’s bike » ?', ['*le vélo de mon frère', 'mon frère et son vélo', 'le frère de mon vélo', 'mes frères à vélo'], '’s indique la possession.'),
    ],
    gens: listenGens(PETS, 'pets'),
  }),
  S({
    id: 'cm1-en-school',
    domain: 'Lexique — l’école et l’emploi du temps',
    title: 'At school: subjects and timetable',
    lesson: {
      ...L(
        'Je vais apprendre le nom des matières et parler de mon emploi du temps.',
        'Les apprentis du port ont aussi une école : quelles matières préfèrent-ils ?',
        ['maths, English, French, art, music, sport, science, history, geography.', '« My favourite subject is art. »', '« On Monday, I have got maths and music. »', 'Les jours prennent une majuscule : Monday, Tuesday…'],
        ['Comment dire « Ma matière préférée est la musique » ?', 'My favourite subject is music.'],
        ['« Ma matière préférée » = my favourite subject.', '« est » = is.', 'My favourite subject is music.'],
        ['Fais ton emploi du temps en anglais et colle-le dans ta chambre !'],
        'My favourite subject is… — On Monday, I have got…',
      ),
      vocab: SCHOOL,
    },
    items: [
      ecoute('history', ['*histoire', 'géographie', 'sciences', 'musique'], 'history = histoire.'),
      ecoute('My favourite subject is science.', ['*Ma matière préférée est les sciences.', 'Je n’aime pas les sciences.', 'J’ai sciences lundi.', 'Les sciences sont difficiles.'], 'favourite = préféré.'),
      qcm('Quel jour vient après « Wednesday » ?', ['*Thursday', 'Tuesday', 'Friday', 'Monday'], 'mercredi → jeudi : Thursday.'),
      tri('Matière ou jour ?', ['Subject', 'Day'], [['art', 0], ['Friday', 1], ['music', 0], ['Sunday', 1], ['geography', 0], ['Tuesday', 1]], 'Les jours prennent une majuscule.'),
    ],
    gens: listenGens(SCHOOL, 'sch'),
  }),
  S({
    id: 'cm1-en-hobbies',
    domain: 'Lexique — loisirs et capacités',
    title: 'Hobbies: I like… / I can…',
    lesson: {
      ...L(
        'Je vais apprendre à dire ce que j’aime faire et ce que je sais faire.',
        'Sur le quai, chacun raconte son loisir préféré.',
        ['« I like swimming. » (verbe + -ing) / « I don’t like fishing. »', '« I can ride a bike. » / « I can’t swim. »', '« Do you like dancing? » — « Yes, I do. » / « No, I don’t. »', '« Can you skate? » — « Yes, I can. » / « No, I can’t. »'],
        ['Comment dire « Je sais nager » ?', 'I can swim.'],
        ['« Je sais / je peux » = I can.', '« nager » = swim.', 'I can swim.'],
        ['Mime chaque loisir en le disant : swimming, dancing, drawing… Ton adulte devine !'],
        'I like + -ing. I can / I can’t. Do you…? Can you…?',
      ),
      vocab: HOBBIES,
    },
    items: [
      ecoute('I don’t like fishing.', ['*Je n’aime pas la pêche.', 'J’aime la pêche.', 'Je sais pêcher.', 'Je vais pêcher.'], '« I don’t like » = je n’aime pas.'),
      ecoute('Can you skate?', ['*Sais-tu faire du patin ?', 'Aimes-tu le patin ?', 'Où est ton patin ?', 'Je fais du patin.'], '« Can you…? » = sais-tu… ?'),
      qcm('Complète : « I like … » (danser)', ['*dancing', 'dance', 'danced', 'to dancing'], 'Après « like », verbe + -ing.'),
      qcm('« Do you like reading? » — Oui. Que réponds-tu ?', ['*Yes, I do.', 'Yes, I can.', 'Yes, I am.', 'Yes, I like.'], 'Question avec « Do » : réponse « Yes, I do ».'),
      vf('« I can’t swim » veut dire « Je ne sais pas nager ».', true, 'can’t = cannot = ne peut pas / ne sait pas.'),
    ],
    gens: listenGens(HOBBIES, 'hob'),
  }),
  S({
    id: 'cm1-en-food',
    domain: 'Lexique — nourriture et goûts',
    title: 'Food: breakfast, lunch and likes',
    lesson: {
      ...L(
        'Je vais apprendre à parler des repas et à commander poliment.',
        'Au café du port, il faut commander en anglais.',
        ['breakfast (petit-déjeuner), lunch (déjeuner), dinner (dîner).', '« For breakfast, I eat pancakes. »', '« Can I have a sandwich, please? » — « Here you are! »', '« I love pizza! » / « I hate salad. »'],
        ['Comment demander poliment un biscuit ?', 'Can I have a cookie, please?'],
        ['« Est-ce que je peux avoir » = Can I have.', '« un biscuit » = a cookie.', 'Can I have a cookie, please?'],
        ['Joue au serveur et au client avec un adulte, uniquement en anglais.'],
        'Can I have…, please? — Here you are! — For breakfast, I eat…',
      ),
      vocab: FOOD,
    },
    items: [
      ecoute('Can I have some grapes, please?', ['*Est-ce que je peux avoir du raisin, s’il vous plaît ?', 'J’aime le raisin.', 'Le raisin est violet.', 'Je n’ai pas de raisin.'], '« Can I have…, please? » : demande polie.'),
      ecoute('pear', ['*poire', 'pomme', 'pêche', 'raisin'], 'pear = poire.', { choiceVisuals: [pic(FOOD[6]!), { kind: 'picture', symbol: '🍎', label: 'pomme' }, { kind: 'picture', symbol: '🍑', label: 'pêche' }, pic(FOOD[5]!)] }),
      assoc('Associe chaque repas.', [['breakfast', 'petit-déjeuner'], ['lunch', 'déjeuner'], ['dinner', 'dîner']], 'Les trois repas de la journée.'),
      qcm('Le serveur te donne ton assiette. Que dit-il ?', ['*Here you are!', 'Thank you!', 'Goodbye!', 'How old are you?'], '« Here you are » = voilà.'),
    ],
    gens: listenGens(FOOD, 'food'),
  }),
  S({
    id: 'cm1-en-weather',
    domain: 'Lexique — météo et saisons',
    title: 'Weather and seasons',
    lesson: {
      ...L(
        'Je vais apprendre à décrire la météo et les saisons.',
        'Avant de partir en mer, le capitaine écoute la météo.',
        ['« What’s the weather like? » — « It’s sunny / rainy / snowy / windy / foggy / stormy. »', 'Les saisons : spring, summer, autumn, winter.', '« In winter, it’s cold and snowy. »', '« Today is Monday, the 3rd of May. »'],
        ['Comment dire « En été, il fait chaud » ?', 'In summer, it’s hot.'],
        ['« En été » = in summer.', '« il fait chaud » = it’s hot.', 'In summer, it’s hot.'],
        ['Chaque matin, regarde par la fenêtre et présente la météo comme à la télévision !'],
        'It’s sunny / rainy… — spring, summer, autumn, winter.',
      ),
      vocab: WEATHER,
    },
    items: [
      ecoute('It’s foggy.', ['*Il y a du brouillard.', 'Il y a de l’orage.', 'Il neige.', 'Il fait soleil.'], 'foggy = brumeux.', { choiceVisuals: [pic(WEATHER[4]!), pic(WEATHER[5]!), pic(WEATHER[2]!), pic(WEATHER[0]!)] }),
      ecoute('autumn', ['*automne', 'été', 'hiver', 'printemps'], 'autumn = automne.'),
      ordre('Remets les saisons dans l’ordre en commençant par le printemps.', ['spring', 'summer', 'autumn', 'winter'], 'Printemps, été, automne, hiver.', 'sequence'),
      qcm('Il y a de l’orage. Que dis-tu ?', ['*It’s stormy.', 'It’s sunny.', 'It’s snowy.', 'It’s foggy.'], 'stormy = orageux.'),
    ],
    gens: listenGens(WEATHER, 'wea'),
  }),
  S({
    id: 'cm1-en-dialogues',
    domain: 'Réagir et dialoguer — comprendre un texte court',
    title: 'Little dialogues and reading',
    prereq: ['cm1-en-hello'],
    d: 2,
    lesson: L(
      'Je vais apprendre à comprendre un petit dialogue et un court texte en anglais.',
      'Une lettre est arrivée par bateau : elle est écrite en anglais !',
      ['Je repère les mots connus et les mots transparents (animal, family, music…).', 'Je cherche les informations : qui ? quel âge ? où ? qu’aime-t-il ?', 'Dans un dialogue, chacun parle à son tour : question puis réponse.'],
      ['« I’m Sam. I’m ten. I’ve got two sisters. » Combien de sœurs a Sam ?', 'Deux (two sisters).'],
      ['Je repère « two » = 2.', '« sisters » = sœurs.', 'Sam a deux sœurs.'],
      ['Lis le texte une fois sans t’arrêter, puis une deuxième fois en cherchant les réponses.'],
      'Mots connus + mots transparents + questions qui/où/quoi.',
    ),
    items: [
      qcm('Quel âge a Mia ?', ['*neuf ans', 'dix ans', 'onze ans', 'huit ans'], '« I’m nine ».', { passage: 'Hello! I’m Mia. I’m nine and I live in Bristol, in England. I’ve got a little brother called Tom and a goldfish called Bubbles. I love drawing and I can play the piano. My favourite subject is art. What about you?' }),
      qcm('Comment s’appelle son poisson ?', ['*Bubbles', 'Tom', 'Bristol', 'Mia'], '« a goldfish called Bubbles ».', { passage: 'Hello! I’m Mia. I’m nine and I live in Bristol, in England. I’ve got a little brother called Tom and a goldfish called Bubbles. I love drawing and I can play the piano. My favourite subject is art. What about you?' }),
      vf('Mia sait jouer du piano.', true, '« I can play the piano ».', { passage: 'Hello! I’m Mia. I’m nine and I live in Bristol, in England. I’ve got a little brother called Tom and a goldfish called Bubbles. I love drawing and I can play the piano. My favourite subject is art. What about you?' }),
      ordre('Remets le dialogue dans l’ordre.', ['Hi! What’s your name?', 'I’m Leo. And you?', 'I’m Zoe. How old are you?', 'I’m ten. Nice to meet you!'], 'Question, réponse, question, réponse.', 'sequence'),
      ecoute('Nice to meet you!', ['*Ravi de te rencontrer !', 'Au revoir !', 'Bon anniversaire !', 'Bonne nuit !'], '« Nice to meet you » se dit quand on rencontre quelqu’un.'),
      tri('Mot transparent ou non ?', ['Transparent', 'Pas transparent'], [['piano', 0], ['brother', 1], ['family', 0], ['goldfish', 1], ['music', 0], ['little', 1]], 'Un mot transparent ressemble au mot français.'),
    ],
  }),
];
