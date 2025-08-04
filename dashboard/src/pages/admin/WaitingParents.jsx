import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../component/Sidebar';
import Navbar from '../../component/Navbar';
import TableCard from '../../component/TableCard';
import ToastMessage from '../../component/ToastMessage';
import { listPendingUsers, approveUser, rejectUser, getPendingUserDetails } from '../../services/adminServices';
import { MdVisibility, MdCheck, MdClose } from 'react-icons/md';
import ParentDetailModal from '../../component/ParentDetailModal';
import ConfirmModal from '../../component/ConfirmModal';

const WaitingParents = () => {
  const navigate = useNavigate();
  const [sidebarExpanded, setSidebarExpanded] = React.useState(true);
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 900);
  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token || role !== 'admin') {
      navigate('/login');
      return;
    }

    fetchPendingUsers();
  }, [navigate]);

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await listPendingUsers(token);
      
      console.log('API Response:', response); // Debug için
      
      if (response && response.data && response.data.response) {
        setPendingUsers(response.data.response || []);
      } else {
        showToastMessage('Bekleyen veliler yüklenirken hata oluştu', 'error');
      }
    } catch (error) {
      console.error('Error fetching pending users:', error);
      showToastMessage('Bekleyen veliler yüklenirken hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (user) => {
    setSelectedUser({
      id: user.id,
      name: user.name,
      surname: user.last_name,
      phone: user.phone,
      email: user.email
    });
    setShowDetailModal(true);
  };

  const handleApprove = (userId) => {
    setConfirmAction({ type: 'approve', userId });
    setShowConfirmModal(true);
  };

  const handleReject = (userId) => {
    setConfirmAction({ type: 'reject', userId });
    setShowConfirmModal(true);
  };

  const confirmActionHandler = async () => {
    if (!confirmAction) return;

    console.log('confirmActionHandler called with:', confirmAction); // Debug için

    try {
      const token = localStorage.getItem('token');
      let response;

      if (confirmAction.type === 'approve') {
        response = await approveUser(token, confirmAction.userId);
        if (response && response.data) {
          showToastMessage('Veli başarıyla onaylandı', 'success');
          // Kullanıcıyı listeden çıkar
          setPendingUsers(prevUsers => prevUsers.filter(user => user.id !== confirmAction.userId));
        } else {
          showToastMessage(response?.message || 'Onaylama işlemi başarısız', 'error');
        }
      } else if (confirmAction.type === 'reject') {
        console.log('Rejecting user with reason:', rejectionReason); // Debug için
        
        if (!rejectionReason.trim()) {
          showToastMessage('Red sebebi belirtilmelidir', 'error');
          return;
        }
        
        console.log('Calling rejectUser API...'); // Debug için
        response = await rejectUser(token, confirmAction.userId, rejectionReason);
        console.log('rejectUser response:', response); // Debug için
        
        if (response && response.data) {
          showToastMessage('Veli başarıyla reddedildi', 'success');
          // Kullanıcıyı listeden çıkar
          setPendingUsers(prevUsers => prevUsers.filter(user => user.id !== confirmAction.userId));
        } else {
          showToastMessage(response?.message || 'Reddetme işlemi başarısız', 'error');
        }
      }
    } catch (error) {
      console.error('Error processing action:', error);
      showToastMessage('İşlem sırasında hata oluştu', 'error');
    } finally {
      setShowConfirmModal(false);
      setConfirmAction(null);
      setRejectionReason('');
    }
  };

  const showToastMessage = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const iconSize = isMobile ? 20 : 24;

  return (
    <>
      <Sidebar
        expanded={isMobile ? mobileOpen : sidebarExpanded}
        setExpanded={setSidebarExpanded}
        mobileOpen={mobileOpen}
        onToggle={() => setMobileOpen(false)}
      />
      <Navbar
        title="Admin Panel"
        onMenuClick={() => setMobileOpen(true)}
        onMenuClose={() => setMobileOpen(false)}
        mobileOpen={mobileOpen}
      />
      <div
        style={{
          marginLeft: isMobile ? 0 : (sidebarExpanded ? 240 : 80),
          marginTop: 64,
          padding: 24,
          transition: 'margin-left 0.2s',
          backgroundColor: '#0f172a',
          minHeight: '100vh',
        }}
      >
        <h1 style={{ marginBottom: 32, textAlign: 'center', fontWeight: 700, color: '#ffffff' }}>Bekleyen Veliler</h1>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          padding: isMobile ? '0' : '0 20%'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            overflow: 'hidden',
            width: '100%',
            maxWidth: isMobile ? '100%' : '800px'
          }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
            padding: '20px 24px',
            borderBottom: '1px solid #475569'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#ffffff'
                }}>
                  Bekleyen Veliler
                </h3>
                <span style={{
                  fontSize: '14px',
                  color: '#94a3b8',
                  marginTop: '4px',
                  display: 'block'
                }}>
                  {pendingUsers.length} kayıt
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div style={{ padding: '16px 24px' }}>
            {pendingUsers.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#94a3b8'
              }}>
                <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                  Kayıt Bulunamadı
                </div>
                <div style={{ fontSize: '14px' }}>
                  Henüz hiç bekleyen veli bulunmuyor.
                </div>
              </div>
            ) : (
              <div>
                {/* Table Header */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: '16px',
                  padding: '12px 16px',
                  background: '#334155',
                  borderRadius: '8px',
                  marginBottom: '12px'
                }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#e2e8f0',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Ad Soyad
                  </div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#e2e8f0',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    textAlign: 'center'
                  }}>
                    İşlemler
                  </div>
                </div>

                {/* Table Rows */}
                {pendingUsers.map((user, index) => (
                  <div key={user.id} style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    gap: '16px',
                    padding: '12px 16px',
                    background: '#1e293b',
                    borderRadius: '8px',
                    marginBottom: '8px',
                    border: '1px solid #475569',
                    transition: 'all 0.2s ease'
                  }}>
                    <div style={{
                      fontSize: isMobile ? '14px' : '16px',
                      fontWeight: '500',
                      color: '#e2e8f0',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      {user.name} {user.last_name}
                    </div>
                    <div style={{
                      display: 'flex',
                      gap: isMobile ? 4 : 8,
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                      <button 
                        title="Görüntüle" 
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          cursor: 'pointer', 
                          color: '#3b82f6',
                          padding: '4px',
                          borderRadius: '4px',
                          transition: 'background 0.2s ease'
                        }}
                        onMouseEnter={e => e.target.style.background = 'rgba(59, 130, 246, 0.1)'}
                        onMouseLeave={e => e.target.style.background = 'none'}
                        onClick={() => handleViewDetails(user)}
                      >
                        <MdVisibility size={iconSize} />
                      </button>
                      <button 
                        title="Onayla" 
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          cursor: 'pointer', 
                          color: '#10b981',
                          padding: '4px',
                          borderRadius: '4px',
                          transition: 'background 0.2s ease'
                        }}
                        onMouseEnter={e => e.target.style.background = 'rgba(16, 185, 129, 0.1)'}
                        onMouseLeave={e => e.target.style.background = 'none'}
                        onClick={() => handleApprove(user.id)}
                      >
                        <MdCheck size={iconSize} />
                      </button>
                      <button 
                        title="Reddet" 
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          cursor: 'pointer', 
                          color: '#ef4444',
                          padding: '4px',
                          borderRadius: '4px',
                          transition: 'background 0.2s ease'
                        }}
                        onMouseEnter={e => e.target.style.background = 'rgba(239, 68, 68, 0.1)'}
                        onMouseLeave={e => e.target.style.background = 'none'}
                        onClick={() => handleReject(user.id)}
                      >
                        <MdClose size={iconSize} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
                         )}
           </div>
         </div>
        </div>

      {/* Veli Detay Modal */}
      <ParentDetailModal
        open={showDetailModal}
        parent={selectedUser}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedUser(null);
        }}
        getParentDetails={getPendingUserDetails}
      />

      {/* Onay/Red Modal */}
      <ConfirmModal
        open={showConfirmModal}
        title={
          confirmAction?.type === 'approve' 
            ? 'Veliyi onaylamak istediğinize emin misiniz?' 
            : 'Veliyi reddetmek istediğinize emin misiniz?'
        }
        description={
          confirmAction?.type === 'approve' 
            ? 'Bu işlem geri alınamaz.' 
            : 'Bu işlem geri alınamaz.'
        }
        onConfirm={confirmActionHandler}
        onCancel={() => {
          setShowConfirmModal(false);
          setConfirmAction(null);
          setRejectionReason('');
        }}
      >
        {confirmAction?.type === 'reject' && (
          <div style={{ marginTop: '1rem' }}>
            <label htmlFor="rejectionReason" style={{ display: 'block', marginBottom: '0.5rem', color: '#e2e8f0', fontSize: '14px', fontWeight: '600' }}>
              Red Sebebi:
            </label>
            <textarea
              id="rejectionReason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Red sebebini yazın..."
              style={{
                width: '100%',
                minHeight: '80px',
                padding: '12px',
                border: '1px solid #475569',
                borderRadius: '8px',
                resize: 'vertical',
                background: '#1e293b',
                color: '#e2e8f0',
                fontSize: '14px'
              }}
            />
          </div>
        )}
      </ConfirmModal>

      {/* Toast Message */}
      <ToastMessage
        show={showToast}
        message={toastMessage}
        type={toastType}
        onClose={() => setShowToast(false)}
      />
    </div>
    </>
  );
};

export default WaitingParents; 