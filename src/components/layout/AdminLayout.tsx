import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/AdminDashboard.css';

interface AdminLayoutProps {
    children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <div className="admin-layout-wrapper">
            <nav className="navbar navbar-expand-lg nav-admin sticky-top">
                <div className="container">
                    <span className="brand-badge">
                        <span className="dot"></span> Lutaver / Admin
                    </span>

                    <div className="ms-auto d-flex gap-2 align-items-center">
                        <span className="badge-br badge-blue">DEV</span>
                        <span className="badge-br badge-green">ADMIN</span>
                        <button className="btn btn-sm btn-ghost" onClick={handleLogout}>Sair</button>
                    </div>
                </div>
            </nav>

            <main className="py-4">
                <div className="container">
                    <div className="layout">
                        {/* SIDEBAR */}
                        <aside className="sidebar p-3">
                            <div className="mb-3">
                                <div className="section-title h6 mb-1">Painel Administrativo</div>
                                <div className="section-sub small">Gestão do Lutaver</div>
                            </div>

                            <div className="d-grid gap-2">
                                <NavLink to="/admin" end className={({ isActive }) => `menu-link ${isActive ? 'active' : ''}`}>
                                    <span className="icon-chip chip-yellow">D</span>Dashboard
                                </NavLink>
                                <NavLink to="/admin/users" className={({ isActive }) => `menu-link ${isActive ? 'active' : ''}`}>
                                    <span className="icon-chip chip-blue">U</span>Usuários
                                </NavLink>
                                <NavLink to="/admin/characters" className={({ isActive }) => `menu-link ${isActive ? 'active' : ''}`}>
                                    <span className="icon-chip chip-green">C</span>Personagens
                                </NavLink>
                                <NavLink to="/admin/npcs" className={({ isActive }) => `menu-link ${isActive ? 'active' : ''}`}>
                                    <span className="icon-chip chip-purple">N</span>NPCs
                                </NavLink>
                                <NavLink to="/admin/disciplines" className={({ isActive }) => `menu-link ${isActive ? 'active' : ''}`}>
                                    <span className="icon-chip chip-yellow">Di</span>Disciplinas
                                </NavLink>
                                <NavLink to="/admin/quizzes" className={({ isActive }) => `menu-link ${isActive ? 'active' : ''}`}>
                                    <span className="icon-chip chip-blue">Q</span>Quizzes
                                </NavLink>
                                <NavLink to="/admin/questions" className={({ isActive }) => `menu-link ${isActive ? 'active' : ''}`}>
                                    <span className="icon-chip chip-purple">Qu</span>Questões
                                </NavLink>
                                <NavLink to="/admin/items" className={({ isActive }) => `menu-link ${isActive ? 'active' : ''}`}>
                                    <span className="icon-chip chip-green">I</span>Itens
                                </NavLink>
                                <NavLink to="/admin/settings" className={({ isActive }) => `menu-link ${isActive ? 'active' : ''}`}>
                                    <span className="icon-chip chip-yellow">S</span>Configurações
                                </NavLink>
                            </div>
                        </aside>

                        {/* CONTENT */}
                        <div className="content-wrapper">
                            {children}
                        </div>
                    </div>
                </div>
            </main>

            <footer className="py-3 text-center small">
                © Lutaver — Admin Dashboard (Light Theme)
            </footer>
        </div>
    );
}
