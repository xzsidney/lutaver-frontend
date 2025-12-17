import { gql } from '@apollo/client';

export const AVAILABLE_QUIZZES_QUERY = gql`
  query AvailableQuizzes {
    availableQuizzes {
      id
      title
      discipline
      difficulty
      questionsCount
      isActive
      rewardXp
      rewardCoins
      isCompleted
    }
  }
`;

export const GET_QUIZ_QUERY = gql`
  query GetQuiz($id: ID!) {
    quiz(id: $id) {
      id
      title
      description
      discipline
      difficulty
      questionsCount
      rewardXp
      rewardCoins
    }
  }
`;

export const QUIZ_HISTORY_QUERY = gql`
    query QuizHistory($quizId: ID) {
        quizHistory(quizId: $quizId) {
            id
            score
            status
            startedAt
            finishedAt
            correctAnswersCount
            totalQuestions
        }
    }
`;
