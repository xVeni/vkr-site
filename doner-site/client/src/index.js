import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom'; // Вернули BrowserRouter
import reportWebVitals from './reportWebVitals';
import { store } from './redux/store';
import { Provider } from 'react-redux';

import axios from 'axios';

axios.defaults.baseURL = ''; // Можно оставить пустым, если используется прокси
axios.interceptors.request.use((config) => {
  const token = window.localStorage.getItem('token');
  if (token && config.url && (config.url.startsWith('/api') || config.url.startsWith('http://localhost'))) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter basename="/">
    <Provider store={store}>
      <App />
    </Provider>
  </BrowserRouter>,
);

reportWebVitals();
