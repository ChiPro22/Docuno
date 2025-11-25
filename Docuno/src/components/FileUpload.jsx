import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { useState } from "react";

const FileUpload = () => {
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [fileName, setFileName] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState(null);
  const [uploadedData, setUploadedData] = useState(null);

  const handleFileUpload = (e) => {
    if (e) e.stopPropagation();
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
            const progressInterval = setInterval(() => {
              setUploadProgress(prev => (prev >= 90 ? 90 : prev + 10));
            }, 200);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); 

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
              setTimeout(() => setUploadProgress(0), 1000);
            } else {
              const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
              throw new Error(errorData.message || `Upload failed with status: ${response.status}`);
            }
          } catch (error) {
            console.error('Upload error:', error);
            setUploadStatus('error');
            setUploadProgress(0);
            
            if (error.name === 'AbortError') {
                setErrorMessage('Upload timed out. Please try again.');
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
    // Changed: Removed 'relative' and 'overflow-hidden' constraints that caused clipping
    <div className="w-full h-full min-h-[350px] flex flex-col rounded-xl shadow-sm relative overflow-hidden" 
         style={{ background: 'linear-gradient(135deg, var(--secondary-color), rgba(255,255,255,0.1))' }}>
      
      {/* Progress Bar */}
      {uploadStatus === 'uploading' && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gray-200 z-10">
          <div 
            className="h-full transition-all duration-500 ease-out"
            style={{ width: `${uploadProgress}%`, background: 'var(--primary-color)' }}
          />
        </div>
      )}

      {/* Main Content - Changed to standard Flexbox centering */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-md w-full">
          
          {/* Icon */}
          <div className="mb-6 relative">
            <div className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center transition-all duration-500 ${
              uploadStatus === 'success' 
                ? 'bg-green-100 border-2 border-green-200' 
                : uploadStatus === 'error'
                ? 'bg-red-100 border-2 border-red-200'
                : 'bg-white border-2 border-gray-200 shadow-lg'
            }`}>
              {uploadStatus === 'success' ? (
                <CheckCircle className="text-green-600" size={40} strokeWidth={2} />
              ) : uploadStatus === 'error' ? (
                <AlertCircle className="text-red-600" size={40} strokeWidth={2} />
              ) : uploadStatus === 'uploading' ? (
                <div className="relative">
                  <Upload className="text-gray-600" size={40} strokeWidth={2} />
                  <div className="absolute inset-0 border-4 border-gray-200 rounded-full animate-spin opacity-75" style={{ borderTopColor: 'var(--primary-color)' }}></div>
                </div>
              ) : (
                <Upload className="text-gray-600" size={40} strokeWidth={2} />
              )}
            </div>
          </div>
          
          {/* Title */}
          <h2 className="text-2xl font-bold mb-2 text-gray-800">
            {uploadStatus === 'uploading' ? 'Uploading...' : 
             uploadStatus === 'success' ? 'Complete!' :
             uploadStatus === 'error' ? 'Failed' : 'Upload PDF'}
          </h2>
          
          {/* Subtitle/Status Text */}
          <div className="mb-6 min-h-[3rem]">
            {uploadStatus === 'idle' && (
              <p className="text-gray-600 text-sm">Select a PDF to analyze with AI</p>
            )}
            
            {fileName && uploadStatus === 'success' && (
              <div className="text-green-700 text-sm bg-green-50 p-2 rounded-lg border border-green-100">
                <p className="font-medium truncate">{fileName}</p>
                <p className="text-xs mt-1">Ready to chat!</p>
              </div>
            )}

            {uploadStatus === 'uploading' && (
              <p className="text-gray-600 text-sm">Processing: {uploadProgress}%</p>
            )}

            {uploadStatus === 'error' && (
              <p className="text-red-600 text-sm bg-red-50 p-2 rounded-lg">{errorMessage}</p>
            )}
          </div>
          
          {/* Action Button - The "Bottom Black Button" */}
          <button 
            className={`w-full px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 shadow-lg active:scale-95 ${
              uploadStatus === 'uploading' ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gray-800'
            }`}
            disabled={uploadStatus === 'uploading'}
            onClick={(e) => {
              if (uploadStatus === 'success' || uploadStatus === 'error') resetUpload();
              else handleFileUpload(e);
            }}
          >
            {uploadStatus === 'uploading' ? 'Please wait...' : 
             uploadStatus === 'success' ? 'Upload New File' : 
             uploadStatus === 'error' ? 'Try Again' : 'Choose File'}
          </button>

        </div>
      </div>
    </div>
  );
};

export default FileUpload;