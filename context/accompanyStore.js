import { create } from 'zustand';

const useAccompanyStore = create((set) => ({
  // Initial state for accompany data
  accompanyData: null,
  applicants: [],
  participants: [],
  currentParticipants: 0,
  maxParticipants: 0,

  // Action to set all accompany data
  setAccompanyData: (data) => set({
    accompanyData: data,
    applicants: data.applicants || [],
    participants: data.participants || [],
    currentParticipants: data.accompanyInfo?.currentParticipants || 0,
    maxParticipants: data.accompanyInfo?.maxParticipants || 0,
  }),

  // Action to update applicants and participants after accept/reject
  updateParticipants: (newApplicants, newParticipants) => set({
    applicants: newApplicants,
    participants: newParticipants,
    currentParticipants: newParticipants.length, // Update count based on new participants list
  }),

  // Action to clear accompany data (e.g., when leaving the post)
  clearAccompanyData: () => set({
    accompanyData: null,
    applicants: [],
    participants: [],
    currentParticipants: 0,
    maxParticipants: 0,
  }),
}));

export default useAccompanyStore;