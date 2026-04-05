import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './features/auth/pages/LoginPage';
// import CandidateLoginPage from './features/auth/pages/CandidateLoginPage';
// import MagicLoginPage from './features/auth/pages/MagicLoginPage';
import RegistrationPage from './features/candidate-portal/pages/RegistrationPage';
// import CandidateDashboard from './features/candidate-portal/pages/CandidateDashboard';
import LandingRedirect from './components/LandingRedirect';
import DashboardPage from './features/candidates/pages/DashboardPage';
import RequisitionsPage from './features/requisitions/pages/RequisitionsPage';
import UsersPage from './features/users/pages/UsersPage';
import RolesPage from './features/roles/pages/RolesPage';
import HiresPage from './features/hires/pages/HiresPage';
import ZonesPage from './features/zones/pages/ZonesPage';
import ProtectedRoute from './features/auth/components/ProtectedRoute';
import PermissionRoute from './features/auth/components/PermissionRoute';
import MainLayout from './components/MainLayout';
// import CandidateLayout from './components/CandidateLayout';
import './index.css';

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                {/* Priority Routes */}
                {/* <Route path="/candidate/magic-login" element={<MagicLoginPage />} /> */}

                {/* Public Routes */}
                <Route path="/" element={<LandingRedirect />} />
                <Route path="/register" element={<RegistrationPage />} />
                {/* <Route path="/candidate/login" element={<CandidateLoginPage />} /> */}
                <Route path="/login" element={<LoginPage />} />

                {/* Candidate Portal */}
                {/* <Route
                    path="/candidate/dashboard"
                    element={
                        <ProtectedRoute allowedEntity="candidate" redirectTo="/candidate/login">
                            <CandidateLayout>
                                <CandidateDashboard />
                            </CandidateLayout>
                        </ProtectedRoute>
                    }
                /> */}

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
                <Route path="*" element={<LandingRedirect />} />
            </Routes>
        </Router>
    );
};

export default App;
