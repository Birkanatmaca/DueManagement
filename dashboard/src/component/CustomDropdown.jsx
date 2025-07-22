import React, { useState, useRef, useEffect } from 'react';
import '../assets/athletedetailmodal.scss';

const CustomDropdown = ({ options = [], value, onChange, placeholder = 'Seçiniz', disabled = false }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    onChange && onChange(option.value);
    setOpen(false);
  };

  const selected = options.find(opt => opt.value === value);

  return (
    <div className={`custom-dropdown${disabled ? ' disabled' : ''}`} ref={ref}>
      <button
        type="button"
        className={`custom-dropdown__control${open ? ' open' : ''}`}
        onClick={() => !disabled && setOpen(o => !o)}
        disabled={disabled}
        tabIndex={0}
      >
        <span className={`custom-dropdown__value${!selected ? ' placeholder' : ''}`}>{selected ? selected.label : placeholder}</span>
        <span className="custom-dropdown__arrow">▼</span>
      </button>
      {open && !disabled && (
        <div className="custom-dropdown__menu">
          {options.map(opt => (
            <div
              key={opt.value}
              className={`custom-dropdown__option${opt.value === value ? ' selected' : ''}`}
              onClick={() => handleSelect(opt)}
              tabIndex={0}
              onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleSelect(opt)}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown; 