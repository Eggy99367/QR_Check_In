import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import Dropdown from '../components/dropdown';
import styles from './manage-page.module.css';
import Cookies from "js-cookie";
import * as Utils from '../utils/googleAPIUtils';

async function createEmail(to, name, subject, message) {
  message = message.replace("{{Name}}", name);
  const qrCodeImage = await Utils.generateQRCodeBase64(to);
  
  if (qrCodeImage) {
    // Use Content-ID for embedded attachment instead of base64 data URL
    message = message.replace("{{QRcode}}", 
      `<div style="text-align: center; margin: 20px 0;">
        <img src="cid:qrcode" alt="QR Code for ${to}" style="width:200px;height:200px;display:block;margin:0 auto;border:2px solid #333;" />
        <p style="font-size:12px;color:#666;margin-top:10px;">QR Code for check-in</p>
      </div>`
    );
  } else {
    console.error('QR code generation failed, using fallback');
    // Fallback if QR code generation fails
    message = message.replace("{{QRcode}}", 
      `<div style="text-align: center; margin: 20px 0; padding: 20px; border: 2px solid #ccc; background-color: #f9f9f9;">
        <p style="color: #666;">QR Code could not be generated</p>
        <p style="font-size: 12px;">Please contact support for assistance</p>
      </div>`
    );
  }
  
  // Create multipart email with attachment
  const boundary = `boundary_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  let email = `To: ${to}\r\n`;
  email += `Subject: ${subject}\r\n`;
  email += `Content-Type: multipart/related; boundary="${boundary}"\r\n`;
  email += `\r\n`;
  
  // HTML body part
  email += `--${boundary}\r\n`;
  email += `Content-Type: text/html; charset="UTF-8"\r\n`;
  email += `\r\n`;
  email += `${message}\r\n`;
  
  // QR code attachment part (if generated successfully)
  if (qrCodeImage) {
    const base64Data = qrCodeImage.split(',')[1]; // Remove data URL prefix
    email += `--${boundary}\r\n`;
    email += `Content-Type: image/png\r\n`;
    email += `Content-Transfer-Encoding: base64\r\n`;
    email += `Content-ID: <qrcode>\r\n`;
    email += `Content-Disposition: inline; filename="qrcode.png"\r\n`;
    email += `\r\n`;
    email += `${base64Data}\r\n`;
  }
  
  email += `--${boundary}--\r\n`;

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
  const { t } = useTranslation();
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
  const [loading, setLoading] = useState(true);
  const [loadingSpreadsheet, setLoadingSpreadsheet] = useState(false);
  const [loadingCheckIn, setLoadingCheckIn] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingSheetCreation, setLoadingSheetCreation] = useState(false);
  const [showEmailEditor, setShowEmailEditor] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [loadingTemplate, setLoadingTemplate] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState("");
  const [loadingTestEmail, setLoadingTestEmail] = useState(false);

  const checkInListSheetTitle = import.meta.env.VITE_CHECKINLISTSHEETTITLE;
  const emailTemplateSheetTitle = import.meta.env.VITE_EMAILTEMPLATESHEETTITLE;

  const handleGetSpreadsheetsInfo = async () => {
    try {
      setLoading(true);
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
      var tempArray = [["EnterURL", t('manage.steps.selectSpreadsheet.urlDropdownOption')]];
      for(const spreadsheetObj of Object.values(data.files)){
        tempArray.push([spreadsheetObj.id, spreadsheetObj.name]);
      }
      setSpreadsheetsInfo(tempArray);
    } catch (error) {
      console.error("Error fetching spreadsheets:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get a Spreadsheet's Information
  const getSpreadsheetInfo = async (spreadsheetId) => {
    try {
      setLoadingSpreadsheet(true);
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
    } catch (error) {
      console.error("Error fetching spreadsheet info:", error);
    } finally {
      setLoadingSpreadsheet(false);
    }
  }

  const handleFileSelect = async (value) => {
    setFileDropdown(value);
    if(value == "EnterURL"){
      setSpreadsheetId("");
      setSpreadsheetName("");
      setsheetsObj({});
    }else{
      setSpreadsheetId(value);
      Utils.getSpreadsheetInfo(accessToken, value, navigate, setSpreadsheetName, setsheetsObj);
    }
  }

  const handleEnterURL = async (e) => {
    const id = e.target.value.split("/d/")[1].split("/")[0]
    setSpreadsheetId(id);
    await getSpreadsheetInfo(id);
  }

  // Copy a sheet from a template spreadsheet to the current spreadsheet
  const copySheet = async (templateSheetId, sheetName) => {
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
  }

  // Create a check-in sheet and an email template sheet if they don't exist
  const handleCreateCheckInSheet = async () => {
    try {
      setLoadingSheetCreation(true);
      if(!(checkInListSheetTitle in sheetsObj)){
        await copySheet(import.meta.env.VITE_CHECKIN_SHEET_ID, checkInListSheetTitle);
      }
      if(!(emailTemplateSheetTitle in sheetsObj)){
        await copySheet(import.meta.env.VITE_EMAIL_TEMPLATE_SHEET_ID, emailTemplateSheetTitle);
      }
    } catch (error) {
      console.error("Error creating sheets:", error);
    } finally {
      setLoadingSheetCreation(false);
    }
  }

  // Get the columns list of a sheet
  const handleGetSheetInfo = async (selectedSheetTitle) => {
    setSelectedSheetTitle(selectedSheetTitle);
    const sheetData = await Utils.getSheetData(accessToken, spreadsheetId, selectedSheetTitle, "R1C1:R1C100", "ROWS", navigate);
    setColumnsList(sheetData[0]);
  }

  // Handle sheet selection
  const handleSheetSelect = (sheetTitle) => {
    handleGetSheetInfo(sheetTitle);
  }

  // Calculate how many attendees haven't been invited
  const calculateHaveNotInvited = async () => {
    try {
      const checkInList = await Utils.getSheetData(accessToken, spreadsheetId, checkInListSheetTitle, "R1C1:R1048576C6", "ROWS", navigate);
      if(checkInList.length <= 1) {
        setHaveNotInvited(0);
        return;
      }
      
      var checkInListColumns = checkInList[0];
      var tempHaveNotInvited = 0;
      
      for (const row of checkInList.slice(1)){
        var dataObj = {};
        for (let colIndex = 0; colIndex < row.length; colIndex++){
          if(checkInListColumns[colIndex] !== "Email"){
            dataObj[checkInListColumns[colIndex]] = row[colIndex];
          }
        }
        if(!("Verification Mail Sent" in dataObj) || dataObj["Verification Mail Sent"] == ""){
          tempHaveNotInvited++;
        }
      }
      setHaveNotInvited(tempHaveNotInvited);
    } catch (error) {
      console.error("Error calculating uninvited count:", error);
      setHaveNotInvited(0);
    }
  };

  // Fetch current email template
  const fetchEmailTemplate = async () => {
    try {
      setLoadingTemplate(true);
      const emailTemplates = await Utils.getSheetData(accessToken, spreadsheetId, emailTemplateSheetTitle, `R2C1:R4C1`, 'COLUMNS', navigate);
      if (emailTemplates && emailTemplates[0] && emailTemplates[0].length >= 3) {
        setEmailSubject(emailTemplates[0][0] || "");
        // Convert <br> tags to line breaks for editing
        const messageWithLineBreaks = (emailTemplates[0][2] || "").replace(/<br\s*\/?>/gi, '\n');
        setEmailMessage(messageWithLineBreaks);
      }
    } catch (error) {
      console.error("Error fetching email template:", error);
    } finally {
      setLoadingTemplate(false);
    }
  };

  // Save email template changes
  const saveEmailTemplate = async () => {
    try {
      setLoadingTemplate(true);
      // Update subject (R2C1)
      await Utils.updateSheetData(accessToken, spreadsheetId, emailTemplateSheetTitle, "R2C1:R2C1", "ROWS", [[emailSubject]], navigate);
      // Convert line breaks to <br> tags for HTML email
      const messageWithBrTags = emailMessage.replace(/\n/g, '<br>');
      // Update message (R4C1)
      await Utils.updateSheetData(accessToken, spreadsheetId, emailTemplateSheetTitle, "R4C1:R4C1", "ROWS", [[messageWithBrTags]], navigate);
      setShowEmailEditor(false);
    } catch (error) {
      console.error("Error saving email template:", error);
    } finally {
      setLoadingTemplate(false);
    }
  };

  // Open email editor and fetch current template
  const handleEditEmailTemplate = () => {
    setShowEmailEditor(true);
    fetchEmailTemplate();
  };

  // Send test email
  const sendTestEmail = async () => {
    if (!testEmailAddress.trim()) {
      alert("Please enter a test email address");
      return;
    }

    try {
      setLoadingTestEmail(true);
      // Convert line breaks to <br> tags for HTML email
      const messageWithBrTags = emailMessage.replace(/\n/g, '<br>');
      const response = await sendEmail(
        testEmailAddress, 
        "Test User", // Use a test name
        emailSubject || "Test Subject", 
        messageWithBrTags || "Test message"
      );
      
      if (response.ok) {
        alert("Test email sent successfully!");
      } else {
        alert("Failed to send test email. Please check your template and try again.");
      }
    } catch (error) {
      console.error("Error sending test email:", error);
      alert("Error sending test email. Please try again.");
    } finally {
      setLoadingTestEmail(false);
    }
  };

  // Update the check-in list
  const handleUpdateCheckInList = async () => {
    try {
      setLoadingCheckIn(true);
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
    } catch (error) {
      console.error("Error updating check-in list:", error);
    } finally {
      setLoadingCheckIn(false);
    }
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
    try {
      setLoadingEmail(true);
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
    } catch (error) {
      console.error("Error sending emails:", error);
    } finally {
      setLoadingEmail(false);
    }
  }
    
  useEffect(() => {
    if (!accessToken) {
      navigate("/login");
    }
    handleGetSpreadsheetsInfo();
  }, []);

  // Calculate uninvited count when email template sheet becomes available
  useEffect(() => {
    if (spreadsheetId && (emailTemplateSheetTitle in sheetsObj) && !loading && !loadingSpreadsheet) {
      calculateHaveNotInvited();
    }
  }, [spreadsheetId, sheetsObj, loading, loadingSpreadsheet]);

  return (
    <div className="pageContainer">
      <div className={styles.contentBox}>
        <div className={styles.header}>
          <h2>{t('manage.title')}</h2>
          <p className={styles.subtitle}>{t('manage.subtitle')}</p>
        </div>

        {/* Step 1: Select Spreadsheet */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3>{t('manage.steps.selectSpreadsheet.title')}</h3>
            <p>{t('manage.steps.selectSpreadsheet.description')}</p>
          </div>
          
          {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>{t('manage.loading')}</p>
            </div>
          ) : (
            <div className={styles.inputGroup}>
              <label>{t('manage.steps.selectSpreadsheet.selectLabel')}</label>
              <Dropdown 
                options={spreadsheetsInfo}
                placeholder={t('manage.steps.selectSpreadsheet.placeholder')}
                onSelect={(value) => handleFileSelect(value)}
              />
              
              {fileDropdown === "EnterURL" && (
                <div className={styles.urlInput}>
                  <label>{t('manage.steps.selectSpreadsheet.urlLabel')}</label>
                  <input 
                    type="text" 
                    placeholder={t('manage.steps.selectSpreadsheet.urlPlaceholder')}
                    onChange={handleEnterURL}
                    className={styles.textInput}
                  />
                  <p className={styles.hint}>
                    {t('manage.steps.selectSpreadsheet.urlHint')}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Step 2: Configure Event */}
        {(spreadsheetId && !loading) && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3>{t('manage.steps.configureEvent.title')}</h3>
              <p>{t('manage.steps.configureEvent.description')}</p>
            </div>

            {loadingSpreadsheet ? (
              <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>{t('common.loading')}</p>
              </div>
            ) : (
              <>
                <div className={styles.subsection}>
                  <h4>📊 Spreadsheet: {spreadsheetName}</h4>
                  
                  <div className={styles.inputGroup}>
                    <label>{t('manage.steps.configureEvent.selectSheetLabel')}</label>
                    <Dropdown 
                      options={Object.keys(sheetsObj)}
                      placeholder={t('manage.steps.configureEvent.sheetPlaceholder')}
                      onSelect={(sheetTitle) => handleSheetSelect(sheetTitle)}
                    />
                  </div>
                </div>

                <div className={styles.subsection}>
                  <h4>{t('manage.steps.configureEvent.setupTitle')}</h4>
                  <p className={styles.description}>
                    {t('manage.steps.configureEvent.setupDescription')}
                  </p>
                  <div className={styles.actionSection}>
                    <button 
                      onClick={handleCreateCheckInSheet} 
                      className={styles.primaryButton}
                      disabled={Object.keys(sheetsObj).length === 0 || (checkInListSheetTitle in sheetsObj && emailTemplateSheetTitle in sheetsObj) || loadingSheetCreation}
                    >
                      {loadingSheetCreation ? (
                        <>
                          <div className={styles.buttonSpinner}></div>
                          {t('manage.steps.configureEvent.creatingButton')}
                        </>
                      ) : (checkInListSheetTitle in sheetsObj && emailTemplateSheetTitle in sheetsObj) ? 
                        t('manage.steps.configureEvent.readyButton') : 
                        t('manage.steps.configureEvent.createButton')
                      }
                    </button>
                    <p className={styles.hint}>
                      {t('manage.steps.configureEvent.setupHint')}
                    </p>
                  </div>
                </div>

                {selectedSheetTitle && (checkInListSheetTitle in sheetsObj) && (
                  <div className={styles.subsection}>
                    <h4>{t('manage.steps.configureEvent.columnMapping')}</h4>
                    <div className={styles.columnMapping}>
                      <div className={styles.inputGroup}>
                        <label>{t('manage.steps.configureEvent.emailColumn')}</label>
                        <Dropdown 
                          options={columnsList}
                          placeholder={t('manage.steps.configureEvent.emailColumnPlaceholder')}
                          onSelect={(value) => setEmailColumn(value)}
                        />
                      </div>
                      
                      <div className={styles.inputGroup}>
                        <label>{t('manage.steps.configureEvent.nameColumn')}</label>
                        <Dropdown 
                          options={columnsList}
                          placeholder={t('manage.steps.configureEvent.nameColumnPlaceholder')}
                          onSelect={(value) => setNameColumn(value)}
                        />
                      </div>
                    </div>
                    <p className={styles.hint}>
                      {t('manage.steps.configureEvent.columnHint')}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Step 3: Sync Data */}
        {(emailColumn && nameColumn && !loading && !loadingSpreadsheet && (checkInListSheetTitle in sheetsObj)) && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3>{t('manage.steps.syncData.title')}</h3>
              <p>{t('manage.steps.syncData.description')}</p>
            </div>

            <div className={styles.actionSection}>
              <button 
                onClick={handleUpdateCheckInList} 
                className={styles.primaryButton}
                disabled={loadingCheckIn}
              >
                {loadingCheckIn ? (
                  <>
                    <div className={styles.buttonSpinner}></div>
                    {t('manage.steps.syncData.syncingButton')}
                  </>
                ) : (
                  <>{t('manage.steps.syncData.syncButton')}</>
                )}
              </button>
              
              {checkInListUpdated >= 0 && (
                <div className={styles.status}>
                  {t('manage.steps.syncData.syncSuccess', { count: checkInListUpdated })}
                </div>
              )}
              
              <p className={styles.hint}>
                {t('manage.steps.syncData.syncHint')}
              </p>
            </div>
          </div>
        )}

        {/* Step 4: Send QR Codes */}
        {(!loading && !loadingSpreadsheet && !loadingCheckIn && (emailTemplateSheetTitle in sheetsObj)) && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3>{t('manage.steps.sendQR.title')}</h3>
              <p>{t('manage.steps.sendQR.description')}</p>
            </div>

            <div className={styles.subsection}>
              <h4>{t('manage.steps.sendQR.emailTemplate')}</h4>
              <div className={styles.actionSection}>
                <button 
                  onClick={handleEditEmailTemplate}
                  className={styles.secondaryButton}
                  disabled={loadingTemplate}
                >
                  {loadingTemplate ? (
                    <>
                      <div className={styles.buttonSpinner}></div>
                      {t('manage.steps.sendQR.loadingTemplate')}
                    </>
                  ) : showEmailEditor ? (
                    <>{t('manage.steps.sendQR.hideEditor')}</>
                  ) : (
                    <>{t('manage.steps.sendQR.showEditor')}</>
                  )}
                </button>
                <p className={styles.hint}>
                  {t('manage.steps.sendQR.editorHint')}
                </p>
              </div>

              {showEmailEditor && (
                <div className={styles.emailEditor}>
                  <div className={styles.inputGroup}>
                    <label>{t('manage.steps.sendQR.emailSubject')}</label>
                    <input 
                      type="text" 
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className={styles.textInput}
                      placeholder={t('manage.steps.sendQR.emailSubjectPlaceholder')}
                    />
                  </div>
                  
                  <div className={styles.inputGroup}>
                    <label>{t('manage.steps.sendQR.emailMessage')}</label>
                    <textarea 
                      value={emailMessage}
                      onChange={(e) => setEmailMessage(e.target.value)}
                      className={styles.textArea}
                      placeholder={t('manage.steps.sendQR.messagePlaceholder')}
                      rows={8}
                    />
                  </div>
                  
                  <div className={styles.testEmailSection}>
                    <h5>{t('manage.steps.sendQR.testEmail')}</h5>
                    <div className={styles.inputGroup}>
                      <label>{t('manage.steps.sendQR.testEmailLabel')}</label>
                      <input 
                        type="email" 
                        value={testEmailAddress}
                        onChange={(e) => setTestEmailAddress(e.target.value)}
                        className={styles.textInput}
                        placeholder={t('manage.steps.sendQR.testEmailPlaceholder')}
                      />
                    </div>
                    <button 
                      onClick={sendTestEmail}
                      className={styles.secondaryButton}
                      disabled={loadingTestEmail || !testEmailAddress.trim()}
                    >
                      {loadingTestEmail ? (
                        <>
                          <div className={styles.buttonSpinner}></div>
                          {t('manage.steps.sendQR.sendingTestButton')}
                        </>
                      ) : (
                        <>{t('manage.steps.sendQR.sendTestButton')}</>
                      )}
                    </button>
                    <p className={styles.hint}>
                      {t('manage.steps.sendQR.testHint')}
                    </p>
                  </div>
                  
                  <div className={styles.emailEditorActions}>
                    <button 
                      onClick={saveEmailTemplate}
                      className={styles.primaryButton}
                      disabled={loadingTemplate}
                    >
                      {loadingTemplate ? (
                        <>
                          <div className={styles.buttonSpinner}></div>
                          {t('manage.steps.sendQR.savingButton')}
                        </>
                      ) : (
                        <>{t('manage.steps.sendQR.saveButton')}</>
                      )}
                    </button>
                    
                    <button 
                      onClick={() => setShowEmailEditor(false)}
                      className={styles.secondaryButton}
                      disabled={loadingTemplate}
                    >
                      ❌ {t('common.cancel')}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.actionSection}>
              <div className={styles.emailOptions}>
                <button 
                  onClick={() => handelSendEmail(false)} 
                  className={styles.primaryButton}
                  disabled={loadingEmail || haveNotInvited === 0}
                >
                  {loadingEmail ? (
                    <>
                      <div className={styles.buttonSpinner}></div>
                      {t('manage.steps.sendQR.sendingButton')}
                    </>
                  ) : haveNotInvited === -1 ? (
                    <>{t('manage.steps.sendQR.calculatingButton')}</>
                  ) : haveNotInvited === 0 ? (
                    <>{t('manage.steps.sendQR.allNotifiedButton')}</>
                  ) : (
                    <>{t('manage.steps.sendQR.sendNewButton', { count: haveNotInvited })}</>
                  )}
                </button>
                
                <button 
                  onClick={() => handelSendEmail(true)} 
                  className={styles.secondaryButton}
                  disabled={loadingEmail}
                >
                  {loadingEmail ? (
                    <>
                      <div className={styles.buttonSpinner}></div>
                      {t('manage.steps.sendQR.sendingButton')}
                    </>
                  ) : (
                    <>{t('manage.steps.sendQR.sendAllButton')}</>
                  )}
                </button>
              </div>
              
              <p className={styles.hint}>
                {t('manage.steps.sendQR.qrHint')}
              </p>
            </div>
          </div>
        )}

        {/* Step 5: Start Check-in */}
        {(spreadsheetId && !loading && !loadingSpreadsheet) && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3>{t('manage.steps.startCheckin.title')}</h3>
              <p>{t('manage.steps.startCheckin.description')}</p>
            </div>

            <div className={styles.actionSection}>
              <button 
                onClick={() => navigate(`/event/${spreadsheetId}/checkin`)}
                className={styles.primaryButton}
              >
                {t('manage.steps.startCheckin.startButton')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagePage;