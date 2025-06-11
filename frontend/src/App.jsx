import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layout
import HomeAuthLayout from './layouts/HomeAuthLayout.jsx';

// Komponen
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminRoute from './components/AdminRoute.jsx';

// Halaman
import HomePage from './pages/HomePage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import CarsPage from './pages/CarsPage.jsx';
import CarDetailPage from './pages/CarDetailPage.jsx';
import MyBookingsPage from './pages/MyBookingsPage.jsx';
import AdminCarsPage from './pages/AdminCarsPage.jsx';
import AdminCarFormPage from './pages/AdminCarFormPage.jsx';
import AdminBookingsPage from './pages/AdminBookingsPage.jsx';
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';


function App() {
  return (
    <>
      <Navbar />
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />

      <Routes>
        {/* --- RUTE DENGAN BACKGROUND VIDEO KONTINU --- */}
        <Route element={<HomeAuthLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* --- RUTE LAIN DENGAN BACKGROUND STANDAR --- */}
        <Route path="/cars" element={<CarsPage />} />
        <Route path="/cars/:id" element={<CarDetailPage />} />
        <Route path="/my-bookings" element={<ProtectedRoute><MyBookingsPage /></ProtectedRoute>} />
        
        {/* --- RUTE ADMIN --- */}
        <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
        <Route path="/admin/cars" element={<AdminRoute><AdminCarsPage /></AdminRoute>} />
        <Route path="/admin/cars/new" element={<AdminRoute><AdminCarFormPage /></AdminRoute>} />
        <Route path="/admin/cars/edit/:id" element={<AdminRoute><AdminCarFormPage /></AdminRoute>} />
        <Route path="/admin/bookings" element={<AdminRoute><AdminBookingsPage /></AdminRoute>} />

        {/* Rute 404 */}
        <Route path="*" element={<div className="container"><h2>404 - Halaman Tidak Ditemukan</h2></div>} />
      </Routes>
    </>
  );
}

export default App;