import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@apollo/client';
import { REGISTER_MUTATION } from '../graphql/mutations';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const registerSchema = z
    .object({
        name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
        email: z.string().email('Email inválido'),
        password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'As senhas não conferem',
        path: ['confirmPassword'],
    });

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [registerMutation, { loading, error }] = useMutation(REGISTER_MUTATION, {
        onError: (error) => {
            // Erro capturado, Apollo Client já atualizou o estado
            console.error('GraphQL Error:', error.message);
        },
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterFormData) => {
        try {
            const result = await registerMutation({
                variables: {
                    input: {
                        name: data.name,
                        email: data.email,
                        password: data.password,
                    },
                },
            });

            if (result.data?.register) {
                login(result.data.register.accessToken, result.data.register.user);

                // Redirecionar baseado no role
                const role = result.data.register.user.role;
                const redirectPath = role === 'ADMIN' ? '/admin' : role === 'TEACHER' ? '/teacher' : '/player';
                navigate(redirectPath);
            }
        } catch (err) {
            console.error('Erro no registro:', err);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px' }}>
            <h1>Cadastro - LUTAVER</h1>
            <p style={{ marginBottom: '20px', color: '#666' }}>
                Crie sua conta na plataforma educacional
            </p>

            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                    <label htmlFor="name" style={{ display: 'block', marginBottom: '5px' }}>
                        Nome:
                    </label>
                    <input
                        id="name"
                        type="text"
                        {...register('name')}
                        style={{ width: '100%', padding: '8px', fontSize: '14px' }}
                    />
                    {errors.name && (
                        <span style={{ color: 'red', fontSize: '12px' }}>{errors.name.message}</span>
                    )}
                </div>

                <div>
                    <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>
                        Email:
                    </label>
                    <input
                        id="email"
                        type="email"
                        {...register('email')}
                        style={{ width: '100%', padding: '8px', fontSize: '14px' }}
                    />
                    {errors.email && (
                        <span style={{ color: 'red', fontSize: '12px' }}>{errors.email.message}</span>
                    )}
                </div>

                <div>
                    <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>
                        Senha:
                    </label>
                    <input
                        id="password"
                        type="password"
                        {...register('password')}
                        style={{ width: '100%', padding: '8px', fontSize: '14px' }}
                    />
                    {errors.password && (
                        <span style={{ color: 'red', fontSize: '12px' }}>{errors.password.message}</span>
                    )}
                </div>

                <div>
                    <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '5px' }}>
                        Confirmar Senha:
                    </label>
                    <input
                        id="confirmPassword"
                        type="password"
                        {...register('confirmPassword')}
                        style={{ width: '100%', padding: '8px', fontSize: '14px' }}
                    />
                    {errors.confirmPassword && (
                        <span style={{ color: 'red', fontSize: '12px' }}>{errors.confirmPassword.message}</span>
                    )}
                </div>

                {error && (
                    <div style={{
                        padding: '15px',
                        backgroundColor: '#ffebee',
                        color: '#c62828',
                        borderRadius: '4px',
                        border: '1px solid #ef9a9a',
                        marginBottom: '10px'
                    }}>
                        <strong style={{ display: 'block', marginBottom: '5px' }}>❌ Erro no cadastro</strong>
                        <span style={{ fontSize: '14px' }}>
                            {error.message.includes('Email já cadastrado')
                                ? 'Este email já está em uso. Faça login ou use outro email.'
                                : error.message.includes('Network')
                                    ? 'Erro de conexão. Verifique sua internet e tente novamente.'
                                    : 'Ocorreu um erro. Tente novamente mais tarde.'}
                        </span>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        padding: '10px',
                        backgroundColor: loading ? '#ccc' : '#1976d2',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '16px',
                    }}
                >
                    {loading ? 'Cadastrando...' : 'Cadastrar'}
                </button>
            </form>

            <p style={{ marginTop: '20px', textAlign: 'center' }}>
                Já tem conta? <Link to="/login">Fazer login</Link>
            </p>
        </div>
    );
}
