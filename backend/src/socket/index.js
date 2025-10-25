import emergencyHandler from './handlers/emergency.handler.js';
import driverHandler from './handlers/driver.handler.js';
import trackingHandler from './handlers/tracking.handler.js';

// Store active connections
const activeConnections = new Map();

export const initializeSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    // Store user info on connection
    socket.on('user:register', (userData) => {
      activeConnections.set(socket.id, {
        userId: userData.userId,
        role: userData.role,
        socketId: socket.id
      });
      
      // Join role-specific room
      socket.join(`role:${userData.role}`);
      
      // If driver, join driver room
      if (userData.role === 'driver' && userData.driverId) {
        socket.join(`driver:${userData.driverId}`);
      }
      
      console.log(`User registered: ${userData.userId} (${userData.role})`);
    });

    // Initialize handlers
    emergencyHandler(io, socket);
    driverHandler(io, socket);
    trackingHandler(io, socket);

    // Handle disconnection
    socket.on('disconnect', () => {
      const userInfo = activeConnections.get(socket.id);
      if (userInfo) {
        console.log(`❌ User disconnected: ${userInfo.userId} (${userInfo.role})`);
        activeConnections.delete(socket.id);
      } else {
        console.log(`❌ Client disconnected: ${socket.id}`);
      }
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  // Store io instance for access in other modules
  global.io = io;
};

// Helper function to get socket by user ID
export const getSocketByUserId = (userId) => {
  for (const [socketId, userData] of activeConnections.entries()) {
    if (userData.userId === userId) {
      return global.io.sockets.sockets.get(socketId);
    }
  }
  return null;
};

// Helper function to get all drivers
export const getAllDriverSockets = () => {
  const driverSockets = [];
  for (const [socketId, userData] of activeConnections.entries()) {
    if (userData.role === 'driver') {
      const socket = global.io.sockets.sockets.get(socketId);
      if (socket) {
        driverSockets.push({ socket, userData });
      }
    }
  }
  return driverSockets;
};

export { activeConnections };