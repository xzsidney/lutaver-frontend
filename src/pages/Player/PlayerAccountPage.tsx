import { useQuery } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { ME_QUERY } from '../../graphql/queries';
import { ME_CHARACTER_QUERY } from '../../graphql/character.queries';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export function PlayerAccountPage() {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const { data: userData, loading: userLoading } = useQuery(ME_QUERY);
    const { data: characterData, loading: characterLoading } = useQuery(ME_CHARACTER_QUERY);
    const [showPasswordChange, setShowPasswordChange] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    if (userLoading || characterLoading) {
        return (
            <div className="container py-5">
                <div className="text-center">Carregando...</div>
            </div>
        );
    }

    const user = userData?.me;
    const character = characterData?.meCharacter;

    return (
        <div className="container py-5" style={{ maxWidth: '900px' }}>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="h3">Minha Conta</h1>
                <button className="btn btn-outline-danger" onClick={handleLogout}>Sair</button>
            </div>

            {/* User Info Card */}
            <div className="card mb-4">
                <div className="card-body">
                    <h2 className="h5 card-title mb-3">Informações da Conta</h2>
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label className="form-label text-muted small">Nome</label>
                            <div className="fw-bold">{user?.name}</div>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label text-muted small">Email</label>
                            <div className="fw-bold">{user?.email}</div>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label text-muted small">Perfil</label>
                            <div>
                                <span className="badge bg-primary">{user?.role}</span>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label text-muted small">Membro desde</label>
                            <div>{new Date(user?.createdAt).toLocaleDateString('pt-BR')}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Character Card */}
            {character ? (
                <div className="card mb-4">
                    <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h2 className="h5 card-title mb-0">Meu Personagem</h2>
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={() => navigate('/player/character')}
                            >
                                Ver Personagem →
                            </button>
                        </div>
                        <div className="row align-items-center">
                            <div className="col-md-8">
                                <h3 className="h6 mb-2">{character.name}</h3>
                                <div className="row g-2 text-sm">
                                    <div className="col-6">
                                        <span className="text-muted">Nível:</span> <strong>{character.level}</strong>
                                    </div>
                                    <div className="col-6">
                                        <span className="text-muted">XP:</span> <strong>{character.xp}</strong>
                                    </div>
                                    <div className="col-6">
                                        <span className="text-muted">HP:</span> <strong>{character.currentHp}/{character.maxHp}</strong>
                                    </div>
                                    <div className="col-6">
                                        <span className="text-muted">Moedas:</span> <strong>🪙 {character.coins}</strong>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4 text-end">
                                <div className="display-4">🎮</div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="card mb-4 border-warning">
                    <div className="card-body text-center">
                        <h2 className="h5 mb-3">Nenhum Personagem Criado</h2>
                        <p className="text-muted mb-3">Crie seu personagem para começar a jogar!</p>
                        <button
                            className="btn btn-warning"
                            onClick={() => navigate('/characters/new')}
                        >
                            Criar Personagem
                        </button>
                    </div>
                </div>
            )}

            {/* Security Section */}
            <div className="card">
                <div className="card-body">
                    <h2 className="h5 card-title mb-3">Segurança</h2>
                    {!showPasswordChange ? (
                        <button
                            className="btn btn-outline-secondary"
                            onClick={() => setShowPasswordChange(true)}
                        >
                            Alterar Senha
                        </button>
                    ) : (
                        <div>
                            <div className="alert alert-info">
                                <strong>Em desenvolvimento</strong> - A funcionalidade de alteração de senha será implementada em breve.
                            </div>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowPasswordChange(false)}
                            >
                                Cancelar
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
