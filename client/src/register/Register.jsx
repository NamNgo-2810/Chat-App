import { useState } from "react";
import "../login/Login.css";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../CommonCall";

export default function Register() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [passwordAgain, setPasswordAgain] = useState("");

    const navigate = useNavigate();

    const handleSubmit = async () => {
        // console.log(username.current.value, password.current.value);
        if (password !== passwordAgain) {
            alert("Password doesn't match!");
            return;
        }
        const result = await register(username, password);
        if (result.status == 200) {
            alert("Register success");
            navigate("/");
        }
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
                <label>
                    Confirm Password:
                    <input
                        type="password"
                        value={passwordAgain}
                        onChange={(event) =>
                            setPasswordAgain(event.target.value)
                        }
                    />
                </label>
                <br />
                <button onClick={handleSubmit}>Sign Up</button>
                <label>Already have an account?</label>
                <Link to="/login">
                    <button>Go to login</button>
                </Link>
            </div>
            <br />
        </>
    );
}
