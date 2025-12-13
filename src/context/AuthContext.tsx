import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client';
import { ME_QUERY } from '../graphql/queries';
import { LOGOUT_MUTATION } from '../graphql/mutations';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'PLAYER' | 'ADMIN' | 'TEACHER';
    createdAt: string;
}

interface AuthContextType {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (accessToken: string, user: User) => void;
    logout: () => Promise<void>;
    rehydrate: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(
        localStorage.getItem('accessToken')
    );
    const [isLoading, setIsLoading] = useState(true);

    const [fetchMe] = useLazyQuery(ME_QUERY);
    const [logoutMutation] = useMutation(LOGOUT_MUTATION);

    /**
     * Reidrata sessão ao carregar app
     * Tenta buscar dados do usuário com access token armazenado
     * Se falhar, o Apollo Client tentará refresh automático
     */
    const rehydrate = async () => {
        const storedToken = localStorage.getItem('accessToken');

        if (storedToken) {
            try {
                const { data } = await fetchMe();
                if (data?.me) {
                    setUser(data.me);
                    setAccessToken(storedToken);
                }
            } catch (error) {
                // Token inválido ou expirado
                // Se refresh também falhar, será redirecionado para login
                localStorage.removeItem('accessToken');
                setAccessToken(null);
            }
        }

        setIsLoading(false);
    };

    useEffect(() => {
        rehydrate();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * Salva access token e dados do usuário
     * Chamado após login ou register bem-sucedidos
     */
    const login = (newAccessToken: string, newUser: User) => {
        localStorage.setItem('accessToken', newAccessToken);
        setAccessToken(newAccessToken);
        setUser(newUser);
    };

    /**
     * Faz logout do usuário
     * Revoga refresh token no backend e limpa estado local
     */
    const logout = async () => {
        try {
            await logoutMutation();
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        } finally {
            localStorage.removeItem('accessToken');
            setAccessToken(null);
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                accessToken,
                isAuthenticated: !!user,
                isLoading,
                login,
                logout,
                rehydrate,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
