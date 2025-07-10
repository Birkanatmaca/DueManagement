import React from 'react';
import './PlayerModal.scss';

const PlayerModal = ({ player, onClose }) => {
  if (!player) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="view-player-modal" onClick={e => e.stopPropagation()}>
        <button type="button" className="close-x" onClick={onClose}>&times;</button>
        <h3>Sporcu Bilgileri</h3>
        <div className="view-info-row"><span>Sporcu No:</span> <b>{player.number}</b></div>
        <div className="view-info-row"><span>Adı:</span> <b>{player.name}</b></div>
        <div className="view-info-row"><span>Soyadı:</span> <b>{player.surname}</b></div>
        <div className="view-info-row"><span>Doğum Tarihi:</span> <b>{player.birthdate || '-'}</b></div>
        <div className="view-info-row"><span>Veli Adı Soyadı:</span> <b>{player.parent || '-'}</b></div>
        <div className="view-info-row"><span>İletişim No:</span> <b>{player.contact || '-'}</b></div>
      </div>
    </div>
  );
};

export default PlayerModal; 