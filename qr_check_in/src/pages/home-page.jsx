import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './login-page.module.css';
import Cookies from "js-cookie";
import Navbar from "../components/navbar"

const HomePage = () => {
  const navigate = useNavigate();

  const [userDetails, setUserDetails] = useState({});

  const getUserDetails = async (accessToken) => {
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${accessToken}`
    );
    const data = await response.json();
    setUserDetails(data);
  };

  useEffect(() => {
    const accessToken = Cookies.get("access_token");
    console.log(accessToken);
    if (!accessToken) {
      navigate("/login");
    }

    getUserDetails(accessToken);
  }, []);

  return (
    <div className={styles.container}>
        <Navbar />
        <div className={styles.loginBox}>
            <h1 className={styles.title}>Logged in</h1>
            <p className={styles.subtitle}>Sign in to continue</p>
        
      </div>
    </div>
  );
};

export default HomePage;
