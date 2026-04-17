import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket = null;

/**
 * Initialize Socket.io connection.
 * Call this once after login with the user's access token and current orgId.
 * Token is verified by the backend on connect.
 */
export const initSocket = (token, orgId) => {
  // If already connected, disconnect first
  if (socket?.connected) {
    socket.disconnect();
  }

  socket = io(SOCKET_URL, {
    auth: { token, orgId },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err.message);
  });

  return socket;
};

/**
 * Get the current socket instance.
 * Always use this instead of storing socket locally in components.
 */
export const getSocket = () => socket;

/**
 * Disconnect and clean up the socket.
 * Call this on logout or when leaving the chat.
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};