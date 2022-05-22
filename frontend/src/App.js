import logo from './logo.png';
import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from "react-router-dom";
import {useState, useEffect} from "react";
import { Loader } from "@googlemaps/js-api-loader"

const API_KEY = "..."

const hardcodedData = [
  {
    city: "Bucharest",
    address: "Str. Calea Victoriei nr. 9",
    description: "",
    date: "20.05.2022",
    days: 5,
    area: 200,
    guests: 4,
    contact: "021 344 566",
    lat: 44.43139,
    lng: 26.09674,
  },
  {
    city: "Bucharest",
    address: "Str. Stefan cel Mare nr. 156",
    description: "",
    date: "29.07.2022",
    days: 30,
    area: 150,
    guests: 1,
    contact: "ionel.popescu@gmail.com",
    lat: 44.45198,
    lng: 26.11993,
  },
  {
    city: "Bucharest",
    address: "Bd. Iuliu Maniu nr. 3",
    description: "",
    date: "06.06.2022",
    days: 2,
    area: 80,
    guests: 2,
    contact: "0745 12 34 56",
    lat: 44.43443,
    lng: 26.05625,
  }
]

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header Subtitle White">
          <nav>
            <ul>
              <Link to="/">
                <li>
                    <img src={logo} className="App-logo" alt="logo" />
                    <span className="App-title">Warbnb</span>
                </li>
              </Link>
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
                <Link to="/login"><div className="button blue">Log in</div></Link>
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
    <div className="hosting">
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
  useEffect(() => {
    initialHandler();
  }, [])

  async function initialHandler() {
    // TODO
    // const nearbyHouses = await getNearbyHouses(....)
    const nearbyHouses = hardcodedData;

    const loader = new Loader({
      apiKey: API_KEY,
      version: "weekly",
    });
    
    loader.load().then(() => {
      const map = new window.google.maps.Map(document.getElementById("map"), {
        center: { lat: 44.4268, lng: 26.1025 },
        zoom: 12,
      });

      for (let house of nearbyHouses) {
        new window.google.maps.Marker({
          position: { lat: house.lat, lng: house.lng },
          map: map,
        });
      }
    });
  }

  return <>
    <div id="map"></div>
  </>;
}

function Host() {
  const [housing, setHousing] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(-1);
  const [editHouse, setEditHouse] = useState(null);

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
    setIsEditing(true);
    setEditIndex(index);
    setEditHouse(housing[index]);
  }

  async function deleteHousing(index) {
    // TODO
    // await deleteHousing(housing[index]);
    
    await initialHandler();
  }

  function openCreateNewForm() {
    setIsEditing(true);
    setEditIndex(-1);
    setEditHouse({
      city: "",
      address: "",
      description: "",
      date: "",
      area: 0,
      days: 1,
      guests: 1,
      contact: "",
      lat: "",
      lng: "",
    })
  }

  async function save() {
    if (editIndex === -1) {
      // TODO
      // await createNewHousing(editHouse);
    } else {
      // TODO
      // await editExistingHousing(editHouse);

      await initialHandler();
    }

    setIsEditing(false);
  }

  function cancel() {
    setIsEditing(false);
  }

  return  <div className="hosting hosting-page">
    { isEditing
      ? <div className="editHost">
          <div>
            <span>Address</span>
            <input type="text" value={editHouse.address} onChange={(e) => setEditHouse({...editHouse, address: e.target.value})}/>
          </div>
          <div>
            <span>Latitude</span>
            <input type="text" value={editHouse.lat} onChange={(e) => setEditHouse({...editHouse, lat: e.target.value})}/>
          </div>
          <div>
            <span>Longitude</span>
            <input type="text" value={editHouse.lng} onChange={(e) => setEditHouse({...editHouse, lng: e.target.value})}/>
          </div>
          <div>
            <span>Description</span>
            <input type="text" value={editHouse.description} onChange={(e) => setEditHouse({...editHouse, description: e.target.value})}/>
          </div>
          <div>
            <span>Number of guests</span>
            <input type="number" value={editHouse.guests} onChange={(e) => setEditHouse({...editHouse, guests: e.target.value})}/>
          </div>
          <div>
            <span>Area</span>
            <input type="number" value={editHouse.area} onChange={(e) => setEditHouse({...editHouse, area: e.target.value})}/>
          </div>
          <div>
            <span>Contact information</span>
            <input type="text" value={editHouse.contact} onChange={(e) => setEditHouse({...editHouse, contact: e.target.value})}/>
          </div>
          <div>
            <span>Availability date</span>
            <input type="date" value={editHouse.date} onChange={(e) => setEditHouse({...editHouse, date: e.target.value})}/>
          </div>
          <div>
            <span>Number of days</span>
            <input type="number" value={editHouse.days} onChange={(e) => setEditHouse({...editHouse, days: e.target.value})}/>
          </div>
          <div className="button-row">
            <div className="button gray button-small" onClick={cancel}>Cancel</div>
            <div className="button yellow button-small" onClick={save}>Save</div>
          </div>
        </div>
      : <>
          <table>
            {housing.map(((h, index) => 
              <tr>
                <td style={{textAlign: "right"}}>{h.address}</td>
                <td style={{textAlign: "left"}}>Available for {h.days} day(s) starting from {h.date}</td>
                <td style={{textAlign: "left"}}>{h.guests} guest(s)</td>
                <td>
                  <div className="button gray button-small" onClick={() => editHousing(index)}>Edit</div>
                </td>
                <td>
                  <div className="button gray button-small" onClick={() => deleteHousing(index)}>Delete</div>
                </td>
            </tr>
            ))}
          </table>
          <div className="button yellow" onClick={openCreateNewForm}>Add new</div>
        </>
    }
  </div>;
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [isCreatingAccount, setIsCreatingAccount] = useState(false)

  async function loginOrCreate() {
    if (isCreatingAccount) {
      // TODO
      // await createAccount(email, password, firstName, lastName);
    } else {
      // TODO
      // await userLogin(email, password);
    }  
  }

  function changeLoginCreate() {
    setIsCreatingAccount(!isCreatingAccount);
  }

  return <div className="login">
    <h2>Log in or sign up</h2>

    <div className="login-content">
      <div className="fields Subtitle">
        <input type="text" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}/>
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}/>
        {isCreatingAccount && 
          <>
            <input type="text" placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)}/>
            <input type="text" placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)}/>
          </>
        }
      </div>

      <div className="button blue" onClick={loginOrCreate}>{isCreatingAccount ? "Create" : "Log in"}</div>
      <div className="login-create Subtitle" onClick={changeLoginCreate}>{isCreatingAccount ? "Log in to existing account" : "Create an account" }</div>
    </div>
  </div>;
}

export default App;
