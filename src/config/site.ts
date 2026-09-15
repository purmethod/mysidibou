/**
 * mysidibou — central editable configuration.
 *
 * Everything content-related that is NOT translation copy lives here:
 * links, media paths, placeholder data. Replace values here and the whole
 * site updates. Real data and photos can be swapped in at any time.
 */

export const site = {
  brand: {
    name: "mysidibou",
    // Always lowercase, never rewritten to other spellings.
    // Theme color for the browser chrome / PWA.
    themeColor: "#f7f5ef",
  },

  /* ---------- Donation ---------- */
  // Replace "[DONATION_LINK]" with the real donation URL (one tap on mobile).
  donate: {
    link: "[DONATION_LINK]",
    // When the QR code is ready, drop its file into public/assets/ and set
    // the path here. The QR tile only shows on desktop (mobile opens the link).
    qrImage: "",
    qrAlt: "mysidibou donation QR code",
  },

  /* ---------- Social media ---------- */
  social: {
    instagram: "https://instagram.com/mysidibou",
    instagramHandle: "@mysidibou",
    tiktok: "https://www.tiktok.com/@mysidibou",
    tiktokHandle: "@mysidibou",
    youtube: "https://www.youtube.com/@mysidibou",
    youtubeHandle: "@mysidibou",
  },

  /* ---------- Photography (replace with your own photos anytime) ---------- */
  media: {
    hero: "/assets/hero.jpg", // the first screen
    students: "/assets/students.jpg", // architecture students at work
    flowerSeller: "/assets/flower-seller.jpg", // local life
    cleaning: "/assets/cleaning.jpg", // the actual cleaning mission
    entrance: "/assets/entrance.jpg", // let nature build the entrance
    historic: "/assets/historic.jpg", // 500-years archive image
    // Before / after pairs for the progress section:
    beforeAfter: {
      before: "",
      after: "",
    },
  },

  /* ---------- Progress statistics (placeholders until real data) ----------
   * Values shown until the first public report. Keep them honest: "—" means
   * "not counted yet". Labels come from the translations (progress.statLabels).
   */
  stats: [
    { value: "-" }, // kilograms of waste removed
    { value: "-" }, // cigarette butts collected
    { value: "-" }, // streets cleaned
    { value: "-" }, // students involved
    { value: "-" }, // local participants
    { value: "-" }, // flowers planted
    { value: "-" }, // public spaces improved
    { value: "-" }, // money contributed
    { value: "-" }, // money reinvested
  ],

  /* ---------- Team (placeholders until real members) ----------
   * Set a member's `photo` to "/assets/<file>.jpg", their name and
   * Instagram handle, and the circular slot fills in automatically.
   */
  team: [
    { name: "Paul Brinkmann", university: "University of Stuttgart", role: "Founder & Architect", photo: "/assets/team-founder.jpg", instagram: "@buildpaul" },
    { name: "Manel Chaabene", university: "ENAU", role: "Admin", photo: "/assets/team-manel.jpg", instagram: "@manel_chaaben" },
    { name: "Yasmine Hadj Said", university: "ENAU", role: "Social Media", photo: "/assets/team-yasmine.jpg", instagram: "@yasmine_hadjsaid" },
    { name: "Ahmed Khmiri", university: "ENAU", role: "Social Media", photo: "/assets/team-ahmed.jpg", instagram: "@appareil_de_golgi" },
    { name: "Maram Jelassi", university: "ENAU", role: "Social Media", photo: "/assets/team-maram.jpg", instagram: "@pty.yurii" },
    { name: "Ayari Mondher", university: "Sidi Bou Said", role: "Jasmin Artisan", photo: "/assets/team-ayari.jpg", instagram: "" },
    { name: "Khamis El Bahri", university: "Sidi Bou Said", role: "Jasmin Artisan", photo: "/assets/team-khamis.jpg", instagram: "" },
    { name: "Mohamed Amine Farhani", university: "Sidi Bou Said", role: "Jasmin Artisan", photo: "/assets/team-farhani.jpg", instagram: "" },
  ],

  /* ---------- UNESCO ---------- */
  unesco: {
    siteSince: 2026,
    // No logo is used: the platform/logo is only shown when legally provided.
  },
};