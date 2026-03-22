import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../../app/store';
import { selectCurrentUser, selectIsAuthenticated } from '../store/authSlice';
import { hasPermission } from '../../../utils/permissions';

interface PermissionRouteProps {
    module: string;
    action?: string;
    children: React.ReactNode;
    redirectTo?: string;
}

const PermissionRoute: React.FC<PermissionRouteProps> = ({ 
    module, 
    action = 'view', 
    children, 
    redirectTo = '/' 
}) => {
    const user = useAppSelector(selectCurrentUser);
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!hasPermission(user, module, action)) {
        // If they don't have permission for this module, send them to dashboard
        // or whatever redirectTo is set to.
        return <Navigate to={redirectTo} replace />;
    }

    return <>{children}</>;
};

export default PermissionRoute;
