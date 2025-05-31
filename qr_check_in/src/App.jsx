import { Routes, Route, Link } from 'react-router-dom'
import Navbar from './components/navbar'
import LoginPage from './pages/login-page'
import HomePage from './pages/home-page'
import './App.css'

// Example page components
const Home = () => (
  <div>
    <h1>Home Page</h1>
    <p>Welcome to the QR Check-In application!</p>
  </div>
)

const About = () => (
  <div>
    <h1>About Page</h1>
    <p>This is a QR code check-in system.</p>
  </div>
)

function App() {
  return (
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
  )
}

export default App