import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Forbidden403Page() {
    const { user } = useAuth();

    const getCorrectPath = () => {
        switch (user?.role) {
            case 'ADMIN':
                return '/admin';
            case 'PLAYER':
                return '/player';
            case 'TEACHER':
                return '/teacher';
            default:
                return '/';
        }
    };

    const getRoleName = () => {
        switch (user?.role) {
            case 'ADMIN':
                return 'Administrador';
            case 'PLAYER':
                return 'Jogador';
            case 'TEACHER':
                return 'Professor';
            default:
                return 'Desconhecido';
        }
    };

    return (
        <div
            style={{
                maxWidth: '600px',
                margin: '100px auto',
                padding: '40px',
                textAlign: 'center',
                backgroundColor: '#ffebee',
                borderRadius: '8px',
                border: '2px solid #ef5350',
            }}
        >
            <h1 style={{ fontSize: '96px', margin: '0 0 20px 0' }}>🚫</h1>
            <h2 style={{ color: '#c62828', marginBottom: '20px' }}>
                403 - Acesso Negado
            </h2>
            <p style={{ fontSize: '18px', marginBottom: '20px', lineHeight: '1.6' }}>
                Você não tem permissão para acessar esta página.
            </p>
            <div
                style={{
                    padding: '15px',
                    backgroundColor: '#fff',
                    borderRadius: '4px',
                    marginBottom: '30px',
                }}
            >
                <p style={{ margin: '0', color: '#666' }}>
                    Seu perfil atual: <strong>{getRoleName()}</strong>
                </p>
            </div>

            <Link
                to={getCorrectPath()}
                style={{
                    display: 'inline-block',
                    padding: '12px 24px',
                    backgroundColor: '#1976d2',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '4px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                }}
            >
                Ir para minha área
            </Link>

            <p style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
                ou{' '}
                <Link to="/" style={{ color: '#1976d2' }}>
                    voltar para a página inicial
                </Link>
            </p>
        </div>
    );
}
