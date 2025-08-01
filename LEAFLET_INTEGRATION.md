# Tích hợp Leaflet.js vào AMR Map Viewer

## Tổng quan

Dự án đã được chuyển đổi từ Canvas sang Leaflet.js để cung cấp trải nghiệm tương tác tốt hơn và hiệu suất cao hơn cho việc hiển thị bản đồ AMR warehouse.

## Thay đổi chính

### 1. Thay thế Canvas bằng LeafletMap Component

- **File cũ**: `src/App.js` sử dụng `<canvas>` element
- **File mới**: `src/components/LeafletMap.js` sử dụng Leaflet map

### 2. Hệ tọa độ CRS.Simple

Leaflet được cấu hình với `CRS.Simple` để hỗ trợ hệ tọa độ tùy chỉnh:
```javascript
const map = L.map(mapRef.current, {
  crs: L.CRS.Simple,
  minZoom: -2,
  maxZoom: 4,
  zoomControl: false
});
```

### 3. Chuyển đổi tọa độ

- **Canvas**: Sử dụng pixel coordinates với offset và scale
- **Leaflet**: Sử dụng world coordinates trực tiếp
- **Mapping**: `[y, x]` format cho Leaflet (latitude, longitude)

### 4. Các tính năng được giữ nguyên

- ✅ Hiển thị grid lines
- ✅ Hiển thị nodes (waypoints)
- ✅ Hiển thị paths (đường đi)
- ✅ Hiển thị charge stations
- ✅ Hiển thị robot position
- ✅ Zoom controls
- ✅ Pan controls
- ✅ Display options (show/hide elements)

### 5. Cải tiến mới

- **Zoom tự động**: Leaflet cung cấp zoom mượt mà
- **Pan tự động**: Di chuyển bản đồ bằng chuột
- **Performance**: Render hiệu quả hơn với large datasets
- **Responsive**: Tự động điều chỉnh kích thước
- **Layer management**: Quản lý layers riêng biệt

## Cấu trúc file

```
src/
├── components/
│   └── LeafletMap.js          # Component Leaflet chính
├── hooks/
│   └── useLeafletMapControls.js # Hook quản lý controls
└── App.js                     # App chính (đã cập nhật)
```

## Sử dụng

### Import component
```javascript
import LeafletMap from './components/LeafletMap';
```

### Sử dụng trong JSX
```javascript
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
```

## Dependencies

Đảm bảo đã cài đặt:
```bash
npm install leaflet
```

## CSS Styling

Leaflet CSS đã được import và customize:
```css
.leaflet-container {
  width: 100%;
  height: 600px;
  background: white;
}
```

## Lưu ý kỹ thuật

1. **Coordinate System**: Leaflet sử dụng `[lat, lng]` format
2. **Bounds**: Map bounds được set dựa trên mapData dimensions
3. **Layers**: Mỗi element type có layer riêng để dễ quản lý
4. **Performance**: Layers được remove/add thay vì redraw toàn bộ

## Troubleshooting

### Lỗi thường gặp:
1. **Leaflet CSS không load**: Đảm bảo import `leaflet/dist/leaflet.css`
2. **Markers không hiển thị**: Fix default icon paths
3. **Zoom không hoạt động**: Kiểm tra zoomControl configuration

### Debug:
- Kiểm tra console cho errors
- Verify mapData structure
- Test với sample data 