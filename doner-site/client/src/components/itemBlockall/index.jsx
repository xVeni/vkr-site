import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addItem, minusItem, removeItem } from '../../redux/slices/cartSlice';

function Bestsellers({ id, title, weight, desc, price, image, onClick, discountPrice, discountUntil, inStock, calories, proteins, fats, carbohydrates }) {
  const cartItem = useSelector((state) => state.cart.items.find((obj) => obj.id === id));
  const dispatch = useDispatch();

  const isDiscountActive = discountPrice && (!discountUntil || new Date(discountUntil) > new Date());
  const finalPrice = isDiscountActive ? discountPrice : price;

  const addedCount = cartItem ? cartItem.count : 0;

  const onClickAdd = (e) => {
    e.stopPropagation();
    if (!inStock) return;
    dispatch(addItem({ id, title, price: finalPrice, image }));
  };

  const onClickMinus = (e) => {
    e.stopPropagation();
    if (cartItem.count === 1) {
      dispatch(removeItem(id));
    } else {
      dispatch(minusItem(id));
    }
  };

  return (
    <div className={`product-card ${!inStock ? 'out-of-stock' : ''}`} onClick={inStock ? onClick : undefined} style={{ cursor: inStock ? 'pointer' : 'default' }}>
      {isDiscountActive && inStock && <div className="discount-badge">-{Math.round((1 - discountPrice / price) * 100)}%</div>}
      {!inStock && <div className="out-of-stock-badge">Закончился</div>}
      <img className="product-img" src={image} alt={title} style={{ filter: !inStock ? 'grayscale(1)' : 'none', opacity: !inStock ? 0.6 : 1 }} />
      <div className="product-content">
        <div className="title-weight">
          <p className="title">{title}</p>
          <p className="weight">{weight} г</p>
        </div>
        
        {(calories > 0 || proteins > 0 || fats > 0 || carbohydrates > 0) && (
          <div className="kbju-mini">
            {calories > 0 && <span>{Math.round(calories)} ккал</span>}
            {proteins > 0 && <span> Б:{proteins}</span>}
            {fats > 0 && <span> Ж:{fats}</span>}
            {carbohydrates > 0 && <span> У:{carbohydrates}</span>}
          </div>
        )}

        <p className="desc">{desc}</p>
        <div className="price-row">
          <div className="price-container">
            <p className="price">{finalPrice} ₽</p>
            {isDiscountActive && inStock && <p className="old-price">{price} ₽</p>}
          </div>
          {!inStock ? (
            <button className="btn btn--disabled" disabled>Закончился</button>
          ) : addedCount > 0 ? (
            <div className="cart-controls">
              <button onClick={onClickMinus} className="cart-btn minus">
                −
              </button>
              <span className="cart-count">{addedCount}</span>
              <button onClick={onClickAdd} className="cart-btn plus">
                +
              </button>
            </div>
          ) : (
            <button onClick={onClickAdd} className="btn">
              В корзину
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Bestsellers;
