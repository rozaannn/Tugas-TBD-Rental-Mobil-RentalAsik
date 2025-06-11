import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import Modal from '../components/Modal.jsx';
import { FaEdit, FaTrash } from 'react-icons/fa';
import './AdminPage.css';

const AdminCarsPage = () => {
    // --- State Management ---
    const [cars, setCars] = useState([]); // Untuk menyimpan daftar asli dari API
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(''); // Untuk input pencarian
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [carToDelete, setCarToDelete] = useState(null);

    // --- Data Fetching ---
    const fetchCars = () => {
        setLoading(true);
        api.get('/cars')
            .then(response => {
                setCars(response.data.data);
            })
            .catch(err => {
                toast.error('Gagal memuat data mobil.');
                console.error(err);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchCars();
    }, []);

    // --- Event Handlers ---
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
            fetchCars(); // Muat ulang daftar mobil setelah dihapus
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Gagal menghapus mobil.';
            toast.error(errorMessage);
        } finally {
            closeDeleteModal();
        }
    };

    // --- Filtering Logic ---
    const filteredCars = useMemo(() => {
        if (!searchTerm) {
            return cars;
        }
        return cars.filter(car =>
            car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
            car.license_plate.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [cars, searchTerm]);


    // --- Render Logic ---
    if (loading) return <div className="container"><p>Memuat data mobil...</p></div>;

    return (
        <>
            <div className="container">
                <div className="admin-header">
                    <h1>Manajemen Mobil</h1>
                    <Link to="/admin/cars/new" className="btn">Tambah Mobil Baru</Link>
                </div>

                <div className="form-group">
                    <input
                        type="text"
                        placeholder="Cari berdasarkan model atau plat nomor..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ maxWidth: '400px', marginBottom: '1rem' }}
                    />
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th className="col-center">ID</th>
                                <th>Model</th>
                                <th>Plat Nomor</th>
                                <th className="col-center">Tahun</th>
                                <th className="col-right">Harga/hari</th>
                                <th className="col-center">Tersedia</th>
                                <th className="col-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCars.map(car => (
                                <tr key={car.id}>
                                    <td className="col-center">{car.id}</td>
                                    <td>{car.model}</td>
                                    <td>{car.license_plate}</td>
                                    <td className="col-center">{car.year}</td>
                                    <td className="col-right">Rp {Number(car.price).toLocaleString('id-ID')}</td>
                                    <td className="col-center">
                                        <span className={`status-badge ${car.available ? 'available' : 'unavailable'}`}>
                                            {car.available ? 'Ya' : 'Tidak'}
                                        </span>
                                    </td>
                                    <td className="actions col-center">
                                        <Link to={`/admin/cars/edit/${car.id}`} className="btn-edit"><FaEdit /> Edit</Link>
                                        <button onClick={() => openDeleteModal(car)} className="btn-delete"><FaTrash /> Hapus</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={closeDeleteModal} onConfirm={confirmDelete} title="Konfirmasi Penghapusan">
                <p>Apakah Anda yakin ingin menghapus mobil berikut?</p>
                {carToDelete && (
                    <p><strong>{carToDelete.model} ({carToDelete.license_plate})</strong></p>
                )}
            </Modal>
        </>
    );
};

export default AdminCarsPage;