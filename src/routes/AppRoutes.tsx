import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { AdminPage } from '../pages/AdminPage';
import { PlayerPage } from '../pages/PlayerPage';
import { TeacherPage } from '../pages/TeacherPage';
import { Forbidden403Page } from '../pages/Forbidden403Page';
import { RoleBasedRoute } from '../components/RoleBasedRoute';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { CharactersListPage } from '../pages/Characters/CharactersListPage';
import { CharacterCreatePage } from '../pages/Characters/CharacterCreatePage';
import { CharacterDetailPage } from '../pages/Characters/CharacterDetailPage';
import { PlayerDashboardPage } from '../pages/Player/PlayerDashboardPage';
import { ShopPage } from '../pages/Player/ShopPage';
import { InventoryPage } from '../pages/Player/InventoryPage';
import { AdminUsersPage } from '../pages/Admin/AdminUsersPage';
import { AdminCharactersPage } from '../pages/Admin/AdminCharactersPage';
import { AdminDisciplinesPage } from '../pages/Admin/AdminDisciplinesPage';
import { AdminItemsPage } from '../pages/Admin/AdminItemsPage';

export function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Rotas protegidas por role */}
                <Route
                    path="/admin"
                    element={
                        <RoleBasedRoute allowedRoles={['ADMIN']}>
                            <AdminPage />
                        </RoleBasedRoute>
                    }
                />
                <Route
                    path="/admin/users"
                    element={
                        <RoleBasedRoute allowedRoles={['ADMIN']}>
                            <AdminUsersPage />
                        </RoleBasedRoute>
                    }
                />
                <Route
                    path="/admin/characters"
                    element={
                        <RoleBasedRoute allowedRoles={['ADMIN']}>
                            <AdminCharactersPage />
                        </RoleBasedRoute>
                    }
                />
                <Route
                    path="/admin/disciplines"
                    element={
                        <RoleBasedRoute allowedRoles={['ADMIN']}>
                            <AdminDisciplinesPage />
                        </RoleBasedRoute>
                    }
                />
                <Route
                    path="/admin/items"
                    element={
                        <RoleBasedRoute allowedRoles={['ADMIN']}>
                            <AdminItemsPage />
                        </RoleBasedRoute>
                    }
                />

                <Route
                    path="/player"
                    element={
                        <RoleBasedRoute allowedRoles={['PLAYER']}>
                            <PlayerPage />
                        </RoleBasedRoute>
                    }
                />

                <Route
                    path="/teacher"
                    element={
                        <RoleBasedRoute allowedRoles={['TEACHER']}>
                            <TeacherPage />
                        </RoleBasedRoute>
                    }
                />

                {/* Rotas de personagens (protegidas por autenticação) */}
                <Route
                    path="/characters"
                    element={
                        <ProtectedRoute>
                            <CharactersListPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/characters/new"
                    element={
                        <ProtectedRoute>
                            <CharacterCreatePage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/characters/:id"
                    element={
                        <ProtectedRoute>
                            <CharacterDetailPage />
                        </ProtectedRoute>
                    }
                />

                {/* Player Dashboard */}
                <Route
                    path="/player/dashboard"
                    element={
                        <ProtectedRoute>
                            <PlayerDashboardPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/player/shop"
                    element={
                        <ProtectedRoute>
                            <ShopPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/player/inventory"
                    element={
                        <ProtectedRoute>
                            <InventoryPage />
                        </ProtectedRoute>
                    }
                />

                {/* Página 403 */}
                <Route path="/403" element={<Forbidden403Page />} />

                {/* Rotas inválidas */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
