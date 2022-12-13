import { useContext, useRef } from "react";
import { login } from "../CommonCall";
import "./Login.css";
import { useNavigate } from "react-router-dom";

export default function Login() {
    let navigate = useNavigate();
    const username = useRef();
    const password = useRef();

    const handleClickLogin = async () => {
        const result = await login(username.current, password.current);
        if (result.access_token) {
            localStorage.setItem("access_token", result.access_token);
            navigate("/chat");
        }
    };

    const handleClickCreateNewAccount = (e) => {
        navigate("/register");
    };

    return (
        <div className="login">
            <div className="loginWrapper">
                <div className="loginLeft">
                    <h3 className="loginLogo">LogoAppChat</h3>
                    <span className="loginDesc">WELCOME BACK APP CHAT</span>
                </div>
                <div className="loginRight">
                    <form className="loginBox">
                        <input
                            placeholder="Username"
                            required
                            className="loginInput"
                            ref={username}
                        />
                        <input
                            placeholder="Password"
                            type="password"
                            required
                            minLength="6"
                            className="loginInput"
                            ref={password}
                        />
                        <button
                            className="loginButton"
                            type="submit"
                            onClick={handleClickLogin}
                        >
                            Log in
                        </button>
                        <button
                            className="loginRegisterButton"
                            onClick={handleClickCreateNewAccount}
                        >
                            Create new account
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
