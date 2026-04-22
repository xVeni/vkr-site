import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { login, selectIsAuth } from '../../redux/slices/authSlice';
import styles from './AuthLogin.module.scss';

const AuthLogin = () => {
    const isAuth = useSelector(selectIsAuth);
    const dispatch = useDispatch();
    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm({
        defaultValues: {
            email: '',
            password: '',
        },
        mode: 'onChange',
    });

    const onSubmit = async (values) => {
        const data = await dispatch(login(values));

        if (!data.payload) {
            return alert('Не удалось авторизоваться');
        }

        if ('access_token' in data.payload) {
            window.localStorage.setItem('token', data.payload.access_token);
        }
    };

    if (isAuth) {
        return <Navigate to="/cabinet" />;
    }

    return (
        <div className={styles.authPage}>
            <div className={styles.authContainer}>
                <h1 className={styles.authTitle}>Вход в аккаунт</h1>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className={styles.authField}>
                        <label>Email</label>
                        <input
                            type="email"
                            placeholder="example@mail.ru"
                            className={errors.email ? styles.error : ''}
                            {...register('email', { required: 'Укажите почту' })}
                        />
                        {errors.email && <span className={styles.errorMessage}>{errors.email.message}</span>}
                    </div>
                    <div className={styles.authField}>
                        <label>Пароль</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className={errors.password ? styles.error : ''}
                            {...register('password', { required: 'Укажите пароль' })}
                        />
                        {errors.password && <span className={styles.errorMessage}>{errors.password.message}</span>}
                    </div>
                    <button disabled={!isValid} type="submit" className={styles.authSubmit}>
                        Войти
                    </button>
                </form>
                <p className={styles.authFooter}>
                    Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
                </p>
            </div>
        </div>
    );
};

export default AuthLogin;
