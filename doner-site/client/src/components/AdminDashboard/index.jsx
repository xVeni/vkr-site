import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './AdminDashboard.module.scss';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ totalRevenue: 0, ordersCount: 0, statusStats: {}, categoryStats: {} });
    const [period, setPeriod] = useState('all');
    const [activeTab, setActiveTab] = useState('statuses');

    useEffect(() => {
        fetchStats();
    }, [period]);

    const fetchStats = async () => {
        try {
            const { data } = await axios.get(`/api/admin/stats?period=${period}`);
            setStats(data);
        } catch (err) {
            console.error('Ошибка при загрузке статистики', err);
        }
    };

    return (
        <div className={styles.root}>
            <div className={styles.header}>
                <h1>Статистика</h1>
                <select value={period} onChange={(e) => setPeriod(e.target.value)} className={styles.periodSelect}>
                    <option value="all">За всё время</option>
                    <option value="today">Сегодня</option>
                    <option value="week">За неделю</option>
                    <option value="month">За месяц</option>
                </select>
            </div>

            <div className={styles.grid}>
                <div className={styles.card}>
                    <div className={styles.cardTitle}>ВЫРУЧКА</div>
                    <div className={styles.cardValue}>{stats.totalRevenue.toLocaleString()} ₽</div>
                </div>
                <div className={styles.card}>
                    <div className={styles.cardTitle}>КОЛ-ВО ЗАКАЗОВ</div>
                    <div className={styles.cardValue}>{stats.ordersCount}</div>
                </div>
                <div className={styles.card}>
                    <div className={styles.cardTitle}>СРЕДНИЙ ЧЕК</div>
                    <div className={styles.cardValue}>
                        {(stats.ordersCount > 0 ? (stats.totalRevenue / stats.ordersCount).toFixed(0) : 0).toLocaleString()} ₽
                    </div>
                </div>
            </div>

            <div className={styles.tabs}>
                <button className={activeTab === 'statuses' ? styles.activeTab : ''} onClick={() => setActiveTab('statuses')}>По статусам</button>
                <button className={activeTab === 'categories' ? styles.activeTab : ''} onClick={() => setActiveTab('categories')}>По категориям</button>
            </div>

            <div className={styles.chartArea}>
                {activeTab === 'statuses' ? (
                    <div className={styles.detailCard}>
                        {Object.entries(stats.statusStats).map(([status, count]) => (
                            <div key={status} className={styles.statRow}>
                                <span>{status}</span>
                                <div className={styles.barContainer}>
                                    <div className={styles.bar} style={{ width: `${(count / stats.ordersCount) * 100}%` }}></div>
                                </div>
                                <b>{count}</b>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={styles.detailCard}>
                        {Object.entries(stats.categoryStats).map(([cat, count]) => (
                            <div key={cat} className={styles.statRow}>
                                <span>Категория {cat}</span>
                                <div className={styles.barContainer}>
                                    <div className={styles.bar} style={{ width: `${(count / stats.ordersCount) * 100 || 0}%`, background: '#3498db' }}></div>
                                </div>
                                <b>{count}</b>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
