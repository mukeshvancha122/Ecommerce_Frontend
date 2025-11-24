const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://54.145.239.205:8000',
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
      onProxyReq: (proxyReq, req, res) => {
        console.log(`Proxying ${req.method} ${req.url} to ${proxyReq.path}`);
      },
      onError: (err, req, res) => {
        console.error('Proxy error:', err);
      }
    })
  );
};

