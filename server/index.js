// filepath: f:\Projects\MJP\campamento-2025\server\index.js
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { spawn } = require('child_process');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Start Next.js app on port 3001
const nextApp = spawn('yarn', ['next', 'start', '-p', '3001'], {
  stdio: 'pipe',
  shell: true,
  cwd: path.resolve(__dirname, '..')
});

nextApp.stdout.on('data', (data) => {
  console.log(`Next.js: ${data}`);
});

nextApp.stderr.on('data', (data) => {
  console.error(`Next.js error: ${data}`);
});

// Start Prisma Studio on port 5555
const prismaStudio = spawn('npx', ['prisma', 'studio', '--port', '5555', '--browser', 'none', '--hostname', '0.0.0.0'], {
  stdio: 'pipe',
  shell: true,
  cwd: path.resolve(__dirname, '..')
});

prismaStudio.stdout.on('data', (data) => {
  console.log(`Prisma Studio: ${data}`);
});

prismaStudio.stderr.on('data', (data) => {
  console.error(`Prisma Studio error: ${data}`);
});

// Proxy for Next.js app (/registro path)
app.use('/registro', createProxyMiddleware({
  target: 'http://localhost:3001',
  changeOrigin: true,
  pathRewrite: {
    '^/registro': '' // Remove /registro path when forwarding to Next.js
  }
}));

// Proxy for Next.js static assets (/_next path)
app.use('/_next', createProxyMiddleware({
  target: 'http://localhost:3001',
  changeOrigin: true
}));

// Proxy for Prisma Studio (/db path)
app.use('/', createProxyMiddleware({
  target: 'http://localhost:5555',
  changeOrigin: true,
  ws: true,
  onProxyReq: (proxyReq, req, res) => {
    // Ensure proper Referer header for Prisma Studio requests
    proxyReq.setHeader('Referer', 'http://localhost:5555');
  }
}));

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Next.js available at http://localhost:${PORT}/registro`);
  console.log(`Prisma Studio available at http://localhost:${PORT}/db`);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down servers...');
  nextApp.kill();
  prismaStudio.kill();
  process.exit();
});