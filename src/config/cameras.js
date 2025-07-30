// Cấu hình camera RTSP URLs
export const cameraConfig = {
  // URL của MediaMTX server
  mediamtxUrl: process.env.REACT_APP_MEDIAMTX_URL || 'http://localhost:8888',
  
  // Danh sách camera
  cameras: [
    {
      id: 'cam1',
      name: 'Camera Cấp hàng AE',
      rtspUrl: 'rtsp://admin:Soncave1!@192.168.1.31:554/streaming/channels/102',
      location: 'Lối vào kho',
      description: 'Camera giám sát lối vào chính'
    },
    {
      id: 'cam2', 
      name: 'Camera trả hàng AE',
      rtspUrl: 'rtsp://admin:Soncave1!@192.168.1.30:554/streaming/channels/102',
      location: 'Khu vực lưu trữ',
      description: 'Camera giám sát khu vực lưu trữ hàng hóa'
    },
    {
      id: 'cam3',
      name: 'Camera Chưa đặt tên',
      rtspUrl: 'rtsp://admin:Soncave1!@192.168.1.29:554/streaming/channels/101',
      location: 'Khu vực robot hoạt động',
      description: 'Camera theo dõi robot AMR'
    },
    {
      id: 'cam4',
      name: 'Camera Cấp trả xe trống',
      rtspUrl: 'rtsp://admin:Soncave1!@192.168.1.28:554/streaming/channels/101',
      location: 'Trạm sạc',
      description: 'Camera giám sát trạm sạc robot'
    }
  ]
};

// Helper functions
export const getCameraById = (id) => {
  return cameraConfig.cameras.find(camera => camera.id === id);
};

export const getActiveCameras = () => {
  return cameraConfig.cameras.filter(camera => camera.rtspUrl);
};

export const getCameraStreamUrl = (cameraId) => {
  return `${cameraConfig.mediamtxUrl}/${cameraId}/index.m3u8`;
};

 