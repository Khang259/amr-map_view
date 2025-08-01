import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Helper function to create Catmull-Rom spline for smooth curves
const catmullRomSpline = (p0, p1, p2, p3, t) => {
  const v0 = (p2[0] - p0[0]) * 0.5;
  const v1 = (p3[0] - p1[0]) * 0.5;
  const v2 = (p2[1] - p0[1]) * 0.5;
  const v3 = (p3[1] - p1[1]) * 0.5;
  
  const t2 = t * t;
  const t3 = t2 * t;
  
  const y = p1[0] + v0 * t + (3 * (p2[0] - p1[0]) - 2 * v0 - v1) * t2 + (2 * (p1[0] - p2[0]) + v0 + v1) * t3;
  const x = p1[1] + v2 * t + (3 * (p2[1] - p1[1]) - 2 * v2 - v3) * t2 + (2 * (p1[1] - p2[1]) + v2 + v3) * t3;
  
  return [y, x];
};

// Helper function to smooth path coordinates using Catmull-Rom spline
const smoothPathCoordinates = (coordinates, tension = 0.5, numSegments = 10) => {
  if (coordinates.length < 2) return coordinates;
  
  // Nếu chỉ có 2 điểm, tạo thêm control points
  if (coordinates.length === 2) {
    const [start, end] = coordinates;
    const midPoint = [
      (start[0] + end[0]) / 2,
      (start[1] + end[1]) / 2
    ];
    
    // Tạo offset nhẹ cho điểm giữa để tạo đường cong
    const perpVector = [-(end[1] - start[1]), end[0] - start[0]];
    const perpLength = Math.sqrt(perpVector[0] * perpVector[0] + perpVector[1] * perpVector[1]);
    const offset = perpLength * 0.05 * tension;
    
    midPoint[0] += (perpVector[0] / perpLength) * offset;
    midPoint[1] += (perpVector[1] / perpLength) * offset;
    
    coordinates = [start, midPoint, end];
  }
  
  const smoothed = [];
  
  // Thêm điểm đầu
  smoothed.push(coordinates[0]);
  
  for (let i = 0; i < coordinates.length - 1; i++) {
    const p0 = coordinates[Math.max(0, i - 1)];
    const p1 = coordinates[i];
    const p2 = coordinates[i + 1];
    const p3 = coordinates[Math.min(coordinates.length - 1, i + 2)];
    
    // Tạo các điểm nội suy giữa p1 và p2
    for (let j = 1; j <= numSegments; j++) {
      const t = j / numSegments;
      const point = catmullRomSpline(p0, p1, p2, p3, t * tension);
      smoothed.push(point);
    }
  }
  
  // Thêm điểm cuối
  smoothed.push(coordinates[coordinates.length - 1]);
  
  return smoothed;
};

const LeafletMap = ({
  mapData,
  securityConfig,
  robotPosition,
  showNodes,
  showPaths,
  showChargeStations,
  selectedAvoidanceMode,
  nodeRadius = 50,
  nodeStrokeWidth = 10,
  nodeFontSize = 300,
  onMapReady
}) => {
  const [showNodeLabels, setShowNodeLabels] = useState(true);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersRef = useRef({
    grid: null,
    paths: null,
    nodes: null,
    nodeLabels: null,
    chargeStations: null,
    robot: null
  });

  useEffect(() => {
    if (!mapRef.current || !mapData) return;

    console.log('Initializing Leaflet map with data:', {
      width: mapData.width,
      height: mapData.height,
      nodeCount: mapData.nodeArr?.length || 0,
      lineCount: mapData.lineArr?.length || 0
    });

    // Initialize map with CRS.Simple for custom coordinate system
    const map = L.map(mapRef.current, {
      crs: L.CRS.Simple,
      minZoom: -10, // Tăng minZoom để có thể thu nhỏ nhiều hơn nữa
      maxZoom: 4,
      zoomControl: false
    });

    // Set map bounds based on data dimensions with padding
    const bounds = [
      [0, 0],
      [mapData.height, mapData.width]
    ];
    
    // Fit bounds với padding để có thể nhìn thấy toàn bộ map
    map.fitBounds(bounds, {
      padding: [20, 20], // Thêm padding 20px
      maxZoom: 0 // Giới hạn zoom tối đa khi fit bounds
    });

    mapInstanceRef.current = map;

    // Add zoom control to top right
    L.control.zoom({
      position: 'topright'
    }).addTo(map);

    // Add custom toggle button for node labels
    const ToggleLabelsControl = L.Control.extend({
      options: {
        position: 'topright'
      },
      onAdd: function (map) {
        const container = L.DomUtil.create('div', 'leaflet-control leaflet-bar');
        const button = L.DomUtil.create('a', '', container);
        button.href = '#';
        button.title = 'Bật/tắt tên nodes';
        button.innerHTML = '<span style="font-weight: bold; font-size: 12px;">ABC</span>';
        button.style.width = '30px';
        button.style.height = '30px';
        button.style.lineHeight = '30px';
        button.style.textAlign = 'center';
        button.style.textDecoration = 'none';
        button.style.color = '#333';
        
        L.DomEvent.on(button, 'click', function (e) {
          L.DomEvent.preventDefault(e);
          setShowNodeLabels(prev => !prev);
          if (button.style.textDecoration === 'line-through') {
            button.style.textDecoration = 'none';
            button.title = 'Ẩn tên nodes';
          } else {
            button.style.textDecoration = 'line-through';
            button.title = 'Hiện tên nodes';
          }
        });
        
        return container;
      }
    });
    
    new ToggleLabelsControl().addTo(map);

    if (onMapReady) {
      // Store map data reference for reset functionality
      map._mapData = mapData;
      onMapReady(map);
    }

    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [mapData, onMapReady]);

  // Update map data reference when mapData changes
  useEffect(() => {
    if (mapInstanceRef.current && mapData) {
      mapInstanceRef.current._mapData = mapData;
    }
  }, [mapData]);

  // Draw grid
  useEffect(() => {
    if (!mapInstanceRef.current || !mapData) return;

    // Remove existing grid layer
    if (layersRef.current.grid) {
      mapInstanceRef.current.removeLayer(layersRef.current.grid);
    }

    const gridLayer = L.layerGroup();
    
    // Draw grid lines with improved styling
    const gridSize = 10000; // 10k units
    const gridColor = '#e5e7eb';
    const gridWeight = 1.5;

    // Vertical lines
    for (let x = 0; x <= mapData.width; x += gridSize) {
      const line = L.polyline([[0, x], [mapData.height, x]], {
        color: gridColor,
        weight: gridWeight,
        opacity: 0.6,
        dashArray: '5, 10'
      });
      gridLayer.addLayer(line);
    }

    // Horizontal lines
    for (let y = 0; y <= mapData.height; y += gridSize) {
      const line = L.polyline([[y, 0], [y, mapData.width]], {
        color: gridColor,
        weight: gridWeight,
        opacity: 0.6,
        dashArray: '5, 10'
      });
      gridLayer.addLayer(line);
    }

    gridLayer.addTo(mapInstanceRef.current);
    layersRef.current.grid = gridLayer;
  }, [mapData]);

  // Draw paths
  useEffect(() => {
    if (!mapInstanceRef.current || !mapData || !showPaths) {
      if (layersRef.current.paths) {
        mapInstanceRef.current.removeLayer(layersRef.current.paths);
        layersRef.current.paths = null;
      }
      return;
    }

    // Remove existing paths layer
    if (layersRef.current.paths) {
      mapInstanceRef.current.removeLayer(layersRef.current.paths);
    }

    const pathsLayer = L.layerGroup();

    if (mapData.lineArr) {
      mapData.lineArr.forEach(line => {
        if (line.startNode && line.endNode) {
          const startNode = mapData.nodeArr.find(node => node.key === line.startNode);
          const endNode = mapData.nodeArr.find(node => node.key === line.endNode);
          
          if (startNode && endNode && 
              typeof startNode.x !== 'undefined' && typeof startNode.y !== 'undefined' &&
              typeof endNode.x !== 'undefined' && typeof endNode.y !== 'undefined') {
            
            // Use path data if available, otherwise draw straight line
            let pathCoordinates;
            if (line.path && Array.isArray(line.path) && line.path.length > 0) {
              // Convert path coordinates to Leaflet format [y, x]
              pathCoordinates = line.path.map(coord => [coord[1], coord[0]]);
            } else {
              // Fallback to straight line between nodes
              pathCoordinates = [
                [startNode.y, startNode.x],
                [endNode.y, endNode.x]
              ];
            }
            
            // Smooth the path coordinates for curved lines
            const smoothPath = smoothPathCoordinates(pathCoordinates);
            
            // Create path with gradient effect
            const pathShadow = L.polyline(smoothPath, {
              color: '#3b82f6',
              weight: 8,
              opacity: 0.2,
              className: 'path-shadow'
            });
            
            const path = L.polyline(smoothPath, {
              color: '#60a5fa',
              weight: 5,
              opacity: 0.8,
              lineCap: 'round',
              lineJoin: 'round',
              smoothFactor: 2.5,
              className: 'path-gradient'
            });
            
            pathsLayer.addLayer(pathShadow);
            pathsLayer.addLayer(path);
          }
        }
      });
    }

    pathsLayer.addTo(mapInstanceRef.current);
    layersRef.current.paths = pathsLayer;
  }, [mapData, showPaths]);

  // Draw nodes
  useEffect(() => {
    if (!mapInstanceRef.current || !mapData || !showNodes) {
      if (layersRef.current.nodes) {
        mapInstanceRef.current.removeLayer(layersRef.current.nodes);
        layersRef.current.nodes = null;
      }
      if (layersRef.current.nodeLabels) {
        mapInstanceRef.current.removeLayer(layersRef.current.nodeLabels);
        layersRef.current.nodeLabels = null;
      }
      return;
    }

    // Remove existing layers
    if (layersRef.current.nodes) {
      mapInstanceRef.current.removeLayer(layersRef.current.nodes);
    }
    if (layersRef.current.nodeLabels) {
      mapInstanceRef.current.removeLayer(layersRef.current.nodeLabels);
    }

    const nodesLayer = L.layerGroup();
    const nodeLabelsLayer = L.layerGroup();

    if (mapData.nodeArr) {
      console.log('Drawing nodes, count:', mapData.nodeArr.length);
      mapData.nodeArr.forEach((node, index) => {
        // Skip nodes without required properties
        if (!node || typeof node.x === 'undefined' || typeof node.y === 'undefined') {
          console.warn('Skipping node with missing coordinates:', node);
          return;
        }
        
        const isSpecial = node.type === 'special' || (node.key && node.key.includes('special'));
        const color = isSpecial ? '#f87171' : '#34d399';
        
        // Create node with shadow effect
        const nodeShadow = L.circle([node.y, node.x], {
          radius: nodeRadius + 3,
          fillColor: '#000000',
          color: 'transparent',
          weight: 0,
          opacity: 0,
          fillOpacity: 0.15,
          className: 'node-shadow'
        });
        
        const circle = L.circle([node.y, node.x], {
          radius: nodeRadius,
          fillColor: color,
          color: '#ffffff',
          weight: Math.min(nodeStrokeWidth, 2),
          opacity: 1,
          fillOpacity: 0.85
        });

        // Add node label with improved styling
        const label = L.divIcon({
          className: 'node-label',
          html: `<div style="
            background: rgba(255, 255, 255, 0.9); 
            border: 1.5px solid ${color}; 
            border-radius: 4px; 
            padding: 2px 6px; 
            font-size: ${Math.min(nodeFontSize / 30, 10)}px; 
            font-weight: 600; 
            color: ${color};
            white-space: nowrap;
            transform: translate(-50%, -50%);
            box-shadow: 0 1px 4px rgba(0,0,0,0.15);
          ">${node.key || 'Unknown'}</div>`,
          iconSize: [80, 20],
          iconAnchor: [40, 10]
        });

        const marker = L.marker([node.y, node.x], { icon: label });
        
        nodesLayer.addLayer(nodeShadow);
        nodesLayer.addLayer(circle);
        
        if (showNodeLabels) {
          nodeLabelsLayer.addLayer(marker);
        }
      });
    }

    nodesLayer.addTo(mapInstanceRef.current);
    layersRef.current.nodes = nodesLayer;
    
    if (showNodeLabels) {
      nodeLabelsLayer.addTo(mapInstanceRef.current);
      layersRef.current.nodeLabels = nodeLabelsLayer;
    }
  }, [mapData, showNodes, nodeRadius, nodeStrokeWidth, nodeFontSize, showNodeLabels]);

  // Draw charge stations
  useEffect(() => {
    if (!mapInstanceRef.current || !mapData || !showChargeStations) {
      if (layersRef.current.chargeStations) {
        mapInstanceRef.current.removeLayer(layersRef.current.chargeStations);
        layersRef.current.chargeStations = null;
      }
      return;
    }

    // Remove existing charge stations layer
    if (layersRef.current.chargeStations) {
      mapInstanceRef.current.removeLayer(layersRef.current.chargeStations);
    }

    const chargeStationsLayer = L.layerGroup();

    if (mapData.nodeArr) {
      mapData.nodeArr.forEach(node => {
        // Skip nodes without required properties
        if (!node || typeof node.x === 'undefined' || typeof node.y === 'undefined') {
          return;
        }
        
        if (node.type === 'charge' || (node.key && node.key.includes('charge'))) {
          // Create charge station with shadow effect
          const chargeShadow = L.circle([node.y, node.x], {
            radius: 65,
            fillColor: '#000000',
            color: 'transparent',
            weight: 0,
            opacity: 0,
            fillOpacity: 0.15
          });
          
          const circle = L.circle([node.y, node.x], {
            radius: 60, // Nhỏ hơn để phù hợp với nodes nhỏ hơn
            fillColor: '#fcd34d',
            color: '#ffffff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.85
          });

          // Add charging symbol with improved styling
          const chargeIcon = L.divIcon({
            className: 'charge-icon',
            html: `<div style="
              font-size: 20px; 
              color: #fcd34d; 
              text-shadow: 0 1px 4px rgba(0,0,0,0.5);
              filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));
            ">⚡</div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });

          const marker = L.marker([node.y, node.x], { icon: chargeIcon });
          
          chargeStationsLayer.addLayer(chargeShadow);
          chargeStationsLayer.addLayer(circle);
          chargeStationsLayer.addLayer(marker);
        }
      });
    }

    chargeStationsLayer.addTo(mapInstanceRef.current);
    layersRef.current.chargeStations = chargeStationsLayer;
  }, [mapData, showChargeStations]);

  // Draw robot
  useEffect(() => {
    if (!mapInstanceRef.current || !robotPosition) {
      if (layersRef.current.robot) {
        mapInstanceRef.current.removeLayer(layersRef.current.robot);
        layersRef.current.robot = null;
      }
      return;
    }

    // Remove existing robot layer
    if (layersRef.current.robot) {
      mapInstanceRef.current.removeLayer(layersRef.current.robot);
    }

    const robotLayer = L.layerGroup();

    // Create robot icon using AMR image with enhanced effects
    const robotIcon = L.divIcon({
      className: 'robot-icon',
      html: `<div style="
        width: 40px; 
        height: 40px; 
        display: flex; 
        align-items: center; 
        justify-content: center;
        transform: rotate(${robotPosition.angle * 180 / Math.PI}deg);
        filter: drop-shadow(0 4px 12px rgba(0,0,0,0.4));
      ">
        <img 
          src="/icon/amr.png" 
          alt="AMR Robot" 
          style="
            width: 100%; 
            height: 100%; 
            object-fit: contain;
            filter: drop-shadow(0 2px 8px rgba(0,0,0,0.5)) brightness(1.1);
          "
        />
      </div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    const robotMarker = L.marker([robotPosition.y, robotPosition.x], { 
      icon: robotIcon,
      zIndexOffset: 1000
    });

    robotLayer.addLayer(robotMarker);
    robotLayer.addTo(mapInstanceRef.current);
    layersRef.current.robot = robotLayer;
  }, [robotPosition]);

  return (
    <div 
      ref={mapRef} 
      style={{ 
        width: '100%', 
        height: '600px',
        backgroundColor: '#f9fafb'
      }} 
    />
  );
};

export default LeafletMap; 