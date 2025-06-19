import { en } from './en';
import { zhTW } from './zh-TW';

export const translations = {
  en,
  'zh-TW': zhTW
};

export const getTranslation = (language, key, params = {}) => {
  const keys = key.split('.');
  let translation = translations[language];
  
  for (const k of keys) {
    if (translation && typeof translation === 'object') {
      translation = translation[k];
    } else {
      // Fallback to English if translation not found
      translation = translations.en;
      for (const fallbackKey of keys) {
        if (translation && typeof translation === 'object') {
          translation = translation[fallbackKey];
        } else {
          return key; // Return key if no translation found
        }
      }
      break;
    }
  }
  
  if (typeof translation === 'string') {
    // Replace parameters in the translation
    return translation.replace(/\{(\w+)\}/g, (match, paramKey) => {
      return params[paramKey] || match;
    });
  }
  
  return key; // Return key if no valid translation found
}; 