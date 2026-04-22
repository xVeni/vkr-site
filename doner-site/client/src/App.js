import React from 'react';

import './scss/app.scss';
import Header from './components/header';
import Footer from './components/footer/footer';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import Cart from './pages/Cart';
import About from './pages/About';
import Offer from './pages/Offer';
import Zone from './pages/Zone';
import Payment from './pages/Payment';
import Success from './pages/Success';
import Login from './pages/Login';
import Register from './pages/Register';
import Cabinet from './pages/Cabinet';
import { Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { fetchAuthMe } from './redux/slices/authSlice';

export const SearchContext = React.createContext();

function App() {
  const [searchValue, setSearchValue] = React.useState('');
  const dispatch = useDispatch();

  React.useEffect(() => {
    if (window.localStorage.getItem('token')) {
      dispatch(fetchAuthMe());
    }
  }, [dispatch]);

  return (
    <div className="page">
      <SearchContext.Provider value={{ searchValue, setSearchValue }}>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/about" element={<About />} />
          <Route path="/offer" element={<Offer />} />
          <Route path="/zone" element={<Zone />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/success/:id" element={<Success />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cabinet" element={<Cabinet />} />
        </Routes>
        <Footer />
      </SearchContext.Provider>
    </div>
  );
}

export default App;
