import React from 'react';
import AppRouter from './router/AppRouter.jsx';
import Navbar from './components/Navbar.jsx';

export default function App() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className="pt-15">
        <AppRouter />
      </div>
    </div>
  )
}
