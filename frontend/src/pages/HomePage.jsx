import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
    return (
        <div className="hero-content-inner">
            <h1 className="hero-h1">Sewa Mobil Impian Anda</h1>
            <p className="hero-p">Koleksi mobil mewah dan sport terbaik di kelasnya.</p>
            <Link to="/cars" className="hero-btn">Lihat Koleksi</Link>
        </div>
    );
};

export default HomePage;