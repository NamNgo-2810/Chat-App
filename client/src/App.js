import { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Chat from "./Chat";
import Login from "./login/Login";
import Register from "./register/Register";

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(
        localStorage.getItem("access_token") != null
    );
    return (
        <Router>
            <Routes>
                {/* <Route
                    path="/login"
                    element={<Login setIsLoggedIn={setIsLoggedIn} />}
                /> */}
                <Route path="/register" element={<Register />} />
                <Route
                    path="/"
                    element={
                        isLoggedIn ? (
                            <Chat setIsLoggedIn={setIsLoggedIn} />
                        ) : (
                            <Login setIsLoggedIn={setIsLoggedIn} />
                        )
                    }
                />
                {/* <Route
                    path="/chat"
                    element={isLoggedIn ? <Chat /> : <Login />}
                /> */}
            </Routes>
        </Router>
    );
};

export default App;
