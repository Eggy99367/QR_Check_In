import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage } from '../contexts/LanguageContext';
import Dropdown from '../components/dropdown';
import styles from './checkin-page.module.css';
import Cookies from "js-cookie";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";
import * as Utils from '../utils/googleAPIUtils';




const CheckInPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
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
      
    
    var totalRegistrationsCount = 0;
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
          if(rowEmail != undefined && rowEmail != ""){
            totalRegistrationsCount++;
          }else{
            break;
          }
        }
        rowData[colTitle] = row[colIndex];
        if(colTitle === "Check-In" && row[tempColObj[colTitle]] != undefined && row[tempColObj[colTitle]] != ""){
          checkedInCount++;
        }
      }
      tempCheckInData[rowEmail] = rowData;
    }
    
    setTotalRegistrations(totalRegistrationsCount);
    setCheckedIn(checkedInCount);
    setNotCheckedIn(totalRegistrationsCount - checkedInCount);
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
      document.getElementById("errorAudio").play();
      toast.error(t('checkin.messages.notInList', { email }));
      return false;
    }
    const curTime = Utils.getTime();
    if (alreadyCheckedIn(updatedData, email)){
      
      updatedData = modifyCheckInData(updatedData, email, {"Last Seen": curTime});
      const updateRowData = generateUpdateRow(updatedData, email);
      const rowData = updatedData.values[email];
      Utils.updateSheetData(accessToken, spreadsheetId, checkInListSheetTitle,
        `R${rowData["rowIndex"]}C1:R${rowData["rowIndex"]}C${updateRowData.length}`,
        "ROWS", [updateRowData], navigate);
      document.getElementById("warningAudio").play();
      toast.warning(t('checkin.messages.alreadyCheckedIn', { name: rowData["Name"] }));
      return false;
    }
    
    // Update local stats immediately for successful check-in
    setCheckedIn(prevCheckedIn => prevCheckedIn + 1);
    setNotCheckedIn(prevNotCheckedIn => prevNotCheckedIn - 1);
    
    updatedData = modifyCheckInData(updatedData, email, {"Check-In": curTime, "Last Seen": curTime});
    const rowData = updatedData.values[email];
    const updateRowData = generateUpdateRow(updatedData, email);
    Utils.updateSheetData(accessToken, spreadsheetId, checkInListSheetTitle,
                          `R${rowData["rowIndex"]}C1:R${rowData["rowIndex"]}C${updateRowData.length}`,
                          "ROWS", [updateRowData], navigate);
    document.getElementById("successAudio").play();
    toast.success(t('checkin.messages.checkInSuccess', { name: rowData["Name"] }));
    return true;
  }

  useEffect(() => {
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
    // if (hasInitialized.current) return;
    // hasInitialized.current = true;
    const scanner = new Html5QrcodeScanner("reader", {
      qrbox: window.innerWidth <= 768 ? 180 : 250,
      fps: 20,
      aspectRatio: 1,
      rememberLastUsedCamera: true,
      supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
      showTorchButtonIfSupported: true,

    });

    const onScanSuccess = (decodedText, decodedResult) => {
      if (decodedText === lastScanned.current) return;
      lastScanned.current = decodedText;
      console.log(`QR Code Scanned: ${decodedText}`);
      handleCheckIn(decodedText);
      setTimeout(() => {
        lastScanned.current = "";
      }, 5000);
    };
  
    scanner.render(
      onScanSuccess,
      (error) => {
        // console.warn("Error:", error);
      }
    );

    // Translate html5-qrcode UI text
    setTimeout(() => {
      const readerElement = document.getElementById('reader');
      if (readerElement) {
        // Only translate if current language is Chinese
        if (currentLanguage === 'zh-TW') {
          // Replace button text
          const buttons = readerElement.querySelectorAll('button');
          buttons.forEach(button => {
            if (button.textContent.includes('Request Camera Permissions')) {
              button.textContent = button.textContent.replace('Request Camera Permissions', '請求相機權限');
            }
            if (button.textContent.includes('Start Scanning')) {
              button.textContent = button.textContent.replace('Start Scanning', '開始掃描');
            }
            if (button.textContent.includes('Stop Scanning')) {
              button.textContent = button.textContent.replace('Stop Scanning', '停止掃描');
            }
          });

          // Replace span text
          const spans = readerElement.querySelectorAll('span');
          spans.forEach(span => {
            if (span.textContent.includes('Request Camera Permissions')) {
              span.textContent = span.textContent.replace('Request Camera Permissions', '請求相機權限');
            }
            if (span.textContent.includes('Unable to access camera')) {
              span.textContent = span.textContent.replace('Unable to access camera', '無法訪問相機');
            }
            if (span.textContent.includes('Camera scan is on')) {
              span.textContent = span.textContent.replace('Camera scan is on', '相機掃描已開啟');
            }
          });
        }
      }
    }, 100);

    // Set up a MutationObserver to catch dynamically added content
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node;
            
            // Only translate if current language is Chinese
            if (currentLanguage === 'zh-TW') {
              // Check buttons
              const buttons = element.querySelectorAll ? element.querySelectorAll('button') : [];
              buttons.forEach(button => {
                if (button.textContent.includes('Request Camera Permissions')) {
                  button.textContent = button.textContent.replace('Request Camera Permissions', '請求相機權限');
                }
                if (button.textContent.includes('Start Scanning')) {
                  button.textContent = button.textContent.replace('Start Scanning', '開始掃描');
                }
                if (button.textContent.includes('Stop Scanning')) {
                  button.textContent = button.textContent.replace('Stop Scanning', '停止掃描');
                }
              });

              // Check spans
              const spans = element.querySelectorAll ? element.querySelectorAll('span') : [];
              spans.forEach(span => {
                if (span.textContent.includes('Request Camera Permissions')) {
                  span.textContent = span.textContent.replace('Request Camera Permissions', '請求相機權限');
                }
                if (span.textContent.includes('Unable to access camera')) {
                  span.textContent = span.textContent.replace('Unable to access camera', '無法訪問相機');
                }
                if (span.textContent.includes('Camera scan is on')) {
                  span.textContent = span.textContent.replace('Camera scan is on', '相機掃描已開啟');
                }
              });
            }
          }
        });
      });
    });

    const readerElement = document.getElementById('reader');
    if (readerElement) {
      observer.observe(readerElement, { childList: true, subtree: true });
    }
  
    return () => {
      scanner.clear(); // Cleanup
      observer.disconnect();
    };
  }, [currentLanguage]);

  return (
    <div className="pageContainer">
      <audio id="successAudio" src="/success1.mp3" preload="auto"></audio>
      <audio id="warningAudio" src="/warning.mp3" preload="auto"></audio>
      <audio id="errorAudio" src="/error.mp3" preload="auto"></audio>
      
      <div className={styles.contentBox}>
        <div className={styles.header}>
          <h2>{t('checkin.title')}</h2>
          <h3 className={styles.eventName}>
            {spreadsheetName === "" ? t('checkin.eventLoading') : spreadsheetName}
          </h3>
        </div>

        <div className={styles.scannerContainer}>
          <h4 className={styles.scannerTitle}>{t('checkin.scanTitle')}</h4>
          <div className={styles.scannerWrapper}>
            <div id="reader"></div>
          </div>
          <p className={styles.scannerHint}>
            {t('checkin.scanHint')}
          </p>
        </div>

        <div className={styles.statsContainer}>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{totalRegistrations}</div>
            <div className={styles.statLabel}>{t('checkin.stats.totalRegistered')}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{checkedIn}</div>
            <div className={styles.statLabel}>{t('checkin.stats.checkedIn')}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{notCheckedIn}</div>
            <div className={styles.statLabel}>{t('checkin.stats.remaining')}</div>
          </div>
        </div>

        <div className={styles.progressContainer}>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill} 
              style={{
                width: totalRegistrations > 0 
                  ? `${(checkedIn / totalRegistrations) * 100}%` 
                  : '0%'
              }}
            ></div>
          </div>
          <div className={styles.progressText}>
            {totalRegistrations > 0 ? Math.round((checkedIn / totalRegistrations) * 100) : 0}% {t('checkin.attendance')}
          </div>
        </div>

        <div className={styles.footer}>
          <button onClick={() => navigate('/select-event')} className={styles.backButton}>
            {t('checkin.backButton')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckInPage;
