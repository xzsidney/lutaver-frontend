import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, gql } from '@apollo/client';
import { AdminLayout } from '../../../components/layout/AdminLayout';

// === QUERIES & MUTATIONS ===

const GET_ADMIN_QUIZZES = gql`
    query GetAdminQuizzes {
        adminQuizzes {
            id
            title
            discipline
            difficulty
            questionsCount
            isActive
            rewardXp
            description
            questions {
                id
                statement
                optionA
                optionB
                optionC
                optionD
                correctOption
                type
                explanation
            }
        }
    }
`;

const CREATE_QUIZ = gql`
    mutation CreateQuiz($input: CreateQuizInput!) {
        createQuiz(input: $input) {
            id
            title
        }
    }
`;

const UPDATE_QUIZ = gql`
    mutation UpdateQuiz($id: ID!, $input: UpdateQuizInput!) {
        updateQuiz(id: $id, input: $input) {
            id
            title
        }
    }
`;

const DELETE_QUIZ = gql`
    mutation DeleteQuiz($id: ID!) {
        deleteQuiz(id: $id)
    }
`;

// === PAGE COMPONENT ===

export function AdminQuizzesPage() {
    const { data, loading, error, refetch } = useQuery(GET_ADMIN_QUIZZES);
    const navigate = useNavigate();
    const [deleteQuiz, { loading: deleting }] = useMutation(DELETE_QUIZ);

    const handleCreate = () => {
        navigate('/admin/quizzes/new');
    };

    const handleEdit = (quiz: any) => {
        navigate(`/admin/quizzes/${quiz.id}/edit`);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este Quiz?')) return;
        try {
            await deleteQuiz({ variables: { id } });
            refetch();
        } catch (err: any) {
            alert('Erro ao excluir: ' + err.message);
        }
    };



    if (loading) return <AdminLayout><div className="text-white">Carregando...</div></AdminLayout>;
    if (error) return <AdminLayout><div className="text-danger">Erro: {error.message}</div></AdminLayout>;

    return (
        <AdminLayout>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="text-white mb-1">Gerenciar Quizzes</h2>
                    <p className="text-muted small m-0">Crie e edite quizzes e perguntas.</p>
                </div>
                <button className="btn btn-primary" onClick={handleCreate}>
                    + Novo Quiz
                </button>
            </div>

            <div className="card bg-surface border-0 shadow-sm">
                <div className="table-responsive">
                    <table className="table table-dark table-hover mb-0 align-middle">
                        <thead>
                            <tr>
                                <th>Título</th>
                                <th>Disciplina</th>
                                <th>Dif.</th>
                                <th>Perguntas</th>
                                <th>Status</th>
                                <th className="text-end">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.adminQuizzes.map((quiz: any) => (
                                <tr key={quiz.id}>
                                    <td>
                                        <div className="fw-bold text-white">{quiz.title}</div>
                                        <div className="small text-muted text-truncate" style={{ maxWidth: 200 }}>
                                            {quiz.description}
                                        </div>
                                    </td>
                                    <td>
                                        <span className="badge bg-secondary">{quiz.discipline}</span>
                                    </td>
                                    <td>
                                        <span className={`badge ${quiz.difficulty === 'EASY' ? 'bg-success' :
                                            quiz.difficulty === 'MEDIUM' ? 'bg-warning' :
                                                'bg-danger'
                                            }`}>
                                            {quiz.difficulty}
                                        </span>
                                    </td>
                                    <td>{quiz.questionsCount}</td>
                                    <td>
                                        {quiz.isActive ? (
                                            <span className="badge bg-success">Ativo</span>
                                        ) : (
                                            <span className="badge bg-danger">Inativo</span>
                                        )}
                                    </td>
                                    <td className="text-end">
                                        <button
                                            className="btn btn-sm btn-ghost me-2"
                                            onClick={() => handleEdit(quiz)}
                                        >
                                            Editar
                                        </button>
                                        <button
                                            className="btn btn-sm btn-ghost text-danger"
                                            onClick={() => handleDelete(quiz.id)}
                                            disabled={deleting}
                                        >
                                            Excluir
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {data?.adminQuizzes.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-5 text-muted">
                                        Nenhum quiz encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
