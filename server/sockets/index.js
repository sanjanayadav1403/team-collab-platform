const { Server } = require('socket.io');
const { verifyToken } = require('../utils/jwt');
const { updateOnlineStatus } = require('../services/authService');
const { getUserChannels } = require('../services/channelService');
const chatHandler = require('./chatHandler');
const presenceHandler = require('./presenceHandler');
const dmHandler = require('./dmHandler');

/**
 * Initialize Socket.io server.
 * Attaches to the existing HTTP server.
 * Handles auth, room joining, and event registration.
 *
 * @param {Object} httpServer - Node.js HTTP server instance
 */
const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Auth Middleware
  // Runs before every connection — verify JWT token
  io.use((socket, next) => {
    try {
      // Token sent from frontend as: socket = io(URL, { auth: { token } })
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error('Authentication token missing.'));
      }

      const decoded = verifyToken(token, process.env.JWT_ACCESS_SECRET);

      // Attach user info to socket for use in handlers
      socket.user = decoded; // { id, email, name }

      next();
    } catch (err) {
      next(new Error('Invalid or expired token.'));
    }
  });

  // Connection Handler
  io.on('connection', async (socket) => {
    const user = socket.user;
    console.log(`User connected: ${user.name} (${user.id})`);

    try {
      // Mark user as online in DB
      await updateOnlineStatus(user.id, true);

      // Get orgId from client — sent as: socket = io(URL, { auth: { token, orgId } })
      const orgId = socket.handshake.auth?.orgId;

      if (orgId) {
        // Join all channel rooms the user belongs to
        const userChannels = await getUserChannels(user.id, orgId);

        userChannels.forEach((channel) => {
          socket.join(channel.id);
        });

        console.log(`${user.name} joined ${userChannels.length} channel rooms`);

        // Broadcast online status to all rooms
        userChannels.forEach((channel) => {
          socket.to(channel.id).emit('presence_update', {
            userId: user.id,
            isOnline: true,
          });
        });
      }

      // Register Event Handlers
      chatHandler(io, socket);
      presenceHandler(io, socket);
      dmHandler(io, socket);

      // Join a new channel room (after joining via REST API)
      // When user joins a channel via HTTP, tell socket to also join that room
      socket.on('join_channel_room', ({ channelId }) => {
        if (channelId) {
          socket.join(channelId);
          console.log(`${user.name} joined room: ${channelId}`);
        }
      });

    } catch (err) {
      console.error('Socket connection error:', err.message);
    }
  });

  return io;
};

module.exports = initializeSocket;