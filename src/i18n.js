import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const loadTranslations = async () => {
  const [en, ru] = await Promise.all([
    fetch('/locales/en.json').then((res) => res.json()),
    fetch('/locales/ru.json').then((res) => res.json()),
  ]);

  i18next
    .use(LanguageDetector)
    .init({
      resources: {
        en: { translation: en },
        ru: { translation: ru },
      },
      fallbackLng: 'en',
      debug: true,
      interpolation: { escapeValue: false },
    });
};

loadTranslations();

export default i18next;
