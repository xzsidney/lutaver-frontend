import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { AdminLayout } from '../../../components/layout/AdminLayout';
import { ADMIN_QUESTIONS_QUERY } from '../../../graphql/question/question.queries';
import { CREATE_QUESTION_MUTATION, UPDATE_QUESTION_MUTATION, DELETE_QUESTION_MUTATION } from '../../../graphql/question/question.mutations';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import { Modal } from '../../../components/ui/Modal';
import { QuestionForm } from './components/QuestionForm';

const QUESTION_TYPES = ['MULTIPLE_CHOICE', 'TRUE_FALSE'];

export default function AdminQuestionsPage() {
    const [searchFilter, setSearchFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');

    const { data, loading, error, refetch } = useQuery(ADMIN_QUESTIONS_QUERY, {
        fetchPolicy: 'network-only'
    });

    const [createQuestion] = useMutation(CREATE_QUESTION_MUTATION);
    const [updateQuestion] = useMutation(UPDATE_QUESTION_MUTATION);
    const [deleteQuestion] = useMutation(DELETE_QUESTION_MUTATION);

    // Modal States
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<any | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean, question: any | null }>({ isOpen: false, question: null });
    const [formLoading, setFormLoading] = useState(false);

    const handleCreate = () => {
        setEditingQuestion(null);
        setIsFormModalOpen(true);
    };

    const handleEdit = (question: any) => {
        setEditingQuestion(question);
        setIsFormModalOpen(true);
    };

    const handleSave = async (formData: any) => {
        setFormLoading(true);
        try {
            if (editingQuestion) {
                await updateQuestion({
                    variables: {
                        id: editingQuestion.id,
                        input: formData
                    }
                });
            } else {
                await createQuestion({
                    variables: { input: formData }
                });
            }
            setIsFormModalOpen(false);
            setEditingQuestion(null);
            refetch();
        } catch (error: any) {
            alert('Erro ao salvar: ' + error.message);
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirmDelete.question) return;
        try {
            await deleteQuestion({ variables: { id: confirmDelete.question.id } });
            refetch();
            setConfirmDelete({ isOpen: false, question: null });
        } catch (err: any) {
            alert('Erro ao excluir: ' + err.message);
        }
    };

    // Filter questions
    const filteredQuestions = data?.adminQuestions?.filter((q: any) => {
        const matchesSearch = !searchFilter || q.statement.toLowerCase().includes(searchFilter.toLowerCase());
        const matchesType = !typeFilter || q.type === typeFilter;
        return matchesSearch && matchesType;
    }) || [];

    if (error) return <AdminLayout><div className="alert alert-danger m-3">Erro: {error.message}</div></AdminLayout>;

    return (
        <AdminLayout>
            <section className="panel">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 className="h5 section-title mb-1">Gerenciar Questões</h1>
                        <p className="section-sub mb-0">Banco de questões reutilizáveis para quizzes</p>
                    </div>
                    <button className="btn btn-primary-br" onClick={handleCreate}>
                        + Nova Questão
                    </button>
                </div>

                {/* Filters */}
                <div className="row g-2 mb-4 bg-light p-3 rounded">
                    <div className="col-md-8">
                        <input
                            className="form-control"
                            placeholder="Buscar no enunciado..."
                            value={searchFilter}
                            onChange={(e) => setSearchFilter(e.target.value)}
                        />
                    </div>
                    <div className="col-md-4">
                        <select
                            className="form-select"
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                        >
                            <option value="">Todos os Tipos</option>
                            {QUESTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                </div>

                {loading ? <div className="text-center p-5">Carregando...</div> : (
                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead>
                                <tr>
                                    <th>Enunciado</th>
                                    <th>Tipo</th>
                                    <th>Resposta Correta</th>
                                    <th className="text-end">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredQuestions.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="text-center py-4 text-muted">Nenhuma questão encontrada.</td>
                                    </tr>
                                )}
                                {filteredQuestions.map((question: any) => (
                                    <tr key={question.id}>
                                        <td>
                                            <strong className="d-block">{question.statement.substring(0, 100)}{question.statement.length > 100 ? '...' : ''}</strong>
                                            {question.explanation && <small className="text-muted">📝 Tem explicação</small>}
                                        </td>
                                        <td><span className="badge bg-secondary">{question.type}</span></td>
                                        <td><span className="badge bg-success">{question.correctOption}</span></td>
                                        <td className="text-end">
                                            <button
                                                className="btn btn-sm btn-ghost me-2"
                                                onClick={() => handleEdit(question)}
                                                title="Editar"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => setConfirmDelete({ isOpen: true, question })}
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
                onClose={() => { setIsFormModalOpen(false); setEditingQuestion(null); }}
                title={editingQuestion ? 'Editar Questão' : 'Nova Questão'}
                footer={null}
            >
                <QuestionForm
                    initialData={editingQuestion}
                    onSubmit={handleSave}
                    loading={formLoading}
                    submitLabel={editingQuestion ? 'Salvar' : 'Criar'}
                />
            </Modal>

            <ConfirmModal
                isOpen={confirmDelete.isOpen}
                onClose={() => setConfirmDelete({ isOpen: false, question: null })}
                onConfirm={handleDelete}
                title="Excluir Questão"
                message={`Tem certeza que deseja excluir esta questão? Ela será removida do banco de questões.`}
                confirmLabel="Excluir"
                isDanger={true}
            />
        </AdminLayout>
    );
}
