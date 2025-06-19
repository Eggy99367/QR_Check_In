import { Routes, Route, Link } from 'react-router-dom'
import { Toaster } from 'sonner'
import { LanguageProvider } from './contexts/LanguageContext'
import Navbar from './components/navbar'
import HomePage from './pages/home-page'
import LoginPage from './pages/login-page'
import ManagePage from './pages/manage-page'
import CheckInPage from './pages/checkin-page'
import SelectEventPage from './pages/select-event-page'
import PrivacyPage from './pages/privacy-page'
import './App.css'

function App() {
  return (
    <LanguageProvider>
      <div className="appContainer">
        <Toaster position="top-center" richColors />
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/manage" element={<ManagePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/checkin" element={<CheckInPage />} />
          <Route path="/select-event" element={<SelectEventPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
        </Routes>
      </div>
    </LanguageProvider>
  )
}

export default App