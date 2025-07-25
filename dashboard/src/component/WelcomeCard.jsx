import React from 'react';
import { MdArrowForward } from 'react-icons/md';
import '../assets/welcomecard.scss'; // Assuming you have a CSS file for styling

const WelcomeCard = ({ username, onViewProfile }) => {
    return (
        <div className="welcome-card">
            <div className="welcome-card__content">
                <div className="welcome-card__text-content">
                    <h1 className="welcome-card__title">
                        Hoş Geldiniz, <span className="welcome-card__username">{username || 'Sporcu Velisi'}</span>
                    </h1>
                    <p className="welcome-card__description">
                        Aidat takip sisteminde ödemelerinizi kolayca takip edebilir,
                        geçmiş ödemelerinizi görüntüleyebilir ve yeni ödemeler yapabilirsiniz.
                    </p>
                    <button className="welcome-card__button" onClick={onViewProfile}>
                        <span>Profilimi Görüntüle</span>
                        <MdArrowForward />
                    </button>
                </div>
                <div className="welcome-card__illustration">
                    {/* SVG illustration can be added here */}
                </div>
            </div>
        </div>
    );
};

export default WelcomeCard;