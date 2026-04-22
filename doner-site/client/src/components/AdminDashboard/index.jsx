import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './AdminDashboard.module.scss';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [period, setPeriod] = useState('all');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await axios.get(`/api/admin/stats?period=${period}`);
                setStats(data);
            } catch (err) {
                console.error('Ошибка при загрузке статистики', err);
            }
        };
        fetchStats();
    }, [period]);

    if (!stats) return <div>Загрузка статистики...</div>;

    return (
        <div className={styles.root}>
            <div className={styles.header}>
                <h1>Статистика</h1>
                <select value={period} onChange={(e) => setPeriod(e.target.value)} className={styles.select}>
                    <option value="all">За всё время</option>
                    <option value="day">За сегодня</option>
                    <option value="week">За неделю</option>
                    <option value="month">За месяц</option>
                </select>
            </div>

            <div className={styles.grid}>
                <div className={styles.card}>
                    <div className={styles.cardTitle}>Выручка</div>
                    <div className={styles.cardValue}>{stats.totalRevenue.toLocaleString()} ₽</div>
                </div>
                <div className={styles.card}>
                    <div className={styles.cardTitle}>Кол-во заказов</div>
                    <div className={styles.cardValue}>{stats.ordersCount}</div>
                </div>
                <div className={styles.card}>
                    <div className={styles.cardTitle}>Средний чек</div>
                    <div className={styles.cardValue}>
                        {(stats.ordersCount > 0 ? (stats.totalRevenue / stats.ordersCount).toFixed(0) : 0).toLocaleString()} ₽
                    </div>
                </div>
            </div>

            <div className={styles.secondaryHeader}>
                <h2>Распределение заказов</h2>
            </div>

            <div className={styles.detailGrid}>
                <div className={styles.detailCard}>
                    <h3>По статусам</h3>
                    {Object.entries(stats.statusStats).map(([status, count]) => (
                        <div key={status} className={styles.statRow}>
                            <span>{status}</span>
                            <b>{count}</b>
                        </div>
                    ))}
                </div>
                <div className={styles.detailCard}>
                    <h3>По категориям</h3>
                    {Object.entries(stats.categoryStats).map(([cat, count]) => (
                        <div key={cat} className={styles.statRow}>
                            <span>Категория {cat}</span>
                            <b>{count}</b>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
