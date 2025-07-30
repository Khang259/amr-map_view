import React, { useState } from 'react';
import CameraStream from './CameraStream';

const CameraGrid = ({ cameras = [], mediamtxUrl = 'http://localhost:8888' }) => {
  const [selectedCamera, setSelectedCamera] = useState(null);




  const getCameraStreamUrl = (cameraId) => {
    return `${mediamtxUrl}/${cameraId}/index.m3u8`;
  };

  // Tính toán layout ma trận động dựa trên số camera
  const getMatrixLayout = () => {
    const count = cameras.length;
  
    if (count <= 4) {
      return { rows: 2, cols: 2, className: 'grid-cols-2' }; // ✅ Giữ cố định 2x2
    } else if (count <= 6) {
      return { rows: 2, cols: 3, className: 'grid-cols-3' };
    } else if (count <= 9) {
      return { rows: 3, cols: 3, className: 'grid-cols-3' };
    } else {
      const cols = 4;
      const rows = Math.ceil(count / cols);
      return { rows, cols, className: 'grid-cols-4' };
    }
  };
  

  const matrixLayout = getMatrixLayout();

  if (selectedCamera) {
    // Fullscreen view
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold">{selectedCamera.name}</h3>
          <button
            onClick={() => setSelectedCamera(null)}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            ✕ Đóng
          </button>
        </div>
        <div className="flex-1">
          <CameraStream
            streamUrl={getCameraStreamUrl(selectedCamera.id)}
            cameraName={selectedCamera.name}
            width="100%"
            height="100%"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="camera-grid-container">
      {/* Controls */}
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold">Camera Monitoring ({cameras.length})</h3>
        <div className="text-sm text-gray-600">
          Layout: {matrixLayout.rows}×{matrixLayout.cols} Matrix
        </div>
      </div>

      {/* Camera Grid */}
      {cameras.length === 0 ? (
        <div className="text-center p-8 bg-gray-100 rounded-lg">
          <p className="text-gray-600">Chưa có camera nào được cấu hình</p>
          <p className="text-sm text-gray-500 mt-2">
            Hãy thêm URL RTSP camera vào cấu hình
          </p>
        </div>
      ) : (
        <div 
          className="grid gap-4"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${matrixLayout.cols}, 1fr)`,
            gap: '16px'
          }}
        >
          {cameras.map((camera) => (
            <div
              key={camera.id}
              className="relative bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedCamera(camera)}
            >
              <CameraStream
                streamUrl={getCameraStreamUrl(camera.id)}
                cameraName={camera.name}
                height="280px"
              />
              <div className="absolute top-2 right-2">
                <button className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700">
                  🔍 Phóng to
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Status Info */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm">
        <p><strong>MediaMTX Server:</strong> {mediamtxUrl}</p>
        <p><strong>Stream Format:</strong> HLS (.m3u8)</p>
        <p><strong>Tip:</strong> Nhấn vào camera để xem toàn màn hình</p>
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-yellow-800 text-xs">
            <strong>Lưu ý:</strong> Đảm bảo MediaMTX server đang chạy và camera đã được cấu hình đúng
          </p>
        </div>
      </div>
    </div>
  );
};

export default CameraGrid; 