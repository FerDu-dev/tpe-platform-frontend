import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './features/auth/pages/LoginPage';
import CandidateLoginPage from './features/auth/pages/CandidateLoginPage';
import MagicLoginPage from './features/auth/pages/MagicLoginPage';
import RegistrationPage from './features/candidate-portal/pages/RegistrationPage';
import CandidateDashboard from './features/candidate-portal/pages/CandidateDashboard';
import DashboardPage from './features/candidates/pages/DashboardPage';
import RequisitionsPage from './features/requisitions/pages/RequisitionsPage';
import UsersPage from './features/users/pages/UsersPage';
import ProtectedRoute from './features/auth/components/ProtectedRoute';
import MainLayout from './components/MainLayout';
import CandidateLayout from './components/CandidateLayout';
import './index.css';

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<RegistrationPage />} />
                <Route path="/candidate/login" element={<CandidateLoginPage />} />
                <Route path="/candidate/magic-login" element={<MagicLoginPage />} />
                <Route path="/login" element={<LoginPage />} />

                {/* Candidate Portal */}
                <Route
                    path="/candidate/dashboard"
                    element={
                        <ProtectedRoute allowedEntity="candidate" redirectTo="/candidate/login">
                            <CandidateLayout>
                                <CandidateDashboard />
                            </CandidateLayout>
                        </ProtectedRoute>
                    }
                />

                {/* Admin Routes */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute allowedEntity="staff" redirectTo="/login">
                            <MainLayout>
                                <DashboardPage />
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/requisitions"
                    element={
                        <ProtectedRoute allowedEntity="staff" redirectTo="/login">
                            <MainLayout>
                                <RequisitionsPage />
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/users"
                    element={
                        <ProtectedRoute allowedEntity="staff" redirectTo="/login">
                            <MainLayout>
                                <UsersPage />
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />

                {/* Fallbacks */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
};

export default App;
