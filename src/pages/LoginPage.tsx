import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@apollo/client';
import { LOGIN_MUTATION } from '../graphql/mutations';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const loginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [loginMutation, { loading, error }] = useMutation(LOGIN_MUTATION, {
        onError: (error) => {
            // Erro capturado, Apollo Client já atualizou o estado
            console.error('GraphQL Error:', error.message);
        },
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        try {
            const result = await loginMutation({
                variables: { input: data },
            });

            if (result.data?.login) {
                login(result.data.login.accessToken, result.data.login.user);

                // Redirecionar baseado no role
                const role = result.data.login.user.role;
                const redirectPath = role === 'ADMIN' ? '/admin' : role === 'TEACHER' ? '/teacher' : '/player';
                navigate(redirectPath);
            }
        } catch (err) {
            console.error('Erro no login:', err);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px' }}>
            <h1>Login - LUTAVER</h1>
            <p style={{ marginBottom: '20px', color: '#666' }}>
                Plataforma Educacional Gamificada
            </p>

            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
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

                {error && (
                    <div style={{
                        padding: '15px',
                        backgroundColor: '#ffebee',
                        color: '#c62828',
                        borderRadius: '4px',
                        border: '1px solid #ef9a9a',
                        marginBottom: '10px'
                    }}>
                        <strong style={{ display: 'block', marginBottom: '5px' }}>❌ Erro ao fazer login</strong>
                        <span style={{ fontSize: '14px' }}>
                            {error.message.includes('Email ou senha')
                                ? 'Email ou senha inválidos. Verifique seus dados e tente novamente.'
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
                    {loading ? 'Entrando...' : 'Entrar'}
                </button>
            </form>

            <p style={{ marginTop: '20px', textAlign: 'center' }}>
                Não tem conta? <Link to="/register">Registrar</Link>
            </p>
        </div>
    );
}
