import React from 'react';
import './AuthLayout.css';

const AuthLayout = ({ children }) => {
    return (
        <div className="auth-layout-container">
            {/* Video background yang sama dengan di Hero */}
            <video src="/hero-video.mp4" autoPlay loop muted playsInline className="auth-video-bg" />
            
            {/* 'children' akan menjadi form login atau register Anda */}
            {children}
        </div>
    );
};

export default AuthLayout;