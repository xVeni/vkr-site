import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const register = createAsyncThunk('auth/register', async (params, { rejectWithValue }) => {
    try {
        const { data } = await axios.post('/api/auth/register', params);
        return data;
    } catch (err) {
        return rejectWithValue(err.response.data);
    }
});

export const login = createAsyncThunk('auth/login', async (params, { rejectWithValue }) => {
    try {
        const { data } = await axios.post('/api/auth/login', params);
        return data;
    } catch (err) {
        return rejectWithValue(err.response.data);
    }
});

export const fetchAuthMe = createAsyncThunk('auth/fetchAuthMe', async (_, { rejectWithValue }) => {
    try {
        const { data } = await axios.get('/api/auth/me');
        return data;
    } catch (err) {
        return rejectWithValue(err.response.data);
    }
});

const initialState = {
    data: null,
    status: 'loading',
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.data = null;
            localStorage.removeItem('token');
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(register.pending, (state) => {
                state.status = 'loading';
                state.data = null;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.status = 'loaded';
                state.data = action.payload.user;
                localStorage.setItem('token', action.payload.access_token);
            })
            .addCase(register.rejected, (state) => {
                state.status = 'error';
                state.data = null;
            })
            .addCase(login.pending, (state) => {
                state.status = 'loading';
                state.data = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.status = 'loaded';
                state.data = action.payload.user;
                localStorage.setItem('token', action.payload.access_token);
            })
            .addCase(login.rejected, (state) => {
                state.status = 'error';
                state.data = null;
            })
            .addCase(fetchAuthMe.pending, (state) => {
                state.status = 'loading';
                state.data = null;
            })
            .addCase(fetchAuthMe.fulfilled, (state, action) => {
                state.status = 'loaded';
                state.data = action.payload;
            })
            .addCase(fetchAuthMe.rejected, (state) => {
                state.status = 'error';
                state.data = null;
            });
    },
});

export const selectIsAuth = (state) => Boolean(state.auth.data);

export const authReducer = authSlice.reducer;

export default authReducer;

export const { logout } = authSlice.actions;
