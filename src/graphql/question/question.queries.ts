import { gql } from '@apollo/client';

export const ADMIN_QUESTIONS_QUERY = gql`
    query AdminQuestions {
        adminQuestions {
            id
            statement
            type
            optionA
            optionB
            optionC
            optionD
            correctOption
            explanation
        }
    }
`;

export const GET_QUESTION_QUERY = gql`
    query GetQuestion($id: ID!) {
        question(id: $id) {
            id
            statement
            type
            optionA
            optionB
            optionC
            optionD
            correctOption
            explanation
        }
    }
`;
