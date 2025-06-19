import { Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import styles from './home-page.module.css';

const HomePage = () => {
  const { t } = useTranslation();

  const handlePrivacyClick = () => {
    window.open('/privacy', '_blank');
  };

  const handleSupportClick = () => {
    window.open('mailto:support@example.com', '_blank');
  };

  return (
    <div className="pageContainer">
      <div className={styles.contentBox}>
        <div className={styles.header}>
          <h1>{t('home.title')}</h1>
          <p className={styles.subtitle}>{t('home.subtitle')}</p>
        </div>

        <div className={styles.features}>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>📊</div>
            <h3>{t('home.features.manage.title')}</h3>
            <p>{t('home.features.manage.description')}</p>
          </div>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>📧</div>
            <h3>{t('home.features.email.title')}</h3>
            <p>{t('home.features.email.description')}</p>
          </div>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>📱</div>
            <h3>{t('home.features.scan.title')}</h3>
            <p>{t('home.features.scan.description')}</p>
          </div>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>📈</div>
            <h3>{t('home.features.analytics.title')}</h3>
            <p>{t('home.features.analytics.description')}</p>
          </div>
        </div>

        <div className={styles.cta}>
          <h2>{t('home.cta.title')}</h2>
          <p>{t('home.cta.description')}</p>
          <div className={styles.buttonGroup}>
            <Link to="/manage" className={styles.primaryButton}>
              {t('home.cta.manageButton')}
            </Link>
            <Link to="/select-event" className={styles.secondaryButton}>
              {t('home.cta.checkinButton')}
            </Link>
          </div>
        </div>

        <div className={styles.footer}>
          <button onClick={handlePrivacyClick} className={styles.footerLink}>
            {t('home.footer.privacy')}
          </button>
          <span className={styles.separator}>•</span>
          <button onClick={handleSupportClick} className={styles.footerLink}>
            {t('home.footer.support')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;