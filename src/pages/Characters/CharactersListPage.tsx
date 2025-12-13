import { useQuery } from '@apollo/client';
import { Link, useNavigate } from 'react-router-dom';
import { MY_CHARACTERS_QUERY } from '../../graphql/character.queries';
import { useAuth } from '../../context/AuthContext';

export function CharactersListPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { data, loading, error } = useQuery(MY_CHARACTERS_QUERY);

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh'
            }}>
                <p>Carregando personagens...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <h2>❌ Erro ao carregar personagens</h2>
                <p>{error.message}</p>
                <button onClick={() => navigate('/')}>Voltar</button>
            </div>
        );
    }

    const characters = data?.myCharacters || [];

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '30px'
            }}>
                <div>
                    <h1>Meus Personagens</h1>
                    <p style={{ color: '#666' }}>Olá, {user?.name}!</p>
                </div>
                <button
                    onClick={logout}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Sair
                </button>
            </div>

            {/* Botão Criar Personagem */}
            <div style={{ marginBottom: '20px' }}>
                <Link
                    to="/characters/new"
                    style={{
                        display: 'inline-block',
                        padding: '12px 24px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '4px',
                        fontWeight: 'bold'
                    }}
                >
                    ➕ Criar Novo Personagem
                </Link>
            </div>

            {/* Lista de Personagens */}
            {characters.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px'
                }}>
                    <h3>Nenhum personagem criado ainda</h3>
                    <p>Crie seu primeiro personagem para começar sua jornada!</p>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '20px'
                }}>
                    {characters.map((character: any) => (
                        <Link
                            key={character.id}
                            to={`/characters/${character.id}`}
                            style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                            <div style={{
                                border: '2px solid #dee2e6',
                                borderRadius: '8px',
                                padding: '20px',
                                backgroundColor: 'white',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                cursor: 'pointer'
                            }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                {/* Nome e Nível */}
                                <div style={{ marginBottom: '15px' }}>
                                    <h3 style={{ margin: '0 0 5px 0' }}>{character.name}</h3>
                                    <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                                        Nível {character.level} • {character.schoolYear.replace(/_/g, ' ')}
                                    </p>
                                </div>

                                {/* HP Bar */}
                                <div style={{ marginBottom: '15px' }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        fontSize: '12px',
                                        marginBottom: '5px'
                                    }}>
                                        <span>HP</span>
                                        <span>{character.currentHp}/{character.maxHp}</span>
                                    </div>
                                    <div style={{
                                        width: '100%',
                                        height: '10px',
                                        backgroundColor: '#e9ecef',
                                        borderRadius: '5px',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            width: `${(character.currentHp / character.maxHp) * 100}%`,
                                            height: '100%',
                                            backgroundColor: character.currentHp > character.maxHp * 0.5 ? '#28a745' : '#dc3545',
                                            transition: 'width 0.3s'
                                        }} />
                                    </div>
                                </div>

                                {/* Stats */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '10px',
                                    fontSize: '14px'
                                }}>
                                    <div>
                                        <strong>XP:</strong> {character.xp}
                                    </div>
                                    <div>
                                        <strong>Moedas:</strong> {character.coins} 🪙
                                    </div>
                                </div>

                                {/* Atributos Preview */}
                                <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #dee2e6' }}>
                                    <p style={{ fontSize: '12px', color: '#666', margin: '0 0 8px 0' }}>
                                        Atributos Principais:
                                    </p>
                                    <div style={{ fontSize: '12px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                        {character.attributes?.slice(0, 4).map((attr: any) => (
                                            <span key={attr.id} style={{
                                                backgroundColor: '#f8f9fa',
                                                padding: '4px 8px',
                                                borderRadius: '4px'
                                            }}>
                                                {attr.attribute.code.substring(0, 3)}: {attr.totalValue}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
