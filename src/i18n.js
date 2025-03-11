import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Импорт локальных JSON-файлов с переводами
import translationEN from './locales/en.json';
import translationRU from './locales/ru.json';

i18next
  .use(LanguageDetector) // Определение языка пользователя
  .init({
    resources: {
      en: { translation: translationEN },
      ru: { translation: translationRU },
    },
    fallbackLng: 'en', // Язык по умолчанию
    debug: true, // Включаем логи в консоли
    interpolation: {
      escapeValue: false, // Отключаем экранирование HTML
    },
  });

export default i18next;
