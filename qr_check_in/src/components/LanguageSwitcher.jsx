import { useLanguage } from '../contexts/LanguageContext';
import styles from './LanguageSwitcher.module.css';

const LanguageSwitcher = () => {
  const { currentLanguage, switchLanguage } = useLanguage();

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'zh-TW', label: '繁體中文' }
  ];

  const handleLanguageChange = (languageCode) => {
    switchLanguage(languageCode);
  };

  return (
    <div className={styles.languageSwitcher}>
      <div className={styles.languageIcon}>🌐</div>
      <select 
        value={currentLanguage} 
        onChange={(e) => handleLanguageChange(e.target.value)}
        className={styles.languageSelect}
      >
        {languages.map((language) => (
          <option key={language.code} value={language.code}>
            {language.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSwitcher; 