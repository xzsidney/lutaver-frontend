import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { AdminLayout } from '../../../components/layout/AdminLayout';
import { ADMIN_NPCS_QUERY, ALL_DISCIPLINES_QUERY } from '../../../graphql/npc/npc.queries';
import { CREATE_NPC_MUTATION, UPDATE_NPC_MUTATION, DELETE_NPC_MUTATION } from '../../../graphql/npc/npc.mutations';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import { Modal } from '../../../components/ui/Modal';
import { NpcForm } from './components/NpcForm';

const NPC_TYPES = ['STORY', 'BOSS', 'BOTH'];
const SCHOOL_YEARS = [
    'FUNDAMENTAL_1_1', 'FUNDAMENTAL_1_2', 'FUNDAMENTAL_1_3', 'FUNDAMENTAL_1_4', 'FUNDAMENTAL_1_5',
    'FUNDAMENTAL_2_6', 'FUNDAMENTAL_2_7', 'FUNDAMENTAL_2_8', 'FUNDAMENTAL_2_9',
    'HIGH_SCHOOL_1', 'HIGH_SCHOOL_2', 'HIGH_SCHOOL_3'
];

export default function AdminNpcsPage() {
    const [filters, setFilters] = useState({
        search: '',
        type: '',
        isActive: '',
        schoolYear: '',
        disciplineId: ''
    });

    const { data, loading, error, refetch } = useQuery(ADMIN_NPCS_QUERY, {
        variables: {
            filter: {
                ...filters,
                isActive: filters.isActive === '' ? undefined : (filters.isActive === 'true'),
                type: filters.type || undefined,
                schoolYear: filters.schoolYear || undefined,
                disciplineId: filters.disciplineId || undefined,
                search: filters.search || undefined
            }
        },
        fetchPolicy: 'network-only'
    });

    const { data: disciplinesData } = useQuery(ALL_DISCIPLINES_QUERY);
    const disciplines = disciplinesData?.allDisciplines || [];

    const [createNpc] = useMutation(CREATE_NPC_MUTATION);
    const [updateNpc] = useMutation(UPDATE_NPC_MUTATION);
    const [deleteNpc] = useMutation(DELETE_NPC_MUTATION);

    // Modal States
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingNpc, setEditingNpc] = useState<any | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean, npc: any | null }>({ isOpen: false, npc: null });
    const [formLoading, setFormLoading] = useState(false);

    const handleCreate = () => {
        setEditingNpc(null);
        setIsFormModalOpen(true);
    };

    const handleEdit = (npc: any) => {
        setEditingNpc(npc);
        setIsFormModalOpen(true);
    };

    const handleSave = async (formData: any) => {
        setFormLoading(true);
        try {
            if (editingNpc) {
                await updateNpc({
                    variables: {
                        id: editingNpc.id,
                        input: formData
                    }
                });
            } else {
                await createNpc({
                    variables: { input: formData }
                });
            }
            setIsFormModalOpen(false);
            setEditingNpc(null);
            refetch();
        } catch (error: any) {
            alert('Erro ao salvar: ' + error.message);
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirmDelete.npc) return;
        try {
            await deleteNpc({ variables: { id: confirmDelete.npc.id } });
            refetch();
            setConfirmDelete({ isOpen: false, npc: null });
        } catch (err: any) {
            alert('Erro ao excluir: ' + err.message);
        }
    };

    if (error) return <AdminLayout><div className="alert alert-danger m-3">Erro: {error.message}</div></AdminLayout>;

    return (
        <AdminLayout>
            <section className="panel">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 className="h5 section-title mb-1">Gerenciar NPCs</h1>
                        <p className="section-sub mb-0">Cadastro de NPCs de História e Batalha</p>
                    </div>
                    <button className="btn btn-primary-br" onClick={handleCreate}>
                        + Novo NPC
                    </button>
                </div>

                {/* Filters */}
                <div className="row g-2 mb-4 bg-light p-3 rounded">
                    <div className="col-md-3">
                        <input
                            className="form-control"
                            placeholder="Buscar nome..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        />
                    </div>
                    <div className="col-md-2">
                        <select
                            className="form-select"
                            value={filters.type}
                            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                        >
                            <option value="">Todos Tipos</option>
                            {NPC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div className="col-md-2">
                        <select
                            className="form-select"
                            value={filters.isActive}
                            onChange={(e) => setFilters({ ...filters, isActive: e.target.value })}
                        >
                            <option value="">Status (Todos)</option>
                            <option value="true">Ativo</option>
                            <option value="false">Inativo</option>
                        </select>
                    </div>
                    <div className="col-md-2">
                        <select
                            className="form-select"
                            value={filters.schoolYear}
                            onChange={(e) => setFilters({ ...filters, schoolYear: e.target.value })}
                        >
                            <option value="">Todos Anos</option>
                            {SCHOOL_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <div className="col-md-3">
                        <select
                            className="form-select"
                            value={filters.disciplineId}
                            onChange={(e) => setFilters({ ...filters, disciplineId: e.target.value })}
                        >
                            <option value="">Todas Disciplinas</option>
                            {disciplines.map((d: any) => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {loading ? <div className="text-center p-5">Carregando...</div> : (
                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>Tipo</th>
                                    <th>Contexto</th>
                                    <th>Rewards</th>
                                    <th>Status</th>
                                    <th className="text-end">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data?.adminNpcs?.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="text-center py-4 text-muted">Nenhum NPC encontrado.</td>
                                    </tr>
                                )}
                                {data?.adminNpcs?.map((npc: any) => (
                                    <tr key={npc.id}>
                                        <td>
                                            <strong>{npc.name}</strong>
                                        </td>
                                        <td><span className="badge bg-secondary">{npc.type}</span></td>
                                        <td>
                                            <small className="d-block text-muted">{npc.schoolYear || 'Qualquer Ano'}</small>
                                            <small className="d-block text-info">{npc.discipline?.name || '-'}</small>
                                        </td>
                                        <td>
                                            <small>XP: {npc.rewardXp}</small><br />
                                            <small>Coins: {npc.rewardCoins}</small>
                                        </td>
                                        <td>
                                            {npc.isActive
                                                ? <span className="badge bg-success">Ativo</span>
                                                : <span className="badge bg-danger">Inativo</span>
                                            }
                                        </td>
                                        <td className="text-end">
                                            <button
                                                className="btn btn-sm btn-ghost me-2"
                                                onClick={() => handleEdit(npc)}
                                                title="Editar"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => setConfirmDelete({ isOpen: true, npc })}
                                                title="Excluir"
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isFormModalOpen}
                onClose={() => { setIsFormModalOpen(false); setEditingNpc(null); }}
                title={editingNpc ? 'Editar NPC' : 'Novo NPC'}
                // NpcForm has its own buttons, so footer might be redundant or we can use form's submit
                // However, NpcForm as designed controls the submit button inside it.
                // We'll pass empty footer or let Modal handle it. 
                // Since NpcForm renders buttons, we can just pass null footer or let it render content.
                // Adapting NpcForm to fit inside Modal perfectly:
                footer={null}
            >
                <NpcForm
                    initialData={editingNpc}
                    onSubmit={handleSave}
                    loading={formLoading}
                    submitLabel={editingNpc ? 'Salvar' : 'Criar'}
                />
            </Modal>

            <ConfirmModal
                isOpen={confirmDelete.isOpen}
                onClose={() => setConfirmDelete({ isOpen: false, npc: null })}
                onConfirm={handleDelete}
                title="Excluir NPC"
                message={`Tem certeza que deseja excluir "${confirmDelete.npc?.name}"? Isso pode afetar histórias e batalhas existentes.`}
                confirmLabel="Excluir"
                isDanger={true}
            />
        </AdminLayout>
    );
}
