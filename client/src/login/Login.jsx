import { useContext, useRef } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";


export default function Login() {

    let navigate = useNavigate()
    const email = useRef();
    const password = useRef();

  const handleClickCreateNewAccount = (e) =>{
    navigate('/register')
  }

  return (
    
    <div className="login">
      <div className="loginWrapper">
        <div className="loginLeft">
          <h3 className="loginLogo">LogoAppChat</h3>
          <span className="loginDesc">
            WELCOME BACK APP CHAT
          </span>
        </div>
        <div className="loginRight">
          <form className="loginBox">
            <input
              placeholder="Email"
              type="email"
              required
              className="loginInput"
              ref={email}
            />
            <input
              placeholder="Password"
              type="password"
              required
              minLength="6"
              className="loginInput"
              ref={password}
            />
            <button className="loginButton" type="submit">Log in</button>
            <button className="loginRegisterButton" onClick={handleClickCreateNewAccount}>Create new account</button>
          </form>
        </div>
      </div>
    </div>
  );
}