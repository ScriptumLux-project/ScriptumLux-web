import React from 'react';
import './TimecodeModal.css'; 
import { IoClose } from "react-icons/io5";
import { IoAdd } from "react-icons/io5";
import NewTimecodeModal from './NewTimecodeModal';

const TimecodeHistoryModal = ({ isOpen, onClose, movieTitle }) => {
  // Mock data for timecode history
  const mockTimecodes = [
    { id: 1, time: "00:23:45", label: "Car chase scene", date: "2025-03-12" },
    { id: 2, time: "01:05:22", label: "Plot twist", date: "2025-03-10" },
    { id: 3, time: "00:45:10", label: "Funny dialogue", date: "2025-03-08" }
  ];

  // State to control NewTimecodeModal visibility
  const [isNewTimecodeModalOpen, setIsNewTimecodeModalOpen] = React.useState(false);

  if (!isOpen) return null;

  const openNewTimecodeModal = () => {
    setIsNewTimecodeModalOpen(true);
  };

  const closeNewTimecodeModal = () => {
    setIsNewTimecodeModalOpen(false);
  };

  return (
    <>
      <div className="timecode-modal-overlay">
        <div className="timecode-modal-container">
          <div className="timecode-modal-header">
            <h2>Choose Timecode</h2>
            <IoClose className="timecode-close-icon" onClick={onClose} />
          </div>
          <div className="timecode-modal-content">
            {mockTimecodes.length > 0 ? (
              <div className="timecode-list">
                {mockTimecodes.map((timecode) => (
                  <div key={timecode.id} className="timecode-item">
                    <div className="timecode-info">
                      <span className="timecode-time">{timecode.time}</span>
                      <span className="timecode-label">{timecode.label}</span>
                    </div>
                    <span className="timecode-date">{timecode.date}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-timecodes">No saved timecodes for this movie.</p>
            )}
            
            <button className="create-new-timecode-btn" onClick={openNewTimecodeModal}>
              <IoAdd /> Create New
            </button>
          </div>
        </div>
      </div>

      <NewTimecodeModal
        isOpen={isNewTimecodeModalOpen}
        onClose={closeNewTimecodeModal}
        movieTitle={movieTitle}
      />
    </>
  );
};

export default TimecodeHistoryModal;