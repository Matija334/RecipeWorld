import { Link, NavLink } from "react-router-dom";

export default function NavBar({ user, onLogout }) {
    return (
        <nav className="navbar navbar-expand-lg bg-white shadow-sm">
            <div className="container">
                <Link to="/" className="navbar-brand brand-title">Recipe World</Link>

                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#nav">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div id="nav" className="collapse navbar-collapse">
                    <ul className="navbar-nav me-auto">
                        <li className="nav-item">
                            <NavLink to="/" className="nav-link">Home</NavLink>
                        </li>
                        {user && (
                            <li className="nav-item">
                                <NavLink to="/profile" className="nav-link">My Profile</NavLink>
                            </li>
                        )}
                        {user && (
                            <li className="nav-item">
                                <NavLink to="/bookmarks" className="nav-link">My Bookmarks</NavLink>
                            </li>
                        )}
                    </ul>

                    <ul className="navbar-nav ms-auto">
                        {user ? (
                            <>
                                <li className="nav-item d-flex align-items-center me-2">
                                    <Link to="/profile" className="text-muted small link-accent" title="Open profile">
                                        Hi, <strong>{user.username}</strong>
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <button className="btn btn-outline-secondary btn-sm" onClick={onLogout}>Logout</button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="nav-item">
                                    <NavLink to="/login" className="nav-link">Login</NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink to="/register" className="nav-link">Register</NavLink>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
}