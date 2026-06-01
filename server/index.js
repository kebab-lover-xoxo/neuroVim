const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { createApp } = require('../apps/web/dist/index.js');

const port = parseInt(process.env.PORT || '3000', 10);
const app = express();
const api = createApp();

app.use('/api', api);

if (process.env.NODE_ENV !== 'production') {
  const viteTarget = 'http://127.0.0.1:5173';
  app.use(
    '/',
    createProxyMiddleware({
      target: viteTarget,
      changeOrigin: true,
      ws: true,
      logLevel: 'warn'
    })
  );
} else {
  app.use(express.static('public'));
  app.use((req, res) => {
    res.sendFile(require('path').resolve('public/index.html'));
  });
}

app.listen(port, () => {
  console.log(`Express listening on port ${port} (${process.env.NODE_ENV || 'development'})`);
});
