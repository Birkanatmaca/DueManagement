import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../component/Sidebar';
import Navbar from '../../component/Navbar';
import CrudTableCard from '../../component/CrudTableCard';
import CustomDropdown from '../../component/CustomDropdown';
import UserDuesCard from '../../component/UserDuesCard';

const Dues = () => {
    const navigate = useNavigate();
    const [sidebarExpanded, setSidebarExpanded] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [selectedYear, setSelectedYear] = useState('2025');

    // Yıl seçenekleri
    const yearOptions = [
        { value: '2023', label: '2023' },
        { value: '2024', label: '2024' },
        { value: '2025', label: '2025' },
        { value: '2026', label: '2026' }
    ];

    // Örnek aidat verileri (API'den gelecek)
    const allDuesData = [
        { mount: 'Ocak', year: '2025', amount: 500, status: 'Ödendi' },
        { mount: 'Şubat', year: '2025', amount: 500, status: 'Ödenmedi' },
        { mount: 'Mart', year: '2025', amount: 500, status: 'Ödendi' },
        { mount: 'Nisan', year: '2025', amount: 500, status: 'Ödenmedi' },
        { mount: 'Mayıs', year: '2025', amount: 500, status: 'Ödendi' },
        { mount: 'Haziran', year: '2025', amount: 500, status: 'Ödenmedi' },
        { mount: 'Temmuz', year: '2025', amount: 500, status: 'Ödendi' },
        { mount: 'Ağustos', year: '2025', amount: 500, status: 'Ödenmedi' },
        { mount: 'Eylül', year: '2025', amount: 500, status: 'Ödendi' },
        { mount: 'Ekim', year: '2025', amount: 500, status: 'Ödenmedi' },
        { mount: 'Kasım', year: '2025', amount: 500, status: 'Ödendi' },
        { mount: 'Aralık', year: '2025', amount: 500, status: 'Ödenmedi' }
    ];

    // Filter data by selected year and format for display
    const formattedData = allDuesData
        .filter(item => item.year === selectedYear)
        .map(item => ({
            month: item.mount,
            amount: `${item.amount}₺`,
            status: item.status
        }));

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
                title="Aidat Ödemeleri"
                onMenuClick={() => setMobileOpen(true)}
                onMenuClose={() => setMobileOpen(false)}
                mobileOpen={mobileOpen}
            />

            <div style={{
                marginLeft: isMobile ? 0 : (sidebarExpanded ? 260 : 72),
                marginTop: 64,
                padding: 24,
                transition: 'margin-left 0.2s',
                background: '#f5f5f5',
                minHeight: 'calc(100vh - 64px)'
            }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <div style={{ 
                        marginBottom: 20, 
                        display: 'flex', 
                        justifyContent: 'center', // değiştirildi
                        width: '100%', // değiştirildi
                    }}>
                        <div style={{ width: '200px' }}> {/* yeni div eklendi */}
                            <CustomDropdown
                                options={yearOptions}
                                value={selectedYear}
                                onChange={setSelectedYear}
                                placeholder="Yıl Seçiniz"
                            />
                        </div>
                    </div>

                    <UserDuesCard
                        title="Aidat Ödemeleri"
                        data={formattedData}
                        year={selectedYear}
                    />
                </div>
            </div>
        </>
    );
};

export default Dues;