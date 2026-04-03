import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './features/auth/pages/LoginPage';
import DashboardPage from './features/candidates/pages/DashboardPage';
import RequisitionsPage from './features/requisitions/pages/RequisitionsPage';
import UsersPage from './features/users/pages/UsersPage';
import RolesPage from './features/roles/pages/RolesPage';
import HiresPage from './features/hires/pages/HiresPage';
import ZonesPage from './features/zones/pages/ZonesPage';
import ProtectedRoute from './features/auth/components/ProtectedRoute';
import PermissionRoute from './features/auth/components/PermissionRoute';
import MainLayout from './components/MainLayout';
import './index.css';

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                {/* Admin Routes */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute allowedEntity="staff" redirectTo="/login">
                            <PermissionRoute module="candidates">
                                <MainLayout>
                                    <DashboardPage />
                                </MainLayout>
                            </PermissionRoute>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/requisitions"
                    element={
                        <ProtectedRoute allowedEntity="staff" redirectTo="/login">
                            <PermissionRoute module="requisitions">
                                <MainLayout>
                                    <RequisitionsPage />
                                </MainLayout>
                            </PermissionRoute>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/users"
                    element={
                        <ProtectedRoute allowedEntity="staff" redirectTo="/login">
                            <PermissionRoute module="users">
                                <MainLayout>
                                    <UsersPage />
                                </MainLayout>
                            </PermissionRoute>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/roles"
                    element={
                        <ProtectedRoute allowedEntity="staff" redirectTo="/login">
                            <PermissionRoute module="roles">
                                <MainLayout>
                                    <RolesPage />
                                </MainLayout>
                            </PermissionRoute>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/hires"
                    element={
                        <ProtectedRoute allowedEntity="staff" redirectTo="/login">
                            <PermissionRoute module="hires">
                                <MainLayout>
                                    <HiresPage />
                                </MainLayout>
                            </PermissionRoute>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/zones"
                    element={
                        <ProtectedRoute allowedEntity="staff" redirectTo="/login">
                            <PermissionRoute module="zones">
                                <MainLayout>
                                    <ZonesPage />
                                </MainLayout>
                            </PermissionRoute>
                        </ProtectedRoute>
                    }
                />

                {/* Fallbacks */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </Router>
    );
};

export default App;
