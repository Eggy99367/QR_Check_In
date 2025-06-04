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
  const [checkInData, setCheckInData] = useState({});

  const spreadsheetId = searchParams.get('spreadsheetId');
  const checkInListSheetTitle = import.meta.env.VITE_CHECKINLISTSHEETTITLE;

  const updateCheckInList = async () => {
    const data = await Utils.getSheetData(accessToken, spreadsheetId, checkInListSheetTitle, `R1C1:R1048576C6`, "ROWS", navigate);

    var tempColObj = {};
    for (let index = 0; index < data[0].length; index++) {
      tempColObj[data[0][index]] = index ;
    }
    setCheckInListColumnsObj(tempColObj);
    
    var checkedInCount = 0;
    const dataLen = data.length;
    var tempCheckInData = {}
    for (let rowIndex = 1; rowIndex < dataLen; rowIndex++){
      var row = data[rowIndex];
      var rowData = {};
      var rowEmail = "";
      for (const colTitle in tempColObj){
        let colIndex = tempColObj[colTitle];
        if (colIndex >= row.length){
          continue;
        }
        if (colTitle === "Email"){
          rowEmail = row[colIndex];
        }else{
          rowData[colTitle] = row[colIndex];
          if(colTitle === "Check-In" && row[tempColObj[colTitle]] != undefined && row[tempColObj[colTitle]] != ""){
            checkedInCount++;
          }
        }
      }
      tempCheckInData[rowEmail] = rowData;
    }

    console.log(tempCheckInData)

    setTotalRegistrations(dataLen - 1);
    setCheckedIn(checkedInCount);
    setNotCheckedIn(dataLen - checkedInCount - 1);

    console.log("Check In List Updated!");
    setTimeout(updateCheckInList, 3000);
  }

  const handleCheckIn = async () => {

  }

  useEffect(() => {
    if (hasInitialized.current) return;
      hasInitialized.current = true;
    if (!accessToken) {
      navigate("/login");
    }
    Utils.getSpreadsheetInfo(accessToken, spreadsheetId, navigate, setSpreadsheetName, setSheetsObj);
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
