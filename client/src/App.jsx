import React from 'react';
import AppRouter from './router/AppRouter.jsx';
import Navbar from './components/Navbar.jsx';
import { useSelector } from 'react-redux';

export default function App() {
  const { initialized } = useSelector((state) => state.auth);

  if (!initialized) return <div className='pt-15 text-center text-purple-700 text-lg font-semibold'>Loading...</div>;

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className="pt-15">
        <AppRouter />
      </div>
    </div>
  )
}
