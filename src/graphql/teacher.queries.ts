import { gql } from '@apollo/client';

export const MY_QUIZZES_QUERY = gql`
  query MyQuizzes {
    myQuizzes {
      id
      title
      createdBy
      questionCount
      createdAt
    }
  }
`;

export const MY_STUDENTS_STATS_QUERY = gql`
  query MyStudentsStats {
    myStudentsStats {
      totalStudents
      activeStudents
      averageScore
    }
  }
`;
