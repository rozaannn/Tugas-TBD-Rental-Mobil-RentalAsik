import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify'; 
import { Link } from 'react-router-dom';
import api from '../services/api';
import Modal from '../components/Modal.jsx';
import './AdminPage.css'; // Kita akan buat file CSS ini

const AdminCarsPage = () => {
    const [cars, setCars] = useState([]);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [carToDelete, setCarToDelete] = useState(null);

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

    const openDeleteModal = (car) => {
        setCarToDelete(car);
        setIsModalOpen(true);
    };

     const closeDeleteModal = () => {
        setIsModalOpen(false);
        setCarToDelete(null);
    };

    const confirmDelete = async () => {
        if (!carToDelete) return;

        try {
            await api.delete(`/cars/${carToDelete.id}`);
            toast.success(`Mobil "${carToDelete.model}" berhasil dihapus!`);
            fetchCars(); // Muat ulang daftar mobil
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Gagal menghapus mobil.';
            toast.error(errorMessage);
        } finally {
            closeDeleteModal(); // Tutup modal setelah selesai
        }
    };

    return (
        <>
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
                                <button onClick={() => openDeleteModal(car)} className="btn-delete">Hapus</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
                    <Modal
                    isOpen={isModalOpen}
                    onClose={closeDeleteModal}
                    onConfirm={confirmDelete}
                    title="Konfirmasi Penghapusan"
                >
                    <p>Apakah Anda yakin ingin menghapus mobil berikut?</p>
                    {carToDelete && (
                        <p><strong>{carToDelete.model} ({carToDelete.license_plate})</strong></p>
                    )}
                </Modal>
            </>
    
    );
};

export default AdminCarsPage;