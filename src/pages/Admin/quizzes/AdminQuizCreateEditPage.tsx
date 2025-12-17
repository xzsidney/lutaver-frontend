import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, gql } from '@apollo/client';
import { AdminLayout } from '../../../components/layout/AdminLayout';
import { QuizFormImproved } from './components/QuizFormImproved';

const GET_QUIZ = gql`
    query GetQuiz($id: ID!) {
        adminQuiz(id: $id) {
            id
            title
            description
            discipline
            difficulty
            rewardXp
            rewardCoins
            isActive
            questions {
                id
                statement
                optionA
                optionB
                optionC
                optionD
                correctOption
                type
                explanation
            }
        }
    }
`;

const CREATE_QUIZ = gql`
    mutation CreateQuiz($input: CreateQuizInput!) {
        createQuiz(input: $input) {
            id
            title
        }
    }
`;

const UPDATE_QUIZ = gql`
    mutation UpdateQuiz($id: ID!, $input: UpdateQuizInput!) {
        updateQuiz(id: $id, input: $input) {
            id
            title
        }
    }
`;

export function AdminQuizCreateEditPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;

    const { data, loading } = useQuery(GET_QUIZ, {
        variables: { id },
        skip: !isEditing
    });

    const [createQuiz, { loading: creating }] = useMutation(CREATE_QUIZ);
    const [updateQuiz, { loading: updating }] = useMutation(UPDATE_QUIZ);

    const handleSubmit = async (formData: any) => {
        try {
            const inputData = {
                title: formData.title,
                description: formData.description,
                discipline: formData.discipline,
                difficulty: formData.difficulty,
                rewardXp: formData.rewardXp,
                rewardCoins: formData.rewardCoins,
                isActive: formData.isActive,
                questions: formData.questions.map((q: any) => {
                    const { __typename, ...rest } = q;
                    return rest;
                })
            };

            if (isEditing) {
                await updateQuiz({
                    variables: { id, input: inputData }
                });
            } else {
                await createQuiz({
                    variables: { input: inputData }
                });
            }

            navigate('/admin/quizzes');
        } catch (err: any) {
            alert('Erro ao salvar: ' + err.message);
        }
    };

    const handleCancel = () => {
        navigate('/admin/quizzes');
    };

    if (loading && isEditing) {
        return (
            <AdminLayout>
                <div className="text-white">Carregando...</div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="mb-4">
                <h2 className="text-white mb-1">{isEditing ? 'Editar Quiz' : 'Novo Quiz'}</h2>
                <p className="text-muted small m-0">
                    {isEditing ? 'Modifique os dados do quiz' : 'Crie um novo quiz selecionando questões'}
                </p>
            </div>

            <QuizFormImproved
                initialData={data?.adminQuiz}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={creating || updating}
            />
        </AdminLayout>
    );
}
