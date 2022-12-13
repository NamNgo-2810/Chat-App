import axios from "axios";
import { useRef } from "react";
import "./Register.css";
import { useNavigate } from "react-router-dom";
import { register } from "../CommonCall";

export default function Register() {
    let navigate = useNavigate();

    const username = useRef();
    const password = useRef();
    const passwordAgain = useRef();

    const handleClickRegister = async () => {
        if (password.current !== passwordAgain.current) {
            return;
        }
        const result = await register(username.current, password.current);
    };

    const handleClickLogin = async () => {
        navigate("/");
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
                        <button
                            className="registerLoginButton"
                            onClick={handleClickLogin}
                        >
                            Log into Account
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
