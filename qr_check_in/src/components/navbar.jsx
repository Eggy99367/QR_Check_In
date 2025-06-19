import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import Cookies from "js-cookie";
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from '../hooks/useTranslation';
import styles from './navbar.module.css';

const Navbar = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = () => {
    Cookies.remove("access_token");
    navigate("/login");
  }

  return (
    <header>
      <nav>
          <div className={styles.navbarContainer}>
              <a href="/" className={styles.logo}>{t('navbar.title')}</a>
              <div className={styles.navRightSection}>
                <LanguageSwitcher />
                <ul className={styles.navLinks}>
                    {/* <li><a href="/">Manage</a></li>
                    <li><a href="/check-in">Experiences</a></li> */}
                    {Cookies.get("access_token") && <button className={styles.logoutButton} onClick={handleLogout}>{t('navbar.logout')}</button>}
                </ul>
              </div>
          </div>
      </nav>
    </header>
  );
}

export default Navbar;