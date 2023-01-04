import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../CommonCall";
import "./Login.css";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    const handleSubmit = async () => {
        const result = await login(username, password);
        if (result.data.access_token) {
            localStorage.setItem("access_token", result.data.access_token);
            localStorage.setItem("username", result.data.username);
            localStorage.setItem("user_id", result.data.user_id);
            localStorage.setItem("avt_url", result.data.avt_url);
            navigate("/chat");
        } else alert("wrong credentials");
    };

    return (
        <>
            <form className="login-form" onSubmit={handleSubmit}>
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
                <button type="submit">Log in</button>
                <label>Don't have an account?</label>
                <Link to="/register">
                    <button>Sign up for a new account</button>
                </Link>
            </form>
            <br />
        </>
    );
}

export default Login;
