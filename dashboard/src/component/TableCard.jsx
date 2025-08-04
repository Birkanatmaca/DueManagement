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
  columns = [],
  data = [],
}) => {
  const [page, setPage] = useState(0);
  const maxPage = Math.ceil((data?.length || 0) / PAGE_SIZE) - 1;
  const start = page * PAGE_SIZE;
  const current = data?.slice(start, start + PAGE_SIZE) || [];

  return (
    <div className="tablecard">
      {/* Modern Header */}
      <div className="tablecard__header">
        <div className="tablecard__header-content">
          <div className="tablecard__header-left">
            {iconType && (
              <div className="tablecard__icon-wrapper">
                <span className="tablecard__icon">{iconMap[iconType]}</span>
              </div>
            )}
            <div className="tablecard__title-section">
              {title && <h3 className="tablecard__title">{title}</h3>}
              <span className="tablecard__subtitle">{data.length} kayıt</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Content */}
      <div className="tablecard__content">
        {current.length === 0 ? (
          <div className="tablecard__empty">
            <h4 className="tablecard__empty-title">Kayıt Bulunamadı</h4>
            <p className="tablecard__empty-text">Henüz hiç kayıt eklenmemiş.</p>
          </div>
        ) : (
          <div className="tablecard__list">
            {current.map((row, idx) => (
              <div key={idx} className="tablecard__item">
                <div className="tablecard__item-content">
                  {columns?.map((col, cidx) => (
                    <div key={col.key} className="tablecard__item-field">
                      <span className="tablecard__field-label">{col.label}</span>
                      <span className="tablecard__field-value">
                        {col.render ? col.render(row[col.key], row) : row[col.key]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modern Footer */}
      {current.length > 0 && (
        <div className="tablecard__footer">
          <div className="tablecard__pagination">
            <button
              className="tablecard__nav-btn"
              type="button"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              <MdChevronLeft size={18} />
              <span>Önceki</span>
            </button>
            
            <div className="tablecard__page-info">
              <span className="tablecard__page-text">
                Sayfa {page + 1} / {maxPage + 1}
              </span>
              <span className="tablecard__page-details">
                {start + 1}-{Math.min(start + PAGE_SIZE, data.length)} / {data.length}
              </span>
            </div>
            
            <button
              className="tablecard__nav-btn"
              type="button"
              onClick={() => setPage(p => Math.min(maxPage, p + 1))}
              disabled={page === maxPage}
            >
              <span>Sonraki</span>
              <MdChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableCard; 