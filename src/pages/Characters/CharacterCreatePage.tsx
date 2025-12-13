import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CREATE_CHARACTER_MUTATION } from '../../graphql/character.mutations';
import { MY_CHARACTERS_QUERY } from '../../graphql/character.queries';

const createCharacterSchema = z.object({
    name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(50, 'Nome muito longo'),
    schoolYear: z.string().min(1, 'Selecione um ano escolar'),
});

type CreateCharacterFormData = z.infer<typeof createCharacterSchema>;

export function CharacterCreatePage() {
    const navigate = useNavigate();
    const [createCharacter, { loading, error }] = useMutation(CREATE_CHARACTER_MUTATION, {
        refetchQueries: [{ query: MY_CHARACTERS_QUERY }],
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CreateCharacterFormData>({
        resolver: zodResolver(createCharacterSchema),
    });

    const onSubmit = async (data: CreateCharacterFormData) => {
        try {
            const result = await createCharacter({
                variables: { input: data },
            });

            if (result.data?.createCharacter?.id) {
                navigate(`/characters/${result.data.createCharacter.id}`);
            }
        } catch (err) {
            console.error('Erro ao criar personagem:', err);
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
        <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px' }}>
            <h1>Criar Novo Personagem</h1>
            <p style={{ color: '#666', marginBottom: '30px' }}>
                Crie seu avatar para começar sua jornada de aprendizado!
            </p>

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
                        placeholder="Ex: Guerreiro das Matemáticas"
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
                        <option value="">Selecione...</option>
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

                {/* Info Box */}
                <div style={{
                    backgroundColor: '#e7f3ff',
                    border: '1px solid #b3d9ff',
                    borderRadius: '4px',
                    padding: '15px',
                }}>
                    <p style={{ margin: 0, fontSize: '14px', color: '#004085' }}>
                        ℹ️ Seu personagem começará com:
                    </p>
                    <ul style={{ margin: '10px 0 0 20px', fontSize: '14px', color: '#004085' }}>
                        <li>Nível 1</li>
                        <li>100 HP</li>
                        <li>100 Moedas</li>
                        <li>Atributos base: 10 em cada</li>
                    </ul>
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
                        onClick={() => navigate('/characters')}
                        style={{
                            flex: 1,
                            padding: '12px',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
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
                            flex: 2,
                            padding: '12px',
                            backgroundColor: loading ? '#ccc' : '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: '16px',
                            fontWeight: 'bold',
                        }}
                    >
                        {loading ? 'Criando...' : '✨ Criar Personagem'}
                    </button>
                </div>
            </form>
        </div>
    );
}
