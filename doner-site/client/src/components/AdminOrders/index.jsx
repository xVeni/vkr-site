import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './AdminOrders.module.scss';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [filter, setFilter] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 10;

    useEffect(() => {
        fetchOrders();
    }, [filter, page]);

    const fetchOrders = async () => {
        const queryParams = [`page=${page}`, `limit=${limit}`];
        if (filter) queryParams.push(`status=${filter}`);

        const { data } = await axios.get(`/api/orders?${queryParams.join('&')}`);
        setOrders(data.data || []);
        if (data.total) {
            setTotalPages(Math.ceil(data.total / limit) || 1);
        } else {
            setTotalPages(1);
        }
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
                <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }} className={styles.select}>
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

            {totalPages > 1 && (
                <div className={styles.pagination} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', margin: '20px 0', padding: '15px' }}>
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                        style={{ padding: '8px 15px', borderRadius: '8px', border: '1px solid #ccc', background: page === 1 ? '#eee' : '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer' }}
                    >
                        &larr; Назад
                    </button>
                    <span style={{ fontWeight: 'bold' }}>Страница {page} из {totalPages}</span>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                        style={{ padding: '8px 15px', borderRadius: '8px', border: '1px solid #ccc', background: page === totalPages ? '#eee' : '#fff', cursor: page === totalPages ? 'not-allowed' : 'pointer' }}
                    >
                        Вперед &rarr;
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminOrders;
