import React from 'react';
import { useAppSelector } from '../app/store';
import { selectCurrentUser } from '../features/auth/store/authSlice';
import { hasPermission } from '../utils/permissions';

interface PermissionGuardProps {
    module: string;
    action?: string;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

/**
 * Component that conditionally renders children based on user permissions.
 */
const PermissionGuard: React.FC<PermissionGuardProps> = ({ 
    module, 
    action = 'view', 
    children, 
    fallback = null 
}) => {
    const user = useAppSelector(selectCurrentUser);
    
    if (hasPermission(user, module, action)) {
        return <>{children}</>;
    }
    
    return <>{fallback}</>;
};

export default PermissionGuard;
