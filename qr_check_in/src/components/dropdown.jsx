import React, { useState } from 'react';

const Dropdown = ({ options, placeholder, disabled, onSelect }) => {
  const [selected, setSelected] = useState('');

  const handleChange = (e) => {
    const value = e.target.value;
    setSelected(value);
    onSelect(value);
  };

  return (
    <select value={selected} onChange={handleChange} className="dropdown" disabled={disabled}>
        <option value="" disabled hidden className="placeholder-option">
            {placeholder}
        </option>
        {options.map((option, index) => (
            <option key={index} value={option}>
            {option}
            </option>
        ))}
    </select>
  );
};

export default Dropdown;
