import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './CarsPage.css';

const CarsPage = () => {
    // State 'allCars' sudah dihapus karena tidak digunakan
    const [groupedCars, setGroupedCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get('/cars')
            .then(response => {
                const fetchedCars = response.data.data;
                // Tidak perlu lagi: setAllCars(fetchedCars);

                // --- LOGIKA PENGELOMPOKKAN DIMULAI DI SINI ---
                const carGroups = {};

                // Langsung proses 'fetchedCars' tanpa menyimpannya ke state
                fetchedCars.forEach(car => {
                    const key = `${car.model}-${car.year}`;

                    if (!carGroups[key]) {
                        carGroups[key] = {
                            representativeCar: car,
                            availableCount: car.available ? 1 : 0,
                        };
                    } else {
                        if (car.available) {
                            carGroups[key].availableCount += 1;
                        }
                    }
                });
                
                setGroupedCars(Object.values(carGroups));
                // --- AKHIR LOGIKA PENGELOMPOKKAN ---

                setLoading(false);
            })
            .catch(err => {
                setError('Gagal memuat daftar mobil.');
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="container"><p>Loading...</p></div>;
    if (error) return <div className="container"><p style={{ color: 'red' }}>{error}</p></div>;

    return (
        <div className="container">
            <h1>Daftar Mobil</h1>
            <div className="cars-grid">
                {groupedCars.map(group => (
                    <Link key={group.representativeCar.id} to={`/cars/${group.representativeCar.id}`} className="car-card-link">
                        <div className="car-card">
                            <img
                                src={`http://localhost:5000/uploads/${group.representativeCar.image}`}
                                alt={group.representativeCar.model}
                                className="car-image"
                                onError={(e) => { e.target.onerror = null; e.target.src='https://via.placeholder.com/300x200?text=No+Image'; }}
                            />
                            <div className="car-details">
                                <h3>{group.representativeCar.model} ({group.representativeCar.year})</h3>
                                {group.availableCount > 0 ? (
                                    <p className="car-availability">{group.availableCount} unit tersedia</p>
                                ) : (
                                    <p className="car-availability-unavailable">Semua unit sedang disewa</p>
                                )}
                                <p className="car-price">Mulai dari Rp {Number(group.representativeCar.price).toLocaleString('id-ID')} / hari</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default CarsPage;