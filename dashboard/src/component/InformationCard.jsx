import React from 'react';
import '../assets/informationcard.scss';
import { MdPerson, MdSports } from 'react-icons/md'; // MdChild yerine MdSports kullanıyoruz

const InformationCard = ({ title, data, type }) => {
    return (
        <div className="info-card">
            <div className="info-card__header">
                <span className="info-card__icon">
                    {type === 'parent' ? <MdPerson /> : <MdSports />}
                </span>
                <h2 className="info-card__title">{title}</h2>
            </div>
            <div className="info-card__content">
                {Object.entries(data).map(([key, value]) => (
                    <div key={key} className="info-card__row">
                        <span className="info-card__label">{key}:</span>
                        <span className="info-card__value">{value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default InformationCard;