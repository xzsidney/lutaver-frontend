import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import './MainLayout.css';

interface MainLayoutProps {
    children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    return (
        <div className="main-layout">
            <header className="main-layout__header">
                <div className="main-layout__container">
                    <Link to="/" className="main-layout__logo">
                        🎮 LUTAVER
                    </Link>
                    <nav className="main-layout__nav">
                        <Link to="/login">
                            <Button variant="ghost">Login</Button>
                        </Link>
                        <Link to="/register">
                            <Button variant="primary">Criar Conta</Button>
                        </Link>
                    </nav>
                </div>
            </header>
            <main className="main-layout__content">
                {children}
            </main>
            <footer className="main-layout__footer">
                <div className="main-layout__container">
                    <p>&copy; {new Date().getFullYear()} Lutaver - Plataforma Educacional Gamificada</p>
                </div>
            </footer>
        </div>
    );
};
