import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import styles from './select-event-page.module.css';
import Cookies from "js-cookie";
import * as Utils from '../utils/googleAPIUtils';
import Dropdown from '../components/dropdown';

const SelectEventPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const accessToken = Cookies.get('access_token');
  
  // Spreadsheet selection states
  const [spreadsheetsInfo, setSpreadsheetsInfo] = useState([]);
  const [fileDropdown, setFileDropdown] = useState("");
  const [spreadsheetId, setSpreadsheetId] = useState("");
  const [spreadsheetName, setSpreadsheetName] = useState("");
  
  // Loading and validation states
  const [loading, setLoading] = useState(true);
  const [loadingSpreadsheet, setLoadingSpreadsheet] = useState(false);
  const [error, setError] = useState("");
  
  // Event stats states
  const [hasCheckInSheet, setHasCheckInSheet] = useState(false);
  const [eventStats, setEventStats] = useState({
    totalAttendees: 0,
    checkedInCount: 0,
    lastModified: null
  });

  const checkInListSheetTitle = import.meta.env.VITE_CHECKINLISTSHEETTITLE;

  const handleGetSpreadsheetsInfo = async () => {
    try {
      setLoading(true);
      setError("");
      
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

      if (data.error) {
        setError("Failed to fetch spreadsheets");
        return;
      }

      var tempArray = [["EnterURL", t('selectEvent.urlDropdownOption')]];
      for(const spreadsheetObj of Object.values(data.files)){
        tempArray.push([spreadsheetObj.id, spreadsheetObj.name]);
      }
      setSpreadsheetsInfo(tempArray);
    } catch (err) {
      setError("Failed to load spreadsheets");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const validateSpreadsheetAccess = async (spreadsheetId) => {
    try {
      setLoadingSpreadsheet(true);
      setError("");
      setHasCheckInSheet(false);
      setEventStats({ totalAttendees: 0, checkedInCount: 0, lastModified: null });

      // Get spreadsheet info
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
      
      if (data.error) {
        setError("Unable to access this spreadsheet. Please check permissions.");
        return;
      }

      setSpreadsheetName(data.properties.title);
      
      // Check for Check-In List sheet
      const hasCheckInListSheet = data.sheets.some(
        sheet => sheet.properties.title === checkInListSheetTitle
      );
      
      if (!hasCheckInListSheet) {
        setError(`This spreadsheet doesn't have a "${checkInListSheetTitle}" sheet. Please set it up in the Manage Events page first.`);
        return;
      }
      
      setHasCheckInSheet(true);
      
      // Get event statistics
      try {
        const checkInData = await Utils.getSheetData(
          accessToken, 
          spreadsheetId, 
          checkInListSheetTitle, 
          "R1C1:R1048576C6", 
          "ROWS", 
          navigate
        );
        
        let totalAttendees = 0;
        let checkedInCount = 0;
        
        if (checkInData && checkInData.length > 1) {
          const columns = checkInData[0];
          const emailColIndex = columns.indexOf("Email");
          const checkInColIndex = columns.indexOf("Check-In");
          
          for (let i = 1; i < checkInData.length; i++) {
            const row = checkInData[i];
            if (row[emailColIndex] && row[emailColIndex].trim() !== "") {
              totalAttendees++;
              if (checkInColIndex >= 0 && row[checkInColIndex] && row[checkInColIndex].trim() !== "") {
                checkedInCount++;
              }
            }
          }
        }

        setEventStats({
          totalAttendees,
          checkedInCount,
          lastModified: new Date().toISOString()
        });
      } catch (err) {
        console.log("Could not get check-in data");
        setEventStats({ totalAttendees: 0, checkedInCount: 0, lastModified: null });
      }
    } catch (err) {
      setError("Failed to validate spreadsheet access");
      console.error(err);
    } finally {
      setLoadingSpreadsheet(false);
    }
  };

  const handleFileSelect = async (value) => {
    setFileDropdown(value);
    if(value === "EnterURL"){
      setSpreadsheetId("");
      setSpreadsheetName("");
      setHasCheckInSheet(false);
      setEventStats({ totalAttendees: 0, checkedInCount: 0, lastModified: null });
      setError("");
    } else if (value) {
      setSpreadsheetId(value);
      await validateSpreadsheetAccess(value);
    }
  };

  const handleEnterURL = async (e) => {
    const url = e.target.value;
    if (url.includes("/d/")) {
      try {
        const id = url.split("/d/")[1].split("/")[0];
        setSpreadsheetId(id);
        await validateSpreadsheetAccess(id);
      } catch (err) {
        setError("Invalid Google Sheets URL");
      }
    }
  };

  const handleStartCheckIn = () => {
    navigate(`/checkin?spreadsheetId=${spreadsheetId}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    if (!accessToken) {
      navigate("/login");
      return;
    }
    handleGetSpreadsheetsInfo();
  }, []);

  return (
    <div className="pageContainer">
      <div className={styles.contentBox}>
        <div className={styles.header}>
          <h2>{t('selectEvent.title')}</h2>
          <p className={styles.subtitle}>{t('selectEvent.subtitle')}</p>
        </div>

        {/* Step 1: Select Spreadsheet */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3>{t('selectEvent.selectSpreadsheet')}</h3>
            <p>{t('selectEvent.selectDescription')}</p>
          </div>
          
          {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>{t('selectEvent.loading')}</p>
            </div>
          ) : (
            <div className={styles.inputGroup}>
              <label>{t('selectEvent.selectLabel')}</label>
              <Dropdown 
                options={spreadsheetsInfo}
                placeholder={t('selectEvent.placeholder')}
                onSelect={(value) => handleFileSelect(value)}
              />
              
              {fileDropdown === "EnterURL" && (
                <div className={styles.urlInput}>
                  <label>{t('selectEvent.urlLabel')}</label>
                  <input 
                    type="text" 
                    placeholder={t('selectEvent.urlPlaceholder')}
                    onChange={handleEnterURL}
                    className={styles.textInput}
                  />
                  <p className={styles.hint}>
                    {t('selectEvent.urlHint')}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className={styles.error}>
            <p>❌ {error.includes("set it up") ? t('selectEvent.noCheckInSheet') : error}</p>
            {error.includes("set it up") && (
              <button onClick={() => navigate('/manage')} className={styles.manageButton}>
                {t('selectEvent.manageButton')}
              </button>
            )}
          </div>
        )}

        {/* Loading Spreadsheet */}
        {loadingSpreadsheet && (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>{t('selectEvent.validating')}</p>
          </div>
        )}

        {/* Event Details */}
        {hasCheckInSheet && !loadingSpreadsheet && !error && (
          <div className={styles.eventSection}>
            <div className={styles.eventCard}>
              <div className={styles.eventHeader}>
                <h3>{spreadsheetName}</h3>
                {eventStats.lastModified && (
                  <span className={styles.lastModified}>
                    {t('selectEvent.validated', { date: formatDate(eventStats.lastModified) })}
                  </span>
                )}
              </div>
              
              <div className={styles.eventStats}>
                <div className={styles.stat}>
                  <span className={styles.statNumber}>{eventStats.totalAttendees}</span>
                  <span className={styles.statLabel}>{t('checkin.stats.totalRegistered')}</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statNumber}>{eventStats.checkedInCount}</span>
                  <span className={styles.statLabel}>{t('checkin.stats.checkedIn')}</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statNumber}>
                    {eventStats.totalAttendees > 0 ? Math.round((eventStats.checkedInCount / eventStats.totalAttendees) * 100) : 0}%
                  </span>
                  <span className={styles.statLabel}>{t('checkin.attendance')}</span>
                </div>
              </div>

              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill} 
                  style={{
                    width: eventStats.totalAttendees > 0 
                      ? `${(eventStats.checkedInCount / eventStats.totalAttendees) * 100}%` 
                      : '0%'
                  }}
                ></div>
              </div>

              <button 
                onClick={handleStartCheckIn}
                className={styles.selectButton}
              >
                {t('selectEvent.startButton')}
              </button>
            </div>
          </div>
        )}

        <div className={styles.footer}>
          <button onClick={() => navigate('/')} className={styles.backButton}>
            {t('selectEvent.backButton')}
          </button>
          <button onClick={handleGetSpreadsheetsInfo} className={styles.refreshButton}>
            {t('selectEvent.refreshButton')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectEventPage; 