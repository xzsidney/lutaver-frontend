import { useState, useEffect } from 'react';

const QUESTION_TYPES = ['MULTIPLE_CHOICE', 'TRUE_FALSE'];

interface QuestionFormProps {
    initialData?: any;
    onSubmit: (data: any) => Promise<void>;
    loading: boolean;
    submitLabel?: string;
}

export function QuestionForm({ initialData, onSubmit, loading, submitLabel = 'Salvar' }: QuestionFormProps) {
    const [formData, setFormData] = useState({
        statement: '',
        type: 'MULTIPLE_CHOICE',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctOption: 'A',
        explanation: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                statement: initialData.statement || '',
                type: initialData.type || 'MULTIPLE_CHOICE',
                optionA: initialData.optionA || '',
                optionB: initialData.optionB || '',
                optionC: initialData.optionC || '',
                optionD: initialData.optionD || '',
                correctOption: initialData.correctOption || 'A',
                explanation: initialData.explanation || ''
            });
        }
    }, [initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.statement.trim()) {
            alert('O enunciado é obrigatório');
            return;
        }

        if (!formData.optionA.trim() || !formData.optionB.trim()) {
            alert('As opções A e B são obrigatórias');
            return;
        }

        if (formData.type === 'MULTIPLE_CHOICE') {
            if (!formData.optionC.trim() || !formData.optionD.trim()) {
                alert('Para questões de múltipla escolha, todas as 4 opções são obrigatórias');
                return;
            }
        }

        const payload = {
            statement: formData.statement,
            type: formData.type,
            optionA: formData.optionA,
            optionB: formData.optionB,
            optionC: formData.optionC || '-',
            optionD: formData.optionD || '-',
            correctOption: formData.correctOption,
            explanation: formData.explanation || null
        };

        onSubmit(payload);
    };

    const isTrueFalse = formData.type === 'TRUE_FALSE';

    return (
        <form onSubmit={handleSubmit}>
            <div className="row g-3">
                {/* Question Type */}
                <div className="col-12">
                    <label className="form-label">Tipo de Questão *</label>
                    <select
                        className="form-select"
                        value={formData.type}
                        onChange={e => {
                            const newType = e.target.value;
                            setFormData({
                                ...formData,
                                type: newType,
                                // Reset options if switching to TRUE_FALSE
                                ...(newType === 'TRUE_FALSE' ? {
                                    optionA: 'Verdadeiro',
                                    optionB: 'Falso',
                                    optionC: '',
                                    optionD: '',
                                    correctOption: 'A'
                                } : {})
                            });
                        }}
                    >
                        {QUESTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>

                {/* Statement */}
                <div className="col-12">
                    <label className="form-label">Enunciado *</label>
                    <textarea
                        className="form-control"
                        rows={3}
                        value={formData.statement}
                        onChange={e => setFormData({ ...formData, statement: e.target.value })}
                        required
                        placeholder="Digite o enunciado da questão..."
                    />
                </div>

                {/* Options */}
                <div className="col-12 mt-3">
                    <h6 className="border-bottom pb-2">Opções de Resposta</h6>
                </div>

                <div className="col-md-6">
                    <label className="form-label">Opção A *</label>
                    <input
                        className="form-control"
                        value={formData.optionA}
                        onChange={e => setFormData({ ...formData, optionA: e.target.value })}
                        required
                        disabled={isTrueFalse}
                    />
                </div>

                <div className="col-md-6">
                    <label className="form-label">Opção B *</label>
                    <input
                        className="form-control"
                        value={formData.optionB}
                        onChange={e => setFormData({ ...formData, optionB: e.target.value })}
                        required
                        disabled={isTrueFalse}
                    />
                </div>

                {!isTrueFalse && (
                    <>
                        <div className="col-md-6">
                            <label className="form-label">Opção C *</label>
                            <input
                                className="form-control"
                                value={formData.optionC}
                                onChange={e => setFormData({ ...formData, optionC: e.target.value })}
                                required
                            />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">Opção D *</label>
                            <input
                                className="form-control"
                                value={formData.optionD}
                                onChange={e => setFormData({ ...formData, optionD: e.target.value })}
                                required
                            />
                        </div>
                    </>
                )}

                {/* Correct Answer */}
                <div className="col-md-4">
                    <label className="form-label">Resposta Correta *</label>
                    <select
                        className="form-select"
                        value={formData.correctOption}
                        onChange={e => setFormData({ ...formData, correctOption: e.target.value })}
                        required
                    >
                        <option value="A">A</option>
                        <option value="B">B</option>
                        {!isTrueFalse && (
                            <>
                                <option value="C">C</option>
                                <option value="D">D</option>
                            </>
                        )}
                    </select>
                </div>

                {/* Explanation */}
                <div className="col-12">
                    <label className="form-label">Explicação (opcional)</label>
                    <textarea
                        className="form-control"
                        rows={2}
                        value={formData.explanation}
                        onChange={e => setFormData({ ...formData, explanation: e.target.value })}
                        placeholder="Explique por que esta é a resposta correta..."
                    />
                </div>

                <div className="col-12 mt-4 d-flex justify-content-end gap-2">
                    <button type="submit" className="btn btn-primary-br px-4" disabled={loading}>
                        {loading ? 'Salvando...' : submitLabel}
                    </button>
                </div>
            </div>
        </form>
    );
}
