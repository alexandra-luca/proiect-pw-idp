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
  return <div>
    <div className="home-container Subtitle">
      <div className="home-box">
        <p>Location</p>
        <input type="text" placeholder="Add location"></input>
      </div>
      <div className="home-box">
        <p>Check in</p>
        <input type="date" placeholder="Add dates"></input>
      </div>
      <div className="home-box">
        <p>Check out</p>
        <input type="date" placeholder="Add dates"></input>
      </div>
      <div className="home-box">
        <p>Guests</p>
        <input type="number" placeholder="Add guests"></input>
      </div>
    </div>
    <div className="button yellow">Search</div>
  </div>;
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
