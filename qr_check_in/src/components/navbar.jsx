import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import styles from './navbar.module.css';

const Navbar = () => {
  

  return (
    <div className={styles.navbarContainer}>
      <div className={styles.logoContainer}>
        <h1>QR Check-In</h1>
      </div>
      <div className={styles.navLinksContainer}>
        <ul className={styles.navLinks}>
          <li className={styles.navLink}>Home</li>
          <li className={styles.navLink}>About</li>
          <li className={styles.navLink}>Contact</li>
        </ul>
      </div>
    </div>
  );
}

export default Navbar;