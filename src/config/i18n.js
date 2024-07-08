import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import locale from '../locale/index';

const resources = {
  en: {
    translation: locale.en,
  },
  vi: {
    translation: locale.vi,
  },
  zh: {
    translation: locale.zh,
  },
};

i18n.use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;