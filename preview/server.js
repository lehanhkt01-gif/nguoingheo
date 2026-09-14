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

  if (pathname === '/api/stats') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      success: true,
      data: {
        totalDonations: 82000000,
        totalDisbursed: 18000000,
        netBalance: 64000000,
        donationCount: 5,
        disbursementCount: 3,
        activeCampaigns: 2
      }
    }));
    return;
  }

  if (pathname === '/api/donations') {
    const search = (parsedUrl.searchParams.get('search') || '').toLowerCase().trim();
    const village = parsedUrl.searchParams.get('village') || 'ALL';

    const allDonations = [
      {
        id: 1,
        transactionId: "BIDV_FT262391001",
        donorName: "Đoàn Hoàng Phúc",
        amount: 15000000,
        description: "VNN NDDK UNG HO XAY NHA DAI DOAN KET",
        transactionDate: "2026-09-10T08:30:00Z",
        status: "COMPLETED"
      },
      {
        id: 2,
        transactionId: "BIDV_FT262391002",
        donorName: "Nguyễn Thị Mai",
        amount: 5000000,
        description: "VNN SK UNG HO BO GIONG SINH KE",
        transactionDate: "2026-09-11T09:15:00Z",
        status: "COMPLETED"
      },
      {
        id: 3,
        transactionId: "BIDV_FT262391003",
        donorName: "Công ty Cổ phần Ea Súp Xanh",
        amount: 50000000,
        description: "CONG TY EA SUP XANH UNG HO QUY VI NGUOI NGHEO",
        transactionDate: "2026-09-11T14:20:00Z",
        status: "COMPLETED"
      },
      {
        id: 4,
        transactionId: "BIDV_FT262391004",
        donorName: "Lê Văn Tám (Kiều bào Úc)",
        amount: 10000000,
        description: "KIEU BAO UC UNG HO HO NGHEO BUON DRAI",
        transactionDate: "2026-09-12T10:00:00Z",
        status: "COMPLETED"
      },
      {
        id: 5,
        transactionId: "BIDV_FT262391005",
        donorName: "Trần Minh Tú",
        amount: 2000000,
        description: "VNN UNG HO BA CON KHO KHAN",
        transactionDate: "2026-09-13T16:45:00Z",
        status: "COMPLETED"
      }
    ];

    let filtered = allDonations;
    if (search) {
      filtered = filtered.filter(d => 
        d.donorName.toLowerCase().includes(search) || 
        d.description.toLowerCase().includes(search)
      );
    }
    if (village && village !== 'ALL') {
      filtered = filtered.filter(d => d.description.toLowerCase().includes(village.toLowerCase()));
    }

    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      success: true,
      data: filtered,
      pagination: {
        total: filtered.length,
        page: 1,
        limit: 10,
        totalPages: 1
      }
    }));
    return;
  }

  if (pathname.startsWith('/api/chat')) {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { message } = JSON.parse(body || '{}');
        let reply = "Dạ, tôi là Gem Mặt Trận Ea Súp. Hiện tại số dư Quỹ Vì Người Nghèo xã Ea Súp trong tài khoản BIDV 8630100930 là 64.000.000 đ (Tổng vận động: 82.000.000 đ, Đã giải ngân: 18.000.000 đ). Quý vị có thể chuyển khoản ủng hộ qua mã VietQR hoặc STK 8630100930 (BIDV Ea Súp)!";
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
