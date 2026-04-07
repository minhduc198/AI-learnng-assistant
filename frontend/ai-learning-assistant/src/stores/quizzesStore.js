import { create } from "zustand";

export const useQuizzesStore = create((set) => ({
  quizData: [],
  updateQuizData: (data) => set({ quizData: data }),
}));
