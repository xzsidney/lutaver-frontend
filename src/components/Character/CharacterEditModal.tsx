import { useMutation } from '@apollo/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UPDATE_CHARACTER_MUTATION } from '../../graphql/character.mutations';
import { ME_CHARACTER_QUERY } from '../../graphql/character.queries';

const updateCharacterSchema = z.object({
    name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(50, 'Nome muito longo'),
    schoolYear: z.string().min(1, 'Selecione um ano escolar'),
});

type UpdateCharacterFormData = z.infer<typeof updateCharacterSchema>;

interface CharacterEditModalProps {
    character: any;
    onClose: () => void;
}

export function CharacterEditModal({ character, onClose }: CharacterEditModalProps) {
    const [updateCharacter, { loading, error }] = useMutation(UPDATE_CHARACTER_MUTATION, {
        refetchQueries: [{ query: ME_CHARACTER_QUERY }],
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<UpdateCharacterFormData>({
        resolver: zodResolver(updateCharacterSchema),
        defaultValues: {
            name: character.name,
            schoolYear: character.schoolYear,
        },
    });

    const onSubmit = async (data: UpdateCharacterFormData) => {
        try {
            await updateCharacter({
                variables: { input: data },
            });
            onClose();
        } catch (err) {
            console.error('Erro ao atualizar personagem:', err);
        }
    };

    const schoolYears = [
        { value: 'FUNDAMENTAL_1_1', label: '1º ano - Fundamental I' },
        { value: 'FUNDAMENTAL_1_2', label: '2º ano - Fundamental I' },
        { value: 'FUNDAMENTAL_1_3', label: '3º ano - Fundamental I' },
        { value: 'FUNDAMENTAL_1_4', label: '4º ano - Fundamental I' },
        { value: 'FUNDAMENTAL_1_5', label: '5º ano - Fundamental I' },
        { value: 'FUNDAMENTAL_2_6', label: '6º ano - Fundamental II' },
        { value: 'FUNDAMENTAL_2_7', label: '7º ano - Fundamental II' },
        { value: 'FUNDAMENTAL_2_8', label: '8º ano - Fundamental II' },
        { value: 'FUNDAMENTAL_2_9', label: '9º ano - Fundamental II' },
        { value: 'HIGH_SCHOOL_1', label: '1º ano - Ensino Médio' },
        { value: 'HIGH_SCHOOL_2', label: '2º ano - Ensino Médio' },
        { value: 'HIGH_SCHOOL_3', label: '3º ano - Ensino Médio' },
    ];

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '30px',
                maxWidth: '500px',
                width: '90%',
                maxHeight: '90vh',
                overflow: 'auto',
            }}>
                <h2 style={{ marginTop: 0 }}>Editar Personagem</h2>

                <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Nome */}
                    <div>
                        <label htmlFor="name" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                            Nome do Personagem
                        </label>
                        <input
                            id="name"
                            type="text"
                            {...register('name')}
                            style={{
                                width: '100%',
                                padding: '12px',
                                fontSize: '16px',
                                border: '2px solid #dee2e6',
                                borderRadius: '4px',
                            }}
                        />
                        {errors.name && (
                            <span style={{ color: '#dc3545', fontSize: '14px', marginTop: '5px', display: 'block' }}>
                                {errors.name.message}
                            </span>
                        )}
                    </div>

                    {/* Ano Escolar */}
                    <div>
                        <label htmlFor="schoolYear" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                            Ano Escolar
                        </label>
                        <select
                            id="schoolYear"
                            {...register('schoolYear')}
                            style={{
                                width: '100%',
                                padding: '12px',
                                fontSize: '16px',
                                border: '2px solid #dee2e6',
                                borderRadius: '4px',
                            }}
                        >
                            {schoolYears.map((year) => (
                                <option key={year.value} value={year.value}>
                                    {year.label}
                                </option>
                            ))}
                        </select>
                        {errors.schoolYear && (
                            <span style={{ color: '#dc3545', fontSize: '14px', marginTop: '5px', display: 'block' }}>
                                {errors.schoolYear.message}
                            </span>
                        )}
                    </div>

                    <div style={{
                        padding: '15px',
                        backgroundColor: '#fff3cd',
                        border: '1px solid #ffeeba',
                        borderRadius: '4px',
                        color: '#856404',
                        fontSize: '14px',
                    }}>
                        ℹ️ Nota: Os atributos do personagem não podem ser alterados após a criação.
                    </div>

                    {/* Erro */}
                    {error && (
                        <div style={{
                            padding: '15px',
                            backgroundColor: '#f8d7da',
                            border: '1px solid #f5c2c7',
                            borderRadius: '4px',
                            color: '#842029',
                        }}>
                            <strong>❌ Erro:</strong> {error.message}
                        </div>
                    )}

                    {/* Botões */}
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                flex: 1,
                                padding: '12px',
                                backgroundColor: '#6c757d',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '16px',
                            }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                flex: 1,
                                padding: '12px',
                                backgroundColor: loading ? '#ccc' : '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontSize: '16px',
                                fontWeight: 'bold',
                            }}
                        >
                            {loading ? 'Salvando...' : '💾 Salvar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
