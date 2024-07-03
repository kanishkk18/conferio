import React from 'react';
import './SignIn.css';
import { useAuth0 } from '@auth0/auth0-react';

const SignIn = () => {

    const { user, loginWithRedirect, } = useAuth0();

    console.log("current user", user);
  
   

    return (
        <div className="login-container">
            <div className="login-left">
                <h1>Connect with your<br/>friends easily</h1>
            </div>

            <div className="login-right">

              <img className="login-logo" src="https://res.cloudinary.com/dtl8hxhde/image/upload/v1718475378/CONFERIO/gbkp0siuxyro0cgjq9rq.png" alt="" />
                <h1>Welcome Back</h1>
                <form>
                <div className="google-signin">
        
        <button className='google-btn' onClick={(e) => loginWithRedirect()}>Continue with Google</button>
    
                        <button className='google-btn'>Continue with Apple</button>
                    </div>

                    <div className="separation-signin">
            <div className="line"></div>
            <div className="or">OR</div>
            <div className="line1"></div>
            </div>
                    <input className='login-input' type="email" placeholder="Enter email address" />
                    <button className="submit-button" type="submit">Continue</button>
                </form>
            </div>
        </div>
    );
}

export default SignIn;