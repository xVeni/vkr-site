import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import styles from './AdminSidebar.module.scss';

const AdminSidebar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <div className={styles.sidebar}>
            <div className={styles.logo}>ADMIN PANEL</div>
            <nav className={styles.nav}>
                <NavLink to="/admin" end className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
                    📊 Статистика
                </NavLink>
                <NavLink to="/admin/orders" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
                    📦 Заказы
                </NavLink>
                <NavLink to="/admin/dishes" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
                    🍔 Меню
                </NavLink>
                <NavLink to="/admin/settings" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
                    ⚙️ Настройки
                </NavLink>
                <NavLink to="/" className={styles.navItem}>
                    🏠 На сайт
                </NavLink>
            </nav>
            <button onClick={handleLogout} className={styles.logout}>Выход</button>
        </div>
    );
};

export default AdminSidebar;
