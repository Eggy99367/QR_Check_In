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
  const [spreadsheetUrl, setSpreadsheetUrl] = useState("");
  const [spreadsheetName, setSpreadsheetName] = useState("");
  const [sheetsObj, setsheetsObj] = useState({});

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
    const spreadsheetId = spreadsheetUrl.split("/d/")[1].split("/")[0];
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
        tempsheetsObj[sheetInfo.properties.title] = sheetInfo.properties.index;
    }
    setSpreadsheetName(data.properties.title);
    setsheetsObj(tempsheetsObj);
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
            <input type="text" placeholder="Enter a Google Spreadsheet URL..." onChange={(e) =>{console.log(e); setSpreadsheetUrl(e.target.value)}}/>
            <button onClick={handleGetSpreadsheetInfo} disabled={!spreadsheetUrl}>Get Spreadsheet's Information</button>
            {/* <h4>or</h4>
            <input type="text" placeholder="Select a Google Sheet..."/> */}
            <hr className={styles.divider}/>
            <h4>{sheetsObj ? spreadsheetName : "No Sheets Found"}</h4>
            <div className={styles.contentRow}>
                <div className={styles.dropdownContainer}>
                    <Dropdown options={Object.keys(sheetsObj)} placeholder="Select Form Response Sheet..." disabled={!sheetsObj}/>
                </div>
                <button id={styles.createSheetButton} disabled={!sheetsObj || (sheetsObj && "Check In List" in sheetsObj && "Email Template" in sheetsObj)}>Create Check-In Sheet</button>
            </div>
            <div className={styles.contentRow}>
                <h5 className={styles.contentColumnTitle}>Email Column:</h5>
                <div className={styles.dropdownContainer}>
                    <Dropdown options={Object.keys(sheetsObj)} placeholder="Select Column..." disabled={!sheetsObj}/>
                </div>
            </div>
            <div className={styles.contentRow}>
                <h5 className={styles.contentColumnTitle}>Name Column:</h5>
                <div className={styles.dropdownContainer}>
                    <Dropdown options={Object.keys(sheetsObj)} placeholder="Select Column..." disabled={!sheetsObj}/>
                </div>
            </div>
            <button disabled={!sheetsObj || !("Check In List" in sheetsObj)}>Update Check-In List</button>
            <h4>Updated XXX People</h4>
            <h4>Haven't Invited: XXX People</h4>
            <button disabled={!sheetsObj || !("Check In List" in sheetsObj) || !("Email Template" in sheetsObj)}>Sent Invites to those who haven't been invited</button>
            <button disabled={!sheetsObj || !("Check In List" in sheetsObj) || !("Email Template" in sheetsObj)}>Send Invites to all</button>
        </div>
    </div>
  );
};

export default HomePage;
