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

                    {/* --- BLOK KONDISIONAL UTAMA YANG DIPERBAIKI --- */}
                    {user ? (
                        // Jika user SUDAH LOGIN
                        <>
                            {user.is_admin ? (
                                // Tampilan KHUSUS untuk Admin
                                <>
                                    <li className="nav-item"><Link to="/admin/dashboard" className="nav-links">Dashboard</Link></li>
                                    <li className="nav-item"><Link to="/admin/cars" className="nav-links">Manajemen Mobil</Link></li>
                                    <li className="nav-item"><Link to="/admin/bookings" className="nav-links">Manajemen Booking</Link></li>
                                </>
                            ) : (
                                // Tampilan KHUSUS untuk Pengguna Biasa
                                <li className="nav-item">
                                    <Link to="/my-bookings" className="nav-links">Booking Saya</Link>
                                </li>
                            )}

                            {/* Tampilan yang sama untuk SEMUA user yang sudah login */}
                            <li className="nav-item">
                                <span className="nav-links nav-user">Halo, {user.name}!</span>
                            </li>
                            <li className="nav-item">
                                <button onClick={handleLogout} className="nav-links-button">Logout</button>
                            </li>
                        </>
                    ) : (
                        // Jika user BELUM LOGIN
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