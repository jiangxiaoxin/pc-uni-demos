// 简单的消息中转服务器
const http = require('http');
const url = require('url');

// 存储最新的一条消息
let latestMessage = null;
let messageTimestamp = 0;

const server = http.createServer((req, res) => {
  // 设置 CORS 头，允许跨域
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);

  // POST /send - 发送消息
  if (parsedUrl.pathname === '/send' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        latestMessage = data;
        messageTimestamp = Date.now();
        console.log('[Server] 收到消息:', data);
        res.writeHead(200);
        res.end(JSON.stringify({ success: true }));
      } catch (e) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }

  // GET /receive - 接收消息（长轮询）
  if (parsedUrl.pathname === '/receive' && req.method === 'GET') {
    const clientTimestamp = parseInt(parsedUrl.query.timestamp) || 0;
    // 当前端发请求要获取最新数据时，
    // 如果有新消息，立即返回
    if (latestMessage && messageTimestamp > clientTimestamp) {
      res.writeHead(200);
      res.end(JSON.stringify({
        hasNewMessage: true,
        data: latestMessage,
        timestamp: messageTimestamp
      }));
      return;
    }

    // 否则等待最多 30 秒（长轮询）
    // 在这30秒内，如果有新消息就返回新消息，如果没有，就正常结束掉请求，告诉前端没有新消息
    const startTime = Date.now();
    const checkInterval = setInterval(() => {
      if (messageTimestamp > clientTimestamp) {
        clearInterval(checkInterval);
        res.writeHead(200);
        res.end(JSON.stringify({
          hasNewMessage: true,
          data: latestMessage,
          timestamp: messageTimestamp
        }));
        return;
      }
      
      // 30 秒超时
      // 超时并不意味着失败，只是说此次请求时，没有新消息
      if (Date.now() - startTime > 30000) {
        clearInterval(checkInterval);
        res.writeHead(200);
        res.end(JSON.stringify({ hasNewMessage: false }));
      }
    }, 100);
    
    return;
  }

  // 健康检查
  if (parsedUrl.pathname === '/health') {
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`[Message Server] 运行在 http://localhost:${PORT}`);
  console.log(`  - POST http://localhost:${PORT}/send    (发送消息)`);
  console.log(`  - GET  http://localhost:${PORT}/receive (接收消息)`);
});
