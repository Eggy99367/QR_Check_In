import { Routes, Route, Link } from 'react-router-dom'
import { Toaster } from 'sonner'
import Navbar from './components/navbar'
import LoginPage from './pages/login-page'
import ManagePage from './pages/manage-page'
import CheckInPage from './pages/checkin-page'
import './App.css'

function App() {
  return (
    <div className="appContainer">
      <Toaster position="bottom-center" richColors />
      <Navbar />
      <Routes>
        <Route path="/" element={<ManagePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/checkin" element={<CheckInPage />} />
      </Routes>
    </div>
  )
}

export default App