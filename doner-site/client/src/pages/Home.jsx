import React from 'react';
import axios from 'axios';
import Bestsellers from '../components/itemBlockall';
import Skeleton from '../components/itemBlockall/Skeleton';
import Sale from '../components/Hero/sale';
import Categories from '../components/categories';
import { SearchContext } from '../App';
import { useSelector, useDispatch } from 'react-redux';
import { setCategoryId } from '../redux/slices/filterSlice';
import { fetchDish } from '../redux/slices/dishesSlice';
import ProductModal from '../components/ProductModal/ProductModal';
import FloatingCartButton from '../components/FloatingCartButton/FloatingCartButton';

export const Home = () => {
  const dispatch = useDispatch();
  const { items, status } = useSelector((state) => state.dish);
  const categoryId = useSelector((state) => state.filter.categoryId);
  const { searchValue } = React.useContext(SearchContext);

  // ---------- ШАУРМА ----------
  const sortShaurma = (items) => {
    const getPriority = (item) => {
      const title = item.title.toLowerCase();

      if (title.includes('кебаб')) return 1;

      // большая шаурма
      if (title.includes('шаурма') && !title.includes('мини')) {
        if (title.includes('кур')) return 2;
        if (title.includes('свин')) return 3;
        return 4;
      }

      // маленькая шаурма
      if (title.includes('мини шаурма')) return 5;

      // добавки
      if (title.includes('добавь') || title.includes('соус')) return 10;

      return 99;
    };

    return [...items].sort((a, b) => getPriority(a) - getPriority(b));
  };

  // ---------- БРТУЧ / БУРГЕРЫ ----------
  const sortBruchBurger = (items) => {
    const getPriority = (item) => {
      const title = item.title.toLowerCase();

      if (title.includes('бртуч')) return 1;
      if (title.includes('бургер')) return 2;
      if (title.includes('твистер')) return 3;

      return 99;
    };

    return [...items].sort((a, b) => getPriority(a) - getPriority(b));
  };

  // ---------- НАПИТКИ ----------
  const drinkOrder = [250, 330, 450, 500, 900, 1000];

  const sortDrinks = (items) => {
    return [...items].sort((a, b) => {
      const aIndex = drinkOrder.indexOf(a.weight);
      const bIndex = drinkOrder.indexOf(b.weight);

      return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
    });
  };
  const sortBestSellers = (items) => {
    const getPriority = (item) => {
      const title = item.title.toLowerCase();

      if (title.includes('кебаб')) return 1;

      if (title.includes('шаурма') && !title.includes('мини')) {
        if (title.includes('кур')) return 2;
        if (title.includes('свин')) return 3;
      }

      if (title.includes('мини шаурма')) {
        if (title.includes('кур')) return 4;
        if (title.includes('свин')) return 5;
      }

      if (title.includes('ветчин')) return 6;
      if (title.includes('овощ')) return 7;

      if (title.includes('бртуч')) return 8;
      if (title.includes('твистер')) return 9;

      return 99;
    };

    return [...items].sort((a, b) => getPriority(a) - getPriority(b));
  };

  // ---------- СТРИТ ----------
  const sortStreet = (items) => {
    const getPriority = (item) => {
      const title = item.title.toLowerCase();

      if (title.includes('картофель фри')) return 1;
      if (title.includes('по деревенски')) return 2;

      if (title.includes('сырные палочки')) return 3;

      return 99;
    };

    return [...items].sort((a, b) => {
      const pA = getPriority(a);
      const pB = getPriority(b);

      if (pA !== pB) return pA - pB;

      // сортировка сырных палочек по количеству
      if (a.title.includes('Сырные') && b.title.includes('Сырные')) {
        return a.weight - b.weight;
      }

      return 0;
    });
  };

  const [settings, setSettings] = React.useState(null);

  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await axios.get('/api/settings');
        setSettings(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSettings();
  }, []);

  // Определяем, какие товары показывать
  const displayedItems = React.useMemo(() => {
    let filtered = items;

    // Фильтруем сезонные блюда, если они отключены
    if (settings && !settings.isSeasonalMenuEnabled) {
      filtered = filtered.filter(item => !item.isSeasonal);
    }

    // Если есть поиск, мы НЕ фильтруем по категории на фронте, 
    // так как сервер уже выдал нам нужные результаты для категории 1 (Все) + поиск
    if (searchValue) {
      return sortBestSellers(filtered);
    }

    if (categoryId === 0) {
      filtered = filtered.filter((item) => item.best_sell === 1);
      return sortBestSellers(filtered);
    }

    if (categoryId === 1) {
      return sortBestSellers(filtered);
    }

    if (categoryId === 6) {
      return filtered.filter(item => item.isSeasonal);
    }

    filtered = filtered.filter((item) => item.category === categoryId);

    switch (categoryId) {
      case 2:
        return sortShaurma(filtered);

      case 4:
        return sortDrinks(filtered);

      case 5:
        return sortStreet(filtered);

      default:
        return filtered;
    }
  }, [items, categoryId, searchValue, settings]);

  const onClickCategory = (id) => {
    dispatch(setCategoryId(id));
  };

  React.useEffect(() => {
    // Если есть поиск, автоматически выбираем "Все товары"
    if (searchValue && categoryId !== 1) {
      dispatch(setCategoryId(1));
    }
  }, [searchValue, categoryId, dispatch]);

  React.useEffect(() => {
    const effectiveCategory = searchValue ? 1 : categoryId;
    dispatch(fetchDish({ categoryId: effectiveCategory, search: searchValue }));
  }, [categoryId, searchValue, dispatch]);

  const [selectedItem, setSelectedItem] = React.useState(null);

  const closeModal = () => setSelectedItem(null);

  return (
    <>
      <Sale />
      <Categories value={categoryId} onClickCategory={onClickCategory} settings={settings} />

      <div className="bestsellers">
        <div className="product-grid" key={`${categoryId}-${status}`} style={{ animation: 'smoothFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          {status === 'loading' ? (
            [...new Array(8)].map((_, index) => <Skeleton key={index} />)
          ) : status === 'error' ? (
            <p className="error">Произошла ошибка, попробуйте позже</p>
          ) : displayedItems.length > 0 ? (
            displayedItems.map((obj) => (
              <Bestsellers key={obj.id} {...obj} onClick={() => setSelectedItem(obj)} />
            ))
          ) : (
            <p>Ничего не найдено</p>
          )}
        </div>
        <p>Фото на сайте могут отличаться от действительности</p>
      </div>

      {selectedItem && <ProductModal item={selectedItem} onClose={closeModal} />}

      <FloatingCartButton />
    </>
  );
};

export default Home;
