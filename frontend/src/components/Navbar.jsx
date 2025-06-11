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
                <Link to="/" className="navbar-logo">RentalAsik</Link>
                <ul className="nav-menu">
                    <li className="nav-item">
                        <Link to="/cars" className="nav-links">Mobil</Link>
                    </li>
                    {user && user.is_admin && (
                        <>
                            <li className="nav-item">
                                <Link to="/admin/dashboard" className="nav-links">Dashboard</Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/admin/cars" className="nav-links">Manajemen Mobil</Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/admin/bookings" className="nav-links">Manajemen Booking</Link> {/* <-- Tambahkan Link Ini */}
                            </li>
                        </>
                    )}
                        
            {user && !user.is_admin && ( // <-- Tambahkan kondisi ini (opsional, agar tidak tumpang tindih)
                <li className="nav-item">
                    <Link to="/my-bookings" className="nav-links">Booking Saya</Link>
                </li>
            )}
                    {user ? (
                        <>
                            <li className="nav-item">
                                <Link to="/my-bookings" className="nav-links">Booking Saya</Link>
                            </li>
                            <li className="nav-item">
                                <span className="nav-links nav-user">Halo, {user.name}!</span>
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