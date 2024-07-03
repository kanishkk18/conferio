import React, {useState, useCallback, useEffect, useRef} from 'react';
import {useNavigate} from 'react-router-dom';
import './Room.css';
import { useAuth0 } from '@auth0/auth0-react';
import Navbar from './Navbar';

const HomePage = () =>{

  const { user, isAuthenticated } = useAuth0();

  console.log("current user", user);

 
    const [dateTime, setDateTime] = useState(new Date().toLocaleString());

    useEffect(() => {
        const timer = setInterval(() => {
            setDateTime(new Date().toLocaleString());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const [value, setValue] = useState();

    const navigate = useNavigate();

    const handleJoinRoom = useCallback (() => {
        navigate(`/room/${value}`);
    }, [navigate, value]);

    
  return (
    
  
    <div className="room">
      <Navbar/>
    <div className="roomnav">
    <span className="navlogo"> 
     <img src="https://res.cloudinary.com/dtl8hxhde/image/upload/v1718475378/CONFERIO/gbkp0siuxyro0cgjq9rq.png" alt="" />
      <p>CONFERIO</p>
    </span>
    
    {isAuthenticated && <h2 className='nav-name'>Hello! {user.name}</h2>}
      <div className="nav-content">
        <span className="datetime">{dateTime}</span>
        <div className="setting">
          <img src="https://res.cloudinary.com/dtl8hxhde/image/upload/v1718892271/CONFERIO/skei3mn1qhh70a33zymx.svg" alt="" height={40} width={40} />
        </div>
        <div className="profile">

        {isAuthenticated && (
      <div>
        <img src={user.picture} alt={user.name} />
      </div>
    )}
        </div>
        </div>
    </div>
    <div className="roomhero">
      <div className="roomtext">
      <h1>High-quality and secure video  <br/>calls and meetings </h1>
      <p>Connect, Collaborate and Share from anywhere with Conferio</p>
   
    <div className="roombuttons">
      <button className="roombtn">
        New meeting
      </button>
    <input value={value} onChange={(e) => setValue(e.target.value)}
        className='room-input' type="text" placeholder='Enter a code or link'/>
        <button className='joinbtn' onClick={handleJoinRoom}>Join</button>
        </div>
         </div>

         <div className="roomimg-container">
         <div className="roomimg" >
          
          <div className="room-img" >
         <img src="https://res.cloudinary.com/dtl8hxhde/image/upload/v1719230638/qpvotyavqr2qzzstqllg.svg"  alt=""/>
         <h3>Get a link you can share </h3>
         <p>Click New Meeting to get link you can send to people you want to meet with</p>
         </div>
         <div className="room-img" >
         <img src="https://res.cloudinary.com/dtl8hxhde/image/upload/v1719237996/byavn013ooxtjupr7xzu.svg"  alt="" />
         <h3>Schedule Meetings</h3>
         <p>Click New Meeting to schedule meetings in google calender and send invites to participants</p>
         </div>
         <div className="room-img" >
         <img src="https://res.cloudinary.com/dtl8hxhde/image/upload/v1719237751/gi23vqkgyjyrdrkr76j4.svg"  alt="" />
         <h3>Your meeting is secure</h3>
         <p>No one can join a meeting unless invited or admitted by the host</p>
         </div>
         </div>
         
         </div>
        </div>
</div>
  )
};

export default HomePage;
