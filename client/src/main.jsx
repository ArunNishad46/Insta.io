import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import App from './App.jsx';
import store from './store/store.js';
import GlobalProvider from './context/GlobalContext.jsx';

import 'react-toastify/dist/ReactToastify.css';
import './index.css';
import "../src/style/swiper.css"

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <BrowserRouter>
      <GlobalProvider>
        <ToastContainer 
          position='top-center' 
          autoClose={2000} 
          newestOnTop
          closeOnClick  
          draggable 
          pauseOnHover 
          closeButton={false}
          theme='light' 
          hideProgressBar={false}
        />
        <App />
      </GlobalProvider>
    </BrowserRouter>
  </Provider>
)
