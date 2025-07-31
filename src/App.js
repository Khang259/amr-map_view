import React, { useRef, useEffect, useState } from 'react';
import './App.css';
import CameraGrid from './components/CameraGrid';
import { cameraConfig } from './config/cameras';
import useDrawMap from './hooks/useDrawMap';
import useFileImport from './hooks/useFileImport';
import useMapControls from './hooks/useMapControls';

const AMRWarehouseMap = () => {
  const canvasRef = useRef(null);
  const [mapData, setMapData] = useState(null);
  const [securityConfig, setSecurityConfig] = useState(null);
  const [robotPosition, setRobotPosition] = useState({ x: 49043, y: 74172, angle: 0 });
  const [selectedAvoidanceMode, setSelectedAvoidanceMode] = useState(1);
  const [showNodes, setShowNodes] = useState(true);
  const [showPaths, setShowPaths] = useState(true);
  const [showChargeStations, setShowChargeStations] = useState(true);
  const [amrImage, setAmrImage] = useState(null); // State to hold the loaded AMR image
  
  // Node customization states
  const [nodeRadius, setNodeRadius] = useState(100);
  const [nodeStrokeWidth, setNodeStrokeWidth] = useState(20);
  const [nodeFontSize, setNodeFontSize] = useState(500);
  const [showNodeShadow, setShowNodeShadow] = useState(true);
  const [showNodeGradient, setShowNodeGradient] = useState(false);

  // Custom hooks
  const drawMap = useDrawMap();
  const { loading, error, mapFileName, securityFileName, handleFileImport } = useFileImport();
  const { 
    scale, offset, rotation, mirrorX, mirrorY, setOffset,
    handleZoom, handleReset, handleRotate, handleMirrorX, handleMirrorY 
  } = useMapControls();

  // Camera and tab management states
  const [activeTab, setActiveTab] = useState('map');
  const [cameras, setCameras] = useState(cameraConfig.cameras);
  const [useRealCameras, setUseRealCameras] = useState(true);

  // File input refs
  const mapFileInputRef = useRef(null);
  const securityFileInputRef = useRef(null);

  // Load AMR image once when the component mounts
  useEffect(() => {
    const img = new Image();
    img.src = '/icon/amr.png'; // Path to the image in the public folder
    img.onload = () => {
      setAmrImage(img);
    };
    img.onerror = () => {
      console.error("Failed to load AMR robot image.");
      // Optionally set an error state or use a fallback drawing
    };
  }, []); // Empty dependency array means it runs once on mount

  const handleFileImportWrapper = (file, type) => {
    handleFileImport(file, type, setMapData, setSecurityConfig, setSelectedAvoidanceMode);
  };

  const handleMapFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileImportWrapper(file, 'map');
    }
  };

  const handleSecurityFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileImportWrapper(file, 'security');
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !mapData) return;
    
    const ctx = canvas.getContext('2d');
    drawMap(ctx, mapData, securityConfig, offset, scale, rotation, mirrorX, mirrorY, robotPosition, showNodes, showPaths, showChargeStations, amrImage, selectedAvoidanceMode, nodeRadius, nodeStrokeWidth, nodeFontSize);
  }, [mapData, securityConfig, drawMap, offset, scale, rotation, mirrorX, mirrorY, robotPosition, showNodes, showPaths, showChargeStations, amrImage, selectedAvoidanceMode, nodeRadius, nodeStrokeWidth, nodeFontSize]);

  return (
    <>
      <img src="/icon/thado.png" alt="THADO ROBOT Logo" className="amr-logo" />
      <div className="w-full max-w-7xl mx-auto bg-gray-50 rounded-lg shadow-lg" style={{position: 'relative'}}>
        <div className="header-title">AMR Warehouse Control Center</div>
        <div className="header-desc">Monitoring of AMR robots and security cameras</div>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button
            className={`tab-button ${activeTab === 'map' ? 'active' : ''}`}
            onClick={() => setActiveTab('map')}
          >
            🗺️ Map View
          </button>
          <button
            className={`tab-button ${activeTab === 'camera' ? 'active' : ''}`}
            onClick={() => setActiveTab('camera')}
          >
            📹 Camera View
          </button>
        </div>

        {activeTab === 'map' && (
          <div className="fade-in">
            <div className="mb-4 flex flex-wrap justify-between items-center gap-4">
              <div className="flex gap-2 flex-wrap">
                <button 
                  onClick={() => handleZoom(1)}
                   className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
                >
                  <img src="/icon/zoom_in.png" alt="Zoom In" className="w-6 h-6" />
                  
                </button>
                <button 
                  onClick={() => handleZoom(-1)}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
                >
                  <img src="/icon/zoom_out.png" alt="Zoom Out" className="w-6 h-6" />
                  
                </button>
                <button 
                  onClick={() => handleRotate(1)}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
                >
                  <img src="/icon/rotate_cw.png" alt="Rotate CW" className="w-6 h-6" />
                </button>
                <button 
                  onClick={() => handleRotate(-1)}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
                  >
                    <img src="/icon/rotate_ccw.png" alt="Rotate CCW" className="w-6 h-6" />
                </button>
                <button 
                  onClick={handleMirrorX}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
                  >
                    <img src="/icon/mirro_x.png" alt="Mirror X" className="w-6 h-6" />
                </button>
                <button 
                  onClick={handleMirrorY}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
                  >
                    <img src="/icon/mirro_y.png" alt="Mirror Y" className="w-6 h-6" />
                </button>
                <button 
                  onClick={handleReset}
                  className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div className="map-area-label">MAP AREA</div>
                <div className="map-area-box">
                  <canvas
                    ref={canvasRef}
                    width={1000}
                    height={600}
                    className="block w-full h-auto bg-white cursor-move"
                    onMouseDown={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const startX = e.clientX - rect.left - offset.x;
                      const startY = e.clientY - rect.top - offset.y;
                      const handleMouseMove = (e) => {
                        setOffset({
                          x: e.clientX - rect.left - startX,
                          y: e.clientY - rect.top - startY
                        });
                      };
                      const handleMouseUp = () => {
                        document.removeEventListener('mousemove', handleMouseMove);
                        document.removeEventListener('mouseup', handleMouseUp);
                      };
                      document.addEventListener('mousemove', handleMouseMove);
                      document.addEventListener('mouseup', handleMouseUp);
                    }}
                  />
                </div>
                <div className="legend">
                  <span><span className="legend-icon" style={{background:'#22c55e'}}></span> Regular Waypoint</span>
                  <span><span className="legend-icon" style={{background:'#ef4444'}}></span> Special Node</span>
                  <span><span className="legend-icon" style={{background:'#facc15'}}></span> Charge Station</span>
                  <span><span className="legend-icon" style={{background:'#3b82f6', borderRadius:'0.25em'}}></span> AMR Robot</span>
                  <span><span style={{fontSize:'1.2em'}}>⚡</span> Charging Symbol</span>
                  <span><span className="legend-path"></span> Path</span>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <div className="status-card">
                  <h3 className="font-semibold mb-2">Robot Status</h3>
                  <p><strong>Position:</strong> ({Math.round(robotPosition.x/1000)}k, {Math.round(robotPosition.y/1000)}k)</p>
                  <p><strong>Orientation:</strong> {(robotPosition.angle * 180 / Math.PI).toFixed(1)}°</p>
                  <p><strong>Scale:</strong> {(scale * 1000).toFixed(2)}‰</p>
                </div>
                <div className="file-card">
                  <h3 className="font-semibold mb-2">Current Files</h3>
                  <p className="text-sm"><strong>Map:</strong> {mapFileName || 'Chưa tải file'}</p>
                  <p className="text-sm"><strong>Security:</strong> {securityFileName || 'Chưa tải file'}</p>
                  <p className="text-sm"><strong>Status:</strong> {loading ? 'Đang tải...' : (mapData ? 'Sẵn sàng' : 'Chưa có dữ liệu')}</p>
                </div>
                <div className="display-card">
                  <h3 className="font-semibold mb-2">Display Options</h3>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={showNodes} onChange={e => setShowNodes(e.target.checked)} className="rounded" /> Show Waypoints
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={showPaths} onChange={e => setShowPaths(e.target.checked)} className="rounded" /> Show Paths
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={showChargeStations} onChange={e => setShowChargeStations(e.target.checked)} className="rounded" /> Show Charge Stations
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <h3 className="text-lg font-semibold mb-3 text-gray-700">Import Map Files</h3>
              {loading && (
                <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-blue-700">Loading file...</span>
                </div>
              )}
              {error && (
                <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded">
                  <span className="text-red-700">{error}</span>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Map Data (compress.json)
                  </label>
                  <input
                    ref={mapFileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleMapFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {mapFileName && (
                    <p className="text-xs text-green-600">✓ {mapFileName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Security Config (security.json)
                  </label>
                  <input
                    ref={securityFileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleSecurityFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                  />
                  {securityFileName && (
                    <p className="text-xs text-green-600">✓ {securityFileName}</p>
                  )}
                </div>

              </div>
              <div className="mt-3 p-3 bg-gray-50 rounded text-xs text-gray-600">
                <p><strong>Expected file formats:</strong></p>
                <p><strong>Map file:</strong> JSON with nodeKeys, lineKeys, nodeArr, lineArr fields</p>
                <p><strong>Security file:</strong> JSON with AvoidSceneSet field containing avoidance configurations</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'camera' && (
          <div className="fade-in">
            <div className="mb-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold">Camera Management</h3>
                <div className="connection-status connected">
                  📹 Real Cameras
                </div>
              </div>
            </div>

            <CameraGrid
              cameras={cameras}
              mediamtxUrl={cameraConfig.mediamtxUrl}
            />

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Camera Setup Instructions</h3>
              <div className="text-sm space-y-2">
                <p><strong>1. Install MediaMTX:</strong> Download từ https://github.com/bluenviron/mediamtx/releases</p>
                <p><strong>2. Configure mediamtx.yml:</strong> Cập nhật RTSP URLs của camera trong file cấu hình</p>
                <p><strong>3. Start MediaMTX:</strong> Chạy <code>./mediamtx</code> trong terminal</p>
                <p><strong>4. Update camera config:</strong> Chỉnh sửa file <code>src/config/cameras.js</code> với thông tin camera thực tế</p>
                <div className="mt-3 p-3 bg-white rounded border">
                  <strong>MediaMTX Status:</strong> {cameraConfig.mediamtxUrl}
                  <br />
                  <strong>Camera Count:</strong> {cameras.length}
                  <br />
                  <strong>Mode:</strong> Production
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AMRWarehouseMap; 