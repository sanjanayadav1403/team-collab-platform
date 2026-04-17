require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');

// Import routes
const authRoutes = require('./routes/authRoutes');
const orgRoutes = require('./routes/orgRoutes');
const channelRoutes = require('./routes/channelRoutes');
const messageRoutes = require('./routes/messageRoutes');
const openProjectRoutes = require('./routes/openProjectRoutes');
const fileRoutes = require('./routes/fileRoutes');
const aiRoutes = require('./routes/aiRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// Import global error handler
const initializeSocket = require('./sockets');
const { errorHandler } = require('./middleware/errorHandler');

// Import DB to trigger connection test on startup
require('./utils/db');

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());          // Parse JSON request bodies
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running.' });
});

app.use('/api/auth', authRoutes);
app.use('/api/orgs', orgRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/openproject', openProjectRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found.`,
  });
});

app.use(errorHandler);

const io = initializeSocket(httpServer);
app.set('io', io);

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Socket.io ready`);
});

module.exports = { app, io };