import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const loadTranslations = async () => {
  try {
    const [en, ru] = await Promise.all([
      fetch('/locales/en.json').then((res) => {
        if (!res.ok) throw new Error('Не удалось загрузить en.json');
        return res.json();
      }),
      fetch('/locales/ru.json').then((res) => {
        if (!res.ok) throw new Error('Не удалось загрузить ru.json');
        return res.json();
      }),
    ]);

    if (!i18next.isInitialized) {
      return i18next
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
    }
  } catch (error) {
    console.error('Ошибка при загрузке переводов:', error);
    return i18next.init({
      lng: 'en',
      fallbackLng: 'en',
      resources: {
        en: {
          translation: {
            error: 'Ошибка загрузки переводов',
          },
        },
      },
    });
  }
};

export const i18nPromise = loadTranslations();
export default i18next;
