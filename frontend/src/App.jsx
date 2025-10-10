import { Routes, Route, Navigate } from "react-router-dom";
import NavBar from "./components/NavBar.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Profile from "./pages/Profile.jsx";
import RecipeDetail from "./pages/RecipeDetail.jsx"; // NEW
import { useEffect, useState } from "react";
import { api } from "./api.js";
import Bookmarks from "./pages/Bookmarks.jsx";
import AuthorProfile from "./pages/AuthorProfile.jsx";

export default function App() {
    const [token, setToken] = useState(localStorage.getItem("rw_token") || "");
    const [user, setUser] = useState(null);

    useEffect(() => {
        if (!token) return;
        api("/api/auth/me", { token })
            .then(({ user }) => setUser(user))
            .catch(() => {
                setToken("");
                localStorage.removeItem("rw_token");
                setUser(null);
            });
    }, [token]);

    const onLogin = (token, user) => {
        setToken(token);
        localStorage.setItem("rw_token", token);
        setUser(user);
    };

    const onLogout = () => {
        setToken("");
        localStorage.removeItem("rw_token");
        setUser(null);
    };

    return (
        <>
            <NavBar user={user} onLogout={onLogout} />
            <div className="container py-5">
                <Routes>
                    <Route path="/" element={<Home user={user} />} />
                    <Route path="/recipe/:id" element={<RecipeDetail user={user} token={token} />} />
                    <Route path="/bookmarks" element={<Bookmarks user={user} token={token} />} />
                    <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login onAuth={onLogin} />} />
                    <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register onAuth={onLogin} />} />
                    <Route path="/profile" element={user ? <Profile token={token} user={user} /> : <Navigate to="/login" replace />} />
                    <Route path="/author/:username" element={<AuthorProfile token={token} user={user} />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
        </>
    );
}