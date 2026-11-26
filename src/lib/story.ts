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
  nav: { story: string; how: string };
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
    "Pictures: Library of Congress, no known restrictions: William Henry Jackson, 1894 · a postcard from around 1900 · Nick Parrino, Office of War Information, 1943. Paul Klee, St. Germain near Tunis, 1914, Centre Pompidou, public domain. Self-portrait of Rodolphe d'Erlanger, photo Issam Barhoumi, CC BY-SA 4.0.",
  nav: { story: "story", how: "how it works" },
  history: [
    { date: "Antiquity", text: "From the cape, Punic and Roman ships are guided along the coast.", ...photos.carthage },
    { date: "1231", text: "The Sufi saint Abu Saïd al-Baji, who taught on the hill, is buried here. The village grows around his tomb and later takes his name.", ...photos.sidi1900 },
    { date: "18th and 19th century", text: "The beys of Tunis and families from the city build summer residences close to the saint's tomb.", ...photos.sidi1894 },
    { date: "1912", text: "Baron Rodolphe d'Erlanger begins his palace, Ennejma Ezzahra. It takes ten years to build.", ...photos.erlanger },
    { date: "1914", text: "Paul Klee, August Macke and Louis Moilliet paint in the village.", ...photos.klee },
    { date: "1915", text: "A decree protects the village: white walls, blue doors, nothing built out of place. It is one of the first heritage protection laws in Tunisia.", ...photos.door },
    { date: "1920s and 1930s", text: "Blue and white becomes the rule for every house. Writers such as André Gide find a retreat here.", ...photos.roofs },
    { date: "1942 and 1943", text: "The Second World War reaches Tunis. In May 1943 the Allies enter the city.", ...photos.tunis1943 },
    { date: "March 1956", text: "Tunisia becomes independent." },
    { date: "February 2025", text: "Tunisia submits the nomination: Village of Sidi Bou Saïd, hub of cultural and spiritual inspiration in the Mediterranean." },
    { date: "January 2026", text: "Close to 300 mm of rain in two days. The clay hillside cracks, and eight buildings are evacuated." },
    { date: "25 July 2026", title: "World Heritage.", text: "At its 48th session in Busan, UNESCO inscribes the village of Sidi Bou Saïd on the World Heritage List.", ...photos.sea, more: more.unesco },
  ],
  mission: [
    { date: "2026", title: "We are architects. We take responsibility.", text: "Architects and students for Sidi Bou Saïd. We work on Tunisia's report to UNESCO.", ...photos.hero, extra: "role" },
    { date: "1 December 2027", text: "Tunisia's report to UNESCO is due: landslide studies, a map of the cracks, emergency plans and a tourism strategy.", future: true },
    { date: "2028", text: "The World Heritage Committee reviews the report at its 50th session.", future: true },
    { date: "2526", text: "We believe in a blue world without plastic, without pollution, without war. Peace.", ...photos.blueWorld, future: true },
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
    "Images : Library of Congress, sans restriction connue : William Henry Jackson, 1894 · une carte postale vers 1900 · Nick Parrino, Office of War Information, 1943. Paul Klee, Saint-Germain près de Tunis, 1914, Centre Pompidou, domaine public. Autoportrait de Rodolphe d'Erlanger, photo Issam Barhoumi, CC BY-SA 4.0.",
  nav: { story: "histoire", how: "fonctionnement" },
  history: [
    { date: "Antiquité", text: "Depuis le cap, les navires puniques et romains sont guidés le long de la côte.", ...photos.carthage },
    { date: "1231", text: "Le saint soufi Abou Saïd al-Baji, qui enseignait sur la colline, y est enterré. Le village grandit autour de sa tombe et prend plus tard son nom.", ...photos.sidi1900 },
    { date: "XVIIIe et XIXe siècles", text: "Les beys de Tunis et des familles de la ville construisent des résidences d'été près de la tombe du saint.", ...photos.sidi1894 },
    { date: "1912", text: "Le baron Rodolphe d'Erlanger commence son palais, Ennejma Ezzahra. Sa construction dure dix ans.", ...photos.erlanger },
    { date: "1914", text: "Paul Klee, August Macke et Louis Moilliet peignent dans le village.", ...photos.klee },
    { date: "1915", text: "Un décret protège le village : murs blancs, portes bleues, rien de construit hors de propos. C'est l'une des premières lois de protection du patrimoine en Tunisie.", ...photos.door },
    { date: "Années 1920 et 1930", text: "Le bleu et le blanc deviennent la règle pour chaque maison. Des écrivains comme André Gide y trouvent une retraite.", ...photos.roofs },
    { date: "1942 et 1943", text: "La Seconde Guerre mondiale atteint Tunis. En mai 1943, les Alliés entrent dans la ville.", ...photos.tunis1943 },
    { date: "Mars 1956", text: "La Tunisie devient indépendante." },
    { date: "Février 2025", text: "La Tunisie dépose la candidature : Village de Sidi Bou Saïd, hub d'inspiration culturelle et spirituelle en Méditerranée." },
    { date: "Janvier 2026", text: "Près de 300 mm de pluie en deux jours. La colline d'argile se fissure et huit bâtiments sont évacués." },
    { date: "25 juillet 2026", title: "Patrimoine mondial.", text: "Lors de sa 48e session à Busan, l'UNESCO inscrit le village de Sidi Bou Saïd sur la Liste du patrimoine mondial.", ...photos.sea, more: more.unesco },
  ],
  mission: [
    { date: "2026", title: "Nous sommes architectes. Nous prenons nos responsabilités.", text: "Des architectes et des étudiants pour Sidi Bou Saïd. Nous travaillons au rapport de la Tunisie à l'UNESCO.", ...photos.hero, extra: "role" },
    { date: "1er décembre 2027", text: "Le rapport de la Tunisie à l'UNESCO est attendu : études des glissements, carte des fissures, plans d'urgence et stratégie touristique.", future: true },
    { date: "2028", text: "Le Comité du patrimoine mondial examine le rapport lors de sa 50e session.", future: true },
    { date: "2526", text: "Nous croyons en un monde bleu, sans plastique, sans pollution, sans guerre. La paix.", ...photos.blueWorld, future: true },
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
    "Bilder: Library of Congress, keine bekannten Einschränkungen: William Henry Jackson, 1894 · eine Postkarte um 1900 · Nick Parrino, Office of War Information, 1943. Paul Klee, St. Germain bei Tunis, 1914, Centre Pompidou, gemeinfrei. Selbstporträt von Rodolphe d'Erlanger, Foto Issam Barhoumi, CC BY-SA 4.0.",
  nav: { story: "Geschichte", how: "So funktioniert's" },
  history: [
    { date: "Antike", text: "Vom Kap aus werden punische und römische Schiffe entlang der Küste geleitet.", ...photos.carthage },
    { date: "1231", text: "Der Sufi-Heilige Abu Saïd al-Baji, der auf dem Hügel lehrte, wird hier begraben. Das Dorf wächst um sein Grab und trägt später seinen Namen.", ...photos.sidi1900 },
    { date: "18. und 19. Jahrhundert", text: "Die Beys von Tunis und Familien aus der Stadt bauen Sommerresidenzen nahe dem Grab des Heiligen.", ...photos.sidi1894 },
    { date: "1912", text: "Baron Rodolphe d'Erlanger beginnt seinen Palast Ennejma Ezzahra. Der Bau dauert zehn Jahre.", ...photos.erlanger },
    { date: "1914", text: "Paul Klee, August Macke und Louis Moilliet malen im Dorf.", ...photos.klee },
    { date: "1915", text: "Ein Dekret schützt das Dorf: weiße Mauern, blaue Türen, nichts, was aus der Reihe fällt. Es ist eines der ersten Denkmalschutzgesetze Tunesiens.", ...photos.door },
    { date: "1920er und 1930er", text: "Blau und Weiß wird zur Regel für jedes Haus. Schriftsteller wie André Gide finden hier einen Rückzugsort.", ...photos.roofs },
    { date: "1942 und 1943", text: "Der Zweite Weltkrieg erreicht Tunis. Im Mai 1943 ziehen die Alliierten in die Stadt ein.", ...photos.tunis1943 },
    { date: "März 1956", text: "Tunesien wird unabhängig." },
    { date: "Februar 2025", text: "Tunesien reicht die Nominierung ein: Village of Sidi Bou Saïd, hub of cultural and spiritual inspiration in the Mediterranean." },
    { date: "Januar 2026", text: "Fast 300 mm Regen in zwei Tagen. Der Hang aus Ton bekommt Risse, acht Gebäude werden geräumt." },
    { date: "25. Juli 2026", title: "Welterbe.", text: "Auf ihrer 48. Sitzung in Busan nimmt die UNESCO das Dorf Sidi Bou Saïd in die Welterbeliste auf.", ...photos.sea, more: more.unesco },
  ],
  mission: [
    { date: "2026", title: "Wir sind Architekten. Wir übernehmen Verantwortung.", text: "Architekten und Studenten für Sidi Bou Saïd. Wir arbeiten am Bericht Tunesiens an die UNESCO.", ...photos.hero, extra: "role" },
    { date: "1. Dezember 2027", text: "Tunesiens Bericht an die UNESCO ist fällig: Erdrutsch-Studien, eine Karte der Risse, Notfallpläne und eine Tourismusstrategie.", future: true },
    { date: "2028", text: "Das Welterbekomitee prüft den Bericht auf seiner 50. Sitzung.", future: true },
    { date: "2526", text: "Wir glauben an eine blaue Welt ohne Plastik, ohne Verschmutzung, ohne Krieg. Frieden.", ...photos.blueWorld, future: true },
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
    "الصور: مكتبة الكونغرس، دون قيود معروفة: William Henry Jackson، 1894 · بطاقة بريدية من حوالي 1900 · Nick Parrino، مكتب معلومات الحرب، 1943. Paul Klee، سان جرمان قرب تونس، 1914، مركز بومبيدو، ملك عام. صورة ذاتية لرودولف ديرلانجي، تصوير عصام برهومي، CC BY-SA 4.0.",
  nav: { story: "القصة", how: "كيف يعمل" },
  history: [
    { date: "العصور القديمة", text: "من الرأس تُوجَّه السفن البونيقية والرومانية على طول الساحل.", ...photos.carthage },
    { date: "1231", text: "يُدفن هنا الولي الصوفي أبو سعيد الباجي الذي كان يعلّم على التل. وتنمو القرية حول ضريحه وتحمل اسمه لاحقًا.", ...photos.sidi1900 },
    { date: "القرنان الثامن عشر والتاسع عشر", text: "يبني بايات تونس وعائلات من المدينة مساكن صيفية قرب ضريح الولي.", ...photos.sidi1894 },
    { date: "1912", text: "يبدأ البارون رودولف ديرلانجي بناء قصره النجمة الزهراء. يستغرق البناء عشر سنوات.", ...photos.erlanger },
    { date: "1914", text: "يرسم بول كلي وأوغست ماكه ولويس مواييه في القرية.", ...photos.klee },
    { date: "1915", text: "مرسوم يحمي القرية: جدران بيضاء، أبواب زرقاء، ولا بناء خارج عن طابعها. وهو من أوائل قوانين حماية التراث في تونس.", ...photos.door },
    { date: "العشرينيات والثلاثينيات", text: "يصبح الأبيض والأزرق قاعدة لكل بيت. ويجد كتّاب مثل أندريه جيد ملاذًا هنا.", ...photos.roofs },
    { date: "1942 و1943", text: "تصل الحرب العالمية الثانية إلى تونس. وفي مايو 1943 يدخل الحلفاء المدينة.", ...photos.tunis1943 },
    { date: "مارس 1956", text: "تونس تنال استقلالها." },
    { date: "فبراير 2025", text: "تقدّم تونس ملف الترشيح: قرية سيدي بوسعيد، مركز إلهام ثقافي وروحي في المتوسط." },
    { date: "يناير 2026", text: "قرابة 300 ملم من المطر في يومين. يتشقق المنحدر الطيني ويتم إخلاء ثمانية مبانٍ." },
    { date: "25 يوليو 2026", title: "تراث عالمي.", text: "في دورتها الثامنة والأربعين في بوسان، تدرج اليونسكو قرية سيدي بوسعيد على قائمة التراث العالمي.", ...photos.sea, more: more.unesco },
  ],
  mission: [
    { date: "2026", title: "نحن معماريون. نتحمّل المسؤولية.", text: "معماريون وطلبة من أجل سيدي بوسعيد. نعمل على تقرير تونس إلى اليونسكو.", ...photos.hero, extra: "role" },
    { date: "1 ديسمبر 2027", text: "موعد تقرير تونس إلى اليونسكو: دراسات الانزلاقات، خريطة الشقوق، خطط الطوارئ واستراتيجية للسياحة.", future: true },
    { date: "2028", text: "تنظر لجنة التراث العالمي في التقرير خلال دورتها الخمسين.", future: true },
    { date: "2526", text: "نؤمن بعالم أزرق، بلا بلاستيك، بلا تلوث، بلا حرب. سلام.", ...photos.blueWorld, future: true },
  ],
  posts: [
    { date: "كل يوم", title: "أنظف وأجمل قرية في العالم.", text: "لا بلاستيك في الشوارع. ولا عقب سيجارة واحد.", ...photos.cleaning, extra: "commitments", more: more.cleaning },
    { date: "كل جيل", title: "الجيل القادم يتحمّل المسؤولية.", text: "طلبة الهندسة المعمارية في المدرسة الوطنية للهندسة المعمارية والتعمير يعملون مع سكان القرية.", ...photos.students, more: more.people },
    { date: "طوال العام", title: "حياة محلية قوية.", text: "باعة الزهور والمقاهي والحرفيون والعائلات هم قلب القرية.", ...photos.flowerSeller, more: more.locals },
    { date: "المدخل", title: "لنترك الطبيعة تبني المدخل.", text: "بوابة من الزهور حيث تبدأ القرية القديمة. كل زيارة تبدأ من هنا.", ...photos.gate, more: more.entrance },
  ],
};

export const story: Record<Lang, StoryCopy> = { en, fr, de, ar };
