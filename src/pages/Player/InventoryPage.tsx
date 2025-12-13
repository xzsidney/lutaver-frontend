import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { INVENTORY_QUERY, USE_ITEM_MUTATION, EQUIP_ITEM_MUTATION } from '../../graphql/shop.queries';
import { ME_CHARACTER_QUERY } from '../../graphql/character.queries';
import { PlayerLayout } from '../../components/layout/PlayerLayout';

export function InventoryPage() {
    const { data: charData } = useQuery(ME_CHARACTER_QUERY);
    const characterId = charData?.meCharacter?.id;
    const { data: invData, loading, error, refetch } = useQuery(INVENTORY_QUERY, {
        variables: { characterId: characterId },
        skip: !characterId
    });

    const [useItem] = useMutation(USE_ITEM_MUTATION, {
        onCompleted: () => { refetch(); },
        update(_cache, { data: { useItem: _useItem } }) {
            // Optional manual cache update
        }
    });

    const [equipItem] = useMutation(EQUIP_ITEM_MUTATION, {
        onCompleted: () => { refetch(); }
    });

    const [message, setMessage] = useState<string | null>(null);

    const handleUse = async (itemId: string) => {
        try {
            const res = await useItem({ variables: { itemId } });
            if (res.data?.useItem?.success) {
                setMessage(`✅ ${res.data.useItem.message}`);
                setTimeout(() => setMessage(null), 3000);
            }
        } catch (err: any) {
            setMessage(`❌ ${err.message}`);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const handleEquip = async (itemId: string, slot: string) => {
        try {
            await equipItem({ variables: { characterId, itemId, slot } });
            setMessage(`✅ Item equipado!`);
            setTimeout(() => setMessage(null), 3000);
        } catch (err: any) {
            setMessage(`❌ ${err.message}`);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    if (!characterId) return <PlayerLayout><div className="p-5 text-center">Carregando personagem...</div></PlayerLayout>;
    if (loading) return <PlayerLayout><div className="p-5 text-center">Carregando inventário...</div></PlayerLayout>;
    if (error) return <PlayerLayout><div className="p-5 text-center text-danger">Erro: {error.message}</div></PlayerLayout>;

    const slots = invData?.characterInventory || [];

    return (
        <PlayerLayout>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="h4 section-title mb-0">Meu Inventário</h1>
            </div>

            {message && (
                <div className="alert alert-info mb-4">
                    {message}
                </div>
            )}

            <div className="row g-3">
                {slots.length === 0 ? (
                    <div className="col-12 text-center text-muted">Inventário vazio.</div>
                ) : (
                    slots.map((slot: any) => (
                        <div className="col-md-3" key={slot.id}>
                            <div className={`action-card d-flex flex-column h-100 ${slot.isEquipped ? 'border-primary' : ''}`}>
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <div className={`icon-chip ${slot.item.type === 'EQUIPMENT' ? 'chip-blue' : 'chip-green'}`}>
                                        {slot.item.type === 'EQUIPMENT' ? '🛡️' : '💊'}
                                    </div>
                                    <div className="flex-grow-1">
                                        <div className="d-flex justify-content-between align-items-start">
                                            <strong>{slot.item.name}</strong>
                                            {slot.isEquipped && <span className="badge bg-primary">Equipado</span>}
                                        </div>
                                        <div className="small text-muted" style={{ fontSize: '0.75rem' }}>Qtd: {slot.quantity}</div>
                                    </div>
                                </div>

                                <p className="section-sub small flex-grow-1 mb-3">{slot.item.description}</p>

                                <div className="mt-auto pt-2 border-top">
                                    <div className="d-flex gap-2">
                                        {slot.item.type === 'CONSUMABLE' && (
                                            <button
                                                onClick={() => handleUse(slot.item.id)}
                                                className="btn btn-sm btn-primary-br btn-br w-100"
                                            >
                                                Usar
                                            </button>
                                        )}
                                        {slot.item.type === 'EQUIPMENT' && !slot.isEquipped && (
                                            <button
                                                onClick={() => handleEquip(slot.item.id, slot.item.equipmentSlot)}
                                                className="btn btn-sm btn-ghost btn-br w-100"
                                            >
                                                Equipar
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </PlayerLayout>
    );
}
