// src/app/dashboard/ajustes-usuario/page.jsx
'use client';

import Header from './components/Header';
import CambiarPassword from './components/CambiarPassword';

export default function AjustesUsuario() {
    return (
        <div className="min-h-screen bg-gray-50 p-3">
            <Header />
            <div className="max-w-2xl mx-auto mt-6">
                <CambiarPassword />
            </div>
        </div>
    );
}