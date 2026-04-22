import React from 'react';

function Categories({ value, onClickCategory, settings }) {
  const categories = [
    { id: 0, name: 'Хиты продаж' },
    { id: 2, name: 'Шаурма/Кебаб' },
    { id: 3, name: 'Бртуч/Бургер/Ролл' },
    { id: 5, name: 'Стрит' },
    { id: 4, name: 'Напитки' },
  ];

  if (settings && settings.isSeasonalMenuEnabled) {
    categories.push({ id: 6, name: 'Сезонное меню' });
  }

  return (
    <div className="categories">
      {categories.map((category) => (
        <div
          key={category.id}
          onClick={() => onClickCategory(category.id)}
          className={value === category.id ? 'category active' : 'category'}>
          {category.name}
        </div>
      ))}
    </div>
  );
}

export default Categories;
