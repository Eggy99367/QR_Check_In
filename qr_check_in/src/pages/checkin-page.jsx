import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Dropdown from '../components/dropdown';
import styles from './checkin-page.module.css';
import Cookies from "js-cookie";
import { Html5QrcodeScanner } from "html5-qrcode";
import * as Utils from '../utils/googleAPIUtils';




const CheckInPage = () => {
  const navigate = useNavigate();
  const hasInitialized = useRef(false);
  const accessToken = Cookies.get('access_token');
  const [searchParams] = useSearchParams();
  const [spreadsheetName, setSpreadsheetName] = useState("");
  const [sheetsObj, setSheetsObj] = useState({});
  
  const [checkInListColumnsObj, setCheckInListColumnsObj] = useState({});
  const [totalRegistrations, setTotalRegistrations] = useState(0);
  const [checkedIn, setCheckedIn] = useState(0);
  const [notCheckedIn, setNotCheckedIn] = useState(0);

  const spreadsheetId = searchParams.get('spreadsheetId');
  const checkInListSheetTitle = import.meta.env.VITE_CHECKINLISTSHEETTITLE;

  const updateCheckInList = async () => {
    const checkinData = await Utils.getSheetData(accessToken, spreadsheetId, checkInListSheetTitle, `R1C1:R1048576C6`, "ROWS", navigate);

    var tempColObj = {};
    for (let index = 0; index < checkinData[0].length; index++) {
      tempColObj[checkinData[0][index]] = index ;
    }
    setCheckInListColumnsObj(tempColObj);
    
    var checkedInCount = 0;
    for (const row of checkinData.slice(1)){
      if(row.length > tempColObj["Check-In"] && row[tempColObj["Check-In"]] != ""){
        checkedInCount++;
      }
    }
    setTotalRegistrations(checkinData.length - 1);
    setCheckedIn(checkedInCount);
    setNotCheckedIn(checkinData.length - checkedInCount - 1);

    console.log("Check In List Updated!");
    setTimeout(updateCheckInList, 3000);
  }

  useEffect(() => {
    if (hasInitialized.current) return;
      hasInitialized.current = true;
    if (!accessToken) {
      navigate("/login");
    }
    updateCheckInList();
  }, []);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", {
      qrbox: 300,
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
        <h4>{spreadsheetName === "" ? "Loading..." : spreadsheetName}</h4>
        <h5>Total Registrations: {totalRegistrations} / Checked In: {checkedIn} / Not Checked In: {notCheckedIn}</h5>
        <div id="reader"></div>
      </div>
    </div>
  );
};

export default CheckInPage;
