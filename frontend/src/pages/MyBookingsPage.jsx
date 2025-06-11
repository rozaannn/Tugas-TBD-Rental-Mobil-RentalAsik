import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './MyBookingsPage.css';

const MyBookingsPage = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get('/bookings/my-bookings')
            .then(response => {
                setBookings(response.data.data);
                setLoading(false);
            })
            .catch(err => {
                setError('Gagal memuat daftar booking.');
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="container"><p>Loading...</p></div>;
    if (error) return <div className="container"><p style={{ color: 'red' }}>{error}</p></div>;

    return (
        <div className="container">
            <h1>Riwayat Pemesanan Saya</h1>
            {bookings.length === 0 ? (
                <p>Anda belum memiliki pemesanan.</p>
            ) : (
                <div className="bookings-list">
                    {bookings.map(booking => (
                        <div key={booking.id} className="booking-card">
                            <img 
                                src={`http://localhost:5000/uploads/${booking.image}`}
                                alt={booking.model}
                                className="booking-car-image"
                                onError={(e) => { e.target.onerror = null; e.target.src='https://via.placeholder.com/150x100?text=No+Image'; }}
                            />
                            <div className="booking-details">
                                <h3>{booking.model} ({booking.year})</h3>
                                <p><strong>Tanggal:</strong> {new Date(booking.start_date).toLocaleDateString('id-ID')} - {new Date(booking.end_date).toLocaleDateString('id-ID')}</p>
                                <p><strong>Total Biaya:</strong> Rp {Number(booking.total_amount).toLocaleString('id-ID')}</p>
                                <p><strong>Status:</strong> <span className={`status status-${booking.status}`}>{booking.status}</span></p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyBookingsPage;