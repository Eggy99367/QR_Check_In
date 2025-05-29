import { Routes, Route, Link } from 'react-router-dom'
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
    <div className="app">
      <nav>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/about">About</Link></li>
        </ul>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </div>
  )
}

export default App