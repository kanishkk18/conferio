import React from "react";
import "./Navbar.css";
import { Link } from "react-router-dom";
import { useAuth0 } from '@auth0/auth0-react';

export default function Navbar() {
    const {user, isAuthenticated, logout} = useAuth0();

  console.log("current user", user);

    return (
        <div className="navbar">
            <img src="https://res.cloudinary.com/dtl8hxhde/image/upload/v1718475378/CONFERIO/gbkp0siuxyro0cgjq9rq.png" alt="Conferio"/>
            <ul className="nav-menu">
            <Link to="/Room">
                <span className="navlist">My room</span>
                </Link>
                <Link to="/Pricing">
                <span className="navlist">Price</span>
                </Link>
                <Link to="/Support">
                <span className="navlist">Support</span>
                </Link>
            </ul>
                <Link to="/SignIn">
                {
        isAuthenticated ? (<button className="navlist-btn" onClick={(e)=> logout()}>Logout</button>) : (

        <button className="navlist-btn">Login</button>
        )}
                </Link>
        </div>
    )
}
