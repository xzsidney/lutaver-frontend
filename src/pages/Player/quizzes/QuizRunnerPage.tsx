import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { SUBMIT_QUIZ_MUTATION } from '../../../graphql/quiz/quiz.mutations';
import { PlayerLayout } from '../../../components/layout/PlayerLayout';

export function QuizRunnerPage() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { id: quizId } = useParams();

    const [submitQuiz, { loading: submitting }] = useMutation(SUBMIT_QUIZ_MUTATION);

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});

    // Safety check
    useEffect(() => {
        if (!state?.attemptId || !state?.questions) {
            alert('Sessão inválida ou expirada. Inicie o quiz novamente.');
            navigate('/player/quizzes');
        }
    }, [state, navigate]);

    if (!state?.questions) return null;

    const questions = state.questions as any[];
    const attemptId = state.attemptId;
    const currentQuestion = questions[currentQuestionIndex];
    const totalQuestions = questions.length;
    const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

    const handleOptionSelect = (option: string) => {
        setAnswers(prev => ({
            ...prev,
            [currentQuestion.id]: option
        }));
    };

    const handleNext = () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        // Format answers
        const formattedAnswers = Object.entries(answers).map(([qId, opt]) => ({
            questionId: qId,
            selectedOption: opt
        }));

        if (formattedAnswers.length < totalQuestions) {
            if (!window.confirm('Você não respondeu todas as perguntas. Deseja enviar mesmo assim?')) {
                return;
            }
        }

        try {
            const { data } = await submitQuiz({
                variables: {
                    input: {
                        attemptId,
                        answers: formattedAnswers
                    }
                }
            });
            // Redirect to Result
            navigate(`/player/quizzes/${quizId}/result`, { state: { result: data.submitQuiz } });
        } catch (error: any) {
            alert('Erro ao enviar quiz: ' + error.message);
        }
    };

    return (
        <PlayerLayout>
            <div className="container py-4" style={{ maxWidth: '800px' }}>
                <div className="card shadow-sm">
                    <div className="card-header bg-white py-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <h5 className="mb-0">Questão {currentQuestionIndex + 1} de {totalQuestions}</h5>
                            <span className="badge bg-light text-dark border">
                                {Math.round(progress)}%
                            </span>
                        </div>
                        <div className="progress" style={{ height: '8px' }}>
                            <div className="progress-bar bg-success" role="progressbar" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>

                    <div className="card-body p-4">
                        <h5 className="lead mb-4">{currentQuestion.statement}</h5>

                        <div className="d-grid gap-3">
                            {['A', 'B', 'C', 'D'].map(opt => {
                                const text = currentQuestion[`option${opt}`];
                                if (!text) return null;

                                const isSelected = answers[currentQuestion.id] === opt;

                                return (
                                    <button
                                        key={opt}
                                        className={`btn text-start p-3 ${isSelected ? 'btn-primary' : 'btn-outline-secondary'}`}
                                        onClick={() => handleOptionSelect(opt)}
                                    >
                                        <strong>{opt}.</strong> {text}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="card-footer bg-light py-3 d-flex justify-content-between">
                        <button
                            className="btn btn-secondary"
                            onClick={handlePrevious}
                            disabled={currentQuestionIndex === 0 || submitting}
                        >
                            Anterior
                        </button>

                        {currentQuestionIndex === totalQuestions - 1 ? (
                            <button
                                className="btn btn-success"
                                onClick={handleSubmit}
                                disabled={submitting}
                            >
                                {submitting ? 'Enviando...' : 'Finalizar Quiz'}
                            </button>
                        ) : (
                            <button
                                className="btn btn-primary"
                                onClick={handleNext}
                                disabled={!answers[currentQuestion.id]}
                            >
                                Próxima
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </PlayerLayout>
    );
}
