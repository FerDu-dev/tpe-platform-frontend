import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../app/store';
import { selectCurrentUser } from '../features/auth/store/authSlice';
import { hasPermission } from '../utils/permissions';

const LandingRedirect: React.FC = () => {
    const user = useAppSelector(selectCurrentUser);
    const location = useLocation();

    console.log('LandingRedirect triggered at:', location.pathname, 'User state:', user);

    // If not logged in:
    if (!user) {
        console.log('No user found in LandingRedirect, sending to /login');
        // If we're already on the root /, go to /register
        if (location.pathname === '/' || location.pathname === '') {
            return <Navigate to="/login" replace />;
        }
        // Otherwise (fallback for *), just go to /register as well, 
        // but explicit paths like /login are handled by App.tsx routes.
        return <Navigate to="/login" replace />;
    }

    console.log('User found in LandingRedirect, entityType:', user.entityType);

    // If logged in as a candidate, go to candidate dashboard
    if (user.entityType === 'candidate') {
        console.log('User is candidate, sending to /candidate/dashboard');
        return <Navigate to="/candidate/dashboard" replace />;
    }

    // Staff routing logic
    const routes = [
        { path: '/dashboard', module: 'candidates' },
        { path: '/requisitions', module: 'requisitions' },
        { path: '/hires', module: 'hires' },
        { path: '/users', module: 'users' },
        { path: '/zones', module: 'zones' },
        { path: '/roles', module: 'roles' },
    ];

    const firstAllowed = routes.find(r => hasPermission(user, r.module));

    if (firstAllowed) {
        return <Navigate to={firstAllowed.path} replace />;
    }

    // Fallback if staff has no permissions
    return <Navigate to="/login" replace />;
};

export default LandingRedirect;
