// src/app/dashboard/layout.jsx
'use client'

import { SucursalProvider } from '@/contexts/SucursalContext'

export default function DashboardLayout({ children }) {
    return (
        <SucursalProvider>
            {children}
        </SucursalProvider>
    )
}