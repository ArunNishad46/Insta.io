import React from 'react';
import AppRouter from './router/AppRouter.jsx';
import Navbar from './components/Navbar.jsx';
import { useSelector } from 'react-redux';

export default function App() {
  const { initialized } = useSelector((state) => state.auth);

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-purple-600" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className="pt-15">
        <AppRouter />
      </div>
    </div>
  )
}
