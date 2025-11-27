const proxy = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy for Rasa Chatbot API - must be defined BEFORE /api to avoid route conflicts
  app.use(
    '/api/chatbot',
    proxy({
      target: 'http://54.145.239.205:5005',
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
      pathRewrite: {
        '^/api/chatbot': '/webhooks/rest/webhook/', // Rewrite /api/chatbot to /webhooks/rest/webhook/
      },
      onProxyReq: (proxyReq, req, res) => {
        console.log('Proxying chatbot request:', req.method, req.url);
        console.log('Forwarding to:', 'http://54.145.239.205:5005/webhooks/rest/webhook/');
      },
      onProxyRes: (proxyRes, req, res) => {
        console.log('Chatbot proxy response:', proxyRes.statusCode, req.url);
      },
      onError: (err, req, res) => {
        console.error('Chatbot proxy error:', err.message);
        console.error('Request URL:', req.url);
        if (res && !res.headersSent) {
          res.status(500).json({ error: 'Chatbot proxy error', message: err.message });
        }
      }
    })
  );

  // Proxy for main API (Django backend) - defined after /api/chatbot
  app.use(
    '/api',
    proxy({
      target: 'http://54.145.239.205:8000',
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
      // Keep the path as-is (don't rewrite)
      pathRewrite: {
        '^/api': '/api', // Keep /api in the path
      },
      onProxyReq: (proxyReq, req, res) => {
        console.log('Proxying request:', req.method, req.url);
        console.log('Forwarding to:', 'http://54.145.239.205:8000' + req.url);
      },
      onProxyRes: (proxyRes, req, res) => {
        console.log('Proxy response:', proxyRes.statusCode, req.url);
      },
      onError: (err, req, res) => {
        console.error('Proxy error:', err.message);
        console.error('Request URL:', req.url);
        if (res && !res.headersSent) {
          res.status(500).json({ error: 'Proxy error', message: err.message });
        }
      }
    })
  );
};

