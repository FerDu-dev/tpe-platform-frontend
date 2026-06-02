import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import authReducer from '../features/auth/store/authSlice';
import candidatesReducer from '../features/sales-candidates/store/candidatesSlice';
import adminCandidatesReducer from '../features/administrative-candidates/store/adminCandidatesSlice';
import salesRequisitionsReducer from '../features/sales-requisitions/store/salesRequisitionsSlice';
import adminRequisitionsReducer from '../features/administrative-requisitions/store/adminRequisitionsSlice';
import usersReducer from '../features/users/store/usersSlice';
import rolesReducer from '../features/roles/store/rolesSlice';
import masterDataReducer from '../store/masterDataSlice';
import workflowReducer from '../store/workflowSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        candidates: candidatesReducer,
        adminCandidates: adminCandidatesReducer,
        salesRequisitions: salesRequisitionsReducer,
        adminRequisitions: adminRequisitionsReducer,
        users: usersReducer,
        roles: rolesReducer,
        masterData: masterDataReducer,
        workflow: workflowReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
