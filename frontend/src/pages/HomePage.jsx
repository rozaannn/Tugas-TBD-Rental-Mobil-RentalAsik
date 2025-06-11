import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
    return (
        <div className="container" style={{textAlign: 'center'}}>
            <h1>Selamat Datang di RentalAsik</h1>
            <p>Penyedia layanan rental mobil terbaik, terpercaya, dan terkeren.</p>
            <Link to="/cars" className="btn" style={{marginTop: '2rem', maxWidth: '200px'}}>Lihat Mobil</Link>
        </div>
    );
};

export default HomePage;