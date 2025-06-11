import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import HomePage from './pages/HomePage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import CarsPage from './pages/CarsPage.jsx';
import CarDetailPage from './pages/CarDetailPage.jsx';
import MyBookingsPage from './pages/MyBookingsPage.jsx';
import AdminRoute from './components/AdminRoute.jsx';
import AdminCarsPage from './pages/AdminCarsPage.jsx';
import AdminCarFormPage from './pages/AdminCarFormPage.jsx';
import AdminBookingsPage from './pages/AdminBookingsPage.jsx';
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';

function App() {
  return (
    <>
      <Navbar />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cars" element={<CarsPage />} />
          <Route path="/cars/:id" element={<CarDetailPage />} />
          <Route 
            path="/my-bookings" 
            element={
              <ProtectedRoute>
                <MyBookingsPage />
              </ProtectedRoute>
            } 
          />
           {/* --- Rute Admin --- */}
           <Route path="/admin/dashboard" element={ <AdminRoute> <AdminDashboardPage /> </AdminRoute> } />
           <Route path="/admin/cars" element={ <AdminRoute> <AdminCarsPage /> </AdminRoute> } />
          <Route path="/admin/cars/new" element={ <AdminRoute> <AdminCarFormPage /> </AdminRoute> } />
          <Route path="/admin/cars/edit/:id" element={ <AdminRoute> <AdminCarFormPage /> </AdminRoute> } />
          <Route path="/admin/bookings" element={ <AdminRoute> <AdminBookingsPage /> </AdminRoute> } />
          <Route path="*" element={
            <div className="container">
              <h2>404 - Halaman Tidak Ditemukan</h2>
            </div>
          } />
        </Routes>
      </main>
    </>
  );
}
export default App;