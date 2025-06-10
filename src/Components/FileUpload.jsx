import React, { useState } from 'react';

// FileUpload.jsx
const FileUpload = ({ isOpen, onClose, onFileSelect, isLoading }) => {
  const [files, setFiles] = useState([]);
  const [signedDate, setSignedDate] = useState("");

  const handleFileChange = (e) => {
  const MAX_FILE_SIZE = 1024 * 1024 * 1024; // 1 GB in bytes

  const newFiles = Array.from(e.target.files).map(file => ({
    file,
    name: file.name,
    size: file.size,
    type: file.type
  }));

  const tooLargeFiles = newFiles.filter(f => f.size > MAX_FILE_SIZE);

  if (tooLargeFiles.length > 0) {
    alert("One or more files exceed the 1 GB size limit and will not be uploaded.");
  }

  // Keep only files under 1 GB
  const validFiles = newFiles.filter(f => f.size <= MAX_FILE_SIZE);

  setFiles(validFiles);
};

  const removeFile = (index) => {
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    setFiles(updatedFiles);
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      alert('Please select at least one file');
      return;
    }
    
    const uploadDate = new Date().toISOString().split('T')[0];
    const result = await onFileSelect(files, uploadDate, signedDate);
    
    if (result.success) {
      setFiles([]);
      setSignedDate("");
    }
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${isOpen ? '' : 'hidden'}`}>
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Upload Files</h2>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Files</label>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="w-full p-2 border rounded"
          />
          
          {files.length > 0 && (
            <div className="mt-2 space-y-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-100 rounded">
                  <span className="text-sm truncate">{file.name}</span>
                  <button 
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Signed Date</label>
          <input
            type="date"
            value={signedDate}
            onChange={(e) => setSignedDate(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => {
              setFiles([]);
              setSignedDate("");
              onClose();
            }}
            className="px-4 py-2 text-gray-700 border rounded hover:bg-gray-100"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={isLoading || files.length === 0}
          >
            {isLoading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;