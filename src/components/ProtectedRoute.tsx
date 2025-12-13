import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

/**
 * Componente para proteger rotas que requerem autenticação
 * Redireciona para homepage se usuário não estiver autenticado
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading } = useAuth();
    const [forceRedirect, setForceRedirect] = useState(false);

    // Timeout de 3 segundos para evitar loading infinito
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (isLoading && !isAuthenticated) {
                setForceRedirect(true);
            }
        }, 3000);

        return () => clearTimeout(timeout);
    }, [isLoading, isAuthenticated]);

    if (isLoading && !forceRedirect) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                gap: '20px'
            }}>
                <div style={{ fontSize: '18px' }}>Verificando autenticação...</div>
                <div style={{ fontSize: '14px', color: '#666' }}>
                    Aguarde um momento
                </div>
            </div>
        );
    }

    if (!isAuthenticated || forceRedirect) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}
