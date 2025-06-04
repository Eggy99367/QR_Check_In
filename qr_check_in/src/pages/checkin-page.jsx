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
    
    var tempColObj = checkInListColumnsObj;
    var tempColObjUpdate = false;
    for (let index = 0; index < data[0].length; index++) {
      if(!(data[0][index] in  tempColObj) || tempColObj[data[0][index]] != index){
        tempColObj[data[0][index]] = index ;
        tempColObjUpdate = true;
      }
    }
    if(tempColObjUpdate){
      setCheckInListColumnsObj(tempColObj);
    }
      
    
    var checkedInCount = 0;
    const dataLen = data.length;
    var tempCheckInData = {}
    for (let rowIndex = 1; rowIndex < dataLen; rowIndex++){
      var row = data[rowIndex];
      var rowData = {"rowIndex": rowIndex + 1};
      var rowEmail = "";
      for (const colTitle in tempColObj){
        let colIndex = tempColObj[colTitle];
        if (colIndex >= row.length){
          continue;
        }
        if (colTitle === "Email"){
          rowEmail = row[colIndex];
        }
        rowData[colTitle] = row[colIndex];
        if(colTitle === "Check-In" && row[tempColObj[colTitle]] != undefined && row[tempColObj[colTitle]] != ""){
          checkedInCount++;
        }
      }
      tempCheckInData[rowEmail] = rowData;
    }
    
    setTotalRegistrations(dataLen - 1);
    setCheckedIn(checkedInCount);
    setNotCheckedIn(dataLen - checkedInCount - 1);
    setCheckInData(tempCheckInData);
    
    console.log("Check In List Updated!");
    return {"columns": tempColObj, "values": tempCheckInData};
  }
  
  const alreadyCheckedIn = (data, email) => {
    const values = data.values;
    if (!(email in values))return false;
    const rowData = values[email];
    if ("Check-In" in rowData && rowData["Check-In"] != undefined && rowData["Check-In"] != "")return true;
    return false;
  }

  const modifyCheckInData = (data, email, newValues) => {
    const cols = data.columns;
    var values = data.values;
    for (const colTitle in newValues){
      values[email][colTitle] = newValues[colTitle];
    }
    setCheckInData(values);
    return {"columns": cols, "values": values};
  }

  const generateUpdateRow = (data, email) => {
    const cols = data.columns;
    const values = data.values;
    var tempRow = [];
    const rowData = values[email];
    for (const colTitle in checkInListColumnsObj){
      const colIndex = checkInListColumnsObj[colTitle];
      while (tempRow.length - 1 < colIndex) {tempRow.push("")}
      tempRow[colIndex] = rowData[colTitle];
    }
    return tempRow;
  }

  const handleCheckIn = async (email) => {
    var updatedData = await updateCheckInList(false);
    if (!(email in updatedData.values)){
      console.log(`Error: ${email} is not in the check-in list`);
      return false;
    }
    const curTime = Utils.getTime();
    if (alreadyCheckedIn(updatedData, email)){
      console.log(`Warning: ${email} has already checked in`)
      
      updatedData = modifyCheckInData(updatedData, email, {"Last Seen": curTime});
      console.log(updatedData);
      const updateRowData = generateUpdateRow(updatedData, email);
      const rowData = updatedData.values[email];
      Utils.updateSheetData(accessToken, spreadsheetId, checkInListSheetTitle,
        `R${rowData["rowIndex"]}C1:R${rowData["rowIndex"]}C${updateRowData.length}`,
        "ROWS", [updateRowData], navigate);
        return false;
    }
    updatedData = modifyCheckInData(updatedData, email, {"Check-In": curTime, "Last Seen": curTime});
    console.log(updatedData);
    const rowData = updatedData.values[email];
    const updateRowData = generateUpdateRow(updatedData, email);
    Utils.updateSheetData(accessToken, spreadsheetId, checkInListSheetTitle,
                          `R${rowData["rowIndex"]}C1:R${rowData["rowIndex"]}C${updateRowData.length}`,
                          "ROWS", [updateRowData], navigate);
    return true;
  }

  useEffect(() => {
    // if (hasInitialized.current) return;
    //   hasInitialized.current = true;
    if (!accessToken) {
      navigate("/login");
    }
    Utils.getSpreadsheetInfo(accessToken, spreadsheetId, navigate, setSpreadsheetName, setSheetsObj);
    updateCheckInList();
    const updateCheckInListInterval = setInterval(() => {
      updateCheckInList();
    }, 2000);
  
    return () => {
      clearInterval(updateCheckInListInterval);
    };
  }, []);

  const lastScanned = useRef("");
  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", {
      qrbox: 300,
      fps: 10,
    });

    const onScanSuccess = (decodedText, decodedResult) => {
      if (decodedText === lastScanned.current) return;
      lastScanned.current = decodedText;
      console.log(`QR Code Scanned: ${decodedText}`);
      handleCheckIn(decodedText);
      setTimeout(() => {
        lastScanned.current = "";
      }, 3000);
    };
  
    scanner.render(
      onScanSuccess,
      (error) => {
        // console.warn("Error:", error);
      }
    );
  
    return () => scanner.clear(); // Cleanup
  }, []);

  return (
    <div className="pageContainer">
      <div className={styles.contentBox}>
        <h4>{spreadsheetName === "" ? "Loading..." : spreadsheetName}</h4>
        <button onClick={() => {handleCheckIn("vincent.tw99367@gmail.com")}}></button>
        <h5>Total Registrations: {totalRegistrations} / Checked In: {checkedIn} / Not Checked In: {notCheckedIn}</h5>
        <div id="reader"></div>
      </div>
    </div>
  );
};

export default CheckInPage;
