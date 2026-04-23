import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { FiUser, FiMail, FiPhone, FiShoppingBag, FiLogOut, FiPackage, FiEdit, FiStar, FiCheck, FiX } from 'react-icons/fi';
import { logout, selectIsAuth, updateProfile } from '../../redux/slices/authSlice';
import styles from './CabinetBlock.module.scss';

const CabinetBlock = () => {
    const dispatch = useDispatch();
    const isAuth = useSelector(selectIsAuth);
    const { data: userData, status } = useSelector((state) => state.auth);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Состояния для редактирования профиля
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ name: '', phone: '' });

    // Состояния для отзывов
    const [reviewText, setReviewText] = useState('');
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [isSendingReview, setIsSendingReview] = useState(false);

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

    useEffect(() => {
        if (userData) {
            setEditData({
                name: userData.name || '',
                phone: userData.phone || '',
            });
        }
    }, [userData]);

    const onClickLogout = () => {
        if (window.confirm('Вы действительно хотите выйти?')) {
            dispatch(logout());
            window.localStorage.removeItem('token');
        }
    };

    const handleUpdateProfile = async () => {
        try {
            await dispatch(updateProfile(editData));
            setIsEditing(false);
            alert('Профиль успешно обновлен');
        } catch (error) {
            alert('Ошибка при обновлении профиля');
        }
    };

    const handleSendReview = async () => {
        if (!reviewText.trim()) return alert('Пожалуйста, введите текст отзыва');

        setIsSendingReview(true);
        try {
            await axios.post('/api/send-review', {
                name: userData.name || 'Аноним',
                email: userData.email,
                text: reviewText,
            });
            alert('Спасибо за ваш отзыв! Он отправлен администратору.');
            setReviewText('');
            setShowReviewForm(false);
        } catch (error) {
            alert('Не удалось отправить отзыв. Попробуйте позже.');
        } finally {
            setIsSendingReview(false);
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
                    <div className={styles.headerButtons}>
                        <button onClick={() => setShowReviewForm(!showReviewForm)} className={`${styles.reviewBtn} ${showReviewForm ? styles.active : ''}`}>
                            <FiStar /> Оставить отзыв
                        </button>
                        <button onClick={onClickLogout} className={styles.logoutBtn}>
                            <FiLogOut /> Выйти
                        </button>
                    </div>
                </div>

                {showReviewForm && (
                    <div className={`${styles.reviewForm} ${styles.card}`}>
                        <h3>Оставьте ваш отзыв о нашей работе</h3>
                        <textarea
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            placeholder="Ваш отзыв поможет нам стать лучше..."
                            rows="4"
                        />
                        <div className={styles.reviewActions}>
                            <button
                                onClick={handleSendReview}
                                disabled={isSendingReview}
                                className={styles.sendBtn}>
                                {isSendingReview ? 'Отправка...' : 'Отправить'}
                            </button>
                            <button onClick={() => setShowReviewForm(false)} className={styles.cancelBtn}>Отмена</button>
                        </div>
                    </div>
                )}

                <div className={styles.cabinetContent}>
                    <div className={`${styles.profileInfo} ${styles.card}`}>
                        <div className={styles.profileHeader}>
                            <h2><FiUser /> Профиль</h2>
                            {!isEditing ? (
                                <button onClick={() => setIsEditing(true)} className={styles.editBtn}>
                                    <FiEdit /> Редактировать
                                </button>
                            ) : (
                                <div className={styles.editActions}>
                                    <button onClick={handleUpdateProfile} className={styles.saveBtn}><FiCheck /></button>
                                    <button onClick={() => setIsEditing(false)} className={styles.cancelEditBtn}><FiX /></button>
                                </div>
                            )}
                        </div>

                        <div className={styles.infoRow}>
                            <span className={styles.label}>Имя</span>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editData.name}
                                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                    className={styles.editInput}
                                />
                            ) : (
                                <span className={styles.value}>{userData.name || 'Не указано'}</span>
                            )}
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Email</span>
                            <span className={styles.value}>{userData.email}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Телефон</span>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editData.phone}
                                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                                    className={styles.editInput}
                                />
                            ) : (
                                <span className={styles.value}>{userData.phone || 'Не указано'}</span>
                            )}
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
