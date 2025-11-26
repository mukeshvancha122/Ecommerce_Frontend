const proxy = require('http-proxy-middleware');

module.exports = function(app) {
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

