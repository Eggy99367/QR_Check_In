import { useNavigate } from 'react-router-dom';
import styles from './home-page.module.css';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="pageContainer">
      <div className={styles.contentBox}>
        <div className={styles.header}>
          <h1>QR Check-In System</h1>
          <p className={styles.subtitle}>Streamline your event check-ins with QR codes</p>
        </div>

        <div className={styles.features}>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>📊</div>
            <h3>Manage Spreadsheets</h3>
            <p>Connect your Google Sheets to automatically sync registration data and track check-ins in real-time.</p>
          </div>

          <div className={styles.feature}>
            <div className={styles.featureIcon}>📧</div>
            <h3>Email QR Codes</h3>
            <p>Automatically send personalized QR codes to registered attendees via email for seamless check-in.</p>
          </div>

          <div className={styles.feature}>
            <div className={styles.featureIcon}>📱</div>
            <h3>Quick Scanning</h3>
            <p>Use your device's camera to scan QR codes and instantly check in attendees with audio feedback.</p>
          </div>

          <div className={styles.feature}>
            <div className={styles.featureIcon}>📈</div>
            <h3>Real-time Analytics</h3>
            <p>Monitor check-in statistics, track attendance, and get insights into your event's success.</p>
          </div>
        </div>

        <div className={styles.cta}>
          <h2>Get Started</h2>
          <p>Ready to streamline your event check-ins?</p>
          <div className={styles.buttonGroup}>
            <button 
              onClick={() => navigate('/manage')} 
              className={styles.primaryButton}
            >
              Manage Events
            </button>
            <button 
              onClick={() => navigate('/select-event')} 
              className={styles.secondaryButton}
            >
              Check-In Station
            </button>
          </div>
        </div>

        <div className={styles.footer}>
          <a 
            onClick={() => navigate('/privacy')} 
            className={styles.footerLink}
            style={{ cursor: 'pointer' }}
          >
            Privacy Policy
          </a>
          <span className={styles.separator}>•</span>
          <a href="mailto:support@qrcheckin.com" className={styles.footerLink}>
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
};

export default HomePage;