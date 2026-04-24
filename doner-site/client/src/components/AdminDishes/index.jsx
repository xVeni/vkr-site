import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './AdminDishes.module.scss';

const AdminDishes = () => {
    const [dishes, setDishes] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDish, setEditingDish] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        price: '',
        weight: '',
        category: '',
        desc: '',
        image: '',
        discountPrice: '',
        isSeasonal: false,
        best_sell: 0,
    });

    useEffect(() => {
        fetchDishes();
    }, []);

    const fetchDishes = async () => {
        const { data } = await axios.get('/api/dishes');
        setDishes(data);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Удалить этот товар?')) {
            await axios.delete(`/api/dishes/${id}`);
            fetchDishes();
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('image', file);
        try {
            const { data } = await axios.post('/api/admin/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData(prev => ({ ...prev, image: data.url }));
        } catch (err) {
            alert('Ошибка при загрузке картинки');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = { ...formData };
        if (payload.discountPrice === '') {
            payload.discountPrice = null;
        } else if (payload.discountPrice !== null) {
            payload.discountPrice = Number(payload.discountPrice);
        }

        if (payload.price) payload.price = Number(payload.price);
        if (payload.weight) payload.weight = Number(payload.weight);
        if (payload.category) payload.category = Number(payload.category);

        try {
            if (editingDish) {
                await axios.patch(`/api/dishes/${editingDish.id}`, payload);
            } else {
                await axios.post('/api/dishes', payload);
            }
            setIsModalOpen(false);
            fetchDishes();
        } catch (err) {
            alert('Ошибка при сохранении: убедитесь, что все числовые поля заполнены корректно');
            console.error(err);
        }
    };

    const openModal = (dish = null) => {
        if (dish) {
            setEditingDish(dish);
            const dataToEdit = { ...dish };
            if (dataToEdit.discountPrice === null) dataToEdit.discountPrice = '';
            setFormData(dataToEdit);
        } else {
            setEditingDish(null);
            setFormData({
                title: '',
                price: '',
                weight: '',
                category: '',
                desc: '',
                image: '',
                discountPrice: '',
                isSeasonal: false,
                best_sell: 0
            });
        }
        setIsModalOpen(true);
    };

    return (
        <div className={styles.root}>
            <div className={styles.header}>
                <h1>Управление меню</h1>
                <button className={styles.addBtn} onClick={() => openModal()}>+ Добавить блюдо</button>
            </div>

            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Фото</th>
                        <th>Название</th>
                        <th>Категория</th>
                        <th>Цена</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {dishes.map((dish) => (
                        <tr key={dish.id}>
                            <td><img src={dish.image} alt={dish.title} className={styles.img} /></td>
                            <td>{dish.title}</td>
                            <td>{dish.category}</td>
                            <td>{dish.price} ₽</td>
                            <td>
                                <button onClick={() => openModal(dish)}>📝</button>
                                <button onClick={() => handleDelete(dish.id)}>🗑️</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {isModalOpen && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <h2>{editingDish ? 'Редактировать' : 'Добавить'} блюдо</h2>
                        <form onSubmit={handleSubmit}>
                            <input type="text" placeholder="Название" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                            <input type="number" placeholder="Цена" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required />
                            <input type="number" placeholder="Вес" value={formData.weight} onChange={e => setFormData({ ...formData, weight: e.target.value })} required />
                            <select
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                required
                                style={{ padding: '15px', borderRadius: '15px', border: '1px solid #ddd', fontFamily: 'inherit', marginBottom: '15px', width: '100%' }}
                            >
                                <option value="" disabled>Выберите категорию</option>
                                <option value="2">Шаурма / Кебаб</option>
                                <option value="3">Бртуч / Бургер / Ролл</option>
                                <option value="5">Стрит (закуски)</option>
                                <option value="4">Напитки</option>
                            </select>
                            <textarea placeholder="Описание" value={formData.desc} onChange={e => setFormData({ ...formData, desc: e.target.value })} />

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input type="number" placeholder="Цена со скидкой" value={formData.discountPrice} onChange={e => setFormData({ ...formData, discountPrice: e.target.value })} />
                            </div>

                            <div style={{ display: 'flex', gap: '20px', margin: '15px 0' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <input type="checkbox" checked={formData.isSeasonal} onChange={e => setFormData({ ...formData, isSeasonal: e.target.checked })} />
                                    Сезонное
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <input type="checkbox" checked={formData.best_sell === 1} onChange={e => setFormData({ ...formData, best_sell: e.target.checked ? 1 : 0 })} />
                                    Хит продаж
                                </label>
                            </div>

                            <label>Фото блюда</label>
                            <input type="file" onChange={handleImageUpload} />
                            {formData.image && <img src={formData.image} alt="preview" style={{ width: '100px', marginTop: '10px' }} />}

                            <div className={styles.modalButtons}>
                                <button type="submit">Сохранить</button>
                                <button type="button" onClick={() => setIsModalOpen(false)}>Отмена</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDishes;
