import React, { useRef, useEffect, useState } from 'react';

const CameraStream = ({ 
  streamUrl, 
  cameraName = 'Camera', 
  autoplay = true, 
  controls = true,
  width = '100%',
  height = '300px'
}) => {
  const videoRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;

    // Reset states
    setIsLoading(true);
    setError(null);
    setIsPlaying(false);



    // Check if HLS is supported
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      video.src = streamUrl;
      loadVideo();
    } else if (window.Hls && window.Hls.isSupported()) {
      // Use HLS.js for other browsers
      const hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
        debug: true, // Enable debug logging
        xhrSetup: function(xhr, url) {
          // Add CORS headers if needed
          xhr.withCredentials = false;
        }
      });

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
        console.log(`HLS manifest loaded for ${cameraName}`);
        setRetryCount(0); // Reset retry count on success
        loadVideo();
      });

      hls.on(window.Hls.Events.MANIFEST_LOADING, () => {
        console.log(`Loading manifest for ${cameraName}: ${streamUrl}`);
      });

      hls.on(window.Hls.Events.ERROR, (event, data) => {
        console.error(`HLS error for ${cameraName}:`, data);
        console.error(`Error details:`, data.details);
        console.error(`Error fatal:`, data.fatal);
        console.error(`Error type:`, data.type);
        
        if (data.fatal) {
          let errorMessage = 'Lỗi stream';
          if (data.details === 'manifestLoadError') {
            errorMessage = 'Không thể kết nối camera. Kiểm tra MediaMTX server.';
          } else if (data.details === 'networkError') {
            errorMessage = 'Lỗi mạng. Kiểm tra kết nối.';
          } else {
            errorMessage = `Lỗi: ${data.details}`;
          }
          setError(errorMessage);
          setIsLoading(false);
        }
      });

      // Cleanup function
      return () => {
        hls.destroy();
      };
    } else {
      setError('Trình duyệt không hỗ trợ HLS streaming');
      setIsLoading(false);
    }

    async function loadVideo() {
      try {
        if (autoplay) {
          await video.play();
        }
        setIsLoading(false);
      } catch (err) {
        console.error(`Error playing video for ${cameraName}:`, err);
        setError('Không thể phát video. Hãy thử nhấn play.');
        setIsLoading(false);
      }
    }

    // Event listeners
    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleError = (e) => {
      console.error(`Video error for ${cameraName}:`, e);
      setError('Lỗi kết nối camera');
      setIsLoading(false);
    };

    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('error', handleError);
    };
  }, [streamUrl, cameraName, autoplay]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setError(null);
    setIsLoading(true);
    // Force re-render by updating streamUrl with timestamp
    const newStreamUrl = `${streamUrl}?t=${Date.now()}`;
    if (videoRef.current) {
      videoRef.current.src = newStreamUrl;
    }
  };

  return (
    <div className="camera-stream-container" style={{ width, height }}>
      <div className="camera-header">
        <h4 className="camera-title">{cameraName}</h4>
        <div className="camera-status">
          {isLoading && <span className="status-loading">⏳ Đang tải...</span>}
          {isPlaying && <span className="status-playing">🔴 Đang phát</span>}
          {error && <span className="status-error">❌ {error}</span>}
        </div>
      </div>
      
      <div className="video-wrapper" style={{ height: 'calc(100% - 60px)' }}>
        <video
          ref={videoRef}
          controls={controls}
          autoPlay={autoplay}
          muted={autoplay} // Required for autoplay in most browsers
          playsInline
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#000',
            objectFit: 'cover'
          }}
        />
        
        {isLoading && (
          <div className="video-overlay loading-overlay">
            <div className="loading-spinner"></div>
            <p>Đang kết nối camera...</p>
          </div>
        )}
        
        {error && (
          <div className="video-overlay error-overlay">
            <p>{error}</p>
            <div className="mt-3 space-y-2">
              <button 
                onClick={handleRetry} 
                className="retry-button"
              >
                🔄 Thử lại
              </button>
              <div className="text-xs text-gray-300">
                <p>• Kiểm tra MediaMTX server đã chạy chưa</p>
                <p>• Kiểm tra camera có trực tuyến không</p>
                <p>• Kiểm tra URL RTSP trong cấu hình</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraStream; 