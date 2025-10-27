import { create } from 'zustand';
import { ambulanceAPI } from '../services/api';

const useDriverStore = create((set, get) => ({
  ambulance: null,
  driverStatus: 'offline',
  activeRequest: null,
  incomingRequests: [],
  currentLocation: null,
  loading: false,
  error: null,

  // Fetch ambulance details
  fetchAmbulance: async () => {
    set({ loading: true, error: null });
    try {
      const response = await ambulanceAPI.getMyAmbulance();
      set({ 
        ambulance: response.data.data, 
        driverStatus: response.data.data.status,
        loading: false 
      });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch ambulance';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  // Update driver status
  setDriverStatus: (status) => {
    set({ driverStatus: status });
  },

  // Set active request
  setActiveRequest: (request) => {
    set({ activeRequest: request });
  },

  // Add incoming request
  addIncomingRequest: (request) => {
    set(state => ({
      incomingRequests: [...state.incomingRequests, request]
    }));
  },

  // Remove incoming request
  removeIncomingRequest: (requestId) => {
    set(state => ({
      incomingRequests: state.incomingRequests.filter(
        req => req.requestId !== requestId
      )
    }));
  },

  // Clear all incoming requests
  clearIncomingRequests: () => {
    set({ incomingRequests: [] });
  },

  // Update current location
  setCurrentLocation: (location) => {
    set({ currentLocation: location });
  },

  // Clear error
  clearError: () => set({ error: null }),
}));

export default useDriverStore;