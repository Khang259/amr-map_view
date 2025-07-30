# Hướng dẫn Setup MediaMTX cho Camera Streaming

## 1. Tải và Cài đặt MediaMTX

### Windows:
```bash
# Tải bản Windows từ GitHub
https://github.com/bluenviron/mediamtx/releases

# Giải nén và đặt tên thư mục thành "mediamtx"
# Mở PowerShell trong thư mục mediamtx
```

### Linux/MacOS:
```bash
# Tải và cài đặt
wget https://github.com/bluenviron/mediamtx/releases/latest/download/mediamtx_v1.5.1_linux_amd64.tar.gz
tar -xzf mediamtx_v1.5.1_linux_amd64.tar.gz
chmod +x mediamtx
```

## 2. Cấu hình MediaMTX

Sử dụng file `mediamtx.yml` đã được tạo trong project này:

```yaml
# Cập nhật các URL RTSP của camera thực tế:
paths:
  cam1:
    source: rtsp://admin:password123@192.168.1.100:554/stream1
    sourceOnDemand: yes
    
  cam2:
    source: rtsp://admin:password123@192.168.1.101:554/stream1
    sourceOnDemand: yes
```

**Lưu ý quan trọng:**
- Thay thế `admin:password123` bằng username/password thực tế của camera
- Thay thế `192.168.1.100` bằng IP address thực tế của camera
- Thay thế `/stream1` bằng đường dẫn stream của camera (có thể là `/h264`, `/main`, etc.)

## 3. Chạy MediaMTX

### Windows (PowerShell):
```powershell
# Trong thư mục mediamtx
.\mediamtx.exe
```

### Linux/MacOS:
```bash
./mediamtx
```

## 4. Kiểm tra MediaMTX hoạt động

Sau khi chạy MediaMTX, bạn sẽ thấy output tương tự:
```
2024/01/15 10:30:00 INF MediaMTX v1.5.1
2024/01/15 10:30:00 INF [HLS] listener opened on :8888
2024/01/15 10:30:00 INF [API] listener opened on :9997
2024/01/15 10:30:00 INF [RTSP] listener opened on :8554
```

## 5. Test Camera Streams

Mở trình duyệt và truy cập:
- Camera 1: `http://localhost:8888/cam1/index.m3u8`
- Camera 2: `http://localhost:8888/cam2/index.m3u8`

Hoặc sử dụng VLC Media Player để test stream:
```
File > Open Network Stream > http://localhost:8888/cam1/index.m3u8
```

## 6. Cấu hình trong React App

### Cập nhật file `src/config/cameras.js`:
```javascript
export const cameraConfig = {
  mediamtxUrl: 'http://localhost:8888', // Hoặc IP server MediaMTX
  cameras: [
    {
      id: 'cam1',
      name: 'Camera Kho Hàng - Lối Vào',
      rtspUrl: 'rtsp://admin:password@192.168.1.100:554/stream1',
      location: 'Lối vào chính',
      description: 'Camera giám sát lối vào kho'
    }
    // Thêm các camera khác...
  ]
};
```

### Cập nhật environment variables (tùy chọn):
Tạo file `.env` trong root project:
```env
REACT_APP_MEDIAMTX_URL=http://localhost:8888
```

## 7. Common Issues & Solutions

### Lỗi "Connection failed":
- Kiểm tra camera có trực tuyến không
- Kiểm tra username/password đúng không
- Kiểm tra URL RTSP của camera
- Kiểm tra firewall/network

### Camera không hiển thị:
- Kiểm tra MediaMTX console có lỗi không
- Thử truy cập trực tiếp HLS URL: `http://localhost:8888/cam1/index.m3u8`
- Kiểm tra browser console có lỗi JavaScript không

### MediaMTX không khởi động:
- Kiểm tra port 8888, 9997, 8554 có bị chiếm dụng không
- Chạy với quyền admin nếu cần thiết
- Kiểm tra file cấu hình `mediamtx.yml` có lỗi syntax không

## 8. Production Deployment

### Chạy MediaMTX như service (Linux):
```bash
# Tạo systemd service
sudo nano /etc/systemd/system/mediamtx.service

[Unit]
Description=MediaMTX
After=network.target

[Service]
Type=simple
User=mediamtx
WorkingDirectory=/opt/mediamtx
ExecStart=/opt/mediamtx/mediamtx
Restart=always

[Install]
WantedBy=multi-user.target

# Enable và start service
sudo systemctl enable mediamtx
sudo systemctl start mediamtx
```

### Nginx Reverse Proxy (tùy chọn):
```nginx
location /mediamtx/ {
    proxy_pass http://localhost:8888/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

## 9. Security Considerations

- Đổi default ports nếu expose ra internet
- Sử dụng HTTPS/SSL cho production
- Hạn chế access bằng IP whitelist
- Sử dụng strong password cho camera
- Cập nhật MediaMTX thường xuyên

## 10. Advanced Configuration

### Multi-quality streams:
```yaml
paths:
  cam1_high:
    source: rtsp://admin:pass@192.168.1.100:554/stream1
  cam1_low:
    source: rtsp://admin:pass@192.168.1.100:554/stream2
```

### Recording:
```yaml
paths:
  cam1:
    source: rtsp://admin:pass@192.168.1.100:554/stream1
    record: yes
    recordPath: ./recordings/%path/%Y-%m-%d_%H-%M-%S-%f
```

Chúc bạn setup thành công! 🎥📹 