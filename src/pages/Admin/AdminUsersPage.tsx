import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { ALL_USERS_QUERY, UPDATE_USER_MUTATION } from '../../graphql/admin.queries';
import { Modal } from '../../components/ui/Modal';
import { ConfirmModal } from '../../components/ui/ConfirmModal';

export function AdminUsersPage() {
    const { data, loading, error, refetch } = useQuery(ALL_USERS_QUERY);
    const [updateUser] = useMutation(UPDATE_USER_MUTATION);

    // Edit State
    const [editingUser, setEditingUser] = useState<any | null>(null);
    const [formData, setFormData] = useState({ name: '', role: 'PLAYER' });

    // Confirm State
    const [confirmAction, setConfirmAction] = useState<{
        isOpen: boolean;
        user: any | null;
        message: string;
        isDanger: boolean;
    }>({ isOpen: false, user: null, message: '', isDanger: false });

    // Handlers
    const handleEdit = (user: any) => {
        setEditingUser(user);
        setFormData({ name: user.name, role: user.role });
    };

    const handleSave = async () => {
        if (!editingUser) return;
        try {
            await updateUser({
                variables: {
                    id: editingUser.id,
                    input: { name: formData.name, role: formData.role }
                }
            });
            setEditingUser(null);
            refetch();
        } catch (err: any) {
            // Can assume we will replace this alert with a toast later or just log it for now
            // But let's keep it simple as user asked for Alerts to be better. 
            // Ideally we'd have an AlertModal too, but confirm is the main blocking one.
            alert('Erro ao salvar: ' + err.message);
        }
    };

    const handleToggleStatusClick = (user: any) => {
        setConfirmAction({
            isOpen: true,
            user: user,
            message: `Tem certeza que deseja ${user.isActive ? 'inativar' : 'ativar'} o usuário "${user.name}"?`,
            isDanger: user.isActive // Danger if inactivating
        });
    };

    const confirmToggleStatus = async () => {
        const user = confirmAction.user;
        if (!user) return;

        try {
            await updateUser({
                variables: {
                    id: user.id,
                    input: { isActive: !user.isActive }
                }
            });
            refetch();
        } catch (err: any) {
            alert('Erro ao alterar status: ' + err.message);
        } finally {
            setConfirmAction({ ...confirmAction, isOpen: false });
        }
    };

    if (error) return <AdminLayout><div className="alert alert-danger m-3">Erro: {error.message}</div></AdminLayout>;
    if (loading) return <AdminLayout><div className="p-5 text-center">Carregando usuários...</div></AdminLayout>;

    const users = data?.allUsers || [];

    return (
        <AdminLayout>
            <section className="panel">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 className="h5 section-title mb-1">Gerenciar Usuários</h1>
                        <p className="section-sub mb-0">Listagem e controle de acesso</p>
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th className="text-end">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u: any) => (
                                <tr key={u.id} style={{ opacity: u.isActive ? 1 : 0.6 }}>
                                    <td><strong>{u.name}</strong></td>
                                    <td>{u.email}</td>
                                    <td>
                                        <span className={`badge-br ${u.role === 'ADMIN' ? 'badge-green' :
                                                u.role === 'TEACHER' ? 'badge-yellow' : 'badge-blue'
                                            }`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td>
                                        {u.isActive ? (
                                            <span className="badge bg-success rounded-pill">Ativo</span>
                                        ) : (
                                            <span className="badge bg-danger rounded-pill">Inativo</span>
                                        )}
                                    </td>
                                    <td className="text-end">
                                        <button className="btn btn-sm btn-ghost me-2" onClick={() => handleEdit(u)}>
                                            ✏️ Editar
                                        </button>
                                        <button
                                            className={`btn btn-sm ${u.isActive ? 'btn-outline-danger' : 'btn-outline-success'}`}
                                            onClick={() => handleToggleStatusClick(u)}
                                        >
                                            {u.isActive ? '🚫' : '✅'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Modal de Edição */}
            <Modal
                isOpen={!!editingUser}
                onClose={() => setEditingUser(null)}
                title="Editar Usuário"
                footer={
                    <>
                        <button className="btn btn-ghost" onClick={() => setEditingUser(null)}>Cancelar</button>
                        <button className="btn btn-primary-br" onClick={handleSave}>Salvar</button>
                    </>
                }
            >
                <div className="mb-3">
                    <label className="form-label">Nome</label>
                    <input
                        className="form-control"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Função (Role)</label>
                    <select
                        className="form-select"
                        value={formData.role}
                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                    >
                        <option value="PLAYER">PLAYER</option>
                        <option value="TEACHER">TEACHER</option>
                        <option value="ADMIN">ADMIN</option>
                    </select>
                </div>
            </Modal>

            {/* Modal de Confirmação */}
            <ConfirmModal
                isOpen={confirmAction.isOpen}
                onClose={() => setConfirmAction({ ...confirmAction, isOpen: false })}
                onConfirm={confirmToggleStatus}
                title={confirmAction.isDanger ? 'Inativar Usuário' : 'Ativar Usuário'}
                message={confirmAction.message}
                confirmLabel={confirmAction.isDanger ? 'Inativar' : 'Ativar'}
                isDanger={confirmAction.isDanger}
            />

        </AdminLayout>
    );
}
