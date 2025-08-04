import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../component/Sidebar';
import Navbar from '../../component/Navbar';
import CrudTableCard from '../../component/CrudTableCard';
import CustomDropdown from '../../component/CustomDropdown';
import UserDuesCard from '../../component/UserDuesCard';
import { getParentInformation, getUserDues } from '../../services/userServices';

const Dues = () => {
    const navigate = useNavigate();
    const [sidebarExpanded, setSidebarExpanded] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [selectedYear, setSelectedYear] = useState('2025');
    const [parentName, setParentName] = useState(localStorage.getItem('name') || '');
    const [duesData, setDuesData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchParent = async () => {
            const res = await getParentInformation();
            if (res.data && res.data.response && res.data.response.parent && res.data.response.parent.name) {
                setParentName(res.data.response.parent.name);
                localStorage.setItem('name', res.data.response.parent.name);
            }
        };
        fetchParent();
    }, []);

    // API'den aidat verilerini çek
    useEffect(() => {
        const fetchDues = async () => {
            setLoading(true);
            try {
                const res = await getUserDues();
                if (res.data && res.data.response && Array.isArray(res.data.response.dues)) {
                    setDuesData(res.data.response.dues);
                } else {
                    setDuesData([]);
                }
            } catch (error) {
                console.error('Aidat verileri çekilemedi:', error);
                setDuesData([]);
            } finally {
                setLoading(false);
            }
        };
        fetchDues();
    }, []);

    // Yıl seçenekleri - sadece 2025
    const yearOptions = [
        { value: '2025', label: '2025' }
    ];

    // API'den gelen verileri formatla ve ay sırasına göre sırala
    const formattedData = duesData
        .filter(item => item.year === Number(selectedYear) && item.month >= 1 && item.month <= 12)
        .sort((a, b) => a.month - b.month) // Ay sırasına göre sırala
        .map(item => {
            // Ay numarasını ay adına çevir
            const monthNames = [
                'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
                'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
            ];
            const monthName = monthNames[item.month - 1] || '';
            
            return {
                month: monthName,
                amount: `${item.amount || 0}₺`,
                status: item.is_paid ? 'Ödendi' : 'Ödenmedi'
            };
        });

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
                username={parentName}
            />

            <div style={{
                marginLeft: isMobile ? 0 : (sidebarExpanded ? 240 : 80),
                marginTop: 64,
                padding: 24,
                transition: 'margin-left 0.2s',
                backgroundColor: '#0f172a',
                minHeight: '100vh',
            }}>
                <div style={{ 
                    maxWidth: 1200, 
                    margin: '0 auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px'
                }}>
                    <div style={{ 
                        marginBottom: 20, 
                        display: 'flex', 
                        justifyContent: 'center',
                        width: '100%',
                    }}>
                        <div style={{ 
                            width: '200px',
                            background: '#1e293b',
                            borderRadius: '12px',
                            border: '1px solid #475569'
                        }}>
                            <CustomDropdown
                                options={yearOptions}
                                value={selectedYear}
                                onChange={setSelectedYear}
                                placeholder="Yıl Seçiniz"
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#e2e8f0',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    width: '100%',
                                    padding: '12px 16px'
                                }}
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div style={{ 
                            textAlign: 'center', 
                            padding: '50px',
                            color: '#94a3b8',
                            fontSize: '16px'
                        }}>
                            <div>Yükleniyor...</div>
                        </div>
                    ) : (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            padding: isMobile ? '0' : '0 10%'
                        }}>
                            <div style={{
                                width: '100%',
                                maxWidth: isMobile ? '100%' : '900px'
                            }}>
                                <UserDuesCard
                                    title="Aidat Ödemeleri"
                                    data={formattedData}
                                    year={selectedYear}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Dues;