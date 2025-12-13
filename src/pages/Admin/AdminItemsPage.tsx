import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { AdminLayout } from '../../components/layout/AdminLayout';
import {
    ALL_ITEMS_QUERY,
    CREATE_ITEM_MUTATION,
    UPDATE_ITEM_MUTATION,
    DELETE_ITEM_MUTATION
} from '../../graphql/admin.queries';
import { Modal } from '../../components/ui/Modal';
import { ConfirmModal } from '../../components/ui/ConfirmModal';

const ITEM_TYPES = ['CONSUMABLE', 'EQUIPMENT', 'MATERIAL', 'QUEST'];
const RARITIES = ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYTHIC'];
const SUB_TYPES = [
    'POTION_HP', 'POTION_MANA', 'FOOD', 'BUFF_ITEM',
    'WEAPON', 'ARMOR_HEAD', 'ARMOR_CHEST', 'ARMOR_LEGS', 'ARMOR_FEET', 'ACCESSORY',
    'MINERAL', 'HERB', 'ESSENCE',
    'QUEST_KEY', 'QUEST_LETTER'
];

export function AdminItemsPage() {
    const { data, loading, error, refetch } = useQuery(ALL_ITEMS_QUERY);
    const [createItem] = useMutation(CREATE_ITEM_MUTATION);
    const [updateItem] = useMutation(UPDATE_ITEM_MUTATION);
    const [deleteItem] = useMutation(DELETE_ITEM_MUTATION);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        type: 'CONSUMABLE',
        subType: 'POTION_HP',
        rarity: 'COMMON',
        description: '',
        price: 0,
        isBuyable: false
    });

    const [confirmAction, setConfirmAction] = useState<{
        isOpen: boolean;
        item: any | null;
    }>({ isOpen: false, item: null });

    const handleCreate = () => {
        setFormData({
            name: '',
            type: 'CONSUMABLE',
            subType: 'POTION_HP',
            rarity: 'COMMON',
            description: '',
            price: 0,
            isBuyable: false
        });
        setIsCreateModalOpen(true);
    };

    const handleEdit = (item: any) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            type: item.type,
            subType: item.subType,
            rarity: item.rarity,
            description: item.description || '',
            price: item.price || 0,
            isBuyable: item.isBuyable || false
        });
    };

    const handleSave = async () => {
        try {
            const input = {
                ...formData,
                price: Number(formData.price) // Ensure number
            };

            if (editingItem) {
                await updateItem({
                    variables: { id: editingItem.id, input }
                });
                setEditingItem(null);
            } else {
                await createItem({
                    variables: { input }
                });
                setIsCreateModalOpen(false);
            }
            refetch();
        } catch (err: any) {
            alert('Erro ao salvar: ' + err.message);
        }
    };

    const confirmDelete = async () => {
        if (!confirmAction.item) return;
        try {
            await deleteItem({ variables: { id: confirmAction.item.id } });
            refetch();
        } catch (err: any) {
            alert('Erro ao excluir: ' + err.message);
        } finally {
            setConfirmAction({ isOpen: false, item: null });
        }
    };

    if (error) return <AdminLayout><div className="alert alert-danger m-3">Erro: {error.message}</div></AdminLayout>;
    if (loading) return <AdminLayout><div className="p-5 text-center">Carregando itens...</div></AdminLayout>;

    const items = data?.allItems || [];

    return (
        <AdminLayout>
            <section className="panel">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 className="h5 section-title mb-1">Gerenciar Itens</h1>
                        <p className="section-sub mb-0">Cadastro de itens do jogo</p>
                    </div>
                    <button className="btn btn-primary-br" onClick={handleCreate}>
                        + Novo Item
                    </button>
                </div>

                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Tipo</th>
                                <th>Subtipo</th>
                                <th>Raridade</th>
                                <th>Preço</th>
                                <th className="text-end">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item: any) => (
                                <tr key={item.id}>
                                    <td>
                                        <strong>{item.name}</strong>
                                        <div className="small text-muted">{item.description}</div>
                                    </td>
                                    <td><span className="badge bg-secondary">{item.type}</span></td>
                                    <td><small>{item.subType}</small></td>
                                    <td><span className={`badge rarity-${item.rarity.toLowerCase()}`}>{item.rarity}</span></td>
                                    <td>{item.price > 0 ? `${item.price} 💰` : '-'}</td>
                                    <td className="text-end">
                                        <button className="btn btn-sm btn-ghost me-2" onClick={() => handleEdit(item)}>
                                            ✏️
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => setConfirmAction({ isOpen: true, item })}
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <Modal
                isOpen={isCreateModalOpen || !!editingItem}
                onClose={() => { setIsCreateModalOpen(false); setEditingItem(null); }}
                title={editingItem ? 'Editar Item' : 'Novo Item'}
                footer={
                    <>
                        <button className="btn btn-ghost" onClick={() => { setIsCreateModalOpen(false); setEditingItem(null); }}>Cancelar</button>
                        <button className="btn btn-primary-br" onClick={handleSave}>Salvar</button>
                    </>
                }
            >
                <div className="row g-3">
                    <div className="col-12">
                        <label className="form-label">Nome</label>
                        <input
                            className="form-control"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="col-md-6">
                        <label className="form-label">Tipo</label>
                        <select
                            className="form-select"
                            value={formData.type}
                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                        >
                            {ITEM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>

                    <div className="col-md-6">
                        <label className="form-label">Subtipo</label>
                        <select
                            className="form-select"
                            value={formData.subType}
                            onChange={e => setFormData({ ...formData, subType: e.target.value })}
                        >
                            {SUB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>

                    <div className="col-md-6">
                        <label className="form-label">Raridade</label>
                        <select
                            className="form-select"
                            value={formData.rarity}
                            onChange={e => setFormData({ ...formData, rarity: e.target.value })}
                        >
                            {RARITIES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>

                    <div className="col-md-6">
                        <label className="form-label">Preço (Moedas)</label>
                        <input
                            type="number"
                            className="form-control"
                            value={formData.price}
                            onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                        />
                    </div>

                    <div className="col-12">
                        <div className="form-check form-switch">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                id="isBuyable"
                                checked={formData.isBuyable}
                                onChange={e => setFormData({ ...formData, isBuyable: e.target.checked })}
                            />
                            <label className="form-check-label" htmlFor="isBuyable">Disponível para Compra?</label>
                        </div>
                    </div>

                    <div className="col-12">
                        <label className="form-label">Descrição</label>
                        <textarea
                            className="form-control"
                            rows={3}
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                </div>
            </Modal>

            <ConfirmModal
                isOpen={confirmAction.isOpen}
                onClose={() => setConfirmAction({ isOpen: false, item: null })}
                onConfirm={confirmDelete}
                title="Excluir Item"
                message={`Tem certeza que deseja excluir "${confirmAction.item?.name}"?`}
                confirmLabel="Excluir"
                isDanger={true}
            />
        </AdminLayout>
    );
}
