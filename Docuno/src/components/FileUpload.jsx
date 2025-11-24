import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { useState } from "react";

const FileUpload = () => {
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [fileName, setFileName] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState(null);
  const [uploadedData, setUploadedData] = useState(null);

  const handleFileUpload = (e) => {
    // Prevent event bubbling if called from button click
    if (e) {
      e.stopPropagation();
    }
    
    // Don't allow file selection if already uploading
    if (uploadStatus === 'uploading') return;

    const element = document.createElement("input");
    element.setAttribute("type", "file");
    element.setAttribute("accept", "application/pdf");
    element.click();

    element.addEventListener("change", async () => {
      if (element.files && element.files.length > 0) {
        const file = element.files[0];
        if (file) {
          setUploadStatus('uploading');
          setFileName(file.name);
          setErrorMessage(null);
          setUploadProgress(0);
          
          const formData = new FormData();
          formData.append("pdf", file);

          try {
            // Simulate progress for better UX
            const progressInterval = setInterval(() => {
              setUploadProgress(prev => {
                if (prev >= 90) {
                  clearInterval(progressInterval);
                  return 90;
                }
                return prev + 10;
              });
            }, 200);

            // Add timeout support
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

            const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/upload/pdf`, {
              method: "POST",
              body: formData,
              signal: controller.signal,
            });

            clearInterval(progressInterval);
            clearTimeout(timeoutId);
            setUploadProgress(100);

            if (response.ok) {
              const data = await response.json();
              setUploadedData(data);
              setUploadStatus('success');
              setTimeout(() => setUploadProgress(0), 1000); // Reset progress after showing success
            } else {
              const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
              throw new Error(errorData.message || `Upload failed with status: ${response.status}`);
            }
          } catch (error) {
            console.error('Upload error:', error);
            setUploadStatus('error');
            setUploadProgress(0);
            
            if (error.name === 'AbortError') {
                setErrorMessage('Upload timed out. Please check your connection and try again.');
            } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                setErrorMessage('Network error. Please check your internet connection.');
            } else if (error.message.includes('413') || error.message.includes('too large')) {
                setErrorMessage('File is too large. Please choose a smaller file (max 10MB).');
            } else if (error.message.includes('415') || error.message.includes('Unsupported')) {
                setErrorMessage('Unsupported file type. Please upload a PDF file.');
            } else {
                setErrorMessage(error.message || 'Upload failed. Please try again.');
            }
          }
        }
      }
    });
  };

  const resetUpload = () => {
    setUploadStatus('idle');
    setFileName(null);
    setErrorMessage(null);
    setUploadedData(null);
    setUploadProgress(0);
  };

  return (
    <div className="w-full h-full relative overflow-hidden rounded-xl shadow-sm" style={{ background: 'linear-gradient(135deg, var(--secondary-color), rgba(255,255,255,0.1))' }}>
      {/* Progress Bar */}
      {uploadStatus === 'uploading' && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gray-200">
          <div 
            className="h-full transition-all duration-500 ease-out"
            style={{ width: `${uploadProgress}%`, background: 'var(--primary-color)' }}
          />
        </div>
      )}

      {/* Main content */}
      <div className="absolute inset-0 flex items-center justify-center p-8">
        <div className="text-center max-w-md w-full">
          {/* Upload Icon/Status */}
          <div className="mb-8 relative">
            <div className={`w-24 h-24 mx-auto rounded-2xl flex items-center justify-center transition-all duration-500 ${
              uploadStatus === 'success' 
                ? 'bg-green-100 border-2 border-green-200' 
                : uploadStatus === 'error'
                ? 'bg-red-100 border-2 border-red-200'
                : 'bg-white border-2 border-gray-200 shadow-lg hover:shadow-xl hover:-translate-y-1'
            }`}>
              {uploadStatus === 'success' ? (
                <CheckCircle 
                  className="text-green-600"
                  size={48}
                  strokeWidth={2}
                />
              ) : uploadStatus === 'error' ? (
                <AlertCircle 
                  className="text-red-600"
                  size={48}
                  strokeWidth={2}
                />
              ) : uploadStatus === 'uploading' ? (
                <div className="relative">
                  <Upload 
                    className="text-gray-600"
                    size={48}
                    strokeWidth={2}
                  />
                  <div className="absolute inset-0 border-4 border-gray-200 rounded-full animate-spin opacity-75" style={{ borderTopColor: 'var(--primary-color)' }}></div>
                </div>
              ) : (
                <Upload 
                  className="text-gray-600"
                  size={48}
                  strokeWidth={2}
                />
              )}
            </div>
          </div>
          
          {/* Title */}
          <h2 className={`text-3xl font-bold mb-2 transition-colors duration-300 ${
            uploadStatus === 'success' ? 'text-green-700' :
            uploadStatus === 'error' ? 'text-red-700' :
            'text-gray-800'
          }`} style={uploadStatus === 'uploading' ? { color: 'var(--primary-color)' } : {}}>
            {uploadStatus === 'uploading' ? 'Uploading Document' : 
             uploadStatus === 'success' ? 'Upload Complete!' :
             uploadStatus === 'error' ? 'Upload Failed' : 'Upload PDF Document'}
          </h2>
          
          {/* Subtitle */}
          {uploadStatus === 'idle' && (
            <p className="text-gray-600 mb-8 text-lg">
              Choose a PDF file to start analyzing with AI
            </p>
          )}
          
          {/* File info for success state */}
          {fileName && uploadStatus === 'success' && uploadedData && (
            <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-center justify-center mb-3">
                <FileText className="text-green-600 mr-3" size={20} />
                <p className="text-green-800 font-medium truncate max-w-xs">
                  {fileName}
                </p>
              </div>
              <div className="text-green-700 text-sm space-y-1">
                <p className="font-medium">{uploadedData.message}</p>
              </div>
            </div>
          )}
          
          {/* Progress info for uploading state */}
          {uploadStatus === 'uploading' && fileName && (
            <div className="mb-8 p-6 bg-white bg-opacity-20 border border-gray-300 rounded-xl backdrop-blur-sm">
              <div className="flex items-center justify-center mb-3">
                <FileText className="mr-3" style={{ color: 'var(--primary-color)' }} size={20} />
                <p className="text-gray-800 font-medium truncate max-w-xs">
                  {fileName}
                </p>
              </div>
              <div className="text-gray-700 text-sm">
                <p className="mb-2">Processing your document...</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%`, background: 'var(--primary-color)' }}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-600">{uploadProgress}% complete</p>
              </div>
            </div>
          )}

          {/* Error message */}
          {uploadStatus === 'error' && errorMessage && (
            <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-700 font-medium mb-2">Something went wrong</p>
              <p className="text-red-600 text-sm">
                {errorMessage}
              </p>
            </div>
          )}
          
          {/* Action Button */}
          <button 
            className={`w-full px-8 py-4 rounded-xl font-semibold text-white transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 cursor-pointer ${
              uploadStatus === 'uploading' 
                ? 'bg-gray-400 cursor-not-allowed' 
                : uploadStatus === 'success'
                ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:ring-green-200'
                : uploadStatus === 'error'
                ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:ring-red-200'
                : 'focus:ring-gray-200'
            } ${uploadStatus !== 'uploading' ? 'hover:-translate-y-0.5 active:translate-y-0' : ''}`}
            style={uploadStatus === 'idle' ? { background: 'var(--button-color)' } : {}}
            disabled={uploadStatus === 'uploading'}
            onClick={(e) => {
              e.stopPropagation();
              if (uploadStatus === 'success' || uploadStatus === 'error') {
                resetUpload();
              } else {
                handleFileUpload(e);
              }
            }}
          >
            {uploadStatus === 'uploading' ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                Uploading... {uploadProgress}%
              </div>
            ) : uploadStatus === 'success' ? (
              'Upload Another Document'
            ) : uploadStatus === 'error' ? (
              'Try Again'
            ) : (
              'Choose PDF File'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;