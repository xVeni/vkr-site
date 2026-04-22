import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './AdminSettings.module.scss';

const AdminSettings = () => {
    const [settings, setSettings] = useState(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await axios.get('/api/settings');
                setSettings(data);
            } catch (err) {
                console.error('Ошибка загрузки настроек', err);
            }
        };
        fetchSettings();
    }, []);

    const handleToggle = async (field) => {
        try {
            const newValue = !settings[field];
            const { data } = await axios.patch('/api/settings', { [field]: newValue });
            setSettings(data);
        } catch (err) {
            alert('Ошибка при обновлении настроек');
        }
    };

    if (!settings) return <div>Загрузка...</div>;

    return (
        <div className={styles.root}>
            <h1>Глобальные настройки</h1>
            <div className={styles.card}>
                <div className={styles.settingItem}>
                    <div>
                        <h3>Режим технических работ</h3>
                        <p>После включения сайт будет заблокирован плашкой "Техработы" для всех, кроме админов.</p>
                    </div>
                    <button
                        className={settings.isMaintenanceMode ? styles.toggleOn : styles.toggleOff}
                        onClick={() => handleToggle('isMaintenanceMode')}
                    >
                        {settings.isMaintenanceMode ? 'ВКЛ' : 'ВЫКЛ'}
                    </button>
                </div>

                <div className={styles.settingItem}>
                    <div>
                        <h3>Сезонное меню</h3>
                        <p>Показывать категорию "Сезонное предложение" в основном меню?</p>
                    </div>
                    <button
                        className={settings.isSeasonalMenuEnabled ? styles.toggleOn : styles.toggleOff}
                        onClick={() => handleToggle('isSeasonalMenuEnabled')}
                    >
                        {settings.isSeasonalMenuEnabled ? 'ВКЛ' : 'ВЫКЛ'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
