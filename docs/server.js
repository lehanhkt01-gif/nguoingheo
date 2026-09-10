const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3333;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = parsedUrl.pathname;

  if (pathname === '/') {
    pathname = '/index.html';
  }

  if (pathname.startsWith('/api/chat')) {
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
    return;
  }

  // Phục vụ file tĩnh
  const safePath = path.normalize(path.join(__dirname, pathname));
  if (!safePath.startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  fs.readFile(safePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not Found');
      return;
    }
    const ext = path.extname(safePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Máy chủ xem trước WebApp Quỹ vì người nghèo Ea Súp đang chạy tại: http://localhost:${PORT}`);
});
