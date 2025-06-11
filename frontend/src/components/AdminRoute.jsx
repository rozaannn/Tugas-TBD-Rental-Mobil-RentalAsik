import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="container"><p>Loading...</p></div>;
    }

    // Arahkan ke halaman login jika tidak ada user,
    // atau ke halaman utama jika user bukan admin.
    if (!user || !user.is_admin) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default AdminRoute;