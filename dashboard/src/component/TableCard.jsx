import React, { useState } from 'react';
import '../assets/tablecard.scss';
import { MdPeople, MdGroup, MdChevronLeft, MdChevronRight } from 'react-icons/md';

const PAGE_SIZE = 5;

const iconMap = {
  athlete: <MdPeople />,
  parent: <MdGroup />,
};

const TableCard = ({
  title,
  iconType,
  columns,
  data,
}) => {
  const [page, setPage] = useState(0);
  const maxPage = Math.ceil((data?.length || 0) / PAGE_SIZE) - 1;
  const start = page * PAGE_SIZE;
  const current = data?.slice(start, start + PAGE_SIZE) || [];

  return (
    <div className="tablecard">
      {(title || iconType) && (
        <div className="tablecard__header">
          {iconType && <span className="tablecard__icon">{iconMap[iconType]}</span>}
          {title && <span className="tablecard__title">{title}</span>}
        </div>
      )}
      <div className="tablecard__body-responsive">
        <table className="tablecard__table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} style={col.style || {}}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {current.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: 'center', padding: 32, color: '#888' }}>
                  Kayıt bulunamadı.
                </td>
              </tr>
            ) : (
              current.map((row, idx) => (
                <tr key={idx} className="tablecard__row">
                  {columns.map((col, cidx) => (
                    <td key={col.key} style={col.style || {}}>
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="tablecard__footer">
        <button
          className="tablecard__nav-btn"
          type="button"
          onClick={() => setPage(p => Math.max(0, p - 1))}
          disabled={page === 0}
        >
          <MdChevronLeft size={20} />
        </button>
        <span style={{ fontSize: 14, color: '#222' }}>{page + 1} / {maxPage + 1}</span>
        <button
          className="tablecard__nav-btn"
          type="button"
          onClick={() => setPage(p => Math.min(maxPage, p + 1))}
          disabled={page === maxPage}
        >
          <MdChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default TableCard; 