import axios from "axios";
import { API_URL } from "../api";

const STORAGE_KEYS = {
  TOKEN: "authToken",
  ROLE: "userRole",
  ID: "userId",
  NAME: "userName",
  USERNAME: "userUsername",
};

const ROLE_ROUTES = {
  admin: "/admin/dashboard",
  guru: "/guru/dashboard",
  ortu: "/ortu/dashboard",
};

const saveUserData = (token, user) => {
  localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  localStorage.setItem(STORAGE_KEYS.ROLE, user.role);
  localStorage.setItem(STORAGE_KEYS.ID, user.id);
  localStorage.setItem(STORAGE_KEYS.NAME, user.nama);
  localStorage.setItem(STORAGE_KEYS.USERNAME, user.username);
};

const clearUserData = () => {
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
};

export const AuthService = {
  login: async (username, password) => {
    const res = await axios.post(`${API_URL}/auth/login`, {
      username,
      password,
    });
    
    if (res.data.status === "success") {
      const { token, user } = res.data.data;
      saveUserData(token, user);
    }
    
    return res.data;
  },

  verifyToken: async () => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    
    if (!token) {
      throw new Error("Token tidak ditemukan");
    }

    const res = await axios.get(`${API_URL}/auth/me`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    
    return res.data;
  },

  logout: () => {
    clearUserData();
  },

  getToken: () => localStorage.getItem(STORAGE_KEYS.TOKEN),
  getUserRole: () => localStorage.getItem(STORAGE_KEYS.ROLE),
  getUserId: () => localStorage.getItem(STORAGE_KEYS.ID),
  getUserName: () => localStorage.getItem(STORAGE_KEYS.NAME),
  getUserUsername: () => localStorage.getItem(STORAGE_KEYS.USERNAME),

  isAuthenticated: () => !!AuthService.getToken(),
  
  hasRole: (requiredRole) => AuthService.getUserRole() === requiredRole,

  getRedirectUrl: (role) => ROLE_ROUTES[role] || "/login",
};