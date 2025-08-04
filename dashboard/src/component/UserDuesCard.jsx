import React from 'react';
import { MdPayment, MdCheck, MdClose } from 'react-icons/md';
import '../assets/userduescard.scss';

const UserDuesCard = ({ title, iconType, data, year }) => {
    return (
        <div className="user-dues-card">
            <div className="user-dues-card__header">
                <div className="user-dues-card__title-group">
                    <span className="user-dues-card__icon">
                        <MdPayment />
                    </span>
                    <h2 className="user-dues-card__title">{title}</h2>
                </div>
                <div className="user-dues-card__year">
                    {year}
                </div>
            </div>
            <div className="user-dues-card__content">
                {data && data.length > 0 ? (
                    data.map((item, index) => (
                        <div key={index} className="user-dues-card__item">
                            <div className="user-dues-card__month">{item.month}</div>
                            <div className="user-dues-card__amount">{item.amount}</div>
                            <div className={`user-dues-card__status ${item.status === 'Ödendi' ? 'paid' : 'unpaid'}`}>
                                <span className="user-dues-card__status-icon">
                                    {item.status === 'Ödendi' ? <MdCheck /> : <MdClose />}
                                </span>
                                <span className="user-dues-card__status-text">{item.status}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{ 
                        textAlign: 'center', 
                        padding: '40px 20px', 
                        color: '#94a3b8',
                        background: '#1e293b',
                        borderRadius: '8px',
                        border: '1px solid #475569',
                        margin: '16px'
                    }}>
                        <div style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            marginBottom: '8px'
                        }}>
                            Aidat Kaydı Bulunamadı
                        </div>
                        <div style={{
                            fontSize: '14px',
                            color: '#64748b'
                        }}>
                            Bu yıl için henüz aidat kaydı bulunmuyor.
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserDuesCard;