export const GO_COPY = {
  en: { support: 'Support us', coffee: 'Buy the team a coffee', opening: 'Opening…', preparing: 'Preparing…', retry: 'Please try again.', error: 'Payment is unavailable right now. Please try again.', coffeeThanks: 'Thank you for the team’s coffee!', pending: 'Your payment is being processed.', custom: 'Your contribution in euros', range: 'Enter an amount from €20 to €10,000.', euroFallback: 'Charged in EUR', or: 'or' },
  de: { support: 'Unterstütze uns', coffee: 'Kaufe dem Team einen Kaffee', opening: 'Wird geöffnet…', preparing: 'Wird vorbereitet…', retry: 'Bitte erneut versuchen.', error: 'Die Zahlung ist gerade nicht verfügbar. Bitte erneut versuchen.', coffeeThanks: 'Danke für den Kaffee fürs Team!', pending: 'Deine Zahlung wird verarbeitet.', custom: 'Dein Beitrag in Euro', range: 'Gib einen Betrag von 20 € bis 10.000 € ein.', euroFallback: 'Abrechnung in EUR', or: 'oder' },
  fr: { support: 'Soutenez-nous', coffee: 'Offrez un café à l’équipe', opening: 'Ouverture…', preparing: 'Préparation…', retry: 'Veuillez réessayer.', error: 'Le paiement est indisponible. Veuillez réessayer.', coffeeThanks: 'Merci pour le café de l’équipe !', pending: 'Votre paiement est en cours.', custom: 'Votre contribution en euros', range: 'Saisissez un montant entre 20 € et 10 000 €.', euroFallback: 'Paiement en EUR', or: 'ou' },
  it: { support: 'Sostienici', coffee: 'Offri un caffè al team', opening: 'Apertura…', preparing: 'Preparazione…', retry: 'Riprova.', error: 'Pagamento non disponibile. Riprova.', coffeeThanks: 'Grazie per il caffè al team!', pending: 'Il pagamento è in elaborazione.', custom: 'Il tuo contributo in euro', range: 'Inserisci un importo da 20 € a 10.000 €.', euroFallback: 'Addebito in EUR', or: 'o' },
  es: { support: 'Apóyanos', coffee: 'Invita al equipo a un café', opening: 'Abriendo…', preparing: 'Preparando…', retry: 'Inténtalo de nuevo.', error: 'El pago no está disponible. Inténtalo de nuevo.', coffeeThanks: '¡Gracias por el café para el equipo!', pending: 'Tu pago se está procesando.', custom: 'Tu aportación en euros', range: 'Introduce un importe de 20 € a 10.000 €.', euroFallback: 'Cobro en EUR', or: 'o' },
  ar: { support: 'ادعمونا', coffee: 'قدّم قهوة للفريق', opening: 'جارٍ الفتح…', preparing: 'جارٍ التحضير…', retry: 'يرجى المحاولة مجدداً.', error: 'الدفع غير متاح حالياً. يرجى المحاولة مجدداً.', coffeeThanks: 'شكراً على القهوة للفريق!', pending: 'جارٍ معالجة دفعتك.', custom: 'مساهمتك باليورو', range: 'أدخل مبلغاً من 20 إلى 10000 يورو.', euroFallback: 'الدفع باليورو', or: 'أو' },
  ru: { support: 'Поддержите нас', coffee: 'Угостите команду кофе', opening: 'Открываем…', preparing: 'Подготовка…', retry: 'Попробуйте ещё раз.', error: 'Оплата недоступна. Попробуйте ещё раз.', coffeeThanks: 'Спасибо за кофе для команды!', pending: 'Ваш платёж обрабатывается.', custom: 'Ваш взнос в евро', range: 'Введите сумму от 20 до 10 000 евро.', euroFallback: 'Оплата в EUR', or: 'или' },
} as const;

export type GoLanguage = keyof typeof GO_COPY;
export function goLanguage(locales: readonly string[]): GoLanguage {
  for (const locale of locales) {
    const language = locale.toLowerCase().split('-')[0];
    if (Object.hasOwn(GO_COPY, language)) return language as GoLanguage;
  }
  return 'en';
}
