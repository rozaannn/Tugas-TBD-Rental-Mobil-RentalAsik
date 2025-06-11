import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify'; 
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
            toast.success('Status booking berhasil diperbarui!');
            fetchBookings(); // Muat ulang data setelah update
        } catch (err) {
            toast.error('Gagal memperbarui status: ' + (err.response?.data?.message || err.message));
        }
    };

    if (loading) return <div className="container"><p>Memuat data pemesanan...</p></div>;
    if (error) return <div className="container"><p style={{ color: 'red' }}>{error}</p></div>;

    return (
        <div className="container">
            <div className="admin-header">
                <h1>Manajemen Booking</h1>
            </div>
            <div style={{ overflowX: 'auto' }}>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th className="col-center">ID</th>
                            <th>Pelanggan</th>
                            <th>Mobil</th>
                            <th>Plat Nomor</th>
                            <th className="col-center">Tanggal Sewa</th>
                            <th className="col-right">Total</th>
                            <th className="col-center">Status Saat Ini</th>
                            <th className="col-center">Ubah Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map(booking => (
                            <tr key={booking.id}>
                                <td className="col-center">{booking.id}</td>
                                <td>{booking.user_name} <br/> <small>({booking.user_email})</small></td>
                                <td>{booking.model} ({booking.year})</td>
                                <td>{booking.license_plate}</td>
                                <td className="col-center">{new Date(booking.start_date).toLocaleDateString('id-ID')} - {new Date(booking.end_date).toLocaleDateString('id-ID')}</td>
                                <td className="col-right">Rp {Number(booking.total_amount).toLocaleString('id-ID')}</td>
                                <td className="col-center">
                                    <span className={`status status-${booking.status}`}>{booking.status}</span>
                                </td>
                                <td className="col-center">
                                    <select 
                                        value={booking.status} 
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
        </div>
    );
    
};

export default AdminBookingsPage;