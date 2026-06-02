import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './features/auth/pages/LoginPage';
import DashboardPage from './features/sales-candidates/pages/DashboardPage';
import AdminDashboardPage from './features/administrative-candidates/pages/DashboardPage';
import SalesRequisitionsPage from './features/sales-requisitions/pages/RequisitionsPage';
import AdminRequisitionsPage from './features/administrative-requisitions/pages/RequisitionsPage';
import UsersPage from './features/users/pages/UsersPage';
import RolesPage from './features/roles/pages/RolesPage';
import CompaniesPage from './features/companies/pages/CompaniesPage';
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
                <Route path="/" element={<Navigate to="/sales-candidates" replace />} />

                {/* Admin Routes */}
                <Route
                    path="/sales-candidates"
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
                    path="/sales-requisitions"
                    element={
                        <ProtectedRoute allowedEntity="staff" redirectTo="/login">
                            <PermissionRoute module="requisitions">
                                <MainLayout>
                                    <SalesRequisitionsPage />
                                </MainLayout>
                            </PermissionRoute>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/administrative-requisitions"
                    element={
                        <ProtectedRoute allowedEntity="staff" redirectTo="/login">
                            <PermissionRoute module="requisitions">
                                <MainLayout>
                                    <AdminRequisitionsPage />
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
                    path="/companies"
                    element={
                        <ProtectedRoute allowedEntity="staff" redirectTo="/login">
                            <PermissionRoute module="companies">
                                <MainLayout>
                                    <CompaniesPage />
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
                <Route
                    path="/administrative-candidates"
                    element={
                        <ProtectedRoute allowedEntity="staff" redirectTo="/login">
                            <PermissionRoute module="candidates">
                                <MainLayout>
                                    <AdminDashboardPage />
                                </MainLayout>
                            </PermissionRoute>
                        </ProtectedRoute>
                    }
                />

                {/* Fallbacks */}
                <Route path="*" element={<Navigate to="/sales-candidates" replace />} />
            </Routes>
        </Router>
    );
};

export default App;
