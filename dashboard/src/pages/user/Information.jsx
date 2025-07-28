import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../component/Sidebar';
import Navbar from '../../component/Navbar';
import InformationCard from '../../component/InformationCard';
import { getUserInfo, getParentInformation, matchChildToParent } from '../../services/userServices';

const Information = () => {
    const navigate = useNavigate();
    const [sidebarExpanded, setSidebarExpanded] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [childData, setChildData] = useState(null);
    const [parentData, setParentData] = useState(null);
    const [error, setError] = useState(null);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [athleteNumber, setAthleteNumber] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [addError, setAddError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch parent info with new API
                const parentRes = await getParentInformation();
                if (parentRes.data && parentRes.data.response && parentRes.data.response.parent) {
                    const parent = parentRes.data.response.parent;
                    const formattedParent = {
                        'Ad': parent.name,
                        'Soyad': parent.last_name,
                        'E-posta': parent.email,
                        'Telefon': parent.phone
                    };
                    setParentData(formattedParent);
                }
                // Fetch child info
                const childRes = await getUserInfo('child');
                if (!childRes.data || !childRes.data.response || !childRes.data.response.children || childRes.data.response.children.length === 0) {
                    setChildData(null);
                    return;
                }
                const athlete = childRes.data.response.children[0];
                const formattedChild = {
                    'Sporcu No': athlete.athlete_number,
                    'Ad': athlete.name,
                    'Doğum Tarihi': new Date(athlete.birth_date).toLocaleDateString('tr-TR'),
                    'Kayıt Tarihi': new Date(athlete.created_at).toLocaleDateString('tr-TR')
                };
                setChildData(formattedChild);
            } catch (err) {
                setError('Bilgiler yüklenirken bir hata oluştu');
                console.error('Error:', err);
            }
        };
        fetchData();
    }, []);

    const handleAddChild = async (e) => {
        e.preventDefault();
        setAddError('');
        if (!athleteNumber || !birthDate) {
            setAddError('Tüm alanları doldurun.');
            return;
        }
        // Format birthDate as ISO string for backend
        const formattedBirthDate = new Date(birthDate).toISOString();
        // Call API to match child to parent
        const response = await matchChildToParent(athleteNumber, formattedBirthDate);
        if (response.data && response.data.status === 'OK') {
            // Eşleşme başarılıysa çocuk bilgisini tekrar çek
            const childRes = await getUserInfo('child');
            if (childRes.data && childRes.data.response && childRes.data.response.children && childRes.data.response.children.length > 0) {
                const athlete = childRes.data.response.children[0];
                setChildData({
                    'Sporcu No': athlete.athlete_number,
                    'Ad': athlete.name,
                    'Doğum Tarihi': new Date(athlete.birth_date).toLocaleDateString('tr-TR'),
                    'Kayıt Tarihi': new Date(athlete.created_at).toLocaleDateString('tr-TR')
                });
            }
            setAddModalOpen(false);
            setAthleteNumber('');
            setBirthDate('');
        } else {
            setAddError(response.message || 'Çocuk bulunamadı veya eşleşme başarısız.');
        }
    };

    // Get username and role from localStorage for Navbar
    const storedRole = localStorage.getItem('role');
    const storedUsername = localStorage.getItem('username');

    return (
        <>
            <Sidebar
                expanded={isMobile ? mobileOpen : sidebarExpanded}
                setExpanded={setSidebarExpanded}
                mobileOpen={mobileOpen}
                onToggle={() => setMobileOpen(false)}
                role="user"
            />
            <Navbar
                title="Bilgilerim"
                onMenuClick={() => setMobileOpen(true)}
                onMenuClose={() => setMobileOpen(false)}
                mobileOpen={mobileOpen}
                username={storedRole === 'admin' ? 'admin' : (storedUsername || (parentData ? parentData['Ad'] : ''))}
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
                    {parentData && (
                        <InformationCard
                            title="Bilgilerim"
                            data={parentData}
                            type="parent"
                        />
                    )}
                    {childData ? (
                        <InformationCard
                            title="Sporcu Bilgileri"
                            data={childData}
                            type="child"
                        />
                    ) : (
                        <div style={{ textAlign: 'center', marginTop: 32 }}>
                            <button
                                style={{
                                    padding: '12px 32px',
                                    borderRadius: 8,
                                    background: '#2196f3',
                                    color: '#fff',
                                    fontWeight: 600,
                                    fontSize: 18,
                                    border: 'none',
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 8px rgba(26,35,126,0.08)',
                                    transition: 'background 0.18s',
                                }}
                                onClick={() => setAddModalOpen(true)}
                            >
                                Çocuk eklemek için tıklayın
                            </button>
                        </div>
                    )}
                </div>
            </div>
            {addModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    background: 'rgba(0,0,0,0.18)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2000
                }}>
                    <form
                        onSubmit={handleAddChild}
                        style={{
                            background: '#fff',
                            borderRadius: 16,
                            boxShadow: '0 8px 40px rgba(26,35,126,0.18)',
                            padding: '2.2rem 2rem 2rem 2rem',
                            minWidth: 320,
                            maxWidth: '95vw',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 18,
                            alignItems: 'center',
                            position: 'relative'
                        }}
                    >
                        <h2 style={{ color: '#1a237e', marginBottom: 12 }}>Çocuk Ekle</h2>
                        <label style={{ width: '100%', textAlign: 'left', marginBottom: 4 }}>Sporcu Numarası</label>
                        <input
                            type="text"
                            value={athleteNumber}
                            onChange={e => setAthleteNumber(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: 8,
                                border: '1.5px solid #cfd8dc',
                                fontSize: 16,
                                marginBottom: 12
                            }}
                        />
                        <label style={{ width: '100%', textAlign: 'left', marginBottom: 4 }}>Doğum Tarihi</label>
                        <input
                            type="date"
                            value={birthDate}
                            onChange={e => setBirthDate(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: 8,
                                border: '1.5px solid #cfd8dc',
                                fontSize: 16,
                                marginBottom: 12
                            }}
                        />
                        {addError && <div style={{ color: 'red', marginBottom: 8 }}>{addError}</div>}
                        <button
                            type="submit"
                            style={{
                                padding: '10px 28px',
                                borderRadius: 8,
                                background: '#43a047',
                                color: '#fff',
                                fontWeight: 600,
                                fontSize: 17,
                                border: 'none',
                                cursor: 'pointer',
                                marginTop: 8
                            }}
                        >
                            Ekle
                        </button>
                        <button
                            type="button"
                            onClick={() => setAddModalOpen(false)}
                            style={{
                                position: 'absolute',
                                top: 12,
                                right: 16,
                                background: 'none',
                                border: 'none',
                                fontSize: 22,
                                color: '#888',
                                cursor: 'pointer'
                            }}
                            aria-label="Kapat"
                        >
                            ×
                        </button>
                    </form>
                </div>
            )}
        </>
    );
};

export default Information;