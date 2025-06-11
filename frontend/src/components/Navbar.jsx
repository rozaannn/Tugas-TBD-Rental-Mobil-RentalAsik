import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setSidebarOpen(false);

    const handleLogout = () => {
        closeSidebar();
        logout();
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                {/* 1. LOGO DI SINI */}
                <Link to="/" className="navbar-logo" onClick={closeSidebar}>
                    RentalAsik
                </Link>

                {/* Ikon Hamburger untuk mobile (tidak berubah) */}
                <div className="menu-icon" onClick={toggleSidebar}>
                    <div className={isSidebarOpen ? 'bar open' : 'bar'}></div>
                    <div className={isSidebarOpen ? 'bar open' : 'bar'}></div>
                    <div className={isSidebarOpen ? 'bar open' : 'bar'}></div>
                </div>

                {/* 2. MENU UTAMA DAN OTENTIKASI DIKELOMPOKKAN */}
                <div className={isSidebarOpen ? 'nav-wrapper active' : 'nav-wrapper'}>
                    <ul className="nav-menu">
                        <li className="nav-item"><Link to="/" className="nav-links" onClick={closeSidebar}>Home</Link></li>
                        <li className="nav-item"><Link to="/cars" className="nav-links" onClick={closeSidebar}>Cars</Link></li>
                        
                        {user && user.is_admin && (
                           <>
                                <li className="nav-item"><Link to="/admin/dashboard" className="nav-links" onClick={closeSidebar}>Dashboard</Link></li>
                                <li className="nav-item"><Link to="/admin/cars" className="nav-links" onClick={closeSidebar}>Manage Cars</Link></li>
                                <li className="nav-item"><Link to="/admin/bookings" className="nav-links" onClick={closeSidebar}>Manage Bookings</Link></li>
                           </>
                        )}
                        {user && !user.is_admin && (
                            <li className="nav-item"><Link to="/my-bookings" className="nav-links" onClick={closeSidebar}>My Bookings</Link></li>
                        )}
                    </ul>

                    <ul className="nav-menu nav-auth">
                        {user ? (
                            <>
                                <li className="nav-item"><span className="nav-user">Halo, {user.name}!</span></li>
                                <li className="nav-item"><button onClick={handleLogout} className="nav-links-button">Logout</button></li>
                            </>
                        ) : (
                            <>
                                <li className="nav-item"><Link to="/login" className="nav-links" onClick={closeSidebar}>Login</Link></li>
                                <li className="nav-item"><Link to="/register" className="nav-links" onClick={closeSidebar}>Register</Link></li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;