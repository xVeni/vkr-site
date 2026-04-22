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
import TestPayment from './pages/TestPayment';
import { Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { fetchAuthMe } from './redux/slices/authSlice';
import Admin from './pages/Admin';

export const SearchContext = React.createContext();

function App() {
  const [searchValue, setSearchValue] = React.useState('');
  const [isMaintenance, setIsMaintenance] = React.useState(false);
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.auth.data);

  React.useEffect(() => {
    if (window.localStorage.getItem('token')) {
      dispatch(fetchAuthMe());
    }
  }, [dispatch]);

  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await axios.get('/api/settings');
        setIsMaintenance(data.isMaintenanceMode);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSettings();
  }, []);

  if (isMaintenance && (!userData || userData.role !== 'admin')) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', textAlign: 'center', padding: '20px' }}>
        <h1 style={{ fontFamily: 'Arial Black', fontSize: '48px', color: '#5e652b' }}>🚧 ВЕДУТСЯ ТЕХРАБОТЫ 🚧</h1>
        <p style={{ fontSize: '18px', color: '#666' }}>Мы скоро вернемся! Приносим извинения за неудобства.</p>
      </div>
    );
  }

  return (
    <div className="page">
      <SearchContext.Provider value={{ searchValue, setSearchValue }}>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin/*" element={<Admin />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/about" element={<About />} />
          <Route path="/offer" element={<Offer />} />
          <Route path="/zone" element={<Zone />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/success/:id" element={<Success />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/test-payment/:id" element={<TestPayment />} />
          <Route path="/cabinet" element={<Cabinet />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </SearchContext.Provider>
    </div>
  );
}

export default App;
