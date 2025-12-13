import { useMutation } from '@apollo/client';
import { DELETE_CHARACTER_MUTATION, RESTORE_HP_MUTATION } from '../../graphql/character.mutations';
import { ME_CHARACTER_QUERY } from '../../graphql/character.queries';
import { useState } from 'react';
import { CharacterEditModal } from './CharacterEditModal';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface CharacterCardProps {
    character: any;
}

export function CharacterCard({ character }: CharacterCardProps) {
    const [showEditModal, setShowEditModal] = useState(false);

    const [deleteCharacter, { loading: deleting }] = useMutation(DELETE_CHARACTER_MUTATION, {
        refetchQueries: [{ query: ME_CHARACTER_QUERY }],
    });

    const [restoreHp] = useMutation(RESTORE_HP_MUTATION, {
        refetchQueries: [{ query: ME_CHARACTER_QUERY }],
    });

    const hpPercentage = (character.currentHp / character.maxHp) * 100;

    const handleDelete = async () => {
        if (window.confirm(`Tem certeza que deseja deletar ${character.name}? Esta ação não pode ser desfeita!`)) {
            try {
                await deleteCharacter();
            } catch (err) {
                console.error('Erro ao deletar personagem:', err);
                alert('Erro ao deletar personagem. Tente novamente.');
            }
        }
    };

    const handleRestoreFullHp = async () => {
        const amount = character.maxHp - character.currentHp;
        if (amount > 0) {
            try {
                await restoreHp({ variables: { characterId: character.id, amount } });
            } catch (err) {
                console.error('Erro ao restaurar HP:', err);
            }
        }
    };

    return (
        <>
            <Card className="character-card">
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '25px' }}>
                    <div>
                        <h2 style={{ margin: '0 0 10px 0', color: 'var(--primary-dark)' }}>{character.name}</h2>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <Badge label={`Nível ${character.level}`} variant="primary" />
                            <Badge label={character.schoolYear.replace(/_/g, ' ')} variant="info" />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setShowEditModal(true)}
                            leftIcon="✏️"
                        >
                            Editar
                        </Button>
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={handleDelete}
                            disabled={deleting}
                            leftIcon="🗑️"
                        >
                            Deletar
                        </Button>
                    </div>
                </div>

                {/* HP Bar */}
                <div style={{ marginBottom: '25px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            ❤️ Pontos de Vida (HP)
                        </h3>
                        <Button
                            size="sm"
                            variant={character.currentHp === character.maxHp ? 'ghost' : 'success' as any}
                            onClick={handleRestoreFullHp}
                            disabled={character.currentHp === character.maxHp}
                            leftIcon="💚"
                        >
                            Restaurar HP
                        </Button>
                    </div>
                    <div style={{
                        width: '100%',
                        height: '24px',
                        backgroundColor: '#e9ecef',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        position: 'relative',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{
                            width: `${hpPercentage}%`,
                            height: '100%',
                            backgroundColor: hpPercentage > 50 ? '#28a745' : hpPercentage > 25 ? '#ffc107' : '#dc3545',
                            transition: 'width 0.5s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }} />
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: hpPercentage > 50 ? 'white' : '#333',
                            fontWeight: 'bold',
                            fontSize: '12px',
                            textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                        }}>
                            {character.currentHp}/{character.maxHp}
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '15px',
                    marginBottom: '25px',
                }}>
                    <Card variant="flat" padding="md" style={{ backgroundColor: '#e7f3ff', border: '1px solid #b3d7ff' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff', textAlign: 'center' }}>
                            {character.level}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '5px', textAlign: 'center' }}>Nível</div>
                    </Card>
                    <Card variant="flat" padding="md" style={{ backgroundColor: '#d4edda', border: '1px solid #c3e6cb' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745', textAlign: 'center' }}>
                            {character.xp}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '5px', textAlign: 'center' }}>XP</div>
                    </Card>
                    <Card variant="flat" padding="md" style={{ backgroundColor: '#fff3cd', border: '1px solid #ffeeba' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#856404', textAlign: 'center' }}>
                            {character.coins} 🪙
                        </div>
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '5px', textAlign: 'center' }}>Moedas</div>
                    </Card>
                </div>

                {/* Atributos */}
                <Card variant="outlined" padding="md" style={{ backgroundColor: 'var(--bg-color)' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '15px', fontSize: '1.1rem' }}>📊 Atributos</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '15px' }}>
                        {character.attributes.map((attr: any) => (
                            <div key={attr.id} style={{
                                padding: '12px',
                                backgroundColor: 'white',
                                borderRadius: '8px',
                                boxShadow: 'var(--shadow-sm)',
                                border: '1px solid rgba(0,0,0,0.05)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                                    <strong style={{ fontSize: '0.9rem' }}>{attr.attribute.name}</strong>
                                    <span style={{
                                        fontWeight: 'bold',
                                        fontSize: '1.2rem',
                                        color: 'var(--primary-color)',
                                    }}>
                                        {attr.totalValue}
                                    </span>
                                </div>
                                <div style={{ fontSize: '11px', color: '#999' }}>
                                    Base: {attr.baseValue}
                                    {attr.bonusValue > 0 && <span style={{ color: '#28a745' }}> +{attr.bonusValue}</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </Card>

            {showEditModal && (
                <CharacterEditModal
                    character={character}
                    onClose={() => setShowEditModal(false)}
                />
            )}
        </>
    );
}
