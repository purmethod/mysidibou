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
  heroLine: "students. locals. one city. one mission.",
  marquee: "plastic out. beauty back.",
  journey: [
    {
      label: "the town",
      kicker: "sidi bou said, tunisia",
      title: "Protecting Sidi Bou Said for the next 500 years.",
      body: "Our first mission: make Sidi Bou Said the cleanest city in the world.",
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
    headline: "Millions come to experience its beauty. Together, we can help preserve it.",
    body: "Tourism is not the enemy. Unmanaged impact is the challenge. Visitors can become part of the solution.",
    lines: [
      "plastic.",
      "cigarette butts.",
      "waste.",
      "mass tourism.",
      "wear on public spaces.",
    ],
  },
  mission: {
    headline: "The cleanest city in the world.",
    sub: "Cleaning is only the beginning. Architecture, tourism, students, locals, environment and culture, working together.",
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
    body: "The city becomes the classroom.",
    body2:
      "A team of students works alongside local people to observe, document, design and improve the town.",
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
    value:
      "Preservation should create local value. What the project generates flows back into the town: workers, students, craftsmen, public spaces, nature, preservation.",
  },
  entrance: {
    headline: "Let nature build the entrance.",
    body: "No concrete. No heavy masonry. Only conditions: climbing plants, bougainvillea, thin wires, light trellises. Nature builds the architecture.",
  },
  contribution: {
    headline: "A new model for responsible tourism.",
    body: "We are developing a model in which international tourism can directly contribute to the preservation of Sidi Bou Said.",
    tagline: "Visit. Contribute. Preserve.",
    tunisianLabel: "Tunisian visitors",
    tunisianText: "Proposed: remain free.",
    internationalLabel: "International visitors",
    internationalText: "Proposed: contribute to preservation.",
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
      { label: "flowers and public spaces", note: "bougainvillea, jasmine, planting days" },
      { label: "preservation", note: "the historic fabric of the town" },
      { label: "local community", note: "cafés, shops, families" },
      { label: "project infrastructure", note: "tools, transport, reports" },
    ],
    honesty: "The first public report is being prepared.",
  },
  progress: {
    headline: "Proof, not promises.",
    body: "Real numbers land here with the first public report.",
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
    body: "Recognition is not the finish line. It is a responsibility. UNESCO placed Sidi Bou Said on the World Heritage List in 2026. Now we act: for the streets, for the people, for the next 500 years.",
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
    trust: "Every contribution is accounted for in the first public report.",
    qrSoon: "qr code coming soon",
    linkSoon:
      "The secure donation link opens here as soon as it is ready. Follow the mission in the meantime.",
  },
  finale: {
    headline: "One city. One generation. One responsibility.",
    sub: "Help us protect Sidi Bou Said.",
  },
  footer: {
    missionLine: "Protecting Sidi Bou Said for the next 500 years.",
    tagline: "Students. Locals. Visitors. One city. One responsibility.",
    location: "Sidi Bou Said, Tunisia",
    heritage: "UNESCO World Heritage Site since 2026",
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
  heroLine: "étudiants. habitants. une ville. une mission.",
  marquee: "Plastique dehors. Beauté de retour.",
  journey: [
    {
      label: "la ville",
      kicker: "sidi bou said, tunisie",
      title: "Protéger Sidi Bou Said pour les 500 prochaines années.",
      body: "Notre première mission : faire de Sidi Bou Said la ville la plus propre du monde.",
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
    headline: "Des millions viennent découvrir sa beauté. Ensemble, nous pouvons aider à la préserver.",
    body: "Le tourisme n'est pas l'ennemi. L'impact non maîtrisé est le défi. Les visiteurs peuvent faire partie de la solution.",
    lines: [
      "le plastique.",
      "les mégots.",
      "les déchets.",
      "le tourisme de masse.",
      "l'usure des espaces publics.",
    ],
  },
  mission: {
    headline: "La ville la plus propre du monde.",
    sub: "Le nettoyage n'est que le début. Architecture, tourisme, étudiants, habitants, environnement et culture, ensemble.",
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
    body: "La ville devient la salle de classe.",
    body2:
      "Une équipe d'étudiants travaille aux côtés des habitants pour observer, documenter, concevoir et améliorer la ville.",
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
    value:
      "Préserver doit créer de la valeur locale. Ce que le projet génère rejaillit sur la ville : travailleurs, étudiants, artisans, espaces publics, nature, préservation.",
  },
  entrance: {
    headline: "Laissez la nature construire l'entrée.",
    body: "Pas de béton. Pas de maçonnerie lourde. Seulement des conditions : plantes grimpantes, bougainvilliers, fils fins, treillis légers. La nature bâtit l'architecture.",
  },
  contribution: {
    headline: "Un nouveau modèle de tourisme responsable.",
    body: "Nous développons un modèle dans lequel le tourisme international peut contribuer directement à la préservation de Sidi Bou Said.",
    tagline: "Visiter. Contribuer. Préserver.",
    tunisianLabel: "Visiteurs tunisiens",
    tunisianText: "Proposé : rester libres.",
    internationalLabel: "Visiteurs internationaux",
    internationalText: "Proposé : contribuer à la préservation.",
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
      { label: "fleurs et espaces publics", note: "bougainvilliers, jasmin, plantations" },
      { label: "préservation", note: "le tissu historique de la ville" },
      { label: "communauté locale", note: "cafés, boutiques, familles" },
      { label: "infrastructure du projet", note: "outils, transport, rapports" },
    ],
    honesty: "Le premier rapport public est en préparation.",
  },
  progress: {
    headline: "Des preuves, pas des promesses.",
    body: "Les vrais chiffres arriveront avec le premier rapport public.",
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
    body: "La reconnaissance n'est pas la ligne d'arrivée. C'est une responsabilité. L'UNESCO a inscrit Sidi Bou Said au patrimoine mondial en 2026. Alors nous agissons : pour les rues, pour les gens, pour les 500 prochaines années.",
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
    trust: "Chaque contribution est comptabilisée dans le premier rapport public.",
    qrSoon: "code qr bientôt disponible",
    linkSoon:
      "Le lien de don sécurisé s'ouvrira ici dès qu'il sera prêt. En attendant, suivez la mission.",
  },
  finale: {
    headline: "Une ville. Une génération. Une responsabilité.",
    sub: "Aidez-nous à protéger Sidi Bou Said.",
  },
  footer: {
    missionLine: "Protéger Sidi Bou Said pour les 500 prochaines années.",
    tagline: "Étudiants. Habitants. Visiteurs. Une ville. Une responsabilité.",
    location: "Sidi Bou Said, Tunisie",
    heritage: "Site du patrimoine mondial de l'UNESCO depuis 2026",
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
  heroLine: "طلّاب. أهل البلدة. مدينة واحدة. رسالة واحدة.",
  marquee: "أخرجوا البلاستيك. أعيدوا الجمال.",
  journey: [
    {
      label: "البلدة",
      kicker: "سيدي بوسعيد، تونس",
      title: "حماية سيدي بوسعيد لخمسمئة عام قادمة.",
      body: "مهمتنا الأولى: جعل سيدي بوسعيد أنظف مدينة في العالم.",
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
    headline: "الملايين يأتون ليعيشوا جمالها. معاً، يمكننا المساعدة في الحفاظ عليها.",
    body: "السياحة ليست العدو. الأثر غير المُدار هو التحدي. الزوار يمكنهم أن يكونوا جزءاً من الحل.",
    lines: [
      "البلاستيك.",
      "أعقاب السجائر.",
      "النفايات.",
      "السياحة الجماعية.",
      "تآكل الأماكن العامة.",
    ],
  },
  mission: {
    headline: "أنظف مدينة في العالم.",
    sub: "التنظيف ليس سوى البداية. عمارة، سياحة، طلّاب، أهالي، بيئة وثقافة، معاً.",
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
    body: "المدينة تصبح قاعة الدرس.",
    body2:
      "فريق من الطلّاب يعمل مع الأهالي لمراقبة المدينة وتوثيقها وتصميمها وتحسينها.",
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
    value:
      "الحفاظ يجب أن يخلق قيمة محلية. ما يولّده المشروع يعود إلى البلدة: عمال، طلّاب، حرفيّون، أماكن عامة، طبيعة، حفظ.",
  },
  entrance: {
    headline: "دعوا الطبيعة تبني المدخل.",
    body: "لا خرسانة. لا بناء حجري ثقيل. فقط شروط: نباتات متسلّقة، بنفسج، أسلاك رفيعة، تعريشات خفيفة. الطبيعة تبني العمارة.",
  },
  contribution: {
    headline: "نموذج جديد للسياحة المسؤولة.",
    body: "نطوّر نموذجاً تساهم فيه السياحة الدولية مباشرةً في الحفاظ على سيدي بوسعيد.",
    tagline: "زُر. ساهم. احفظ.",
    tunisianLabel: "الزوار التونسيون",
    tunisianText: "مقترح: يبقون أحراراً.",
    internationalLabel: "الزوار الدوليون",
    internationalText: "مقترح: المساهمة في الحفظ.",
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
      { label: "الزهور والأماكن العامة", note: "بنفسج، ياسمين، أيام زراعة" },
      { label: "الحفاظ على التراث", note: "النسيج التاريخي للبلدة" },
      { label: "المجتمع المحلي", note: "مقاهٍ، محلات، عائلات" },
      { label: "بنية المشروع", note: "أدوات، نقل، تقارير" },
    ],
    honesty: "التقرير العام الأول قيد الإعداد.",
  },
  progress: {
    headline: "إثبات، لا وعود.",
    body: "الأرقام الحقيقية ستظهر مع التقرير العام الأول.",
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
    body: "الاعتراف ليس خط النهاية. إنه مسؤولية. أدرجت اليونسكو سيدي بوسعيد في قائمة التراث العالمي عام 2026. لذلك نتحرك: من أجل الشوارع، ومن أجل الناس، ومن أجل الـ500 عام القادمة.",
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
    trust: "كل مساهمة تُحسب في التقرير العام الأول.",
    qrSoon: "رمز الاستجابة قريباً",
    linkSoon: "سيُفتح رابط التبرّع هنا فور جاهزيته. إلى ذلك الحين، تابعوا المهمّة.",
  },
  finale: {
    headline: "مدينة واحدة. جيل واحد. مسؤولية واحدة.",
    sub: "ساعدونا في حماية سيدي بوسعيد.",
  },
  footer: {
    missionLine: "حماية سيدي بوسعيد لخمسمئة عام قادمة.",
    tagline: "طلّاب. أهل البلدة. زوار. مدينة واحدة. مسؤولية واحدة.",
    location: "سيدي بوسعيد، تونس",
    heritage: "موقع تراث عالمي لليونسكو منذ 2026",
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
  heroLine: "Studierende. Einheimische. Eine Stadt. Eine Mission.",
  marquee: "Plastik raus. Schönheit zurück.",
  journey: [
    {
      label: "die Stadt",
      kicker: "sidi bou said, tunesien",
      title: "Sidi Bou Said für die nächsten 500 Jahre schützen.",
      body: "Unsere erste Mission: Sidi Bou Said zur saubersten Stadt der Welt machen.",
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
    headline: "Millionen kommen, um ihre Schönheit zu erleben. Gemeinsam können wir helfen, sie zu bewahren.",
    body: "Tourismus ist nicht der Feind. Unkontrollierte Auswirkungen sind die Herausforderung. Besucher können Teil der Lösung sein.",
    lines: [
      "das Plastik.",
      "die Zigarettenstummel.",
      "der Müll.",
      "der Massentourismus.",
      "der Verschleiß der öffentlichen Räume.",
    ],
  },
  mission: {
    headline: "Die sauberste Stadt der Welt.",
    sub: "Reinigen ist nur der Anfang. Architektur, Tourismus, Studierende, Einheimische, Umwelt und Kultur, gemeinsam.",
    rows: [
      "Plastik aus den Straßen",
      "Zigarettenstummel aus den Straßen",
      "Müll aus den Straßen",
    ],
    footer:
      "Bezahlte lokale Reinigungsteams übernehmen jeden Tag Verantwortung. Das langfristige Ziel ist einfach: jede Straße. jede Ecke. jeden Tag. sauber.",
  },
  people: {
    headline: "Die nächste Generation übernimmt Verantwortung.",
    body: "Die Stadt wird zum Klassenzimmer.",
    body2:
      "Ein Team von Studierenden arbeitet mit Einheimischen zusammen, um die Stadt zu beobachten, zu dokumentieren, zu gestalten und zu verbessern.",
    goals: ["Reden", "Zeichnen", "Planen", "Draußen arbeiten", "Reinigen", "Dokumentieren"],
  },
  team: {
    headline: "Die Menschen hinter der Mission.",
    body: "Architekturstudierende und lokale Partner. Namen und Fotos erscheinen hier, während das Team wächst, beginnend mit dem ersten öffentlichen Bericht.",
  },
  cleaning: {
    headline: "jede Straße. jede Ecke. jeden Tag.",
    body: "Wir bauen bezahlte lokale Reinigungsteams auf, die sich täglich um die Straßen kümmern. Plastik raus. Zigarettenstummel raus. Müll raus.",
  },
  locals: {
    headline: "Die Stadt zu schützen stärkt auch das lokale Leben.",
    body: "Die Menschen, die hier leben und arbeiten, sind das Herz von Sidi Bou Said: Blumenverkäufer, kleine Läden, Cafés, Handwerker, Familien.",
    value:
      "Erhalt soll lokalen Wert schaffen. Was das Projekt erwirtschaftet, fließt in die Stadt zurück: Arbeiter, Studierende, Handwerker, öffentliche Räume, Natur, Erhalt.",
  },
  entrance: {
    headline: "Lass die Natur den Eingang bauen.",
    body: "Kein Beton. Kein schweres Mauerwerk. Nur Bedingungen: Kletterpflanzen, Bougainvillea, dünne Drähte, leichte Rankgitter. Die Natur baut die Architektur.",
  },
  contribution: {
    headline: "Ein neues Modell für verantwortungsvollen Tourismus.",
    body: "Wir entwickeln ein Modell, in dem internationaler Tourismus direkt zur Erhaltung von Sidi Bou Said beiträgt.",
    tagline: "Besuchen. Beitragen. Bewahren.",
    tunisianLabel: "Tunesische Besucher",
    tunisianText: "Vorgeschlagen: bleiben frei.",
    internationalLabel: "Internationale Besucher",
    internationalText: "Vorgeschlagen: zur Erhaltung beitragen.",
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
      { label: "Blumen und öffentliche Räume", note: "Bougainvillea, Jasmin, Pflanztage" },
      { label: "Erhalt", note: "das historische Gefüge der Stadt" },
      { label: "lokale Gemeinschaft", note: "Cafés, Läden, Familien" },
      { label: "Projektinfrastruktur", note: "Werkzeug, Transport, Berichte" },
    ],
    honesty: "Der erste öffentliche Bericht wird vorbereitet.",
  },
  progress: {
    headline: "Beweise, keine Versprechen.",
    body: "Die echten Zahlen erscheinen mit dem ersten öffentlichen Bericht.",
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
    body: "Die Anerkennung ist nicht die Ziellinie. Sie ist eine Verantwortung. Die UNESCO hat Sidi Bou Said 2026 in die Welterbeliste aufgenommen. Also handeln wir: für die Straßen, für die Menschen, für die nächsten 500 Jahre.",
  },
  fiveHundred: {
    years: ["200 Jahre.", "300 Jahre.", "500 Jahre."],
    line: "Menschen sollten diese Straßen noch begehen können.",
    footnote: "Wir sind verantwortlich für das, was wir hinterlassen.",
  },
  follow: {
    headline: "Verfolge die Mission.",
    body: "Die Arbeit ist echt, und sie passiert jetzt. Videos, Updates und Geschichten aus den Straßen.",
    comingSoon: "demnächst",
  },
  donateSection: {
    headline: "Dein Beitrag hält die Straßen sauber.",
    body: "Am Telefon öffnet ein Tippen die Spendenseite. Am Computer kannst du den QR-Code scannen.",
    whyTitle: "Was ein Beitrag bewirkt",
    why: [
      "Hält bezahlte lokale Reinigungsteams täglich in den Straßen",
      "Pflanzt Bougainvillea, Jasmin und Blumen in öffentliche Räume",
      "Schützt die Straßen für die nächsten 500 Jahre",
    ],
    trust: "Jeder Beitrag wird im ersten öffentlichen Bericht ausgewiesen.",
    qrSoon: "qr-code in Kürze verfügbar",
    linkSoon:
      "Der sichere Spendelink öffnet sich hier, sobald er bereit ist. Verfolge die Mission in der Zwischenzeit.",
  },
  finale: {
    headline: "Eine Stadt. Eine Generation. Eine Verantwortung.",
    sub: "Hilf uns, Sidi Bou Said zu schützen.",
  },
  footer: {
    missionLine: "Sidi Bou Said für die nächsten 500 Jahre schützen.",
    tagline: "Studierende. Einheimische. Besucher. Eine Stadt. Eine Verantwortung.",
    location: "Sidi Bou Said, Tunesien",
    heritage: "UNESCO-Welterbestätte seit 2026",
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