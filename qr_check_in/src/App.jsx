import { Routes, Route, Link } from 'react-router-dom'
import Navbar from './components/navbar'
import LoginPage from './pages/login-page'
import HomePage from './pages/home-page'
import './App.css'

function App() {
  return (
    <div className="appContainer">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </div>
  )
}

export default App