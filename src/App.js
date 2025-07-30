import React, { useRef, useEffect, useState, useCallback } from 'react';
import './App.css';
import CameraGrid from './components/CameraGrid';
import { cameraConfig } from './config/cameras';

const AMRWarehouseMap = () => {
  const canvasRef = useRef(null);
  const [mapData, setMapData] = useState(null);
  const [securityConfig, setSecurityConfig] = useState(null);
  const [robotPosition, setRobotPosition] = useState({ x: 49043, y: 74172, angle: 0 });
  const [selectedAvoidanceMode, setSelectedAvoidanceMode] = useState(1);
  const [scale, setScale] = useState(0.008);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [showNodes, setShowNodes] = useState(true);
  const [showPaths, setShowPaths] = useState(true);
  const [showChargeStations, setShowChargeStations] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mapFileName, setMapFileName] = useState('');
  const [securityFileName, setSecurityFileName] = useState('');
  const [amrImage, setAmrImage] = useState(null); // State to hold the loaded AMR image
  
  // Node customization states
  const [nodeRadius, setNodeRadius] = useState(100);
  const [nodeStrokeWidth, setNodeStrokeWidth] = useState(20);
  const [nodeFontSize, setNodeFontSize] = useState(500);
  const [showNodeShadow, setShowNodeShadow] = useState(true);
  const [showNodeGradient, setShowNodeGradient] = useState(false);

  // Map transformation states
  const [rotation, setRotation] = useState(0);
  const [mirrorX, setMirrorX] = useState(false);
  const [mirrorY, setMirrorY] = useState(false);

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

  const handleFileImport = (file, type) => {
    if (!file) return;
    setLoading(true);
    setError(null);

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);
        
        if (type === 'map') {
          if (!jsonData.nodeKeys || !jsonData.lineKeys || !jsonData.nodeArr) {
            throw new Error('Invalid map file format. Missing required fields: nodeKeys, lineKeys, or nodeArr');
          }
          setMapData(jsonData);
          setMapFileName(file.name);
          setScale(0.008);
          setOffset({ x: 0, y: 0 });
        } else if (type === 'security') {
          if (!jsonData.AvoidSceneSet) {
            throw new Error('Invalid security file format. Missing AvoidSceneSet field');
          }
          setSecurityConfig(jsonData);
          setSecurityFileName(file.name);
          if (jsonData.AvoidSceneSet.length > 0) {
            setSelectedAvoidanceMode(jsonData.AvoidSceneSet[0].id);
          }
        }
      } catch (error) {
        setError(`Error parsing ${type} file: ${error.message}`);
        console.error('File parsing error:', error);
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      setError(`Error reading ${type} file`);
      setLoading(false);
    };

    reader.readAsText(file);
  };

  const handleMapFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileImport(file, 'map');
    }
  };

  const handleSecurityFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileImport(file, 'security');
    }
  };





  // Parse nodes từ nodeArr
  const parseNodes = useCallback((nodeArr, nodeKeys) => {
    return nodeArr.map(nodeData => {
      const node = {};
      nodeKeys.forEach((key, index) => {
        node[key] = nodeData[index];
      });
      return node;
    });
  }, []);

  // Parse lines từ lineArr  
  const parseLines = useCallback((lineArr, lineKeys) => {
    return lineArr.map(lineData => {
      const line = {};
      lineKeys.forEach((key, index) => {
        line[key] = lineData[index];
      });
      return line;
    });
  }, []);

  const drawGrid = useCallback((ctx, data) => {
    const gridSize = 10000;
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 300;
    
    for (let x = 0; x <= data.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, data.height);
      ctx.stroke();
    }
    
    for (let y = 0; y <= data.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(data.width, y);
      ctx.stroke();
    }
  }, []);

  const drawPaths = useCallback((ctx, data) => {
    const lines = parseLines(data.lineArr, data.lineKeys);
    
    ctx.save();
    ctx.lineWidth = 500;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowColor = "rgba(0,0,0,0.3)";
    ctx.shadowBlur = 12;

    lines.forEach(line => {
      if (line.path && line.path.length > 1) {
        // Gradient cho mỗi path
        const [x1, y1] = line.path[0];
        const [x2, y2] = line.path[line.path.length - 1];
        const grad = ctx.createLinearGradient(x1, y1, x2, y2);
        grad.addColorStop(0, "#74b9ff");
        grad.addColorStop(1, "#0984e3");
        ctx.strokeStyle = grad;

        ctx.beginPath();
        ctx.moveTo(line.path[0][0], line.path[0][1]);
        if (line.path.length === 2) {
          ctx.lineTo(line.path[1][0], line.path[1][1]);
        } else {
          for (let i = 1; i < line.path.length - 2; i++) {
            const xc = (line.path[i][0] + line.path[i + 1][0]) / 2;
            const yc = (line.path[i][1] + line.path[i + 1][1]) / 2;
            ctx.quadraticCurveTo(line.path[i][0], line.path[i][1], xc, yc);
          }
          ctx.quadraticCurveTo(
            line.path[line.path.length - 2][0], line.path[line.path.length - 2][1],
            line.path[line.path.length - 1][0], line.path[line.path.length - 1][1]
          );
        }
        ctx.stroke();
      }
    });
    ctx.restore();
  }, [parseLines]);

  const drawNodes = useCallback((ctx, data) => {
    const nodes = parseNodes(data.nodeArr, data.nodeKeys);
    
    nodes.forEach(node => {
      ctx.beginPath();
      ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI);
      
      switch (node.type) {
        case 0:
          ctx.fillStyle = '#00b894';
          break;
        case 6:
          ctx.fillStyle = '#e17055';
          break;
        default:
          ctx.fillStyle = '#636e72';
      }
      
      ctx.fill();
      ctx.strokeStyle = '#2d3436';
      ctx.lineWidth = nodeStrokeWidth;
      ctx.stroke();
      
      ctx.fillStyle = '#2d3436';
      ctx.font = `${nodeFontSize}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText(node.name.slice(-3), node.x, node.y - nodeRadius - 200);
    });
  }, [parseNodes, nodeRadius, nodeStrokeWidth, nodeFontSize]);

  const drawChargeStations = useCallback((ctx, data) => {
    if (!data.chargeCoor) return;
    
    const nodes = parseNodes(data.nodeArr, data.nodeKeys);
    const nodeMap = {};
    nodes.forEach(node => {
      nodeMap[node.name] = node;
    });

    data.chargeCoor.forEach(([nodeId, offset]) => {
      const node = nodeMap[nodeId];
      if (node) {
        ctx.fillStyle = '#ffeaa7';
        ctx.beginPath();
        ctx.arc(node.x, node.y, 1200, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.fillStyle = '#fdcb6e';
        ctx.font = '2000px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('⚡', node.x, node.y + 600);
      }
    });
  }, [parseNodes]);

  const drawRobot = useCallback((ctx, robot, security, amrImg) => {
    ctx.save();
    ctx.translate(robot.x, robot.y);
    ctx.rotate(robot.angle);
    
    const currentConfig = security?.AvoidSceneSet?.find(scene => scene.id === selectedAvoidanceMode);
    const avoidanceRadius = currentConfig?.config?.noload?.forward || 500;
    
    // Draw avoidance zone
    ctx.strokeStyle = 'rgba(255, 107, 107, 0.3)';
    ctx.fillStyle = 'rgba(255, 107, 107, 0.1)';
    ctx.lineWidth = 200;
    ctx.beginPath();
    ctx.arc(0, 0, avoidanceRadius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    
    // Draw AMR robot image if loaded, otherwise fallback to rectangle
    if (amrImg) {
      // Calculate image size (adjust as needed)
      const imageSize = 3000; // Same size as the original rectangle
      ctx.drawImage(amrImg, -imageSize/2, -imageSize/2, imageSize, imageSize);
    } else {
      // Fallback to original rectangle drawing
      ctx.fillStyle = '#0984e3';
      ctx.fillRect(-1500, -1000, 3000, 2000);
      
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(1200, 0);
      ctx.lineTo(800, -600);
      ctx.lineTo(800, 600);
      ctx.closePath();
      ctx.fill();
    }
    
    ctx.restore();
    
    ctx.fillStyle = '#2d3436';
    ctx.font = '1000px Arial'; // Giảm từ 1000 xuống 500
    ctx.textAlign = 'center';
    ctx.fillText(`(${Math.round(robot.x/1000)}k, ${Math.round(robot.y/1000)}k)`, robot.x, robot.y - 1500); // Điều chỉnh vị trí
    
    if (currentConfig) {
      ctx.fillStyle = '#e17055';
      ctx.font = '800px Arial'; // Thêm font size cho config name
      ctx.fillText(currentConfig.name, robot.x, robot.y + 2000); // Điều chỉnh vị trí
    }
  }, [selectedAvoidanceMode]);

  const drawMap = useCallback((ctx, data, security) => {
    if (!data) return;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    ctx.save();
    ctx.translate(offset.x + ctx.canvas.width/2, offset.y + ctx.canvas.height/2);
    ctx.scale(scale, scale);
    ctx.translate(-data.width/2, -data.height/2);

    // Apply transformations
    if (rotation !== 0) {
      ctx.rotate((rotation * Math.PI) / 180);
    }
    if (mirrorX) {
      ctx.scale(-1, 1);
    }
    if (mirrorY) {
      ctx.scale(1, -1);
    }

    drawGrid(ctx, data);
    
    if (showPaths) {
      drawPaths(ctx, data);
    }
    
    if (showNodes) {
      drawNodes(ctx, data);
    }
    
    if (showChargeStations) {
      drawChargeStations(ctx, data);
    }
    
    drawRobot(ctx, robotPosition, security, amrImage);
    
    ctx.restore();
  }, [drawGrid, drawPaths, drawNodes, drawChargeStations, drawRobot, offset, scale, showNodes, showPaths, showChargeStations, robotPosition, rotation, mirrorX, mirrorY, amrImage]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !mapData) return;
    
    const ctx = canvas.getContext('2d');
    drawMap(ctx, mapData, securityConfig);
  }, [mapData, securityConfig, drawMap]);

  const handleZoom = (direction) => {
    setScale(prev => {
      const newScale = direction > 0 ? prev * 1.2 : prev / 1.2;
      return Math.max(0.001, Math.min(0.05, newScale));
    });
  };

  const handleReset = () => {
    setScale(0.008);
    setOffset({ x: 0, y: 0 });
    setRotation(0);
    setMirrorX(false);
    setMirrorY(false);
  };

  const handleRotate = (direction) => {
    setRotation(prev => {
      const newRotation = prev + (direction * 90);
      return newRotation % 360;
    });
  };

  const handleMirrorX = () => {
    setMirrorX(prev => !prev);
  };

  const handleMirrorY = () => {
    setMirrorY(prev => !prev);
  };

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