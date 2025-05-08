import React, { useState } from 'react';
import './TimecodeModal.css'; 
import { IoClose } from "react-icons/io5";

const NewTimecodeModal = ({ isOpen, onClose, movieTitle, currentTime = "00:45:30" }) => {
  const [label, setLabel] = useState('');
  const [time, setTime] = useState(currentTime);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Saving timecode:', { time, label });
    onClose();
  };

  return (
    <div className="timecode-modal-overlay">
      <div className="timecode-modal-container">
        <div className="timecode-modal-header">
          <h2>New Timecode</h2>
          <IoClose className="timecode-close-icon" onClick={onClose} />
        </div>
        <div className="timecode-modal-content">
          
          <form onSubmit={handleSubmit} className="timecode-form">
            <div className="timecode-form-group">
      
              <input
                type="text"
                id="timecode"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="Time (HH:MM:SS)"
                pattern="[0-9]{2}:[0-9]{2}:[0-9]{2}"
                required
              />
            </div>

            <div className="timecode-form-group">
              
              <input
                type="text"
                id="label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Title or Description"
                required
              />
            </div>
            
            <button type="submit" className="timecode-save-btn">Save Timecode</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewTimecodeModal;