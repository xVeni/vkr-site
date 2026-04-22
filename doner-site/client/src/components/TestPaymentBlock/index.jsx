import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiCheckCircle, FiClock, FiCreditCard } from 'react-icons/fi';
import styles from './TestPaymentBlock.module.scss';

const TestPaymentBlock = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const onSimulatePayment = async () => {
        setLoading(true);
        try {
            await axios.post(`/api/payments/simulate/${id}`);
            setTimeout(() => {
                navigate(`/success/${id}`);
            }, 1500);
        } catch (err) {
            console.error('Ошибка при симуляции оплаты:', err);
            alert('Не удалось имитировать оплату');
            setLoading(false);
        }
    };

    return (
        <div className={styles.testPaymentPage}>
            <div className={styles.paymentCard}>
                <div className={styles.iconWrapper}>
                    <FiCreditCard className={styles.cardIcon} />
                </div>
                <h1>Тестовая оплата</h1>
                <p className={styles.orderInfo}>Заказ №{id}</p>
                <div className={styles.divider}></div>
                <div className={styles.infoText}>
                    <FiClock /> Эта страница является заглушкой для тестирования оплаты.
                </div>
                <p className={styles.description}>
                    Нажмите кнопку ниже, чтобы имитировать успешный ответ от платежной системы.
                </p>
                <button
                    onClick={onSimulatePayment}
                    className={loading ? styles.btnLoading : styles.payBtn}
                    disabled={loading}
                >
                    {loading ? (
                        <>Обработка платежа...</>
                    ) : (
                        <>Имитировать оплату <FiCheckCircle /></>
                    )}
                </button>
            </div>
        </div>
    );
};

export default TestPaymentBlock;
