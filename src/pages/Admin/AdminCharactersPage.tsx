import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { ALL_CHARACTERS_QUERY, ADMIN_UPDATE_CHARACTER_MUTATION } from '../../graphql/admin.queries';
import { ConfirmModal } from '../../components/ui/ConfirmModal';

export function AdminCharactersPage() {
    const { data, loading, error, refetch } = useQuery(ALL_CHARACTERS_QUERY);
    const [updateCharacter] = useMutation(ADMIN_UPDATE_CHARACTER_MUTATION);

    // Confirm State
    const [confirmAction, setConfirmAction] = useState<{
        isOpen: boolean;
        char: any | null;
        message: string;
        isDanger: boolean;
    }>({ isOpen: false, char: null, message: '', isDanger: false });

    const handleToggleStatusClick = (char: any) => {
        setConfirmAction({
            isOpen: true,
            char: char,
            message: `Tem certeza que deseja ${char.isActive ? 'inativar' : 'ativar'} o personagem "${char.name}"?`,
            isDanger: char.isActive
        });
    };

    const confirmToggleStatus = async () => {
        const char = confirmAction.char;
        if (!char) return;

        try {
            await updateCharacter({
                variables: {
                    id: char.id,
                    input: { isActive: !char.isActive }
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
    if (loading) return <AdminLayout><div className="p-5 text-center">Carregando personagens...</div></AdminLayout>;

    const characters = data?.allCharacters || [];

    return (
        <AdminLayout>
            <section className="panel">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 className="h5 section-title mb-1">Gerenciar Personagens</h1>
                        <p className="section-sub mb-0">Listagem e controle de acesso</p>
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Usuário</th>
                                <th>Nível</th>
                                <th>Ano Escolar</th>
                                <th>Status</th>
                                <th className="text-end">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {characters.map((c: any) => (
                                <tr key={c.id} style={{ opacity: c.isActive ? 1 : 0.6 }}>
                                    <td><strong>{c.name}</strong></td>
                                    <td>{c.user?.name}</td>
                                    <td><span className="badge bg-secondary rounded-pill">Lvl {c.level}</span></td>
                                    <td><span className="small text-muted">{c.schoolYear}</span></td>
                                    <td>
                                        {c.isActive ? (
                                            <span className="badge bg-success rounded-pill">Ativo</span>
                                        ) : (
                                            <span className="badge bg-danger rounded-pill">Inativo</span>
                                        )}
                                    </td>
                                    <td className="text-end">
                                        <button
                                            className={`btn btn-sm ${c.isActive ? 'btn-outline-danger' : 'btn-outline-success'}`}
                                            onClick={() => handleToggleStatusClick(c)}
                                        >
                                            {c.isActive ? '🚫' : '✅'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Modal de Confirmação */}
            <ConfirmModal
                isOpen={confirmAction.isOpen}
                onClose={() => setConfirmAction({ ...confirmAction, isOpen: false })}
                onConfirm={confirmToggleStatus}
                title={confirmAction.isDanger ? 'Inativar Personagem' : 'Ativar Personagem'}
                message={confirmAction.message}
                confirmLabel={confirmAction.isDanger ? 'Inativar' : 'Ativar'}
                isDanger={confirmAction.isDanger}
            />

        </AdminLayout>
    );
}
