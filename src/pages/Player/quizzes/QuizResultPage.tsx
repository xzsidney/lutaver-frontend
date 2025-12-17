import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { PlayerLayout } from '../../../components/layout/PlayerLayout';

export function QuizResultPage() {
    const { state } = useLocation();
    const navigate = useNavigate();

    if (!state?.result) {
        return (
            <PlayerLayout>
                <div className="container py-5 text-center">
                    <div className="alert alert-warning">
                        Resultado não encontrado.
                    </div>
                    <Link to="/player/quizzes" className="btn btn-primary">Voltar para Quizzes</Link>
                </div>
            </PlayerLayout>
        );
    }

    const { score, status, correctAnswersCount, totalQuestions, gainedXp, gainedCoins } = state.result;
    const isPassed = status === 'PASSED';

    return (
        <PlayerLayout>
            <div className="container py-5 text-center" style={{ maxWidth: '600px' }}>
                <div className={`card shadow-lg border-${isPassed ? 'success' : 'danger'}`}>
                    <div className={`card-header py-4 text-white ${isPassed ? 'bg-success' : 'bg-danger'}`}>
                        <h1 className="display-4 mb-0">{isPassed ? 'Aprovado!' : 'Tente Novamente'}</h1>
                    </div>
                    <div className="card-body p-5">
                        <h2 className="mb-4">Nota: {Math.round(score)}%</h2>

                        <div className="row justify-content-center mb-4">
                            <div className="col-6">
                                <div className="p-3 bg-light rounded border">
                                    <div className="h4 mb-0 text-primary">{correctAnswersCount}/{totalQuestions}</div>
                                    <div className="small text-muted">Acertos</div>
                                </div>
                            </div>
                        </div>

                        {isPassed ? (
                            <div className="alert alert-success">
                                <h5>Recompensas Recebidas:</h5>
                                <div className="d-flex justify-content-center gap-3 mt-2">
                                    <span className="badge bg-primary p-2 fs-6">+ {gainedXp} XP</span>
                                    <span className="badge bg-warning text-dark p-2 fs-6">+ {gainedCoins} Coins</span>
                                </div>
                            </div>
                        ) : (
                            <div className="alert alert-warning">
                                Você precisa de 70% de acertos para passar. Estude mais e tente novamente!
                            </div>
                        )}

                        <div className="d-grid gap-2 mt-4">
                            <Link to="/player/quizzes" className="btn btn-lg btn-outline-primary">
                                Voltar para Lista
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </PlayerLayout>
    );
}
