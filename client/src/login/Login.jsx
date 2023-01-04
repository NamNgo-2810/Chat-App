import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../CommonCall";
import "./Login.css";

function Login({ setIsLoggedIn }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async () => {
        const result = await login(username, password);
        console.log(result);
        if (result.data.access_token) {
            localStorage.setItem("access_token", result.data.access_token);
            localStorage.setItem("username", result.data.username);
            localStorage.setItem("user_id", result.data.user_id);
            localStorage.setItem("avt_url", result.data.avt_url);
            setIsLoggedIn(true);
        } else alert("wrong credentials");

        return;
    };

    return (
        <>
            <div className="login-form">
                <label>
                    Username:
                    <input
                        type="text"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                    />
                </label>
                <br />
                <label>
                    Password:
                    <input
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                    />
                </label>
                <br />
                <button onClick={handleSubmit}>Log in</button>
                <label>Don't have an account?</label>
                <Link to="/register">
                    <button>Sign up for a new account</button>
                </Link>
            </div>
            <br />
        </>
    );
}

export default Login;
