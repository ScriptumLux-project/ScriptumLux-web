import React, { useState } from 'react';
import { IoClose } from "react-icons/io5";
import './NewPlaylistModal.css'; 

const EditPlaylistModal = ({ isOpen, onClose, currentTitle, onSave }) => {
  const [editedTitle, setEditedTitle] = useState(currentTitle);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    if (!editedTitle.trim()) return;
    onSave(editedTitle);
    onClose();
  };

  return (
    <div className="new-playlist-modal-overlay">
      <div className="new-playlist-modal-container">
        <div className="new-playlist-modal-header">
          <h2>Edit Playlist Title</h2>
          <IoClose className="new-playlist-close-icon" onClick={onClose} />
        </div>
        <div className="new-playlist-modal-content">
          <form onSubmit={handleSave} className="new-playlist-form">
            <div className="form-group">
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                placeholder="Playlist Title"
                autoFocus
              />
            </div>
            <div className="new-playlist-form-actions">
              <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
              <button type="submit" className="create-btn">Save</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditPlaylistModal;
