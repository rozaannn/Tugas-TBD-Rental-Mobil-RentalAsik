import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './Dashboard.css'; // Kita akan buat file CSS ini

const AdminDashboardPage = () => {
    const [summary, setSummary] = useState(null);
    const [popularCars, setPopularCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Ambil data dari kedua endpoint VIEW secara bersamaan
                const [summaryRes, popularCarsRes] = await Promise.all([
                    api.get('/bookings/summary/active'),
                    api.get('/cars/popular')
                ]);

                setSummary(summaryRes.data.data);
                setPopularCars(popularCarsRes.data.data);
            } catch (err) {
                setError('Gagal memuat data dashboard.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) return <div className="container"><p>Memuat data dashboard...</p></div>;
    if (error) return <div className="container"><p style={{ color: 'red' }}>{error}</p></div>;

    return (
        <div className="container">
            <h1>Admin Dashboard</h1>
            <div className="dashboard-grid">
                <div className="dashboard-card">
                    <h2>Pemesanan Aktif & Mendatang</h2>
                    <p className="dashboard-metric">{summary ? summary.length : 0}</p>
                </div>
                <div className="dashboard-card">
                    <h2>Mobil Terpopuler</h2>
                    {popularCars.length > 0 ? (
                        <p className="dashboard-metric">{popularCars[0].car_model}</p>
                    ) : (
                        <p>Belum ada data</p>
                    )}
                </div>
            </div>

            <div className="dashboard-section">
                <h2>Ringkasan Pemesanan Aktif</h2>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID Booking</th>
                            <th>Pelanggan</th>
                            <th>Mobil</th>
                            <th>Tanggal Mulai</th>
                            <th>Tanggal Selesai</th>
                        </tr>
                    </thead>
                    <tbody>
                        {summary && summary.map(booking => (
                            <tr key={booking.booking_id}>
                                <td>{booking.booking_id}</td>
                                <td>{booking.customer_name}</td>
                                <td>{booking.car_model}</td>
                                <td>{new Date(booking.start_date).toLocaleDateString('id-ID')}</td>
                                <td>{new Date(booking.end_date).toLocaleDateString('id-ID')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

             <div className="dashboard-section">
                <h2>Peringkat Mobil Terpopuler</h2>
                 <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Peringkat</th>
                            <th>Model Mobil</th>
                            <th>Total Pemesanan</th>
                        </tr>
                    </thead>
                    <tbody>
                        {popularCars.map((car, index) => (
                            <tr key={car.car_id}>
                                <td>{index + 1}</td>
                                <td>{car.car_model} ({car.car_year})</td>
                                <td>{car.total_bookings} kali</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminDashboardPage;