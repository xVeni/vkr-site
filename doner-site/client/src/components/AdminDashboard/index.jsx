import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import styles from './AdminDashboard.module.scss';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const AdminDashboard = () => {
    const [stats, setStats] = useState({ totalRevenue: 0, ordersCount: 0, statusStats: {}, categoryStats: {}, timeSeries: [] });
    const [period, setPeriod] = useState('all');
    const [chartType, setChartType] = useState('line');
    const [metric, setMetric] = useState('revenue');

    const [exportType, setExportType] = useState('orders');

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

    const handleExport = () => {
        window.open(`/api/admin/export/${exportType}?period=${period}`, '_blank');
    };

    const pieData = Object.entries(stats.statusStats).map(([name, value]) => ({ name, value }));

    return (
        <div className={styles.root}>
            <div className={styles.header}>
                <h1>Аналитика</h1>
                <div className={styles.controls}>
                    <select value={period} onChange={(e) => setPeriod(e.target.value)} className={styles.select}>
                        <option value="all">За всё время</option>
                        <option value="today">Сегодня</option>
                        <option value="week">За неделю</option>
                        <option value="month">За месяц</option>
                    </select>
                    <select value={chartType} onChange={(e) => setChartType(e.target.value)} className={styles.select}>
                        <option value="line">Линейный график</option>
                        <option value="bar">Столбчатый график</option>
                    </select>
                    <select value={metric} onChange={(e) => setMetric(e.target.value)} className={styles.select}>
                        <option value="revenue">Выручка (₽)</option>
                        <option value="orders">Кол-во заказов</option>
                    </select>
                    <span style={{ borderLeft: '2px solid #ddd', margin: '0 5px' }}></span>
                    <select value={exportType} onChange={(e) => setExportType(e.target.value)} className={styles.select}>
                        <option value="orders">Полные заказы</option>
                        <option value="users">Пользователи</option>
                        <option value="revenue">Общая выручка</option>
                        <option value="dishes">Популярность блюд</option>
                        <option value="status">Кол-во статусов</option>
                    </select>
                    <button onClick={handleExport} style={{ padding: '8px 15px', background: '#5e652b', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>Выгрузить CSV</button>
                </div>
            </div>

            <div className={styles.grid}>
                <div className={styles.card}>
                    <div className={styles.cardTitle}>ВЫРУЧКА</div>
                    <div className={styles.cardValue}>{stats.totalRevenue.toLocaleString()} ₽</div>
                </div>
                <div className={styles.card}>
                    <div className={styles.cardTitle}>ЗАКАЗЫ</div>
                    <div className={styles.cardValue}>{stats.ordersCount}</div>
                </div>
                <div className={styles.card}>
                    <div className={styles.cardTitle}>СРЕДНИЙ ЧЕК</div>
                    <div className={styles.cardValue}>
                        {(stats.ordersCount > 0 ? (stats.totalRevenue / stats.ordersCount).toFixed(0) : 0).toLocaleString()} ₽
                    </div>
                </div>
            </div>

            <div className={styles.mainChart}>
                <div className={styles.chartHeader}>
                    <h2>Динамика {metric === 'revenue' ? 'выручки' : 'заказов'}</h2>
                </div>
                <div className={styles.chartContent}>
                    <ResponsiveContainer width="100%" height={400}>
                        {chartType === 'line' ? (
                            <LineChart data={stats.timeSeries}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="label" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey={metric} stroke="#5e652b" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
                            </LineChart>
                        ) : (
                            <BarChart data={stats.timeSeries}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="label" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey={metric} fill="#5e652b" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        )}
                    </ResponsiveContainer>
                </div>
            </div>

            <div className={styles.secondaryCharts}>
                <div className={styles.pieContainer}>
                    <h3>Статусы заказов</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className={styles.categoriesContainer}>
                    <h3>Популярность категорий</h3>
                    {Object.entries(stats.categoryStats).map(([cat, count]) => (
                        <div key={cat} className={styles.categoryRow}>
                            <span>{cat}</span>
                            <div className={styles.barWrap}>
                                <div className={styles.barInner} style={{ width: `${(count / stats.ordersCount) * 100 || 0}%` }}></div>
                            </div>
                            <b>{count}</b>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
