import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../component/Sidebar';
import Navbar from '../../component/Navbar';
import InformationCard from '../../component/InformationCard';
import { getUserInfo } from '../../services/userServices';

const Information = () => {
    const navigate = useNavigate();
    const [sidebarExpanded, setSidebarExpanded] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [childData, setChildData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchChildData = async () => {
            try {
                const response = await getUserInfo('child');
                if (!response.data || !response.data.response) {
                    setError('Veri formatı hatalı');
                    return;
                }

                // Format the data for the InformationCard
                const athlete = response.data.response.children[0];
                const formattedData = {
                    'Sporcu No': athlete.athlete_number,
                    'Ad': athlete.name,
                    'Doğum Tarihi': new Date(athlete.birth_date).toLocaleDateString('tr-TR'),
                    'Kayıt Tarihi': new Date(athlete.created_at).toLocaleDateString('tr-TR')
                };

                setChildData(formattedData);
            } catch (err) {
                setError('Sporcu bilgileri yüklenirken bir hata oluştu');
                console.error('Error:', err);
            }
        };

        fetchChildData();
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
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    {error && (
                        <div style={{ color: 'red', marginBottom: '20px' }}>
                            {error}
                        </div>
                    )}

                    {childData && (
                        <InformationCard
                            title="Sporcu Bilgileri"
                            data={childData}
                            type="child"
                        />
                    )}
                </div>
            </div>
        </>
    );
};

export default Information;