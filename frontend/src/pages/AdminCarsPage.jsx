import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './AdminPage.css'; // Kita akan buat file CSS ini

const AdminCarsPage = () => {
    const [cars, setCars] = useState([]);
    const [error, setError] = useState('');

    const fetchCars = () => {
        api.get('/cars')
            .then(response => {
                setCars(response.data.data);
            })
            .catch(err => {
                setError('Gagal memuat data mobil.');
                console.error(err);
            });
    };

    useEffect(() => {
        fetchCars();
    }, []);

    const handleDelete = async (carId) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus mobil ini?')) {
            try {
                await api.delete(`/cars/${carId}`);
                alert('Mobil berhasil dihapus!');
                fetchCars(); // Muat ulang daftar mobil setelah dihapus
            } catch (err) {
                alert('Gagal menghapus mobil: ' + (err.response?.data?.message || err.message));
            }
        }
    };

    return (
        <div className="container">
            <div className="admin-header">
                <h1>Manajemen Mobil</h1>
                <Link to="/admin/cars/new" className="btn">Tambah Mobil Baru</Link>
            </div>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Model</th>
                        <th>Plat Nomor</th>
                        <th>Tahun</th>
                        <th>Harga/hari</th>
                        <th>Tersedia</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {cars.map(car => (
                        <tr key={car.id}>
                            <td>{car.id}</td>
                            <td>{car.model}</td>
                            <td>{car.license_plate}</td>
                            <td>{car.year}</td>
                            <td>Rp {Number(car.price).toLocaleString('id-ID')}</td>
                            <td>{car.available ? 'Ya' : 'Tidak'}</td>
                            <td className="actions">
                                <Link to={`/admin/cars/edit/${car.id}`} className="btn-edit">Edit</Link>
                                <button onClick={() => handleDelete(car.id)} className="btn-delete">Hapus</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminCarsPage;