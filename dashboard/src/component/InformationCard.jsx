import React from 'react';
import '../assets/informationcard.scss';
import { MdPerson, MdSports } from 'react-icons/md';

const InformationCard = ({ title, data, type }) => {
    // Convert data object to array of key-value pairs if it's an object
    const formattedData = data && typeof data === 'object' 
        ? Object.entries(data).map(([key, value]) => ({
            label: key,
            value: String(value) // Convert value to string to ensure safe rendering
        }))
        : [];

    return (
        <div className="info-card">
            <div className="info-card__header">
                <span className="info-card__icon">
                    {type === 'parent' ? <MdPerson /> : <MdSports />}
                </span>
                <h2 className="info-card__title">{title}</h2>
            </div>
            <div className="info-card__content">
                {formattedData.map((item, index) => (
                    <div key={index} className="info-card__row">
                        <span className="info-card__label">{item.label}:</span>
                        <span className="info-card__value">{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default InformationCard;