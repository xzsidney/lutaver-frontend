import React from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { ME_QUERY } from '../graphql/queries';
import { LOGOUT_ALL_MUTATION } from '../graphql/mutations';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export function DashboardPage() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const { data, loading, error } = useQuery(ME_QUERY);
    const [logoutAllMutation, { loading: logoutAllLoading }] = useMutation(LOGOUT_ALL_MUTATION);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const handleLogoutAll = async () => {
        try {
            await logoutAllMutation();
            await logout();
            navigate('/login');
        } catch (err) {
            console.error('Erro ao fazer logout global:', err);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div>Carregando...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ maxWidth: '600px', margin: '100px auto', padding: '20px' }}>
                <h1>Erro</h1>
                <p style={{ color: 'red' }}>{error.message}</p>
            </div>
        );
    }

    const user = data?.me;

    return (
        <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1>Dashboard - LUTAVER</h1>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={handleLogout}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#f44336',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                        }}
                    >
                        Sair
                    </button>
                    <button
                        onClick={handleLogoutAll}
                        disabled={logoutAllLoading}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#d32f2f',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: logoutAllLoading ? 'not-allowed' : 'pointer',
                            opacity: logoutAllLoading ? 0.6 : 1,
                        }}
                    >
                        {logoutAllLoading ? 'Saindo...' : 'Sair de Todos'}
                    </button>
                </div>
            </div>

            <div style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                <h2 style={{ marginTop: 0 }}>Olá, {user?.name}! 👋</h2>
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Perfil:</strong> {user?.role}</p>
                <p><strong>Conta criada em:</strong> {new Date(user?.createdAt).toLocaleDateString('pt-BR')}</p>
            </div>

            <div style={{ backgroundColor: '#e3f2fd', padding: '20px', borderRadius: '8px' }}>
                <h3 style={{ marginTop: 0 }}>🔐 Sistema de Autenticação Seguro</h3>
                <ul>
                    <li>✅ Access token em memória (15 minutos)</li>
                    <li>✅ Refresh token em httpOnly cookie (7 dias)</li>
                    <li>✅ Refresh automático quando token expira</li>
                    <li>✅ Proteção contra replay attack</li>
                    <li>✅ Logout global revoga todas as sessões</li>
                </ul>
            </div>

            <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '8px', border: '1px solid #ffc107' }}>
                <p style={{ margin: 0 }}>
                    <strong>Próximos passos:</strong> Integrar com o sistema de personagens e progressão do LUTAVER!
                </p>
            </div>
        </div>
    );
}
