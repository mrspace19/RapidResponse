import { create } from 'zustand';
import { emergencyAPI } from '../services/api';

const useEmergencyStore = create((set, get) => ({
  currentRequest: null,
  myRequests: [],
  loading: false,
  error: null,

  // Create emergency request
  createEmergency: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await emergencyAPI.createEmergency(data);
      set({ currentRequest: response.data.data, loading: false });
      return { success: true, data: response.data.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create emergency request';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  // Create private booking
  createPrivateBooking: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await emergencyAPI.createPrivateBooking(data);
      set({ currentRequest: response.data.data.booking, loading: false });
      return { success: true, data: response.data.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create booking';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  // Get request by ID
  getRequest: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await emergencyAPI.getRequest(id);
      set({ currentRequest: response.data.data, loading: false });
      return { success: true, data: response.data.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch request';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  // Get my requests
  getMyRequests: async (params) => {
    set({ loading: true, error: null });
    try {
      const response = await emergencyAPI.getMyRequests(params);
      set({ myRequests: response.data.data, loading: false });
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch requests';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  // Select hospital
  selectHospital: async (requestId, hospitalId) => {
    set({ loading: true, error: null });
    try {
      const response = await emergencyAPI.selectHospital(requestId, { hospitalId });
      set({ currentRequest: response.data.data.request, loading: false });
      return { success: true, data: response.data.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to select hospital';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  // Cancel request
  cancelRequest: async (requestId, reason) => {
    set({ loading: true, error: null });
    try {
      const response = await emergencyAPI.cancelRequest(requestId, { reason });
      set({ loading: false });
      return { success: true, data: response.data.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to cancel request';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  // Rate service
  rateService: async (requestId, rating) => {
    set({ loading: true, error: null });
    try {
      const response = await emergencyAPI.rateService(requestId, rating);
      set({ loading: false });
      return { success: true, data: response.data.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to submit rating';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  // Update current request
  updateCurrentRequest: (updates) => {
    set({ currentRequest: { ...get().currentRequest, ...updates } });
  },

  // Clear current request
  clearCurrentRequest: () => set({ currentRequest: null }),

  // Clear error
  clearError: () => set({ error: null }),
}));

export default useEmergencyStore;