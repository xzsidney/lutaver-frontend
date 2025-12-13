import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { AdminLayout } from '../../components/layout/AdminLayout';
import {
    ALL_DISCIPLINES_QUERY,
    CREATE_DISCIPLINE_MUTATION,
    UPDATE_DISCIPLINE_MUTATION,
    DELETE_DISCIPLINE_MUTATION
} from '../../graphql/admin.queries';
import { Modal } from '../../components/ui/Modal';
import { ConfirmModal } from '../../components/ui/ConfirmModal';

export function AdminDisciplinesPage() {
    const { data, loading, error, refetch } = useQuery(ALL_DISCIPLINES_QUERY);
    const [createDiscipline] = useMutation(CREATE_DISCIPLINE_MUTATION);
    const [updateDiscipline] = useMutation(UPDATE_DISCIPLINE_MUTATION);
    const [deleteDiscipline] = useMutation(DELETE_DISCIPLINE_MUTATION);

    // State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingDisc, setEditingDisc] = useState<any | null>(null);
    const [formData, setFormData] = useState({ code: '', name: '', schoolYear: 'FUNDAMENTAL_1_1', description: '' });

    const [confirmAction, setConfirmAction] = useState<{
        isOpen: boolean;
        disc: any | null;
    }>({ isOpen: false, disc: null });

    const schoolYears = [
        { value: 'FUNDAMENTAL_1_1', label: '1º ano (Fund I)' },
        { value: 'FUNDAMENTAL_1_2', label: '2º ano (Fund I)' },
        { value: 'FUNDAMENTAL_1_3', label: '3º ano (Fund I)' },
        { value: 'FUNDAMENTAL_1_4', label: '4º ano (Fund I)' },
        { value: 'FUNDAMENTAL_1_5', label: '5º ano (Fund I)' },
        { value: 'FUNDAMENTAL_2_6', label: '6º ano (Fund II)' },
        { value: 'FUNDAMENTAL_2_7', label: '7º ano (Fund II)' },
        { value: 'FUNDAMENTAL_2_8', label: '8º ano (Fund II)' },
        { value: 'FUNDAMENTAL_2_9', label: '9º ano (Fund II)' },
        { value: 'HIGH_SCHOOL_1', label: '1º ano (Médio)' },
        { value: 'HIGH_SCHOOL_2', label: '2º ano (Médio)' },
        { value: 'HIGH_SCHOOL_3', label: '3º ano (Médio)' },
    ];

    const handleEdit = (disc: any) => {
        setEditingDisc(disc);
        setFormData({
            code: disc.code,
            name: disc.name,
            schoolYear: disc.schoolYear,
            description: disc.description || ''
        });
    };

    const handleCreate = () => {
        setFormData({ code: '', name: '', schoolYear: 'FUNDAMENTAL_1_1', description: '' });
        setIsCreateModalOpen(true);
    };

    const handleSave = async () => {
        try {
            if (editingDisc) {
                await updateDiscipline({
                    variables: {
                        id: editingDisc.id,
                        input: formData
                    }
                });
                setEditingDisc(null);
            } else {
                await createDiscipline({
                    variables: {
                        input: formData
                    }
                });
                setIsCreateModalOpen(false);
            }
            refetch();
        } catch (err: any) {
            alert('Erro ao salvar: ' + err.message);
        }
    };

    const confirmDelete = async () => {
        if (!confirmAction.disc) return;
        try {
            await deleteDiscipline({ variables: { id: confirmAction.disc.id } });
            refetch();
        } catch (err: any) {
            alert('Erro ao excluir: ' + err.message);
        } finally {
            setConfirmAction({ isOpen: false, disc: null });
        }
    };

    if (error) return <AdminLayout><div className="alert alert-danger m-3">Erro: {error.message}</div></AdminLayout>;
    if (loading) return <AdminLayout><div className="p-5 text-center">Carregando disciplinas...</div></AdminLayout>;

    const disciplines = data?.allDisciplines || [];

    return (
        <AdminLayout>
            <section className="panel">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 className="h5 section-title mb-1">Gerenciar Disciplinas</h1>
                        <p className="section-sub mb-0">Cadastro de matérias por ano escolar</p>
                    </div>
                    <button className="btn btn-primary-br" onClick={handleCreate}>
                        + Nova Disciplina
                    </button>
                </div>

                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Nome</th>
                                <th>Ano Escolar</th>
                                <th>Descrição</th>
                                <th className="text-end">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {disciplines.map((d: any) => (
                                <tr key={d.id}>
                                    <td><span className="badge bg-secondary">{d.code}</span></td>
                                    <td><strong>{d.name}</strong></td>
                                    <td><small>{schoolYears.find(y => y.value === d.schoolYear)?.label || d.schoolYear}</small></td>
                                    <td><small className="text-muted">{d.description}</small></td>
                                    <td className="text-end">
                                        <button className="btn btn-sm btn-ghost me-2" onClick={() => handleEdit(d)}>
                                            ✏️ Editar
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => setConfirmAction({ isOpen: true, disc: d })}
                                        >
                                            🗑️ Excluir
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Modal de Create/Edit */}
            <Modal
                isOpen={isCreateModalOpen || !!editingDisc}
                onClose={() => { setIsCreateModalOpen(false); setEditingDisc(null); }}
                title={editingDisc ? 'Editar Disciplina' : 'Nova Disciplina'}
                footer={
                    <>
                        <button className="btn btn-ghost" onClick={() => { setIsCreateModalOpen(false); setEditingDisc(null); }}>Cancelar</button>
                        <button className="btn btn-primary-br" onClick={handleSave}>Salvar</button>
                    </>
                }
            >
                <div className="mb-3">
                    <label className="form-label">Código (Ex: MAT-1)</label>
                    <input
                        className="form-control"
                        value={formData.code}
                        onChange={e => setFormData({ ...formData, code: e.target.value })}
                        disabled={!!editingDisc} // Assuming code is unique/immutabe mostly, but schema allows update. Let's allow update. Actually unique constraint might fail.
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Nome</label>
                    <input
                        className="form-control"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Ano Escolar</label>
                    <select
                        className="form-select"
                        value={formData.schoolYear}
                        onChange={e => setFormData({ ...formData, schoolYear: e.target.value })}
                    >
                        {schoolYears.map(y => (
                            <option key={y.value} value={y.value}>{y.label}</option>
                        ))}
                    </select>
                </div>
                <div className="mb-3">
                    <label className="form-label">Descrição</label>
                    <textarea
                        className="form-control"
                        rows={3}
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>
            </Modal>

            <ConfirmModal
                isOpen={confirmAction.isOpen}
                onClose={() => setConfirmAction({ isOpen: false, disc: null })}
                onConfirm={confirmDelete}
                title="Excluir Disciplina"
                message={`Tem certeza que deseja excluir "${confirmAction.disc?.name}"? Isso pode afetar afinidades existente.`}
                confirmLabel="Excluir"
                isDanger={true}
            />

        </AdminLayout>
    );
}
