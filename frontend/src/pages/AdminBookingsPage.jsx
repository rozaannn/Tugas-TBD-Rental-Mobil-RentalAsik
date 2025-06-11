import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './AdminPage.css'; // Kita gunakan kembali CSS admin yang sudah ada

const AdminBookingsPage = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchBookings = () => {
        setLoading(true);
        api.get('/bookings/all')
            .then(response => {
                setBookings(response.data.data);
                setLoading(false);
            })
            .catch(err => {
                setError('Gagal memuat data pemesanan.');
                console.error(err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleStatusChange = async (bookingId, newStatus) => {
        try {
            await api.put(`/bookings/${bookingId}/status`, { status: newStatus });
            alert('Status booking berhasil diperbarui!');
            fetchBookings(); // Muat ulang data setelah update
        } catch (err) {
            alert('Gagal memperbarui status: ' + (err.response?.data?.message || err.message));
        }
    };

    if (loading) return <div className="container"><p>Memuat data pemesanan...</p></div>;
    if (error) return <div className="container"><p style={{ color: 'red' }}>{error}</p></div>;

    return (
        <div className="container">
            <div className="admin-header">
                <h1>Manajemen Booking</h1>
            </div>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Pelanggan</th>
                        <th>Mobil</th>
                        <th>Tanggal Sewa</th>
                        <th>Total</th>
                        <th>Status Saat Ini</th>
                        <th>Ubah Status</th>
                    </tr>
                </thead>
                <tbody>
                    {bookings.map(booking => (
                        <tr key={booking.id}>
                            <td>{booking.id}</td>
                            <td>{booking.user_name} ({booking.user_email})</td>
                            <td>{booking.model} ({booking.year})</td>
                            <td>{new Date(booking.start_date).toLocaleDateString('id-ID')} - {new Date(booking.end_date).toLocaleDateString('id-ID')}</td>
                            <td>Rp {Number(booking.total_amount).toLocaleString('id-ID')}</td>
                            <td><span className={`status status-${booking.status}`}>{booking.status}</span></td>
                            <td>
                                <select 
                                    defaultValue={booking.status} 
                                    onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                                    className="status-select"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminBookingsPage;