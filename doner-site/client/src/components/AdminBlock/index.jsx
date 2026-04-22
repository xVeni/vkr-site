import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AdminSidebar from '../AdminSidebar';
import AdminDashboard from '../AdminDashboard';
import AdminSettings from '../AdminSettings';
import AdminDishes from '../AdminDishes';
import AdminOrders from '../AdminOrders';
import styles from './AdminBlock.module.scss';

const AdminBlock = () => {
    const userData = useSelector((state) => state.auth.data);
    const authStatus = useSelector((state) => state.auth.status);

    // Если данные загружаются, ничего не делаем (или показываем спиннер)
    if (authStatus === 'loading') {
        return null;
    }

    // Защита на фронтенде: только админ
    if (!userData || userData.role !== 'admin') {
        return <Navigate to="/" />;
    }

    return (
        <div className={styles.adminLayout}>
            <AdminSidebar />
            <div className={styles.content}>
                <Routes>
                    <Route path="/" element={<AdminDashboard />} />
                    <Route path="/settings" element={<AdminSettings />} />
                    <Route path="/dishes" element={<AdminDishes />} />
                    <Route path="/orders" element={<AdminOrders />} />
                </Routes>
            </div>
        </div>
    );
};

export default AdminBlock;
