import React, { useRef, useEffect, useState } from 'react';
import './App.css';
import CameraGrid from './components/CameraGrid';
import LeafletMap from './components/LeafletMap';
import { cameraConfig } from './config/cameras';
import useFileImport from './hooks/useFileImport';
import useLeafletMapControls from './hooks/useLeafletMapControls';

const AMRWarehouseMap = () => {
  const [mapData, setMapData] = useState(null);
  const [securityConfig, setSecurityConfig] = useState(null);
  const [robotPosition, setRobotPosition] = useState({ x: 49043, y: 74172, angle: 0 });
  const [selectedAvoidanceMode, setSelectedAvoidanceMode] = useState(1);
  const [showNodes, setShowNodes] = useState(true);
  const [showPaths, setShowPaths] = useState(true);
  const [showChargeStations, setShowChargeStations] = useState(true);
  
  // Node customization states
  const [nodeRadius, setNodeRadius] = useState(100);
  const [nodeStrokeWidth, setNodeStrokeWidth] = useState(20);
  const [nodeFontSize, setNodeFontSize] = useState(500);

  // Custom hooks
  const { loading, error, mapFileName, securityFileName, handleFileImport } = useFileImport();
  const { 
    mapInstance,
    handleMapReady,
    handleReset
  } = useLeafletMapControls();

  // Tự động nạp lại dữ liệu từ localStorage khi load trang
  useEffect(() => {
    const mapDataStr = localStorage.getItem('mapData');
    const securityDataStr = localStorage.getItem('securityData');
    const mapFileNameStr = localStorage.getItem('mapFileName');
    const securityFileNameStr = localStorage.getItem('securityFileName');
    if (mapDataStr) {
      try {
        setMapData(JSON.parse(mapDataStr));
      } catch {}
    }
    if (securityDataStr) {
      try {
        setSecurityConfig(JSON.parse(securityDataStr));
      } catch {}
    }
    if (mapFileNameStr) {
      // Nếu muốn hiển thị tên file đã lưu
      // setMapFileName(mapFileNameStr);
    }
    if (securityFileNameStr) {
      // setSecurityFileName(securityFileNameStr);
    }
  }, []);

  // Camera and tab management states
  const [activeTab, setActiveTab] = useState('map');
  const [cameras, setCameras] = useState(cameraConfig.cameras);
  const [useRealCameras, setUseRealCameras] = useState(true);

  // File input refs
  const mapFileInputRef = useRef(null);
  const securityFileInputRef = useRef(null);

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



  return (
    <div className="App">
      <img src="/icon/thado.png" alt="THADO ROBOT Logo" className="amr-logo" />
      <div className="w-full bg-gray-50 rounded-lg shadow-lg" style={{position: 'relative', margin: '0', padding: '0 2.5rem'}}>
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
              </div>
            </div>

            <div className="flex flex-wrap md:flex-nowrap gap-6 items-start">
              {/* Sidebar trái: Import Map Files và các card */}
              <div className="w-full md:w-1/6 order-2 md:order-1">
                <div className="flex flex-col gap-4">
                  
                  <div className="p-3 bg-white rounded-lg border-2 border-dashed border-gray-300 mt-10">
                    <h3 className="text-base font-semibold mb-2 text-gray-700">Import Map Files</h3>
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
                    <div>
                      <div className="space-y-2 mb-3">
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
              {/* Phần map bên phải */}
              <div className="w-full md:w-5/6 order-1 md:order-2">
                <div className="flex items-center justify-between mb-2">
                  {/* <div className="map-area-label mb-0">MAP AREA</div> */}
                  <div className="flex-1 flex justify-end">
                    <button 
                      onClick={handleReset}
                      className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 ml-4"
                    >
                      Reset
                    </button>
                  </div>
                </div>
                <div className="map-area-box">
                  <LeafletMap
                    mapData={mapData}
                    securityConfig={securityConfig}
                    robotPosition={robotPosition}
                    showNodes={showNodes}
                    showPaths={showPaths}
                    showChargeStations={showChargeStations}
                    selectedAvoidanceMode={selectedAvoidanceMode}
                    nodeRadius={nodeRadius}
                    nodeStrokeWidth={nodeStrokeWidth}
                    nodeFontSize={nodeFontSize}
                    onMapReady={handleMapReady}
                  />
                </div>
                <div className="legend">
                  <span><span className="legend-icon" style={{background:'#34d399'}}></span> Regular Waypoint</span>
                  <span><span className="legend-icon" style={{background:'#f87171'}}></span> Special Node</span>
                  <span><span className="legend-icon" style={{background:'#fcd34d'}}></span> Charge Station</span>
                  <span><span className="legend-icon" style={{background:'#60a5fa', borderRadius:'0.25em'}}></span> AMR Robot</span>
                  <span><span style={{fontSize:'1.2em'}}>⚡</span> Charging Symbol</span>
                  <span><span className="legend-path"></span> Path</span>
                </div>
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
    </div>
  );
};

export default AMRWarehouseMap; 