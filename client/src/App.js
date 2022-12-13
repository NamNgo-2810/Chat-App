import "./App.css";
import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import Chat from "./Chat";
import Login from "./login/Login";
import Register from "./register/Register";

function App() {
    const loggedIn = localStorage.getItem("access_token");
    return (
        <div>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={loggedIn ? <Chat /> : <Login />} />
                    <Route path="/register" element={<Register />} />
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;
