import { gql } from '@apollo/client';

export const START_QUIZ_MUTATION = gql`
  mutation StartQuiz($input: StartQuizInput!) {
    startQuiz(input: $input) {
      attemptId
      questions {
        id
        statement
        type
        optionA
        optionB
        optionC
        optionD
      }
    }
  }
`;

export const SUBMIT_QUIZ_MUTATION = gql`
  mutation SubmitQuiz($input: SubmitQuizInput!) {
    submitQuiz(input: $input) {
      id
      status
      score
      correctAnswersCount
      totalQuestions
      gainedXp
      gainedCoins
    }
  }
`;
