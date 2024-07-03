
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './Components/Home';
import SignIn from './Components/SignIn';
import Room from './Components/Room';
import Pricing from"./Components/Pricing";
import Support from './Components/Support';
import RoomPage from './Components/Lobby';

import './App.css';

function App() {
  return (
    <div>
      <BrowserRouter>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home/>}></Route>
            <Route path="/Support" element={<Support/>}></Route>
            <Route path="/Room" element={<Room/>}></Route>
            <Route path="/Pricing" element={<Pricing/>}></Route>
            <Route path="/room/:roomId" element={<RoomPage />} />
            <Route path="/SignIn" element={<SignIn/>}></Route>
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  )
};

export default App;
