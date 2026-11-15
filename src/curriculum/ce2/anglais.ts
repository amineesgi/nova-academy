import { L, assoc, ecoute, qcm, skillsOf, tri, txt, vf, ordre } from '../authoring';
import { listenGens, pic, v } from '../english-kit';
import { REF } from '../refs';

const S = skillsOf({ level: 'ce2', subject: 'anglais', programRef: REF.ce2Anglais, region: 'vallee-anglais' });

const GREET = [v('Hello', 'Bonjour / Salut', '👋'), v('Good morning', 'Bonjour (le matin)', '🌅'), v('Good night', 'Bonne nuit', '🌙'), v('Goodbye', 'Au revoir', '🙋'), v('Thank you', 'Merci', '🙏'), v('Please', 'S’il te plaît', '🤲')];
const COLOURS = [v('red', 'rouge', '🟥'), v('blue', 'bleu', '🟦'), v('green', 'vert', '🟩'), v('yellow', 'jaune', '🟨'), v('orange', 'orange', '🟧'), v('purple', 'violet', '🟪'), v('black', 'noir', '⬛'), v('white', 'blanc', '⬜'), v('brown', 'marron', '🟫'), v('pink', 'rose', '🌸')];
const NUMBERS = [v('one', 'un (1)', '1️⃣'), v('two', 'deux (2)', '2️⃣'), v('three', 'trois (3)', '3️⃣'), v('four', 'quatre (4)', '4️⃣'), v('five', 'cinq (5)', '5️⃣'), v('six', 'six (6)', '6️⃣'), v('seven', 'sept (7)', '7️⃣'), v('eight', 'huit (8)', '8️⃣'), v('nine', 'neuf (9)', '9️⃣'), v('ten', 'dix (10)', '🔟'), v('twelve', 'douze (12)', '🕛'), v('twenty', 'vingt (20)', '🎲')];
const ANIMALS = [v('dog', 'chien', '🐶'), v('cat', 'chat', '🐱'), v('bird', 'oiseau', '🐦'), v('fish', 'poisson', '🐟'), v('rabbit', 'lapin', '🐰'), v('horse', 'cheval', '🐴'), v('cow', 'vache', '🐮'), v('pig', 'cochon', '🐷'), v('lion', 'lion', '🦁'), v('elephant', 'éléphant', '🐘'), v('monkey', 'singe', '🐵'), v('mouse', 'souris', '🐭')];
const FAMILY = [v('mother', 'mère', '👩'), v('father', 'père', '👨'), v('sister', 'sœur', '👧'), v('brother', 'frère', '👦'), v('grandmother', 'grand-mère', '👵'), v('grandfather', 'grand-père', '👴'), v('baby', 'bébé', '👶'), v('family', 'famille', '👪')];
const SCHOOL = [v('pen', 'stylo', '🖊️'), v('pencil', 'crayon', '✏️'), v('book', 'livre', '📘'), v('ruler', 'règle', '📏'), v('scissors', 'ciseaux', '✂️'), v('schoolbag', 'cartable', '🎒'), v('teacher', 'enseignant', '🧑‍🏫'), v('chair', 'chaise', '🪑'), v('computer', 'ordinateur', '💻'), v('glue', 'colle', '🧴')];
const FOOD = [v('apple', 'pomme', '🍎'), v('banana', 'banane', '🍌'), v('bread', 'pain', '🍞'), v('cheese', 'fromage', '🧀'), v('milk', 'lait', '🥛'), v('water', 'eau', '💧'), v('cake', 'gâteau', '🍰'), v('egg', 'œuf', '🥚'), v('carrot', 'carotte', '🥕'), v('orange juice', 'jus d’orange', '🧃'), v('ice cream', 'glace', '🍦'), v('chicken', 'poulet', '🍗')];
const WEATHER = [v('It’s sunny', 'Il fait soleil', '☀️'), v('It’s raining', 'Il pleut', '🌧️'), v('It’s snowing', 'Il neige', '❄️'), v('It’s windy', 'Il y a du vent', '🌬️'), v('It’s cloudy', 'C’est nuageux', '☁️'), v('It’s hot', 'Il fait chaud', '🥵'), v('It’s cold', 'Il fait froid', '🥶')];
const DAYS = [v('Monday', 'lundi', '1'), v('Tuesday', 'mardi', '2'), v('Wednesday', 'mercredi', '3'), v('Thursday', 'jeudi', '4'), v('Friday', 'vendredi', '5'), v('Saturday', 'samedi', '6'), v('Sunday', 'dimanche', '7')];
const ALL_LISTEN = [...ANIMALS, ...FOOD, ...COLOURS];

export const CE2_VOCAB = { GREET, COLOURS, NUMBERS, ANIMALS, FAMILY, SCHOOL, FOOD, WEATHER, DAYS, ALL_LISTEN };

export const ce2Anglais = [
  S({
    id: 'ce2-en-hello',
    domain: 'Réagir et dialoguer — salutations et présentation',
    title: 'Hello! Se saluer et se présenter',
    diag: true,
    lesson: {
      ...L(
        'Je vais apprendre à saluer quelqu’un et à me présenter en anglais.',
        'Bienvenue dans la Vallée de l’Anglais ! Ici, tout le monde se dit « Hello! ».',
        ['« Hello! » ou « Hi! » veut dire « Bonjour, salut ». « Goodbye! » ou « Bye! » veut dire « Au revoir ».', 'Pour dire son prénom : « My name is Lou. » ou « I’m Lou. »', 'Pour demander le prénom : « What’s your name? »', 'Pour dire son âge : « I’m eight. » (J’ai huit ans.)'],
        ['Comment répondre à « What’s your name? » ?', '« My name is … » + ton prénom.'],
        ['Écoute : « Hello! What’s your name? »', 'Réponds : « Hello! My name is Sam. »', 'Ajoute ton âge : « I’m eight. »'],
        ['En anglais, on ne dit pas « j’ai huit ans » mais « je suis huit » : I’m eight !'],
        'Hello / Goodbye — My name is… — I’m … (âge).',
      ),
      vocab: GREET,
    },
    items: [
      ecoute('Hello', ['*Bonjour', 'Au revoir', 'Merci', 'Bonne nuit'], '« Hello » veut dire « Bonjour ».'),
      ecoute('Goodbye', ['*Au revoir', 'Bonjour', 'S’il te plaît', 'Merci'], '« Goodbye » veut dire « Au revoir ».'),
      qcm('Quelqu’un te demande « What’s your name? ». Que réponds-tu ?', ['*My name is Lou.', 'I’m fine.', 'Goodbye!', 'Thank you.'], '« What’s your name? » = « Comment t’appelles-tu ? »'),
      ecoute('How old are you?', ['*Quel âge as-tu ?', 'Comment vas-tu ?', 'Où habites-tu ?', 'Comment t’appelles-tu ?'], '« How old are you? » = « Quel âge as-tu ? »'),
      qcm('Comment dit-on « J’ai neuf ans » ?', ['*I’m nine.', 'I have nine.', 'My name is nine.', 'I’m fine.'], 'En anglais, on utilise « I’m » pour l’âge : I’m nine.'),
      assoc('Associe chaque expression à sa traduction.', [['Thank you', 'Merci'], ['Please', 'S’il te plaît'], ['Good night', 'Bonne nuit'], ['Good morning', 'Bonjour (le matin)']], 'Les formules de politesse sont très utilisées en anglais.'),
      ecoute('How are you?', ['*Comment vas-tu ?', 'Quel âge as-tu ?', 'Qui es-tu ?', 'Où vas-tu ?'], '« How are you? » = « Comment vas-tu ? ». On répond « I’m fine, thank you! »'),
      qcm('Que réponds-tu à « How are you? » si tu vas bien ?', ['*I’m fine, thank you!', 'I’m eight.', 'My name is Tom.', 'Goodbye!'], '« I’m fine » = « Je vais bien ».'),
    ],
  }),
  S({
    id: 'ce2-en-colours',
    domain: 'Lexique — les couleurs',
    title: 'Colours: les couleurs',
    lesson: {
      ...L(
        'Je vais apprendre le nom des couleurs en anglais.',
        'Un arc-en-ciel apparaît au-dessus de la Vallée : quelles couleurs vois-tu ?',
        ['red = rouge, blue = bleu, green = vert, yellow = jaune.', 'orange = orange, purple = violet, pink = rose, brown = marron, black = noir, white = blanc.', 'En anglais, la couleur se place AVANT le nom : a red apple (une pomme rouge).'],
        ['Comment dit-on « un chat noir » ?', 'a black cat'],
        ['Je trouve la couleur : noir = black.', 'Je trouve l’animal : chat = cat.', 'La couleur vient avant : a black cat.'],
        ['Écoute chaque couleur et répète-la en montrant un objet de cette couleur autour de toi !'],
        'La couleur se place avant le nom : a blue bird.',
      ),
      vocab: COLOURS,
    },
    items: [
      ecoute('red', ['*rouge', 'vert', 'bleu', 'jaune'], 'red = rouge.', { choiceVisuals: [pic(COLOURS[0]!), pic(COLOURS[2]!), pic(COLOURS[1]!), pic(COLOURS[3]!)] }),
      qcm('Comment dit-on « vert » en anglais ?', ['*green', 'grey', 'red', 'brown'], 'vert = green.'),
      qcm('Comment dit-on « une pomme rouge » ?', ['*a red apple', 'an apple red', 'a apple rouge', 'red a apple'], 'La couleur se place avant le nom.'),
      assoc('Associe chaque couleur à sa traduction.', [['yellow', 'jaune'], ['purple', 'violet'], ['white', 'blanc'], ['pink', 'rose']], 'Retiens bien purple (violet) : il ressemble peu au français !'),
      ecoute('blue', ['*bleu', 'noir', 'marron', 'blanc'], 'blue = bleu.'),
      txt('Écris en anglais : noir', 'black', 'noir = black.', { strictAccents: false }),
    ],
    gens: listenGens(COLOURS, 'col'),
  }),
  S({
    id: 'ce2-en-numbers',
    domain: 'Lexique — les nombres',
    title: 'Numbers: compter jusqu’à 20',
    lesson: {
      ...L(
        'Je vais apprendre à compter de 1 à 20 en anglais.',
        'Dans la Vallée, les lucioles s’allument une par une : one, two, three…',
        ['one, two, three, four, five, six, seven, eight, nine, ten.', 'eleven (11), twelve (12), thirteen (13), fourteen (14), fifteen (15).', 'sixteen (16), seventeen (17), eighteen (18), nineteen (19), twenty (20).', 'De 13 à 19, les nombres finissent par « -teen ».'],
        ['Comment dit-on 15 ?', 'fifteen'],
        ['15 est entre 13 et 19 : il finit par -teen.', 'Le début vient de five : fif-.', 'fifteen.'],
        ['Compte en anglais en montant les marches d’un escalier, ou en sautant à la corde !'],
        '13 à 19 se terminent par -teen ; 20 = twenty.',
      ),
      vocab: NUMBERS,
    },
    items: [
      ecoute('seven', ['*7', '1', '11', '17'], 'seven = 7.'),
      ecoute('twelve', ['*12', '2', '20', '10'], 'twelve = 12.'),
      ecoute('fifteen', ['*15', '50', '5', '14'], 'fifteen = 15.'),
      qcm('Comment dit-on 3 en anglais ?', ['*three', 'tree', 'free', 'thirteen'], '3 = three.'),
      ordre('Range les nombres du plus petit au plus grand.', ['two', 'five', 'nine', 'twenty'], '2, 5, 9, 20.', 'sequence'),
      txt('Écris en chiffres : « eight + two = ? »', '10', 'eight (8) + two (2) = ten (10).'),
      ecoute('nineteen', ['*19', '9', '90', '29'], 'nineteen = 19.'),
    ],
    gens: listenGens(NUMBERS, 'num'),
  }),
  S({
    id: 'ce2-en-animals',
    domain: 'Lexique — les animaux',
    title: 'Animals: les animaux',
    lesson: {
      ...L(
        'Je vais apprendre le nom des animaux et dire quel animal j’aime.',
        'La ferme et le zoo de la Vallée sont ouverts : allons dire bonjour aux animaux !',
        ['dog (chien), cat (chat), bird (oiseau), fish (poisson), rabbit (lapin), mouse (souris).', 'horse (cheval), cow (vache), pig (cochon), lion, elephant, monkey (singe).', 'Pour dire ce que j’aime : « I like cats. » Ce que je n’aime pas : « I don’t like spiders. »', 'Pour parler de mon animal : « I have got a dog. » (J’ai un chien.)'],
        ['Comment dit-on « J’aime les chiens » ?', 'I like dogs.'],
        ['« J’aime » = I like.', '« les chiens » = dogs (avec un s).', 'I like dogs.'],
        ['Imite le cri de l’animal en disant son nom : « dog – woof! », « cat – meow! », « cow – moo! ».'],
        'I like… / I don’t like… / I have got a…',
      ),
      vocab: ANIMALS,
    },
    items: [
      ecoute('rabbit', ['*lapin', 'chat', 'cheval', 'souris'], 'rabbit = lapin.', { choiceVisuals: [pic(ANIMALS[4]!), pic(ANIMALS[1]!), pic(ANIMALS[5]!), pic(ANIMALS[11]!)] }),
      qcm('Comment dit-on « cochon » ?', ['*pig', 'dog', 'cow', 'big'], 'cochon = pig.', { visual: pic(ANIMALS[7]!) }),
      ecoute('I like cats.', ['*J’aime les chats.', 'Je n’aime pas les chats.', 'J’ai un chat.', 'Le chat est noir.'], '« I like » = « j’aime ».'),
      ecoute('I don’t like spiders.', ['*Je n’aime pas les araignées.', 'J’aime les araignées.', 'J’ai une araignée.', 'Les araignées sont petites.'], '« I don’t like » = « je n’aime pas ».'),
      assoc('Associe chaque animal à sa traduction.', [['horse', 'cheval'], ['bird', 'oiseau'], ['monkey', 'singe'], ['mouse', 'souris']], 'Répète chaque mot à voix haute.'),
      qcm('Comment dit-on « J’ai un chien » ?', ['*I have got a dog.', 'I like a dog.', 'I am a dog.', 'I have got a cat.'], '« I have got » = « j’ai ».'),
    ],
    gens: listenGens(ANIMALS, 'ani'),
  }),
  S({
    id: 'ce2-en-family',
    domain: 'Lexique — la famille',
    title: 'Family: la famille',
    lesson: {
      ...L(
        'Je vais apprendre à présenter ma famille en anglais.',
        'Voici l’album photo de la famille Smith !',
        ['mother / mum (mère, maman), father / dad (père, papa).', 'sister (sœur), brother (frère), baby (bébé).', 'grandmother / granny (grand-mère), grandfather / grandpa (grand-père).', 'Pour présenter : « This is my sister. » (Voici ma sœur.)'],
        ['Comment dit-on « Voici mon frère » ?', 'This is my brother.'],
        ['« Voici » = This is.', '« mon » = my ; « frère » = brother.', 'This is my brother.'],
        ['Dessine ton arbre de famille et écris le mot anglais sous chaque personne.'],
        'This is my mother / father / sister / brother.',
      ),
      vocab: FAMILY,
    },
    items: [
      ecoute('sister', ['*sœur', 'frère', 'mère', 'bébé'], 'sister = sœur.'),
      ecoute('grandfather', ['*grand-père', 'père', 'grand-mère', 'frère'], 'grandfather = grand-père.'),
      qcm('Comment dit-on « Voici ma mère » ?', ['*This is my mother.', 'This is my father.', 'My name is mother.', 'I am mother.'], 'This is = voici ; my mother = ma mère.'),
      assoc('Associe.', [['brother', 'frère'], ['father', 'père'], ['baby', 'bébé'], ['grandmother', 'grand-mère']], 'Les mots de la famille anglaise.'),
      vf('« Dad » veut dire « papa ».', true, 'Dad = papa ; Mum = maman.'),
    ],
    gens: listenGens(FAMILY, 'fam'),
  }),
  S({
    id: 'ce2-en-school',
    domain: 'Lexique — l’école et les objets',
    title: 'At school: à l’école',
    lesson: {
      ...L(
        'Je vais apprendre le nom des objets de l’école et des consignes de classe.',
        'Ouvre ta trousse : que contient-elle en anglais ?',
        ['pen (stylo), pencil (crayon), ruler (règle), scissors (ciseaux), glue (colle), book (livre), schoolbag (cartable).', 'Consignes de classe : « Listen! » (Écoute !), « Look! » (Regarde !), « Sit down! » (Assieds-toi !), « Stand up! » (Lève-toi !).', 'Pour demander : « Can I have a pencil, please? » (Est-ce que je peux avoir un crayon, s’il te plaît ?)'],
        ['Que veut dire « Stand up! » ?', 'Lève-toi !'],
        ['« stand » = être debout ; « up » = en haut.', 'Stand up = lève-toi !'],
        ['Joue à « Jacques a dit » en anglais : « Simon says: stand up! »'],
        'Listen! Look! Sit down! Stand up! — Can I have…, please?',
      ),
      vocab: SCHOOL,
    },
    items: [
      ecoute('pencil', ['*crayon', 'stylo', 'règle', 'livre'], 'pencil = crayon (à papier).'),
      ecoute('Sit down!', ['*Assieds-toi !', 'Lève-toi !', 'Écoute !', 'Regarde !'], 'Sit down = assieds-toi.'),
      ecoute('Listen!', ['*Écoute !', 'Regarde !', 'Écris !', 'Chante !'], 'Listen = écoute.'),
      qcm('Comment demander poliment une règle ?', ['*Can I have a ruler, please?', 'Give ruler!', 'I am a ruler.', 'Ruler, goodbye!'], '« Can I have …, please? » est la formule polie.'),
      assoc('Associe.', [['scissors', 'ciseaux'], ['book', 'livre'], ['schoolbag', 'cartable'], ['glue', 'colle']], 'Tous ces objets sont dans ta classe.'),
    ],
    gens: listenGens(SCHOOL, 'sch'),
  }),
  S({
    id: 'ce2-en-food',
    domain: 'Lexique — l’alimentation',
    title: 'Food: la nourriture',
    lesson: {
      ...L(
        'Je vais apprendre le nom des aliments et dire ce que j’aime manger.',
        'C’est l’heure du goûter dans la Vallée ! Qu’y a-t-il sur la table ?',
        ['apple (pomme), banana (banane), bread (pain), cheese (fromage), egg (œuf), cake (gâteau).', 'milk (lait), water (eau), orange juice (jus d’orange).', '« I’m hungry » = j’ai faim ; « I’m thirsty » = j’ai soif.', '« I like bananas. » / « I don’t like cheese. » / « Yummy! » (Miam !)'],
        ['Comment dit-on « J’ai soif » ?', 'I’m thirsty.'],
        ['En anglais, on dit « je suis assoiffé » : I am thirsty.', 'I’m thirsty.'],
        ['Fais ta liste de courses en anglais : apples, bread, milk…'],
        'I’m hungry / I’m thirsty — I like… / I don’t like…',
      ),
      vocab: FOOD,
    },
    items: [
      ecoute('cheese', ['*fromage', 'pain', 'œuf', 'gâteau'], 'cheese = fromage.'),
      ecoute('I’m hungry.', ['*J’ai faim.', 'J’ai soif.', 'J’ai chaud.', 'Je suis fatigué.'], 'hungry = qui a faim.'),
      qcm('Comment dit-on « eau » ?', ['*water', 'milk', 'juice', 'wind'], 'eau = water.', { visual: pic(FOOD[5]!) }),
      tri('Classe : boisson ou nourriture ?', ['Drinks (boissons)', 'Food (nourriture)'], [['milk', 0], ['bread', 1], ['water', 0], ['apple', 1], ['orange juice', 0], ['egg', 1]], 'On boit milk, water, juice ; on mange bread, apple, egg.'),
      ecoute('I don’t like carrots.', ['*Je n’aime pas les carottes.', 'J’aime les carottes.', 'Je mange des carottes.', 'Les carottes sont orange.'], '« I don’t like » = « je n’aime pas ».'),
    ],
    gens: listenGens(FOOD, 'food'),
  }),
  S({
    id: 'ce2-en-weather',
    domain: 'Lexique — météo, jours et mois',
    title: 'Weather and days: la météo et les jours',
    lesson: {
      ...L(
        'Je vais apprendre à dire le temps qu’il fait et les jours de la semaine.',
        'Chaque matin, la mascotte regarde le ciel : « What’s the weather like today? »',
        ['« What’s the weather like? » = « Quel temps fait-il ? »', 'It’s sunny (soleil), It’s raining (il pleut), It’s snowing (il neige), It’s windy (vent), It’s cloudy (nuageux), It’s hot (chaud), It’s cold (froid).', 'Les jours : Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday. Ils prennent une majuscule en anglais !', 'Quelques mois : January, February, March, April, May, June, July, August, September, October, November, December.'],
        ['Comment dit-on « Il pleut » ?', 'It’s raining.'],
        ['« Il » = It ; « pleut » = is raining.', 'It’s raining.'],
        ['Chaque jour, regarde par la fenêtre et dis la météo en anglais. Note le jour : « Today is Monday. »'],
        'What’s the weather like? — It’s sunny / raining… — Today is Monday.',
      ),
      vocab: [...WEATHER, ...DAYS],
    },
    items: [
      ecoute('It’s snowing.', ['*Il neige.', 'Il pleut.', 'Il fait chaud.', 'Il y a du vent.'], 'snowing = il neige.', { choiceVisuals: [pic(WEATHER[2]!), pic(WEATHER[1]!), pic(WEATHER[5]!), pic(WEATHER[3]!)] }),
      ecoute('Wednesday', ['*mercredi', 'lundi', 'vendredi', 'dimanche'], 'Wednesday = mercredi.'),
      ordre('Remets les jours de la semaine dans l’ordre.', ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], 'Lundi, mardi, mercredi, jeudi, vendredi.', 'sequence'),
      qcm('Il y a du soleil. Que dis-tu ?', ['*It’s sunny.', 'It’s raining.', 'It’s cold.', 'It’s cloudy.'], 'sunny = ensoleillé.', { visual: pic(WEATHER[0]!) }),
      vf('En anglais, les jours de la semaine prennent une majuscule.', true, 'On écrit Monday, Tuesday… avec une majuscule.'),
      ecoute('December', ['*décembre', 'novembre', 'septembre', 'dimanche'], 'December = décembre : c’est le mois de Noël.'),
      assoc('Associe.', [['It’s hot', 'Il fait chaud'], ['It’s cold', 'Il fait froid'], ['It’s windy', 'Il y a du vent'], ['It’s cloudy', 'C’est nuageux']], 'Toutes les phrases commencent par It’s.'),
    ],
    gens: listenGens(WEATHER, 'wea'),
  }),
  S({
    id: 'ce2-en-dialogues',
    domain: 'Comprendre l’oral — courtes interactions',
    title: 'Little dialogues: petits dialogues',
    prereq: ['ce2-en-hello'],
    d: 2,
    lesson: L(
      'Je vais apprendre à comprendre et à jouer de petits dialogues.',
      'Deux amis se rencontrent sur le chemin de la Vallée. Écoute leur conversation !',
      ['Un dialogue est une conversation : chacun parle à son tour.', 'Questions utiles : What’s your name? / How old are you? / How are you? / What colour is it? / Do you like…?', 'Réponses courtes : Yes, I do. / No, I don’t. / I’m fine. / It’s blue.'],
      ['« Do you like pizza? » — Tu aimes la pizza. Que réponds-tu ?', 'Yes, I do!'],
      ['La question commence par « Do you like » : « Est-ce que tu aimes ».', 'Si oui : Yes, I do. Si non : No, I don’t.'],
      ['Joue le dialogue avec un adulte ou un peluche : chacun son tour, avec une vraie voix de personnage !'],
      'Do you like…? — Yes, I do. / No, I don’t.',
    ),
    items: [
      ecoute('Do you like chocolate?', ['*Est-ce que tu aimes le chocolat ?', 'J’aime le chocolat.', 'Où est le chocolat ?', 'Le chocolat est marron.'], '« Do you like … ? » = « Est-ce que tu aimes … ? »'),
      qcm('« Do you like apples? » Tu n’aimes pas les pommes. Que réponds-tu ?', ['*No, I don’t.', 'Yes, I do.', 'I’m fine.', 'Goodbye.'], 'No, I don’t = Non.'),
      ecoute('What colour is it?', ['*De quelle couleur est-ce ?', 'Quel âge as-tu ?', 'Où est-il ?', 'Quelle heure est-il ?'], 'colour = couleur.'),
      ordre('Remets le dialogue dans l’ordre.', ['Hello! What’s your name?', 'Hi! My name is Sam.', 'How old are you, Sam?', 'I’m nine. Goodbye!'], 'On salue, on se présente, on pose une question, on répond, on dit au revoir.', 'sequence'),
      ecoute('Can I have some water, please?', ['*Est-ce que je peux avoir de l’eau, s’il te plaît ?', 'Je n’aime pas l’eau.', 'L’eau est froide.', 'Il pleut.'], '« Can I have …, please? » sert à demander poliment.'),
      qcm('Ton ami dit « Thank you! ». Que réponds-tu ?', ['*You’re welcome!', 'Goodbye!', 'I’m eight.', 'No, I don’t.'], '« You’re welcome » = « De rien ».'),
    ],
  }),
];

export const ce2EnglishPool = ALL_LISTEN;
void txt;
