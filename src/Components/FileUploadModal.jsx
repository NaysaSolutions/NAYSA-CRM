import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const FileUploadModal = ({ 
  isOpen, 
  onClose, 
  onFileSelect, 
  onDateChange, 
  isLoading 
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [signedDate, setSignedDate] = useState('');
  const [uploadStatus, setUploadStatus] = useState(null);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setUploadStatus(null);
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSignedDate(date);
    if (onDateChange) onDateChange(date);
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setUploadStatus({ success: false, message: 'Please select a file first' });
      return;
    }

    try {
      const result = await onFileSelect(selectedFile);
      if (result && result.success) {
        setUploadStatus({ success: true, message: 'File uploaded successfully!' });
        setTimeout(() => {
          onClose();
          setSelectedFile(null);
          setSignedDate('');
        }, 1500);
      } else {
        setUploadStatus({ 
          success: false, 
          message: result?.message || 'Upload failed' 
        });
      }
    } catch (error) {
      setUploadStatus({ 
        success: false, 
        message: error.message || 'Error uploading file' 
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Upload File</h2>
          <button 
            onClick={() => {
              onClose();
              setSelectedFile(null);
              setSignedDate('');
            }} 
            className="text-gray-500 hover:text-gray-700"
          >
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Select File (10MB max)</label>
          <input 
            type="file" 
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
            accept=".pdf"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Date Signed</label>
          <input 
            type="date" 
            value={signedDate}
            onChange={handleDateChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        {uploadStatus && (
          <div className={`mb-4 p-2 rounded ${
            uploadStatus.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {uploadStatus.message}
          </div>
        )}
        
        <div className="flex justify-end space-x-2">
          <button 
            onClick={() => {
              onClose();
              setSelectedFile(null);
              setSignedDate('');
            }}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            disabled={isLoading}
          >
            Cancel
          </button>

          <button 
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={!selectedFile || isLoading}
          >
            {isLoading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileUploadModal;