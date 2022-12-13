import axios from "axios";
import { useRef } from "react";
import "./Register.css";
import { useNavigate } from "react-router-dom";

export default function Register() {

  let navigate = useNavigate()

  const username = useRef();
  const email = useRef();
  const password = useRef();
  const passwordAgain = useRef();

  const handleClickLogin = async (e) => {
    navigate('/login')
  };

  return (
    <div className="register">
      <div className="registerWrapper">
        <div className="registerLeft">
          <h3 className="registerLogo">LogoAppChat</h3>
          <span className="registerDesc">
            WELCOME TO LogoAppChat.
          </span>
        </div>
        <div className="registerRight">
          <form className="registerBox">
            <input
              placeholder="Username"
              required
              ref={username}
              className="registerInput"
            />
            <input
              placeholder="Email"
              required
              ref={email}
              className="registerInput"
              type="email"
            />
            <input
              placeholder="Password"
              required
              ref={password}
              className="registerInput"
              type="password"
              minLength="6"
            />
            <input
              placeholder="Password Again"
              required
              ref={passwordAgain}
              className="registerInput"
              type="password"
            />
            <button className="registerButton" type="submit">
              Sign Up
            </button>
            <button className="registerLoginButton" onClick={handleClickLogin}>Log into Account</button>
          </form>
        </div>
      </div>
    </div>
  );
}