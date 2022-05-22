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
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const API_KEY = "AIzaSyAxTIGM0fWILcsidKaUBfQ10PwICFg4t_g"

function timestampToDate(t) {
  var d = new Date();
  d.setTime(t * 1000);
  return d.toLocaleDateString();
}

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
  const [location, setLocation] = useState("map");

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedUserId, setLoggedUserId] = useState(null);
  const [loggedUserToken, setLoggedUserToken] = useState(null);
  const [loggedUserRole, setLoggedUserRole] = useState(null);

  function login(userId, userToken, role) {
    setLoggedUserId(userId);
    setLoggedUserToken(userToken);
    setLoggedUserRole(role);
    setIsLoggedIn(true);
  }

  function logout() { 
    setLoggedUserId(null);
    setLoggedUserToken(null);
    setLoggedUserRole(null);
    setIsLoggedIn(false);
  }

  return (
    <Router>
      <div className="App">
        <header className="App-header Subtitle White">
          <nav>
            <ul>
              {isLoggedIn 
                ? <>
                    <Link to="/">
                      <li>
                          <img src={logo} className="App-logo" alt="logo" />
                          <span className="App-title">Warbnb</span>
                      </li>
                    </Link>
                    <li className={location == 'home' ? 'selected' : ''}>
                      <Link to="/">Search places</Link>
                    </li>
                    <li className={location == 'map' ? 'selected' : ''}>
                      <Link to="/map">Housing near me</Link>
                    </li>
                    <li className={location == 'host' ? 'selected' : ''}>
                      <Link to="/host">Become a Host</Link>
                    </li>
                    <li>
                      <Link to="/login"><div className="button blue" onClick={logout}>{isLoggedIn ? "Log out" : "Log in"}</div></Link>
                    </li>
                  </>
                : <>
                    <li>
                      <img src={logo} className="App-logo" alt="logo" />
                      <span className="App-title">Welcome to Warbnb!</span>
                    </li>
                  </>
                }
            </ul>
          </nav>
        </header>
        <Routes>
          <Route path="/map" element={isLoggedIn ? <Map userId={loggedUserId} userToken={loggedUserToken} setLocation={setLocation}/> : <Login callback={login}/>} />
          <Route path="/host" element={isLoggedIn ? <Host userId={loggedUserId} userToken={loggedUserToken} setLocation={setLocation}/> : <Login callback={login}/>} />
          <Route path="/login" element={<Login callback={login}/>} />
          <Route path="/" element={isLoggedIn ? <Home userId={loggedUserId} userToken={loggedUserToken} setLocation={setLocation}/> : <Login callback={login}/>} />
        </Routes>
      </div>
    </Router>
  );
}

function Home({userId, userToken, setLocation}) {
  const location = useLocation();
  useEffect(() => {
    setLocation("home");
  }, []);

  const [searchLocation, setSearchLocation] = useState("");
  const [searchCheckin, setSearchCheckin] = useState("");
  const [searchCheckout, setSearchCheckout] = useState("");
  const [searchGuests, setSearchGuests] = useState("");

  const [searchResults, setSearchResults] = useState([]);

  async function search() {
    const response = await axios.request({
      method: "GET",
      url: `http://localhost:6000/locations?city=${searchLocation}&roomsNumber=${searchGuests}&fromTimestamp=${Date.parse(searchCheckin)/1000}&toTimestamp=${Date.parse(searchCheckout)/1000}`,
      headers: { 
        Authorization: "Bearer " + userToken
      }
    });
    const responseData = response.data;
    const __housing = responseData.map((h) => {
      delete h.__v;
      return {...h, availability: {toDate: timestampToDate(h.availability.toTimestamp), fromDate: timestampToDate(h.availability.fromTimestamp)}}});


    const __searchResults = __housing;
    setSearchResults(__searchResults);
  }

  async function reserve(housing) {
    const response = await axios.request({
      method: "POST",
      url: `http://localhost:6000/locations/reserve`,
      headers: { 
        Authorization: "Bearer " + userToken
      },
      data: { 
        refugeeId: userId,
        locationId: housing._id,
        fromTimestamp: housing.availability.fromTimestamp,
        toTimestamp: housing.availability.toTimestamp
      }
    });

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
            <td style={{textAlign: "right"}}>{h.address}, {h.city} ({h.totalAreaSquaredMeters} m<sup>2</sup>)</td>
            <td style={{textAlign: "left"}}>Available from {h.availability.fromDate} to {h.availability.toDate}</td>
            <td style={{textAlign: "left"}}>{h.guestsNumber} guest(s)</td>
            <td>
             <div className="button yellow button-small" onClick={() => reserve(h)}>Reserve</div>
            </td>
          </tr>
        ))}
      </table>
    </div>
  </div>;
}

function Map({setLocation}) {
  const location = useLocation();
  useEffect(() => {
    setLocation("map");
  }, []);

  useEffect(() => {
    initialHandler();
  }, [])

  async function initialHandler() {
    const nearbyHouses = hardcodedData;

    const loader = new Loader({
      apiKey: API_KEY,
      version: "weekly",
    });
    
    loader.load().then(() => {
      const map = new window.google.maps.Map(document.getElementById("map"), {
        center: { lat: 44.4268, lng: 26.1025 },
        zoom: 12,
        styles: [
          {
              "featureType": "administrative",
              "elementType": "geometry.stroke",
              "stylers": [
                  {
                      "visibility": "on"
                  },
                  {
                      "color": "#0096aa"
                  },
                  {
                      "weight": "0.30"
                  },
                  {
                      "saturation": "-75"
                  },
                  {
                      "lightness": "5"
                  },
                  {
                      "gamma": "1"
                  }
              ]
          },
          {
              "featureType": "administrative",
              "elementType": "labels.text.fill",
              "stylers": [
                  {
                      "color": "#0096aa"
                  },
                  {
                      "saturation": "-75"
                  },
                  {
                      "lightness": "5"
                  }
              ]
          },
          {
              "featureType": "administrative",
              "elementType": "labels.text.stroke",
              "stylers": [
                  {
                      "color": "#ffe146"
                  },
                  {
                      "visibility": "on"
                  },
                  {
                      "weight": "6"
                  },
                  {
                      "saturation": "-28"
                  },
                  {
                      "lightness": "0"
                  }
              ]
          },
          {
              "featureType": "administrative",
              "elementType": "labels.icon",
              "stylers": [
                  {
                      "visibility": "on"
                  },
                  {
                      "color": "#e6007e"
                  },
                  {
                      "weight": "1"
                  }
              ]
          },
          {
              "featureType": "landscape",
              "elementType": "all",
              "stylers": [
                  {
                      "color": "#ffe146"
                  },
                  {
                      "saturation": "-28"
                  },
                  {
                      "lightness": "0"
                  }
              ]
          },
          {
              "featureType": "poi",
              "elementType": "all",
              "stylers": [
                  {
                      "visibility": "off"
                  }
              ]
          },
          {
              "featureType": "road",
              "elementType": "all",
              "stylers": [
                  {
                      "color": "#0096aa"
                  },
                  {
                      "visibility": "simplified"
                  },
                  {
                      "saturation": "-75"
                  },
                  {
                      "lightness": "5"
                  },
                  {
                      "gamma": "1"
                  }
              ]
          },
          {
              "featureType": "road",
              "elementType": "labels.text",
              "stylers": [
                  {
                      "visibility": "on"
                  },
                  {
                      "color": "#ffe146"
                  },
                  {
                      "weight": 8
                  },
                  {
                      "saturation": "-28"
                  },
                  {
                      "lightness": "0"
                  }
              ]
          },
          {
              "featureType": "road",
              "elementType": "labels.text.fill",
              "stylers": [
                  {
                      "visibility": "on"
                  },
                  {
                      "color": "#0096aa"
                  },
                  {
                      "weight": 8
                  },
                  {
                      "lightness": "5"
                  },
                  {
                      "gamma": "1"
                  },
                  {
                      "saturation": "-75"
                  }
              ]
          },
          {
              "featureType": "road",
              "elementType": "labels.icon",
              "stylers": [
                  {
                      "visibility": "off"
                  }
              ]
          },
          {
              "featureType": "transit",
              "elementType": "all",
              "stylers": [
                  {
                      "visibility": "simplified"
                  },
                  {
                      "color": "#0096aa"
                  },
                  {
                      "saturation": "-75"
                  },
                  {
                      "lightness": "5"
                  },
                  {
                      "gamma": "1"
                  }
              ]
          },
          {
              "featureType": "water",
              "elementType": "geometry.fill",
              "stylers": [
                  {
                      "visibility": "on"
                  },
                  {
                      "color": "#0096aa"
                  },
                  {
                      "saturation": "-75"
                  },
                  {
                      "lightness": "5"
                  },
                  {
                      "gamma": "1"
                  }
              ]
          },
          {
              "featureType": "water",
              "elementType": "labels.text",
              "stylers": [
                  {
                      "visibility": "simplified"
                  },
                  {
                      "color": "#ffe146"
                  },
                  {
                      "saturation": "-28"
                  },
                  {
                      "lightness": "0"
                  }
              ]
          },
          {
              "featureType": "water",
              "elementType": "labels.icon",
              "stylers": [
                  {
                      "visibility": "off"
                  }
              ]
          }
      ]
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

function Host({userId, userToken, setLocation}) {
  const location = useLocation();
  useEffect(() => {
    setLocation("host");
  }, []);

  const [housing, setHousing] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(-1);
  const [editHouse, setEditHouse] = useState(null);

  useEffect(() => {
    initialHandler();
  }, [])

  async function initialHandler() {
    const response = await axios.request({
      method: "GET",
      url: `http://localhost:6000/users/${userId}/locations`,
      headers: { 
        Authorization: "Bearer " + userToken
      }
    });
    const responseData = response.data;
    const __housing = responseData.map((h) => {
      delete h.__v;
      return {...h, availability: {toDate: timestampToDate(h.availability.toTimestamp), fromDate: timestampToDate(h.availability.fromTimestamp)}}});


    setHousing(__housing);
  }

  function editHousing(index) {
    setIsEditing(true);
    setEditIndex(index);
    setEditHouse(housing[index]);
  }

  async function deleteHousing(index) {
    const response = await axios.request({
      method: "DELETE",
      url: `http://localhost:6000/locations/${housing[index]._id}`,
      headers: { 
        Authorization: "Bearer " + userToken
      },
    });

    await initialHandler();
  }

  function openCreateNewForm() {
    setIsEditing(true);
    setEditIndex(-1);
    setEditHouse({
      city: "",
      address: "",
      description: "",
      availability: {fromTimestamp: "", toTimestamp: "", fromDate: "", toDate: ""},
      totalAreaSquaredMeters: 0,
      roomsNumber: 1,
      guestsNumber: 1,
      contact: "",
      geolocation: { latitude: "", longitude: ""},
    })
  }

  async function save() {
    if (editIndex === -1) {
      const response = await axios.request({
        method: "POST",
        url: `http://localhost:6000/locations`,
        headers: { 
          Authorization: "Bearer " + userToken
        },
        data: { 
          userId,
          ...editHouse, 
          availability: {fromTimestamp: Date.parse(editHouse.availability.fromDate)/1000, toTimestamp: Date.parse(editHouse.availability.toDate)/1000},
          reserved: false,
        }
      });
    } else {
      const response = await axios.request({
        method: "POST",
        url: `http://localhost:6000/locations/${editHouse._id}`,
        headers: { 
          Authorization: "Bearer " + userToken
        },
        data: { 
          userId,
          ...editHouse, 
          _id: undefined,
          availability: {fromTimestamp: Date.parse(editHouse.availability.fromDate)/1000, toTimestamp: Date.parse(editHouse.availability.toDate)/1000},
        }
      });

    }
    await initialHandler();

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
            <span>City</span>
            <input type="text" value={editHouse.city} onChange={(e) => setEditHouse({...editHouse, city: e.target.value})}/>
          </div>
          <div>
            <span>Latitude</span>
            <input type="text" value={editHouse.geolocation.latitude} onChange={(e) => setEditHouse({...editHouse, geolocation: {latitude: e.target.value, longitude: editHouse.geolocation.longitude}})}/>
          </div>
          <div>
            <span>Longitude</span>
            <input type="text" value={editHouse.geolocation.longitude} onChange={(e) => setEditHouse({...editHouse, geolocation: {longitude: e.target.value, latitude: editHouse.geolocation.latitude}})}/>
          </div>
          <div>
            <span>Description</span>
            <input type="text" value={editHouse.description} onChange={(e) => setEditHouse({...editHouse, description: e.target.value})}/>
          </div>
          <div>
            <span>Number of guests</span>
            <input type="number" value={editHouse.guestsNumber} onChange={(e) => setEditHouse({...editHouse, guestsNumber: e.target.value})}/>
          </div>
          <div>
            <span>Area</span>
            <input type="number" value={editHouse.totalAreaSquaredMeters} onChange={(e) => setEditHouse({...editHouse, totalAreaSquaredMeters: e.target.value})}/>
          </div>
          <div>
            <span>Contact information</span>
            <input type="text" value={editHouse.contact} onChange={(e) => setEditHouse({...editHouse, contact: e.target.value})}/>
          </div>
          <div>
            <span>Available from date</span>
            <input type="date" value={editHouse.availability.fromDate} onChange={(e) => setEditHouse({...editHouse, availability: {fromDate: e.target.value, toDate: editHouse.availability.toDate}})}/>
          </div>
          <div>
            <span>Available to date</span>
            <input type="date" value={editHouse.availability.toDate} onChange={(e) => setEditHouse({...editHouse, availability: {toDate: e.target.value, fromDate: editHouse.availability.fromDate}})}/>
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
                <td style={{textAlign: "right"}}>{h.address}, {h.city} ({h.totalAreaSquaredMeters} m<sup>2</sup>)</td>
                <td style={{textAlign: "left"}}>Available from {h.availability.fromDate} to {h.availability.toDate}</td>
                <td style={{textAlign: "left"}}>{h.guestsNumber} guest(s)</td>
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

function Login({callback}) {
  let navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("");

  const [isCreatingAccount, setIsCreatingAccount] = useState(false)

  async function loginOrCreate() {
    if (isCreatingAccount) {
      const response = await axios.request({
        method: "POST",
        url: "http://localhost:6000/users/register",
        data: {
          email,
          password,
          firstName,
          lastName,
          role
        }
      });
      const responseData = response.data;

      if (responseData.token && responseData.userId) {
        callback(responseData.userId, responseData.token, responseData.role || "host");
        navigate("/", { replace: true });
      }
    } else {
      const response = await axios.request({
        method: "POST",
        url: "http://localhost:6000/users/login",
        data: {
          email,
          password,
        }
      });
      const responseData = response.data;

      if (responseData.token && responseData.userId) {
        callback(responseData.userId, responseData.token, responseData.role || "host");
        navigate("/", { replace: true });
      }
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
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="" disabled hidden>Select role</option>
              <option value="host">Host</option>
              <option value="refugee">Refugee</option>
            </select>
          </>
        }
      </div>

      <div className="button blue" onClick={loginOrCreate}>{isCreatingAccount ? "Create" : "Log in"}</div>
      <div className="login-create Subtitle" onClick={changeLoginCreate}>{isCreatingAccount ? "Log in to existing account" : "Create an account" }</div>
    </div>
  </div>;
}

export default App;
