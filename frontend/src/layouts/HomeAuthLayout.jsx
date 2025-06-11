import React from 'react';
import { Outlet } from 'react-router-dom'; // 1. Impor Outlet
import './HomeAuthLayout.css';

const HomeAuthLayout = () => {
    return (
        <div className="home-auth-layout">
            <video src="/hero-video.mp4" autoPlay loop muted playsInline className="video-bg" />
            <div className="overlay"></div>

            {/* 2. Outlet adalah tempat konten (HomePage, LoginPage, dll.) akan ditampilkan */}
            <main className="content-container">
                <Outlet />
            </main>
        </div>
    );
};

export default HomeAuthLayout;