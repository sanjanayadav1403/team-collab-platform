import {create} from 'zustand';

const useAuthStore = create((set) => ({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,

    login: (user, accessToken, refreshToken) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        set({user, accessToken, refreshToken, isAuthenticated: true});
    },

    logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({user: null, accessToken: null, refreshToken: null, isAuthenticated: false});
    },

    setAccessToken: (token) => {
        localStorage.setItem('accessToken', token);
        set({ accessToken: token });
    },

    initializeAuth: () => {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
    
        if (accessToken && refreshToken) {
        set({ accessToken, refreshToken, isAuthenticated: true });
        }
    },

    setUser: (user) => {
        set({ user });
    },
}));

export default useAuthStore;