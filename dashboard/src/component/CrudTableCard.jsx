import React, { useState } from 'react';
import '../assets/crudtablecard.scss';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';

const PAGE_SIZE = 10;

const CrudTableCard = ({
  title,
  icon,
  columns,
  data,
  onView,
  onEdit,
  onDelete,
  tableClassName = '',
}) => {
  const [page, setPage] = useState(0);
  const maxPage = Math.ceil((data?.length || 0) / PAGE_SIZE) - 1;
  const start = page * PAGE_SIZE;
  const current = data?.slice(start, start + PAGE_SIZE) || [];

  return (
    <div className="crudtablecard">
      {(title || icon) && (
        <div className="crudtablecard__header">
          {icon && <span className="crudtablecard__icon">{icon}</span>}
          {title && <span className="crudtablecard__title">{title}</span>}
        </div>
      )}
      <div className="crudtablecard__body-responsive">
        <table className={`crudtablecard__table ${tableClassName}`.trim()}>
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
                <tr key={idx} className="crudtablecard__row">
                  {columns.map((col, cidx) => (
                    <td key={col.key} style={col.style || {}}>
                      {col.render
                        ? col.render(row[col.key], row, { onView, onEdit, onDelete })
                        : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="crudtablecard__footer">
        <button
          className="crudtablecard__nav-btn"
          type="button"
          onClick={() => setPage(p => Math.max(0, p - 1))}
          disabled={page === 0}
        >
          <MdChevronLeft size={20} />
        </button>
        <span style={{ fontSize: 14, color: '#222' }}>{page + 1} / {maxPage + 1}</span>
        <button
          className="crudtablecard__nav-btn"
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

export default CrudTableCard; 