import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api';

const BookingForm = ({ carId }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('bank');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!user) {
            setError('Anda harus login untuk membuat pemesanan.');
            return;
        }

        if (new Date(startDate) > new Date(endDate)) {
            setError('Tanggal selesai tidak boleh sebelum tanggal mulai.');
            return;
        }

        try {
            const bookingData = {
                car_id: carId,
                start_date: startDate,
                end_date: endDate,
                payment_method: paymentMethod,
            };
            await api.post('/bookings', bookingData);
            setSuccess('Booking berhasil dibuat! Anda akan diarahkan ke halaman "Booking Saya".');
            setTimeout(() => navigate('/my-bookings'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal membuat booking.');
        }
    };

    if (!user) {
        return <p style={{ fontWeight: 'bold' }}>Silakan <Link to="/login">login</Link> untuk memesan mobil ini.</p>;
    }

    return (
        <div className="form-container" style={{ margin: '2rem 0', boxShadow: 'none', padding: '0' }}>
            <h3>Buat Pemesanan</h3>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Tanggal Mulai</label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>Tanggal Selesai</label>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>Metode Pembayaran</label>
                    <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                        <option value="bank">Transfer Bank</option>
                        <option value="ewallet">E-Wallet</option>
                        <option value="cash">Tunai</option>
                    </select>
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {success && <p style={{ color: 'green' }}>{success}</p>}
                <button type="submit" className="btn">Pesan Sekarang</button>
            </form>
        </div>
    );
};

export default BookingForm;