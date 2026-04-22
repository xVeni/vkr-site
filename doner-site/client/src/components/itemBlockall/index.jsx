import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addItem, minusItem, removeItem } from '../../redux/slices/cartSlice';

function Bestsellers({ id, title, weight, desc, price, image, onClick, discountPrice, discountUntil }) {
  const cartItem = useSelector((state) => state.cart.items.find((obj) => obj.id === id));
  const dispatch = useDispatch();

  const isDiscountActive = discountPrice && (!discountUntil || new Date(discountUntil) > new Date());
  const finalPrice = isDiscountActive ? discountPrice : price;

  const addedCount = cartItem ? cartItem.count : 0;

  const onClickAdd = (e) => {
    e.stopPropagation();
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
    <div className="product-card" onClick={onClick}>
      {isDiscountActive && <div className="discount-badge">-{Math.round((1 - discountPrice / price) * 100)}%</div>}
      <img className="product-img" src={image} alt={title} />
      <div className="product-content">
        <div className="title-weight">
          <p className="title">{title}</p>
          <p className="weight">{weight}</p>
        </div>
        <p className="desc">{desc}</p>
        <div className="price-row">
          <div className="price-container">
            <p className="price">{finalPrice} ₽</p>
            {isDiscountActive && <p className="old-price">{price} ₽</p>}
          </div>
          {addedCount > 0 ? (
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
