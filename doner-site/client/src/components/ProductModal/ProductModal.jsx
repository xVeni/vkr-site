import React from 'react';
import { IoClose } from 'react-icons/io5';
import { useDispatch, useSelector } from 'react-redux';
import { addItem } from '../../redux/slices/cartSlice';
import styles from './ProductModal.module.scss';

const ProductModal = ({ item, onClose }) => {
  const dispatch = useDispatch();
  const cartItem = useSelector((state) => state.cart.items.find((obj) => obj.id === item.id));

  const addedCount = cartItem ? cartItem.count : 0;

  const isDiscountActive = item.discountPrice && (!item.discountUntil || new Date(item.discountUntil) > new Date());
  const finalPrice = isDiscountActive ? item.discountPrice : item.price;

  const onClickAdd = () => {
    if (!item.inStock) return;
    dispatch(addItem({ id: item.id, title: item.title, price: finalPrice, image: item.image }));
  };

  if (!item) return null;

  return (
    <div className={styles.root} onClick={onClose}>
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>
          <IoClose size={24} />
        </button>

        <img src={item.image} alt={item.title} className={`${styles.image} ${!item.inStock ? styles.outOfStockImg : ''}`} />
        <h2>{item.title}</h2>
        
        {(item.calories > 0 || item.proteins > 0 || item.fats > 0 || item.carbohydrates > 0) && (
          <div className={styles.kbju}>
            <div className={styles.kbjuItem}>
              <span>{item.calories}</span>
              <label>ккал</label>
            </div>
            <div className={styles.kbjuItem}>
              <span>{item.proteins}г</span>
              <label>белки</label>
            </div>
            <div className={styles.kbjuItem}>
              <span>{item.fats}г</span>
              <label>жиры</label>
            </div>
            <div className={styles.kbjuItem}>
              <span>{item.carbohydrates}г</span>
              <label>углеводы</label>
            </div>
          </div>
        )}

        <p className={styles.desc}>{item.desc}</p>
        <div className={styles.footer}>
          <div className={styles.priceBlock}>
            <span className={styles.price}>{finalPrice} ₽</span>
            {isDiscountActive && <span className={styles.oldPrice}>{item.price} ₽</span>}
          </div>
          <button onClick={onClickAdd} className={styles.addBtn} disabled={!item.inStock}>
            {!item.inStock ? 'Нет в наличии' : `В корзину ${addedCount > 0 ? `(${addedCount})` : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductModal;
