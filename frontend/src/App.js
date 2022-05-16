import logo from './logo.png';
import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from "react-router-dom";
import {useState, useEffect} from "react";

const hardcodedData = [
  {
    city: "Bucharest",
    address: "Str. Calea Victoriei nr. 9",
    date: "20.05.2022",
    days: 5,
    guests: 4,
    contact: "021 344 566"
  },
  {
    city: "Bucharest",
    address: "Str. Stefan cel Mare nr. 156",
    date: "29.07.2022",
    days: 30,
    guests: 1,
    contact: "ionel.popescu@gmail.com"
  },
  {
    city: "Bucharest",
    address: "Bd. Iuliu Maniu nr. 3",
    date: "06.06.2022",
    days: 2,
    guests: 2,
    contact: "0745 12 34 56"
  }
]

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
  const [searchLocation, setSearchLocation] = useState("");
  const [searchCheckin, setSearchCheckin] = useState("");
  const [searchCheckout, setSearchCheckout] = useState("");
  const [searchGuests, setSearchGuests] = useState("");

  const [searchResults, setSearchResults] = useState([]);

  async function search() {
    // TODO
    // const __searchResults = await getSearchResultsFromBackend(searchLocation, searchCheckin, searchCheckout, searchGuests);
    const __searchResults = hardcodedData;

    setSearchResults(__searchResults);
  }

  async function reserve(housing) {
    // TODO
    // await reserveInBackend(housing);

    alert(`Reservation confirmed! Please contact the host at ${housing.contact}`)
  }

  return <div>
    <div className="home-container Subtitle">
      <div className="home-box">
        <p>Location</p>
        <input type="text" placeholder="Add location" value={searchLocation} onChange={(e) => setSearchLocation(e.target.value)} />
      </div>
      <div className="home-box">
        <p>Check in</p>
        <input type="date" placeholder="Add dates" value={searchCheckin} onChange={(e) => setSearchCheckin(e.target.value)} />
      </div>
      <div className="home-box">
        <p>Check out</p>
        <input type="date" placeholder="Add dates" value={searchCheckout} onChange={(e) => setSearchCheckout(e.target.value)} />
      </div>
      <div className="home-box">
        <p>Guests</p>
        <input type="number" placeholder="Add guests" value={searchGuests} onChange={(e) => setSearchGuests(e.target.value)} />
      </div>
    </div>
    <div className="button yellow" onClick={search}>Search</div>
    <div className="search-results">
      <table>
        {searchResults.map((h => 
          <tr>
            <td style={{textAlign: "right"}}>{h.address}</td>
            <td style={{textAlign: "left"}}>Available for {h.days} day(s) starting from {h.date}</td>
            <td style={{textAlign: "left"}}>{h.guests} guest(s)</td>
            <td>
             <div className="button yellow button-small" onClick={() => reserve(h)}>Reserve</div>
            </td>
          </tr>
        ))}
      </table>
    </div>
  </div>;
}

function Map() {
  return <h2>Map</h2>;
}

function Host() {
  const [housing, setHousing] = useState([]);

  useEffect(() => {
    initialHandler();
  }, [])

  async function initialHandler() {
    // TODO
    // const __housing = await getHousingFromBackend(.....)
    const __housing = hardcodedData;

    setHousing(__housing);
  }

  function editHousing(index) {

  }

  function deleteHousing(index) {

  }

  return  <div className="hosting">
    <table>
      {housing.map(((h, index) => 
        <tr>
          <td style={{textAlign: "right"}}>{h.address}</td>
          <td style={{textAlign: "left"}}>Available for {h.days} day(s) starting from {h.date}</td>
          <td style={{textAlign: "left"}}>{h.guests} guest(s)</td>
          <td>
            <div className="button yellow button-small" onClick={() => editHousing(index)}>Edit</div>
          </td>
          <td>
            <div className="button yellow button-small" onClick={() => deleteHousing(index)}>Delete</div>
          </td>
      </tr>
      ))}
    </table>
  </div>;
}

function Login() {
  return <h2>Login</h2>;
}

export default App;
