import { useState, useRef, useEffect } from 'react';

/**
 * EditableCell Component
 * Inline editable cell untuk Excel-like table
 * 
 * Features:
 * - Click to edit
 * - Auto-select on focus
 * - Enter/Escape key support
 * - Validation (0-100)
 * - Color coding
 */
export default function EditableCell({ 
  value, 
  onChange, 
  className = '',
  readOnly = false,
  colorClass = ''
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value ?? '');
  const inputRef = useRef(null);

  useEffect(() => {
    setTempValue(value ?? '');
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleClick = () => {
    if (!readOnly) {
      setIsEditing(true);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    // Validate and save
    if (tempValue === '') {
      onChange(null);
    } else {
      const numValue = parseFloat(tempValue);
      if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
        onChange(numValue);
      } else {
        // Invalid, revert
        setTempValue(value ?? '');
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      inputRef.current?.blur();
    } else if (e.key === 'Escape') {
      setTempValue(value ?? '');
      setIsEditing(false);
    }
  };

  const handleChange = (e) => {
    const val = e.target.value;
    // Allow empty, numbers, and decimal point
    if (val === '' || /^\d*\.?\d*$/.test(val)) {
      setTempValue(val);
    }
  };

  const displayValue = value != null ? value : '-';
  const bgColor = colorClass || (value != null ? 'bg-white' : 'bg-gray-50');

  if (isEditing) {
    return (
      <div className={`${className} px-2 py-2 border-r border-gray-200`}>
        <input
          ref={inputRef}
          type="text"
          value={tempValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-full text-center text-sm border border-blue-500 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="0-100"
        />
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className={`${className} ${bgColor} px-2 py-3 text-center text-sm border-r border-gray-200 ${
        !readOnly ? 'cursor-pointer hover:bg-blue-50' : ''
      } transition-colors`}
    >
      {displayValue}
    </div>
  );
}

