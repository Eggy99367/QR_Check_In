import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import Cookies from "js-cookie";
import styles from './navbar.module.css';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    Cookies.remove("access_token");
    navigate("/login");
  }

  return (
    <header>
      <nav>
          <div className={styles.navbarContainer}>
              <a href="/" className={styles.logo}>QR Check-In</a>
              <ul className={styles.navLinks}>
                  <li><a href="/">Manage</a></li>
                  <li><a href="/check-in">Experiences</a></li>
                  {Cookies.get("access_token") && <button className={styles.logoutButton} onClick={handleLogout}>Logout</button>}
              </ul>
          </div>
      </nav>
    </header>
  );
}

export default Navbar;