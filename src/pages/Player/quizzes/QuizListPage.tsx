import React from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { AVAILABLE_QUIZZES_QUERY } from '../../../graphql/quiz/quiz.queries';
import { START_QUIZ_MUTATION } from '../../../graphql/quiz/quiz.mutations';
import { PlayerLayout } from '../../../components/layout/PlayerLayout';

export function QuizListPage() {
    const navigate = useNavigate();
    const { data, loading, error } = useQuery(AVAILABLE_QUIZZES_QUERY);
    const [startQuiz, { loading: starting }] = useMutation(START_QUIZ_MUTATION);

    const handleStart = async (quizId: string) => {
        try {
            const { data } = await startQuiz({ variables: { input: { quizId } } });
            const attemptId = data.startQuiz.attemptId;
            // Store attempt info or pass via state
            navigate(`/player/quizzes/${quizId}/play`, { state: { attemptId, questions: data.startQuiz.questions } });
        } catch (err: any) {
            alert('Erro ao iniciar quiz: ' + err.message);
        }
    };

    if (loading) return <PlayerLayout><div>Carregando quizzes...</div></PlayerLayout>;
    if (error) return <PlayerLayout><div>Erro: {error.message}</div></PlayerLayout>;

    return (
        <PlayerLayout>
            <div className="container py-4">
                <h2 className="mb-4">Quizzes Disponíveis</h2>
                <div className="row g-4">
                    {data?.availableQuizzes.map((quiz: any) => (
                        <div key={quiz.id} className="col-md-6 col-lg-4">
                            <div className={`card h-100 shadow-sm ${quiz.isCompleted ? 'border-success' : ''}`}>
                                <div className="card-body d-flex flex-column">
                                    <h5 className="card-title d-flex justify-content-between">
                                        {quiz.title}
                                        {quiz.isCompleted && <span className="badge bg-success">Concluído</span>}
                                    </h5>
                                    <h6 className="card-subtitle mb-2 text-muted">{quiz.discipline} - {quiz.difficulty}</h6>
                                    <p className="card-text flex-grow-1">{quiz.description || 'Sem descrição.'}</p>

                                    <div className="mt-3">
                                        <p className="small mb-1">Recompensas:</p>
                                        <span className="badge bg-primary me-2">{quiz.rewardXp} XP</span>
                                        <span className="badge bg-warning text-dark">{quiz.rewardCoins} Moedas</span>
                                    </div>

                                    <div className="mt-auto pt-3">
                                        {quiz.isCompleted ? (
                                            <button className="btn btn-outline-success w-100" disabled>
                                                Já Aprovado
                                            </button>
                                        ) : (
                                            <button
                                                className="btn btn-primary w-100"
                                                onClick={() => handleStart(quiz.id)}
                                                disabled={starting}
                                            >
                                                {starting ? 'Iniciando...' : 'Iniciar Quiz'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {data?.availableQuizzes.length === 0 && (
                        <p className="text-muted">Nenhum quiz disponível no momento.</p>
                    )}
                </div>
            </div>
        </PlayerLayout>
    );
}
