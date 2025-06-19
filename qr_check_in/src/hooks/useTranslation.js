import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../translations';

export const useTranslation = () => {
  const { currentLanguage } = useLanguage();
  
  const t = (key, params = {}) => {
    return getTranslation(currentLanguage, key, params);
  };
  
  return { t };
}; 