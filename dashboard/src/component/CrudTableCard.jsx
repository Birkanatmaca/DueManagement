import React, { useState, useEffect } from 'react';
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
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth <= 1024);
  
  const maxPage = Math.ceil((data?.length || 0) / PAGE_SIZE) - 1;
  const start = page * PAGE_SIZE;
  const current = data?.slice(start, start + PAGE_SIZE) || [];

  // Responsive kontrol
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsTablet(window.innerWidth <= 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
                <th 
                  key={col.key} 
                  style={{
                    ...col.style,
                    width: isMobile ? 'auto' : (col.style?.width || 'auto'),
                    minWidth: isMobile ? '80px' : (col.style?.minWidth || 'auto'),
                    maxWidth: isMobile ? '120px' : (col.style?.maxWidth || 'auto'),
                    fontSize: isMobile ? '11px' : '13px',
                    padding: isMobile ? '8px 4px' : '20px 24px'
                  }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {current.length === 0 ? (
              <tr className="empty-state">
                <td colSpan={columns.length}>
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    gap: '12px',
                    padding: '40px 20px'
                  }}>

                    <div style={{ 
                      fontSize: '16px', 
                      color: '#94a3b8',
                      fontWeight: '500'
                    }}>
                      Kayıt bulunamadı
                    </div>
                    <div style={{ 
                      fontSize: '14px', 
                      color: '#64748b'
                    }}>
                      Henüz hiç kayıt eklenmemiş
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              current.map((row, idx) => (
                <tr key={idx} className="crudtablecard__row">
                  {columns.map((col, cidx) => (
                    <td 
                      key={col.key} 
                      style={{
                        ...col.style,
                        width: isMobile ? 'auto' : (col.style?.width || 'auto'),
                        minWidth: isMobile ? '80px' : (col.style?.minWidth || 'auto'),
                        maxWidth: isMobile ? '120px' : (col.style?.maxWidth || 'auto'),
                        fontSize: isMobile ? '11px' : '14px',
                        padding: isMobile ? '8px 4px' : '20px 24px',
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word'
                      }}
                    >
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
        <span style={{ fontSize: 14, color: '#94a3b8' }}>{page + 1} / {maxPage + 1}</span>
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