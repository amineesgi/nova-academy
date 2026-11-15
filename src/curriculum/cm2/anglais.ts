import { L, assoc, ecoute, ordre, qcm, skillsOf, tri, txt, vf } from '../authoring';
import { listenGens, pic, v } from '../english-kit';
import { REF } from '../refs';

const S = skillsOf({ level: 'cm2', subject: 'anglais', programRef: REF.cm2Anglais, region: 'english-station' });

const HOBBIES = [v('play football', 'jouer au foot', '⚽'), v('swim', 'nager', '🏊'), v('read', 'lire', '📖'), v('dance', 'danser', '💃'), v('ride a bike', 'faire du vélo', '🚲'), v('play the guitar', 'jouer de la guitare', '🎸'), v('draw', 'dessiner', '🎨'), v('cook', 'cuisiner', '🍳'), v('play video games', 'jouer aux jeux vidéo', '🎮'), v('sing', 'chanter', '🎤')];
const CLOTHES = [v('T-shirt', 'tee-shirt', '👕'), v('trousers', 'pantalon', '👖'), v('dress', 'robe', '👗'), v('shoes', 'chaussures', '👟'), v('hat', 'chapeau', '🎩'), v('coat', 'manteau', '🧥'), v('socks', 'chaussettes', '🧦'), v('scarf', 'écharpe', '🧣'), v('cap', 'casquette', '🧢'), v('gloves', 'gants', '🧤')];
const HOUSE = [v('kitchen', 'cuisine', '🍳'), v('bedroom', 'chambre', '🛏️'), v('bathroom', 'salle de bains', '🛁'), v('living room', 'salon', '🛋️'), v('garden', 'jardin', '🌳'), v('stairs', 'escalier', '🪜'), v('door', 'porte', '🚪'), v('window', 'fenêtre', '🪟')];
const TOWN = [v('school', 'école', '🏫'), v('hospital', 'hôpital', '🏥'), v('bakery', 'boulangerie', '🥖'), v('library', 'bibliothèque', '📚'), v('park', 'parc', '🌳'), v('station', 'gare', '🚉'), v('museum', 'musée', '🏛️'), v('post office', 'bureau de poste', '📮'), v('supermarket', 'supermarché', '🛒'), v('swimming pool', 'piscine', '🏊')];
const DAILY = [v('wake up', 'se réveiller', '⏰'), v('have breakfast', 'prendre le petit-déjeuner', '🥣'), v('brush my teeth', 'me brosser les dents', '🪥'), v('go to school', 'aller à l’école', '🏫'), v('have lunch', 'déjeuner', '🍽️'), v('do my homework', 'faire mes devoirs', '📝'), v('have dinner', 'dîner', '🍝'), v('go to bed', 'aller au lit', '🛏️')];
const FOODS = [v('sandwich', 'sandwich', '🥪'), v('soup', 'soupe', '🍲'), v('pizza', 'pizza', '🍕'), v('rice', 'riz', '🍚'), v('salad', 'salade', '🥗'), v('chips', 'frites', '🍟'), v('tomato', 'tomate', '🍅'), v('strawberry', 'fraise', '🍓')];

export const CM2_VOCAB = { HOBBIES, CLOTHES, HOUSE, TOWN, DAILY, FOODS };

export const cm2Anglais = [
  S({
    id: 'cm2-en-myself',
    domain: 'Parler en continu — se présenter',
    title: 'About me: se présenter en détail',
    diag: true,
    lesson: {
      ...L(
        'Je vais apprendre à me présenter de façon complète en anglais.',
        'Bienvenue à English Station ! Avant chaque voyage, on se présente aux autres explorateurs.',
        ['Name: « My name is… / I’m… »', 'Age: « I’m ten (years old). »', 'Where I live: « I live in Lyon, in France. » — « I’m French. »', 'Birthday: « My birthday is in May. » — Family: « I have got one sister and two brothers. »', 'Questions : What’s your name? How old are you? Where do you live? When is your birthday?'],
        ['Comment dire « J’habite à Lille » ?', 'I live in Lille.'],
        ['« J’habite » = I live.', '« à » + ville = in.', 'I live in Lille.'],
        ['Prépare une petite « carte d’identité » en anglais et lis-la à voix haute comme si tu te présentais à un correspondant.'],
        'My name is… I’m ten. I live in… My birthday is in…',
      ),
      vocab: [v('My name is…', 'Je m’appelle…', '🪪'), v('I live in France.', 'J’habite en France.', '🇫🇷'), v('My birthday is in May.', 'Mon anniversaire est en mai.', '🎂'), v('I have got a brother.', 'J’ai un frère.', '👦')],
    },
    items: [
      ecoute('Where do you live?', ['*Où habites-tu ?', 'Quel âge as-tu ?', 'Comment vas-tu ?', 'Quand est ton anniversaire ?'], '« Where » = où ; « live » = habiter.'),
      ecoute('When is your birthday?', ['*Quand est ton anniversaire ?', 'Où est ton cadeau ?', 'Quel est ton prénom ?', 'Aimes-tu les gâteaux ?'], '« When » = quand ; « birthday » = anniversaire.'),
      qcm('Comment dire « J’ai dix ans » ?', ['*I’m ten.', 'I have ten.', 'I’m ten years.', 'My ten.'], 'On utilise « I’m » + l’âge (+ years old).'),
      qcm('Comment dire « Je suis français(e) » ?', ['*I’m French.', 'I’m France.', 'I live French.', 'I french.'], 'La nationalité prend une majuscule en anglais : French.'),
      ordre('Remets la présentation dans l’ordre.', ['Hello!', 'My name is Adam.', 'I’m eleven.', 'I live in Marseille.'], 'On salue, puis on donne son nom, son âge et sa ville.', 'sequence'),
      txt('Complète : « My birthday is … July. »', 'in', 'On dit « in » devant un mois : in July.', { strictAccents: false }),
    ],
  }),
  S({
    id: 'cm2-en-daily',
    domain: 'Lexique — la vie quotidienne et l’heure',
    title: 'Daily routine and time: la journée et l’heure',
    lesson: {
      ...L(
        'Je vais apprendre à décrire ma journée et à dire l’heure en anglais.',
        'Un explorateur organise bien sa journée. À quelle heure te lèves-tu ?',
        ['« What time is it? » — « It’s seven o’clock. » (7 h pile) ; « It’s half past seven. » (7 h 30) ; « It’s quarter past seven. » (7 h 15) ; « It’s quarter to eight. » (7 h 45).', 'Routine : I wake up, I have breakfast, I brush my teeth, I go to school, I do my homework, I go to bed.', '« at » + heure : I go to bed at nine o’clock.'],
        ['Comment dire « Il est 8 h 30 » ?', 'It’s half past eight.'],
        ['30 minutes = une demi-heure = half.', '« past » = après.', 'It’s half past eight.'],
        ['« past » = après l’heure (côté droit de l’horloge) ; « to » = avant l’heure suivante (côté gauche).'],
        'o’clock, quarter past, half past, quarter to — I wake up at…',
      ),
      vocab: DAILY,
    },
    items: [
      ecoute('It’s half past three.', ['*3 h 30', '3 h 15', '2 h 30', '3 h 45'], '« half past three » = 3 h 30.'),
      ecoute('It’s quarter to five.', ['*4 h 45', '5 h 15', '5 h 45', '4 h 15'], '« quarter to five » = 5 h moins le quart = 4 h 45.'),
      ecoute('I brush my teeth.', ['*Je me brosse les dents.', 'Je prends le petit-déjeuner.', 'Je vais au lit.', 'Je me réveille.'], '« brush my teeth » = me brosser les dents.'),
      ordre('Remets la journée dans l’ordre.', ['I wake up.', 'I have breakfast.', 'I go to school.', 'I have dinner.', 'I go to bed.'], 'Matin, journée, soir.', 'sequence'),
      qcm('Comment dire « Je fais mes devoirs à 17 h » ?', ['*I do my homework at five o’clock.', 'I do my homework in five.', 'I have my homework five.', 'I go homework at five.'], '« at » + heure.'),
    ],
    gens: listenGens(DAILY, 'daily'),
  }),
  S({
    id: 'cm2-en-hobbies',
    domain: 'Lexique — loisirs et sports',
    title: 'Hobbies: loisirs, capacités et goûts',
    lesson: {
      ...L(
        'Je vais apprendre à parler de mes loisirs, de ce que je sais faire et de ce que j’aime.',
        'Le soir, à English Station, chacun raconte ses passions.',
        ['« I like + verbe-ing » : I like swimming. « I don’t like dancing. » « I love reading. » « I hate cooking. »', '« Can » exprime la capacité : I can swim. I can’t (cannot) play the piano. Can you ride a bike? — Yes, I can. / No, I can’t.', '« What do you like doing? » = Qu’aimes-tu faire ?'],
        ['Comment dire « Je sais nager mais je ne sais pas plonger » ?', 'I can swim but I can’t dive.'],
        ['« Je sais » = I can.', '« je ne sais pas » = I can’t.', 'I can swim but I can’t dive.'],
        ['Mime tes loisirs en les disant : « I can dance! » (tu danses), « I can’t fly! » (tu fais semblant de voler).'],
        'I like / love / don’t like + -ing. I can / I can’t.',
      ),
      vocab: HOBBIES,
    },
    items: [
      ecoute('I can ride a bike.', ['*Je sais faire du vélo.', 'J’aime le vélo.', 'Je n’ai pas de vélo.', 'Je répare un vélo.'], '« I can » = je sais / je peux.'),
      ecoute('She can’t swim.', ['*Elle ne sait pas nager.', 'Elle sait nager.', 'Elle aime nager.', 'Il ne sait pas nager.'], '« can’t » = ne sait pas ; « she » = elle.'),
      qcm('Complète : « I like … » (danser)', ['*dancing', 'dance', 'to dancing', 'danced'], 'Après « like », on utilise souvent le verbe + -ing.'),
      qcm('« Can you play the guitar? » Tu sais. Que réponds-tu ?', ['*Yes, I can.', 'Yes, I do.', 'Yes, I am.', 'Yes, I like.'], 'On répond avec le même verbe : can.'),
      assoc('Associe.', [['draw', 'dessiner'], ['sing', 'chanter'], ['cook', 'cuisiner'], ['read', 'lire']], 'Ces verbes servent à parler de ses loisirs.'),
    ],
    gens: listenGens(HOBBIES, 'hob'),
  }),
  S({
    id: 'cm2-en-clothes',
    domain: 'Lexique — vêtements et description',
    title: 'Clothes: les vêtements et la description',
    lesson: {
      ...L(
        'Je vais apprendre à décrire des vêtements et une personne.',
        'Avant l’expédition au pôle, il faut préparer les bons vêtements !',
        ['T-shirt, trousers (pantalon), dress (robe), shoes, hat, coat (manteau), socks, scarf (écharpe), gloves (gants).', '« I’m wearing a red coat. » = Je porte un manteau rouge (en ce moment).', '« He has got blue eyes and short brown hair. » : l’adjectif se place avant le nom.', '« Big / small / long / short / tall (grand de taille) ».'],
        ['Comment dire « Elle porte une robe verte » ?', 'She is wearing a green dress.'],
        ['« Elle porte (maintenant) » = She is wearing.', 'Adjectif avant le nom : a green dress.'],
        ['Décris en anglais ce que tu portes aujourd’hui devant un miroir : « I’m wearing… »'],
        'I’m wearing + couleur + vêtement. L’adjectif avant le nom.',
      ),
      vocab: CLOTHES,
    },
    items: [
      ecoute('I’m wearing a blue scarf.', ['*Je porte une écharpe bleue.', 'J’ai un chapeau bleu.', 'Je porte un pantalon bleu.', 'J’aime le bleu.'], '« scarf » = écharpe.'),
      qcm('Il fait très froid. Que mets-tu ?', ['*a coat and gloves', 'a T-shirt and shorts', 'a cap and sandals', 'a dress only'], 'Coat = manteau ; gloves = gants.'),
      qcm('Comment dire « Il a les cheveux courts » ?', ['*He has got short hair.', 'He has got hair short.', 'He is short hair.', 'He have short hairs.'], 'L’adjectif avant le nom ; « hair » est invariable.'),
      tri('Été ou hiver ?', ['Summer', 'Winter'], [['T-shirt', 0], ['coat', 1], ['cap', 0], ['scarf', 1], ['shorts', 0], ['gloves', 1]], 'On adapte ses vêtements à la saison.'),
    ],
    gens: listenGens(CLOTHES, 'clo'),
  }),
  S({
    id: 'cm2-en-food',
    domain: 'Lexique — nourriture et achats',
    title: 'Food and shopping: repas et achats',
    lesson: {
      ...L(
        'Je vais apprendre à commander un repas et à faire des achats.',
        'Au snack d’English Station, il faut commander en anglais !',
        ['« I’d like a sandwich, please. » = Je voudrais un sandwich, s’il vous plaît.', '« How much is it? » — « It’s three pounds. » (la livre sterling £ est la monnaie du Royaume-Uni).', '« Some » pour une quantité indéterminée : some water, some apples.', 'Breakfast (petit-déjeuner), lunch (déjeuner), dinner (dîner).'],
        ['Comment demander le prix ?', 'How much is it?'],
        ['« How much » = combien.', '« is it » = est-ce.', 'How much is it? = Combien ça coûte ?'],
        ['Joue à la marchande avec un adulte : l’un vend, l’autre achète, tout en anglais !'],
        'I’d like…, please. — How much is it? — It’s … pounds.',
      ),
      vocab: FOODS,
    },
    items: [
      ecoute('How much is it?', ['*Combien ça coûte ?', 'Combien en veux-tu ?', 'Quelle heure est-il ?', 'Où est-ce ?'], 'How much = combien (prix).'),
      ecoute('I’d like some soup, please.', ['*Je voudrais de la soupe, s’il vous plaît.', 'Je n’aime pas la soupe.', 'La soupe est chaude.', 'J’ai fait de la soupe.'], '« I’d like » = je voudrais.'),
      qcm('Comment s’appelle la monnaie du Royaume-Uni ?', ['*the pound (£)', 'the euro', 'the dollar', 'the franc'], 'Au Royaume-Uni, on paie en livres sterling.'),
      assoc('Associe le repas.', [['breakfast', 'petit-déjeuner'], ['lunch', 'déjeuner'], ['dinner', 'dîner']], 'Les trois repas principaux.'),
      ordre('Remets le dialogue au snack dans l’ordre.', ['Hello! Can I help you?', 'Yes, I’d like a pizza, please.', 'Here you are. That’s four pounds.', 'Thank you. Goodbye!'], 'Le vendeur accueille, le client commande, paie et salue.', 'sequence'),
    ],
    gens: listenGens(FOODS, 'food2'),
  }),
  S({
    id: 'cm2-en-house-town',
    domain: 'Lexique — la maison et la ville',
    title: 'House and town: la maison et la ville',
    lesson: {
      ...L(
        'Je vais apprendre à décrire ma maison et ma ville en anglais.',
        'Visite guidée de la maison et du quartier de notre correspondante anglaise !',
        ['Rooms: kitchen, bedroom, bathroom, living room, garden.', 'Town: school, hospital, bakery, library, park, station, museum, supermarket, swimming pool.', '« There is a park. » (il y a un…) / « There are two schools. » (il y a des…).', 'Prépositions de lieu : in (dans), on (sur), under (sous), next to (à côté de), between (entre), behind (derrière), in front of (devant).'],
        ['Comment dire « Il y a une bibliothèque à côté de l’école » ?', 'There is a library next to the school.'],
        ['« Il y a » (singulier) = There is.', '« à côté de » = next to.', 'There is a library next to the school.'],
        ['Dessine le plan de ta maison et légende chaque pièce en anglais.'],
        'There is / There are — in, on, under, next to, between, behind, in front of.',
      ),
      vocab: [...HOUSE, ...TOWN],
    },
    items: [
      ecoute('The cat is under the table.', ['*Le chat est sous la table.', 'Le chat est sur la table.', 'Le chat est à côté de la table.', 'Le chat est derrière la table.'], 'under = sous.'),
      ecoute('There are two bedrooms.', ['*Il y a deux chambres.', 'Il y a une chambre.', 'Il y a deux salles de bains.', 'Il n’y a pas de chambre.'], 'There are = il y a (pluriel).'),
      qcm('Où prépare-t-on les repas ?', ['*in the kitchen', 'in the bedroom', 'in the bathroom', 'in the garden'], 'kitchen = cuisine.'),
      qcm('Complète : « There … a museum in my town. »', ['*is', 'are', 'have', 'be'], 'Un seul musée : There is.'),
      assoc('Associe.', [['behind', 'derrière'], ['in front of', 'devant'], ['between', 'entre'], ['on', 'sur']], 'Les prépositions de lieu.'),
    ],
    gens: listenGens(TOWN, 'town'),
  }),
  S({
    id: 'cm2-en-directions',
    domain: 'Réagir et dialoguer — s’orienter',
    title: 'Directions: demander et indiquer son chemin',
    prereq: ['cm2-en-house-town'],
    d: 2,
    lesson: L(
      'Je vais apprendre à demander et indiquer un chemin en anglais.',
      'Perdu dans Londres ? Il faut savoir demander son chemin !',
      ['« Excuse me, where is the station, please? » / « How can I get to the museum? »', '« Go straight on. » (Va tout droit.) « Turn left. » (Tourne à gauche.) « Turn right. » (Tourne à droite.)', '« Take the first street on the left. » (Prends la première rue à gauche.) « It’s on your right. »'],
      ['Que veut dire « Turn right » ?', 'Tourne à droite.'],
      ['« Turn » = tourne.', '« right » = droite.', 'Turn right = tourne à droite.'],
      ['Retiens : avec la main gauche, ton pouce et ton index forment un L comme Left !'],
      'Go straight on — Turn left — Turn right — It’s on your left/right.',
    ),
    items: [
      ecoute('Turn left.', ['*Tourne à gauche.', 'Tourne à droite.', 'Va tout droit.', 'Arrête-toi.'], 'left = gauche.'),
      ecoute('Go straight on.', ['*Va tout droit.', 'Fais demi-tour.', 'Tourne à droite.', 'Traverse la rue.'], 'straight on = tout droit.'),
      ecoute('The bakery is on your right.', ['*La boulangerie est sur ta droite.', 'La boulangerie est sur ta gauche.', 'La boulangerie est fermée.', 'La boulangerie est loin.'], 'on your right = sur ta droite.'),
      qcm('Comment demander poliment où est la gare ?', ['*Excuse me, where is the station, please?', 'Where station?', 'Give me the station!', 'Station is where you?'], 'On commence par « Excuse me » et on finit par « please ».'),
      ordre('Remets les indications dans l’ordre du trajet : tout droit, puis à gauche, puis c’est à droite.', ['Go straight on.', 'Turn left.', 'It’s on your right.'], 'On suit les indications pas à pas.', 'sequence'),
    ],
  }),
  S({
    id: 'cm2-en-weather-grammar',
    domain: 'Grammaire — questions, affirmatif, négatif',
    title: 'Questions and negatives: poser des questions, dire non',
    prereq: ['cm2-en-myself'],
    d: 2,
    lesson: L(
      'Je vais apprendre à construire des phrases affirmatives, négatives et interrogatives au présent.',
      'Pour bien dialoguer, il faut savoir poser des questions et répondre par la négative.',
      ['Affirmatif : I like tea. She likes tea. (on ajoute -s à la 3e personne : he, she, it).', 'Négatif : I don’t like tea. She doesn’t like tea.', 'Question : Do you like tea? — Yes, I do. / No, I don’t. Does she like tea? — Yes, she does. / No, she doesn’t.', 'Mots interrogatifs : What (quoi), Where (où), When (quand), Who (qui), Why (pourquoi), How (comment).'],
      ['Mets à la forme négative : « He plays tennis. »', 'He doesn’t play tennis.'],
      ['Sujet « He » : 3e personne → doesn’t.', 'Après doesn’t, le verbe perd son -s : play.', 'He doesn’t play tennis.'],
      ['Le -s de la 3e personne « saute » sur does/doesn’t : she plays → does she play? / she doesn’t play.'],
      'don’t / doesn’t ; Do / Does…? ; What, Where, When, Who, Why, How.',
    ),
    items: [
      qcm('Complète : « She … football. » (aimer)', ['*likes', 'like', 'liking', 'to like'], '3e personne du singulier : -s.'),
      qcm('Mets à la forme négative : « I play chess. »', ['*I don’t play chess.', 'I doesn’t play chess.', 'I not play chess.', 'I playn’t chess.'], 'Avec I : don’t.'),
      qcm('Pose la question : « Tu aimes le chocolat ? »', ['*Do you like chocolate?', 'Does you like chocolate?', 'You like chocolate?', 'Like you chocolate?'], 'Avec you : Do you…?'),
      assoc('Associe les mots interrogatifs.', [['Where', 'Où'], ['When', 'Quand'], ['Why', 'Pourquoi'], ['Who', 'Qui']], 'Ils commencent presque tous par « Wh- ».'),
      qcm('« Does your brother like pizza? » — Oui. Que réponds-tu ?', ['*Yes, he does.', 'Yes, he do.', 'Yes, he likes.', 'Yes, he is.'], 'On reprend l’auxiliaire : does.'),
      ecoute('What’s the weather like in London?', ['*Quel temps fait-il à Londres ?', 'Aimes-tu Londres ?', 'Où est Londres ?', 'Quand vas-tu à Londres ?'], '« What’s the weather like? » demande la météo.'),
    ],
  }),
  S({
    id: 'cm2-en-reading',
    domain: 'Lire et comprendre — courts textes',
    title: 'Reading: comprendre un court texte',
    prereq: ['cm2-en-myself'],
    d: 3,
    lesson: L(
      'Je vais apprendre à comprendre un court texte écrit en anglais.',
      'Tu as reçu une lettre de ta correspondante anglaise, Emma !',
      ['Je repère d’abord les mots que je connais et les mots transparents (qui ressemblent au français : family, animal, music).', 'Je cherche des informations précises : qui ? où ? quoi ? quand ?', 'Je ne m’arrête pas sur chaque mot inconnu : le sens général suffit souvent.'],
      ['« Emma lives in York with her family. » Où habite Emma ?', 'À York.'],
      ['Je repère « lives in » = habite à.', 'Le mot suivant est le lieu : York.'],
      ['Surligne mentalement les mots transparents : ils sont comme des ponts entre l’anglais et le français.'],
      'Mots connus + mots transparents + questions qui/où/quoi = compréhension.',
    ),
    items: [
      qcm('Où habite Emma ?', ['*à York', 'à Londres', 'à Paris', 'à Dublin'], '« I live in York ».', { passage: 'Hi! My name is Emma. I’m eleven and I live in York, in England. I have got one brother, Jack, and a cat called Muffin. I love music and I can play the piano. On Saturdays, I go to the swimming pool with my friends. What about you?' }),
      qcm('Comment s’appelle son chat ?', ['*Muffin', 'Jack', 'York', 'Emma'], '« a cat called Muffin ».', { passage: 'Hi! My name is Emma. I’m eleven and I live in York, in England. I have got one brother, Jack, and a cat called Muffin. I love music and I can play the piano. On Saturdays, I go to the swimming pool with my friends. What about you?' }),
      vf('Emma sait jouer du piano.', true, '« I can play the piano ».', { passage: 'Hi! My name is Emma. I’m eleven and I live in York, in England. I have got one brother, Jack, and a cat called Muffin. I love music and I can play the piano. On Saturdays, I go to the swimming pool with my friends. What about you?' }),
      qcm('Que fait Emma le samedi ?', ['*elle va à la piscine', 'elle joue au foot', 'elle va à l’école', 'elle cuisine'], '« On Saturdays, I go to the swimming pool ».', { passage: 'Hi! My name is Emma. I’m eleven and I live in York, in England. I have got one brother, Jack, and a cat called Muffin. I love music and I can play the piano. On Saturdays, I go to the swimming pool with my friends. What about you?' }),
      tri('Mot transparent ou non ?', ['Transparent', 'Pas transparent'], [['music', 0], ['brother', 1], ['family', 0], ['Saturday', 1], ['animal', 0], ['friend', 1]], 'Un mot transparent ressemble au mot français.'),
      txt('Traduis le mot anglais « Saturday ».', 'samedi', 'Saturday = samedi.'),
    ],
  }),
];

void pic;
