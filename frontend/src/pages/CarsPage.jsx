import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './CarsPage.css';

const CarsPage = () => {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get('/cars')
            .then(response => {
                setCars(response.data.data);
                setLoading(false);
            })
            .catch(err => {
                setError('Gagal memuat daftar mobil.');
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="container"><p>Loading...</p></div>;
    if (error) return <div className="container"><p style={{ color: 'red' }}>{error}</p></div>;

    return (
        <div className="container">
            <h1>Daftar Mobil</h1>
            <div className="cars-grid">
                {cars.map(car => (
                    <Link key={car.id} to={`/cars/${car.id}`} className="car-card-link">
                        <div className="car-card">
                            <img
                                src={`http://localhost:5000/uploads/${car.image}`}
                                alt={car.model}
                                className="car-image"
                                onError={(e) => { e.target.onerror = null; e.target.src='https://via.placeholder.com/300x200?text=No+Image'; }}
                            />
                            <div className="car-details">
                                <h3>{car.model} ({car.year})</h3>
                                <p className="car-price">Rp {Number(car.price).toLocaleString('id-ID')} / hari</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default CarsPage;