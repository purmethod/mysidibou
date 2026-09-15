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
  marquee: "plastic out. beauty back.",
  journey: [
    {
      label: "the town",
      kicker: "sidi bou said, tunisia",
      title: "Protecting Sidi Bou Said for the next 500 years.",
      body: "Our first mission: make Sidi Bou Said the cleanest village in the world.",
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
      title: "The cleanest city in the world.",
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
    body: "Tourism is not the enemy. Unmanaged impact is. Visitors can become part of the solution.",
    lines: [
      "plastic.",
      "cigarette butts.",
      "waste.",
      "worn steps and walls.",
    ],
  },
  mission: {
    headline: "The cleanest village in the world.",
    sub: "Cleaning is where it starts. Students and locals keep the streets clean, the walls green and the village documented.",
    rows: [
      "clean: every street, every day.",
      "green: fell and jasmine.",
      "document: the students map the village.",
    ],
    footer: "",
  },
  people: {
    headline: "The next generation takes responsibility.",
    body: "The village becomes the classroom.",
    body2:
      "Architecture students from ENAU work alongside local people to observe, document, design and improve the village.",
    goals: ["talking", "drawing", "planning", "cleaning", "planting", "documenting"],
  },
  team: {
    headline: "The people behind the mission.",
    body: "Architecture students from ENAU and local partners. The team grows with every report.",
  },
  cleaning: {
    headline: "every street. every corner. every day.",
    body: "Today, the students and local volunteers clean and document the village. Next: paid local cleaning teams, every day. Paid work, not promises.",
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
    body: "We are developing a model in which international tourism directly funds the preservation of Sidi Bou Said. One gate, one village: every visitor enters the old village through the flower gate.",
    tagline: "Visit. Contribute. Preserve.",
    tunisianLabel: "Tunisian visitors",
    tunisianText: "Proposed: free. Always.",
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
    headline: "Radical transparency.",
    body: "Every contribution. Every expense. Every result.",
    support:
      "Public reports will show where the money came from, where it went and what changed.",
    rows: [
      { label: "cleaning", note: "daily street teams" },
      { label: "students and local workers", note: "paid work, not promises" },
      { label: "flowers and public spaces", note: "fell, jasmine, planting days" },
      { label: "preservation", note: "the historic fabric of the village" },
      { label: "local community", note: "cafés, shops, families" },
      { label: "project infrastructure", note: "tools, transport, reports" },
    ],
    honesty: "First public report: [MONTH] 2026.",
  },
  progress: {
    headline: "Proof, not promises.",
    body: "Real numbers land here with the first public report: [MONTH] 2026.",
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
    body: "Recognition is not the finish line. It is a responsibility. UNESCO placed Sidi Bou Said on the World Heritage List on 25 July 2026. Now we act: for the streets, for the people, for the next 500 years.",
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
    headline: "Your support keeps the streets clean.",
    body: "On a phone, one tap opens the donation page. On a computer, you can scan the QR code.",
    whyTitle: "What a contribution does",
    why: [
      "Puts paid local cleaning teams on the streets every day",
      "Plants fell and jasmine in public spaces",
      "Builds the flower gate where the old village begins",
    ],
    trust: "Every contribution is accounted for in the first public report.",
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
  marquee: "Plastique dehors. Beauté de retour.",
  journey: [
    {
      label: "la ville",
      kicker: "sidi bou said, tunisie",
      title: "Protéger Sidi Bou Said pour les 500 prochaines années.",
      body: "Notre première mission : faire de Sidi Bou Said le village le plus propre du monde.",
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
    body: "Le tourisme n'est pas l'ennemi. L'impact non maîtrisé l'est. Les visiteurs peuvent faire partie de la solution.",
    lines: [
      "le plastique.",
      "les mégots.",
      "les déchets.",
      "les marches et murs usés.",
    ],
  },
  mission: {
    headline: "Le village le plus propre du monde.",
    sub: "Le nettoyage, c'est par là que tout commence. Étudiants et habitants gardent les rues propres, les murs verts et le village documenté.",
    rows: [
      "propre : chaque rue, chaque jour.",
      "vert : fell et jasmin.",
      "documenter : les étudiants cartographient le village.",
    ],
    footer: "",
  },
  people: {
    headline: "La prochaine génération prend ses responsabilités.",
    body: "Le village devient la salle de classe.",
    body2:
      "Des étudiants en architecture de l'ENAU travaillent aux côtés des habitants pour observer, documenter, concevoir et améliorer le village.",
    goals: ["échanger", "dessiner", "planifier", "nettoyer", "planter", "documenter"],
  },
  team: {
    headline: "Les personnes derrière la mission.",
    body: "Des étudiants en architecture de l'ENAU et des partenaires locaux. L'équipe grandit à chaque rapport.",
  },
  cleaning: {
    headline: "chaque rue. chaque coin. chaque jour.",
    body: "Aujourd'hui, les étudiants et les bénévoles locaux nettoient et documentent le village. Ensuite : des équipes locales payées, chaque jour. Du travail payé, pas des promesses.",
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
    body: "Nous développons un modèle dans lequel le tourisme international finance directement la préservation de Sidi Bou Said. Une porte, un village : chaque visiteur entre dans le vieux village par la porte fleurie.",
    tagline: "Visiter. Contribuer. Préserver.",
    tunisianLabel: "Visiteurs tunisiens",
    tunisianText: "Proposé : libre. Toujours.",
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
    headline: "Transparence radicale.",
    body: "Chaque contribution. Chaque dépense. Chaque résultat.",
    support:
      "Les rapports publics montreront d'où vient l'argent, où il va et ce qui change.",
    rows: [
      { label: "nettoyage", note: "équipes de rue quotidiennes" },
      { label: "étudiants et travailleurs locaux", note: "travail payé, pas des promesses" },
      { label: "fleurs et espaces publics", note: "fell, jasmin, jours de plantation" },
      { label: "préservation", note: "le tissu historique du village" },
      { label: "communauté locale", note: "cafés, boutiques, familles" },
      { label: "infrastructure du projet", note: "outils, transport, rapports" },
    ],
    honesty: "Premier rapport public : [MONTH] 2026.",
  },
  progress: {
    headline: "Des preuves, pas des promesses.",
    body: "Les vrais chiffres arriveront avec le premier rapport public : [MONTH] 2026.",
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
    body: "La reconnaissance n'est pas la ligne d'arrivée. C'est une responsabilité. L'UNESCO a inscrit Sidi Bou Said au patrimoine mondial le 25 juillet 2026. Alors nous agissons : pour les rues, pour les gens, pour les 500 prochaines années.",
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
    headline: "Votre soutien garde les rues propres.",
    body: "Sur un téléphone, une seule pression ouvre la page de don. Sur un ordinateur, vous pouvez scanner le QR code.",
    whyTitle: "Ce que fait une contribution",
    why: [
      "Met des équipes locales payées dans les rues chaque jour",
      "Plante du fell et du jasmin dans les espaces publics",
      "Construit la porte fleurie là où commence le vieux village",
    ],
    trust: "Chaque contribution est comptabilisée dans le premier rapport public.",
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
  marquee: "أخرجوا البلاستيك. أعيدوا الجمال.",
  journey: [
    {
      label: "البلدة",
      kicker: "سيدي بوسعيد، تونس",
      title: "حماية سيدي بوسعيد لخمسمئة عام قادمة.",
      body: "مهمتنا الأولى: جعل سيدي بوسعيد أنظف قرية في العالم.",
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
      title: "أنظف مدينة في العالم.",
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
    headline: "الملايين يأتون لجمالها. كل زيارة تترك شيئاً خلفها.",
    body: "السياحة ليست العدو. الأثر غير المُدار هو كذلك. الزوار يمكنهم أن يكونوا جزءاً من الحل.",
    lines: [
      "البلاستيك.",
      "أعقاب السجائر.",
      "النفايات.",
      "درجات وجدران بليت.",
    ],
  },
  mission: {
    headline: "أنظف قرية في العالم.",
    sub: "التنظيف هو نقطة البداية. الطلّاب والأهالي يحافظون على الشوارع نظيفة، والجدران خضراء، والقرية موثّقة.",
    rows: [
      "نظيف: كل شارع، كل يوم.",
      "أخضر: فلّ وياسمين.",
      "توثيق: الطلّاب يرسّمون القرية.",
    ],
    footer: "",
  },
  people: {
    headline: "الجيل القادم يتحمّل المسؤولية.",
    body: "القرية تصبح قاعة الدرس.",
    body2:
      "طلّاب عمارة من إينو يعملون مع الأهالي لمراقبة القرية وتوثيقها وتصميمها وتحسينها.",
    goals: ["تحاور", "رسم", "تخطيط", "تنظيف", "زراعة", "توثيق"],
  },
  team: {
    headline: "الناس وراء المهمّة.",
    body: "طلّاب عمارة من إينو وشركاء محليون. الفريق ينمو مع كل تقرير.",
  },
  cleaning: {
    headline: "كل شارع. كل زاوية. كل يوم.",
    body: "اليوم، ينظّف الطلّاب والمتطوعون المحليون القرية ويوثّقونها. بعدها: فرق تنظيف محلية بأجر، كل يوم. عمل بأجر، لا وعود.",
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
    body: "نطوّر نموذجاً يمول فيه السياحة الدولية مباشرةً الحفاظ على سيدي بوسعيد. بوابة واحدة، قرية واحدة: كل زائر يدخل القرية القديمة عبر بوابة الزهور.",
    tagline: "زُر. ساهم. احفظ.",
    tunisianLabel: "الزوار التونسيون",
    tunisianText: "مقترح: مجاناً. دائماً.",
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
    headline: "شفافية جذرية.",
    body: "كل مساهمة. كل مصروف. كل نتيجة.",
    support:
      "التقارير العامة ستُظهر من أين جاء المال، وإلى أين ذهب، وماذا تغيّر.",
    rows: [
      { label: "التنظيف", note: "فرق يومية في الشوارع" },
      { label: "الطلّاب والعمال المحليون", note: "عمل بأجر، لا وعود" },
      { label: "الزهور والأماكن العامة", note: "فلّ، ياسمين، أيام زراعة" },
      { label: "الحفاظ على التراث", note: "النسيج التاريخي للقرية" },
      { label: "المجتمع المحلي", note: "مقاهٍ، محلات، عائلات" },
      { label: "بنية المشروع", note: "أدوات، نقل، تقارير" },
    ],
    honesty: "أول تقرير عام: [MONTH] 2026.",
  },
  progress: {
    headline: "إثبات، لا وعود.",
    body: "الأرقام الحقيقية ستظهر مع التقرير العام الأول: [MONTH] 2026.",
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
    body: "الاعتراف ليس خط النهاية. إنه مسؤولية. أدرجت اليونسكو سيدي بوسعيد في قائمة التراث العالمي في 25 يوليو 2026. لذلك نتحرك: من أجل الشوارع، ومن أجل الناس، ومن أجل الـ500 عام القادمة.",
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
    headline: "دعمك يُبقي الشوارع نظيفة.",
    body: "على الهاتف: ضغطة واحدة تفتح صفحة التبرّع. على الحاسوب: يمكنك مسح رمز الاستجابة.",
    whyTitle: "ماذا تصنع المساهمة",
    why: [
      "يضع فرق تنظيف محلية بأجر في الشوارع كل يوم",
      "يزرع فلّاً وياسمين في الأماكن العامة",
      "يبني بوابة الزهور حيث تبدأ القرية القديمة",
    ],
    trust: "كل مساهمة تُحسب في التقرير العام الأول.",
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
  marquee: "Plastik raus. Schönheit zurück.",
  journey: [
    {
      label: "die Stadt",
      kicker: "sidi bou said, tunesien",
      title: "Sidi Bou Said für die nächsten 500 Jahre schützen.",
      body: "Unsere erste Mission: Sidi Bou Said zum saubersten Dorf der Welt machen.",
    },
    {
      label: "die Gassen",
      title: "Weißer Kalk und Kobaltblau.",
      body: "Zuerst sieht man das Problem nicht. Es versteckt sich unter der Bougainvillea.",
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
      title: "Die sauberste Stadt der Welt.",
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
    body: "Tourismus ist nicht der Feind. Unkontrollierte Auswirkungen sind es. Besucher können Teil der Lösung sein.",
    lines: [
      "das Plastik.",
      "die Zigarettenstummel.",
      "der Müll.",
      "abgenutzte Stufen und Mauern.",
    ],
  },
  mission: {
    headline: "Das sauberste Dorf der Welt.",
    sub: "Reinigen ist der Anfang. Studierende und Einheimische halten die Straßen sauber, die Wände grün und das Dorf dokumentiert.",
    rows: [
      "sauber: jede Straße, jeden Tag.",
      "grün: fell und Jasmin.",
      "dokumentieren: die Studierenden kartieren das Dorf.",
    ],
    footer: "",
  },
  people: {
    headline: "Die nächste Generation übernimmt Verantwortung.",
    body: "Das Dorf wird zum Klassenzimmer.",
    body2:
      "Architekturstudierende der ENAU arbeiten mit Einheimischen zusammen, um das Dorf zu beobachten, zu dokumentieren, zu gestalten und zu verbessern.",
    goals: ["Reden", "Zeichnen", "Planen", "Reinigen", "Pflanzen", "Dokumentieren"],
  },
  team: {
    headline: "Die Menschen hinter der Mission.",
    body: "Architekturstudierende der ENAU und lokale Partner. Das Team wächst mit jedem Bericht.",
  },
  cleaning: {
    headline: "jede Straße. jede Ecke. jeden Tag.",
    body: "Heute reinigen und dokumentieren Studierende und lokale Freiwillige das Dorf. Als Nächstes: bezahlte lokale Reinigungsteams, jeden Tag. Bezahlte Arbeit, keine Versprechen.",
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
    body: "Wir entwickeln ein Modell, in dem internationaler Tourismus die Erhaltung von Sidi Bou Said direkt finanziert. Ein Tor, ein Dorf: Jeder Besucher betritt das alte Dorf durch das Blumentor.",
    tagline: "Besuchen. Beitragen. Bewahren.",
    tunisianLabel: "Tunesische Besucher",
    tunisianText: "Vorgeschlagen: frei. Immer.",
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
    headline: "Radikale Transparenz.",
    body: "Jeder Beitrag. Jede Ausgabe. Jedes Ergebnis.",
    support:
      "Öffentliche Berichte zeigen, woher das Geld kommt, wohin es fließt und was sich verändert.",
    rows: [
      { label: "Reinigung", note: "tägliche Straßenteams" },
      { label: "Studierende und lokale Arbeiter", note: "bezahlte Arbeit, keine Versprechen" },
      { label: "Blumen und öffentliche Räume", note: "fell, Jasmin, Pflanztage" },
      { label: "Erhalt", note: "das historische Gefüge des Dorfes" },
      { label: "lokale Gemeinschaft", note: "Cafés, Läden, Familien" },
      { label: "Projektinfrastruktur", note: "Werkzeug, Transport, Berichte" },
    ],
    honesty: "Erster öffentlicher Bericht: [MONTH] 2026.",
  },
  progress: {
    headline: "Beweise, keine Versprechen.",
    body: "Die echten Zahlen erscheinen mit dem ersten öffentlichen Bericht: [MONTH] 2026.",
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
    body: "Die Anerkennung ist nicht die Ziellinie. Sie ist eine Verantwortung. Die UNESCO hat Sidi Bou Said am 25. Juli 2026 in die Welterbeliste aufgenommen. Also handeln wir: für die Straßen, für die Menschen, für die nächsten 500 Jahre.",
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
    headline: "Dein Beitrag hält die Straßen sauber.",
    body: "Am Telefon öffnet ein Tippen die Spendenseite. Am Computer kannst du den QR-Code scannen.",
    whyTitle: "Was ein Beitrag bewirkt",
    why: [
      "Bringt bezahlte lokale Reinigungsteams jeden Tag in die Straßen",
      "Pflanzt fell und Jasmin in öffentlichen Räumen",
      "Baut das Blumentor dort, wo das alte Dorf beginnt",
    ],
    trust: "Jeder Beitrag wird im ersten öffentlichen Bericht ausgewiesen.",
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