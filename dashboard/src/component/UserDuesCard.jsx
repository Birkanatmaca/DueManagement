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
                    <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                        Bu yıl için aidat kaydı bulunamadı.
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserDuesCard;