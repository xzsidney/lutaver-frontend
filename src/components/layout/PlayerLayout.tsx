import React from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/PlayerHome.css';

interface PlayerLayoutProps {
    children: React.ReactNode;
}

export function PlayerLayout({ children }: PlayerLayoutProps) {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <div className="player-layout-wrapper">
            {/* NAV */}
            <nav className="navbar nav-player sticky-top">
                <div className="container">
                    <div className="d-flex align-items-center gap-3">
                        <span className="brand-badge">🎓 Lutaver</span>

                        <div className="d-none d-md-flex">
                            <NavLink to="/player" end className={({ isActive }) => `nav-link-game ${isActive ? 'active' : ''}`}>
                                🏠 Home
                            </NavLink>
                            <NavLink to="/player/quizzes" className={({ isActive }) => `nav-link-game ${isActive ? 'active' : ''}`}>
                                ⚡ Quiz
                            </NavLink>
                            <NavLink to="/player/story" className={({ isActive }) => `nav-link-game ${isActive ? 'active' : ''}`}>
                                📖 História
                            </NavLink>
                            <NavLink to="/player/inventory" className={({ isActive }) => `nav-link-game ${isActive ? 'active' : ''}`}>
                                🎒 Inventário
                            </NavLink>
                            <NavLink to="/player/shop" className={({ isActive }) => `nav-link-game ${isActive ? 'active' : ''}`}>
                                🛒 Loja
                            </NavLink>
                        </div>
                    </div>

                    <div className="d-flex gap-2 align-items-center">
                        <span className="badge bg-success d-flex align-items-center">PLAYER</span>
                        <button className="btn btn-sm btn-ghost" onClick={handleLogout}>Sair</button>
                    </div>
                </div>
            </nav>

            <main className="py-4">
                <div className="container">
                    {children}
                </div>
            </main>

            <footer className="py-3 text-center small">
                © Lutaver — Área do Jogador
            </footer>
        </div>
    );
}
