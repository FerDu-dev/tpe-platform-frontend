import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../../app/store';
import { selectIsAuthenticated, selectCurrentUser } from '../store/authSlice';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedEntity?: 'staff' | 'candidate';
    redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedEntity, redirectTo = '/login' }) => {
    const user = useAppSelector(selectCurrentUser);
    const isAuthenticated = useAppSelector(selectIsAuthenticated);

    if (!isAuthenticated) {
        return <Navigate to={redirectTo} replace />;
    }

    if (allowedEntity && user?.entityType !== allowedEntity) {
        const fallback = user?.entityType === 'candidate' ? '/candidate/dashboard' : '/dashboard';
        return <Navigate to={fallback} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
