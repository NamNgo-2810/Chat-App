import { login } from "../CommonCall";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";

export default function Login() {
    let navigate = useNavigate();

    const username = useRef();
    const password = useRef();

    const handleClickLogin = async () => {
        const result = await login(
            username.current.value,
            password.current.value
        );
        if (result.data.access_token) {
            localStorage.setItem("access_token", result.data.access_token);
            localStorage.setItem("username", result.data.username);
            localStorage.setItem("user_id", result.data.user_id);
            navigate("/chat");
        } else alert("Wrong credentials");
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
                            // value={username}
                            // onChange={(e) => setUsername(e)}
                        />
                        <input
                            placeholder="Password"
                            type="password"
                            required
                            minLength="6"
                            className="loginInput"
                            // onChange={(e) => setPassword(e)}
                            ref={password}
                        />
                        <button
                            className="loginButton"
                            type="submit"
                            onClick={handleClickLogin}
                        >
                            Login
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
