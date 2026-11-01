const app = require('./app');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Task Management API running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully.');

  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});
