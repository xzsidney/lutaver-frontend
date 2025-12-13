import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface RoleBasedRouteProps {
    children: React.ReactNode;
    allowedRoles: Array<'ADMIN' | 'PLAYER' | 'TEACHER'>;
}

/**
 * Protege rotas baseado no role do usuário
 * Redireciona para /403 se autenticado mas sem permissão
 * Redireciona para / se não autenticado
 */
export function RoleBasedRoute({
    children,
    allowedRoles,
}: RoleBasedRouteProps) {
    const { user, isAuthenticated, isLoading } = useAuth();
    const [forceRedirect, setForceRedirect] = useState(false);

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
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    gap: '20px',
                }}
            >
                <div style={{ fontSize: '18px' }}>Verificando permissões...</div>
                <div style={{ fontSize: '14px', color: '#666' }}>Aguarde um momento</div>
            </div>
        );
    }

    // Não autenticado → redireciona para home
    if (!isAuthenticated || forceRedirect) {
        return <Navigate to="/" replace />;
    }

    // Autenticado mas sem permissão → 403
    if (!allowedRoles.includes(user!.role)) {
        return <Navigate to="/403" replace />;
    }

    return <>{children}</>;
}
