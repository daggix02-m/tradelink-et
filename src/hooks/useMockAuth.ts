import { create } from "zustand";

interface MockAuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  role: "importer" | "wholesaler" | "admin" | null;
  login: (role: "importer" | "wholesaler" | "admin") => void;
  logout: () => void;
}

export const useMockAuth = create<MockAuthState>((set) => ({
  isAuthenticated: false,
  isLoading: false,
  role: null,
  login: (role) => set({ isAuthenticated: true, role }),
  logout: () => set({ isAuthenticated: false, role: null }),
}));
