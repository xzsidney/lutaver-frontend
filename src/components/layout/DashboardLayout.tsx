import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import './DashboardLayout.css';

interface DashboardLayoutProps {
    children: React.ReactNode;
    title?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <div className="dashboard-layout">
            <header className="dashboard-layout__header">
                <div className="dashboard-layout__container">
                    <div className="dashboard-layout__brand">
                        <Link to="/characters" className="dashboard-layout__logo">
                            🎮 LUTAVER
                        </Link>
                        <span className="dashboard-layout__divider">/</span>
                        <span className="dashboard-layout__role">{user?.role}</span>
                    </div>

                    <nav className="dashboard-layout__nav">
                        {user?.role === 'PLAYER' && (
                            <>
                                <Link to="/player">Dashboard</Link>
                                <Link to="/player/shop">Loja</Link>
                                <Link to="/player/inventory">Inventário</Link>
                                <Link to="/characters">Personagens</Link>
                            </>
                        )}
                        {user?.role === 'ADMIN' && (
                            <Link to="/admin">Painel</Link>
                        )}
                    </nav>

                    <div className="dashboard-layout__profile">
                        <span className="dashboard-layout__username">{user?.name}</span>
                        <Button variant="outline" size="sm" onClick={handleLogout}>
                            Sair
                        </Button>
                    </div>
                </div>
            </header>

            <main className="dashboard-layout__content">
                <div className="dashboard-layout__container">
                    {title && <h1 className="dashboard-layout__title">{title}</h1>}
                    {children}
                </div>
            </main>
        </div>
    );
};
