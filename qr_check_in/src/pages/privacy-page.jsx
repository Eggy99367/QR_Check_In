import { Link } from 'react-router-dom';
import styles from './privacy-page.module.css';

const PrivacyPage = () => {
  return (
    <div className="pageContainer">
      <div className={styles.contentBox}>
        <div className={styles.header}>
          <h1>Privacy Policy</h1>
          <p className={styles.lastUpdated}>Last updated: June 5, 2024</p>
        </div>

        <div className={styles.section}>
          <h2>1. Information We Collect</h2>
          <p>QR Check-In System collects the following information:</p>
          <ul>
            <li><strong>Google Account Information:</strong> When you authenticate with Google, we access your email address and basic profile information to provide our services.</li>
            <li><strong>Spreadsheet Data:</strong> We access and process data from your Google Sheets that you connect to our application, including attendee information and check-in records.</li>
            <li><strong>Usage Data:</strong> We collect information about how you use our application, including features accessed and interactions with the system.</li>
          </ul>
        </div>

        <div className={styles.section}>
          <h2>2. How We Use Your Information</h2>
          <p>We use the collected information to:</p>
          <ul>
            <li>Provide and maintain the QR Check-In System service</li>
            <li>Process check-ins and manage event attendance</li>
            <li>Send QR codes and event-related emails to attendees</li>
            <li>Generate reports and analytics for event organizers</li>
            <li>Improve our service and user experience</li>
          </ul>
        </div>

        <div className={styles.section}>
          <h2>3. Data Storage and Security</h2>
          <p>Your data is stored securely using Google's infrastructure:</p>
          <ul>
            <li>All data is stored in Google Sheets that you control</li>
            <li>We use Google's OAuth 2.0 for secure authentication</li>
            <li>We do not store your data on our own servers</li>
            <li>Access to your data is limited to what's necessary for our service</li>
          </ul>
        </div>

        <div className={styles.section}>
          <h2>4. Data Sharing</h2>
          <p>We do not sell, trade, or otherwise transfer your personal information to third parties, except:</p>
          <ul>
            <li>To comply with legal requirements</li>
            <li>To protect our rights and safety</li>
            <li>With your explicit consent</li>
          </ul>
        </div>

        <div className={styles.section}>
          <h2>5. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal data stored in your Google Sheets</li>
            <li>Modify or delete your data through Google Sheets</li>
            <li>Revoke our access to your Google account at any time</li>
            <li>Contact us with any privacy concerns</li>
          </ul>
        </div>

        <div className={styles.section}>
          <h2>6. Contact Information</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at:</p>
          <p><strong>Email:</strong> yhchen.tw0109@gmail.com</p>
        </div>

        <div className={styles.footer}>
          <Link to="/" className={styles.backButton}>
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage; 