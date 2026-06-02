import { User, Permissions } from '../types';


const normalizeAction = (action: string): string[] => {
    const lowerAction = action.toLowerCase();

    // Mapping of shared meanings
    const mappings: Record<string, string[]> = {
        'view': ['view', 'read'],
        'read': ['view', 'read'],
        'edit': ['edit', 'update'],
        'update': ['edit', 'update'],
        'create': ['create', 'add'],
        'delete': ['delete', 'remove'],
    };

    return mappings[lowerAction] || [lowerAction];
};


export const hasPermission = (
    user: User | null | undefined,
    module: string,
    action: string = 'view'
): boolean => {
    if (!user || !user.role) {
        return false;
    }


    if (typeof user.role === 'string') {
        // If it's a string and not SUPER_ADMIN, we can't check granular permissions
        return false;
    }

    const permissions: Permissions = user.role.permissions;
    if (!permissions || !permissions[module]) {
        return false;
    }

    const userActions = permissions[module];
    const equivalentActions = normalizeAction(action);

    return userActions.some(ua => equivalentActions.includes(ua.toLowerCase()));
};

/**
 * Hook-like function for components that need quick access.
 */
export const usePermissions = (user: User | null | undefined) => {
    const roleName = typeof user?.role === 'string' ? user.role : user?.role?.name;
    const isSuperAdmin = roleName === 'SUPER_ADMIN';

    return {
        can: (module: string, action: string = 'view') => hasPermission(user, module, action),
        isSuperAdmin,
    };
};


export const PERMISSIONS = {
    // === MÓDULO DE VENTAS (Mantiene llaves clásicas por compatibilidad) ===
    candidates: {
        read: 'Ver',
        create: 'Crear',
        update: 'Editar',
        delete: 'Eliminar',
        advance: 'Avanzar',
        reject: 'Rechazar',
        hire: 'Contratar'
    },
    requisitions: {
        read: 'Ver',
        create: 'Crear',
        update: 'Editar',
        delete: 'Eliminar'
    },
    zones: {
        read: 'Ver',
        create: 'Crear',
        update: 'Editar',
        delete: 'Eliminar'
    },
    hires: {
        read: 'Ver'
    },

    // === MÓDULO ADMINISTRATIVO (Nuevas llaves) ===
    adminCandidates: {
        read: 'Ver',
        create: 'Crear',
        update: 'Editar',
        delete: 'Eliminar',
        advance: 'Avanzar',
        reject: 'Rechazar',
        hire: 'Contratar'
    },
    adminRequisitions: {
        read: 'Ver',
        create: 'Crear',
        update: 'Editar',
        delete: 'Eliminar'
    },
    adminHires: {
        read: 'Ver'
    },

    // === MÓDULO DE CONFIGURACIÓN ===
    users: {
        read: 'Ver',
        create: 'Crear',
        update: 'Editar',
        delete: 'Eliminar'
    },
    roles: {
        read: 'Ver',
        create: 'Crear',
        update: 'Editar',
        delete: 'Eliminar'
    },
    companies: {
        read: 'Ver',
        create: 'Crear',
        update: 'Editar',
        delete: 'Eliminar'
    }


} as const;
