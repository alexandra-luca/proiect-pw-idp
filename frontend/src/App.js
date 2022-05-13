import logo from './logo.png';
import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from "react-router-dom";

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header Subtitle White">
          <nav>
            <ul>
              <li>
               <img src={logo} className="App-logo" alt="logo" />
               <span className="App-title">Warbnb</span>
              </li>
              <li>
                <Link to="/">Search places</Link>
              </li>
              <li>
                <Link to="/map">Housing near me</Link>
              </li>
              <li>
                <Link to="/host">Become a Host</Link>
              </li>
              <li>
                <Link to="/login">Log in</Link>
              </li>
            </ul>
          </nav>
        </header>
        <Routes>
          <Route path="/map" element={<Map/>} />
          <Route path="/host" element={<Host/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/" element={<Home/>} />
        </Routes>
      </div>
    </Router>
  );
}

function Home() {
  return <h2>Home</h2>;
}

function Map() {
  return <h2>Map</h2>;
}

function Host() {
  return <h2>Host</h2>;
}

function Login() {
  return <h2>Login</h2>;
}

export default App;
