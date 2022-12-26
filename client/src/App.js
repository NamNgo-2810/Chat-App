import "./App.css";
import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import Chat from "./Chat";
import Login from "./login/Login";
import Register from "./register/Register";
import { useEffect, useState } from "react";

function App() {
    const [loggedIn, setLoggedIn] = useState(false);

    useEffect(() => {
        setLoggedIn(localStorage.getItem("access_token"));
    }, [loggedIn]);

    return (
        <div>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={loggedIn ? <Chat /> : <Login />} />
                    <Route
                        path="/chat"
                        element={loggedIn ? <Chat /> : <Login />}
                    />
                    <Route path="/register" element={<Register />} />
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;
