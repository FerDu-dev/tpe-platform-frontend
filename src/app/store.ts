import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import authReducer from '../features/auth/store/authSlice';
import candidatesReducer from '../features/candidates/store/candidatesSlice';
import requisitionsReducer from '../features/requisitions/store/requisitionsSlice';
import usersReducer from '../features/users/store/usersSlice';
import masterDataReducer from '../store/masterDataSlice';
import workflowReducer from '../store/workflowSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        candidates: candidatesReducer,
        requisitions: requisitionsReducer,
        users: usersReducer,
        masterData: masterDataReducer,
        workflow: workflowReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
