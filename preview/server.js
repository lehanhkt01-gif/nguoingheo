const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3333;

const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/index.html') {
    const filePath = path.join(__dirname, 'index.html');
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Lỗi đọc file giao diện');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(data);
    });
  } else if (req.url === '/hero-charity-bg.jpg') {
    const imgPath = path.join(__dirname, 'hero-charity-bg.jpg');
    fs.readFile(imgPath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Image Not Found');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'image/jpeg' });
      res.end(data);
    });
  } else if (req.url.startsWith('/api/chat')) {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { message } = JSON.parse(body || '{}');
        let reply = "Dạ, tôi là Gem Mặt Trận Ea Súp. Hiện tại số dư Quỹ Vì Người Nghèo xã Ea Súp trong tài khoản BIDV 8630100930 là 301.000.000 đ (Tổng thu: 334.000.000 đ, Đã giải ngân: 33.000.000 đ). Quý vị có thể chuyển khoản ủng hộ qua mã VietQR hoặc STK 8630100930 (BIDV Ea Súp)!";
        if (message && message.includes('thôn')) {
          reply = "Xã Ea Súp gồm 20 thôn, buôn (17 thôn từ Thôn 1 đến Thôn 17 và 03 buôn: Buôn A2, Buôn Drai, Buôn Cổng). Mọi hoạt động hỗ trợ đều có chữ ký xác nhận của Ban CTMT cơ sở!";
        } else if (message && message.includes('định mức')) {
          reply = "Theo Quyết định số 13/QĐ-MTTQ-BTT: Định mức hỗ trợ xây nhà Đại đoàn kết là 8.000.000 đ/nhà từ nguồn xã; sửa chữa 5.000.000 đ/nhà; bò giống sinh kế 5.000.000 đ/hộ; cứu trợ đột xuất 1.000.000 - 5.000.000 đ/ca.";
        }
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: true, reply }));
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false }));
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Máy chủ xem trước WebApp Quỹ vì người nghèo Ea Súp đang chạy tại: http://localhost:${PORT}`);
});
