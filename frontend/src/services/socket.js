import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  connect(userData) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
      this.connected = true;
      
      // Register user
      if (userData) {
        this.socket.emit('user:register', userData);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      this.connected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  // Emergency events
  createEmergency(data, callbacks = {}) {
    this.socket.emit('emergency:create', data);

    if (callbacks.onSearching) {
      this.socket.on('emergency:searching', callbacks.onSearching);
    }
    if (callbacks.onAccepted) {
      this.socket.on('emergency:accepted', callbacks.onAccepted);
    }
    if (callbacks.onNoAmbulance) {
      this.socket.on('emergency:no_ambulance', callbacks.onNoAmbulance);
    }
    if (callbacks.onTimeout) {
      this.socket.on('emergency:timeout', callbacks.onTimeout);
    }
    if (callbacks.onError) {
      this.socket.on('emergency:error', callbacks.onError);
    }
  }

  acceptEmergency(data, callbacks = {}) {
    this.socket.emit('emergency:accept', data);

    if (callbacks.onConfirmed) {
      this.socket.on('emergency:accept_confirmed', callbacks.onConfirmed);
    }
    if (callbacks.onError) {
      this.socket.on('emergency:error', callbacks.onError);
    }
  }

  rejectEmergency(data) {
    this.socket.emit('emergency:reject', data);
  }

  cancelEmergency(data, callbacks = {}) {
    this.socket.emit('emergency:cancel', data);

    if (callbacks.onConfirmed) {
      this.socket.on('emergency:cancel_confirmed', callbacks.onConfirmed);
    }
  }

  updateEmergencyStatus(data, callbacks = {}) {
    this.socket.emit('emergency:update_status', data);

    if (callbacks.onConfirmed) {
      this.socket.on('emergency:status_update_confirmed', callbacks.onConfirmed);
    }
  }

  // Driver events
  goOnline(data, callbacks = {}) {
    this.socket.emit('driver:online', data);

    if (callbacks.onSuccess) {
      this.socket.on('driver:online_success', callbacks.onSuccess);
    }
    if (callbacks.onError) {
      this.socket.on('driver:error', callbacks.onError);
    }
  }

  goOffline(data, callbacks = {}) {
    this.socket.emit('driver:offline', data);

    if (callbacks.onSuccess) {
      this.socket.on('driver:offline_success', callbacks.onSuccess);
    }
  }

  updateLocation(data) {
    this.socket.emit('driver:location_update', data);
  }

  arrivedAtPickup(data) {
    this.socket.emit('driver:arrived_pickup', data);
  }

  patientPicked(data) {
    this.socket.emit('driver:patient_picked', data);
  }

  // Tracking events
  joinTracking(data, callbacks = {}) {
    this.socket.emit('tracking:join', data);

    if (callbacks.onJoined) {
      this.socket.on('tracking:joined', callbacks.onJoined);
    }
  }

  leaveTracking(data) {
    this.socket.emit('tracking:leave', data);
  }

  // Listen for events
  onNewRequest(callback) {
    this.socket.on('emergency:new_request', callback);
  }

  onRequestTaken(callback) {
    this.socket.on('emergency:request_taken', callback);
  }

  onRequestCancelled(callback) {
    this.socket.on('emergency:cancelled', callback);
  }

  onLocationUpdate(callback) {
    this.socket.on('ambulance:location_update', callback);
  }

  onDriverArrived(callback) {
    this.socket.on('driver:arrived', callback);
  }

  onPatientOnboard(callback) {
    this.socket.on('driver:patient_onboard', callback);
  }

  onStatusUpdate(callback) {
    this.socket.on('emergency:status_update', callback);
  }

  onETAUpdate(callback) {
    this.socket.on('tracking:eta_changed', callback);
  }

  // Remove listeners
  off(event) {
    if (this.socket) {
      this.socket.off(event);
    }
  }

  offAll() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }
}

export default new SocketService();