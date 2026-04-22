import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { FiUser, FiMail, FiPhone, FiShoppingBag, FiLogOut, FiPackage } from 'react-icons/fi';
import { logout, selectIsAuth } from '../../redux/slices/authSlice';
import styles from './CabinetBlock.module.scss';

const CabinetBlock = () => {
    const dispatch = useDispatch();
    const isAuth = useSelector(selectIsAuth);
    const { data: userData, status } = useSelector((state) => state.auth);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isAuth) {
            axios
                .get('/api/orders/my')
                .then((res) => {
                    setOrders(res.data);
                    setLoading(false);
                })
                .catch((err) => {
                    console.error('Ошибка загрузки заказов:', err);
                    setLoading(false);
                });
        }
    }, [isAuth]);

    const onClickLogout = () => {
        if (window.confirm('Вы действительно хотите выйти?')) {
            dispatch(logout());
            window.localStorage.removeItem('token');
        }
    };

    if (!window.localStorage.getItem('token') || status === 'error') {
        return <Navigate to="/login" />;
    }

    if (status === 'loading' || !userData) {
        return <div className={styles.cabinetLoading}>Загрузка данных...</div>;
    }

    return (
        <div className={styles.cabinetPage}>
            <div className={styles.container}>
                <div className={styles.cabinetHeader}>
                    <h1>Личный кабинет</h1>
                    <button onClick={onClickLogout} className={styles.logoutBtn}>
                        <FiLogOut /> Выйти
                    </button>
                </div>

                <div className={styles.cabinetContent}>
                    <div className={`${styles.profileInfo} ${styles.card}`}>
                        <h2><FiUser /> Профиль</h2>
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Имя</span>
                            <span className={styles.value}>{userData.name || 'Не указано'}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Email</span>
                            <span className={styles.value}>{userData.email}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Телефон</span>
                            <span className={styles.value}>{userData.phone || 'Не указано'}</span>
                        </div>
                    </div>

                    <div className={`${styles.ordersHistory} ${styles.card}`}>
                        <h2><FiShoppingBag /> История заказов</h2>
                        {loading ? (
                            <p>Загрузка истории...</p>
                        ) : orders.length > 0 ? (
                            <div className={styles.ordersList}>
                                {orders.map((order) => (
                                    <div key={order.id} className={styles.orderItem}>
                                        <div className={styles.orderMain}>
                                            <span className={styles.orderId}>Заказ №{order.id}</span>
                                            <span className={styles.orderDate}>
                                                {new Date(order.created_at).toLocaleDateString('ru-RU', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                        <div className={styles.orderDetails}>
                                            <div className={styles.orderItems}>
                                                {order.items.map((item, idx) => (
                                                    <span key={idx} className={styles.tag}>
                                                        {item.title} x{item.quantity}
                                                    </span>
                                                ))}
                                            </div>
                                            <span className={styles.orderTotal}>{order.total} ₽</span>
                                        </div>
                                        <div className={styles.orderStatus}>
                                            <span>Статус заказа:</span>
                                            <span className={`${styles.status} ${styles[order.status] || ''}`}>
                                                {order.status === 'paid' ? 'Оплачен' :
                                                    order.status === 'pending' ? 'Ожидает оплаты' :
                                                        order.status === 'canceled' ? 'Отменен' : order.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className={styles.noOrders}>
                                <FiPackage className={styles.noOrdersIcon} />
                                <p>У вас пока нет заказов</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CabinetBlock;
