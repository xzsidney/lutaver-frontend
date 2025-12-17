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

export function QuizFormImproved({ initialData, onSubmit, onCancel, isLoading }: QuizFormProps) {
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
        questions: [],
        ...initialData
    });

    // Filters
    const [searchText, setSearchText] = useState('');
    const [filterDiscipline, setFilterDiscipline] = useState('ALL');
    const [filterSchoolYear, setFilterSchoolYear] = useState('ALL');
    const [filterType, setFilterType] = useState('ALL');

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const addQuestion = (question: any) => {
        if (formData.questions.some(q => q.id === question.id)) {
            alert('Questão já adicionada!');
            return;
        }

        setFormData(prev => ({
            ...prev,
            questions: [...prev.questions, question]
        }));
    };

    const removeQuestion = (index: number) => {
        setFormData(prev => ({
            ...prev,
            questions: prev.questions.filter((_, i) => i !== index)
        }));
    };

    // Filter questions
    const filteredQuestions = availableQuestions.filter((q: any) => {
        const matchesSearch = searchText === '' ||
            q.statement.toLowerCase().includes(searchText.toLowerCase());

        const matchesType = filterType === 'ALL' || q.type === filterType;

        // For discipline/year filter, we need to match from statement prefix
        // Questions are prefixed with "[Discipline Name]"
        const matchesDiscipline = filterDiscipline === 'ALL' ||
            q.statement.includes(filterDiscipline);

        const matchesYear = filterSchoolYear === 'ALL' ||
            q.statement.includes(filterSchoolYear);

        return matchesSearch && matchesType && matchesDiscipline && matchesYear;
    });

    const schoolYears = [
        { value: 'ALL', label: 'Todos os Anos' },
        { value: '1º Ano', label: '1º Ano' },
        { value: '2º Ano', label: '2º Ano' },
        { value: '3º Ano', label: '3º Ano' },
        { value: '4º Ano', label: '4º Ano' },
        { value: '5º Ano', label: '5º Ano' },
        { value: '6º Ano', label: '6º Ano' },
        { value: '7º Ano', label: '7º Ano' },
        { value: '8º Ano', label: '8º Ano' },
        { value: '9º Ano', label: '9º Ano' },
        { value: 'Médio', label: 'Ensino Médio' },
    ];

    return (
        <form onSubmit={handleSubmit} className="container-fluid py-4">
            <div className="row g-4">
                {/* LEFT: Quiz Details Form */}
                <div className="col-lg-5">
                    <div className="card bg-surface border-0 shadow-sm">
                        <div className="card-header bg-primary text-white">
                            <h5 className="mb-0">Detalhes do Quiz</h5>
                        </div>
                        <div className="card-body">
                            <div className="mb-3">
                                <label className="form-label fw-bold">Título *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-bold">Descrição *</label>
                                <textarea
                                    className="form-control"
                                    rows={3}
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="row g-3 mb-3">
                                <div className="col-6">
                                    <label className="form-label fw-bold">Disciplina *</label>
                                    <select
                                        className="form-select"
                                        value={formData.discipline}
                                        onChange={e => setFormData({ ...formData, discipline: e.target.value })}
                                    >
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
                                    </select>
                                </div>

                                <div className="col-6">
                                    <label className="form-label fw-bold">Dificuldade *</label>
                                    <select
                                        className="form-select"
                                        value={formData.difficulty}
                                        onChange={e => setFormData({ ...formData, difficulty: e.target.value })}
                                    >
                                        <option value="EASY">Fácil</option>
                                        <option value="MEDIUM">Médio</option>
                                        <option value="HARD">Difícil</option>
                                        <option value="EXPERT">Expert</option>
                                    </select>
                                </div>
                            </div>

                            <div className="row g-3 mb-3">
                                <div className="col-6">
                                    <label className="form-label fw-bold">XP *</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={formData.rewardXp}
                                        onChange={e => setFormData({ ...formData, rewardXp: parseInt(e.target.value) })}
                                    />
                                </div>

                                <div className="col-6">
                                    <label className="form-label fw-bold">Moedas *</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={formData.rewardCoins}
                                        onChange={e => setFormData({ ...formData, rewardCoins: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="mb-3 form-check">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id="isActive"
                                    checked={formData.isActive}
                                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                />
                                <label className="form-check-label" htmlFor="isActive">
                                    Quiz Ativo
                                </label>
                            </div>

                            {/* Selected Questions */}
                            <div className="mb-3">
                                <label className="form-label fw-bold">
                                    Questões Selecionadas ({formData.questions.length})
                                </label>
                                <div className="border rounded p-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                    {formData.questions.length === 0 ? (
                                        <p className="text-muted small m-0">Nenhuma questão selecionada</p>
                                    ) : (
                                        formData.questions.map((q, idx) => (
                                            <div key={idx} className="d-flex align-items-center gap-2 mb-2 p-2 bg-light rounded">
                                                <span className="badge bg-secondary">{idx + 1}</span>
                                                <span className="flex-grow-1 small text-truncate">{q.statement.substring(0, 50)}...</span>
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => removeQuestion(idx)}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="d-flex gap-2">
                                <button type="submit" className="btn btn-primary flex-grow-1" disabled={isLoading || formData.questions.length === 0}>
                                    {isLoading ? 'Salvando...' : 'Salvar Quiz'}
                                </button>
                                <button type="button" className="btn btn-secondary" onClick={onCancel}>
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Question Selector */}
                <div className="col-lg-7">
                    <div className="card bg-surface border-0 shadow-sm">
                        <div className="card-header bg-info text-white">
                            <h5 className="mb-0">Banco de Questões</h5>
                        </div>
                        <div className="card-body">
                            {/* Filters */}
                            <div className="row g-2 mb-3">
                                <div className="col-md-6">
                                    <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        placeholder="🔍 Buscar por texto..."
                                        value={searchText}
                                        onChange={e => setSearchText(e.target.value)}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <select
                                        className="form-select form-select-sm"
                                        value={filterType}
                                        onChange={e => setFilterType(e.target.value)}
                                    >
                                        <option value="ALL">📝 Todos os Tipos</option>
                                        <option value="MULTIPLE_CHOICE">Múltipla Escolha</option>
                                        <option value="TRUE_FALSE">Verdadeiro/Falso</option>
                                    </select>
                                </div>
                                <div className="col-md-6">
                                    <select
                                        className="form-select form-select-sm"
                                        value={filterDiscipline}
                                        onChange={e => setFilterDiscipline(e.target.value)}
                                    >
                                        <option value="ALL">📚 Todas as Disciplinas</option>
                                        <option value="Matemática">Matemática</option>
                                        <option value="Português">Português</option>
                                        <option value="História">História</option>
                                        <option value="Geografia">Geografia</option>
                                        <option value="Ciências">Ciências</option>
                                        <option value="Física">Física</option>
                                        <option value="Química">Química</option>
                                        <option value="Biologia">Biologia</option>
                                        <option value="Inglês">Inglês</option>
                                    </select>
                                </div>
                                <div className="col-md-6">
                                    <select
                                        className="form-select form-select-sm"
                                        value={filterSchoolYear}
                                        onChange={e => setFilterSchoolYear(e.target.value)}
                                    >
                                        {schoolYears.map(y => (
                                            <option key={y.value} value={y.value}>{y.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="text-muted small mb-2">
                                Mostrando {filteredQuestions.length} questões
                            </div>

                            {/* Questions List */}
                            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                                {filteredQuestions.map((q: any) => (
                                    <div key={q.id} className="card mb-3 border">
                                        <div className="card-body p-3">
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <div className="flex-grow-1">
                                                    <div className="d-flex gap-2 mb-2">
                                                        <span className={`badge ${q.type === 'MULTIPLE_CHOICE' ? 'bg-primary' : 'bg-success'}`}>
                                                            {q.type === 'MULTIPLE_CHOICE' ? 'Múltipla Escolha' : 'V/F'}
                                                        </span>
                                                    </div>
                                                    <p className="mb-2 fw-bold">{q.statement}</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={() => addQuestion(q)}
                                                    disabled={formData.questions.some(fq => fq.id === q.id)}
                                                >
                                                    {formData.questions.some(fq => fq.id === q.id) ? '✓ Adicionada' : '+ Adicionar'}
                                                </button>
                                            </div>

                                            <div className="row g-2 small">
                                                <div className="col-6">
                                                    <div className={`p-2 rounded ${q.correctOption === 'A' ? 'bg-success bg-opacity-25' : 'bg-light'}`}>
                                                        <strong>A)</strong> {q.optionA}
                                                    </div>
                                                </div>
                                                <div className="col-6">
                                                    <div className={`p-2 rounded ${q.correctOption === 'B' ? 'bg-success bg-opacity-25' : 'bg-light'}`}>
                                                        <strong>B)</strong> {q.optionB}
                                                    </div>
                                                </div>
                                                {q.type === 'MULTIPLE_CHOICE' && (
                                                    <>
                                                        <div className="col-6">
                                                            <div className={`p-2 rounded ${q.correctOption === 'C' ? 'bg-success bg-opacity-25' : 'bg-light'}`}>
                                                                <strong>C)</strong> {q.optionC}
                                                            </div>
                                                        </div>
                                                        <div className="col-6">
                                                            <div className={`p-2 rounded ${q.correctOption === 'D' ? 'bg-success bg-opacity-25' : 'bg-light'}`}>
                                                                <strong>D)</strong> {q.optionD}
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>

                                            {q.explanation && (
                                                <div className="mt-2 small text-muted">
                                                    <strong>Explicação:</strong> {q.explanation}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {filteredQuestions.length === 0 && (
                                    <div className="text-center text-muted py-5">
                                        Nenhuma questão encontrada com os filtros selecionados
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
