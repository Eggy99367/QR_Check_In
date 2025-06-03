import { Routes, Route, Link } from 'react-router-dom'
import Navbar from './components/navbar'
import LoginPage from './pages/login-page'
import ManagePage from './pages/manage-page'
import './App.css'

function App() {
  return (
    <div className="appContainer">
      <Navbar />
      <Routes>
        <Route path="/" element={<ManagePage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </div>
  )
}

export default App