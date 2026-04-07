import quizService from "../services/quizService";
import { useQuizzesStore } from "../stores/quizzesStore";

export const syncQuizzes = async () => {
  try {
    const response = await quizService.getAllQuizzes();
    useQuizzesStore.getState().updateQuizData(response.data || []);
  } catch (error) {
    console.error("Failed to fetch quizzes for notifications", error);
  }
};
