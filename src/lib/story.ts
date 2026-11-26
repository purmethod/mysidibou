/**
 * mysidibou: the story timeline on the homepage.
 *
 * One line runs down the page. First the history of the village, then the
 * mission. Each station has a date, a short title, one or two sentences and
 * optionally a round photo. Longer mission texts come from the main
 * dictionary (i18n.tsx) and open behind "read more".
 */
import type { Dict, Lang } from "./i18n";

export type StationKey =
  | "cleaning"
  | "people"
  | "locals"
  | "entrance"
  | "unesco";

export type Station = {
  date: string;
  title?: string;
  text: string;
  photo?: string;
  alt?: string;
  /** Upcoming dates get an open dot on the line. */
  future?: boolean;
  /** Longer text from the main dictionary, behind "read more". */
  more?: (dict: Dict) => string;
  /** Extra content rendered by the component. */
  extra?: "role" | "commitments" | "ticket";
  /** A quote shown under the text, with its author. */
  quote?: { text: string; by: string };
};

type StoryCopy = {
  intro: { line: string; scroll: string };
  chapters: { village: string; mission: string };
  readMore: string;
  readLess: string;
  howLink: string;
  credit: string;
  history: Station[];
  mission: Station[];
  /** Stories from the mission: shown after the line, not on it. */
  posts: Station[];
  nav: { story: string; how: string; explore: string; exploreLines: [string, string] };
};

const P = "/assets/story/";

const photos = {
  carthage: { photo: `${P}carthage-1894.webp`, alt: "Ruins of a temple at Carthage, a hand-coloured photograph by William Henry Jackson, 1894" },
  sidi1900: { photo: `${P}sidi-1900.webp`, alt: "Sidi Bou Saïd on its hill, an old photograph from around 1900" },
  sidi1894: { photo: `${P}sidi-1894.webp`, alt: "A house in Sidi Bou Saïd in 1894, a hand-coloured photograph by William Henry Jackson" },
  erlanger: { photo: `${P}erlanger.webp`, alt: "Self-portrait of Baron Rodolphe d'Erlanger" },
  klee: { photo: `${P}klee-1914.webp`, alt: "Paul Klee, St. Germain near Tunis, 1914" },
  door: { photo: `${P}sidi-door.webp`, alt: "A blue studded door in a carved white marble frame" },
  roofs: { photo: `${P}sidi-roofs.webp`, alt: "The white houses of Sidi Bou Saïd above the Gulf of Tunis" },
  tunis1943: { photo: `${P}tunis-1943.webp`, alt: "Tunis in 1943, a photograph by Nick Parrino" },
  sea: { photo: `${P}sidi-sea.webp`, alt: "The Gulf of Tunis seen from Sidi Bou Saïd" },
  hero: { photo: `${P}hero.webp`, alt: "A street in Sidi Bou Saïd with white walls and blue doors" },
  cleaning: { photo: `${P}cleaning.webp`, alt: "Cleaning a street in Sidi Bou Saïd" },
  students: { photo: `${P}students.webp`, alt: "Architecture students measuring and drawing a street in Sidi Bou Saïd" },
  flowerSeller: { photo: `${P}flower-seller.webp`, alt: "A jasmine seller in Sidi Bou Saïd" },
  gate: { photo: `${P}flower-gate.webp`, alt: "The flower gate at the entrance of the old village" },
  drawing: { photo: `${P}drawing-sidi-1949.webp`, alt: "Sidi Bou Saïd, a drawing by Victor Lundy, 1949" },
  lighthouse: { photo: "https://commons.wikimedia.org/wiki/Special:FilePath/The_Light_house_of_Sidi_Boussaid.jpg?width=640", alt: "The lighthouse of Sidi Bou Saïd" },
  palace: { photo: "https://commons.wikimedia.org/wiki/Special:FilePath/BaronErlangerHouse.JPG?width=640", alt: "The palace Ennejma Ezzahra of Baron d'Erlanger" },
  palaceGarden: { photo: "https://commons.wikimedia.org/wiki/Special:FilePath/Jardin_perse_Palais_Ennejma_Ezzahra_Sidi_Bousaid.jpg?width=640", alt: "The garden of the palace Ennejma Ezzahra" },
  palaceInside: { photo: "https://commons.wikimedia.org/wiki/Special:FilePath/Inside_Baron_d%27Erlanger_Palace_in_Sidi_Bou_Said%2C_Tunisia.jpg?width=640", alt: "Inside the palace of Baron d'Erlanger" },
  bourguiba: { photo: "https://commons.wikimedia.org/wiki/Special:FilePath/Flag_of_Tunisia.svg?width=640", alt: "The flag of Tunisia" },
  antonine: { photo: "https://commons.wikimedia.org/wiki/Special:FilePath/Antonine_Baths.jpg?width=640", alt: "The Antonine Baths of Carthage" },
  revolution: { photo: "https://commons.wikimedia.org/wiki/Special:FilePath/Tunisia_Unrest_-_VOA_-_Tunis_14_Jan_2011_%283%29.jpg?width=640", alt: "Protesters in Tunis on 14 January 2011" },
  mausoleum: { photo: "https://commons.wikimedia.org/wiki/Special:FilePath/Sidi_Bousaid_Mausoleum_01.JPG?width=640", alt: "The mausoleum of the saint in Sidi Bou Saïd" },
  aly: { photo: "/assets/team-ali.jpg", alt: "Aly Cherif, World Heritage initiator" },
  paul: { photo: `${P}paul-2026-students.webp`, alt: "Paul Brinkmann with students in a café in Sidi Bou Saïd" },
  paul2025: { photo: `${P}paul-2025.webp`, alt: "Paul Brinkmann in Sidi Bou Saïd, June 2025" },
  historic: { photo: `${P}historic.webp`, alt: "Sidi Bou Saïd in an old photograph" },
  blueWorld: { photo: `${P}blue-world.webp`, alt: "A blue heart with the map of the world" },
};

const more = {
  cleaning: (d: Dict) => d.cleaning.body,
  people: (d: Dict) => d.people.body2,
  locals: (d: Dict) => d.locals.body,
  entrance: (d: Dict) => d.entrance.body,
  unesco: (d: Dict) => d.unesco.body,
};

const en: StoryCopy = {
  intro: { line: "A village and its story.", scroll: "Scroll to discover" },
  chapters: { village: "The village", mission: "Our mission" },
  readMore: "Read more",
  readLess: "Read less",
  howLink: "How does it work?",
  credit:
    "Pictures: Library of Congress, no known restrictions: William Henry Jackson, 1894 · a postcard from around 1900 · Nick Parrino, Office of War Information, 1943 · Victor Lundy, 1949. Paul Klee, St. Germain near Tunis, 1914, Centre Pompidou, public domain. Self-portrait of Rodolphe d'Erlanger, photo Issam Barhoumi, CC BY-SA 4.0. Wikimedia Commons: Issam Barhoumi, CC BY-SA 4.0 · Smailtn, CC0 · Citizen59, CC BY-SA 3.0 · Bernard Gagnon, CC BY-SA 3.0 · VOA, L. Bryant, public domain · Emna Mizouni, CC BY-SA 3.0 · Lila Tretikov, CC BY-SA 4.0.",
  nav: { story: "story", how: "how it works", explore: "Explore Sidi Bou Said", exploreLines: ["Explore", "Sidi Bou Said"] },
  history: [
    { date: "Antiquity", text: "From the cape, the mountain of the lighthouse, Jebel el-Manar, Punic and Roman ships are guided along the coast.", ...photos.carthage },
    { date: "11th century", text: "Watchtowers and fire towers are built on the cape to guard the Gulf of Tunis." },
    { date: "1231", text: "The Sufi saint Abu Saïd al-Baji, who taught on the hill, is buried here. The village grows around his tomb and later takes his name.", ...photos.sidi1900 },
    { date: "18th and 19th century", text: "The beys of Tunis and families from the city build summer residences close to the saint's tomb.", ...photos.sidi1894 },
    { date: "1860", text: "A tower of about ten metres becomes the lighthouse of the cape, with a flashing light.", ...photos.lighthouse },
    { date: "1893", text: "A decree of the bey makes Sidi Bou Saïd a municipality, one of the oldest on the coast north of Tunis." },
    { date: "1912", text: "Baron Rodolphe d'Erlanger begins his palace, Ennejma Ezzahra. It takes ten years to build.", ...photos.erlanger },
    { date: "1914", text: "Paul Klee, August Macke and Louis Moilliet paint in the village. Macke paints the café on the square, one of the oldest pictures of the village.", ...photos.klee },
    { date: "1915", text: "A decree, pushed by Baron d'Erlanger, protects the village: white walls, blue doors, nothing built out of place. It is one of the first heritage protection laws in Tunisia.", ...photos.door },
    { date: "1920s and 1930s", text: "Blue and white becomes the rule for every house. Writers such as André Gide find a retreat here.", ...photos.roofs },
    { date: "1932", text: "D'Erlanger dies. His archive of Arab music stays in the palace.", ...photos.palace },
    { date: "1942 and 1943", text: "The Second World War reaches Tunis. German and Italian troops hold the city from November 1942 until the Allies enter in May 1943.", ...photos.tunis1943 },
    { date: "Late 1940s", text: "Painters found the École de Tunis. Yahia Turki, Ammar Farhat and others paint the life of the country, far from the orientalist gaze.", ...photos.drawing },
    { date: "March 1956", text: "Tunisia becomes independent.", ...photos.bourguiba },
    { date: "1966 to 1968", text: "The philosopher Michel Foucault lives in Sidi Bou Saïd, teaches in Tunis and writes much of The Archaeology of Knowledge here." },
    { date: "1979", text: "The archaeological site of Carthage, the landscape around the village, becomes World Heritage.", ...photos.antonine },
    { date: "1985", text: "A decree makes Carthage and Sidi Bou Saïd a national archaeological park and sets areas where nothing may be built." },
    { date: "1992", text: "The state, owner of the palace since the late 1980s, opens it as the Centre for Arab and Mediterranean Music.", ...photos.palaceGarden },
    { date: "January 2011", text: "The Tunisian revolution. President Ben Ali, whose palace stands on the hill of Sidi Bou Saïd, flees the country.", ...photos.revolution },
    { date: "January 2013", text: "Arsonists set fire to the saint's mausoleum. Residents march in protest, and UNESCO calls for the protection of Tunisia's heritage.", ...photos.mausoleum },
    { date: "May 2023", text: "D'Erlanger's music archive enters UNESCO's Memory of the World Register.", ...photos.palaceInside },
    { date: "April 2024", text: "The village enters Tunisia's Tentative List for World Heritage." },
    { date: "February 2025", text: "Tunisia submits the nomination: Village of Sidi Bou Saïd, hub of cultural and spiritual inspiration in the Mediterranean." },
    { date: "June 2025", text: "Paul Brinkmann visits Sidi Bou Saïd for the first time. From then on, the village does not let him go." },
    { date: "January 2026", text: "Close to 300 mm of rain in two days. The clay hillside cracks, and eight buildings are evacuated." },
    { date: "January 2026", text: "Paul Brinkmann comes back and falls in love with the village. Together with students, he begins the work to protect it.", ...photos.paul },
    { date: "25 July 2026", title: "World Heritage.", text: "At its 48th session in Busan, UNESCO inscribes the village of Sidi Bou Saïd on the World Heritage List. The nomination was initiated by Aly Cherif.", ...photos.aly, more: more.unesco },
  ],
  mission: [
    { date: "2026", title: "We are architects. We take responsibility.", text: "Architects and students for Sidi Bou Saïd. We work on Tunisia's report to UNESCO.", ...photos.hero, extra: "role" },
    { date: "October 2026", text: "Tunisia's commission for major projects approves the works to secure the hillside." },
    { date: "1 December 2027", text: "Tunisia's report to UNESCO is due: landslide studies, a map of the cracks, emergency plans and a tourism strategy.", future: true },
    { date: "2028", text: "The World Heritage Committee reviews the report at its 50th session.", future: true },
    { date: "2526", text: "We believe in a blue world without plastic, without pollution, without war. Many cultures, no walls between them: every people keeps its culture, its faith and its identity, and lives with the others in respect. We believe in peace.", quote: { text: "Our greatest achievement as humankind will not be reaching Mars. It will be finding peace on Earth.", by: "Paul Brinkmann" }, ...photos.blueWorld, future: true },
  ],
  posts: [
    { date: "Every day", title: "The cleanest and most beautiful village in the world.", text: "No plastic on the streets. Not a single cigarette butt.", ...photos.cleaning, extra: "commitments", more: more.cleaning },
    { date: "Every generation", title: "The next generation takes responsibility.", text: "Architecture students from ENAU work with the people of the village.", ...photos.students, more: more.people },
    { date: "All year", title: "Strong local life.", text: "Flower sellers, cafés, craftsmen and families are the heart of the village.", ...photos.flowerSeller, more: more.locals },
    { date: "The entrance", title: "Let nature build the entrance.", text: "A flower gate where the old village begins. Every visit starts here.", ...photos.gate, more: more.entrance },
  ],
};

const fr: StoryCopy = {
  intro: { line: "Un village et son histoire.", scroll: "Faites défiler pour découvrir" },
  chapters: { village: "Le village", mission: "Notre mission" },
  readMore: "Lire la suite",
  readLess: "Réduire",
  howLink: "Comment ça marche ?",
  credit:
    "Images : Library of Congress, sans restriction connue : William Henry Jackson, 1894 · une carte postale vers 1900 · Nick Parrino, Office of War Information, 1943 · Victor Lundy, 1949. Paul Klee, Saint-Germain près de Tunis, 1914, Centre Pompidou, domaine public. Autoportrait de Rodolphe d'Erlanger, photo Issam Barhoumi, CC BY-SA 4.0. Wikimedia Commons : Issam Barhoumi, CC BY-SA 4.0 · Smailtn, CC0 · Citizen59, CC BY-SA 3.0 · Bernard Gagnon, CC BY-SA 3.0 · VOA, L. Bryant, domaine public · Emna Mizouni, CC BY-SA 3.0 · Lila Tretikov, CC BY-SA 4.0.",
  nav: { story: "histoire", how: "fonctionnement", explore: "Explorer Sidi Bou Saïd", exploreLines: ["Explorer", "Sidi Bou Saïd"] },
  history: [
    { date: "Antiquité", text: "Depuis le cap, la montagne du phare, Jebel el-Manar, on guide les navires puniques et romains le long de la côte.", ...photos.carthage },
    { date: "XIe siècle", text: "Des tours de guet et des tours à feu sont construites sur le cap pour surveiller le golfe de Tunis." },
    { date: "1231", text: "Le saint soufi Abou Saïd al-Baji, qui enseignait sur la colline, y est enterré. Le village grandit autour de sa tombe et prend plus tard son nom.", ...photos.sidi1900 },
    { date: "XVIIIe et XIXe siècles", text: "Les beys de Tunis et des familles de la ville construisent des résidences d'été près de la tombe du saint.", ...photos.sidi1894 },
    { date: "1860", text: "Une tour d'une dizaine de mètres devient le phare du cap, avec un feu à éclats.", ...photos.lighthouse },
    { date: "1893", text: "Un décret du bey fait de Sidi Bou Saïd une commune, l'une des plus anciennes de la côte au nord de Tunis." },
    { date: "1912", text: "Le baron Rodolphe d'Erlanger commence son palais, Ennejma Ezzahra. Sa construction dure dix ans.", ...photos.erlanger },
    { date: "1914", text: "Paul Klee, August Macke et Louis Moilliet peignent dans le village. Macke peint le café de la place, l'une des plus anciennes images du village.", ...photos.klee },
    { date: "1915", text: "Un décret, voulu par le baron d'Erlanger, protège le village : murs blancs, portes bleues, rien de construit hors de propos. C'est l'une des premières lois de protection du patrimoine en Tunisie.", ...photos.door },
    { date: "Années 1920 et 1930", text: "Le bleu et le blanc deviennent la règle pour chaque maison. Des écrivains comme André Gide y trouvent une retraite.", ...photos.roofs },
    { date: "1932", text: "D'Erlanger meurt. Ses archives de musique arabe restent au palais.", ...photos.palace },
    { date: "1942 et 1943", text: "La Seconde Guerre mondiale atteint Tunis. Les troupes allemandes et italiennes tiennent la ville de novembre 1942 jusqu'à l'entrée des Alliés en mai 1943.", ...photos.tunis1943 },
    { date: "Fin des années 1940", text: "Des peintres fondent l'École de Tunis. Yahia Turki, Ammar Farhat et d'autres peignent la vie du pays, loin du regard orientaliste.", ...photos.drawing },
    { date: "Mars 1956", text: "La Tunisie devient indépendante.", ...photos.bourguiba },
    { date: "1966 à 1968", text: "Le philosophe Michel Foucault vit à Sidi Bou Saïd, enseigne à Tunis et y écrit une grande partie de L'Archéologie du savoir." },
    { date: "1979", text: "Le site archéologique de Carthage, le paysage autour du village, devient patrimoine mondial.", ...photos.antonine },
    { date: "1985", text: "Un décret fait de Carthage et de Sidi Bou Saïd un parc archéologique national et fixe des zones où rien ne peut être construit." },
    { date: "1992", text: "L'État, propriétaire du palais depuis la fin des années 1980, l'ouvre comme Centre des musiques arabes et méditerranéennes.", ...photos.palaceGarden },
    { date: "Janvier 2011", text: "La révolution tunisienne. Le président Ben Ali, dont le palais se dresse sur la colline de Sidi Bou Saïd, fuit le pays.", ...photos.revolution },
    { date: "Janvier 2013", text: "Des incendiaires mettent le feu au mausolée du saint. Les habitants manifestent, et l'UNESCO appelle à protéger le patrimoine tunisien.", ...photos.mausoleum },
    { date: "Mai 2023", text: "Les archives musicales de d'Erlanger entrent au registre Mémoire du monde de l'UNESCO.", ...photos.palaceInside },
    { date: "Avril 2024", text: "Le village entre sur la liste indicative de la Tunisie pour le patrimoine mondial." },
    { date: "Février 2025", text: "La Tunisie dépose la candidature : Village de Sidi Bou Saïd, hub d'inspiration culturelle et spirituelle en Méditerranée." },
    { date: "Juin 2025", text: "Première visite de Paul Brinkmann. Depuis, le village ne le quitte plus." },
    { date: "Janvier 2026", text: "Près de 300 mm de pluie en deux jours. La colline d'argile se fissure et huit bâtiments sont évacués." },
    { date: "Janvier 2026", text: "Paul Brinkmann revient et tombe amoureux du village. Avec des étudiants, il commence le travail pour le protéger.", ...photos.paul },
    { date: "25 juillet 2026", title: "Patrimoine mondial.", text: "Lors de sa 48e session à Busan, l'UNESCO inscrit le village de Sidi Bou Saïd sur la Liste du patrimoine mondial. La candidature a été initiée par Aly Cherif.", ...photos.aly, more: more.unesco },
  ],
  mission: [
    { date: "2026", title: "Nous sommes architectes. Nous prenons nos responsabilités.", text: "Des architectes et des étudiants pour Sidi Bou Saïd. Nous travaillons au rapport de la Tunisie à l'UNESCO.", ...photos.hero, extra: "role" },
    { date: "Octobre 2026", text: "La commission tunisienne des grands projets approuve les travaux de sécurisation de la colline." },
    { date: "1er décembre 2027", text: "Le rapport de la Tunisie à l'UNESCO est attendu : études des glissements, carte des fissures, plans d'urgence et stratégie touristique.", future: true },
    { date: "2028", text: "Le Comité du patrimoine mondial examine le rapport lors de sa 50e session.", future: true },
    { date: "2526", text: "Nous croyons en un monde bleu, sans plastique, sans pollution, sans guerre. Des cultures multiples, sans murs entre elles : chaque peuple garde sa culture, sa foi et son identité, et vit avec les autres dans le respect. Nous croyons en la paix.", quote: { text: "Notre plus grande réussite en tant qu'humanité ne sera pas d'atteindre Mars. Ce sera de trouver la paix sur Terre.", by: "Paul Brinkmann" }, ...photos.blueWorld, future: true },
  ],
  posts: [
    { date: "Chaque jour", title: "Le village le plus propre et le plus beau du monde.", text: "Pas de plastique dans les rues. Pas un seul mégot.", ...photos.cleaning, extra: "commitments", more: more.cleaning },
    { date: "Chaque génération", title: "La nouvelle génération prend ses responsabilités.", text: "Les étudiants en architecture de l'ENAU travaillent avec les habitants du village.", ...photos.students, more: more.people },
    { date: "Toute l'année", title: "Une vie locale forte.", text: "Vendeurs de fleurs, cafés, artisans et familles sont le cœur du village.", ...photos.flowerSeller, more: more.locals },
    { date: "L'entrée", title: "Laisser la nature construire l'entrée.", text: "Une porte de fleurs là où commence le vieux village. Chaque visite commence ici.", ...photos.gate, more: more.entrance },
  ],
};

const de: StoryCopy = {
  intro: { line: "Ein Dorf und seine Geschichte.", scroll: "Scrollen und entdecken" },
  chapters: { village: "Das Dorf", mission: "Unsere Mission" },
  readMore: "Weiterlesen",
  readLess: "Weniger",
  howLink: "Wie funktioniert's?",
  credit:
    "Bilder: Library of Congress, keine bekannten Einschränkungen: William Henry Jackson, 1894 · eine Postkarte um 1900 · Nick Parrino, Office of War Information, 1943 · Victor Lundy, 1949. Paul Klee, St. Germain bei Tunis, 1914, Centre Pompidou, gemeinfrei. Selbstporträt von Rodolphe d'Erlanger, Foto Issam Barhoumi, CC BY-SA 4.0. Wikimedia Commons: Issam Barhoumi, CC BY-SA 4.0 · Smailtn, CC0 · Citizen59, CC BY-SA 3.0 · Bernard Gagnon, CC BY-SA 3.0 · VOA, L. Bryant, gemeinfrei · Emna Mizouni, CC BY-SA 3.0 · Lila Tretikov, CC BY-SA 4.0.",
  nav: { story: "Geschichte", how: "So funktioniert's", explore: "Sidi Bou Said entdecken", exploreLines: ["Entdecke", "Sidi Bou Said"] },
  history: [
    { date: "Antike", text: "Vom Kap, dem Berg des Leuchtturms, Jebel el-Manar, werden punische und römische Schiffe entlang der Küste geleitet.", ...photos.carthage },
    { date: "11. Jahrhundert", text: "Auf dem Kap entstehen Wachtürme und Feuertürme, die den Golf von Tunis bewachen." },
    { date: "1231", text: "Der Sufi-Heilige Abu Saïd al-Baji, der auf dem Hügel lehrte, wird hier begraben. Das Dorf wächst um sein Grab und trägt später seinen Namen.", ...photos.sidi1900 },
    { date: "18. und 19. Jahrhundert", text: "Die Beys von Tunis und Familien aus der Stadt bauen Sommerresidenzen nahe dem Grab des Heiligen.", ...photos.sidi1894 },
    { date: "1860", text: "Ein etwa zehn Meter hoher Turm wird zum Leuchtturm des Kaps, mit blinkendem Feuer.", ...photos.lighthouse },
    { date: "1893", text: "Ein Dekret des Beys macht Sidi Bou Saïd zur Gemeinde, einer der ältesten an der Küste nördlich von Tunis." },
    { date: "1912", text: "Baron Rodolphe d'Erlanger beginnt seinen Palast Ennejma Ezzahra. Der Bau dauert zehn Jahre.", ...photos.erlanger },
    { date: "1914", text: "Paul Klee, August Macke und Louis Moilliet malen im Dorf. Macke malt das Café am Platz, eines der ältesten Bilder des Dorfes.", ...photos.klee },
    { date: "1915", text: "Ein Dekret, auf Betreiben von Baron d'Erlanger, schützt das Dorf: weiße Mauern, blaue Türen, nichts, was aus der Reihe fällt. Es ist eines der ersten Denkmalschutzgesetze Tunesiens.", ...photos.door },
    { date: "1920er und 1930er", text: "Blau und Weiß wird zur Regel für jedes Haus. Schriftsteller wie André Gide finden hier einen Rückzugsort.", ...photos.roofs },
    { date: "1932", text: "D'Erlanger stirbt. Sein Archiv der arabischen Musik bleibt im Palast.", ...photos.palace },
    { date: "1942 und 1943", text: "Der Zweite Weltkrieg erreicht Tunis. Deutsche und italienische Truppen halten die Stadt von November 1942, bis die Alliierten im Mai 1943 einziehen.", ...photos.tunis1943 },
    { date: "Ende der 1940er", text: "Maler gründen die École de Tunis. Yahia Turki, Ammar Farhat und andere malen das Leben des Landes, fern vom orientalistischen Blick.", ...photos.drawing },
    { date: "März 1956", text: "Tunesien wird unabhängig.", ...photos.bourguiba },
    { date: "1966 bis 1968", text: "Der Philosoph Michel Foucault lebt in Sidi Bou Saïd, lehrt in Tunis und schreibt hier einen Großteil der Archäologie des Wissens." },
    { date: "1979", text: "Die archäologische Stätte von Karthago, die Landschaft um das Dorf, wird Welterbe.", ...photos.antonine },
    { date: "1985", text: "Ein Dekret macht Karthago und Sidi Bou Saïd zum nationalen archäologischen Park und legt Flächen fest, auf denen nichts gebaut werden darf." },
    { date: "1992", text: "Der Staat, seit Ende der 1980er Eigentümer des Palastes, eröffnet ihn als Zentrum für arabische und mediterrane Musik.", ...photos.palaceGarden },
    { date: "Januar 2011", text: "Die tunesische Revolution. Präsident Ben Ali, dessen Palast auf dem Hügel von Sidi Bou Saïd steht, flieht aus dem Land.", ...photos.revolution },
    { date: "Januar 2013", text: "Brandstifter zünden das Mausoleum des Heiligen an. Die Bewohner protestieren, und die UNESCO ruft zum Schutz des tunesischen Erbes auf.", ...photos.mausoleum },
    { date: "Mai 2023", text: "D'Erlangers Musikarchiv wird in das UNESCO-Register Memory of the World aufgenommen.", ...photos.palaceInside },
    { date: "April 2024", text: "Das Dorf kommt auf Tunesiens Tentativliste für das Welterbe." },
    { date: "Februar 2025", text: "Tunesien reicht die Nominierung ein: Village of Sidi Bou Saïd, hub of cultural and spiritual inspiration in the Mediterranean." },
    { date: "Juni 2025", text: "Erster Besuch von Paul Brinkmann. Seitdem lässt ihn das Dorf nicht mehr los." },
    { date: "Januar 2026", text: "Fast 300 mm Regen in zwei Tagen. Der Hang aus Ton bekommt Risse, acht Gebäude werden geräumt." },
    { date: "Januar 2026", text: "Paul Brinkmann kommt zurück und verliebt sich in das Dorf. Mit Studenten beginnt er die Arbeit, um es zu schützen.", ...photos.paul },
    { date: "25. Juli 2026", title: "Welterbe.", text: "Auf ihrer 48. Sitzung in Busan nimmt die UNESCO das Dorf Sidi Bou Saïd in die Welterbeliste auf. Initiiert wurde die Nominierung von Aly Cherif.", ...photos.aly, more: more.unesco },
  ],
  mission: [
    { date: "2026", title: "Wir sind Architekten. Wir übernehmen Verantwortung.", text: "Architekten und Studenten für Sidi Bou Saïd. Wir arbeiten am Bericht Tunesiens an die UNESCO.", ...photos.hero, extra: "role" },
    { date: "Oktober 2026", text: "Tunesiens Kommission für Großprojekte genehmigt die Arbeiten zur Sicherung des Hangs." },
    { date: "1. Dezember 2027", text: "Tunesiens Bericht an die UNESCO ist fällig: Erdrutsch-Studien, eine Karte der Risse, Notfallpläne und eine Tourismusstrategie.", future: true },
    { date: "2028", text: "Das Welterbekomitee prüft den Bericht auf seiner 50. Sitzung.", future: true },
    { date: "2526", text: "Wir glauben an eine blaue Welt ohne Plastik, ohne Verschmutzung, ohne Krieg. Viele Kulturen, keine Mauern dazwischen: Jedes Volk behält seine Kultur, seinen Glauben und seine Identität und lebt mit den anderen in Respekt. Wir glauben an Frieden.", quote: { text: "Die größte Errungenschaft der Menschheit wird nicht sein, den Mars zu erreichen. Sie wird sein, Frieden auf der Erde zu finden.", by: "Paul Brinkmann" }, ...photos.blueWorld, future: true },
  ],
  posts: [
    { date: "Jeden Tag", title: "Das sauberste und schönste Dorf der Welt.", text: "Kein Plastik auf den Straßen. Kein einziger Zigarettenstummel.", ...photos.cleaning, extra: "commitments", more: more.cleaning },
    { date: "Jede Generation", title: "Die nächste Generation übernimmt Verantwortung.", text: "Architekturstudenten der ENAU arbeiten mit den Menschen im Dorf.", ...photos.students, more: more.people },
    { date: "Das ganze Jahr", title: "Ein starkes Leben im Dorf.", text: "Blumenverkäufer, Cafés, Handwerker und Familien sind das Herz des Dorfes.", ...photos.flowerSeller, more: more.locals },
    { date: "Der Eingang", title: "Die Natur baut den Eingang.", text: "Ein Blumentor dort, wo das alte Dorf beginnt. Jeder Besuch beginnt hier.", ...photos.gate, more: more.entrance },
  ],
};

const ar: StoryCopy = {
  intro: { line: "قرية وقصتها.", scroll: "مرّر لتكتشف" },
  chapters: { village: "القرية", mission: "مهمتنا" },
  readMore: "اقرأ المزيد",
  readLess: "أقل",
  howLink: "كيف يعمل النظام؟",
  credit:
    "الصور: مكتبة الكونغرس، دون قيود معروفة: William Henry Jackson، 1894 · بطاقة بريدية من حوالي 1900 · Nick Parrino، مكتب معلومات الحرب، 1943 · Victor Lundy، 1949. Paul Klee، سان جرمان قرب تونس، 1914، مركز بومبيدو، ملك عام. صورة ذاتية لرودولف ديرلانجي، تصوير عصام برهومي، CC BY-SA 4.0. ويكيميديا كومنز: Issam Barhoumi، CC BY-SA 4.0 · Smailtn، CC0 · Citizen59، CC BY-SA 3.0 · Bernard Gagnon، CC BY-SA 3.0 · VOA، L. Bryant، ملك عام · Emna Mizouni، CC BY-SA 3.0 · Lila Tretikov، CC BY-SA 4.0.",
  nav: { story: "القصة", how: "كيف يعمل", explore: "اكتشف سيدي بوسعيد", exploreLines: ["اكتشف", "سيدي بوسعيد"] },
  history: [
    { date: "العصور القديمة", text: "من الرأس، جبل المنار، تُوجَّه السفن البونيقية والرومانية على طول الساحل.", ...photos.carthage },
    { date: "القرن الحادي عشر", text: "تُبنى على الرأس أبراج مراقبة وأبراج نار لحراسة خليج تونس." },
    { date: "1231", text: "يُدفن هنا الولي الصوفي أبو سعيد الباجي الذي كان يعلّم على التل. وتنمو القرية حول ضريحه وتحمل اسمه لاحقًا.", ...photos.sidi1900 },
    { date: "القرنان الثامن عشر والتاسع عشر", text: "يبني بايات تونس وعائلات من المدينة مساكن صيفية قرب ضريح الولي.", ...photos.sidi1894 },
    { date: "1860", text: "يصبح برج بارتفاع نحو عشرة أمتار منارة الرأس، بضوء متقطّع.", ...photos.lighthouse },
    { date: "1893", text: "مرسوم من الباي يجعل سيدي بوسعيد بلدية، من أقدم بلديات الساحل شمال تونس." },
    { date: "1912", text: "يبدأ البارون رودولف ديرلانجي بناء قصره النجمة الزهراء. يستغرق البناء عشر سنوات.", ...photos.erlanger },
    { date: "1914", text: "يرسم بول كلي وأوغست ماكه ولويس مواييه في القرية. ويرسم ماكه المقهى في الساحة، وهي من أقدم صور القرية.", ...photos.klee },
    { date: "1915", text: "مرسوم بمبادرة من البارون ديرلانجي يحمي القرية: جدران بيضاء، أبواب زرقاء، ولا بناء خارج عن طابعها. وهو من أوائل قوانين حماية التراث في تونس.", ...photos.door },
    { date: "العشرينيات والثلاثينيات", text: "يصبح الأبيض والأزرق قاعدة لكل بيت. ويجد كتّاب مثل أندريه جيد ملاذًا هنا.", ...photos.roofs },
    { date: "1932", text: "يموت ديرلانجي. ويبقى أرشيفه للموسيقى العربية في القصر.", ...photos.palace },
    { date: "1942 و1943", text: "تصل الحرب العالمية الثانية إلى تونس. تسيطر القوات الألمانية والإيطالية على المدينة من نوفمبر 1942 حتى دخول الحلفاء في مايو 1943.", ...photos.tunis1943 },
    { date: "أواخر الأربعينيات", text: "يؤسس رسامون مدرسة تونس. يحيى التركي وعمار فرحات وآخرون يرسمون حياة البلاد بعيدًا عن النظرة الاستشراقية.", ...photos.drawing },
    { date: "مارس 1956", text: "تونس تنال استقلالها.", ...photos.bourguiba },
    { date: "1966 إلى 1968", text: "يعيش الفيلسوف ميشيل فوكو في سيدي بوسعيد، ويدرّس في تونس، ويكتب هنا جزءًا كبيرًا من حفريات المعرفة." },
    { date: "1979", text: "موقع قرطاج الأثري، المشهد المحيط بالقرية، يصبح تراثًا عالميًا.", ...photos.antonine },
    { date: "1985", text: "مرسوم يجعل قرطاج وسيدي بوسعيد حديقة أثرية وطنية ويحدد مناطق يُمنع فيها البناء." },
    { date: "1992", text: "الدولة، مالكة القصر منذ أواخر الثمانينيات، تفتتحه مركزًا للموسيقى العربية والمتوسطية.", ...photos.palaceGarden },
    { date: "يناير 2011", text: "الثورة التونسية. الرئيس بن علي، الذي يقع قصره على تلة سيدي بوسعيد، يفرّ من البلاد.", ...photos.revolution },
    { date: "يناير 2013", text: "يضرم مخرّبون النار في ضريح الولي. يتظاهر السكان، وتدعو اليونسكو إلى حماية تراث تونس.", ...photos.mausoleum },
    { date: "مايو 2023", text: "يُدرج أرشيف ديرلانجي الموسيقي في سجل ذاكرة العالم لليونسكو.", ...photos.palaceInside },
    { date: "أبريل 2024", text: "تُدرج القرية على القائمة التمهيدية لتونس للتراث العالمي." },
    { date: "فبراير 2025", text: "تقدّم تونس ملف الترشيح: قرية سيدي بوسعيد، مركز إلهام ثقافي وروحي في المتوسط." },
    { date: "يونيو 2025", text: "أول زيارة لبول برينكمان. ومنذ ذلك الحين لا تفارقه القرية." },
    { date: "يناير 2026", text: "قرابة 300 ملم من المطر في يومين. يتشقق المنحدر الطيني ويتم إخلاء ثمانية مبانٍ." },
    { date: "يناير 2026", text: "يعود بول برينكمان ويقع في حب القرية. ويبدأ مع الطلبة العمل على حمايتها.", ...photos.paul },
    { date: "25 يوليو 2026", title: "تراث عالمي.", text: "في دورتها الثامنة والأربعين في بوسان، تدرج اليونسكو قرية سيدي بوسعيد على قائمة التراث العالمي. بادر بهذا الترشيح علي الشريف.", ...photos.aly, more: more.unesco },
  ],
  mission: [
    { date: "2026", title: "نحن معماريون. نتحمّل المسؤولية.", text: "معماريون وطلبة من أجل سيدي بوسعيد. نعمل على تقرير تونس إلى اليونسكو.", ...photos.hero, extra: "role" },
    { date: "أكتوبر 2026", text: "لجنة المشاريع الكبرى في تونس توافق على أشغال تأمين المنحدر." },
    { date: "1 ديسمبر 2027", text: "موعد تقرير تونس إلى اليونسكو: دراسات الانزلاقات، خريطة الشقوق، خطط الطوارئ واستراتيجية للسياحة.", future: true },
    { date: "2028", text: "تنظر لجنة التراث العالمي في التقرير خلال دورتها الخمسين.", future: true },
    { date: "2526", text: "نؤمن بعالم أزرق، بلا بلاستيك، بلا تلوث، بلا حرب. ثقافات كثيرة، بلا جدران بينها: يحافظ كل شعب على ثقافته ودينه وهويته، ويعيش مع الآخرين في احترام. نؤمن بالسلام.", quote: { text: "أعظم إنجاز للبشرية لن يكون الوصول إلى المريخ، بل إيجاد السلام على الأرض.", by: "بول برينكمان" }, ...photos.blueWorld, future: true },
  ],
  posts: [
    { date: "كل يوم", title: "أنظف وأجمل قرية في العالم.", text: "لا بلاستيك في الشوارع. ولا عقب سيجارة واحد.", ...photos.cleaning, extra: "commitments", more: more.cleaning },
    { date: "كل جيل", title: "الجيل القادم يتحمّل المسؤولية.", text: "طلبة الهندسة المعمارية في المدرسة الوطنية للهندسة المعمارية والتعمير يعملون مع سكان القرية.", ...photos.students, more: more.people },
    { date: "طوال العام", title: "حياة محلية قوية.", text: "باعة الزهور والمقاهي والحرفيون والعائلات هم قلب القرية.", ...photos.flowerSeller, more: more.locals },
    { date: "المدخل", title: "لنترك الطبيعة تبني المدخل.", text: "بوابة من الزهور حيث تبدأ القرية القديمة. كل زيارة تبدأ من هنا.", ...photos.gate, more: more.entrance },
  ],
};

export const story: Record<Lang, StoryCopy> = { en, fr, de, ar };
