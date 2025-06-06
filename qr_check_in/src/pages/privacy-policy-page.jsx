import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from './checkin-page.module.css';




const PrivacyPolicyPage = () => {
  const navigate = useNavigate();

  return (
    <div className="pageContainer">
      <div className={styles.contentBox}>
      <h1>Privacy Policy</h1>
      <p>Last updated: June 5, 2025</p>

      <p>
        This QR Check-In application is developed to assist organizations, such as university clubs, in managing event attendance through Google Sheets integration.
      </p>

      <h2>Information Collection and Use</h2>
      <p>
        This app accesses your Google account solely to view and edit Google Sheets that you explicitly authorize. We do not collect, store, or share any personal data on our own servers.
      </p>

      <h2>OAuth Permissions</h2>
      <p>
        The app uses Google OAuth 2.0 to request permission to access your spreadsheets. Your authentication information is handled securely and only used during your active session.
      </p>

      <h2>Third-Party Services</h2>
      <p>
        This application uses the Google Sheets API and Google OAuth. These services are governed by their own privacy policies.
      </p>

      <h2>Data Storage</h2>
      <p>
        All data remains within your Google Sheets account. The application does not store or transmit user data to any external server.
      </p>

      <h2>Security</h2>
      <p>
        We are committed to ensuring the security of your information. OAuth tokens are managed securely during usage and are not logged or saved.
      </p>

      <h2>Contact</h2>
      <p>
        If you have any questions about this privacy policy, please contact us at <strong>yhchen.tw0109@gmail.com</strong>.
      </p>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
