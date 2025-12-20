import { useQuery } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { ME_CHARACTER_QUERY } from '../../graphql/character.queries';
import { GET_TOWER_FLOORS } from '../../graphql/tower.queries';
import { CharacterCreateForm } from '../../components/Character/CharacterCreateForm';
import { CharacterCard } from '../../components/Character/CharacterCard';
import { PlayerLayout } from '../../components/layout/PlayerLayout';
import { AffinityList } from '../../components/Affinity/AffinityList';

export function PlayerDashboardPage() {
    const navigate = useNavigate();
    const { data, loading, error } = useQuery(ME_CHARACTER_QUERY);
    const { data: towerData } = useQuery(GET_TOWER_FLOORS);

    if (loading) {
        return (
            <PlayerLayout>
                <div className="p-5 text-center">Carregando dashboard...</div>
            </PlayerLayout>
        );
    }

    if (error) {
        return (
            <PlayerLayout>
                <div className="p-5 text-center">
                    <h2>❌ Erro ao carregar dados</h2>
                    <p>{error.message}</p>
                    <button className="btn btn-primary-br" onClick={() => window.location.reload()}>Tentar novamente</button>
                </div>
            </PlayerLayout>
        );
    }

    const character = data?.meCharacter;

    const getCharacterFloor = () => {
        if (!towerData?.towerFloors || !character) return null;
        return towerData.towerFloors.find(
            (floor: any) => floor.schoolYear === character.schoolYear
        );
    };

    const handleExploreFloor = () => {
        const floor = getCharacterFloor();
        if (floor && character?.id) {
            localStorage.setItem('currentCharacterId', character.id);
            // Redirecionar para o andar correto
            const floorPath = floor.floorNumber === 1 ? 'andar01' : 'andar02';
            navigate(`/floor/${floorPath}/${floor.id}`);
        }
    };

    return (
        <PlayerLayout>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="h4 section-title mb-0">Dashboard</h1>
            </div>

            {!character ? (
                <div>
                    <div className="alert alert-warning text-center mb-4 panel">
                        <h2 className="h4">👋 Bem-vindo ao LUTAVER!</h2>
                        <p className="mb-0">
                            Você ainda não possui um personagem. Crie um para começar sua jornada de aprendizado!
                        </p>
                    </div>
                    <div className="panel">
                        <CharacterCreateForm />
                    </div>
                </div>
            ) : (
                <div className="d-flex flex-column gap-4">
                    <CharacterCard character={character} />

                    {/* Torre de Exploração */}
                    <div className="panel border-start border-4 border-purple">
                        <h3 className="h5 section-title mb-3">
                            🏰 Torre de Exploração
                        </h3>
                        <p className="text-muted small mb-3">
                            Explore os andares da torre, enfrente inimigos e complete quizzes para evoluir seu personagem!
                        </p>
                        <div className="d-flex gap-3 align-items-center flex-wrap">
                            <button
                                onClick={handleExploreFloor}
                                disabled={!getCharacterFloor()}
                                className={`btn ${getCharacterFloor() ? 'btn-purple' : 'btn-secondary'}`}
                                style={{
                                    minWidth: '200px',
                                    fontSize: '16px',
                                    fontWeight: 'bold'
                                }}
                            >
                                🏰 Explorar Torre
                            </button>
                            <button
                                onClick={() => navigate('/test/fundamental-map')}
                                className="btn"
                                style={{
                                    minWidth: '200px',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    backgroundColor: '#22c55e',
                                    color: 'white',
                                    border: 'none'
                                }}
                            >
                                🧪 Fundamental 1-1 (Teste)
                            </button>
                            {getCharacterFloor() && (
                                <div className="badge bg-light text-dark border px-3 py-2" style={{ fontSize: '14px' }}>
                                    📍 {getCharacterFloor().name}
                                </div>
                            )}
                        </div>
                        {!getCharacterFloor() && (
                            <div className="alert alert-warning mt-3 mb-0 small">
                                ⚠️ Nenhum andar disponível para o seu ano escolar no momento.
                            </div>
                        )}
                    </div>


                    {/* Sistema de Batalha */}
                    <div className="panel border-start border-4 border-danger">
                        <h3 className="h5 section-title mb-3">
                            ⚔️ Sistema de Batalha
                        </h3>
                        <p className="text-muted small mb-3">
                            Teste sua força contra inimigos poderosos e ganhe recompensas!
                        </p>
                        <button
                            onClick={() => navigate('/battle')}
                            className="btn btn-danger"
                            style={{
                                minWidth: '200px',
                                fontSize: '16px',
                                fontWeight: 'bold'
                            }}
                        >
                            ⚔️ Batalhar (Turno)
                        </button>
                        <button
                            onClick={() => navigate('/battle-2d')}
                            className="btn btn-warning"
                            style={{
                                minWidth: '200px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                color: '#000'
                            }}
                        >
                            🥊 Batalha 2D
                        </button>
                        <button
                            onClick={() => navigate('/hidden-battle')}
                            className="btn"
                            style={{
                                minWidth: '200px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                backgroundColor: '#2e1065', // violet-950
                                color: '#38bdf8', // sky-400
                                border: '1px solid #4ade80' // green-400
                            }}
                        >
                            🤫 Batalha Escondida
                        </button>
                    </div>

                    {/* Missões Stealth */}
                    <div className="panel border-start border-4 border-info">
                        <h3 className="h5 section-title mb-3">
                            🕵️ Missões Stealth
                        </h3>
                        <p className="text-muted small mb-3">
                            Teste suas habilidades furtivas em missões de infiltração! Evite guardas, colete pacotes e escape sem ser detectado.
                        </p>
                        <button
                            onClick={() => navigate('/player/stealth-missions')}
                            className="btn btn-info"
                            style={{
                                minWidth: '200px',
                                fontSize: '16px',
                                fontWeight: 'bold'
                            }}
                        >
                            🎮 Jogar Stealth Missions
                        </button>
                    </div>

                    {/* Afinidades Acadêmicas */}
                    <div className="panel">
                        <h3 className="h5 section-title mb-3">Afinidades Acadêmicas</h3>
                        <AffinityList affinities={character.affinities || []} />
                    </div>

                    {/* Informações Adicionais */}
                    <div className="row g-3">
                        <div className="col-md-6">
                            <div className="panel h-100 border-start border-4 border-success">
                                <h3 className="h5 section-title text-success mb-3">
                                    📚 Próximos Passos
                                </h3>
                                <ul className="text-muted small">
                                    <li>Complete missões para ganhar XP</li>
                                    <li>Colete moedas e itens</li>
                                    <li>Aprenda novos poderes</li>
                                    <li>Suba de nível!</li>
                                </ul>
                            </div>
                        </div>

                        <div className="col-md-6">
                            <div className="panel h-100 border-start border-4 border-primary">
                                <h3 className="h5 section-title text-primary mb-3">
                                    ⚡ Dicas
                                </h3>
                                <ul className="text-muted small">
                                    <li>Restaure seu HP antes de batalhas</li>
                                    <li>Equipe itens estrategicamente</li>
                                    <li>Escolha poderes que combinam</li>
                                    <li>Gerencie seus recursos</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </PlayerLayout>
    );
}
