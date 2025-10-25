import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../services/api';
import socketService from '../services/socket';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      // Login
      login: async (credentials) => {
        set({ loading: true, error: null });
        try {
          const response = await authAPI.login(credentials);
          const { token, user } = response.data;

          localStorage.setItem('token', token);
          set({ user, token, isAuthenticated: true, loading: false });

          // Connect socket
          socketService.connect({
            userId: user._id,
            role: user.role,
            driverId: user.driverId,
          });

          return { success: true };
        } catch (error) {
          const message = error.response?.data?.message || 'Login failed';
          set({ error: message, loading: false });
          return { success: false, error: message };
        }
      },

      // Register
      register: async (userData) => {
        set({ loading: true, error: null });
        try {
          const response = await authAPI.register(userData);
          const { token, user } = response.data;

          localStorage.setItem('token', token);
          set({ user, token, isAuthenticated: true, loading: false });

          // Connect socket
          socketService.connect({
            userId: user._id,
            role: user.role,
          });

          return { success: true };
        } catch (error) {
          const message = error.response?.data?.message || 'Registration failed';
          set({ error: message, loading: false });
          return { success: false, error: message };
        }
      },

      // Logout
      logout: async () => {
        try {
          await authAPI.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          localStorage.removeItem('token');
          socketService.disconnect();
          set({ user: null, token: null, isAuthenticated: false });
        }
      },

      // Get current user
      fetchUser: async () => {
        const token = localStorage.getItem('token');
        if (!token) {
          set({ isAuthenticated: false, loading: false });
          return;
        }

        set({ loading: true });
        try {
          const response = await authAPI.getMe();
          const user = response.data.data;

          set({ user, token, isAuthenticated: true, loading: false });

          // Connect socket if not connected
          if (!socketService.connected) {
            socketService.connect({
              userId: user._id,
              role: user.role,
              driverId: user.driverId,
            });
          }
        } catch (error) {
          localStorage.removeItem('token');
          set({ user: null, token: null, isAuthenticated: false, loading: false });
        }
      },

      // Update user details
      updateUser: (userData) => {
        set({ user: { ...get().user, ...userData } });
      },

      // Clear error
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;