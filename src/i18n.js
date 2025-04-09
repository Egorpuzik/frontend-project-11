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

    return { en, ru };
  } catch (error) {
    console.error('Ошибка при загрузке переводов:', error);
    return null;
  }
};

export default async () => {
  const translations = await loadTranslations();

  await i18next
    .use(LanguageDetector)
    .init({
      resources: translations || {
        en: { translation: { error: 'Ошибка загрузки переводов' } },
      },
      fallbackLng: 'en',
      debug: true,
      interpolation: { escapeValue: false },
    });
};
