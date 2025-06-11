import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                {/* Bagian Kiri: Logo */}
                <Link to="/" className="navbar-logo">
                    RentalAsik
                </Link>

                {/* Bagian Tengah: Menu Utama & Menu Admin/User */}
                <ul className="nav-menu">
                    <li className="nav-item">
                        <Link to="/" className="nav-links">Home</Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/cars" className="nav-links">Cars</Link>
                    </li>
                    
                    {/* Tampilkan menu admin jika user adalah admin */}
                    {user && user.is_admin && (
                        <>
                            <li className="nav-item"><Link to="/admin/dashboard" className="nav-links">Dashboard</Link></li>
                            <li className="nav-item"><Link to="/admin/cars" className="nav-links">Manage Cars</Link></li>
                            <li className="nav-item"><Link to="/admin/bookings" className="nav-links">Manage Bookings</Link></li>
                        </>
                    )}

                    {/* Tampilkan menu user jika user login tapi bukan admin */}
                    {user && !user.is_admin && (
                        <li className="nav-item">
                            <Link to="/my-bookings" className="nav-links">My Bookings</Link>
                        </li>
                    )}
                </ul>

                {/* Bagian Kanan: Info User & Otentikasi */}
                <ul className="nav-menu">
                    {user ? (
                        <>
                            <li className="nav-item">
                                <span className="nav-user">Halo, {user.name}!</span>
                            </li>
                            <li className="nav-item">
                                <button onClick={handleLogout} className="nav-links-button">Logout</button>
                            </li>
                        </>
                    ) : (
                        <>
                            <li className="nav-item">
                                <Link to="/login" className="nav-links">Login</Link>
                            </li>
                             <li className="nav-item">
                                <Link to="/register" className="nav-links">Register</Link>
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;