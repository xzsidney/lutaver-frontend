import React, { useState, useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';

const GET_DISCIPLINES_QUERY = gql`
    query GetDisciplines {
        allDisciplines {
            id
            name
            code
            schoolYear
        }
    }
`;

const GET_QUESTIONS_QUERY = gql`
    query GetQuestions {
        adminQuestions {
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
`;

interface QuestionInput {
    id?: string;
    statement: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctOption: string;
    type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE';
    explanation?: string;
}

interface QuizInput {
    id?: string;
    title: string;
    description: string;
    discipline: string;
    difficulty: string;
    rewardXp: number;
    rewardCoins: number;
    isActive: boolean;
    questions: QuestionInput[];
}

interface QuizFormProps {
    initialData?: QuizInput;
    onSubmit: (data: QuizInput) => Promise<void>;
    onCancel: () => void;
    isLoading: boolean;
}

export function QuizForm({ initialData, onSubmit, onCancel, isLoading }: QuizFormProps) {
    const { data: disciplinesData } = useQuery(GET_DISCIPLINES_QUERY);
    const { data: questionsData } = useQuery(GET_QUESTIONS_QUERY);

    const disciplines = disciplinesData?.allDisciplines || [];
    const availableQuestions = questionsData?.adminQuestions || [];

    const [formData, setFormData] = useState<QuizInput>({
        title: '',
        description: '',
        discipline: 'MATHEMATICS',
        difficulty: 'EASY',
        rewardXp: 10,
        rewardCoins: 5,
        isActive: true,
        questions: []
    });

    const [currentTab, setCurrentTab] = useState<'DETAILS' | 'QUESTIONS'>('DETAILS');
    const [showQuestionSelector, setShowQuestionSelector] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const addExistingQuestion = (question: any) => {
        // Check if already added
        if (formData.questions.some(q => q.id === question.id)) {
            alert('Questão já adicionada!');
            return;
        }

        setFormData(prev => ({
            ...prev,
            questions: [
                ...prev.questions,
                {
                    id: question.id,
                    statement: question.statement,
                    optionA: question.optionA,
                    optionB: question.optionB,
                    optionC: question.optionC,
                    optionD: question.optionD,
                    correctOption: question.correctOption,
                    type: question.type,
                    explanation: question.explanation
                }
            ]
        }));
        setShowQuestionSelector(false);
    };

    const addNewQuestion = () => {
        setFormData(prev => ({
            ...prev,
            questions: [
                ...prev.questions,
                {
                    statement: '',
                    optionA: '',
                    optionB: '',
                    optionC: '',
                    optionD: '',
                    correctOption: 'A',
                    type: 'MULTIPLE_CHOICE',
                    explanation: ''
                }
            ]
        }));
    };

    const updateQuestion = (index: number, field: keyof QuestionInput, value: any) => {
        const newQuestions = [...formData.questions];
        newQuestions[index] = { ...newQuestions[index], [field]: value };
        setFormData(prev => ({ ...prev, questions: newQuestions }));
    };

    const removeQuestion = (index: number) => {
        setFormData(prev => ({
            ...prev,
            questions: prev.questions.filter((_, i) => i !== index)
        }));
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="modal-body-scroll">
                <div className="d-flex gap-2 mb-3 border-bottom pb-2">
                    <button
                        type="button"
                        className={`btn btn-sm ${currentTab === 'DETAILS' ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setCurrentTab('DETAILS')}
                    >
                        Detalhes do Quiz
                    </button>
                    <button
                        type="button"
                        className={`btn btn-sm ${currentTab === 'QUESTIONS' ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setCurrentTab('QUESTIONS')}
                    >
                        Questões ({formData.questions.length})
                    </button>
                </div>

                {currentTab === 'DETAILS' && (
                    <div className="row g-3">
                        <div className="col-12">
                            <label className="form-label text-dark fw-bold">Título *</label>
                            <input
                                type="text"
                                className="form-control border-secondary"
                                style={{ backgroundColor: '#fff', color: '#000' }}
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>

                        <div className="col-12">
                            <label className="form-label text-dark fw-bold">Descrição *</label>
                            <textarea
                                className="form-control border-secondary"
                                style={{ backgroundColor: '#fff', color: '#000' }}
                                rows={3}
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                required
                            />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label text-dark fw-bold">Disciplina *</label>
                            <select
                                className="form-select border-secondary"
                                style={{ backgroundColor: '#fff', color: '#000' }}
                                value={formData.discipline}
                                onChange={e => setFormData({ ...formData, discipline: e.target.value })}
                            >
                                {disciplines.length === 0 ? (
                                    <>
                                        <option value="MATHEMATICS">Matemática</option>
                                        <option value="PORTUGUESE">Português</option>
                                        <option value="HISTORY">História</option>
                                        <option value="GEOGRAPHY">Geografia</option>
                                        <option value="SCIENCE">Ciências</option>
                                        <option value="PHYSICS">Física</option>
                                        <option value="CHEMISTRY">Química</option>
                                        <option value="BIOLOGY">Biologia</option>
                                        <option value="ENGLISH">Inglês</option>
                                        <option value="ARTS">Artes</option>
                                        <option value="PHYSICAL_EDUCATION">Educação Física</option>
                                    </>
                                ) : (
                                    disciplines.map((d: any) => (
                                        <option key={d.id} value={d.code}>{d.name}</option>
                                    ))
                                )}
                            </select>
                        </div>

                        <div className="col-md-6">
                            <label className="form-label text-dark fw-bold">Dificuldade *</label>
                            <select
                                className="form-select border-secondary"
                                style={{ backgroundColor: '#fff', color: '#000' }}
                                value={formData.difficulty}
                                onChange={e => setFormData({ ...formData, difficulty: e.target.value })}
                            >
                                <option value="EASY">Fácil</option>
                                <option value="MEDIUM">Médio</option>
                                <option value="HARD">Difícil</option>
                                <option value="EXPERT">Expert</option>
                            </select>
                        </div>

                        <div className="col-md-6">
                            <label className="form-label text-dark fw-bold">Recompensa XP *</label>
                            <input
                                type="number"
                                className="form-control border-secondary"
                                style={{ backgroundColor: '#fff', color: '#000' }}
                                value={formData.rewardXp}
                                onChange={e => setFormData({ ...formData, rewardXp: Number(e.target.value) })}
                                min={0}
                            />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label text-dark fw-bold">Recompensa Coins *</label>
                            <input
                                type="number"
                                className="form-control border-secondary"
                                style={{ backgroundColor: '#fff', color: '#000' }}
                                value={formData.rewardCoins}
                                onChange={e => setFormData({ ...formData, rewardCoins: Number(e.target.value) })}
                                min={0}
                            />
                        </div>

                        <div className="col-12">
                            <div className="form-check form-switch">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                />
                                <label className="form-check-label">Quiz Ativo</label>
                            </div>
                        </div>
                    </div>
                )}

                {currentTab === 'QUESTIONS' && (
                    <div className="d-flex flex-column gap-3">
                        {formData.questions.map((q, idx) => (
                            <div key={idx} className="card border-secondary p-3" style={{ backgroundColor: '#2d3748', color: '#fff' }}>
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <div>
                                        <h6 className="m-0 text-white">Questão #{idx + 1}</h6>
                                        {q.id && <small className="text-muted">ID: {q.id.substring(0, 8)}...</small>}
                                    </div>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => removeQuestion(idx)}
                                    >
                                        Remover
                                    </button>
                                </div>

                                {q.id ? (
                                    // Existing question (read-only display)
                                    <div className="small">
                                        <div className="mb-2"><strong className="text-warning">Enunciado:</strong> <span className="text-white">{q.statement}</span></div>
                                        <div className="row g-2 mb-2">
                                            <div className="col-6"><strong className="text-info">A:</strong> <span className="text-white-50">{q.optionA}</span></div>
                                            <div className="col-6"><strong className="text-info">B:</strong> <span className="text-white-50">{q.optionB}</span></div>
                                            <div className="col-6"><strong className="text-info">C:</strong> <span className="text-white-50">{q.optionC}</span></div>
                                            <div className="col-6"><strong className="text-info">D:</strong> <span className="text-white-50">{q.optionD}</span></div>
                                        </div>
                                        <div className="mb-2"><strong className="text-success">Correta:</strong> <span className="badge bg-success ms-1">{q.correctOption}</span></div>
                                        {q.explanation && <div className="mt-2"><strong className="text-warning">Explicação:</strong> <span className="text-white-50">{q.explanation}</span></div>}
                                    </div>
                                ) : (
                                    // New question (editable)
                                    <>
                                        <div className="mb-3">
                                            <label className="form-label small text-white">Enunciado *</label>
                                            <textarea
                                                className="form-control form-control-sm"
                                                style={{ backgroundColor: '#1a202c', color: '#fff', borderColor: '#4a5568' }}
                                                rows={2}
                                                value={q.statement}
                                                onChange={e => updateQuestion(idx, 'statement', e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="row g-2 mb-3">
                                            <div className="col-md-6">
                                                <label className="form-label small text-white">Opção A *</label>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm"
                                                    style={{ backgroundColor: '#1a202c', color: '#fff', borderColor: '#4a5568' }}
                                                    value={q.optionA}
                                                    onChange={e => updateQuestion(idx, 'optionA', e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label small text-white">Opção B *</label>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm"
                                                    style={{ backgroundColor: '#1a202c', color: '#fff', borderColor: '#4a5568' }}
                                                    value={q.optionB}
                                                    onChange={e => updateQuestion(idx, 'optionB', e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label small text-white">Opção C *</label>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm"
                                                    style={{ backgroundColor: '#1a202c', color: '#fff', borderColor: '#4a5568' }}
                                                    value={q.optionC}
                                                    onChange={e => updateQuestion(idx, 'optionC', e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label small text-white">Opção D *</label>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm"
                                                    style={{ backgroundColor: '#1a202c', color: '#fff', borderColor: '#4a5568' }}
                                                    value={q.optionD}
                                                    onChange={e => updateQuestion(idx, 'optionD', e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="row g-2">
                                            <div className="col-md-6">
                                                <label className="form-label small text-white">Correta *</label>
                                                <select
                                                    className="form-select form-select-sm"
                                                    style={{ backgroundColor: '#1a202c', color: '#fff', borderColor: '#4a5568' }}
                                                    value={q.correctOption}
                                                    onChange={e => updateQuestion(idx, 'correctOption', e.target.value)}
                                                >
                                                    <option value="A">Opção A</option>
                                                    <option value="B">Opção B</option>
                                                    <option value="C">Opção C</option>
                                                    <option value="D">Opção D</option>
                                                </select>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label small text-white">Explicação (Opcional)</label>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm"
                                                    style={{ backgroundColor: '#1a202c', color: '#fff', borderColor: '#4a5568' }}
                                                    value={q.explanation || ''}
                                                    onChange={e => updateQuestion(idx, 'explanation', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}

                        <div className="d-flex gap-2">
                            <button
                                type="button"
                                className="btn btn-outline-primary flex-fill"
                                onClick={() => setShowQuestionSelector(true)}
                            >
                                📚 Selecionar Questão Existente
                            </button>
                            <button
                                type="button"
                                className="btn btn-outline-success flex-fill"
                                onClick={addNewQuestion}
                            >
                                ➕ Criar Nova Questão
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="modal-footer mt-3 pt-3 border-top">
                <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={isLoading}>
                    Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                    {isLoading ? 'Salvando...' : 'Salvar Quiz'}
                </button>
            </div>

            {/* Question Selector Modal */}
            {showQuestionSelector && (
                <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 9999 }}>
                    <div className="modal-dialog modal-lg modal-dialog-scrollable">
                        <div className="modal-content bg-surface border-secondary">
                            <div className="modal-header border-secondary">
                                <h5 className="modal-title text-white">Selecionar Questão</h5>
                                <button
                                    type="button"
                                    className="btn-close btn-close-white"
                                    onClick={() => setShowQuestionSelector(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="list-group">
                                    {availableQuestions.map((q: any) => (
                                        <button
                                            key={q.id}
                                            type="button"
                                            className="list-group-item list-group-item-action border-secondary"
                                            style={{ backgroundColor: '#2d3748', color: '#fff' }}
                                            onClick={() => addExistingQuestion(q)}
                                        >
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div className="flex-grow-1">
                                                    <div className="fw-bold mb-1 text-white">{q.statement}</div>
                                                    <small className="text-white-50">
                                                        Tipo: {q.type} | Correta: <span className="badge bg-success">{q.correctOption}</span>
                                                    </small>
                                                </div>
                                                <span className="badge bg-primary">Adicionar</span>
                                            </div>
                                        </button>
                                    ))}
                                    {availableQuestions.length === 0 && (
                                        <div className="text-center py-4 text-white-50">
                                            Nenhuma questão disponível. Crie questões primeiro em "Questões".
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="modal-footer border-secondary">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowQuestionSelector(false)}
                                >
                                    Fechar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </form>
    );
}
