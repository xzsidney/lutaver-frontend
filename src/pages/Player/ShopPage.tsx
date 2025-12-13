import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { SHOP_ITEMS_QUERY, BUY_ITEM_MUTATION } from '../../graphql/shop.queries';
import { ME_CHARACTER_QUERY } from '../../graphql/character.queries';
import { PlayerLayout } from '../../components/layout/PlayerLayout';

export function ShopPage() {
    const { data: charData } = useQuery(ME_CHARACTER_QUERY);
    const { data: shopData, loading, error } = useQuery(SHOP_ITEMS_QUERY);
    const [buyItem] = useMutation(BUY_ITEM_MUTATION, {
        refetchQueries: [{ query: ME_CHARACTER_QUERY }]
    });

    const [message, setMessage] = useState<string | null>(null);

    const handleBuy = async (itemId: string, _price: number) => {
        try {
            const res = await buyItem({ variables: { itemId, quantity: 1 } });
            if (res.data?.buyItem?.success) {
                setMessage(`✅ ${res.data.buyItem.message}`);
                setTimeout(() => setMessage(null), 3000);
            }
        } catch (err: any) {
            setMessage(`❌ ${err.message}`);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    if (loading) return (
        <PlayerLayout>
            <div className="p-5 text-center">Carregando loja...</div>
        </PlayerLayout>
    );

    if (error) return (
        <PlayerLayout>
            <div className="p-5 text-center text-danger">Erro ao carregar loja: {error.message}</div>
        </PlayerLayout>
    );

    const items = shopData?.shopItems || [];
    const coins = charData?.meCharacter?.coins || 0;

    return (
        <PlayerLayout>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="h4 section-title mb-0">Loja de Itens</h1>
                <div className="panel py-2 px-3 d-flex align-items-center gap-2">
                    <span className="text-muted small">Seu Saldo:</span>
                    <strong className="text-success">{coins} moedas</strong>
                </div>
            </div>

            {message && (
                <div className="alert alert-info mb-4">
                    {message}
                </div>
            )}

            <div className="row g-3">
                {items.length === 0 ? (
                    <div className="col-12 text-center text-muted">A loja está vazia no momento.</div>
                ) : (
                    items.map((item: any) => (
                        <div className="col-md-3" key={item.id}>
                            <div className="action-card d-flex flex-column h-100">
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <div className={`icon-chip ${item.price > 50 ? 'chip-yellow' : 'chip-blue'}`}>
                                        {item.type === 'EQUIPMENT' ? '⚔️' : '🧪'}
                                    </div>
                                    <div>
                                        <strong>{item.name}</strong>
                                        <div className="small text-muted" style={{ fontSize: '0.75rem' }}>{item.rarity} - {item.type}</div>
                                    </div>
                                </div>

                                <p className="section-sub small flex-grow-1 mb-3">{item.description}</p>

                                <div className="mt-auto border-top pt-2">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <small className="text-muted">Preço</small>
                                        <strong>{item.price}</strong>
                                    </div>
                                    <button
                                        onClick={() => handleBuy(item.id, item.price)}
                                        disabled={coins < item.price}
                                        className={`btn w-100 btn-br ${coins < item.price ? 'btn-secondary' : 'btn-primary-br'}`}
                                        style={{ opacity: coins < item.price ? 0.6 : 1 }}
                                    >
                                        {coins < item.price ? 'Saldo Insuficiente' : 'Comprar'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </PlayerLayout>
    );
}
