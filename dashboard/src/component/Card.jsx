import React from 'react';
import '../assets/card.scss';

const Card = ({ title, icon, children, color = 'default', footer }) => (
  <div className={`card card--${color}`}>
    <div className="card__header">
      {icon && <span className="card__icon">{icon}</span>}
      {title && <span className="card__title">{title}</span>}
    </div>
    <div className="card__body">{children}</div>
    {footer && <div className="card__footer">{footer}</div>}
  </div>
);

export default Card; 