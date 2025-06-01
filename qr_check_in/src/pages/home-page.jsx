import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Dropdown from '../components/dropdown';
import styles from './home-page.module.css';
import Cookies from "js-cookie";

const HomePage = () => {
  const navigate = useNavigate();
  const accessToken = Cookies.get('access_token');
  const [userDetails, setUserDetails] = useState({});
  const [spreadsheetsInfo, setSpreadsheetsInfo] = useState({});
  const [spreadsheetId, setSpreadsheetId] = useState("");
  const [spreadsheetName, setSpreadsheetName] = useState("");
  const [sheetsObj, setsheetsObj] = useState({});
  const [selectedSheetTitle, setSelectedSheetTitle] = useState("");
  const [columnsList, setColumnsList] = useState([]);

  const getUserDetails = async (accessToken) => {
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v3/userinfo?alt=json&access_token=${accessToken}`
    );
    const data = await response.json();
    console.log(data);
    setUserDetails(data);
  };

  const handleGetSpreadsheetsInfo = async () => {
    const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.spreadsheet' and trashed=false and 'me' in writers&orderBy=modifiedTime desc`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
    const data = await response.json();
    console.log(data);
    setSpreadsheetsInfo(data);
  };

  const handleGetSpreadsheetInfo = async () => {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const data = await response.json();
    var tempsheetsObj = {};
    for(const sheetInfo of data.sheets){
        tempsheetsObj[sheetInfo.properties.title] = sheetInfo.properties.sheetId;
    }
    setSpreadsheetName(data.properties.title);
    setsheetsObj(tempsheetsObj);
  }

  const copySheet = async (templateSheetId, sheetName) => {
    console.log(`start copying sheet ${sheetName} from ${templateSheetId} to ${spreadsheetId}`);
    const copyRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${import.meta.env.VITE_TEMPLATE_SPREADSHEET_ID}/sheets/${templateSheetId}:copyTo`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destinationSpreadsheetId: spreadsheetId,
        }),
      }
    );
  
    const copyData = await copyRes.json();
    if(copyData.error){
      console.log(copyData.error.message);
      return;
    }
    const newSheetId = copyData.sheetId;
  
    // Rename the copied sheet
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            updateSheetProperties: {
              properties: {
                sheetId: newSheetId,
                title: sheetName,
              },
              fields: "title",
            },
          },
        ],
      }),
    });
    await handleGetSpreadsheetInfo();
    console.log("Sheet copied and renamed!");
  }

  const handleCreateCheckInSheet = async () => {
    if(!("Check In List" in sheetsObj)){
      await copySheet(import.meta.env.VITE_CHECKIN_SHEET_ID, "Check In List");
    }
    if(!("Email Template" in sheetsObj)){
      await copySheet(import.meta.env.VITE_EMAIL_TEMPLATE_SHEET_ID, "Email Template");
    }
  }

  const handleGetSheetInfo = async (selectedSheetTitle) => {
    setSelectedSheetTitle(selectedSheetTitle);
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${selectedSheetTitle}!A1:Z1`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const data = await response.json();
    console.log(data);
    var tempColumnsList = [];
    for(const column of data.values[0]){
      tempColumnsList.push(column);
    }
    setColumnsList(tempColumnsList);
  }

  useEffect(() => {
    if (!accessToken) {
      navigate("/login");
    }
    getUserDetails(accessToken);
  }, []);

  return (
    <div className="pageContainer">
        <div className={styles.contentBox}>
            {/* <button className={styles.loginButton} onClick={handleGetSpreadsheetsInfo}>Get Sheets Info</button>
            {sheetsInfo.files && sheetsInfo.files.map((file) => (
                <a href={`https://docs.google.com/spreadsheets/d/${file.id}`}>{file.name}</a>
            ))} */}
            <input type="text" placeholder="Enter a Google Spreadsheet URL..." onChange={(e) =>{setSpreadsheetId(e.target.value.split("/d/")[1].split("/")[0]);}}/>
            <button onClick={handleGetSpreadsheetInfo} disabled={!spreadsheetId}>Get Spreadsheet's Information</button>
            {/* <h4>or</h4>
            <input type="text" placeholder="Select a Google Sheet..."/> */}
            <hr className={styles.divider}/>
            <h4>{Object.keys(sheetsObj).length > 0 ? spreadsheetName : "No Sheets Found"}</h4>
            <div className={styles.contentRow}>
                <div className={styles.dropdownContainer}>
                    <Dropdown options={Object.keys(sheetsObj)} placeholder="Select Form Response Sheet..." onSelect={(selectedSheetTitle) => {handleGetSheetInfo(selectedSheetTitle)}} disabled={Object.keys(sheetsObj).length === 0}/>
                </div>
                <button onClick={handleCreateCheckInSheet} id={styles.createSheetButton} disabled={Object.keys(sheetsObj).length === 0 || (!(Object.keys(sheetsObj).length === 0) && "Check In List" in sheetsObj && "Email Template" in sheetsObj)}>Create Check-In Sheet</button>
            </div>
            <div className={styles.contentRow}>
                <h5 className={styles.contentColumnTitle}>Email Column:</h5>
                <div className={styles.dropdownContainer}>
                    <Dropdown options={columnsList} placeholder="Select Column..." disabled={columnsList.length === 0}/>
                </div>
            </div>
            <div className={styles.contentRow}>
                <h5 className={styles.contentColumnTitle}>Name Column:</h5>
                <div className={styles.dropdownContainer}>
                    <Dropdown options={columnsList} placeholder="Select Column..." disabled={columnsList.length === 0}/>
                </div>
            </div>
            <button disabled={Object.keys(sheetsObj).length === 0 || !("Check In List" in sheetsObj)}>Update Check-In List</button>
            <h4>Updated XXX People</h4>
            <h4>Haven't Invited: XXX People</h4>
            <button disabled={Object.keys(sheetsObj).length === 0 || !("Check In List" in sheetsObj) || !("Email Template" in sheetsObj)}>Sent Invites to those who haven't been invited</button>
            <button disabled={Object.keys(sheetsObj).length === 0 || !("Check In List" in sheetsObj) || !("Email Template" in sheetsObj)}>Send Invites to all</button>
        </div>
    </div>
  );
};

export default HomePage;
