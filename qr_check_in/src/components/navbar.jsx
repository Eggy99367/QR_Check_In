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
    <nav>
        <div className={styles.navbarContainer}>
            <a href="/" className={styles.logo}>QR Check-In</a>
            <ul className={styles.navLinks}>
                <li><a href="/">About</a></li>
                <li><a href="/">Experiences</a></li>
                <li><a href="/">Projects</a></li>
                <li><a href="/">Contact</a></li>
                <button className={styles.logoutButton} onClick={handleLogout}>Logout</button>
            </ul>
        </div>
    </nav>
  );
}

export default Navbar;