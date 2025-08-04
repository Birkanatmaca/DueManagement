import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../component/Sidebar';
import Navbar from '../../component/Navbar';
import InformationCard from '../../component/InformationCard';
import { getUserInfo, getParentInformation, matchChildToParent } from '../../services/userServices';

const Information = () => {
    const navigate = useNavigate();
    const [sidebarExpanded, setSidebarExpanded] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
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
                    marginLeft: isMobile ? 0 : (sidebarExpanded ? 240 : 80),
                    marginTop: 64,
                    padding: isMobile ? '16px' : '24px',
                    transition: 'margin-left 0.2s',
                    backgroundColor: '#0f172a',
                    minHeight: '100vh',
                }}
            >
                <div style={{ 
                    maxWidth: 800, 
                    margin: '0 auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px'
                }}>
                    {error && (
                        <div style={{ 
                            color: '#ef4444', 
                            marginBottom: '20px',
                            padding: '12px 16px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            borderRadius: '8px',
                            fontSize: '14px'
                        }}>
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
                        <div style={{ 
                            textAlign: 'center', 
                            marginTop: 32,
                            padding: '40px 20px',
                            background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                            borderRadius: '16px',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                        }}>
                            <div style={{
                                fontSize: '16px',
                                color: '#94a3b8',
                                marginBottom: '24px'
                            }}>
                                Henüz çocuk bilgisi eklenmemiş
                            </div>
                            <button
                                style={{
                                    padding: '12px 32px',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                    color: '#fff',
                                    fontWeight: 600,
                                    fontSize: 16,
                                    border: 'none',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                                    transition: 'all 0.3s ease',
                                }}
                                onMouseEnter={e => {
                                    e.target.style.background = 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)';
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.4)';
                                }}
                                onMouseLeave={e => {
                                    e.target.style.background = 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)';
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                                }}
                                onClick={() => setAddModalOpen(true)}
                            >
                                Çocuk Ekle
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
                    background: 'rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2000
                }}>
                    <form
                        onSubmit={handleAddChild}
                        style={{
                            background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                            borderRadius: 16,
                            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            padding: '2.2rem 2rem 2rem 2rem',
                            minWidth: 320,
                            maxWidth: '400px',
                            width: '90vw',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 18,
                            alignItems: 'center',
                            position: 'relative'
                        }}
                    >
                        <h2 style={{ 
                            color: '#ffffff', 
                            marginBottom: 12,
                            fontSize: '20px',
                            fontWeight: '700'
                        }}>
                            Çocuk Ekle
                        </h2>
                        <label style={{ 
                            width: '100%', 
                            textAlign: 'left', 
                            marginBottom: 4,
                            color: '#e2e8f0',
                            fontSize: '14px',
                            fontWeight: '600'
                        }}>
                            Sporcu Numarası
                        </label>
                        <input
                            type="text"
                            value={athleteNumber}
                            onChange={e => setAthleteNumber(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: 8,
                                border: '1.5px solid #475569',
                                fontSize: 16,
                                marginBottom: 12,
                                background: '#1e293b',
                                color: '#e2e8f0',
                                outline: 'none',
                                transition: 'border 0.2s ease'
                            }}
                            onFocus={e => e.target.style.border = '1.5px solid #3b82f6'}
                            onBlur={e => e.target.style.border = '1.5px solid #475569'}
                        />
                        <label style={{ 
                            width: '100%', 
                            textAlign: 'left', 
                            marginBottom: 4,
                            color: '#e2e8f0',
                            fontSize: '14px',
                            fontWeight: '600'
                        }}>
                            Doğum Tarihi
                        </label>
                        <input
                            type="date"
                            value={birthDate}
                            onChange={e => setBirthDate(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: 8,
                                border: '1.5px solid #475569',
                                fontSize: 16,
                                marginBottom: 12,
                                background: '#1e293b',
                                color: '#e2e8f0',
                                outline: 'none',
                                transition: 'border 0.2s ease'
                            }}
                            onFocus={e => e.target.style.border = '1.5px solid #3b82f6'}
                            onBlur={e => e.target.style.border = '1.5px solid #475569'}
                        />
                        {addError && (
                            <div style={{ 
                                color: '#ef4444', 
                                marginBottom: 8,
                                padding: '8px 12px',
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                borderRadius: '6px',
                                fontSize: '14px',
                                width: '100%',
                                textAlign: 'center'
                            }}>
                                {addError}
                            </div>
                        )}
                        <button
                            type="submit"
                            style={{
                                padding: '12px 32px',
                                borderRadius: 12,
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                color: '#fff',
                                fontWeight: 600,
                                fontSize: 16,
                                border: 'none',
                                cursor: 'pointer',
                                marginTop: 8,
                                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={e => {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.4)';
                            }}
                            onMouseLeave={e => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
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
                                background: 'rgba(255, 255, 255, 0.1)',
                                border: 'none',
                                fontSize: 22,
                                color: '#94a3b8',
                                cursor: 'pointer',
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={e => {
                                e.target.style.background = 'rgba(239, 68, 68, 0.1)';
                                e.target.style.color = '#ef4444';
                            }}
                            onMouseLeave={e => {
                                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                                e.target.style.color = '#94a3b8';
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