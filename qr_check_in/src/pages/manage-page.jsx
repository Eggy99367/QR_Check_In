import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Dropdown from '../components/dropdown';
import styles from './manage-page.module.css';
import Cookies from "js-cookie";
import * as Utils from '../utils/googleAPIUtils';

async function createEmail(to, name, subject, message) {
  message = message.replace("{{Name}}", name);
  const qrCodeImage = await Utils.generateQRCodeBase64(to);
  message = message.replace("{{QRcode}}", `<img src="${qrCodeImage}" alt="QR Code" style="width:200px;height:200px;" />`);
  const email = 
    `To: ${to}\r\n` +
    `Subject: ${subject}\r\n` +
    `Content-Type: text/html; charset="UTF-8"\r\n` +
    `\r\n` +
    `${message}`;

  const encodedEmail = btoa(encodeURIComponent(email).replace(/%([0-9A-F]{2})/g, (match, p1) =>
    String.fromCharCode(parseInt(p1, 16))
  ));

  return encodedEmail
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

const ManagePage = () => {
  const navigate = useNavigate();
  const accessToken = Cookies.get('access_token');
  const [spreadsheetsInfo, setSpreadsheetsInfo] = useState([]);
  const [fileDropdown, setFileDropdown] = useState("");
  const [spreadsheetId, setSpreadsheetId] = useState("");
  const [spreadsheetName, setSpreadsheetName] = useState("");
  const [sheetsObj, setsheetsObj] = useState({});
  const [selectedSheetTitle, setSelectedSheetTitle] = useState("");
  const [emailColumn, setEmailColumn] = useState("");
  const [nameColumn, setNameColumn] = useState("");
  const [columnsList, setColumnsList] = useState([]);
  const [checkInListUpdated, setCheckInListUpdated] = useState(-1);
  const [haveNotInvited, setHaveNotInvited] = useState(-1);

  const checkInListSheetTitle = import.meta.env.VITE_CHECKINLISTSHEETTITLE;
  const emailTemplateSheetTitle = import.meta.env.VITE_EMAILTEMPLATESHEETTITLE;

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
    Utils.checkTokenExpired(navigate, data);
    var tempArray = [["EnterURL", "Enter a Google Spreadsheet URL"]];
    for(const spreadsheetObj of Object.values(data.files)){
      tempArray.push([spreadsheetObj.id, spreadsheetObj.name]);
    }
    setSpreadsheetsInfo(tempArray);
  };

  // Get a Spreadsheet's Information
  const getSpreadsheetInfo = async (spreadsheetId) => {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const data = await response.json();
    Utils.checkTokenExpired(navigate, data);
    var tempsheetsObj = {};
    for(const sheetInfo of data.sheets){
        tempsheetsObj[sheetInfo.properties.title] = sheetInfo.properties.sheetId;
    }
    setSpreadsheetName(data.properties.title);
    setsheetsObj(tempsheetsObj);
  }

  const handleFileSelect = async (value) => {
    setFileDropdown(value);
    if(value == "EnterURL"){
      setSpreadsheetId("");
    }else{
      setSpreadsheetId(value);
      Utils.getSpreadsheetInfo(accessToken, value, navigate, setSpreadsheetName, setsheetsObj);
    }
  }

  const handleEnterURL = async (e) => {
    const id = e.target.value.split("/d/")[1].split("/")[0]
    setSpreadsheetId(id);
    Utils.getSpreadsheetInfo(accessToken, id, navigate, setSpreadsheetName, setsheetsObj);
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
      });
    const copyData = await copyRes.json();
    Utils.checkTokenExpired(navigate, copyData);
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
    await Utils.getSpreadsheetInfo(accessToken, spreadsheetId, navigate, setSpreadsheetName, setsheetsObj);
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

  // Get the columns list of a sheet
  const handleGetSheetInfo = async (selectedSheetTitle) => {
    setSelectedSheetTitle(selectedSheetTitle);
    const sheetData = await Utils.getSheetData(accessToken, spreadsheetId, selectedSheetTitle, "R1C1:R1C100", "ROWS", navigate);
    setColumnsList(sheetData[0]);
  }

  // Update the check-in list
  const handleUpdateCheckInList = async () => {
    const emailColumnNumber = columnsList.indexOf(emailColumn) + 1;
    const nameColumnNumber = columnsList.indexOf(nameColumn) + 1;
    
    var emails = (await Utils.getSheetData(accessToken, spreadsheetId, selectedSheetTitle, `R2C${emailColumnNumber}:R1048576C${emailColumnNumber}`, "COLUMNS", navigate));
    if (emails.length > 0){emails = emails[0]}
    var names = (await Utils.getSheetData(accessToken, spreadsheetId, selectedSheetTitle, `R2C${nameColumnNumber}:R1048576C${nameColumnNumber}`, "COLUMNS", navigate));
    if (names.length > 0){names = names[0]}



    const checkInList = await Utils.getSheetData(accessToken, spreadsheetId, checkInListSheetTitle, "R1C1:R1048576C6", "ROWS", navigate);
    var checkInListFirstEmptyRowNum = checkInList.length + 1;
    var checkInListColumns = checkInList[0];
    
    var checkInListData = {};
    var rowEmail = ""
    var tempHaveNotInvited = 0;
    for (const row of checkInList.slice(1)){
      var dataObj = {};
      for (let colIndex = 0; colIndex < row.length; colIndex++){
        if(checkInListColumns[colIndex] === "Email"){
          rowEmail = row[colIndex];
        }else{
          dataObj[checkInListColumns[colIndex]] = row[colIndex];
        }
      }
      checkInListData[rowEmail] = dataObj;
      if(!("Verification Mail Sent" in dataObj) || dataObj["Verification Mail Sent"] == ""){tempHaveNotInvited++};
    }

    const checkInListEmailColumnNum = checkInListColumns.indexOf("Email") + 1;
    const checkInListNameColumnNum = checkInListColumns.indexOf("Name") + 1;
    var updateEmailValues = [];
    var updateNameValues = [];
    for (let responseIndex = 0; responseIndex < emails.length; responseIndex++){
      if(!(emails[responseIndex] in checkInListData)){
        // console.log(`adding ${emails[responseIndex]}`);
        updateEmailValues.push(emails[responseIndex]);
        updateNameValues.push(names[responseIndex]);
      }
    }
    if (updateEmailValues.length > 0){
      Utils.updateSheetData(accessToken, spreadsheetId, checkInListSheetTitle, `R${checkInListFirstEmptyRowNum}C${checkInListEmailColumnNum}:R${checkInListFirstEmptyRowNum + updateEmailValues.length}C${checkInListEmailColumnNum}`, "COLUMNS", [updateEmailValues], navigate);
      Utils.updateSheetData(accessToken, spreadsheetId, checkInListSheetTitle, `R${checkInListFirstEmptyRowNum}C${checkInListNameColumnNum}:R${checkInListFirstEmptyRowNum + updateNameValues.length}C${checkInListNameColumnNum}`, "COLUMNS", [updateNameValues], navigate);
    }
    setCheckInListUpdated(updateEmailValues.length);
    setTimeout(() => {setCheckInListUpdated(-1)}, 3000);

    setHaveNotInvited(tempHaveNotInvited + updateEmailValues.length);
  }

  const sendEmail = async (to, name, subject, message) => {
    const rawEmail = await createEmail(to, name, subject, message);
    
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        raw: rawEmail
      }),
    });
    
    const data = await response.json();
    Utils.checkTokenExpired(navigate, data);
  
    if (response.ok) {
      console.log('Email sent successfully:', data);
    } else {
      console.error('Email send failed:', data);
    }
    return response;
  }

  const handelSendEmail = async (toAll) => {
    const checkInList = await Utils.getSheetData(accessToken, spreadsheetId, checkInListSheetTitle, "R1C1:R1048576C6", "ROWS", navigate);
    if(checkInList.length == 0){
      console.log("No data in check-in list");
      return;
    }
    const emailColumn = checkInList[0].indexOf("Email");
    const nameColumn = checkInList[0].indexOf("Name");
    const sentColumn = checkInList[0].indexOf("Verification Mail Sent");

    const emailTemplates = await Utils.getSheetData(accessToken, spreadsheetId, emailTemplateSheetTitle, `R2C1:R4C1`, 'COLUMNS', navigate);
    const subject = emailTemplates[0][0];
    const message = emailTemplates[0][2];

    var sentUpdateValues = [];
    for(let rowIndex = 1; rowIndex < checkInList.length; rowIndex++){
      if(!toAll && checkInList[rowIndex].length > sentColumn && checkInList[rowIndex][sentColumn] != ""){
        sentUpdateValues.push(checkInList[rowIndex][sentColumn]);
      }else{
        const response = await sendEmail(checkInList[rowIndex][emailColumn], checkInList[rowIndex][nameColumn], subject, message);
        if(response.ok){
          sentUpdateValues.push(Utils.getTime());
        }else{
          console.log(response);
          break;
        }
      }
    }
    Utils.updateSheetData(accessToken, spreadsheetId, checkInListSheetTitle, `R2C${sentColumn + 1}:R${sentUpdateValues.length + 1}C${sentColumn + 1}`, "COLUMNS", [sentUpdateValues], navigate);
  }
    
  useEffect(() => {
    if (!accessToken) {
      navigate("/login");
    }
    handleGetSpreadsheetsInfo();
  }, []);

  return (
    <div className="pageContainer">
        <div className={styles.contentBox}>
            <div className={styles.slelctSheetDropdownContainer}>
                <Dropdown options={spreadsheetsInfo} placeholder="Select a Sheet..." onSelect={(value) => {handleFileSelect(value)}}/>
            </div>
            {fileDropdown == "EnterURL" && <input type="text" placeholder="Enter URL Here..." onChange={(e) =>{handleEnterURL(e)} }/>}
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
            {checkInListUpdated >= 0 && <h4>Updated {checkInListUpdated} People</h4>}
            {haveNotInvited >= 0 && <h4>Haven't Invited: {haveNotInvited} People</h4>}
            <button disabled={Object.keys(sheetsObj).length === 0 || !(checkInListSheetTitle in sheetsObj) || !(emailTemplateSheetTitle in sheetsObj)} onClick={() => {handelSendEmail(false)}}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-send" viewBox="0 0 16 16">
                <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576zm6.787-8.201L1.591 6.602l4.339 2.76z"/>
              </svg>
              Sent Invites to those who haven't been invited
            </button>
            <button disabled={Object.keys(sheetsObj).length === 0 || !(checkInListSheetTitle in sheetsObj) || !(emailTemplateSheetTitle in sheetsObj)} onClick={() => {handelSendEmail(true)}}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-send" viewBox="0 0 16 16">
                <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576zm6.787-8.201L1.591 6.602l4.339 2.76z"/>
              </svg>
              Send Invites to all
            </button>
            <button onClick={() => {navigate(`/checkin?spreadsheetId=${spreadsheetId}`)}} disabled={Object.keys(sheetsObj).length === 0 || !(checkInListSheetTitle in sheetsObj)}>Start Check-In</button>
        </div>
    </div>
  );
};

export default ManagePage;
