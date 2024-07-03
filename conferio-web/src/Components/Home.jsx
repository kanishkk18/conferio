import React from 'react';
import Navbar from './Navbar';
import './Home.css';
import laptop from '../Assets/laptop.png';
import tick from '../Assets/tick.svg';
import rightarrow from '../Assets/rightarrow.svg';
import secure from '../Assets/secure.svg';
import herologo from '../Assets/herologo.mp4';
import { Link } from 'react-router-dom';


export default function Home() {
    return (
        <div>
            <Navbar/>
            <div className="hero">
            <div className="ticker">
              <div className="tickerimg">
            <img src="https://res.cloudinary.com/dtl8hxhde/image/upload/v1718405537/CONFERIO/fbj7pfevl1av3zmasts9.jpg" alt="" />
            <img src="https://res.cloudinary.com/dtl8hxhde/image/upload/v1718405603/CONFERIO/pwdqeuwyde09vddrmtec.jpg" alt="" />
            </div>

            <div className="herotext">
                <div className="herologo">
                <video autoPlay loop muted src={herologo}></video>
            </div>
                    <span>One Place for all your calls<br />and conferences</span>
                    <p>Conferio is a platform where you can conduct high-quality <br /> and secure video meetings and calls.</p>
                    <div className="herobuttons">
                    <Link to="/Room"><button className="hero-button">Create a meeting</button></Link>
                    <button className="hero-button">Download app</button>
                </div>
                </div>

            
            <div className="ticker-img">
            <img src="https://res.cloudinary.com/dtl8hxhde/image/upload/v1718405486/CONFERIO/rn3yxsvfabdk0iqgqdp3.jpg" alt="" />
            <img src="https://res.cloudinary.com/dtl8hxhde/image/upload/v1718405603/CONFERIO/pwdqeuwyde09vddrmtec.jpg" alt="" />
            </div>
            </div>
            
            </div>
            <div className="herolap">
                <img src={laptop} alt="laptop" />
            </div>
            <div className="aboutsection">
                <h2 style={{ fontSize: 40, fontWeight: 400 }}>Communicate simply<br />and securely</h2>
                <p style={{ color: '#4b4b4b', marginTop: -20, fontWeight: 600 }}>we are trusted by more than 500 companies</p>

                <div className="infocontainer">
                    <div className="infobox-one">
                        <img src={tick} alt="" />
                        <h3>Ease of use</h3>
                        <p>Clear and minimalist design of CONFERIO allows you to easily navigate the platform and use all its features. </p>
                    </div>
                    <div className="infobox-two">
                        <img src={rightarrow} alt="" />
                        <h3>Login from any device</h3>
                        <p> The CONFERIO environment syncs with your calender system and you can attend meetings from any device. </p>
                    </div>
                    <div className="infobox-three">
                        <img src={secure} alt="" />
                        <h3>Secure</h3>
                        <p>Reliable security setting will allow you to conduct virtual conferences without outside interferences. </p>
                    </div>
                </div>
            </div>
            <div className="features">
                <div className="featurelist-one">
                    <img src="https://res.cloudinary.com/dtl8hxhde/image/upload/v1718127603/CONFERIO/b8m3duqfhepiotaxbt8n.jpg" alt="" />
                    <h3>Widgets</h3>
                    <p>Now in the chat you can create a widget with one<br />answer or with multiple answers.</p>
                </div>
                <div className="featureslist-one">
                    <img src="https://res.cloudinary.com/dtl8hxhde/image/upload/v1718127603/CONFERIO/b8m3duqfhepiotaxbt8n.jpg" alt="" />
                    <h3>Synchronization with phone</h3>
                    <p>Transfer your meeting from your computer<br />to your phone with one click.</p>
                </div>
                <div className="featureslist-two">
                    <img src="https://res.cloudinary.com/dtl8hxhde/image/upload/v1718133666/CONFERIO/b1drghfquxf3wce7dviu.jpg" alt="" />
                    <h3>New chat features</h3>
                    <p>Now you can reply to the message, copy, pin,<br />delete it or put a reaction.</p>
                </div>
                <div className="featurelist-two">
                    <img src="https://res.cloudinary.com/dtl8hxhde/image/upload/v1718133858/CONFERIO/zdtmylblgu1jhldjiody.png" alt="" />
                    <h3>Chat Voting</h3>
                    <p>Vote directly in the chat during the rally and<br />also see the voting results.</p>
                </div>
            </div>

            <section className="tools">
                <div className="toolsec">
                    <div className="toolstext">
                        <h1>Work with your<br />tools</h1>
                        <p>Conferio integrates seamlessly into 100+<br />industry-leading apps.</p>
                    </div>
                    <div className="icons">
                        <div className="iconone">
                          <div className="icon-slider">
                            <img src="https://res.cloudinary.com/dtl8hxhde/image/upload/v1718203321/CONFERIO/svg/cqadrvs89xvqn7wu1nop.svg" alt="" />
                            <img src="https://res.cloudinary.com/dtl8hxhde/image/upload/v1718204642/CONFERIO/svg/uku0sbsndymdd2w5plow.png" alt="" />
                            <img src="https://res.cloudinary.com/dtl8hxhde/image/upload/v1718203984/CONFERIO/svg/wohzufd7zi4qo4ohrkus.png" alt="" />
                            <img src="https://res.cloudinary.com/dtl8hxhde/image/upload/v1718205939/CONFERIO/svg/ahieqzgdvniomvj8ealk.png" alt="" />
                            <img src="https://res.cloudinary.com/dtl8hxhde/image/upload/v1718203321/CONFERIO/svg/cqadrvs89xvqn7wu1nop.svg" alt="" />
                            <img src="https://res.cloudinary.com/dtl8hxhde/image/upload/v1718204642/CONFERIO/svg/uku0sbsndymdd2w5plow.png" alt="" />
                            <img src="https://res.cloudinary.com/dtl8hxhde/image/upload/v1718203984/CONFERIO/svg/wohzufd7zi4qo4ohrkus.png" alt="" />
                            <img src="https://res.cloudinary.com/dtl8hxhde/image/upload/v1718205939/CONFERIO/svg/ahieqzgdvniomvj8ealk.png" alt="" />
                            
                        </div>
                        </div>

                        <div className="icontwo">
                        <div className="slider-down">
                            <img src="https://res.cloudinary.com/dtl8hxhde/image/upload/v1718202905/CONFERIO/svg/wfgpfo5ixaehmwwvpiau.svg" alt="" />
                            <img src="https://res.cloudinary.com/dtl8hxhde/image/upload/v1718208178/CONFERIO/svg/rzchobbmwc0dkrrhcdib.jpg" alt="" />
                            <img src="https://res.cloudinary.com/dtl8hxhde/image/upload/v1718202735/CONFERIO/svg/pqoctqebftkxpla3nsqe.svg" alt="" />
                            <img src="https://res.cloudinary.com/dtl8hxhde/image/upload/v1718208452/CONFERIO/svg/pryfsznna7uljhrxayep.svg" alt="" />
                            <img src="https://res.cloudinary.com/dtl8hxhde/image/upload/v1718202905/CONFERIO/svg/wfgpfo5ixaehmwwvpiau.svg" alt="" />
                            <img src="https://res.cloudinary.com/dtl8hxhde/image/upload/v1718208178/CONFERIO/svg/rzchobbmwc0dkrrhcdib.jpg" alt="" />
                            <img src="https://res.cloudinary.com/dtl8hxhde/image/upload/v1718202735/CONFERIO/svg/pqoctqebftkxpla3nsqe.svg" alt="" />
                            <img src="https://res.cloudinary.com/dtl8hxhde/image/upload/v1718208452/CONFERIO/svg/pryfsznna7uljhrxayep.svg" alt="" />
                            
                        </div>
                        </div>

                        <div className="iconthree">
                        <div className="icon-slider">
                            <img src="https://res.cloudinary.com/dtl8hxhde/image/upload/v1718208624/CONFERIO/svg/zqgemdjceqvma8tzqdaj.svg" alt="" />
                            <img src="https://res.cloudinary.com/dtl8hxhde/image/upload/v1718204397/CONFERIO/svg/avmout5y387zdvqkfh7a.svg" alt="" />
                            <img src="https://res.cloudinary.com/dtl8hxhde/image/upload/v1718203468/CONFERIO/svg/i3uypvxcmgjw5bstk1vj.svg" alt="" />
                            <img src="https://res.cloudinary.com/dtl8hxhde/image/upload/v1718209010/CONFERIO/svg/azkpbu5gvirapcbqtbss.svg" alt="" />
                            <img src="https://res.cloudinary.com/dtl8hxhde/image/upload/v1718208624/CONFERIO/svg/zqgemdjceqvma8tzqdaj.svg" alt="" />
                            <img src="https://res.cloudinary.com/dtl8hxhde/image/upload/v1718204397/CONFERIO/svg/avmout5y387zdvqkfh7a.svg" alt="" />
                            <img src="https://res.cloudinary.com/dtl8hxhde/image/upload/v1718203468/CONFERIO/svg/i3uypvxcmgjw5bstk1vj.svg" alt="" />
                            <img src="https://res.cloudinary.com/dtl8hxhde/image/upload/v1718209010/CONFERIO/svg/azkpbu5gvirapcbqtbss.svg" alt="" />
                        </div>
                        </div>

                    </div>
                </div>
            </section>

            <div className="pricing">
                <h1>Our Plans</h1>
                <div className="price">
                    <div className="pricecard">
                        <p>Simple Plan</p>
                    </div>
                    <div className="pricecard" style={{ marginTop: -10, height: 520 }}>
                        <p>Premium Plan</p>
                    </div>
                    <div className="pricecard" >
                        <p>Super plan</p>
                    </div>
                </div>
            </div>

            <div className="brandname">
                <h1>CONFERIO</h1>
            </div>
            <section className="we-are-one">
                <div className="pointone">
                    <h1 style={{fontSize:60,fontWeight:400,marginTop:100}}>We.</h1>
                    <h1 style={{fontSize:70,fontWeight:400,marginTop:-40}}>Are.</h1>
                    <h1 style={{fontSize:80,fontWeight:400,marginTop: -60}}>One.</h1>
                    <div className="underline"></div>
                </div>
                <div className="pointtwo"></div>
                <div className="pointthree"></div>
                <div className="pointfour"></div>
            </section>
            <div className="demo">
                <img src="https://res.cloudinary.com/dtl8hxhde/image/upload/v1718221991/CONFERIO/svg/wi1abxmqml3g5d1rkess.jpg" alt="" />
            </div>

            <div className="tiltlaptop">
                <img src="https://res.cloudinary.com/dtl8hxhde/image/upload/v1718194411/CONFERIO/z4on5qd6fhyovferly8v.png" alt="" />
            </div>

            <section className='whyconferio'>
                    <h1> Why Conferio?</h1>
                    <p>The Conferio platform is easy to use and navigate.Built to spark creativity<br />and power productivity.Designed to connect hybrid teams.Yes,your<br />office can have it all.
                    </p>
                <div className="whybuttons">
                    <button className="whybtn">Start For Free</button>
                    <button className="whybtn">See Prices</button>
                </div>
            </section>

            <footer>
                <div className="footer">
                    <img src="https://res.cloudinary.com/dtl8hxhde/image/upload/v1718475378/CONFERIO/gbkp0siuxyro0cgjq9rq.png" alt="" />
                    <li>Price</li>
                    <li>My room</li>
                    <li>Support</li>
                    <li>Features</li>
                    <li>Tools</li>
                    <li>Why us?</li>
                </div>

                <div className="footersec">
                    <nav>
                        <a href="https://www.facebook.com/profile.php?id=100063862578065" >

                            <img src="https://res.cloudinary.com/dtl8hxhde/image/upload/v1718229045/CONFERIO/svg/xuuggrjofb7l4pqnqatp.svg" alt="" height={35} width={35} style={{ padding: 10 }} />
                        </a>
                        <a href="https://www.instagram.com/bvm.fashion?igsh=b2hvdDU4dmU3bml5">

                            <img src="https://res.cloudinary.com/dtl8hxhde/image/upload/v1718229044/CONFERIO/svg/ngv4qzspwmeqtiim0ufw.svg" alt="" height={35} width={35} style={{ padding: 10 }} />
                        </a>
                        <a href="https://youtube.com/@bvmfashion?si=VPd3mCA8n1_ubRwT" >

                            <img src="https://res.cloudinary.com/dtl8hxhde/image/upload/v1718229043/CONFERIO/svg/fbzy2vujjp8wjydzsmvd.svg" alt="" height={25} width={25} />
                        </a>

                        <a href="https://wa.me/message/HEAVZO64MZNRP1">

                            <img src="https://res.cloudinary.com/dtl8hxhde/image/upload/v1718229041/CONFERIO/svg/kmjlefbtzxv9hkmglrge.svg" alt="" height={25} width={25} />
                        </a>
                    </nav>
                </div>

                <hr />
                <div className="secfooter">
                    <p>2024 Conferio.All Rights Reserved.</p>
                    <li>Terms & Conditions</li>
                    <li>Privacy Statement</li>
                    <li>Trademarks</li>
                </div>
            </footer>
        </div>
    )
}
