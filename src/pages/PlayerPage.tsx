import { useQuery } from '@apollo/client';
import { GET_PLAYER_HOME_DATA } from '../graphql/player.queries';
import { useNavigate } from 'react-router-dom';
import { PlayerLayout } from '../components/layout/PlayerLayout';

// Intefaces for the data
interface Attribute {
    attribute: {
        name: string;
        code: string;
    };
    totalValue: number;
}

interface Affinity {
    discipline: {
        name: string;
        code: string;
    };
    percentage: number;
}

interface CharacterData {
    id: string;
    name: string;
    level: number;
    xp: number;
    coins: number;
    currentHp: number;
    maxHp: number;
    schoolYear: string;
    attributes: Attribute[];
    affinities: Affinity[];
}

export function PlayerPage() {
    // const { logout } = useAuth(); // Not used directly here anymore
    const navigate = useNavigate();
    const { data, loading, error } = useQuery(GET_PLAYER_HOME_DATA);

    if (loading) return (
        <PlayerLayout>
            <div className="p-5 text-center">Carregando dados...</div>
        </PlayerLayout>
    );

    if (error) return (
        <PlayerLayout>
            <div className="p-5 text-center text-danger">Erro: {error.message}</div>
        </PlayerLayout>
    );

    const char: CharacterData = data?.meCharacter;
    const user = data?.me;

    // Use character data if available
    if (!char) {
        return (
            <PlayerLayout>
                <div className="panel p-5 text-center">
                    <h2>Bem-vindo, {user?.name}!</h2>
                    <p>Você ainda não tem um personagem.</p>
                    <button className="btn btn-primary-br btn-br" onClick={() => navigate('/characters/new')}>
                        Criar Personagem
                    </button>
                </div>
            </PlayerLayout>
        );
    }

    // Calculate percentages for bars
    const hpPercent = Math.min(100, (char.currentHp / char.maxHp) * 100);
    // XP mock visual for now
    const xpPercent = Math.min(100, char.xp % 100);

    return (
        <PlayerLayout>
            {/* HERO / STATUS */}
            <div className="row g-3 mb-4">
                <div className="col-lg-7">
                    <div className="panel h-100">
                        <h1 className="h4 section-title mb-2">Bem-vindo, {char.name}</h1>
                        <p className="section-sub mb-3">
                            Continue sua jornada pela Torre do Saber respondendo quizzes e fortalecendo suas disciplinas.
                        </p>

                        <div className="row g-2">
                            <div className="col-4">
                                <div className="stat">
                                    <div className="stat-label">Ano</div>
                                    <div className="stat-value">{char.schoolYear.replace('FUNDAMENTAL_', '').replace('_', 'º ')}</div>
                                </div>
                            </div>
                            <div className="col-4">
                                <div className="stat">
                                    <div className="stat-label">Nível</div>
                                    <div className="stat-value">{char.level}</div>
                                </div>
                            </div>
                            <div className="col-4">
                                <div className="stat">
                                    <div className="stat-label">Moedas</div>
                                    <div className="stat-value">{char.coins}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-lg-5">
                    <div className="panel h-100">
                        <div className="mb-2 d-flex justify-content-between">
                            <strong>Vida</strong><span>{char.currentHp} / {char.maxHp}</span>
                        </div>
                        <div className="progress-custom mb-3">
                            <div className="progress-bar-hp" style={{ width: `${hpPercent}%` }}></div>
                        </div>

                        <div className="mb-2 d-flex justify-content-between">
                            <strong>Experiência</strong><span>{char.xp}</span>
                        </div>
                        <div className="progress-custom">
                            <div className="progress-bar-xp" style={{ width: `${xpPercent}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ACTIONS */}
            <section className="mb-4">
                <h2 className="section-title h5 mb-2">Ações</h2>

                <div className="row g-3">
                    <div className="col-md-3">
                        <div className="action-card">
                            <div className="d-flex align-items-center gap-2 mb-2">
                                <div className="icon-chip chip-yellow">Q</div>
                                <strong>Quiz</strong>
                            </div>
                            <p className="section-sub small">Responder perguntas do seu ano.</p>
                            <button className="btn btn-primary-br btn-br w-100" onClick={() => navigate('/player/quizzes')}>Iniciar</button>
                        </div>
                    </div>

                    <div className="col-md-3">
                        <div className="action-card">
                            <div className="d-flex align-items-center gap-2 mb-2">
                                <div className="icon-chip chip-blue">📖</div>
                                <strong>História</strong>
                            </div>
                            <p className="section-sub small">Avançar na aventura.</p>
                            <button className="btn btn-ghost btn-br w-100" onClick={() => navigate('/player/story')}>Continuar</button>
                        </div>
                    </div>

                    <div className="col-md-3">
                        <div className="action-card">
                            <div className="d-flex align-items-center gap-2 mb-2">
                                <div className="icon-chip chip-green">🎒</div>
                                <strong>Inventário</strong>
                            </div>
                            <p className="section-sub small">Itens e equipamentos.</p>
                            <button className="btn btn-ghost btn-br w-100" onClick={() => navigate('/player/inventory')}>Abrir</button>
                        </div>
                    </div>

                    <div className="col-md-3">
                        <div className="action-card">
                            <div className="d-flex align-items-center gap-2 mb-2">
                                <div className="icon-chip chip-yellow">🛒</div>
                                <strong>Loja</strong>
                            </div>
                            <p className="section-sub small">Comprar itens úteis.</p>
                            <button className="btn btn-primary-br btn-br w-100" onClick={() => navigate('/player/shop')}>Entrar</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* DISCIPLINES */}
            <section>
                <h2 className="section-title h5 mb-2">Disciplinas do Ano</h2>

                <div className="row g-3">
                    {char.affinities.map((aff) => (
                        <div className="col-md-4" key={aff.discipline.code}>
                            <div className="discipline h-100">
                                <strong>{aff.discipline.name}</strong>
                                <div className="progress-custom mt-2">
                                    <div className="progress-bar-xp" style={{ width: `${aff.percentage}%` }}></div>
                                </div>
                                <small className="section-sub">Afinidade: {aff.percentage}%</small>
                            </div>
                        </div>
                    ))}
                    {char.affinities.length === 0 && (
                        <div className="col-12">
                            <p className="text-muted small">Nenhuma disciplina registrada ainda.</p>
                        </div>
                    )}
                </div>
            </section>
        </PlayerLayout>
    );
}
