import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

const AdminCarFormPage = () => {
    const { id } = useParams(); // Ambil ID dari URL jika ada (untuk mode edit)
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    const [model, setModel] = useState('');
    const [licensePlate, setLicensePlate] = useState('');
    const [year, setYear] = useState('');
    const [price, setPrice] = useState('');
    const [available, setAvailable] = useState(true);
    const [image, setImage] = useState(null);
    const[existingModels, setExistingModels] = useState([]);
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        api.get('/cars/models')
            .then(response => {
                setExistingModels(response.data.data);
            })
            .catch(err => console.error("Gagal memuat model mobil", err));
    }, []);

    useEffect(() => {
        if (isEditMode) {
            setLoading(true);
            api.get(`/cars/${id}`)
                .then(response => {
                    const car = response.data.data;
                    setModel(car.model);
                    setLicensePlate(car.license_plate);
                    setYear(car.year);
                    setPrice(car.price);
                    setAvailable(car.available);
                    setLoading(false);
                })
                .catch(err => {
                    console.error('Error fetching car data:', err);
                    toast.error('Gagal memuat data mobil.');
                    setLoading(false);
                });
        }
    }, [id, isEditMode]);

    //Fungsiuntuk menangani saat model dipilih dari daftar
    const handleModelChange = (e) => {
        const selectedModelName = e.target.value;
        setModel(selectedModelName);

        //Cari model yang cocok dari daftar yang sudah kita fetch
        const selectedModelData = existingModels.find(m => m.model === selectedModelName);
        
        //Jika ditemukan, isi otomatis field lain
        if (selectedModelData) {
            setYear(selectedModelData.year);
            setPrice(selectedModelData.price);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        //setError('');
        setLoading(true);

        const formData = new FormData();
        formData.append('model', model);
        formData.append('license_plate', licensePlate);
        formData.append('year', year);
        formData.append('price', price);
        formData.append('available', available);
        if (image) {
            formData.append('image', image);
        }

        try {
            if (isEditMode) {
                await api.put(`/cars/${id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Mobil berhasil diperbarui!');
            } else {
                await api.post('/cars', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Mobil berhasil ditambahkan!');
            }
            setTimeout(() => {
                navigate('/admin/cars');
            }, 2000);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Terjadi kesalahan.';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };
    
    if (loading && isEditMode) return <div className="container"><p>Loading data mobil...</p></div>;

    return (
        <div className="form-container">
            <h2>{isEditMode ? 'Edit Mobil' : 'Tambah Mobil Baru'}</h2>
            {/*error && <p style={{ color: 'red' }}>{error}</p>*/}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Model</label>
                    <input type="text" value={model} onChange={handleModelChange} required list="existing-models"/>
                    <datalist id="existing-models">
                        {existingModels.map((m, index) => (
                            <option key={index} value={m.model} />
                        ))}
                    </datalist>
                    <small>Ketik untuk mencari atau pilih model yang sudah ada. Harga dan tahun akan terisi otomatis.</small>
                </div>
                <div className="form-group">
                    <label>Plat Nomor</label>
                    <input type="text" value={licensePlate} onChange={(e) => setLicensePlate(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>Tahun</label>
                    <input type="number" value={year} onChange={(e) => setYear(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>Harga per Hari</label>
                    <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>Status Ketersediaan</label>
                    <select value={available} onChange={(e) => setAvailable(e.target.value === 'true')}>
                        <option value={true}>Tersedia</option>
                        <option value={false}>Tidak Tersedia</option>
                    </select>
                </div>
                 <div className="form-group">
                    <label>Gambar</label>
                    <input type="file" onChange={(e) => setImage(e.target.files[0])} />
                    {isEditMode && <p><small>Kosongkan jika tidak ingin mengganti gambar.</small></p>}
                </div>
                <button type="submit" className="btn" disabled={loading}>
                    {loading ? 'Menyimpan...' : 'Simpan'}
                </button>
            </form>
        </div>
    );
};

export default AdminCarFormPage;