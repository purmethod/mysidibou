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

export type Lang = "en" | "fr" | "ar";

export const LANGS: { code: Lang; label: string; dir: "ltr" | "rtl" }[] = [
  { code: "en", label: "EN", dir: "ltr" },
  { code: "fr", label: "FR", dir: "ltr" },
  { code: "ar", label: "AR", dir: "rtl" },
];

export function isLang(value: string | null): value is Lang {
  return value === "en" || value === "fr" || value === "ar";
}

const en = {
  langName: {
    en: "English",
    fr: "Français",
    ar: "العربية",
  },
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
  heroLine: "students. locals. one city. one mission.",
  marquee: "plastic out. beauty back.",
  journey: [
    {
      label: "the town",
      kicker: "sidi bou said, tunisia",
      title: "A white town above the sea.",
      body: "Blue doors. Bougainvillea. Jasmine. A place people fall in love with before they understand it.",
    },
    {
      label: "the streets",
      title: "White lime and cobalt blue.",
      body: "You will not see the problem at first. It hides under the bougainvillea.",
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
      title: "The cleanest city in Tunisia.",
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
    headline: "every visitor leaves a footprint.",
    lines: [
      "plastic.",
      "cigarette butts.",
      "waste.",
      "mass tourism.",
      "wear on public spaces.",
    ],
  },
  mission: {
    headline: "The cleanest city in Tunisia.",
    sub: "Cleaning is only the beginning. This is a model for how architecture, tourism, students, local people, environment and culture can work together.",
    rows: [
      "plastic out of the streets",
      "cigarette butts out of the streets",
      "waste out of the streets",
    ],
    footer:
      "Paid local cleaning teams take responsibility every day. The long-term goal is simple: every street. every corner. every day. clean.",
  },
  people: {
    headline: "The next generation takes responsibility.",
    body: "Architecture is not only about designing buildings. It is about protecting the environment people live in.",
    body2:
      "Our students talk to locals, draw, plan, clean and document the town. Our long-term goal is to work side by side with architecture institutions: ENAU in Sidi Bou Said, the University of Stuttgart, and others.",
    goals: ["talking", "drawing", "planning", "working outside", "cleaning", "documenting"],
  },
  team: {
    headline: "The people behind the mission.",
    body: "Architecture students and local partners. Names and photos land here as the team grows, starting with the first public report.",
  },
  cleaning: {
    headline: "every street. every corner. every day.",
    body: "We build paid local cleaning teams that take responsibility for the streets every day. Plastic out. Cigarette butts out. Waste out.",
  },
  locals: {
    headline: "Protecting the town should also strengthen local life.",
    body: "The people who live and work here are the heart of Sidi Bou Said: flower sellers, small shops, cafés, craftsmen, families.",
  },
  entrance: {
    headline: "Let nature build the entrance.",
    body: "The entrance to the town should not be a heavy architectural intervention. No new concrete walls, no unnecessary masonry. We create the conditions: climbing plants, bougainvillea, flowers, thin wires, simple trellises. Nature creates the architecture.",
  },
  contribution: {
    headline: "A contribution, not a ticket.",
    body: "Sidi Bou Said is one of the most visited places in Tunisia. Our long-term plan is simple: Tunisian visitors remain free. International visitors contribute to the preservation of the town.",
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
    headline: "Where your support goes.",
    body: "We will never invent numbers. The first public report will publish donations received, project spending, cleaning costs, student work and progress.",
    rows: [
      { label: "cleaning", note: "daily street teams" },
      { label: "students and local workers", note: "paid work, not promises" },
      { label: "flowers and public spaces", note: "bougainvillea, jasmine, planting days" },
      { label: "preservation", note: "the historic fabric of the town" },
      { label: "local community", note: "cafés, shops, families" },
      { label: "project infrastructure", note: "tools, transport, reports" },
    ],
    honesty: "The first public report is being prepared.",
  },
  progress: {
    headline: "Proof, not promises.",
    body: "Real numbers land here with the first public report. Until then, we do not invent them.",
    comingSoon: "first public report upcoming",
    statLabels: [
      "kilograms of waste removed",
      "cigarette butts collected",
      "streets cleaned",
      "students involved",
      "local workers involved",
      "flowers planted",
      "public spaces improved",
    ],
    beforeAfter: "before / after photographs will appear here",
  },
  unesco: {
    headline: "World heritage. World responsibility.",
    body: "Sidi Bou Said became a UNESCO World Heritage Site in 2026. A heritage title does not protect a town by itself. People do.",
  },
  fiveHundred: {
    years: ["200 years.", "300 years.", "500 years."],
    line: "People should still be able to walk these streets.",
    footnote: "We are responsible for what we leave behind.",
  },
  follow: {
    headline: "Follow the mission.",
    body: "The work is real and it is happening now. Videos, updates and stories from the streets.",
    comingSoon: "coming soon",
  },
  donateSection: {
    headline: "Your support keeps the streets clean.",
    body: "On a phone, one tap opens the donation page. On a computer, you can scan the QR code.",
    whyTitle: "What a contribution does",
    why: [
      "Keeps paid local cleaning teams working every day",
      "Plants bougainvillea, jasmine and flowers in public spaces",
      "Protects the streets for the next 500 years",
    ],
    trust:
      "Every contribution is accounted for in the first public report. We never invent numbers.",
    qrSoon: "qr code coming soon",
    linkSoon:
      "The secure donation link opens here as soon as it is ready. Follow the mission in the meantime.",
  },
  finale: {
    headline: "One city. One generation. One responsibility.",
    sub: "Help us protect Sidi Bou Said.",
  },
  footer: {
    missionLine: "Turning Sidi Bou Said into the cleanest city in Tunisia.",
    tagline: "students. locals. one city. one mission.",
    location: "Sidi Bou Said, Tunisia",
    heritage: "UNESCO World Heritage Site since 2026",
  },
};

export type Dict = typeof en;

const fr: Dict = {
  langName: { en: "English", fr: "Français", ar: "العربية" },
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
  heroLine: "étudiants. habitants. une ville. une mission.",
  marquee: "Plastique dehors. Beauté de retour.",
  journey: [
    {
      label: "la ville",
      kicker: "sidi bou said, tunisie",
      title: "Une ville blanche au-dessus de la mer.",
      body: "Portes bleues. Bougainvilliers. Jasmin. Un lieu dont on tombe amoureux avant même de le comprendre.",
    },
    {
      label: "les rues",
      title: "Chaux blanche et bleu cobalt.",
      body: "Au premier regard, le problème ne se voit pas. Il se cache sous les bougainvilliers.",
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
      title: "La ville la plus propre de Tunisie.",
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
    headline: "Chaque visiteur laisse une empreinte.",
    lines: [
      "le plastique.",
      "les mégots.",
      "les déchets.",
      "le tourisme de masse.",
      "l'usure des espaces publics.",
    ],
  },
  mission: {
    headline: "La ville la plus propre de Tunisie.",
    sub: "Le nettoyage n'est que le début. C'est un modèle pour que l'architecture, le tourisme, les étudiants, les habitants, l'environnement et la culture travaillent ensemble.",
    rows: [
      "sortir le plastique des rues",
      "sortir les mégots des rues",
      "sortir les déchets des rues",
    ],
    footer:
      "Des équipes locales payées s'occupent des rues chaque jour. L'objectif est simple : chaque rue. chaque coin. chaque jour. propre.",
  },
  people: {
    headline: "La prochaine génération prend ses responsabilités.",
    body: "L'architecture ne consiste pas seulement à concevoir des bâtiments. C'est protéger l'environnement dans lequel les gens vivent.",
    body2:
      "Nos étudiants échangent avec les habitants, dessinent, planifient, nettoient et documentent la ville. Notre objectif à long terme est de travailler aux côtés des institutions d'architecture : l'ENAU à Sidi Bou Said, l'université de Stuttgart, et d'autres.",
    goals: ["échanger", "dessiner", "planifier", "travailler dehors", "nettoyer", "documenter"],
  },
  team: {
    headline: "Les personnes derrière la mission.",
    body: "Étudiants en architecture et partenaires locaux. Les noms et les photos apparaîtront ici à mesure que l'équipe grandit, dès le premier rapport public.",
  },
  cleaning: {
    headline: "chaque rue. chaque coin. chaque jour.",
    body: "Nous créons des équipes locales payées qui s'occupent des rues chaque jour. Sortir le plastique. Sortir les mégots. Sortir les déchets.",
  },
  locals: {
    headline: "Protéger la ville doit aussi renforcer la vie locale.",
    body: "Ceux qui vivent et travaillent ici sont le cœur de Sidi Bou Said : vendeurs de fleurs, petites boutiques, cafés, artisans, familles.",
  },
  entrance: {
    headline: "Laissez la nature construire l'entrée.",
    body: "L'entrée du village ne doit pas être une intervention lourde. Pas de nouveaux murs de béton, pas de maçonnerie inutile. Nous créons les conditions : plantes grimpantes, bougainvilliers, fleurs, fils fins, treillis légers. La nature crée l'architecture.",
  },
  contribution: {
    headline: "Une contribution, pas un billet.",
    body: "Sidi Bou Said est l'un des lieux les plus visités de Tunisie. Notre projet à long terme est simple : les visiteurs tunisiens restent libres d'accès. Les visiteurs internationaux contribuent à la préservation du village.",
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
    headline: "Où va votre soutien.",
    body: "Nous n'inventerons jamais de chiffres. Le premier rapport public publiera les dons reçus, les dépenses, les coûts de nettoyage, le travail des étudiants et les progrès.",
    rows: [
      { label: "nettoyage", note: "équipes de rue quotidiennes" },
      { label: "étudiants et travailleurs locaux", note: "travail payé, pas des promesses" },
      { label: "fleurs et espaces publics", note: "bougainvilliers, jasmin, plantations" },
      { label: "préservation", note: "le tissu historique de la ville" },
      { label: "communauté locale", note: "cafés, boutiques, familles" },
      { label: "infrastructure du projet", note: "outils, transport, rapports" },
    ],
    honesty: "Le premier rapport public est en préparation.",
  },
  progress: {
    headline: "Des preuves, pas des promesses.",
    body: "Les vrais chiffres arriveront avec le premier rapport public. En attendant, nous n'inventons rien.",
    comingSoon: "premier rapport public à venir",
    statLabels: [
      "kilogrammes de déchets retirés",
      "mégots collectés",
      "rues nettoyées",
      "étudiants mobilisés",
      "travailleurs locaux mobilisés",
      "fleurs plantées",
      "espaces publics améliorés",
    ],
    beforeAfter: "les photos avant / après apparaîtront ici",
  },
  unesco: {
    headline: "Patrimoine mondial. Responsabilité mondiale.",
    body: "Sidi Bou Said est devenu site du patrimoine mondial de l'UNESCO en 2026. Un titre ne protège pas une ville à lui seul. Ce sont les gens qui la protègent.",
  },
  fiveHundred: {
    years: ["200 ans.", "300 ans.", "500 ans."],
    line: "Il faut que l'on puisse encore marcher dans ces rues.",
    footnote: "Nous sommes responsables de ce que nous laissons derrière nous.",
  },
  follow: {
    headline: "Suivez la mission.",
    body: "Le travail est réel et il a lieu maintenant. Vidéos, nouvelles et histoires des rues.",
    comingSoon: "bientôt",
  },
  donateSection: {
    headline: "Votre soutien garde les rues propres.",
    body: "Sur un téléphone, une seule pression ouvre la page de don. Sur un ordinateur, vous pouvez scanner le QR code.",
    whyTitle: "Ce que fait une contribution",
    why: [
      "Maintient les équipes locales de nettoyage au travail chaque jour",
      "Plante des bougainvilliers, du jasmin et des fleurs dans les espaces publics",
      "Protège les rues pour les 500 prochaines années",
    ],
    trust:
      "Chaque contribution est comptabilisée dans le premier rapport public. Nous n'inventons jamais de chiffres.",
    qrSoon: "code qr bientôt disponible",
    linkSoon:
      "Le lien de don sécurisé s'ouvrira ici dès qu'il sera prêt. En attendant, suivez la mission.",
  },
  finale: {
    headline: "Une ville. Une génération. Une responsabilité.",
    sub: "Aidez-nous à protéger Sidi Bou Said.",
  },
  footer: {
    missionLine: "Faire de Sidi Bou Said la ville la plus propre de Tunisie.",
    tagline: "étudiants. habitants. une ville. une mission.",
    location: "Sidi Bou Said, Tunisie",
    heritage: "Site du patrimoine mondial de l'UNESCO depuis 2026",
  },
};

const ar: Dict = {
  langName: { en: "English", fr: "Français", ar: "العربية" },
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
  heroLine: "طلّاب. أهل البلدة. مدينة واحدة. رسالة واحدة.",
  marquee: "أخرجوا البلاستيك. أعيدوا الجمال.",
  journey: [
    {
      label: "البلدة",
      kicker: "سيدي بوسعيد، تونس",
      title: "مدينة بيضاء فوق البحر.",
      body: "أبواب زرقاء. بنفسج متسلّق. ياسمين. مكان تقع في حبّه قبل أن تفهمه.",
    },
    {
      label: "الشوارع",
      title: "جير أبيض وأزرق كوبالت.",
      body: "لن ترى المشكلة في البداية. إنها تختبئ تحت البنفسج المتسلّق.",
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
      title: "أنظف مدينة في تونس.",
      body: "فرق محلية بأجر. طلّاب. أهل البلدة. كل شارع، كل زاوية، كل يوم.",
    },
    {
      label: "المستقبل",
      title: "بعد مئتي عام.",
      body: "يجب أن تبقى هذه الشوارع ممشى للناس. نحن مسؤولون عمّا نتركه خلفنا.",
      tags: ["موقع تراث عالمي لليونسكو"],
    },
  ],
  problem: {
    headline: "كل زائر يترك أثراً.",
    lines: [
      "البلاستيك.",
      "أعقاب السجائر.",
      "النفايات.",
      "السياحة الجماعية.",
      "تآكل الأماكن العامة.",
    ],
  },
  mission: {
    headline: "أنظف مدينة في تونس.",
    sub: "التنظيف ليس سوى البداية. إنه نموذج لكيفية عمل العمارة والسياحة والطلّاب والأهالي والبيئة والثقافة معاً.",
    rows: [
      "إخراج البلاستيك من الشوارع",
      "إخراج أعقاب السجائر من الشوارع",
      "إخراج النفايات من الشوارع",
    ],
    footer:
      "فرق تنظيف محلية بأجر تتحمّل المسؤولية كل يوم. الهدف بسيط: كل شارع. كل زاوية. كل يوم. نظيف.",
  },
  people: {
    headline: "الجيل القادم يتحمّل المسؤولية.",
    body: "العمارة ليست فقط تصميم المباني. إنها حماية البيئة التي يعيش فيها الناس.",
    body2:
      "طلّابنا يتحاورون مع الأهالي ويرسمون ويخطّطون وينظّفون ويوثّقون المدينة. هدفنا طويل المدى هو العمل جنباً إلى جنب مع مؤسسات العمارة: المدرسة الوطنية للهندسة المعمارية والتعمير في سيدي بوسعيد، جامعة شتوتغارت، وغيرها.",
    goals: ["تحاور", "رسم", "تخطيط", "عمل ميداني", "تنظيف", "توثيق"],
  },
  team: {
    headline: "الناس وراء المهمّة.",
    body: "طلّاب الهندسة المعمارية وشركاء محليون. ستُضاف الأسماء والصور هنا مع نمو الفريق، بدءاً من التقرير العام الأول.",
  },
  cleaning: {
    headline: "كل شارع. كل زاوية. كل يوم.",
    body: "نؤسّس فرق تنظيف محلية بأجر تتحمّل مسؤولية الشوارع كل يوم. أخرجوا البلاستيك. أخرجوا أعقاب السجائر. أخرجوا النفايات.",
  },
  locals: {
    headline: "حماية المدينة يجب أن تقوّي أيضاً حياة أهلها.",
    body: "الناس الذين يعيشون ويعملون هنا هم قلب سيدي بوسعيد: باعة الزهور، المحلات الصغيرة، المقاهي، الحرفيّون، العائلات.",
  },
  entrance: {
    headline: "دعوا الطبيعة تبني المدخل.",
    body: "مدخل البلدة لا يجب أن يكون تدخلاً معمارياً ثقيلاً. لا جدران خرسانية جديدة، لا بناء حجري غير ضروري. نحن نصنع الشروط: نباتات متسلّقة، بنفسج، زهور، أسلاك رفيعة، تعريشات خفيفة. الطبيعة تصنع العمارة.",
  },
  contribution: {
    headline: "مساهمة، لا تذكرة.",
    body: "سيدي بوسعيد من أكثر الأماكن زيارة في تونس. خطتنا طويلة المدى بسيطة: الزوار التونسيون يبقون أحراراً ودون مقابل. الزوار الدوليون يساهمون في الحفاظ على البلدة.",
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
    headline: "أين يذهب دعمك.",
    body: "لن نخترع أرقاماً أبداً. سيُنشر في أول تقرير عام: التبرعات المستلمة، المصروفات، تكاليف التنظيف، عمل الطلّاب، والتقدّم.",
    rows: [
      { label: "التنظيف", note: "فرق يومية في الشوارع" },
      { label: "الطلّاب والعمال المحليون", note: "عمل بأجر، لا وعود" },
      { label: "الزهور والأماكن العامة", note: "بنفسج، ياسمين، أيام زراعة" },
      { label: "الحفاظ على التراث", note: "النسيج التاريخي للبلدة" },
      { label: "المجتمع المحلي", note: "مقاهٍ، محلات، عائلات" },
      { label: "بنية المشروع", note: "أدوات، نقل، تقارير" },
    ],
    honesty: "التقرير العام الأول قيد الإعداد.",
  },
  progress: {
    headline: "إثبات، لا وعود.",
    body: "الأرقام الحقيقية ستظهر مع التقرير العام الأول. حتى ذلك الحين لا نختلق شيئاً.",
    comingSoon: "التقرير العام الأول قريباً",
    statLabels: [
      "كيلوغرامات النفايات المُزالة",
      "أعقاب السجائر المجموعة",
      "الشوارع المنظّفة",
      "الطلّاب المشاركون",
      "العمال المحليون",
      "الزهور المزروعة",
      "الأماكن العامة المحسّنة",
    ],
    beforeAfter: "صور قبل / بعد ستظهر هنا",
  },
  unesco: {
    headline: "تراث عالمي. مسؤولية عالمية.",
    body: "أصبحت سيدي بوسعيد موقع تراث عالمي لليونسكو في عام 2026. اللقب وحده لا يحمي مدينة. الناس يحمونها.",
  },
  fiveHundred: {
    years: ["200 عاماً.", "300 عاماً.", "500 عاماً."],
    line: "يجب أن يبقى الناس قادرين على المشي في هذه الشوارع.",
    footnote: "نحن مسؤولون عمّا نتركه خلفنا.",
  },
  follow: {
    headline: "تابعوا المهمّة.",
    body: "العمل حقيقي ويجري الآن. فيديوهات وتحديثات وقصص من الشوارع.",
    comingSoon: "قريباً",
  },
  donateSection: {
    headline: "دعمك يُبقي الشوارع نظيفة.",
    body: "على الهاتف: ضغطة واحدة تفتح صفحة التبرّع. على الحاسوب: يمكنك مسح رمز الاستجابة.",
    whyTitle: "ماذا تصنع المساهمة",
    why: [
      "يُبقي فرق التنظيف المحلية بأجر في الشوارع كل يوم",
      "يزرع البنفسج والياسمين والزهور في الأماكن العامة",
      "يحمي الشوارع لخمسمئة عام قادمة",
    ],
    trust: "كل مساهمة تُحسب في التقرير العام الأول. نحن لا نختلق الأرقام أبداً.",
    qrSoon: "رمز الاستجابة قريباً",
    linkSoon: "سيُفتح رابط التبرّع هنا فور جاهزيته. إلى ذلك الحين، تابعوا المهمّة.",
  },
  finale: {
    headline: "مدينة واحدة. جيل واحد. مسؤولية واحدة.",
    sub: "ساعدونا في حماية سيدي بوسعيد.",
  },
  footer: {
    missionLine: "تحويل سيدي بوسعيد إلى أنظف مدينة في تونس.",
    tagline: "طلّاب. أهل البلدة. مدينة واحدة. رسالة واحدة.",
    location: "سيدي بوسعيد، تونس",
    heritage: "موقع تراث عالمي لليونسكو منذ 2026",
  },
};

export const dictionaries: Record<Lang, Dict> = { en, fr, ar };

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