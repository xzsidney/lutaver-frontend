import { useQuery, useMutation } from '@apollo/client';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CHARACTER_QUERY, MY_CHARACTERS_QUERY } from '../../graphql/character.queries';
import { DELETE_CHARACTER_MUTATION, RESTORE_HP_MUTATION } from '../../graphql/character.mutations';

export function CharacterDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data, loading, error } = useQuery(CHARACTER_QUERY, {
        variables: { id },
    });

    const [deleteCharacter] = useMutation(DELETE_CHARACTER_MUTATION, {
        refetchQueries: [{ query: MY_CHARACTERS_QUERY }],
        onCompleted: () => navigate('/characters'),
    });

    const [restoreHp] = useMutation(RESTORE_HP_MUTATION, {
        refetchQueries: [{ query: CHARACTER_QUERY, variables: { id } }],
    });

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh'
            }}>
                <p>Carregando personagem...</p>
            </div>
        );
    }

    if (error || !data?.character) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <h2>❌ Personagem não encontrado</h2>
                <Link to="/characters">Voltar para lista</Link>
            </div>
        );
    }

    const character = data.character;
    const hpPercentage = (character.currentHp / character.maxHp) * 100;

    const handleDelete = async () => {
        if (window.confirm(`Tem certeza que deseja deletar ${character.name}?`)) {
            await deleteCharacter({ variables: { id } });
        }
    };

    const handleRestoreFullHp = async () => {
        const amount = character.maxHp - character.currentHp;
        if (amount > 0) {
            await restoreHp({ variables: { characterId: id, amount } });
        }
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
            {/* Header */}
            <div style={{ marginBottom: '30px' }}>
                <Link to="/characters" style={{ color: '#007bff', textDecoration: 'none' }}>
                    ← Voltar para lista
                </Link>
            </div>

            {/* Character Info Card */}
            <div style={{
                backgroundColor: 'white',
                border: '2px solid #dee2e6',
                borderRadius: '8px',
                padding: '30px',
                marginBottom: '20px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 style={{ margin: '0 0 10px 0' }}>{character.name}</h1>
                        <p style={{ margin: 0, color: '#666' }}>
                            Nível {character.level} • {character.schoolYear.replace(/_/g, ' ')}
                        </p>
                    </div>
                    <button
                        onClick={handleDelete}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        🗑️ Deletar
                    </button>
                </div>

                {/* HP Section */}
                <div style={{ marginTop: '30px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <h3 style={{ margin: 0 }}>HP - Pontos de Vida</h3>
                        <button
                            onClick={handleRestoreFullHp}
                            disabled={character.currentHp === character.maxHp}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: character.currentHp === character.maxHp ? '#ccc' : '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: character.currentHp === character.maxHp ? 'not-allowed' : 'pointer'
                            }}
                        >
                            ❤️ Restaurar HP
                        </button>
                    </div>
                    <div style={{
                        width: '100%',
                        height: '30px',
                        backgroundColor: '#e9ecef',
                        borderRadius: '15px',
                        overflow: 'hidden',
                        marginBottom: '10px'
                    }}>
                        <div style={{
                            width: `${hpPercentage}%`,
                            height: '100%',
                            backgroundColor: hpPercentage > 50 ? '#28a745' : '#dc3545',
                            transition: 'width 0.5s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '14px'
                        }}>
                            {character.currentHp}/{character.maxHp}
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '20px',
                    marginTop: '30px'
                }}>
                    <div style={{
                        padding: '15px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
                            {character.level}
                        </div>
                        <div style={{ fontSize: '14px', color: '#666' }}>Nível</div>
                    </div>
                    <div style={{
                        padding: '15px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
                            {character.xp}
                        </div>
                        <div style={{ fontSize: '14px', color: '#666' }}>XP</div>
                    </div>
                    <div style={{
                        padding: '15px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffc107' }}>
                            {character.coins} 🪙
                        </div>
                        <div style={{ fontSize: '14px', color: '#666' }}>Moedas</div>
                    </div>
                </div>
            </div>

            {/* Attributes Section */}
            <div style={{
                backgroundColor: 'white',
                border: '2px solid #dee2e6',
                borderRadius: '8px',
                padding: '30px',
                marginBottom: '20px'
            }}>
                <h2 style={{ marginTop: 0 }}>Atributos</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    {character.attributes.map((attr: any) => (
                        <div key={attr.id} style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <strong>{attr.attribute.name}</strong>
                                <span style={{ fontWeight: 'bold', color: '#007bff' }}>
                                    {attr.totalValue}
                                </span>
                            </div>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                                Base: {attr.baseValue} | Bônus: {attr.bonusValue > 0 ? '+' : ''}{attr.bonusValue}
                            </div>
                            <div style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
                                {attr.attribute.description}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Powers Section */}
            {character.powers && character.powers.length > 0 && (
                <div style={{
                    backgroundColor: 'white',
                    border: '2px solid #dee2e6',
                    borderRadius: '8px',
                    padding: '30px',
                    marginBottom: '20px'
                }}>
                    <h2 style={{ marginTop: 0 }}>Poderes ({character.powers.length})</h2>
                    <div style={{ display: 'grid', gap: '15px' }}>
                        {character.powers.map((cp: any) => (
                            <div key={cp.id} style={{
                                padding: '15px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '8px',
                                border: cp.isEquipped ? '2px solid #28a745' : 'none'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <strong>{cp.power.name}</strong>
                                    {cp.isEquipped && <span style={{ color: '#28a745' }}>✓ Equipado</span>}
                                </div>
                                <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                                    {cp.power.description}
                                </div>
                                <div style={{ fontSize: '12px', marginTop: '5px' }}>
                                    Disciplina: {cp.power.discipline} | Tipo: {cp.power.type} | Raridade: {cp.power.rarity}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Inventory Section */}
            {character.inventory && character.inventory.length > 0 && (
                <div style={{
                    backgroundColor: 'white',
                    border: '2px solid #dee2e6',
                    borderRadius: '8px',
                    padding: '30px'
                }}>
                    <h2 style={{ marginTop: 0 }}>Inventário ({character.inventory.length} itens)</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                        {character.inventory.map((slot: any) => (
                            <div key={slot.id} style={{
                                padding: '15px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '8px',
                                border: slot.isEquipped ? '2px solid #007bff' : 'none'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <strong>{slot.item.name}</strong>
                                    {slot.item.stackable && <span>x{slot.quantity}</span>}
                                </div>
                                <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                                    {slot.item.description}
                                </div>
                                {slot.isEquipped && (
                                    <div style={{ fontSize: '12px', color: '#007bff', marginTop: '5px' }}>
                                        ✓ Equipado ({slot.equippedSlot})
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
