import { gql } from '@apollo/client';

export const CREATE_QUESTION_MUTATION = gql`
    mutation CreateQuestion($input: CreateQuestionInput!) {
        createQuestion(input: $input) {
            id
            statement
            type
            correctOption
        }
    }
`;

export const UPDATE_QUESTION_MUTATION = gql`
    mutation UpdateQuestion($id: ID!, $input: UpdateQuestionInput!) {
        updateQuestion(id: $id, input: $input) {
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

export const DELETE_QUESTION_MUTATION = gql`
    mutation DeleteQuestion($id: ID!) {
        deleteQuestion(id: $id)
    }
`;
