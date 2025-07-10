import React from 'react';
import './PlayerList.scss';

const PlayerList = ({ players, onEdit, onView, onDelete, page, setPage, pageCount }) => (
  <>
    <table className="players-table minimal">
      <thead>
        <tr>
          <th>Ad Soyad</th>
          <th>İşlemler</th>
        </tr>
      </thead>
      <tbody>
        {players.map(player => (
          <tr key={player.id}>
            <td><span className="player-name">{player.name} {player.surname}</span></td>
            <td>
              <button className="edit-btn" onClick={() => onEdit(player.id)}>Düzenle</button>
              <button className="view-btn" onClick={() => onView(player.id)}>Görüntüle</button>
              <button className="delete-btn" onClick={() => onDelete(player.id)}>Sil</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    {pageCount > 1 && (
      <div className="players-pagination">
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Önceki</button>
        <span>{page} / {pageCount}</span>
        <button onClick={() => setPage(p => Math.min(pageCount, p + 1))} disabled={page === pageCount}>Sonraki</button>
      </div>
    )}
  </>
);

export default PlayerList; 