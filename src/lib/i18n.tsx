/**
 * mysidibou — translation dictionaries (en / fr / ar) and the i18n context.
 *
 * English is the default international language. Arabic renders RTL.
 * Add or edit copy here only; the layout never changes.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Lang = "en" | "fr" | "de" | "ar";

export const LANGS: { code: Lang; label: string; dir: "ltr" | "rtl" }[] = [
  { code: "en", label: "EN", dir: "ltr" },
  { code: "fr", label: "FR", dir: "ltr" },
  { code: "de", label: "DE", dir: "ltr" },
  { code: "ar", label: "AR", dir: "rtl" },
];

export function isLang(value: string | null): value is Lang {
  return value === "en" || value === "fr" || value === "de" || value === "ar";
}

const en = {
  langName: { en: "English", fr: "Français", de: "Deutsch", ar: "العربية" },
  nav: {
    mission: "mission",
    people: "people",
    team: "team",
    progress: "progress",
    transparency: "transparency",
    donate: "donate",
  },
  cta: {
    donate: "donate now",
    follow: "follow the mission",
  },
  heroLine: "students. locals. one village. one mission.",
  marquee: "Protected since 1915. Protected by us.",
  journey: [
    {
      label: "the village",
      kicker: "sidi bou said, tunisia",
      title: "THE WORLD'S MOST BEAUTIFUL VILLAGE",
      body: "Protect what you love. Keep Sidi Bou Said beautiful for your children and for generations to come.",
    },
    {
      label: "the streets",
      title: "White lime and cobalt blue.",
      body: "You will not see the problem at first. It hides under the fell.",
    },
    {
      label: "the problem",
      title: "Every visitor leaves a footprint.",
      body: "Plastic, cigarette butts and waste wear away a place the world just called precious.",
      tags: ["plastic", "cigarette butts", "waste"],
    },
    {
      label: "the people",
      kicker: "the next generation",
      title: "The next generation takes responsibility.",
      body: "Architecture students measure, draw, clean and plan the streets they will one day protect.",
      tags: ["cleaning", "drawing", "documenting"],
    },
    {
      label: "the mission",
      title: "The cleanest village in the world.",
      body: "Paid local cleaning teams. Students. Residents. Every street, every corner, every day.",
    },
    {
      label: "the future",
      title: "Two hundred years from now.",
      body: "People should still be able to walk these streets. We are responsible for what we leave behind.",
      tags: ["unesco world heritage site"],
    },
  ],
  problem: {
    headline: "Millions come for its beauty. Every visit leaves something behind.",
    body: "Tourism is not the problem. Uncontrolled mass tourism is. We must manage visitor numbers and protect local life. Otherwise, we risk losing the very beauty people come to see. Our mission is clear: protect Sidi Bou Said and its coastline for generations to come.",
    lines: [
      "plastic.",
      "cigarette butts.",
      "waste.",
      "worn steps and walls.",
    ],
  },
  mission: {
    headline: "Our mission: the cleanest and most beautiful village in the world.",
    sub: "Remove the waste. Fill the streets with flowers.",
    rows: ["No plastic.","Not a single cigarette butt.","Flowers at the entrance. No plastic."],
    footer: "Protect what makes Sidi Bou Said unique.",
  },
  people: {
    headline: "The next generation takes responsibility.",
    body: "Every generation of students should leave Sidi Bou Said better protected than they found it.",
    body2:
      "Architecture students from ENAU and local residents will work together to make this the cleanest and most beautiful village in the world. Our goal is to establish an independent committee at the university in Sidi Bou Said, with each generation of students passing its work and responsibilities to the next.",
    goals: ["remove plastic and cigarette butts","plant and maintain flowers","record damage to buildings","design improvements to public spaces","document work before and after","hand projects to the next student team"],
  },
  team: {
    headline: "The people behind the mission.",
    body: "Architecture students from ENAU and local partners. The team grows with every report.",
  },
  cleaning: {
    headline: "EVERY STREET. EVERY CORNER.",
    body: "Students and local cleaning teams will work together to make Sidi Bou Said the cleanest village in the world.\n\nThis project will create local jobs and help local flower makers sell their flowers, supporting their livelihoods even when there are fewer tourists.",
  },
  locals: {
    headline: "Protecting the village means strengthening local life.",
    body: "The people who live and work here are the heart of Sidi Bou Said: flower sellers, small shops, cafés, craftsmen, families. Every dinar the project generates flows back into the village.",
    value: "",
  },
  entrance: {
    headline: "Let nature build the entrance.",
    body: "No concrete. No masonry. Thin wires, light trellises, fell and jasmine. We set the frame. Nature does the rest. The flower gate stands where the old village begins. Every visit starts here.",
  },
  contribution: {
    headline: "A new model for responsible tourism.",
    body: "One gate, one village: every visitor enters the old village through the flower gate. Sidi Bou Said belongs to Tunisia. Tunisians are never charged — they are invited. Ten dinar from a Tunisian protects what is already his.",
    tagline: "Visit. Contribute. Preserve.",
    tunisianLabel: "Tunisian visitors",
    tunisianText: "Free. Always. Invited to give 10 dinar for their own village.",
    internationalLabel: "International visitors",
    internationalText: "Proposed: 10 dinar per person.",
    closing:
      "Every dinar returns to the village: cleaning, flowers, students, local workers. Full breakdown under transparency. In preparation with the municipality of Sidi Bou Said.",
    returnsLabel: "Where contributions would go",
    returns: [
      "cleaning",
      "preservation",
      "architecture students",
      "local workers and people",
      "flowers",
      "public spaces",
      "project infrastructure",
    ],
    note: "Amounts will be announced once final agreements are made.",
  },
  transparency: {
    headline: "FROM ONE GENERATION TO THE NEXT.",
    body: "Our goal is to direct funds to the municipality and the university in Sidi Bou Said to protect the village.",
    support: "We aim to establish an independent committee with students at the university. This committee will manage the funds and oversee the work to protect Sidi Bou Said. Each generation of students will pass this responsibility to the next, benefiting both the university and the village.\n\nFull transparency. Here on this website, you will see how much money came in, where it went, who received it and what was done with it.",
    reportsTitle: "Two reports",
    report1: "December 2026 — our first public report. Donations, spending, results.",
    report2:
      "1 December 2027 — Tunisia's official report to the UNESCO World Heritage Centre on the conservation of Sidi Bou Said. UNESCO named tourism pressure among the main threats to the village. Every street cleaned, every flower planted and every visitor counted is part of that answer.",
    rows: [{"label":"street cleaning","note":"collect plastic, cigarette butts and other waste; fund local cleaning jobs"},{"label":"student projects","note":"fund materials and equipment for surveys, planting and improvements to the village"},{"label":"flowers and public spaces","note":"buy plants, install light trellises and maintain planted areas"},{"label":"heritage protection","note":"document damage to historic buildings and support approved repairs"},{"label":"local workers","note":"pay local people for cleaning, planting and maintenance"},{"label":"tools and reporting","note":"buy cleaning tools, transport collected waste and publish spending records"}],
    honesty: "First public report: December 2026.",
  },
  progress: {
    headline: "Project updates",
    body: "Coming soon. The first public report will show funds received, spending and work completed.",
    comingSoon: "first public report upcoming",
    statLabels: [
      "kilograms of waste removed",
      "cigarette butts collected",
      "streets cleaned",
      "students involved",
      "local participants",
      "flowers planted",
      "public spaces improved",
      "money contributed",
      "money reinvested",
    ],
    beforeAfter: "before / after photographs will appear here",
  },
  unesco: {
    kicker: "UNESCO WORLD HERITAGE · 2026",
    headline: "World heritage needs local guardians.",
    body: "Recognition is not the finish line. It is a responsibility. Sidi Bou Said has been protected by law since 1915 — one of the earliest heritage decrees in the world, and the residents themselves asked for it. On 25 July 2026, UNESCO placed the village on the World Heritage List. Now it is our turn: for the streets, for the people, for the next 500 years. By 1 December 2027, Tunisia reports to UNESCO on how this village is being protected. We intend to be part of that answer.",
  },
  fiveHundred: {
    years: ["200 years.", "300 years.", "500 years."],
    line: "People should still be able to walk these streets.",
    footnote: "We are responsible for what we leave behind.",
  },
  follow: {
    headline: "Follow the mission.",
    body: "Videos, updates and stories from the streets.",
    comingSoon: "coming soon",
  },
  donateSection: {
    headline: "SIDI BOU SAID IS A LIVING MUSEUM.",
    body: "Museums charge admission to protect their heritage. Sidi Bou Said deserves the same care.\n\nEvery visit leaves a mark. Over time, millions of visits wear down the village. We must protect it.\n\nWe propose an entrance fee for international visitors.",
    whyTitle: "WHERE YOUR MONEY GOES",
    why: ["Local jobs to keep the village clean.","Repairs to historic buildings and streets.","The flower gate at the village entrance.","Support for local flower makers all year round."],
    trust: "The money will support the village of Sidi Bou Said and ENAU, the National School of Architecture and Urban Planning of Tunis.",
    qrSoon: "qr code coming soon",
    linkSoon:
      "The secure donation link opens here as soon as it is ready. Follow the mission in the meantime.",
  },
  finale: {
    headline: "One village. One generation. One responsibility.",
    sub: "Help us protect Sidi Bou Said.",
  },
  footer: {
    missionLine: "Protecting Sidi Bou Said for the next 500 years.",
    tagline: "Students. Locals. Visitors. One village. One responsibility.",
    location: "Sidi Bou Said, Tunisia",
    heritage: "UNESCO World Heritage Site since 25 July 2026",
  },
};

export type Dict = typeof en;

const fr: Dict = {
  langName: { en: "English", fr: "Français", de: "Deutsch", ar: "العربية" },
  nav: {
    mission: "mission",
    people: "les gens",
    team: "équipe",
    progress: "progrès",
    transparency: "transparence",
    donate: "don",
  },
  cta: {
    donate: "faire un don",
    follow: "suivre la mission",
  },
  heroLine: "étudiants. habitants. un village. une mission.",
  marquee: "Protégé depuis 1915. Protégé par nous.",
  journey: [
    {
      label: "le village",
      kicker: "sidi bou said, tunisie",
      title: "LE PLUS BEAU VILLAGE DU MONDE",
      body: "Protégez ce que vous aimez. Préservons la beauté de Sidi Bou Said pour vos enfants et les générations à venir.",
    },
    {
      label: "les rues",
      title: "Chaux blanche et bleu cobalt.",
      body: "Au premier regard, le problème ne se voit pas. Il se cache sous le fell.",
    },
    {
      label: "le problème",
      title: "Chaque visiteur laisse une empreinte.",
      body: "Plastique, mégots et déchets usent un lieu que le monde vient de déclarer précieux.",
      tags: ["plastique", "mégots", "déchets"],
    },
    {
      label: "les gens",
      kicker: "la prochaine génération",
      title: "La prochaine génération prend ses responsabilités.",
      body: "Les étudiants en architecture mesurent, dessinent, nettoient et préparent les rues qu'ils protégeront demain.",
      tags: ["nettoyage", "dessin", "documentation"],
    },
    {
      label: "la mission",
      title: "La ville la plus propre du monde.",
      body: "Des équipes locales payées. Des étudiants. Les habitants. Chaque rue, chaque coin, chaque jour.",
    },
    {
      label: "l'avenir",
      title: "Dans deux cents ans.",
      body: "Il faut que ces rues restent praticables. Nous sommes responsables de ce que nous laissons derrière nous.",
      tags: ["site du patrimoine mondial de l'unesco"],
    },
  ],
  problem: {
    headline: "Des millions viennent pour sa beauté. Chaque visite laisse quelque chose derrière elle.",
    body: "Le tourisme n'est pas le problème. Le tourisme de masse incontrôlé, oui. Nous devons maîtriser le nombre de visiteurs et protéger la vie locale. Sinon, nous risquons de perdre la beauté même que les gens viennent admirer. Notre mission est claire : protéger Sidi Bou Said et son littoral pour les générations à venir.",
    lines: [
      "le plastique.",
      "les mégots.",
      "les déchets.",
      "les marches et murs usés.",
    ],
  },
  mission: {
    headline: "Notre mission : le village le plus propre et le plus beau du monde.",
    sub: "Retirer les déchets. Fleurir les ruelles.",
    rows: ["Aucun plastique.","Pas un seul mégot.","Des fleurs à l’entrée. Aucun plastique."],
    footer: "Préserver ce qui rend Sidi Bou Said unique.",
  },
  people: {
    headline: "La prochaine génération prend ses responsabilités.",
    body: "Chaque génération d'étudiants doit laisser Sidi Bou Said mieux protégé qu'elle ne l'a trouvé.",
    body2:
      "Les étudiants en architecture de l'ENAU et les habitants travailleront ensemble pour faire de ce village le plus propre et le plus beau du monde. Notre objectif est de créer un comité indépendant au sein de l'université de Sidi Bou Said, afin que chaque génération d'étudiants transmette son travail et ses responsabilités à la suivante.",
    goals: ["retirer le plastique et les mégots","planter et entretenir les fleurs","relever les dommages aux bâtiments","améliorer les espaces publics","documenter les travaux avant et après","transmettre les projets à l'équipe étudiante suivante"],
  },
  team: {
    headline: "Les personnes derrière la mission.",
    body: "Des étudiants en architecture de l'ENAU et des partenaires locaux. L'équipe grandit à chaque rapport.",
  },
  cleaning: {
    headline: "CHAQUE RUE. CHAQUE COIN.",
    body: "Les étudiants et les équipes locales de nettoyage travailleront ensemble pour faire de Sidi Bou Said le village le plus propre du monde.\n\nCe projet créera des emplois locaux et aidera les artisans fleuristes à vendre leurs fleurs, pour soutenir leurs revenus même lorsque les touristes sont moins nombreux.",
  },
  locals: {
    headline: "Protéger le village, c'est renforcer la vie locale.",
    body: "Ceux qui vivent et travaillent ici sont le cœur de Sidi Bou Said : vendeurs de fleurs, petites boutiques, cafés, artisans, familles. Chaque dinar généré par le projet revient dans le village.",
    value: "",
  },
  entrance: {
    headline: "Laissez la nature construire l'entrée.",
    body: "Pas de béton. Pas de maçonnerie. Des fils fins, des treillis légers, du fell et du jasmin. Nous posons le cadre. La nature fait le reste. La porte fleurie se dresse là où commence le vieux village. Chaque visite commence ici.",
  },
  contribution: {
    headline: "Un nouveau modèle de tourisme responsable.",
    body: "Une porte, un village : chaque visiteur entre dans le vieux village par la porte fleurie. Sidi Bou Said appartient à la Tunisie. Les Tunisiens ne paient jamais : ils sont invités. Dix dinars d'un Tunisien protègent ce qui lui appartient déjà.",
    tagline: "Visiter. Contribuer. Préserver.",
    tunisianLabel: "Visiteurs tunisiens",
    tunisianText: "Libre. Toujours. Invités à donner 10 dinars pour leur propre village.",
    internationalLabel: "Visiteurs internationaux",
    internationalText: "Proposé : 10 dinars par personne.",
    closing:
      "Chaque dinar revient au village : nettoyage, fleurs, étudiants, travailleurs locaux. Détail complet sous transparence. En préparation avec la municipalité de Sidi Bou Said.",
    returnsLabel: "Où iraient les contributions",
    returns: [
      "nettoyage",
      "préservation",
      "étudiants en architecture",
      "travailleurs et habitants",
      "fleurs",
      "espaces publics",
      "infrastructure du projet",
    ],
    note: "Les montants seront annoncés après les accords finaux.",
  },
  transparency: {
    headline: "D’UNE GÉNÉRATION À LA SUIVANTE.",
    body: "Notre objectif est de verser les fonds à la municipalité et à l’université de Sidi Bou Said pour protéger le village.",
    support: "Nous voulons créer un comité indépendant avec des étudiants au sein de l’université. Ce comité gérera les fonds et suivra les travaux pour protéger Sidi Bou Said. Chaque génération d’étudiants transmettra cette responsabilité à la suivante, au bénéfice de l’université et du village.\n\nUne transparence totale. Ici, sur ce site, vous verrez combien d’argent a été reçu, où il est allé, qui l’a reçu et ce qui a été fait avec.",
    reportsTitle: "Deux rapports",
    report1: "Décembre 2026 — notre premier rapport public. Dons, dépenses, résultats.",
    report2:
      "Le 1er décembre 2027 — le rapport officiel de la Tunisie au Centre du patrimoine mondial de l'UNESCO sur la conservation de Sidi Bou Said. L'UNESCO a cité la pression touristique parmi les principales menaces pesant sur le village. Chaque rue nettoyée, chaque fleur plantée et chaque visiteur compté fait partie de cette réponse.",
    rows: [{"label":"nettoyage des rues","note":"ramasser le plastique, les mégots et les déchets ; financer des emplois locaux de nettoyage"},{"label":"projets étudiants","note":"financer le matériel pour les relevés, les plantations et les améliorations du village"},{"label":"fleurs et espaces publics","note":"acheter les plantes, installer des treillis légers et entretenir les plantations"},{"label":"protection du patrimoine","note":"documenter les dommages aux bâtiments historiques et soutenir les réparations autorisées"},{"label":"travailleurs locaux","note":"rémunérer les habitants pour le nettoyage, les plantations et l'entretien"},{"label":"outils et rapports","note":"acheter les outils, transporter les déchets et publier les dépenses"}],
    honesty: "Premier rapport public : décembre 2026.",
  },
  progress: {
    headline: "Avancement du projet",
    body: "Bientôt. Le premier rapport public présentera les fonds reçus, les dépenses et les travaux réalisés.",
    comingSoon: "premier rapport public à venir",
    statLabels: [
      "kilogrammes de déchets retirés",
      "mégots collectés",
      "rues nettoyées",
      "étudiants mobilisés",
      "participants locaux",
      "fleurs plantées",
      "espaces publics améliorés",
      "argent contribué",
      "argent réinvesti",
    ],
    beforeAfter: "les photos avant / après apparaîtront ici",
  },
  unesco: {
    kicker: "PATRIMOINE MONDIAL UNESCO · 2026",
    headline: "Le patrimoine mondial a besoin de gardiens locaux.",
    body: "La reconnaissance n'est pas la ligne d'arrivée. C'est une responsabilité. Sidi Bou Said est protégé par la loi depuis 1915 — l'un des décrets patrimoniaux les plus précoces au monde, et ce sont les habitants eux-mêmes qui l'ont demandé. Le 25 juillet 2026, l'UNESCO a inscrit le village sur la liste du patrimoine mondial. Maintenant, c'est à notre tour : pour les rues, pour les gens, pour les 500 prochaines années. D'ici le 1er décembre 2027, la Tunisie rend compte à l'UNESCO de la protection de ce village. Nous entendons faire partie de cette réponse.",
  },
  fiveHundred: {
    years: ["200 ans.", "300 ans.", "500 ans."],
    line: "Il faut que l'on puisse encore marcher dans ces rues.",
    footnote: "Nous sommes responsables de ce que nous laissons derrière nous.",
  },
  follow: {
    headline: "Suivez la mission.",
    body: "Vidéos, actualités et histoires des rues.",
    comingSoon: "bientôt",
  },
  donateSection: {
    headline: "SIDI BOU SAID EST UN MUSÉE VIVANT.",
    body: "Les musées font payer l’entrée pour protéger leur patrimoine. Sidi Bou Said mérite la même attention.\n\nChaque visite laisse une trace. Au fil du temps, des millions de visites usent le village. Nous devons le protéger.\n\nNous proposons un droit d’entrée pour les visiteurs internationaux.",
    whyTitle: "OÙ VA VOTRE ARGENT",
    why: ["Des emplois locaux pour garder le village propre.","La réparation des bâtiments historiques et des rues.","La porte fleurie à l’entrée du village.","Le soutien aux artisans fleuristes locaux toute l’année."],
    trust: "L’argent soutiendra le village de Sidi Bou Said et l’ENAU, l’École nationale d’architecture et d’urbanisme de Tunis.",
    qrSoon: "code qr bientôt disponible",
    linkSoon:
      "Le lien de don sécurisé s'ouvrira ici dès qu'il sera prêt. En attendant, suivez la mission.",
  },
  finale: {
    headline: "Un village. Une génération. Une responsabilité.",
    sub: "Aidez-nous à protéger Sidi Bou Said.",
  },
  footer: {
    missionLine: "Protéger Sidi Bou Said pour les 500 prochaines années.",
    tagline: "Étudiants. Habitants. Visiteurs. Un village. Une responsabilité.",
    location: "Sidi Bou Said, Tunisie",
    heritage: "Site du patrimoine mondial de l'UNESCO depuis le 25 juillet 2026",
  },
};

const ar: Dict = {
  langName: { en: "English", fr: "Français", de: "Deutsch", ar: "العربية" },
  nav: {
    mission: "المهمة",
    people: "الناس",
    team: "الفريق",
    progress: "التقدّم",
    transparency: "الشفافية",
    donate: "تبرّع",
  },
  cta: {
    donate: "تبرّع الآن",
    follow: "تابع المهمّة",
  },
  heroLine: "طلّاب. أهل القرية. قرية واحدة. مهمة واحدة.",
  marquee: "محمية منذ 1915. محمية بنا.",
  journey: [
    {
      label: "القرية",
      kicker: "سيدي بوسعيد، تونس",
      title: "أجمل قرية في العالم",
      body: "احمِ ما تحب. لنحافظ على جمال سيدي بوسعيد لأطفالك وللأجيال القادمة.",
    },
    {
      label: "الشوارع",
      title: "جير أبيض وأزرق كوبالت.",
      body: "لن ترى المشكلة في البداية. إنها تختبئ تحت الفلّ.",
    },
    {
      label: "المشكلة",
      title: "كل زائر يترك أثراً.",
      body: "البلاستيك وأعقاب السجائر والنفايات تُنهك مكاناً أعلنه العالم للتوّ ثميناً.",
      tags: ["بلاستيك", "أعقاب سجائر", "نفايات"],
    },
    {
      label: "الناس",
      kicker: "الجيل القادم",
      title: "الجيل القادم يتحمّل المسؤولية.",
      body: "طلّاب الهندسة المعمارية يقيسون ويرسمون وينظّفون الشوارع التي سيحمونها غداً.",
      tags: ["تنظيف", "رسم", "توثيق"],
    },
    {
      label: "المهمة",
      title: "أنظف قرية في العالم.",
      body: "فرق محلية بأجر. طلّاب. أهل القرية. كل شارع، كل زاوية، كل يوم.",
    },
    {
      label: "المستقبل",
      title: "بعد مئتي عام.",
      body: "يجب أن تبقى هذه الشوارع ممشى للناس. نحن مسؤولون عمّا نتركه خلفنا.",
      tags: ["موقع تراث عالمي لليونسكو"],
    },
  ],
  problem: {
    headline: "الملايين يأتون لجمالها. كل زيارة تترك شيئاً خلفها.",
    body: "السياحة ليست المشكلة. السياحة الجماعية غير المنضبطة هي المشكلة. علينا تنظيم أعداد الزوار وحماية الحياة المحلية، وإلا فإننا نخاطر بفقدان الجمال الذي يأتي الناس لرؤيته. مهمتنا واضحة: حماية سيدي بوسعيد وساحلها للأجيال القادمة.",
    lines: [
      "البلاستيك.",
      "أعقاب السجائر.",
      "النفايات.",
      "درجات وجدران بليت.",
    ],
  },
  mission: {
    headline: "مهمتنا: أنظف وأجمل قرية في العالم.",
    sub: "نزيل النفايات. نملأ الأزقة بالزهور.",
    rows: ["لا بلاستيك.","ولا عقب سيجارة واحد.","زهور عند المدخل. لا بلاستيك."],
    footer: "نحمي ما يميّز سيدي بوسعيد.",
  },
  people: {
    headline: "الجيل القادم يتحمّل المسؤولية.",
    body: "على كل جيل من الطلاب أن يترك سيدي بوسعيد أكثر حماية مما وجدها.",
    body2:
      "سيعمل طلاب الهندسة المعمارية في إينو مع الأهالي لجعل هذه القرية الأنظف والأجمل في العالم. هدفنا إنشاء لجنة مستقلة داخل الجامعة في سيدي بوسعيد، لينقل كل جيل من الطلاب عمله ومسؤولياته إلى الجيل التالي.",
    goals: ["إزالة البلاستيك وأعقاب السجائر","زراعة الزهور والعناية بها","توثيق أضرار المباني","تحسين الأماكن العامة","توثيق الأعمال قبلها وبعدها","تسليم المشاريع للفريق الطلابي التالي"],
  },
  team: {
    headline: "الناس وراء المهمّة.",
    body: "طلّاب عمارة من إينو وشركاء محليون. الفريق ينمو مع كل تقرير.",
  },
  cleaning: {
    headline: "كل شارع. كل زاوية.",
    body: "سيعمل الطلاب وفرق التنظيف المحلية معاً لجعل سيدي بوسعيد أنظف قرية في العالم.\n\nسيخلق هذا المشروع فرص عمل محلية ويساعد صانعي باقات الزهور المحليين على بيع زهورهم، لدعم أرزاقهم حتى عندما يقل عدد السياح.",
  },
  locals: {
    headline: "حماية القرية تعني تقوية الحياة المحلية.",
    body: "الناس الذين يعيشون ويعملون هنا هم قلب سيدي بوسعيد: باعة الزهور، المحلات الصغيرة، المقاهي، الحرفيّون، العائلات. كل دينار يولّده المشروع يعود إلى القرية.",
    value: "",
  },
  entrance: {
    headline: "دعوا الطبيعة تبني المدخل.",
    body: "لا خرسانة. لا بناء حجري. أسلاك رفيعة، تعريشات خفيفة، فلّ وياسمين. نحن نضع الإطار. الطبيعة تكمل الباقي. بوابة الزهور تقف حيث تبدأ القرية القديمة. كل زيارة تبدأ هنا.",
  },
  contribution: {
    headline: "نموذج جديد للسياحة المسؤولة.",
    body: "بوابة واحدة، قرية واحدة: كل زائر يدخل القرية القديمة عبر بوابة الزهور. سيدي بوسعيد ملك لتونس. التونسيون لا يُدفَعون أبداً: إنهم مدعوّون. عشرة دنانير من تونسي تحمي ما هو ملكه أصلاً.",
    tagline: "زُر. ساهم. احفظ.",
    tunisianLabel: "الزوار التونسيون",
    tunisianText: "مجاناً. دائماً. مدعوّ لمنح 10 دنانير لقريته الخاصة.",
    internationalLabel: "الزوار الدوليون",
    internationalText: "مقترح: 10 دنانير للشخص.",
    closing:
      "كل دينار يعود إلى القرية: تنظيف، زهور، طلّاب، عمال محليون. التفاصيل الكاملة تحت الشفافية. قيد التحضير مع بلدية سيدي بوسعيد.",
    returnsLabel: "أين تذهب المساهمات",
    returns: [
      "التنظيف",
      "الحفاظ على التراث",
      "طلّاب الهندسة المعمارية",
      "العمال والأهالي",
      "الزهور",
      "الأماكن العامة",
      "بنية المشروع",
    ],
    note: "سيُعلَن عن المبالغ بعد الاتفاقيات النهائية.",
  },
  transparency: {
    headline: "من جيل إلى الجيل التالي.",
    body: "هدفنا توجيه الأموال إلى البلدية والجامعة في سيدي بوسعيد لحماية القرية.",
    support: "نسعى لإنشاء لجنة مستقلة تضم طلاباً من الجامعة. ستدير هذه اللجنة الأموال وتتابع العمل لحماية سيدي بوسعيد. وسينقل كل جيل من الطلاب هذه المسؤولية إلى الجيل التالي، لتستفيد الجامعة والقرية معاً.\n\nشفافية كاملة. هنا على هذا الموقع، سترون كم من المال وصل، وأين ذهب، ومن استلمه، وما الذي أُنجز به.",
    reportsTitle: "تقريران",
    report1: "ديسمبر 2026 — تقريرنا العام الأول. تبرعات، مصروفات، نتائج.",
    report2:
      "1 ديسمبر 2027 — التقرير الرسمي لتونس إلى مركز التراث العالمي لليونسكو حول حفظ سيدي بوسعيد. ذكرت اليونسكو ضغط السياحة بين التهديدات الرئيسية للقرية. كل شارع نُظّف، وكل زهرة زُرعت، وكل زائر جرى إحصاؤه جزء من تلك الإجابة.",
    rows: [{"label":"تنظيف الشوارع","note":"جمع البلاستيك وأعقاب السجائر والنفايات وتمويل وظائف تنظيف محلية"},{"label":"مشاريع الطلاب","note":"تمويل المواد والمعدات للمسح والزراعة وتحسين القرية"},{"label":"الزهور والأماكن العامة","note":"شراء النباتات وتركيب تعريشات خفيفة والعناية بالمساحات المزروعة"},{"label":"حماية التراث","note":"توثيق أضرار المباني التاريخية ودعم الإصلاحات المرخّصة"},{"label":"العمال المحليون","note":"دفع أجور للأهالي مقابل التنظيف والزراعة والصيانة"},{"label":"الأدوات والتقارير","note":"شراء أدوات التنظيف ونقل النفايات ونشر سجلات المصروفات"}],
    honesty: "أول تقرير عام: ديسمبر 2026.",
  },
  progress: {
    headline: "تقدّم المشروع",
    body: "قريباً. سيعرض التقرير العام الأول الأموال المستلمة والمصروفات والأعمال المنجزة.",
    comingSoon: "التقرير العام الأول قريباً",
    statLabels: [
      "كيلوغرامات النفايات المُزالة",
      "أعقاب السجائر المجموعة",
      "الشوارع المنظّفة",
      "الطلّاب المشاركون",
      "المشاركون المحليون",
      "الزهور المزروعة",
      "الأماكن العامة المحسّنة",
      "أموال مُساهَم بها",
      "أموال مُعَاد استثمارها",
    ],
    beforeAfter: "صور قبل / بعد ستظهر هنا",
  },
  unesco: {
    kicker: "تراث عالمي لليونسكو · 2026",
    headline: "التراث العالمي يحتاج حرّاساً محليين.",
    body: "الاعتراف ليس خط النهاية. إنه مسؤولية. سيدي بوسعيد محمية بالقانون منذ 1915 — أحد أقدم مراسيم حماية التراث في العالم، وقد طلب ذلك السكان أنفسهم. في 25 يوليو 2026، أدرجت اليونسكو القرية في قائمة التراث العالمي. الآن جاء دورنا: من أجل الشوارع، ومن أجل الناس، ومن أجل الـ500 عام القادمة. بحلول 1 ديسمبر 2027، ترفع تونس تقريراً إلى اليونسكو عن حماية هذه القرية. ننوي أن نكون جزءاً من تلك الإجابة.",
  },
  fiveHundred: {
    years: ["200 عاماً.", "300 عاماً.", "500 عاماً."],
    line: "يجب أن يبقى الناس قادرين على المشي في هذه الشوارع.",
    footnote: "نحن مسؤولون عمّا نتركه خلفنا.",
  },
  follow: {
    headline: "تابعوا المهمّة.",
    body: "فيديوهات وتحديثات وقصص من الشوارع.",
    comingSoon: "قريباً",
  },
  donateSection: {
    headline: "سيدي بوسعيد متحف حيّ.",
    body: "تفرض المتاحف رسوم دخول لحماية تراثها. سيدي بوسعيد تستحق العناية نفسها.\n\nكل زيارة تترك أثراً. ومع مرور الوقت، تستهلك ملايين الزيارات القرية. علينا حمايتها.\n\nنقترح رسوم دخول للزوار الأجانب.",
    whyTitle: "أين تذهب أموالك",
    why: ["وظائف محلية للحفاظ على نظافة القرية.","إصلاح المباني التاريخية والشوارع.","بوابة الزهور عند مدخل القرية.","دعم صانعي باقات الزهور المحليين طوال العام."],
    trust: "ستدعم الأموال قرية سيدي بوسعيد وإينو، المدرسة الوطنية للهندسة المعمارية والتعمير بتونس.",
    qrSoon: "رمز الاستجابة قريباً",
    linkSoon: "سيُفتح رابط التبرّع هنا فور جاهزيته. إلى ذلك الحين، تابعوا المهمّة.",
  },
  finale: {
    headline: "قرية واحدة. جيل واحد. مسؤولية واحدة.",
    sub: "ساعدونا في حماية سيدي بوسعيد.",
  },
  footer: {
    missionLine: "حماية سيدي بوسعيد لخمسمئة عام قادمة.",
    tagline: "طلّاب. أهل القرية. زوار. قرية واحدة. مسؤولية واحدة.",
    location: "سيدي بوسعيد، تونس",
    heritage: "موقع تراث عالمي لليونسكو منذ 25 يوليو 2026",
  },
};

const de: Dict = {
  langName: { en: "English", fr: "Français", de: "Deutsch", ar: "العربية" },
  nav: {
    mission: "Mission",
    people: "Menschen",
    team: "Team",
    progress: "Fortschritt",
    transparency: "Transparenz",
    donate: "Spenden",
  },
  cta: {
    donate: "Jetzt spenden",
    follow: "Die Mission verfolgen",
  },
  heroLine: "Studierende. Einheimische. Ein Dorf. Eine Mission.",
  marquee: "Geschützt seit 1915. Geschützt von uns.",
  journey: [
    {
      label: "das Dorf",
      kicker: "sidi bou said, tunesien",
      title: "DAS SCHÖNSTE DORF DER WELT",
      body: "Schütze, was du liebst. Bewahren wir die Schönheit von Sidi Bou Said für deine Kinder und die kommenden Generationen.",
    },
    {
      label: "die Gassen",
      title: "Weißer Kalk und Kobaltblau.",
      body: "Zuerst sieht man das Problem nicht. Es versteckt sich unter dem fell.",
    },
    {
      label: "das Problem",
      title: "Jeder Besucher hinterlässt einen Fußabdruck.",
      body: "Plastik, Zigarettenstummel und Müll zehren an einem Ort, den die Welt gerade kostbar genannt hat.",
      tags: ["Plastik", "Zigarettenstummel", "Müll"],
    },
    {
      label: "die Menschen",
      kicker: "die nächste Generation",
      title: "Die nächste Generation übernimmt Verantwortung.",
      body: "Architekturstudierende messen, zeichnen, reinigen und planen die Straßen, die sie eines Tages schützen werden.",
      tags: ["Reinigung", "Zeichnen", "Dokumentation"],
    },
    {
      label: "die Mission",
      title: "Das sauberste Dorf der Welt.",
      body: "Bezahlte lokale Reinigungsteams. Studierende. Anwohner. Jede Straße, jede Ecke, jeden Tag.",
    },
    {
      label: "die Zukunft",
      title: "In zweihundert Jahren.",
      body: "Menschen sollen diese Straßen noch begehen können. Wir sind verantwortlich für das, was wir hinterlassen.",
      tags: ["unesco-weltkulturerbe"],
    },
  ],
  problem: {
    headline: "Millionen kommen wegen ihrer Schönheit. Jeder Besuch hinterlässt etwas.",
    body: "Tourismus ist nicht das Problem. Unkontrollierter Massentourismus ist es. Wir müssen die Besucherzahlen steuern und das lokale Leben schützen. Sonst verlieren wir womöglich genau die Schönheit, die Menschen hierherzieht. Unsere Mission ist klar: Sidi Bou Said und seine Küste für die kommenden Generationen schützen.",
    lines: [
      "das Plastik.",
      "die Zigarettenstummel.",
      "der Müll.",
      "abgenutzte Stufen und Mauern.",
    ],
  },
  mission: {
    headline: "Unsere Mission: das sauberste und schönste Dorf der Welt.",
    sub: "Müll entfernen. Die Gassen mit Blumen füllen.",
    rows: ["Kein Plastik.","Keine einzige Zigarettenkippe.","Blumen am Eingang. Kein Plastik."],
    footer: "Bewahren, was Sidi Bou Said einzigartig macht.",
  },
  people: {
    headline: "Die nächste Generation übernimmt Verantwortung.",
    body: "Jede Generation von Studierenden soll Sidi Bou Said besser geschützt hinterlassen, als sie es vorgefunden hat.",
    body2:
      "Architekturstudierende der ENAU und Einheimische werden gemeinsam daran arbeiten, dieses Dorf zum saubersten und schönsten der Welt zu machen. Unser Ziel ist ein unabhängiges Gremium an der Universität in Sidi Bou Said. Jede Generation von Studierenden soll ihre Arbeit und Verantwortung an die nächste weitergeben.",
    goals: ["Plastik und Zigarettenstummel entfernen","Blumen pflanzen und pflegen","Schäden an Gebäuden erfassen","öffentliche Räume verbessern","Arbeiten vorher und nachher dokumentieren","Projekte an das nächste Studierendenteam übergeben"],
  },
  team: {
    headline: "Die Menschen hinter der Mission.",
    body: "Architekturstudierende der ENAU und lokale Partner. Das Team wächst mit jedem Bericht.",
  },
  cleaning: {
    headline: "JEDE STRASSE. JEDE ECKE.",
    body: "Studierende und lokale Reinigungsteams werden gemeinsam daran arbeiten, Sidi Bou Said zum saubersten Dorf der Welt zu machen.\n\nDieses Projekt wird lokale Arbeitsplätze schaffen und den Blumenmachern vor Ort helfen, ihre Blumen zu verkaufen. So unterstützen wir ihren Lebensunterhalt auch dann, wenn weniger Touristen kommen.",
  },
  locals: {
    headline: "Das Dorf zu schützen heißt, das lokale Leben zu stärken.",
    body: "Die Menschen, die hier leben und arbeiten, sind das Herz von Sidi Bou Said: Blumenverkäufer, kleine Läden, Cafés, Handwerker, Familien. Jeder Dinar, den das Projekt erwirtschaftet, fließt ins Dorf zurück.",
    value: "",
  },
  entrance: {
    headline: "Lass die Natur den Eingang bauen.",
    body: "Kein Beton. Kein Mauerwerk. Dünne Drähte, leichte Rankgitter, fell und Jasmin. Wir setzen den Rahmen. Die Natur macht den Rest. Das Blumentor steht dort, wo das alte Dorf beginnt. Jeder Besuch beginnt hier.",
  },
  contribution: {
    headline: "Ein neues Modell für verantwortungsvollen Tourismus.",
    body: "Ein Tor, ein Dorf: Jeder Besucher betritt das alte Dorf durch das Blumentor. Sidi Bou Said gehört zu Tunesien. Tunesier zahlen nie: Sie sind eingeladen. Zehn Dinar eines Tunesiers schützen, was bereits seins ist.",
    tagline: "Besuchen. Beitragen. Bewahren.",
    tunisianLabel: "Tunesische Besucher",
    tunisianText: "Frei. Immer. Eingeladen, 10 Dinar für das eigene Dorf zu geben.",
    internationalLabel: "Internationale Besucher",
    internationalText: "Vorgeschlagen: 10 Dinar pro Person.",
    closing:
      "Jeder Dinar kehrt ins Dorf zurück: Reinigung, Blumen, Studierende, lokale Arbeiter. Vollständige Aufschlüsselung unter Transparenz. In Vorbereitung mit der Gemeinde Sidi Bou Said.",
    returnsLabel: "Wohin Beiträge fließen würden",
    returns: [
      "Reinigung",
      "Erhalt",
      "Architekturstudierende",
      "lokale Arbeiter und Menschen",
      "Blumen",
      "öffentliche Räume",
      "Projektinfrastruktur",
    ],
    note: "Die Beträge werden bekannt gegeben, sobald die finalen Vereinbarungen stehen.",
  },
  transparency: {
    headline: "VON EINER GENERATION ZUR NÄCHSTEN.",
    body: "Unser Ziel ist, Gelder an die Gemeinde und die Universität in Sidi Bou Said zu leiten, um das Dorf zu schützen.",
    support: "Wir wollen ein unabhängiges Gremium mit Studierenden an der Universität aufbauen. Dieses Gremium wird die Gelder verwalten und die Arbeit zum Schutz von Sidi Bou Said begleiten. Jede Generation von Studierenden wird diese Verantwortung an die nächste weitergeben. Davon profitieren die Universität und das Dorf.\n\nVollständige Transparenz. Hier auf dieser Webseite wirst du sehen, wie viel Geld eingegangen ist, wohin es geflossen ist, wer es erhalten hat und was damit gemacht wurde.",
    reportsTitle: "Zwei Berichte",
    report1: "Dezember 2026 — unser erster öffentlicher Bericht. Spenden, Ausgaben, Ergebnisse.",
    report2:
      "Der 1. Dezember 2027 — der offizielle Bericht Tunesiens an das UNESCO-Welterbezentrum über die Erhaltung von Sidi Bou Said. Die UNESCO nannte den Tourismusdruck unter den Hauptgefahren für das Dorf. Jede gereinigte Straße, jede gepflanzte Blume und jeder gezählte Besucher ist Teil dieser Antwort.",
    rows: [{"label":"Straßenreinigung","note":"Plastik, Kippen und anderen Müll sammeln; lokale Reinigungsarbeit finanzieren"},{"label":"Studierendenprojekte","note":"Material und Geräte für Bestandsaufnahmen, Pflanzungen und Verbesserungen finanzieren"},{"label":"Blumen und öffentliche Räume","note":"Pflanzen kaufen, leichte Rankhilfen anbringen und bepflanzte Flächen pflegen"},{"label":"Denkmalschutz","note":"Schäden an historischen Gebäuden dokumentieren und genehmigte Reparaturen unterstützen"},{"label":"lokale Arbeitskräfte","note":"Einheimische für Reinigung, Pflanzungen und Pflege bezahlen"},{"label":"Werkzeug und Berichte","note":"Reinigungswerkzeug kaufen, Müll abtransportieren und Ausgaben veröffentlichen"}],
    honesty: "Erster öffentlicher Bericht: Dezember 2026.",
  },
  progress: {
    headline: "Projektfortschritt",
    body: "Demnächst. Der erste öffentliche Bericht zeigt Einnahmen, Ausgaben und ausgeführte Arbeiten.",
    comingSoon: "erster öffentlicher Bericht in Kürze",
    statLabels: [
      "Kilogramm entfernter Abfall",
      "gesammelte Zigarettenstummel",
      "gereinigte Straßen",
      "beteiligte Studierende",
      "lokale Teilnehmende",
      "gepflanzte Blumen",
      "verbesserte öffentliche Räume",
      "Geld beigetragen",
      "Geld reinvestiert",
    ],
    beforeAfter: "Vorher-/Nachher-Fotos erscheinen hier",
  },
  unesco: {
    kicker: "UNESCO-WELTERBE · 2026",
    headline: "Weltkulturerbe braucht lokale Hüter.",
    body: "Die Anerkennung ist nicht die Ziellinie. Sie ist eine Verantwortung. Sidi Bou Said steht seit 1915 unter gesetzlichem Schutz — eines der frühesten Denkmalschutz-Dekrete der Welt, und die Bewohner selbst haben darum gebeten. Am 25. Juli 2026 hat die UNESCO das Dorf in die Welterbeliste aufgenommen. Jetzt sind wir an der Reihe: für die Straßen, für die Menschen, für die nächsten 500 Jahre. Bis zum 1. Dezember 2027 berichtet Tunesien der UNESCO, wie dieses Dorf geschützt wird. Wir wollen Teil dieser Antwort sein.",
  },
  fiveHundred: {
    years: ["200 Jahre.", "300 Jahre.", "500 Jahre."],
    line: "Menschen sollten diese Straßen noch begehen können.",
    footnote: "Wir sind verantwortlich für das, was wir hinterlassen.",
  },
  follow: {
    headline: "Verfolge die Mission.",
    body: "Videos, Updates und Geschichten aus den Straßen.",
    comingSoon: "demnächst",
  },
  donateSection: {
    headline: "SIDI BOU SAID IST EIN LEBENDIGES MUSEUM.",
    body: "Museen verlangen Eintritt, um ihr Erbe zu schützen. Sidi Bou Said verdient dieselbe Fürsorge.\n\nJeder Besuch hinterlässt Spuren. Über die Jahre nutzen Millionen von Besuchen das Dorf ab. Wir müssen es schützen.\n\nWir schlagen einen Eintrittspreis für internationale Besucher vor.",
    whyTitle: "WOHIN DEIN GELD GEHT",
    why: ["Lokale Arbeitsplätze, die das Dorf sauber halten.","Reparaturen an historischen Gebäuden und Straßen.","Das Blumentor am Dorfeingang.","Unterstützung für lokale Blumenmacher das ganze Jahr."],
    trust: "Das Geld wird das Dorf Sidi Bou Said und die ENAU, die Nationale Hochschule für Architektur und Stadtplanung in Tunis, unterstützen.",
    qrSoon: "qr-code in Kürze verfügbar",
    linkSoon:
      "Der sichere Spendelink öffnet sich hier, sobald er bereit ist. Verfolge die Mission in der Zwischenzeit.",
  },
  finale: {
    headline: "Ein Dorf. Eine Generation. Eine Verantwortung.",
    sub: "Hilf uns, Sidi Bou Said zu schützen.",
  },
  footer: {
    missionLine: "Sidi Bou Said für die nächsten 500 Jahre schützen.",
    tagline: "Studierende. Einheimische. Besucher. Ein Dorf. Eine Verantwortung.",
    location: "Sidi Bou Said, Tunesien",
    heritage: "UNESCO-Welterbestätte seit dem 25. Juli 2026",
  },
};

export const dictionaries: Record<Lang, Dict> = { en, fr, de, ar };

const STORAGE_KEY = "mysidibou:lang";

interface I18nValue {
  lang: Lang;
  dict: Dict;
  dir: "ltr" | "rtl";
  setLang: (lang: Lang) => void;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  // Deterministic "en" for SSR and the first client render (hydration-safe);
  // the stored preference applies right after mount.
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (isLang(stored) && stored !== "en") {
        setLangState(stored);
      }
    } catch {
      // storage unavailable — default language applies
    }
  }, []);

  useEffect(() => {
    const dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // storage unavailable — language still applies for this visit
    }
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
  }, []);

  const value = useMemo<I18nValue>(
    () => ({
      lang,
      dict: dictionaries[lang],
      dir: lang === "ar" ? "rtl" : "ltr",
      setLang,
    }),
    [lang, setLang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used inside I18nProvider");
  }
  return ctx;
}