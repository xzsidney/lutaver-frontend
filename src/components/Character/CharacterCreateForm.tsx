import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { CREATE_CHARACTER_MUTATION } from '../../graphql/character.mutations';
import { ME_CHARACTER_QUERY } from '../../graphql/character.queries';

const TOTAL_POINTS = 16; // 1 base em cada (6) + 10 distribuíveis
const MIN_POINTS = 1;
const MAX_POINTS = 10;

const ATTRIBUTES = [
    { code: 'STRENGTH', name: 'Força', icon: '💪' },
    { code: 'DEXTERITY', name: 'Destreza', icon: '🏃' },
    { code: 'CONSTITUTION', name: 'Constituição', icon: '🛡️' },
    { code: 'INTELLIGENCE', name: 'Inteligência', icon: '🧠' },
    { code: 'CHARISMA', name: 'Carisma', icon: '⭐' },
    { code: 'LUCK', name: 'Sorte', icon: '🍀' },
];

export function CharacterCreateForm({ onSuccess }: { onSuccess?: () => void }) {
    const navigate = useNavigate();

    // Estado dos pontos distribuídos (todos começam com 1)
    const [points, setPoints] = useState({
        STRENGTH: 1,
        DEXTERITY: 1,
        CONSTITUTION: 1,
        INTELLIGENCE: 1,
        CHARISMA: 1,
        LUCK: 1,
    });

    // Estado do nome
    const [characterName, setCharacterName] = useState('');

    const [createCharacter, { loading, error }] = useMutation(CREATE_CHARACTER_MUTATION, {
        refetchQueries: [{ query: ME_CHARACTER_QUERY }],
    });

    const totalUsed = Object.values(points).reduce((a, b) => a + b, 0);
    const pointsRemaining = TOTAL_POINTS - totalUsed;
    const isValidDistribution = pointsRemaining === 0;

    const handleIncrement = (attr: string) => {
        if (pointsRemaining > 0 && points[attr as keyof typeof points] < MAX_POINTS) {
            setPoints({ ...points, [attr]: points[attr as keyof typeof points] + 1 });
        }
    };

    const handleDecrement = (attr: string) => {
        if (points[attr as keyof typeof points] > MIN_POINTS) {
            setPoints({ ...points, [attr]: points[attr as keyof typeof points] - 1 });
        }
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isValidDistribution) {
            alert('Distribua exatamente 15 pontos!');
            return;
        }

        if (!characterName || characterName.length < 3) {
            alert('Nome deve ter no mínimo 3 caracteres!');
            return;
        }

        const attributes = Object.entries(points).map(([code, pts]) => ({
            code,
            points: pts,
        }));

        try {
            await createCharacter({
                variables: {
                    input: {
                        name: characterName,
                        schoolYear: 'FUNDAMENTAL_1_1',
                        attributes,
                    },
                },
            });

            if (onSuccess) {
                onSuccess();
            } else {
                navigate('/player/character');
            }
        } catch (err) {
            console.error('Erro ao criar personagem:', err);
        }
    };


    return (
        <div style={{ maxWidth: '700px', margin: '0 auto', padding: '20px' }}>
            <h2>Criar Novo Personagem</h2>
            <p style={{ color: '#666', marginBottom: '30px' }}>
                Crie seu avatar! Todos os atributos começam com 1 ponto. Distribua mais 10 pontos extras!
            </p>

            <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                {/* Nome */}
                <div>
                    <label htmlFor="name" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                        Nome do Personagem
                    </label>
                    <input
                        id="name"
                        type="text"
                        value={characterName}
                        onChange={(e) => setCharacterName(e.target.value)}
                        placeholder="Ex: Mago das Matemáticas"
                        style={{
                            width: '100%',
                            padding: '12px',
                            fontSize: '16px',
                            border: '2px solid #dee2e6',
                            borderRadius: '4px',
                        }}
                    />
                    {characterName.length > 0 && characterName.length < 3 && (
                        <span style={{ color: '#dc3545', fontSize: '14px', marginTop: '5px', display: 'block' }}>
                            Nome deve ter no mínimo 3 caracteres
                        </span>
                    )}
                </div>

                {/* Ano Escolar */}
                <div>
                    <label htmlFor="schoolYear" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                        Ano Escolar
                    </label>
                    <div style={{
                        width: '100%',
                        padding: '12px',
                        fontSize: '16px',
                        border: '2px solid #dee2e6',
                        borderRadius: '4px',
                        backgroundColor: '#f8f9fa',
                        color: '#495057',
                    }}>
                        1º ano - Fundamental I
                    </div>
                    <span style={{ color: '#6c757d', fontSize: '14px', marginTop: '5px', display: 'block' }}>
                        ℹ️ Todos os personagens começam no 1º ano
                    </span>
                </div>

                {/* Distribuição de Pontos */}
                <div style={{ border: '2px solid #007bff', borderRadius: '8px', padding: '20px', backgroundColor: '#f8f9fa' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0 }}>Distribuir Atributos</h3>
                        <div style={{
                            fontSize: '20px',
                            fontWeight: 'bold',
                            color: isValidDistribution ? '#28a745' : pointsRemaining < 0 ? '#dc3545' : '#007bff',
                        }}>
                            {pointsRemaining} pontos restantes
                        </div>
                    </div>

                    {ATTRIBUTES.map((attr) => (
                        <div
                            key={attr.code}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '15px',
                                marginBottom: '10px',
                                backgroundColor: 'white',
                                borderRadius: '6px',
                                border: '1px solid #dee2e6',
                            }}
                        >
                            <div style={{ flex: 1 }}>
                                <span style={{ fontSize: '20px', marginRight: '10px' }}>{attr.icon}</span>
                                <strong>{attr.name}</strong>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <button
                                    type="button"
                                    onClick={() => handleDecrement(attr.code)}
                                    disabled={points[attr.code as keyof typeof points] <= MIN_POINTS}
                                    style={{
                                        width: '36px',
                                        height: '36px',
                                        fontSize: '20px',
                                        border: 'none',
                                        borderRadius: '50%',
                                        backgroundColor: points[attr.code as keyof typeof points] <= MIN_POINTS ? '#ccc' : '#dc3545',
                                        color: 'white',
                                        cursor: points[attr.code as keyof typeof points] <= MIN_POINTS ? 'not-allowed' : 'pointer',
                                    }}
                                >
                                    −
                                </button>

                                <div style={{
                                    fontSize: '24px',
                                    fontWeight: 'bold',
                                    minWidth: '40px',
                                    textAlign: 'center',
                                }}>
                                    {points[attr.code as keyof typeof points]}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => handleIncrement(attr.code)}
                                    disabled={pointsRemaining <= 0 || points[attr.code as keyof typeof points] >= MAX_POINTS}
                                    style={{
                                        width: '36px',
                                        height: '36px',
                                        fontSize: '20px',
                                        border: 'none',
                                        borderRadius: '50%',
                                        backgroundColor: (pointsRemaining <= 0 || points[attr.code as keyof typeof points] >= MAX_POINTS) ? '#ccc' : '#28a745',
                                        color: 'white',
                                        cursor: (pointsRemaining <= 0 || points[attr.code as keyof typeof points] >= MAX_POINTS) ? 'not-allowed' : 'pointer',
                                    }}
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    ))}

                    {!isValidDistribution && totalUsed > 0 && (
                        <div style={{
                            marginTop: '15px',
                            padding: '10px',
                            backgroundColor: pointsRemaining < 0 ? '#f8d7da' : '#fff3cd',
                            border: `1px solid ${pointsRemaining < 0 ? '#f5c2c7' : '#ffeeba'}`,
                            borderRadius: '4px',
                            color: pointsRemaining < 0 ? '#842029' : '#856404',
                            fontSize: '14px',
                        }}>
                            {pointsRemaining < 0
                                ? `❌ Você excedeu em ${Math.abs(pointsRemaining)} ponto(s)!`
                                : `⚠️ Distribua os ${pointsRemaining} ponto(s) restantes`
                            }
                        </div>
                    )}
                </div>

                {/* Erro */}
                {error && (
                    <div style={{
                        padding: '15px',
                        backgroundColor: '#f8d7da',
                        border: '1px solid #f5c2c7',
                        borderRadius: '4px',
                        color: '#842029',
                    }}>
                        <strong>❌ Erro:</strong> {error.message}
                    </div>
                )}

                {/* Botões */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        style={{
                            flex: 1,
                            padding: '14px',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '16px',
                        }}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading || !isValidDistribution}
                        style={{
                            flex: 2,
                            padding: '14px',
                            backgroundColor: (loading || !isValidDistribution) ? '#ccc' : '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: (loading || !isValidDistribution) ? 'not-allowed' : 'pointer',
                            fontSize: '16px',
                            fontWeight: 'bold',
                        }}
                    >
                        {loading ? 'Criando...' : '✨ Criar Personagem'}
                    </button>
                </div>
            </form>
        </div>
    );
}
