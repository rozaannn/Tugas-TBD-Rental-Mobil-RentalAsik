import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import BookingForm from '../components/BookingForm.jsx';

const CarDetailPage = () => {
    const { id } = useParams();
    const [car, setCar] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get(`/cars/${id}`)
            .then(response => {
                setCar(response.data.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError('Gagal memuat detail mobil.');
                setLoading(false);
            });
    }, [id]);

    if (loading) return <div className="container"><p>Loading...</p></div>;
    if (error) return <div className="container"><p style={{ color: 'red' }}>{error}</p></div>;
    if (!car) return <div className="container"><p>Mobil tidak ditemukan.</p></div>;

    return (
        <div className="container">
            <img
                src={`http://localhost:5000/uploads/${car.image}`}
                alt={car.model}
                style={{ width: '100%', maxWidth: '600px', borderRadius: '8px' }}
                onError={(e) => { e.target.onerror = null; e.target.src='https://via.placeholder.com/600x400?text=No+Image'; }}
            />
            <h1>{car.model} ({car.year})</h1>
            <h2>Rp {Number(car.price).toLocaleString('id-ID')} / hari</h2>

            {car.available ? (
                <BookingForm carId={car.id} />
            ) : (
                <p style={{ fontWeight: 'bold', color: 'red', fontSize: '1.2rem' }}>Mobil ini sedang tidak tersedia untuk dipesan.</p>
            )}
        </div>
    );
};

export default CarDetailPage;