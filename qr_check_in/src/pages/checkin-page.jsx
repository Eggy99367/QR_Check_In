import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Dropdown from '../components/dropdown';
import styles from './checkin-page.module.css';
import Cookies from "js-cookie";
import { Html5QrcodeScanner } from "html5-qrcode";




const CheckInPage = () => {
  const navigate = useNavigate();
  const accessToken = Cookies.get('access_token');
  const [searchParams] = useSearchParams();

  const spreadsheetId = searchParams.get('spreadsheetId');

  const chekTokenExpired = (res) => {
    if(res.error && res.error.code === 401){
      Cookies.remove("access_token");
      navigate("/login");
    }
  }
  useEffect(() => {
    if (!accessToken) {
      navigate("/login");
    }
  }, []);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", {
      qrbox: 250,
      fps: 10,
    });
  
    scanner.render(
      (decodedText, decodedResult) => {
        console.log("Success:", decodedText);
      },
      (error) => {
        console.warn("Error:", error);
      }
    );
  
    return () => scanner.clear(); // Cleanup
  }, []);

  return (
    <div className="pageContainer">
      <div className={styles.contentBox}>
        <h4>Now Checking In :</h4>
        <div id="reader"></div>
      </div>
    </div>
  );
};

export default CheckInPage;
