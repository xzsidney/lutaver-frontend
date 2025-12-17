import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { ALL_DISCIPLINES_QUERY } from '../../../../graphql/npc/npc.queries';

const NPC_TYPES = ['STORY', 'BOSS', 'BOTH'];
const SCHOOL_YEARS = [
    'FUNDAMENTAL_1_1', 'FUNDAMENTAL_1_2', 'FUNDAMENTAL_1_3', 'FUNDAMENTAL_1_4', 'FUNDAMENTAL_1_5',
    'FUNDAMENTAL_2_6', 'FUNDAMENTAL_2_7', 'FUNDAMENTAL_2_8', 'FUNDAMENTAL_2_9',
    'HIGH_SCHOOL_1', 'HIGH_SCHOOL_2', 'HIGH_SCHOOL_3'
];

interface NpcFormProps {
    initialData?: any;
    onSubmit: (data: any) => Promise<void>;
    loading: boolean;
    submitLabel?: string;
}

export function NpcForm({ initialData, onSubmit, loading, submitLabel = 'Salvar' }: NpcFormProps) {
    const { data: disciplinesData } = useQuery(ALL_DISCIPLINES_QUERY);
    const disciplines = disciplinesData?.allDisciplines || [];

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        type: 'STORY',
        isActive: true,
        avatarUrl: '',
        portraitUrl: '',
        schoolYear: '',
        disciplineId: '',
        defaultMood: '',
        defaultDialog: '',
        bossHp: 0,
        bossAttack: 0,
        bossDefense: 0,
        bossDifficulty: 0,
        rewardXp: 0,
        rewardCoins: 0,
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                description: initialData.description || '',
                type: initialData.type || 'STORY',
                isActive: initialData.isActive ?? true,
                avatarUrl: initialData.avatarUrl || '',
                portraitUrl: initialData.portraitUrl || '',
                schoolYear: initialData.schoolYear || '',
                disciplineId: initialData.disciplineId || '',
                defaultMood: initialData.defaultMood || '',
                defaultDialog: initialData.defaultDialog || '',
                bossHp: initialData.bossHp || 0,
                bossAttack: initialData.bossAttack || 0,
                bossDefense: initialData.bossDefense || 0,
                bossDifficulty: initialData.bossDifficulty || 0,
                rewardXp: initialData.rewardXp || 0,
                rewardCoins: initialData.rewardCoins || 0,
            });
        }
    }, [initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Basic Validation
        if (!formData.name) {
            alert('Nome é obrigatório');
            return;
        }

        const isBoss = formData.type === 'BOSS' || formData.type === 'BOTH';
        if (isBoss) {
            if (formData.bossHp <= 0 || formData.bossAttack <= 0 || formData.bossDefense <= 0 || formData.bossDifficulty <= 0) {
                alert('Para Boss/Both, os status de combate (HP, Attack, Defense, Difficulty) devem ser maiores que zero.');
                return;
            }
        }

        // Filter empty strings to undefined or null if needed, but backend handles optional strings well usually.
        // Convert numbers
        const payload = {
            ...formData,
            bossHp: Number(formData.bossHp),
            bossAttack: Number(formData.bossAttack),
            bossDefense: Number(formData.bossDefense),
            bossDifficulty: Number(formData.bossDifficulty),
            rewardXp: Number(formData.rewardXp),
            rewardCoins: Number(formData.rewardCoins),
            schoolYear: formData.schoolYear || null, // Enum expects specific string or null
            disciplineId: formData.disciplineId || null,
        };

        onSubmit(payload);
    };

    const isBoss = formData.type === 'BOSS' || formData.type === 'BOTH';
    const isStory = formData.type === 'STORY' || formData.type === 'BOTH';

    return (
        <form onSubmit={handleSubmit}>
            <div className="row g-3">
                {/* Basic Info */}
                <div className="col-12">
                    <h5 className="border-bottom pb-2 mb-3">Informações Básicas</h5>
                </div>

                <div className="col-md-8">
                    <label className="form-label">Nome *</label>
                    <input
                        className="form-control"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                </div>

                <div className="col-md-4">
                    <label className="form-label">Tipo *</label>
                    <select
                        className="form-select"
                        value={formData.type}
                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                    >
                        {NPC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>

                <div className="col-md-12">
                    <div className="form-check form-switch">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            id="isActive"
                            checked={formData.isActive}
                            onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                        />
                        <label className="form-check-label" htmlFor="isActive">NPC Ativo</label>
                    </div>
                </div>

                <div className="col-md-12">
                    <label className="form-label">Descrição</label>
                    <textarea
                        className="form-control"
                        rows={2}
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                <div className="col-md-6">
                    <label className="form-label">Avatar URL</label>
                    <input
                        className="form-control"
                        value={formData.avatarUrl}
                        onChange={e => setFormData({ ...formData, avatarUrl: e.target.value })}
                        placeholder="https://..."
                    />
                </div>

                <div className="col-md-6">
                    <label className="form-label">Portrait URL</label>
                    <input
                        className="form-control"
                        value={formData.portraitUrl}
                        onChange={e => setFormData({ ...formData, portraitUrl: e.target.value })}
                        placeholder="https://..."
                    />
                </div>

                {/* Context */}
                <div className="col-12 mt-4">
                    <h5 className="border-bottom pb-2 mb-3">Contexto Escolar</h5>
                </div>

                <div className="col-md-6">
                    <label className="form-label">Ano Escolar</label>
                    <select
                        className="form-select"
                        value={formData.schoolYear}
                        onChange={e => setFormData({ ...formData, schoolYear: e.target.value })}
                    >
                        <option value="">Qualquer</option>
                        {SCHOOL_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>

                <div className="col-md-6">
                    <label className="form-label">Disciplina Associada</label>
                    <select
                        className="form-select"
                        value={formData.disciplineId}
                        onChange={e => setFormData({ ...formData, disciplineId: e.target.value })}
                    >
                        <option value="">Nenhuma</option>
                        {disciplines.map((d: any) => (
                            <option key={d.id} value={d.id}>{d.name} ({d.schoolYear})</option>
                        ))}
                    </select>
                </div>

                {/* Story Fields */}
                {isStory && (
                    <>
                        <div className="col-12 mt-4">
                            <h5 className="border-bottom pb-2 mb-3">Modo História</h5>
                        </div>
                        <div className="col-md-4">
                            <label className="form-label">Humor Padrão</label>
                            <input
                                className="form-control"
                                value={formData.defaultMood}
                                onChange={e => setFormData({ ...formData, defaultMood: e.target.value })}
                                placeholder="Ex: Feliz, Misterioso"
                            />
                        </div>
                        <div className="col-md-8">
                            <label className="form-label">Diálogo Padrão</label>
                            <textarea
                                className="form-control"
                                rows={2}
                                value={formData.defaultDialog}
                                onChange={e => setFormData({ ...formData, defaultDialog: e.target.value })}
                            />
                        </div>
                    </>
                )}

                {/* Boss Fields */}
                {isBoss && (
                    <>
                        <div className="col-12 mt-4">
                            <h5 className="border-bottom pb-2 mb-3">Modo Batalha (Boss)</h5>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">HP (Vida) *</label>
                            <input type="number" className="form-control" value={formData.bossHp} onChange={e => setFormData({ ...formData, bossHp: Number(e.target.value) })} />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">Ataque *</label>
                            <input type="number" className="form-control" value={formData.bossAttack} onChange={e => setFormData({ ...formData, bossAttack: Number(e.target.value) })} />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">Defesa *</label>
                            <input type="number" className="form-control" value={formData.bossDefense} onChange={e => setFormData({ ...formData, bossDefense: Number(e.target.value) })} />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">Dificuldade (1-10) *</label>
                            <input type="number" className="form-control" value={formData.bossDifficulty} onChange={e => setFormData({ ...formData, bossDifficulty: Number(e.target.value) })} />
                        </div>
                    </>
                )}

                {/* Rewards */}
                <div className="col-12 mt-4">
                    <h5 className="border-bottom pb-2 mb-3">Recompensas</h5>
                </div>
                <div className="col-md-6">
                    <label className="form-label">Recompensa XP</label>
                    <input type="number" className="form-control" value={formData.rewardXp} onChange={e => setFormData({ ...formData, rewardXp: Number(e.target.value) })} />
                </div>
                <div className="col-md-6">
                    <label className="form-label">Recompensa Moedas</label>
                    <input type="number" className="form-control" value={formData.rewardCoins} onChange={e => setFormData({ ...formData, rewardCoins: Number(e.target.value) })} />
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
