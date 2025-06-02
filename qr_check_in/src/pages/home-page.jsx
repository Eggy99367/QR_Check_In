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
  const [emailColumn, setEmailColumn] = useState("");
  const [nameColumn, setNameColumn] = useState("");

  const checkInListSheetTitle = "Check In List";
  const emailTemplateSheetTitle = "Email Template";

  // Check if the token is expired by checking the response from the API
  const chekTokenExpired = (res) => {
    if(res.error && res.error.code === 401){
      Cookies.remove("access_token");
      navigate("/login");
    }
  }

  // const getUserDetails = async (accessToken) => {
  //   const response = await fetch(
  //     `https://www.googleapis.com/oauth2/v3/userinfo?alt=json&access_token=${accessToken}`
  //   );
  //   const data = await response.json();
  //   console.log(data);
  //   setUserDetails(data);
  // };

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
    setSpreadsheetsInfo(data);
  };

  // Get a Spreadsheet's Information
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
    chekTokenExpired(data);
    var tempsheetsObj = {};
    for(const sheetInfo of data.sheets){
        tempsheetsObj[sheetInfo.properties.title] = sheetInfo.properties.sheetId;
    }
    setSpreadsheetName(data.properties.title);
    setsheetsObj(tempsheetsObj);
  }

  // Copy a sheet from a template spreadsheet to the current spreadsheet
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

  // Create a check-in sheet and an email template sheet if they don't exist
  const handleCreateCheckInSheet = async () => {
    if(!(checkInListSheetTitle in sheetsObj)){
      await copySheet(import.meta.env.VITE_CHECKIN_SHEET_ID, checkInListSheetTitle);
    }
    if(!(emailTemplateSheetTitle in sheetsObj)){
      await copySheet(import.meta.env.VITE_EMAIL_TEMPLATE_SHEET_ID, emailTemplateSheetTitle);
    }
  }

  // Get data from a sheet
  const getSheetData = async (sheetTitle, range, majorDimension) => {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetTitle}!${range}?majorDimension=${majorDimension}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const data = await response.json();
    if(data.values){
      return data.values;
    }
    return [];
  }

  // Get the columns list of a sheet
  const handleGetSheetInfo = async (selectedSheetTitle) => {
    setSelectedSheetTitle(selectedSheetTitle);
    const sheetData = await getSheetData(selectedSheetTitle, "R1C1:R1C100", "ROWS");
    setColumnsList(sheetData[0]);
  }

  // Update the check-in list
  const handleUpdateCheckInList = async () => {
    const emailColumnNumber = columnsList.indexOf(emailColumn) + 1;
    const nameColumnNumber = columnsList.indexOf(nameColumn) + 1;
    const emails = (await getSheetData(selectedSheetTitle, `R2C${emailColumnNumber}:R1048576C${emailColumnNumber}`, "COLUMNS"))[0];
    const names = (await getSheetData(selectedSheetTitle, `R2C${nameColumnNumber}:R1048576C${nameColumnNumber}`, "COLUMNS"))[0];

    const checkInList = await getSheetData(checkInListSheetTitle, "R2C1:R1048576C6", "ROWS");
    console.log(checkInList);
  }
    
  useEffect(() => {
    if (!accessToken) {
      navigate("/login");
    }
  }, []);

  return (
    <div className="pageContainer">
        <div className={styles.contentBox}>
            <input type="text" placeholder="Enter a Google Spreadsheet URL..." onChange={(e) =>{setSpreadsheetId(e.target.value.split("/d/")[1].split("/")[0]);}}/>
            <button onClick={handleGetSpreadsheetInfo} disabled={!spreadsheetId}>Get Spreadsheet's Information</button>
            <hr className={styles.divider}/>
            <h4>{Object.keys(sheetsObj).length > 0 ? <a href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}`} target="_blank">{spreadsheetName}</a> : "No Spreadsheet Found"}</h4>
            <div className={styles.contentRow}>
                <div className={styles.dropdownContainer}>
                    <Dropdown options={Object.keys(sheetsObj)} placeholder="Select Form Response Sheet..." onSelect={(selectedSheetTitle) => {handleGetSheetInfo(selectedSheetTitle)}} disabled={Object.keys(sheetsObj).length === 0}/>
                </div>
                <button onClick={handleCreateCheckInSheet} id={styles.createSheetButton} disabled={Object.keys(sheetsObj).length === 0 || (!(Object.keys(sheetsObj).length === 0) && checkInListSheetTitle in sheetsObj && emailTemplateSheetTitle in sheetsObj)}>Create Check-In Sheet</button>
            </div>
            <div className={styles.contentRow}>
                <h5 className={styles.contentColumnTitle}>Email Column:</h5>
                <div className={styles.dropdownContainer}>
                    <Dropdown options={columnsList} placeholder="Select Column..." disabled={columnsList.length === 0} onSelect={(value) => {setEmailColumn(value)}}/>
                </div>
            </div>
            <div className={styles.contentRow}>
                <h5 className={styles.contentColumnTitle}>Name Column:</h5>
                <div className={styles.dropdownContainer}>
                    <Dropdown options={columnsList} placeholder="Select Column..." disabled={columnsList.length === 0} onSelect={(value) => {setNameColumn(value)}}/>
                </div>
            </div>
            <button disabled={Object.keys(sheetsObj).length === 0 || !(checkInListSheetTitle in sheetsObj)} onClick={handleUpdateCheckInList}>Update Check-In List</button>
            <h4>Updated XXX People</h4>
            <h4>Haven't Invited: XXX People</h4>
            <button disabled={Object.keys(sheetsObj).length === 0 || !(checkInListSheetTitle in sheetsObj) || !(emailTemplateSheetTitle in sheetsObj)}>Sent Invites to those who haven't been invited</button>
            <button disabled={Object.keys(sheetsObj).length === 0 || !(checkInListSheetTitle in sheetsObj) || !(emailTemplateSheetTitle in sheetsObj)}>Send Invites to all</button>
        </div>
    </div>
  );
};

export default HomePage;
