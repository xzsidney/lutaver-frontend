import { useQuery } from '@apollo/client';
import { ME_CHARACTER_QUERY } from '../../graphql/character.queries';
import { CharacterCreateForm } from '../../components/Character/CharacterCreateForm';
import { CharacterCard } from '../../components/Character/CharacterCard';
import { PlayerLayout } from '../../components/layout/PlayerLayout';
import { AffinityList } from '../../components/Affinity/AffinityList';

export function PlayerDashboardPage() {
    // const { user } = useAuth();
    const { data, loading, error } = useQuery(ME_CHARACTER_QUERY);

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
