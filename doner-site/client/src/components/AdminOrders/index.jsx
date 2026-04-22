import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './AdminOrders.module.scss';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        fetchOrders();
    }, [filter]);

    const fetchOrders = async () => {
        const { data } = await axios.get(`/api/orders${filter ? `?status=${filter}` : ''}`);
        setOrders(data);
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await axios.patch(`/api/orders/${orderId}/status`, { status: newStatus });
            fetchOrders();
        } catch (err) {
            alert('Ошибка при обновлении статуса');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'new': return '#3498db';
            case 'cooking': return '#f1c40f';
            case 'delivering': return '#e67e22';
            case 'completed': return '#2ecc71';
            case 'cancelled': return '#e74c3c';
            default: return '#95a5a6';
        }
    };

    return (
        <div className={styles.root}>
            <div className={styles.header}>
                <h1>Управление заказами</h1>
                <select value={filter} onChange={(e) => setFilter(e.target.value)} className={styles.select}>
                    <option value="">Все статусы</option>
                    <option value="new">Новые</option>
                    <option value="cooking">Готовятся</option>
                    <option value="delivering">В пути</option>
                    <option value="completed">Завершены</option>
                    <option value="cancelled">Отменены</option>
                </select>
            </div>

            <div className={styles.list}>
                {orders.map((order) => (
                    <div key={order.id} className={styles.orderCard} style={{ borderLeft: `6px solid ${getStatusColor(order.status)}` }}>
                        <div className={styles.orderHeader}>
                            <h3>Заказ №{order.id}</h3>
                            <select
                                value={order.status}
                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                className={styles.statusSelect}
                            >
                                <option value="new">Новый</option>
                                <option value="cooking">Готовится</option>
                                <option value="delivering">Доставляется</option>
                                <option value="completed">Выполнен</option>
                                <option value="cancelled">Отменен</option>
                            </select>
                        </div>
                        <div className={styles.orderInfo}>
                            <p><strong>Клиент:</strong> {order.customer_name} ({order.phone})</p>
                            <p><strong>Адрес:</strong> {order.address}</p>
                            <p><strong>Сумма:</strong> {order.total} ₽</p>
                            <p><strong>Метод оплаты:</strong> {order.paymentMethod === 'online' ? 'Картой онлайн' : (order.paymentMethod === 'cash' ? 'Наличными' : 'Картой курьеру')}</p>
                        </div>
                        <div className={styles.items}>
                            {order.items.map((item, idx) => (
                                <div key={idx} className={styles.item}>
                                    {item.title} x {item.quantity} — {item.price * item.quantity} ₽
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminOrders;
