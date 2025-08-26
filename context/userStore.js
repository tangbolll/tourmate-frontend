import { create } from 'zustand';

const useUserStore = create((set) => ({
  userData: null,
  setUserData: (data) => set({ userData: data }),
  clearUserData: () => set({ userData: null }),
}));

export default useUserStore;