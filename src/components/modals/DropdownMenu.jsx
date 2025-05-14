import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import './DropdownMenu.css';

const DropdownMenu = ({ isOpen, onClose, options, position }) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const style = position ? {
    top: position.top,
    left: position.left,
  } : {};

  return (
    <div className="dropdown-menu" ref={dropdownRef} style={style}>
      <div className="dropdown-content">
        {options.map((option, index) => (
          <div 
            key={index} 
            className="dropdown-option"
            onClick={() => {
              option.onClick();
              onClose();
            }}
          >
            {option.icon && <span className="dropdown-option-icon">{option.icon}</span>}
            <span className="dropdown-option-text">{option.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

DropdownMenu.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      icon: PropTypes.node,
      onClick: PropTypes.func.isRequired,
    })
  ).isRequired,
  position: PropTypes.shape({
    top: PropTypes.number,
    left: PropTypes.number,
  }),
};

export default DropdownMenu;