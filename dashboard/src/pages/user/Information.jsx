import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../component/Sidebar';
import Navbar from '../../component/Navbar';
import InformationCard from '../../component/InformationCard';

const Information = () => {
    const navigate = useNavigate();
    const [sidebarExpanded, setSidebarExpanded] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
    const [mobileOpen, setMobileOpen] = useState(false);

    // Token kontrolünü kaldırdık çünkü PrivateRoute zaten kontrol ediyor

    // Örnek veri (backend'den gelecek)
    const parentData = {
        'Ad Soyad': 'Ahmet Yılmaz',
        'E-posta': 'ahmet@example.com',
        'Telefon': '+90 555 123 4567',
        'Adres': 'Örnek Mahallesi, İstanbul'
    };

    const childData = {
        'Ad Soyad': 'Mehmet Yılmaz',
        'Doğum Tarihi': '12.05.2015',
        'Spor Dalı': 'Yüzme',
        'Lisans No': 'ABC123456'
    };

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 900);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <>
            <Sidebar
                expanded={isMobile ? mobileOpen : sidebarExpanded}
                setExpanded={setSidebarExpanded}
                mobileOpen={mobileOpen}
                onToggle={isMobile ? () => setMobileOpen(false) : undefined}
                role="user"
            />
            <Navbar
                title="Bilgilerim"
                onMenuClick={() => setMobileOpen(true)}
                onMenuClose={() => setMobileOpen(false)}
                mobileOpen={mobileOpen}
            />

            <div
                style={{
                    marginLeft: isMobile ? 0 : (sidebarExpanded ? 260 : 72),
                    marginTop: 64,
                    padding: 24,
                    transition: 'margin-left 0.2s',
                    background: '#f5f5f5',
                    minHeight: 'calc(100vh - 64px)'
                }}
            >
                <div style={{ 
                    maxWidth: 1200, 
                    margin: '0 auto',
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                    gap: 24
                }}>
                    <InformationCard
                        title="Veli Bilgileri"
                        data={parentData}
                        type="parent"
                    />
                    <InformationCard
                        title="Sporcu Bilgileri"
                        data={childData}
                        type="child"
                    />
                </div>
            </div>
        </>
    );
};

export default Information;