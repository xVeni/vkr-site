import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { register as registerUser, selectIsAuth } from '../../redux/slices/authSlice';
import styles from './AuthRegister.module.scss';

const AuthRegister = () => {
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
            name: '',
            phone: '',
        },
        mode: 'onChange',
    });

    const onSubmit = async (values) => {
        const data = await dispatch(registerUser(values));

        if (!data.payload) {
            return alert('Не удалось зарегистрироваться');
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
                <h1 className={styles.authTitle}>Регистрация</h1>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className={styles.authField}>
                        <label>Имя</label>
                        <input
                            className={errors.name ? styles.error : ''}
                            {...register('name', { required: 'Укажите имя' })}
                        />
                        {errors.name && <span className={styles.errorMessage}>{errors.name.message}</span>}
                    </div>
                    <div className={styles.authField}>
                        <label>Email</label>
                        <input
                            type="email"
                            className={errors.email ? styles.error : ''}
                            {...register('email', { required: 'Укажите почту' })}
                        />
                        {errors.email && <span className={styles.errorMessage}>{errors.email.message}</span>}
                    </div>
                    <div className={styles.authField}>
                        <label>Телефон</label>
                        <input
                            className={errors.phone ? styles.error : ''}
                            {...register('phone', { required: 'Укажите телефон' })}
                        />
                        {errors.phone && <span className={styles.errorMessage}>{errors.phone.message}</span>}
                    </div>
                    <div className={styles.authField}>
                        <label>Пароль</label>
                        <input
                            type="password"
                            className={errors.password ? styles.error : ''}
                            {...register('password', { required: 'Укажите пароль', minLength: { value: 6, message: 'Минимум 6 символов' } })}
                        />
                        {errors.password && <span className={styles.errorMessage}>{errors.password.message}</span>}
                    </div>
                    <button disabled={!isValid} type="submit" className={styles.authSubmit}>
                        Создать аккаунт
                    </button>
                </form>
                <p className={styles.authFooter}>
                    Уже есть аккаунт? <Link to="/login">Войти</Link>
                </p>
            </div>
        </div>
    );
};

export default AuthRegister;
