import React, { useState } from 'react';
import Sidebar from '../../component/Sidebar';
import Navbar from '../../component/Navbar';
import Card from '../../component/Card';
import { MdPeople, MdGroup, MdPayment, MdAttachMoney } from 'react-icons/md';
import TableCard from '../../component/TableCard';
import { useNavigate } from 'react-router-dom';
import { listChildren, listParents, listDues } from '../../services/adminServices';

const AdminDashboard = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const [athletes, setAthletes] = useState([]);
  const [parentCount, setParentCount] = useState(0);
  const [parents, setParents] = useState([]);
  const [paidDues, setPaidDues] = useState(0);
  const [totalDues, setTotalDues] = useState(0);
  React.useEffect(() => {
    const token = localStorage.getItem('token') || 'demo-token';
    listChildren(token)
      .then(res => {
        if (res && res.data && Array.isArray(res.data.response?.children)) {
          setAthletes(res.data.response.children.map(child => ({
            name: child.name + (child.surname ? ' ' + child.surname : ''),
            number: child.athlete_number,
          })));
        } else {
          setAthletes([]);
        }
      })
      .catch(() => setAthletes([]));

    listParents(token)
      .then(res => {
        if (res && res.data && Array.isArray(res.data.response?.parents)) {
          setParentCount(res.data.response.parents.length);
          setParents(res.data.response.parents.map(parent => ({
            name: (parent.name || '') + (parent.last_name ? ' ' + parent.last_name : ''),
            phone: parent.phone || '',
          })));
        } else {
          setParentCount(0);
          setParents([]);
        }
      })
      .catch(() => {
        setParentCount(0);
        setParents([]);
      });

    // Fetch all dues for the current year (all months)
    const fetchAllDues = async () => {
      const now = new Date();
      const year = now.getFullYear();
      try {
        // Ay parametresi olmadan çağır (backend bu desteği vermeli)
        const res = await listDues(token, undefined, year);
        const dues = res?.data?.response?.dues || [];
        setTotalDues(dues.length);
        setPaidDues(dues.filter(d => d.status === 'Ödendi').length);
      } catch {
        setTotalDues(0);
        setPaidDues(0);
      }
    };
    fetchAllDues();
  }, []);

  return (
    <>
      <Sidebar
        expanded={isMobile ? mobileOpen : sidebarExpanded}
        setExpanded={setSidebarExpanded}
        mobileOpen={mobileOpen}
        onToggle={isMobile ? () => setMobileOpen(false) : undefined}
        role="admin"
      />
      <Navbar
        title="ADMIN PANEL"
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
        }}
      >
        {/* Üstte 4 özet kartı yan yana */}
        <div className="dashboard-summary-row">
          <Card title="Toplam Sporcu" icon={<MdPeople />} color="blue" footer={<button className="card__view-link" type="button" onClick={() => navigate('/admin/athletes')}>Görüntüle</button>}>
            {athletes.length}
          </Card>
          <Card title="Toplam Veli" icon={<MdGroup />} color="green" footer={<button className="card__view-link" type="button">Görüntüle</button>}>{parentCount}</Card>
          <Card title="Ödenen Aidat Sayısı" icon={<MdPayment />} color="yellow" footer={<button className="card__view-link" type="button">Görüntüle</button>}>
            {paidDues}/{athletes.length}
          </Card>
          <Card title="Ciro" icon={<MdAttachMoney />} color="pink" footer={<button className="card__view-link" type="button">Görüntüle</button>}>123</Card>
        </div>
        {/* 2 tablo kartı yan yana */}
        <div className="tablecard-row" style={{ marginTop: 24 }}>
          <TableCard
            title="Sporcular"
            iconType="athlete"
            columns={[{ label: 'İsim', key: 'name', align: 'left' }, { label: 'Numara', key: 'number', align: 'right' }]}
            data={athletes}
          />
          <TableCard
            title="Veliler"
            iconType="parent"
            columns={[
              { label: 'Veli', key: 'name', align: 'left' },
              { label: 'Telefon Numarası', key: 'phone', align: 'right' },
            ]}
            data={parents}
          />
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;