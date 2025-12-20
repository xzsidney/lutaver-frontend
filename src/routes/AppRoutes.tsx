import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { AdminPage } from '../pages/AdminPage';
import { TeacherPage } from '../pages/TeacherPage';
import { Forbidden403Page } from '../pages/Forbidden403Page';
import { RoleBasedRoute } from '../components/RoleBasedRoute';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { CharactersListPage } from '../pages/Characters/CharactersListPage';
import { CharacterCreatePage } from '../pages/Characters/CharacterCreatePage';
import { CharacterDetailPage } from '../pages/Characters/CharacterDetailPage';
import { PlayerAccountPage } from '../pages/Player/PlayerAccountPage';
import { PlayerDashboardPage } from '../pages/Player/PlayerDashboardPage';
import { ShopPage } from '../pages/Player/ShopPage';
import { InventoryPage } from '../pages/Player/InventoryPage';
import { StealthMissionsGame } from '../components/games/StealthMissionsGame';
import { BattlePage } from '../pages/Battle/BattlePage';
import { Battle2DPage } from '../pages/Battle/Battle2DPage';
import { AdminUsersPage } from '../pages/Admin/AdminUsersPage';
import { AdminCharactersPage } from '../pages/Admin/AdminCharactersPage';
import { AdminDisciplinesPage } from '../pages/Admin/AdminDisciplinesPage';
import { AdminItemsPage } from '../pages/Admin/AdminItemsPage';
import AdminNpcsPage from '../pages/Admin/npcs';
import AdminQuestionsPage from '../pages/Admin/questions';
import { QuizListPage } from '../pages/Player/quizzes/QuizListPage';
import { QuizRunnerPage } from '../pages/Player/quizzes/QuizRunnerPage';
import { QuizResultPage } from '../pages/Player/quizzes/QuizResultPage';
import { AdminQuizzesPage } from '../pages/Admin/quizzes';
import { AdminQuizCreateEditPage } from '../pages/Admin/quizzes/AdminQuizCreateEditPage';
import { TowerExplorationPage } from '../pages/Tower/TowerExplorationPage';
import { FundamentalMap1_1 } from '../pages/Tower/floors/FundamentalMap1_1';
import { Andar01 } from '../pages/Tower/floors/andar01/Andar01';
import { Andar02 } from '../pages/Tower/floors/andar02/Andar02';
import { RoomInterior } from '../pages/Tower/rooms/RoomInterior';
import { RoomContainer } from '../modules/tower/rooms/RoomContainer';
import { ActivityContainer } from '../modules/tower/activities/ActivityContainer';
import HiddenBattlePage from '../pages/HiddenBattle/HiddenBattlePage';

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
                    path="/admin/npcs"
                    element={
                        <RoleBasedRoute allowedRoles={['ADMIN']}>
                            <AdminNpcsPage />
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
                    path="/admin/quizzes"
                    element={
                        <RoleBasedRoute allowedRoles={['ADMIN']}>
                            <AdminQuizzesPage />
                        </RoleBasedRoute>
                    }
                />
                <Route
                    path="/admin/quizzes/new"
                    element={
                        <RoleBasedRoute allowedRoles={['ADMIN']}>
                            <AdminQuizCreateEditPage />
                        </RoleBasedRoute>
                    }
                />
                <Route
                    path="/admin/quizzes/:id/edit"
                    element={
                        <RoleBasedRoute allowedRoles={['ADMIN']}>
                            <AdminQuizCreateEditPage />
                        </RoleBasedRoute>
                    }
                />
                <Route
                    path="/admin/questions"
                    element={
                        <RoleBasedRoute allowedRoles={['ADMIN']}>
                            <AdminQuestionsPage />
                        </RoleBasedRoute>
                    }
                />

                <Route
                    path="/player"
                    element={
                        <RoleBasedRoute allowedRoles={['PLAYER']}>
                            <PlayerAccountPage />
                        </RoleBasedRoute>
                    }
                />

                <Route
                    path="/player/character"
                    element={
                        <ProtectedRoute>
                            <PlayerDashboardPage />
                        </ProtectedRoute>
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

                {/* Player Routes */}
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
                <Route
                    path="/player/quizzes"
                    element={
                        <ProtectedRoute>
                            <QuizListPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/player/quizzes/:id/play"
                    element={
                        <ProtectedRoute>
                            <QuizRunnerPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/player/quizzes/:id/result"
                    element={
                        <ProtectedRoute>
                            <QuizResultPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/player/math-challenge"
                    element={
                        <ProtectedRoute>
                            <StealthMissionsGame />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/player/room/:roomId"
                    element={
                        <ProtectedRoute>
                            <RoomContainer />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/player/activity/:activityId"
                    element={
                        <ProtectedRoute>
                            <ActivityContainer />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/tower/:floorId"
                    element={
                        <ProtectedRoute>
                            <TowerExplorationPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/test/fundamental-map"
                    element={
                        <ProtectedRoute>
                            <FundamentalMap1_1 />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/floor/andar01/:floorId"
                    element={
                        <ProtectedRoute>
                            <Andar01 />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/floor/andar02/:floorId"
                    element={
                        <ProtectedRoute>
                            <Andar02 />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/room/:roomId"
                    element={
                        <ProtectedRoute>
                            <RoomInterior />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/battle"
                    element={
                        <ProtectedRoute>
                            <BattlePage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/battle-2d"
                    element={
                        <ProtectedRoute>
                            <Battle2DPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/hidden-battle"
                    element={
                        <ProtectedRoute>
                            <HiddenBattlePage />
                        </ProtectedRoute>
                    }
                />

                {/* Página 403 */}
                <Route path="/403" element={<Forbidden403Page />} />

                {/* Rotas inválidas */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter >
    );
}
